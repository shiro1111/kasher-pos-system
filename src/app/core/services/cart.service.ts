import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, forkJoin, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { Cart, CashRecordRequest, Inventory, Packaging, Product, SBResponse, Staff } from '../interfaces/interface';
import { CashRecordService } from './cash-record.service';
import { InventoryService } from './inventory.service';
import { ApiService } from '../apis/api.service';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private _cart = new BehaviorSubject<Cart | null>(null);
  readonly cart$ = this._cart.asObservable();

  constructor(
    private alertService: AlertService,
    private apiService: ApiService,
    private inventoryService: InventoryService,
    private cashRecordService: CashRecordService
  ) { }


  private createEmptyCartData(): Cart {
    return {
      createdBy: '',
      packaging: [],
      paymentMethod: '',
      products: [],
      totalPrice: 0
    }
  }

  addProductToCart(item: Product) {
    item = {
      ...item,
      cartId: this.generateUniqueId()
    }

    let cart = this._cart.value ?? this.createEmptyCartData();
    let products = cart?.products;
    products?.push(item);
    cart = {
      ...cart,
      products: [...products],
    }
    this._cart.next(cart);
    this.calculateTotalPrice();
    console.log('cart: ', this._cart.value);

  }

  addPackagingToCart(item: Packaging) {
    item = {
      ...item,
      cartId: this.generateUniqueId()
    }

    let cart = this._cart.value ?? this.createEmptyCartData();
    let packaging = cart?.packaging;
    packaging?.push(item);
    cart = {
      ...cart,
      packaging: [...packaging]
    }
    console.log('final cart: ', cart);
    this._cart.next(cart);

  }

  addToCart(item: Product) {


    console.log('to add the cart items: ', item);

    // item = {
    //   ...item,
    //   cartId: this.generateUniqueId()
    // }

    // let cart: Product[] = this._cartItems.value;
    // cart.push(item);
    // this._cartItems.next(cart);
    // this.calculateTotalPrice();
  }


  removeProductFromCart(item: Product) {
    let cart = this._cart.value ?? this.createEmptyCartData();
    const newProduct = cart?.products.filter(c => c.cartId !== item.cartId);
    cart = {
      ...cart,
      products: [...newProduct]
    }
    this._cart.next(cart);
    this.calculateTotalPrice();
  }

  removePackagingFromCart(item: Packaging) {
    console.log('remove packging: ', item);

    let cart = this._cart.value ?? this.createEmptyCartData();
    const newPackaging = cart?.packaging.filter(c => c.cartId !== item.cartId);
    cart = {
      ...cart,
      packaging: [...newPackaging]
    }
    this._cart.next(cart);
  }

  calculateTotalPrice() {
    let cart = this._cart.value;
    const totalPrice: number = Number((cart?.products.reduce((sum, item) => sum + item.price, 0))?.toFixed(2)) || 0;
    if (cart) {
      cart = {
        ...cart,
        totalPrice: totalPrice
      }
    }
    this._cart.next(cart);
  }

  generateUniqueId(): number {
    return Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);
  }

  savePaymentMethod(method: string) {
    let cart = this._cart.value ?? this.createEmptyCartData();
    cart.paymentMethod = method;
    cart = {
      ...cart,
      paymentMethod: method
    }
    this._cart.next(cart);
  }

  check() {
    this.apiService.getInventoryQuantityAndIdAndType();
  }

  onConfirmPayment(selectedStaff: Staff | null): Observable<any> {
    let cart = this._cart.value ?? this.createEmptyCartData();
    cart = {
      ...cart,
      createdBy: selectedStaff?.staffName ?? ''
    };

    const products = cart?.products ?? [];
    let stringId: string = products.map(p => p.id).join(', ');
    return this.apiService.addNewSalesRecord(cart, stringId).pipe(
      take(1),
      tap((res) => {
        if (res) {
          this.onSuccessPayment(cart, selectedStaff, res);
        }
      }),
      map((res) => res) // convert truthy/falsy to boolean
    );
  }

  private saveProductItemsRecord(res: any[], cart: Cart) {
    const products = cart.products ?? [];
    products.forEach(product => {
      const salesProduct = {
        id: res[0]?.id,
        itemsId: product.productItemsIds,
        productId: product.id,
        totalPrice: cart.totalPrice,
        createdBy: cart.createdBy
      }

      this.apiService.addNewProductItemsRecord(salesProduct).subscribe(recordRes => {
        if (recordRes) {
          console.log('success add the sales product items record');
        }
      })
    });
  }

  private onSuccessPayment(cart: Cart, selectedStaff: Staff | null, res?: any) {
    // store to the sales items db
    if (res) {
      this.saveProductItemsRecord(res, cart);
    }

    if (cart?.paymentMethod === 'cash') {
      this.addCashPaymentToCashRecord(cart.totalPrice, selectedStaff);
    }

    const products: Product[] = cart?.products ?? [];

    this.apiService.getInventoryQuantityAndIdAndType().subscribe((res: SBResponse) => {
      const inventory = res.data;
      this.deductTheStockfromInventory(cart, inventory);
      return
    });
  }


  private deductTheStockfromInventory(cart: Cart, inventory: any[]) {
    const quantityByType: { [type: string]: number } = {};

    // 1. Group total quantity needed per product type (from cart.products)
    for (const product of cart?.products ?? []) {
      quantityByType[product.type] = (quantityByType[product.type] || 0) + product.itemQuantity;
    }

    console.log('Total quantity to deduct by type (products):', quantityByType);

    // 2. Deduct from matching inventory items by type (for products)
    for (const type in quantityByType) {
      let remainingToDeduct = quantityByType[type];

      const matchingInventories = inventory.filter(i => i.type === type && i.quantity > 0);

      for (const inv of matchingInventories) {
        if (remainingToDeduct <= 0) break;

        const deduction = Math.min(inv.quantity, remainingToDeduct);
        const newQuantity = inv.quantity - deduction;

        this.apiService.updateInventory(inv, newQuantity).subscribe({
          next: () => {
            console.log(`Updated inventory ID ${inv.id} (type: ${type}) from ${inv.quantity} to ${newQuantity}`);
          },
          error: (err) => {
            console.error(`Failed to update inventory ID ${inv.id}`, err);
          }
        });

        remainingToDeduct -= deduction;
      }

      if (remainingToDeduct > 0) {
        console.warn(`Not enough inventory to fulfill deduction for type: ${type}. Remaining: ${remainingToDeduct}`);
      }
    }

    // 3. Deduct packaging (by exact inventory ID)
    for (const packaging of cart?.packaging ?? []) {
      const inv = inventory.find(i => i.id === packaging.id && i.type === 'box');

      if (!inv) {
        console.warn(`No matching inventory found for packaging ID ${packaging.id}`);
        continue;
      }

      if (inv.quantity <= 0) {
        console.warn(`Inventory ID ${inv.id} has zero quantity, can't deduct for packaging.`);
        continue;
      }

      const newQuantity = inv.quantity - 1; // Always deduct 1 per packaging

      this.apiService.updateInventory(inv, newQuantity).subscribe({
        next: () => {
          console.log(`Deducted 1 from packaging (box) ID ${inv.id}, new quantity: ${newQuantity}`);
        },
        error: (err) => {
          console.error(`Failed to update packaging inventory ID ${inv.id}`, err);
        }
      });
    }
  }


  private addCashPaymentToCashRecord(totalPrice: number, selectedStaff: Staff | null) {
    const cashRecord: CashRecordRequest = {
      createdBy: selectedStaff?.staffName ?? '',
      recordAmount: totalPrice,
      recordFrom: 'payment',
      remark: 'Cash Payment'
    }
    this.cashRecordService.submitCashInCashOut(cashRecord).subscribe(res => {
      if (res) {
        console.log('success add the cash');

      }
    })
  }

  resetCart() {
    this._cart.next(this.createEmptyCartData());
  }
}

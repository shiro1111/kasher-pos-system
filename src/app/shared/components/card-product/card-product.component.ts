import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Item, Product } from '../../../core/interfaces/interface';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { PRODUCT_ID } from '../../../core/constants/constanst';



@Component({
  selector: 'app-card-product',
  standalone: true,
  imports: [CommonModule, DialogModule, RippleModule, ButtonModule, InputNumberModule, FormsModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './card-product.component.html',
  styleUrl: './card-product.component.scss'
})
export class CardProductComponent {
  @Input() productList: Product[] = [];
  @Input() productItems: any[] = [];
  selectedPackage: string = '';
  selectedPackageObject: any = null;
  customPrices: { [id: string]: number } = {};
  selectedCustomPriceId: string | null = null;
  isOpenSelectionDialog: boolean = false;
  maxProductSelection: number = 0;
  selectedProduct: Item[] = [];
  subtotal: number = 0;
  discount: number = 0;
  totalPrice: number = 0;
  normalDonuts: any[] = [];
  premiumDonuts: any[] = [];
  isPrintReciept: boolean = false;

  constructor(private cartService: CartService) {

  }

  ngAfterViewInit() {
    let grouped: any[] = [];
    if (this.productItems.length > 0) {
      this.productItems.forEach(item => {
        if (item.isPremium) {
          this.premiumDonuts.push(item);
        } else {
          this.normalDonuts.push(item);
        }
      });
    }
  }

  check() {
    console.log('all products', this.productItems);
    console.log('selectedPackageObject', this.selectedPackageObject);

  }

  onAddToCartClicked(item: Product) {
    if (item.type == 'donut') {
      this.maxProductSelection = item.itemQuantity;
      this.productItems = this.productItems.filter(product => product.type === item.type);
      this.isOpenSelectionDialog = true;
    } else {
      this.cartService.addProductToCart(item);
    }
  }

  calculateDiscount() {
    if (this.selectedPackageObject.id == PRODUCT_ID.DONUT_4_PCS) {
      return this.discount = 0.80;
    } else if (this.selectedPackageObject.id == PRODUCT_ID.DONUT_6_PCS) {
      return this.discount = 1.20;
    }  else if (this.selectedPackageObject.id == PRODUCT_ID.DONUT_12_PCS) {
      return this.discount = 4.40;
    } else if (this.selectedPackageObject.id == PRODUCT_ID.DONUT_B6F1) {
      return this.discount = 1.20;
    } else if (this.selectedPackageObject.id == PRODUCT_ID.DONUT_SWEET_BOX) {
      return this.discount = 1.50;
    } else if (this.selectedPackageObject.id == PRODUCT_ID.DONUT_PARTY_BOX) {
      return this.discount = 1.90;
    }else {
      return this.discount = 0;
    }
  }

  calculatePrice() {
  
    this.subtotal = this.selectedProduct.reduce((total, product) => total + (product.price || 0), 0);
    this.calculateSpecialPromo();
    this.totalPrice = Number((this.subtotal - this.discount).toFixed(2));
    
    
  }

  calculateSpecialPromo() {
      if (this.selectedPackageObject.id == PRODUCT_ID.DONUT_3PCS_RM10) {
        this.discount = this.subtotal - 10;
      } else if (this.selectedPackageObject.id == PRODUCT_ID.DONUT_3PCS_MIX_RM10) {
        this.discount = this.subtotal - 12;
      }
  
  }

  addToProductSelection(item: Item) {

    console.log('itemm: ', item);

    if (this.selectedProduct.length < this.maxProductSelection) {
      item = {
        ...item,
        cartId: `${item.id}-${Math.random().toString(36).substr(2, 9)}`
      }
      this.selectedProduct.push(item);
    }

    
    this.calculatePrice();

  }

  removeItem(item: Item) {
    this.selectedProduct = this.selectedProduct.filter(product => product.cartId !== item.cartId);
    this.calculatePrice();
  }

  isProductSelected(itemId: number): boolean {
    return this.selectedProduct.some(product => product.id === itemId);
  }

  submitDialog() {
    this.isOpenSelectionDialog = false;

    const productItems = this.selectedProduct.map(product => product);
    const productItemsIds = this.selectedProduct.map(product => product.id).join(', ');
    this.selectedPackageObject.productItemsIds = productItemsIds;
    this.selectedPackageObject.productItems = productItems;
    this.selectedPackageObject.price = this.totalPrice;
    console.log('selectedPackage: ', this.selectedPackageObject);

    this.cartService.addProductToCart(this.selectedPackageObject);
    this.selectedProduct = [];

  }

  closeDialog() {
    this.isOpenSelectionDialog = false;
    this.selectedProduct = [];
  }

  getImage(productName: string) {
    productName = productName.toLowerCase().replace(/\s+/g, '-');
    return `assets/donuts/${productName}.jpeg`;
  }

  onPackageCLicked(item: any) {
    this.selectedPackage = item.id;
    this.selectedPackageObject = item;
    console.log('this.selectedPackageObject: ', this.selectedPackageObject);
    this.calculateDiscount();


  }

  isCustomPriceVisible(id: number): boolean {
    return this.selectedCustomPriceId === id.toString();
  }
}
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardCategoryComponent } from '../../shared/components/card-category/card-category.component';
import { Cart, Category, CategoryId, Packaging, Product, Staff } from '../../core/interfaces/interface';
import { ApiService } from '../../core/apis/api.service';
import { CardPackageBoxComponent } from '../../shared/components/card-package-box/card-package-box.component';
import { CardProductComponent } from '../../shared/components/card-product/card-product.component';
import { CartComponent } from '../../shared/components/cart/cart.component';
import { SELECTED_CATEGORY } from '../../core/constants/constanst';
import { DashboardService } from '../../core/services/dashboard.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../core/services/cart.service';
import { combineLatest, forkJoin, Subject, take, takeUntil } from 'rxjs';
import { StaffService } from '../../core/services/staff.service';
import { CardOnCartComponent } from '../../shared/components/card-on-cart/card-on-cart.component';
import { AlertService } from '../../core/services/alert.service';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrintService } from '../../core/services/print.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ButtonModule, DialogModule, ToastModule, ReactiveFormsModule, FormsModule, CommonModule, CheckboxModule, CardOnCartComponent, CartComponent, CardCategoryComponent, CardPackageBoxComponent, CardProductComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  CATEGORY_ID = CategoryId;
  categoryList: Category[] = [];
  productList: Product[] = [];
  selectedCategory: string = '';
  allProducts: Product[] = [];
  unsubscribe$ = new Subject();
  cart: Cart | null = null;
  packagingList: Packaging[] = [];
  loadingConfirmPayment: boolean = false;
  productItems: Product[] = [];
  isPrintReciept: boolean = false;
  constructor(
    private alertService: AlertService,
    private staffService: StaffService,
    private cartService: CartService,
    private printService: PrintService,
    private dashboardService: DashboardService,
    private apiService: ApiService) { }


  ngOnInit() {
    this.getCategoryList();
    this.getAllProducts();
    this.getPackaging();
    this.getProductItems();
    this.staffService.initializeActiveStaff();
    this.selectedCategory = sessionStorage.getItem(SELECTED_CATEGORY) ?? '';
    if (this.selectedCategory) {
      this.selectedCard(this.selectedCategory);
    }
    this.subscribeCartDetail();

  }

  getProductItems() {
    this.dashboardService.getProductItems().subscribe(res => {
      if (res && res?.data) {
        this.productItems = res.data;
      }
    })
  }

  getPackaging() {
    this.dashboardService.getPackaging().subscribe(res => {
      this.packagingList = res && res.data ? res.data as Packaging[] : [];
    })
  }

  selectedCard(selectedCategoryId: any) {
    this.selectedCategory = selectedCategoryId;
    sessionStorage.setItem(SELECTED_CATEGORY, this.selectedCategory);
    this.getProductFromCategory();

  }

  getAllProducts() {
    this.dashboardService.getAllProducts().subscribe(res => {
      this.allProducts = res.data;
      this.calculateNoOfItemEachOfproducts();
    })
  }

  getCategoryList() {
    this.apiService.getCategoryList().subscribe(data => {
      this.categoryList = data;
    })
  }

  calculateNoOfItemEachOfproducts() {
    const countMap = this.allProducts.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.categoryList = this.categoryList.map(item => ({
      ...item,
      noOfItems: countMap[item.id] || 0
    }));
  }

  getProductFromCategory() {
    this.productList = this.allProducts.filter(res => res.type == this.selectedCategory && res.enable).sort((a, b) => a.name.localeCompare(b.name));
  }

  showConfirmDialog: boolean = false;

  showDialog() {
    this.showConfirmDialog = true;
  }

  onCheckOut(res: any) {
    this.showConfirmDialog = res;
  }

  selectedStaff: Staff | null = null;
  subscribeCartDetail() {
    combineLatest({
      selectedStaff: this.staffService.activeStaff$,
      cart: this.cartService.cart$,
    }).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(({ selectedStaff, cart }) => {
      this.cart = cart;
      this.selectedStaff = selectedStaff;
    });
  }


  onConfirmPaymentClicked() {
    if (this.loadingConfirmPayment) return;
    this.loadingConfirmPayment = true;

    this.cartService.onConfirmPayment(this.selectedStaff)
      .pipe(take(1))
      .subscribe({
        next: (success: any) => {

          this.loadingConfirmPayment = false;
          if (!success) {
            return this.alertService.showError(
              'Failed to save payment',
              'Please contact Admin for assistance!'
            );
          }
          const invoiceNumber = success[0]?.id || 0;
          this.printReciept(invoiceNumber);
          this.cartService.resetCart();
          this.showConfirmDialog = false;
          this.isPrintReciept = false;;
          this.alertService.showSuccess("Payment successfully");
        },
        error: () => {
          this.loadingConfirmPayment = false;
        }
      });
  }

  printReciept(invoice: number) {
    if (this.isPrintReciept) {
      this.printService.printReceipt(this.cart, invoice);
    }
  }

  // onConfirmPaymentClicked() {
  //   if (this.loadingConfirmPayment) return; // Prevent double-trigger
  //   this.loadingConfirmPayment = true;

  //   this.cartService.onConfirmPayment(this.selectedStaff).pipe(take(1)).subscribe({
  //     next: (res) => {
  //       if (!res) {
  //         this.loadingConfirmPayment = false;
  //         return this.alertService.showError(
  //           'Failed to save payment',
  //           'Please contact Admin for assistance!'
  //         );
  //       }
  //       this.loadingConfirmPayment = false;
  //       this.cartService.resetCart();
  //       this.showConfirmDialog = false;
  //       this.alertService.showSuccess("Payment successfully");
  //     },
  //     error: () => {
  //       this.loadingConfirmPayment = false;
  //     }
  //   });
  // }


  ngOnDestroy() {
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete()
  }
}

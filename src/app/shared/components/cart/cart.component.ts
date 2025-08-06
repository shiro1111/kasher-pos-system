import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../../core/services/cart.service';
import { Cart, Packaging, Product, Staff } from '../../../core/interfaces/interface';
import { filter, Subject, takeUntil } from 'rxjs';
import { StaffService } from '../../../core/services/staff.service';
import { CardOnCartComponent } from '../card-on-cart/card-on-cart.component';
import { ApiService } from '../../../core/apis/api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardOnCartComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  @Output() onCheckOut = new EventEmitter();
  cart: Cart | null = null;
  unsubscribe$ = new Subject();
  toggleEditMode: boolean = false;
  activeStaff: Staff | null = null;
  selectedPayMethod: 'qr' | 'card' | 'cash' | null = null;
  constructor(
    private cartService: CartService, private staffService: StaffService) { }

  ngOnInit() {

    this.retreiveCartDetails();
    this.getActiveStaff();
  }

  getCart() {
    this.cartService.cart$.subscribe(res => {
      this.cart = res;
    })
  }

  retreiveCartDetails() {
    this.cartService.cart$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(res => {
      this.cart = res;
    })
  }

  onEditCart() {
    this.toggleEditMode = !this.toggleEditMode;
  }

  onPayMethodClicked(method: 'cash' | 'qr' | 'card') {
    this.selectedPayMethod = method;
    this.cartService.savePaymentMethod(method);
  }

  onRemoveProduct(item: Product) {
    this.cartService.removeProductFromCart(item);
  }

  onRemovePackaging(item: Packaging) {
    console.log('check');

    this.cartService.removePackagingFromCart(item);
  }

  getActiveStaff() {
    this.staffService.activeStaff$.pipe(
      filter(res => res != null)
    ).subscribe(res => {
      this.activeStaff = res;
    })
  }

  onCheckOutClicked() {
    if (this.selectedPayMethod) {
      this.cartService.savePaymentMethod(this.selectedPayMethod);
      this.onCheckOut.emit(true);
    }
  }

  check() {
    this.cartService.check();
  }
}

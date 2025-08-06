import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Product } from '../../../core/interfaces/interface';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-card-product',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputNumberModule, FormsModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './card-product.component.html',
  styleUrl: './card-product.component.scss'
})
export class CardProductComponent {
  @Input() productList: Product[] = [];
  selectedPackage: string = '';
  customPrices: { [id: string]: number } = {};
  selectedCustomPriceId: string | null = null;

  constructor(private cartService: CartService) { }

  onAddToCartClicked(item: Product) {
    this.cartService.addProductToCart(item);
  }

  onPackageCLicked(itemId: string) {
    this.selectedPackage = itemId;
  }

  isCustomPriceVisible(id: string): boolean {
    return this.selectedCustomPriceId === id;
  }
}

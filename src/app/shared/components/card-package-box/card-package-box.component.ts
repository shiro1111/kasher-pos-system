import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../../core/services/cart.service';
import { Packaging, Product } from '../../../core/interfaces/interface';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-card-package-box',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputNumberModule, FormsModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './card-package-box.component.html',
  styleUrl: './card-package-box.component.scss'
})
export class CardPackageBoxComponent {
  @Input() packagingList: Packaging[] = [];
  selectedPackage: number = 0;

  constructor(private cartService: CartService) { 
  }

  ngOnInit() {
    console.log('packingListxx: ' , this.packagingList);

  }

  onPackageCLicked(itemId: number) {
    this.selectedPackage = itemId;
    console.log('product list card package box: ', this.packagingList);

  }

  onSelectBox(item: Packaging) {
    console.log('select  box');
    
    this.cartService.addPackagingToCart(item);
  }
}

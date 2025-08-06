import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Packaging, Product } from '../../../core/interfaces/interface';

@Component({
  selector: 'app-card-on-cart',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './card-on-cart.component.html',
  styleUrl: './card-on-cart.component.scss'
})
export class CardOnCartComponent {
  @Input() product!: Product;
  @Input() packaging!: Packaging;
  @Input() toggleEditMode: boolean = false;
  @Output() removeProduct = new EventEmitter();
  @Output() removePackaging = new EventEmitter();
  
  onRemoveProduct() {
    this.removeProduct.emit(this.product);
  }
  
  onRemovePackaging() {
    console.log('on emove packaging ', this.packaging);
    
    this.removePackaging.emit(this.packaging);
  }
}

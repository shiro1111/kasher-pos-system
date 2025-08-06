import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Category } from '../../../core/interfaces/interface';

@Component({
  selector: 'app-card-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-category.component.html',
  styleUrl: './card-category.component.scss'
})
export class CardCategoryComponent {

  @Input() categoryList: Category[] = [] ;
  @Input() initSelectedCategory: string = '' ;
  @Output() emitSelectedCard = new EventEmitter<string>(); 
  selectedCard: string = '' ;



  ngOnInit() {
    console.log('cate: ' , this.categoryList);
    this.initSelectedCategory ? this.selectedCard = this.initSelectedCategory : null;
    
  }

  onCardClicked(itemId: string) {
    this.selectedCard = itemId;
    this.emitSelectedCard.emit(itemId);
  }
}

// src/app/pipes/card-total-sale.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardTotalDonut',
  standalone: true
})
export class CardTotalDonutPipe implements PipeTransform {
  transform(item: any): string {
    if (item?.products?.length) {
      const total = item.products.reduce((sum: number, product: any) => {
        if (product.type === 'donut') {
          return sum + (product.itemQuantity || 0);
        }
      }, 0);
      return total;
    }
    return '0';
  }
}

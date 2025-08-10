// src/app/pipes/card-total-sale.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardTotalSale',
  standalone: true
})
export class CardTotalSalePipe implements PipeTransform {
  transform(item: any): string {
    if (item?.products?.length) {
      const total = item.products.reduce((sum: number, product: any) => {
        return sum + (product.price || 0);
      }, 0);
      return total.toFixed(2);
    }
    return '0.00';
  }
}

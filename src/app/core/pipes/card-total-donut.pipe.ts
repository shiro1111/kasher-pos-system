// src/app/pipes/card-total-sale.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardTotalDonut',
  standalone: true
})
export class CardTotalDonutPipe implements PipeTransform {
  transform(item: any): number {
    if (item?.products?.length) {
      const total = item.products.reduce((sum: number, product: any) => {
        if (product.type === 'donut') {
          return sum + (product.itemQuantity || 0);
        }
        return sum; // ignore non-donut products
      }, 0);

      return total;
    }

    return 0;
  }
}

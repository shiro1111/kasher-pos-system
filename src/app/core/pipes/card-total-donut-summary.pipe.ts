import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardTotalDonutSummary',
  standalone: true
})
export class CardTotalDonutSummaryPipe implements PipeTransform {
  transform(products: any[]): number {
    let totalDonuts = 0;

    products.forEach(product => {
      product.products.forEach((item: any) => {
        if (item.type === 'donut') {
          totalDonuts += item.itemQuantity || 0;
        }
      });
    });

    return totalDonuts; // number, matches return type
  }
}

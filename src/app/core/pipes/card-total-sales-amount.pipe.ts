import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardTotalSalesAmount',
  standalone: true
})
export class CardTotalSalesAmountPipe implements PipeTransform {
  transform(products: any[]): string {
    console.log('pipeProduct: ', products);

    let totalPrice = 0.0;

    if (products?.length) {
      products.forEach(product => {
        totalPrice += Number(product.totalPrice);
      });
      return totalPrice.toFixed(2); // return total if products exist
    }

    return '0.00'; // return zero if no products
  }
}


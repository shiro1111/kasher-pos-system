import { Injectable } from '@angular/core';
import { ApiService } from '../apis/api.service';
import { Product, ProductItem } from '../interfaces/interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private apiService: ApiService) { }

  addNewProductItem(item: ProductItem) {
    this.apiService.addNewProductItem(item).subscribe(res => {
      console.log('New product item added', res);
    })
  }

  getAllProductItems(): Observable<any> {
    return this.apiService.getAllProductItems();
  }

  getProductDailyRecord(): Observable<any> {
    return this.apiService.getDailyProductRecordForToday();
  }

  getProductSummary(): Observable<any> {
    return this.apiService.getProductSummary();
  }

  getSalesProductItem(date: Date): Observable<any> {
    const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();

    const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();

    return this.apiService.getSalesProductItem(startDate, endDate );
  }
}

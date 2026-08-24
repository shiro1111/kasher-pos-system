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

  getSalesProductItem(): Observable<any> {
    const today = new Date();

    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    return this.apiService.getSalesProductItem(startDate, endDate );
  }
}

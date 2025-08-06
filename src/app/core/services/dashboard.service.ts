import { Injectable } from '@angular/core';
import { ApiService } from '../apis/api.service';
import { Product, SBResponse } from '../interfaces/interface';
import { StorageService } from './storage.service';
import { PACKAGING_LIST_KEY, PRODUCT_LIST_KEY } from '../constants/constanst';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
  ) { }



  getAllProducts(): Observable<SBResponse> {
    const cache = this.storageService.getFromStorageByKey(PRODUCT_LIST_KEY) as SBResponse;
    if (cache) {
      return of(cache);
    }
    return this.apiService.getAllProducts().pipe(
      tap(res => {
        if (res) {
          this.storageService.saveToStorageByKey(PRODUCT_LIST_KEY, res);
          return res;
        }
        return;
      })
    );
  }

  getPackaging(): Observable<any> {
    const cache = this.storageService.getFromStorageByKey(PACKAGING_LIST_KEY) as SBResponse;
    if (cache) {
      return of(cache);
    }
    return this.apiService.getPackagingList().pipe(
      tap(res => {
        if (res) {
          this.storageService.saveToStorageByKey(PACKAGING_LIST_KEY, res);
          return res
        }
      })
    )
  }
}

import { Injectable } from '@angular/core';
import { ApiService } from '../apis/api.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private apiService: ApiService) { }

  getInventoryData(): Observable<any> {
   return this.apiService.getInventoryData();

  }
}

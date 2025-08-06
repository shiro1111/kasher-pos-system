import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Staff } from '../interfaces/interface';
import { StorageService } from './storage.service';
import { ApiService } from '../apis/api.service';
import {STAFF_LIST_KEY } from '../constants/constanst';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  private _activeStaff = new BehaviorSubject<Staff | null>(null);
  readonly activeStaff$ = this._activeStaff.asObservable();

  constructor(
    private storageService: StorageService,
    private apiService: ApiService
  ) { }

  setActiveStaff(staff: Staff) {
    this._activeStaff.next(staff);
  }

  getStaffList(): Observable<any> {
    const cache = this.storageService.getFromStorageByKey(STAFF_LIST_KEY);

    if (cache) {
      return of(cache);
    }
    return this.apiService.getStaffList().pipe(
      tap(res => {
        if (res?.data) {
          this.storageService.saveToStorageByKey(STAFF_LIST_KEY, res);
        }
      })
    );
  }

}

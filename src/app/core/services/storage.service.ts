import { Injectable } from '@angular/core';
import { Staff } from '../interfaces/interface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  saveToStorageByKey(key: string, data: any) {
    return localStorage.setItem(key, JSON.stringify(data));
  }

  getFromStorageByKey(key: string) {
    const res = localStorage.getItem(key);
    return res ? JSON.parse(res) : null;
  }
}

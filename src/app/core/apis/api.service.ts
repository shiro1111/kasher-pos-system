import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, from, Observable, of } from 'rxjs';
import { Cart, CashRecordRequest, Category, Inventory, Product, ProductItem, SBResponse, Staff, WalletRecordRequest } from '../interfaces/interface';
import data from '../../../assets/data/data.json'
import { SupabaseService } from '../services/supabase.service';
import { keysToCamelCase } from '../utils/keyToCamelCase';

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  constructor(private http: HttpClient, private supabaseService: SupabaseService) { }

  getCategoryList(): Observable<any> {
    return of(data.categoryRes);
  }

  loadPage(page: number, pageSize: number): Observable<SBResponse> {
    const fromPage = (page - 1) * pageSize;
    const toPage = fromPage + pageSize - 1;
    return from(
      this.supabaseService.getCashRecordHistoryPaginated(fromPage, toPage).then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  getCashRecordHistoryByDate(dateFrom: Date, dateTo: Date): Observable<SBResponse> {
    return from(
      this.supabaseService.getCashRecordHistoryByDate(dateFrom, dateTo).then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }
  // loadPage(page: number, pageSize: number): Observable<SBResponse> {
  //   const from = (page - 1) * pageSize;
  //   const to = from + pageSize - 1;
  //   return from(
  //     this.supabaseService.getCashRecordHistory().then(res => {
  //       return this.convertResToCamelCase(res);
  //     })
  //   )
  //   // return from(
  //   //   this.supabaseService.getCashRecordHistoryPaginated(from, to).then(data => {

  //   //     return this.convertResToCamelCase(data);
  //   //     // this.cashRecordHistory = data;
  //   //   })
  //   // )

  // }

  getCashRecordHistory(): Observable<SBResponse> {
    return from(
      this.supabaseService.getCashRecordHistory().then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  // getCashRecordHistoryPaginated(page: number, pageSize: number): Observable<SBResponse> {
  //   return from(
  //     this.supabaseService.getCashRecordHistory().then(res => {
  //       return this.convertResToCamelCase(res);
  //     })
  //   )
  // }

  getAllProducts(): Observable<SBResponse> {
    return from(
      this.supabaseService.getAllProducts().then(res => {
        return this.convertResToCamelCase(res)
      })
    )
  }


  getProductList(categoryId: string) {
    switch (categoryId) {
      case "donut":
        return of(data.donutPackageRes);
      default:
        return of([])
    }
  }

  getStaffList(): Observable<any> {
    return from(
      this.supabaseService.getAllStaff().then(res => {
        return this.convertResToCamelCase(res);
      })
    );
  }

  getInventoryData(): Observable<any> {
    return from(
      this.supabaseService.getInventoryData().then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }
  
  getProductItems(): Observable<any> {
    return from(
      this.supabaseService.getPackagingList().then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  getSalesProductItem(startDate: string, endDate: string): Observable<any> {
    return from(
      this.supabaseService.getSalesProductItem(startDate, endDate).then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  getPackagingList(): Observable<any> {
    return from(
      this.supabaseService.getPackagingList().then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  getSalesReport(startDate: Date, endDate: Date) {
    const start = new Date(Date.UTC(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      0, 0, 0, 0 // Start of the day in UTC
    ));

    const end = new Date(Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() + 1,
      0, 0, 0, 0 // Start of the next day in UTC
    ));

    return from(
      this.supabaseService.getSalesReportFor(startDate, endDate).then(res => {
        return this.convertResToCamelCase(res);
      })
    );
  }

  getSalesReportFor(date: Date) {
    const startDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0, 0, 0, 0 // Start of the day in UTC
    ));

    const endDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
      0, 0, 0, 0 // Start of the next day in UTC
    ));

    return from(
      this.supabaseService.getSalesReportFor(startDate, endDate).then(res => {
        return this.convertResToCamelCase(res);
      })
    );
  }

  getInventoryFor(type: string): Observable<any> {
    return from(
      this.supabaseService.getInventoryFor(type).then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  getInventoryQuantityAndIdAndType() {
    return from(
      this.supabaseService.getInventoryQuantityAndIdAndType().then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  updateInventory(inventory: Inventory, newQuantity: number): Observable<any> {
    return from(
      this.supabaseService.updateInventory(inventory, newQuantity)
    )
  }

  getLatestCashAmount(): Observable<SBResponse> {
    return from(
      this.supabaseService.getLatestCashAmount().then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  getSalesReportByStaff(staff: Staff, date: Date): Observable<SBResponse> {
    const startDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0, 0, 0, 0
    ));

    const endDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
      0, 0, 0, 0
    ));
    return from(
      this.supabaseService.getSalesReportByStaff(staff, startDate, endDate).then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  getSalesReportByStaffRange(staff: Staff, dateFrom: Date, dateTo: Date): Observable<SBResponse> {
    const startDate = new Date(Date.UTC(
      dateFrom.getFullYear(),
      dateFrom.getMonth(),
      dateFrom.getDate(),
      0, 0, 0, 0
    ));

    // start of day after dateTo → inclusive end date
    const endDate = new Date(Date.UTC(
      dateTo.getFullYear(),
      dateTo.getMonth(),
      dateTo.getDate() + 1,
      0, 0, 0, 0
    ));
    return from(
      this.supabaseService.getSalesReportByStaff(staff, startDate, endDate).then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  addNewSalesRecord(cart: Cart, stringId: string): Observable<any> {
    return from(
      this.supabaseService.addNewSalesRecord(cart, stringId).then(res => {
        return res;
      })
    )
  }

  
  addNewWalletRecord(walletRecord: WalletRecordRequest, cashRecord: CashRecordRequest): Observable<any> {
    return from(
      this.supabaseService.addNewWalletRecord(walletRecord, cashRecord).then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  getProductItemProductRecordBySalesId(id: number): Observable<SBResponse> {
    return from(
      this.supabaseService.getProductItemProductRecordBySalesId(id).then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  
  getLatestWalletAmount(): Observable<SBResponse> {
    return from(
      this.supabaseService.getLatestWalletAmount().then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  addNewProductItemsRecord(salesProduct: any): Observable<any> {
    return from(
      this.supabaseService.addNewProductItemsRecord(salesProduct).then(res => {
        return res;
      })
    )
  }

  addNewCashRecord(data: CashRecordRequest): Observable<any> {
    return from(
      this.supabaseService.addNewCashRecord(data).then(res => {
        return res;
      })
    )
  }

  clockInToAttendanceRecord(staff: Staff) {
    return from(
      this.supabaseService.clockInToAttendanceRecord(staff).then(res => {
        return res;
      })
    )
  }

  getInWorkAttendanceStatus(staffId: string): Observable<SBResponse> {
    return from(
      this.supabaseService.getInWorkAttendanceRecordById(staffId).then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }


  async clockOutToAttendanceRecord(staffId: string): Promise<boolean> {
    try {
      const res: any = await firstValueFrom(
        this.http.get('https://timeapi.io/api/time/current/zone?timeZone=Asia%2FKuala_Lumpur')
      );

      const dateTime = res.dateTime; // e.g., "2025-07-31T15:28:45.1234567"
      console.log('Current date: ', dateTime);

      const result = await this.supabaseService.clockOutToAttendanceRecord(staffId, dateTime);
      return result; // true if success
    } catch (error) {
      console.error('Error in clockOutToAttendanceRecord:', error);
      return false;
    }
  }

  addNewProductItem(item: ProductItem): Observable<any> {
    return from(
      this.supabaseService.addNewProductItem(item).then(res => {
        return res;
      })
    )
  }
 
  getAllProductItems(): Observable<any> {
    return from(
      this.supabaseService.getAllProductItems().then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }
 
  getDailyProductRecordForToday(): Observable<any> {
    return from(
      this.supabaseService.getDailyProductRecordForToday().then(res => {
        console.log('getDailyProductRecordForToday: ', res);
        
        return this.convertResToCamelCase(res);
      })
    )
  }
 
  getProductSummary(): Observable<any> {
    return from(
      this.supabaseService.getProductSummary().then(res => {
        return this.convertResToCamelCase(res);
      })
    )
  }

  private convertResToCamelCase(res: any) {
    const camelData = keysToCamelCase(res.data ?? []);
    return { ...res, data: camelData };
  }
}

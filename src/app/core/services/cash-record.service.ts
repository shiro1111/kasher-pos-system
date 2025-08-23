import { Injectable } from '@angular/core';
import { ApiService } from '../apis/api.service';
import { CashRecordRequest, RecordFrom } from '../interfaces/interface';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CashRecordService {

  constructor(
    private apiService: ApiService,
  ) { }

  submitCashInCashOut(data: CashRecordRequest): Observable<any> {
    return this.apiService.getLatestCashAmount().pipe(
      switchMap((res: any) => {
        const currentAmount = res.data.totalAmount;
        const newAmount = data.recordAmount;

        let newTotalAmount = 0;
        if (data.recordFrom === 'cashIn' || data.recordFrom == 'payment') {
          newTotalAmount = currentAmount + newAmount;
        } else if (data.recordFrom === 'cashOut') {
          newTotalAmount = currentAmount - newAmount;
        }

        const newRecord: CashRecordRequest = {
          totalAmount: newTotalAmount,
          createdBy: data.createdBy,
          recordAmount: newAmount,
          recordFrom: data.recordFrom,
          remark: data.remark
        };

        return this.apiService.addNewCashRecord(newRecord);
      }),
      catchError(error => {
        console.error('Failed to submit cash record', error);
        return of(false); // fallback
      })
    );
  }

}

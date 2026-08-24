import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../core/apis/api.service';
import { StaffService } from '../../core/services/staff.service';
import { CashRecordRequest, RecordFrom, Staff, WalletRecordRequest } from '../../core/interfaces/interface';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { CashRecordService } from '../../core/services/cash-record.service';
import { AlertService } from '../../core/services/alert.service';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-cashier',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule, InputTextModule, CardModule, InputNumberModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cashier.component.html',
  styleUrl: './cashier.component.scss'
})

export class CashierComponent {
  isShowDialog: boolean = false;
  dialogMode!: RecordFrom;
  drawerAmount: number = 0;
  activeStaff!: Staff;
  formGroup!: FormGroup;
  cashRecordHistory: any[] = [];
  page = 1;
  pageSize = 5;
  walletAmount: number = 0;
  constructor(
    private staffService: StaffService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private cashRecordService: CashRecordService,
    private apiService: ApiService) { }

  ngOnInit() {
    this.initForm();
    this.getLatestCashAmount();
    this.subscribeActiveStaff();
    this.getCashRecordHistory();
    this.getLatestWalletAmount();
    this.getCashRecordHistoryForToday();
  }

  getLatestWalletAmount() {
    this.apiService.getLatestWalletAmount().subscribe(res => {
      console.log('getLatestWalletAmount: ', res);

      return this.walletAmount = res && res.data?.totalAmount ? res && res.data.totalAmount : 0;
    })
  }

  cashRecordForToday: any[] = [];
  todayCashIn: number = 0;
  todayCashOut: number = 0;
  listOfTodayCashOut:any;
  getCashRecordHistoryForToday() {
    const now = new Date();
    const fromDate = new Date(now);
    fromDate.setHours(0, 0, 0, 0);

    // End of today: 23:59:59.999
    const toDate = new Date(now);
    toDate.setHours(23, 59, 59, 999);
    this.apiService.getCashRecordHistoryByDate(fromDate, toDate).subscribe(res => {
      this.cashRecordForToday = res.data;
      console.log('Cash Record History for Today:', this.cashRecordForToday);
      this.todayCashIn = this.calculateTotalAmountFor('payment');
      this.todayCashOut = this.calculateTotalAmountFor('cashOut');
      this.listOfTodayCashOut = this.cashRecordForToday.filter(record => record.recordFrom === 'cashOut');
      console.log('list of todaycashout: ' , this.listOfTodayCashOut);
      
    })

  }

  calculateTotalAmountFor(recordFrom: RecordFrom): number {
    return this.cashRecordForToday
      .filter(record => record.recordFrom === recordFrom)
      .reduce((total, record) => total + record.recordAmount, 0);
  }

  getCashRecordHistory() {
    this.apiService.getCashRecordHistory().subscribe(res => {
      this.cashRecordHistory = res.data;
    })
  }

  getCashRecordHistoryPaginated() {
    this.apiService.loadPage(this.page, this.pageSize).subscribe(res => {
      this.cashRecordHistory.push(...res.data);
      console.log('Cash Record History:', this.cashRecordHistory);
      this.isLoading = false;

    });
  }

  subscribeActiveStaff() {
    this.staffService.activeStaff$.subscribe(res => {
      if (res) {
        this.activeStaff = res;
      }
    })
  }

  initForm() {
    this.formGroup = this.fb.group({
      amount: ['', Validators.required],
      remark: ['', Validators.required]
    })
  }
  getLatestCashAmount() {
    this.apiService.getLatestCashAmount().subscribe(res => {
      if (res && res.data) {
        this.drawerAmount = res.data.totalAmount;
      }
    })
  }
  showDialog(mode: 'cashIn' | 'cashOut' | 'saveToWallet') {
    this.dialogMode = mode
    this.isShowDialog = true;
    this.formGroup.reset();
  }

  // ' ?  : 'Cash-Out' 

  getDialogHeader(mode: string) {
    if (mode == 'cashIn') {
      return 'Cash-In'
    } else if (mode == 'cashOut') {
      return 'Cash-Out'
    } else if (mode == 'saveToWallet') {
      return 'Save to Wallet';
    } else {
      return '';
    }
  }
  isLoading: boolean = false;
  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const scrollPosition = target.scrollTop + target.clientHeight;
    const scrollHeight = target.scrollHeight;

    if (!this.isLoading && scrollHeight - scrollPosition <= 70) {
      this.isLoading = true;
      this.page++;
      this.getCashRecordHistoryPaginated();
    }
  }


  submitForSaveToWallet(data: CashRecordRequest): void {
    //save totalamount to last_amount
    //totalamount minus record amount and store to walletamount
    const currentAmount = data.totalAmount ? data.totalAmount - data.recordAmount : 0;

    // add wallet amount to the requst
    // get lastest current wallet amount
    this.apiService.getLatestCashAmount().subscribe(res => {
      let totalAmount = res && res.data?.totalAmount ? res.data.totalAmount - data.recordAmount : 0;

      data.totalAmount = totalAmount;
      data.recordAmount = data.recordAmount;
      data.recordFrom = 'saveToWallet';
      data.createdBy = this.activeStaff?.staffName ?? 'Unknown';
      data.remark = data.remark || '';
      console.log('data: ', data);

      // this.apiService.addNewCashRecord(data).subscribe(res => {
      //   if (res) {
      //     this.getLatestCashAmount();
      //     // this.getCashRecordHistory();
      const walletData: WalletRecordRequest = {
        createdBy: data.createdBy,
        recordAmount: data.recordAmount,
        totalAmount: totalAmount
      }
      this.apiService.addNewWalletRecord(walletData, data).subscribe(walletRes => {
        if (walletRes) {
          this.submitCashInCashOutFromDrawer('saveToWallet', data);
          this.isShowDialog = false;
          this.getLatestCashAmount();
          this.getLatestWalletAmount();
          // this.getCashRecordHistory();
          this.alertService.showSuccess(`Successful ${this.dialogMode}`)

          //todo: add record for transfer
        } else {
          console.error('Failed to add wallet record');
        }
      });

      // }
      // });

      // store into the table
      //calll cashout
      // this.cashRecordService.submitSaveToWallet(data).subscribe(res => {
      //   if (res) {
      //     this.isShowDialog = false;
      //     // this.getLatestCashAmount();
      //     // this.getCashRecordHistory();
      //     this.alertService.showSuccess(`Successful ${this.dialogMode}`)
      //   }
      // });
    });




  }

  submitCashInCashOutFromDrawer(mode: RecordFrom, data: CashRecordRequest) {
    this.cashRecordService.submitCashInCashOut(data).subscribe(res => {

      if (res) {
        this.isShowDialog = false;
        this.getLatestCashAmount();
        this.getCashRecordHistory();
        this.alertService.showSuccess(`Successful ${this.dialogMode}`)
      }
    });
  }

  onSubmit() {
    const data: CashRecordRequest = {
      createdBy: this.activeStaff?.staffName ?? undefined,
      recordAmount: this.formGroup.controls['amount'].value,
      recordFrom: this.dialogMode,
      remark: this.formGroup.controls['remark'].value,
      totalAmount: this.drawerAmount
    }
    if (this.dialogMode == 'saveToWallet') {
      return this.submitForSaveToWallet(data);
    } else {
      return this.submitCashInCashOutFromDrawer(data.recordFrom, data);
    }
  }
}

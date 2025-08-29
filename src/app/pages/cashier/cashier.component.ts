import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ApiService } from '../../core/apis/api.service';
import { StaffService } from '../../core/services/staff.service';
import { CashRecordRequest, RecordFrom, Staff } from '../../core/interfaces/interface';
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
  totalAmount: number = 0;
  activeStaff!: Staff;
  formGroup!: FormGroup;
  cashRecordHistory: any[] = [];
  page = 1;
  pageSize = 5;
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
        this.totalAmount = res.data.totalAmount;
      }
    })
  }
  showDialog(mode: 'cashIn' | 'cashOut') {
    this.dialogMode = mode
    this.isShowDialog = true;
    this.formGroup.reset();
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


  onSubmit() {
    const data: CashRecordRequest = {
      createdBy: this.activeStaff?.staffName ?? undefined,
      recordAmount: this.formGroup.controls['amount'].value,
      recordFrom: this.dialogMode,
      remark: this.formGroup.controls['remark'].value,
      totalAmount: this.totalAmount
    }
    this.cashRecordService.submitCashInCashOut(data).subscribe(res => {

      if (res) {
        this.isShowDialog = false;
        this.getLatestCashAmount();
        this.getCashRecordHistory();
        this.alertService.showSuccess(`Successful ${this.dialogMode}`)
      }
    });

  }
}

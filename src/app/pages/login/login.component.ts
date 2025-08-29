import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LoggedStatus, Staff } from '../../core/interfaces/interface';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Ripple } from 'primeng/ripple';
import { ApiService } from '../../core/apis/api.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { StaffService } from '../../core/services/staff.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ButtonModule, ConfirmDialogModule, InputTextModule, FormsModule, ReactiveFormsModule, ToastModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  clock = new Date();
  password: string = '';
  LoggedStatus = LoggedStatus;
  currentStatus: LoggedStatus = LoggedStatus.CLOCK_IN;
  showLoginInput: boolean = false;
  staffList: Staff[] = [];
  currentSelectedStaff: string | null = null;
  selectedStaff: Staff | null = null;
  constructor(
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private router: Router, private messageService: MessageService,
    private staffService: StaffService) { }


  ngOnInit() {
    this.getClock();
    this.getStaffList();
  }

  getStaffList() {
    this.staffService.getStaffList().subscribe(res => {
      this.staffList = res.data;
    })
  }

  getClock() {
    setInterval(() => this.clock = new Date(), 1000);
  }

  getTime() {
    const hours = this.clock.getHours() % 12 || 12; // convert 0 to 12
    const minutes = this.clock.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  onClockInBtnClicked() {
    this.showLoginInput = true;
  }
  back() {
    this.router.navigate(['home'])
  }

  showError() {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Wrong password. Please try again.' });
  }

  onClockIn() {
    if (this.selectedStaff && this.selectedStaff.password == this.password) {

      this.apiService.clockInToAttendanceRecord(this.selectedStaff).subscribe(res => {
        if (res) {
          this.showSuccess();
          this.password = '';
          this.showLoginInput = false;
          this.currentStatus = LoggedStatus.CLOCK_OUT

        }

      })


    } else {
      this.showError();
    }
  }

  onStaffClicked(staff: Staff) {
    this.currentSelectedStaff = staff.staffId;
    this.selectedStaff = staff;
    this.apiService.getInWorkAttendanceStatus(this.currentSelectedStaff).subscribe(res => {
      console.log('in work status ', res);
      if (res && res.data.length && res.data[0].inWork) {
        this.currentStatus = LoggedStatus.CLOCK_OUT;
      } else {
        this.currentStatus = LoggedStatus.CLOCK_IN;

      }

    })
  }
  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Successfully Clock-in', detail: `Clock-in time on ${this.clock}` });
  }


  onClockOutBtnClicked(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure that you want to clock-out?',
      header: 'Confirmation',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Clock-out',
      },
      accept: () => {
        if (this.currentSelectedStaff) {
          this.apiService.clockOutToAttendanceRecord(this.currentSelectedStaff)
          this.currentStatus = LoggedStatus.CLOCK_IN;
        }
      },
    });
  }
}

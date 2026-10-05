import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { SideNavStatus, Staff } from '../../../core/interfaces/interface';
import { StaffService } from '../../../core/services/staff.service';
import { AlertService } from '../../../core/services/alert.service';
import { ACTIVE_STAFF } from '../../../core/constants/constanst';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [ButtonModule, CommonModule, DialogModule, PasswordModule, FormsModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  @Input() sidenavStatus: 'MIN' | 'MAX' = SideNavStatus.MIN;
  sidenavMenu = [
    { title: 'Menu', url: 'menu', icon: 'pi-th-large' },
    { title: 'Inventory', url: 'inventory', icon: 'pi-database' },
    { title: 'Cashier', url: 'cashier', icon: 'pi-dollar' },
    { title: 'Sales report', url: 'sales-report', icon: 'pi-chart-line' },
    { title: 'Analytics', url: 'analytics', icon: 'pi-desktop' },
    { title: 'Settings', url: 'settings', icon: 'pi-cog' },
  ]
  selectedMenu: string = 'menu';
  staffList: Staff[] = [];

  currentActiveRoute = '';
  currentSelectedStaff: string | null = null;
  showAdminPasswordDialog: boolean = false;
  adminPassword: string = '';
  pendingAdminStaff: Staff | null = null;
  constructor(private router: Router, private staffService: StaffService, private alertService: AlertService) {
    this.router.events.subscribe(() => {
      const urlSegments = this.router.url.split('/');
      this.currentActiveRoute = urlSegments[urlSegments.length - 1];
      this.getActiveStaffFromStorage();
    });
  }

  ngOnInit() {
    this.getStaffList();
  }
  getStaffList() {
    this.staffService.getStaffList().subscribe(res => {
      if (res) {
        this.staffList = res.data;
      }
    })
  }

  onStaffClicked(staff: Staff) {
    if (staff.staffId == this.currentSelectedStaff) {
      return;
    }
    // switching to admin requires password verification
    if (staff.staffName?.toLowerCase() === 'admin') {
      this.pendingAdminStaff = staff;
      this.adminPassword = '';
      this.showAdminPasswordDialog = true;
      return;
    }
    this.applyStaffSwitch(staff);
  }

  applyStaffSwitch(staff: Staff) {
    this.currentSelectedStaff = staff.staffId;
    this.staffService.setActiveStaff(staff);
    sessionStorage.setItem(ACTIVE_STAFF, JSON.stringify(staff));
  }

  verifyAdminPassword() {
    if (this.pendingAdminStaff && this.pendingAdminStaff.password === this.adminPassword) {
      this.applyStaffSwitch(this.pendingAdminStaff);
      this.closeAdminPasswordDialog();
    } else {
      this.alertService.showError('Wrong password. Please try again.');
    }
  }

  closeAdminPasswordDialog() {
    this.showAdminPasswordDialog = false;
    this.adminPassword = '';
    this.pendingAdminStaff = null;
  }

  getActiveStaffFromStorage() {
    const stored = sessionStorage.getItem(ACTIVE_STAFF);
    const staff = stored ? JSON.parse(stored) : null;
    if (staff) {
      this.currentSelectedStaff = staff.staffId;
      this.staffService.setActiveStaff(staff);
    }
  }

  onMenuClicked(menu: any) {
    this.router.navigate([`/home/${menu.url}`])

  }
}

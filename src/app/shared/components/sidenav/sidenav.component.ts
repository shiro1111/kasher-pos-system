import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SideNavStatus, Staff } from '../../../core/interfaces/interface';
import { StaffService } from '../../../core/services/staff.service';
import { ApiService } from '../../../core/apis/api.service';
import { ACTIVE_STAFF } from '../../../core/constants/constanst';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [ButtonModule, CommonModule],
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
  constructor(private router: Router, private staffService: StaffService) {
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
      console.log('res from staff service: ', res);
      if (res) {
        this.staffList = res.data;
      }
    })
  }

  onStaffClicked(staff: Staff) {
    if (staff.staffId != this.currentSelectedStaff) {
      console.log('trig');
      
      this.currentSelectedStaff = staff.staffId;
      this.staffService.setActiveStaff(staff);
      sessionStorage.setItem(ACTIVE_STAFF, JSON.stringify(staff));
    }

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
    console.log('item: ', menu);
    this.router.navigate([`/home/${menu.url}`])

  }
}

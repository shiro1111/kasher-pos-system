import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { PACKAGING_LIST_KEY, PRODUCT_LIST_KEY, STAFF_LIST_KEY } from '../../core/constants/constanst';
import { DashboardService } from '../../core/services/dashboard.service';
import { StaffService } from '../../core/services/staff.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

  constructor(private dashboardService: DashboardService, private staffService: StaffService) { }

  clearCacheClicked() {
    // Clear local storage
    localStorage.removeItem(PRODUCT_LIST_KEY);
    localStorage.removeItem(PACKAGING_LIST_KEY);
    localStorage.removeItem(STAFF_LIST_KEY);

    // Reload data from backend in parallel
    forkJoin([
      this.dashboardService.getAllProducts(),
      this.dashboardService.getPackaging(),
      this.staffService.getStaffList()
    ]).subscribe({
      next: ([products, packaging, staff]) => {
        console.log('All data reloaded successfully');
      },
      error: (err) => {
        console.error('Failed to reload some data:', err);
      }
    });


  }
  refreshStaff() {
    localStorage.removeItem(STAFF_LIST_KEY);
    this.staffService.getStaffList().subscribe({
      next: (staff) => {
        console.log('Staff list refreshed successfully', staff);
      },
      error: (err) => {
        console.error('Failed to refresh staff list:', err);
      }
    });
  }
}

import { Component, EventEmitter, Output } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { Route, Router, RouterOutlet } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { SIDENAV_STATUS_KEY } from '../../../core/constants/constanst';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidenavComponent, RouterOutlet, ToastModule, ButtonModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  toggleSidenavStatus: 'MAX' | 'MIN' = 'MAX';
  clock = new Date();

  constructor(private router: Router) {
    this.getClock();
    this.getToggleSidenavStatus();


  }

  getToggleSidenavStatus() {
    const status = sessionStorage.getItem(SIDENAV_STATUS_KEY);
    this.toggleSidenavStatus = status ? status as 'MAX' | 'MIN' : 'MAX';
  }
  onMenuCLicked() {
    this.toggleSidenavStatus = this.toggleSidenavStatus == 'MAX' ? 'MIN' : 'MAX';
    sessionStorage.setItem(SIDENAV_STATUS_KEY, this.toggleSidenavStatus);
  }

  getClock() {
    setInterval(() => this.clock = new Date(), 1000);
  }

  navigateToClockInPage() {
    this.router.navigate(['/login'])
  }

}

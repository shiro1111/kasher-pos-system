import { Component } from '@angular/core';
import { Button } from "primeng/button";
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { CommonModule } from '@angular/common';
import { SalesProductItem } from '../../../core/interfaces/interface';
import { DashboardService } from '../../../core/services/dashboard.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [CommonModule, Button, FormsModule, DatePickerModule],
  templateUrl: './today.component.html',
  styleUrl: './today.component.scss'
})
export class TodayComponent {
  productItems: any[] = [];
  salesProductItems: SalesProductItem[] = [];
  selectedDate: Date | undefined = new Date();

  constructor(private anaylticsService: AnalyticsService, private dashboardService: DashboardService) { }


  ngOnInit() {
    this.loadSalesForSelectedDate();
  }

  onSearchClicked() {
    this.loadSalesForSelectedDate();
  }

  loadSalesForSelectedDate() {
    if (!this.selectedDate) {
      return;
    }
    // forkJoin: catalog + sales together, no race on itemDetail mapping
    forkJoin({
      productItems: this.dashboardService.getProductItems(),
      sales: this.anaylticsService.getSalesProductItem(this.selectedDate),
    }).subscribe(({ productItems, sales }) => {
      if (productItems?.data) {
        this.productItems = productItems.data;
      }
      if (sales?.data) {
        this.salesProductItems = sales.data.map((item: SalesProductItem) => {
          const itemIds = item?.itemIds
            ?.split(',')
            ?.map((id: string) => Number(id.trim()));

          const itemDetail = itemIds
            ?.map(id => this.productItems.find(prod => prod.id === id))
            ?.filter(prod => !!prod);

          return {
            ...item,
            itemDetail
          };
        });

        this.todaySummary = this.generateSummary(this.salesProductItems);
      }
    });
  }

  todaySummary: any[] = [];

  get totalSold(): number {
    return this.todaySummary.reduce((sum, item) => sum + item.sold, 0);
  }

  generateSummary(data: any[]) {
    const summaryMap: any = {};

    data.forEach(sale => {
      sale.itemDetail?.forEach((item: any) => {
        const name = item.productName.trim();  // clean spaces

        if (!summaryMap[name]) {
          summaryMap[name] = 1;
        } else {
          summaryMap[name]++;
        }
      });
    });

    // Convert to array
    const summaryArray = Object.keys(summaryMap).map(name => ({
      name,
      sold: summaryMap[name]
    }));

    // Sort by top selling first
    summaryArray.sort((a, b) => b.sold - a.sold);

    return summaryArray;
  }
}

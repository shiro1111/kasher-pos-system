import { Component } from '@angular/core';
import { Card } from "primeng/card";
import { PopoverModule } from 'primeng/popover';
import { Button } from "primeng/button";
import { InputNumber } from "primeng/inputnumber";
import { FormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';
import { ProductSummaryRecordComponent } from './product-summary-record/product-summary-record.component';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { CommonModule } from '@angular/common';
import { Item, Product, SalesProductItem } from '../../../core/interfaces/interface';
import { DashboardService } from '../../../core/services/dashboard.service';


PopoverModule
@Component({
  selector: 'app-today',
  standalone: true,
  imports: [Card, CommonModule, PopoverModule, Button, InputNumber, FormsModule, ProductSummaryRecordComponent,
    DividerModule, AccordionModule],
  templateUrl: './today.component.html',
  styleUrl: './today.component.scss'
})
export class TodayComponent {
  stockCount: number = 0;
  productItems: any[] = [];
  summary: any = {};
  allProducts: Product[] = [];
  salesProductItems: SalesProductItem[] = [];

  constructor(private anaylticsService: AnalyticsService, private dashboardService: DashboardService) { }


  ngOnInit() {
    this.getProductItem();
    this.getProductSummary();
    this.getProductDailyRecord();
    this.getAllProduct();
    this.getSalesProductItem();


  }

  getProductItem() {
    this.dashboardService.getProductItems().subscribe(res => {
      if (res?.data?.length > 0) {
        this.productItems = res.data;
      }
    })
  }

  getProductName(item: SalesProductItem) {
    const name = this.allProducts.find(prod => prod.id == item.productId)?.name;
    return name;
  }

  getAllProduct() {
    this.dashboardService.getAllProducts().subscribe(res => {
      console.log('All products', res);
      if (res?.data?.length > 0) {
        this.allProducts = res.data;
      }
    })
  }

  todaySummary: any[] = [];
  getSalesProductItem() {
    this.anaylticsService.getSalesProductItem().subscribe(res => {
      if (res.data) {
        this.salesProductItems = res.data;
        console.log('salesProductItems: ', this.salesProductItems);

        this.salesProductItems = this.salesProductItems.map(item => {
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

        console.log('salesProductItem', this.salesProductItems);

        this.todaySummary = this.generateSummary(this.salesProductItems);
      }
    })
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
  


  getProductDailyRecord() {
    this.anaylticsService.getProductDailyRecord().subscribe(res => {
      console.log('Product daily record', res);
    })
  }

  getProductSummary() {
    this.anaylticsService.getProductSummary().subscribe(res => {
      console.log('Product summary', res);
      if (res?.data) {
        this.summary = res.data[0];
      }
    })
  }
}

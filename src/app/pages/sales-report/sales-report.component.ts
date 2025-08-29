import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';
import { ApiService } from '../../core/apis/api.service';
import { SelectModule } from 'primeng/select';
import { Product, Staff } from '../../core/interfaces/interface';
import { StaffService } from '../../core/services/staff.service';
import { forkJoin } from 'rxjs';
import { CardModule } from 'primeng/card';
import { CardTotalSalePipe } from '../../core/pipes/card-total-sales.pipe';
import { CardTotalDonutPipe } from '../../core/pipes/card-total-donut.pipe';
import { CardTotalSalesAmountPipe } from '../../core/pipes/card-total-sales-amount.pipe';
import { CardTotalDonutSummaryPipe } from '../../core/pipes/card-total-donut-summary.pipe';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardTotalDonutSummaryPipe, CardModule, CardTotalSalesAmountPipe, CardTotalDonutPipe, CardTotalSalePipe, FluidModule, SelectModule, InputTextModule, DatePickerModule, FormsModule],
  templateUrl: './sales-report.component.html',
  styleUrl: './sales-report.component.scss'
})
export class SalesReportComponent {

  constructor(private apiService: ApiService, private staffService: StaffService,
    private dashboardService: DashboardService) { }
  currentTab: string = 'Overview';
  currentPaymentTab: string = 'Cash';
  selectedStaffSummaryTab: string = '';
  selectedStaffSummaryReport: any = null;
  tabs: string[] = ['Overview', 'Individual'];
  paymentTabs: string[] = ['Cash', 'QR'];
  selectedDate: Date | undefined = new Date();
  selectedIndividualDate: Date = new Date();
  staffList: Staff[] = [];
  selectedStaff!: Staff;
  individualReport: any[] = [];
  filteredPaymentMethod: any[] = [];
  salesReport: any[] = [];

  ngOnInit() {
    this.getStaffList();
  }

  getTotalAmountSales(individualReport: any[]) {

  }
  
  onStaffSummarizeClicked(report: any) {
    this.selectedStaffSummaryTab = report.createdBy;
    this.selectedStaffSummaryReport = report;
    

  }
  onSearchIndividualClicked() {
    forkJoin([
      this.apiService.getSalesReportByStaff(this.selectedStaff, this.selectedIndividualDate),
      this.dashboardService.getAllProducts(),
    ]).subscribe({
      next: ([salesReport, products]) => {
        this.individualReport = this.mergeSalesRecordAndProducts(salesReport.data, products.data);
      },
      error: (err) => {
        console.error('Failed to reload some data:', err);
      }
    })

    this.apiService.getSalesReportByStaff(this.selectedStaff, this.selectedIndividualDate).subscribe(res => {
      console.log('getSalesReportByStaff: ', res);
      this.apiService.getAllProducts().subscribe
      if (res && res.data) {
        this.summarizeReport(res.data);
      } else {
        console.error('No data found for the selected staff and date');
      }
    })
  }

  onChangePaymentTab(tab: string) {
    this.currentPaymentTab = tab;

    this.filteredPaymentMethod = this.salesReport.filter((item: any) => {
      return item.paymentMethod.toLowerCase() === tab.toLowerCase();
    })
  }

  check(item: any) {
    console.log('item: ', item);

  }

  getCardTotalSale(item: any) {
    if (item?.products.length) {
      let total = 0;
      item.products.forEach((product: any) => {
        total += product.price;
      });
      return total.toFixed(2);
    }
    return 0;

  }

  getFullProductDetailsByProductId(productIds: number[], salesReport: any[]) {

    this.dashboardService.getAllProducts().subscribe(res => {

    })
  }

  mergeSalesRecordAndProducts(salesReport: any[], products: Product[]) {

    const mergedReport = salesReport.map(sale => {

      const productIds: number[] = (sale.productsId.split(",").map((id: string) => Number(id.trim())));

      // Find matching products for each ID
      const saleProducts = productIds.map((pid: any) =>
        products.find(prod => prod.id === pid)
      );

      return {
        ...sale,
        products: saleProducts // attach full product objects
      };
    });

    return mergedReport
  }
  onSearchClicked() {
    if (this.selectedDate) {
      this.selectedStaffSummaryTab = '';
      this.selectedStaffSummaryReport = null;
      forkJoin([
        this.apiService.getSalesReportFor(this.selectedDate),
        this.dashboardService.getAllProducts(),
      ]).subscribe({
        next: ([salesReport, products]) => {
          this.salesReport = salesReport.data;
          this.summarizeReport(salesReport.data);
          // this.filteredPaymentMethod = this.salesReport.filter((item: any) => {
          //   return item.paymentMethod.toLowerCase() === this.currentPaymentTab.toLowerCase();
          // })
          const mergedRecord = this.mergeSalesRecordAndProducts(this.salesReport, products.data);
          this.summarizeSalesReport = this.summarizeSales(mergedRecord);
          this.onChangePaymentTab(this.currentPaymentTab);
        }
      })
      // this.apiService.getSalesReportFor(this.selectedDate).subscribe(res => {
      //   this.salesReport = res.data;
      //   this.summarizeReport(res.data);
      //   this.mergeSalesRecordAndProducts(this.salesReport, );
      // })
    }
  }

  summarizeSalesReport: any[] = [];

  summarizeSales(transactions: any[]) {
    const summary: any = {};
  
    transactions.forEach((txn) => {
      const { createdBy, totalPrice, products } = txn;
  
      if (!summary[createdBy]) {
        summary[createdBy] = { createdBy, salesProducts: {} };
      }
  
      // find unique product types in this transaction
      const typesInTxn: Set<string> = new Set(products.map((p: Product) => p.type));
  
      products.forEach((product: Product) => {
        const type = product.type;
  
        if (!summary[createdBy].salesProducts[type]) {
          summary[createdBy].salesProducts[type] = {
            type,
            totalItemQuantity: 0,
            totalPrice: 0,
            numberOfTransaction: 0,
            totalSoldItem: 0,
          };
        }
  
        if (type === "donut") {
          // donuts counted by itemQuantity
          summary[createdBy].salesProducts[type].totalItemQuantity += product.itemQuantity || 0;
          summary[createdBy].salesProducts[type].totalSoldItem += product.itemQuantity || 0;
        } else {
          // non-donuts counted by number of product entries
          summary[createdBy].salesProducts[type].totalSoldItem += 1;
        }
      });
  
      // Add totalPrice + transaction count only once per type in this txn
      typesInTxn.forEach((type) => {
        summary[createdBy].salesProducts[type].totalPrice += totalPrice;
        summary[createdBy].salesProducts[type].numberOfTransaction += 1;
      });
    });
  
    // Convert salesProducts object -> array for each createdBy
    return Object.values(summary).map((userSummary: any) => ({
      createdBy: userSummary.createdBy,
      salesProducts: Object.values(userSummary.salesProducts),
    }));
  }
  

  getStaffList() {
    this.staffService.getStaffList().subscribe({
      next: (staff) => {
        this.staffList = staff && staff.data ? staff.data as Staff[] : [];
      },
      error: (err) => {
        console.error('Failed to fetch staff list:', err);
      }
    })
  }
  summarizeReport(data: any[]) {
    let totalAmount = 0;

    const paymentSummary: {
      [paymentMethod: string]: {
        total: number;
        count: number;
      };
    } = {};

    const createdByCount: {
      [createdBy: string]: number;
    } = {};

    for (const item of data) {
      const { totalPrice, paymentMethod, createdBy } = item;

      // Total sales
      totalAmount += totalPrice;

      // Group total by payment method
      if (!paymentSummary[paymentMethod]) {
        paymentSummary[paymentMethod] = {
          total: 0,
          count: 0
        };
      }
      paymentSummary[paymentMethod].total += totalPrice;
      paymentSummary[paymentMethod].count++;

      // Count by created_by
      if (!createdByCount[createdBy]) {
        createdByCount[createdBy] = 0;
      }
      createdByCount[createdBy]++;
    }

    this.totalAmount = totalAmount;
    this.paymentSummary = paymentSummary;
    this.createdByCount = createdByCount;
    this.summaryDate = this.selectedDate;
  }
  summaryDate: Date | undefined;
  totalAmount: number = 0;
  paymentSummary: any = {};
  createdByCount: any = {};


  onChangeTab(tab: string) {
    this.currentTab = tab;
  }
}

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
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardTotalDonutSummaryPipe, CardModule, CardTotalSalesAmountPipe, CardTotalDonutPipe, CardTotalSalePipe, FluidModule, SelectModule, InputTextModule, DatePickerModule, FormsModule, DialogModule],
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
  activeStaff: Staff | null = null;
  paymentTabs: string[] = ['All', 'Cash', 'QR'];
  selectedDate: Date | undefined = new Date();
  selectedIndividualDate: Date = new Date();
  staffList: Staff[] = [];
  selectedStaff!: Staff;
  monitoringStaff!: Staff;
  monitoringDateFrom: Date | undefined;
  monitoringDateTo: Date | undefined;
  monitoringReport: { date: Date; types: Record<string, number> }[] = [];
  monitoringTypeTotals: Record<string, number> = {};
  individualReport: any[] = [];
  filteredPaymentMethod: any[] = [];
  salesReport: any[] = [];
  productsList: any[] = [];
  isProductListDialogVisible: boolean = false;

  ngOnInit() {
    this.staffService.initializeActiveStaff();
    this.staffService.activeStaff$.subscribe(staff => {
      this.activeStaff = staff;
      // Sales Monitoring visible only for admin staff
      this.tabs = staff?.staffName?.toLowerCase() === 'admin'
        ? ['Overview', 'Individual', 'Sales Monitoring']
        : ['Overview', 'Individual'];
    });
    this.getStaffList();
    this.getProductList();
    this.getAllProductItems();
  }
  productItems: any[] = [];
  getAllProductItems() {
    this.apiService.getAllProductItems().subscribe(res => {
      this.productItems = res.data;
    })
  }

  getTotalAmountSales(individualReport: any[]) {

  }

  getProductList() {
    this.dashboardService.getAllProducts().subscribe(res => {
      this.productsList = res.data;
    })
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
  }

  onMonitoringSearchClicked() {
    if (!this.monitoringStaff || !this.monitoringDateFrom || !this.monitoringDateTo) {
      return;
    }
    forkJoin([
      this.apiService.getSalesReportByStaffRange(this.monitoringStaff, this.monitoringDateFrom, this.monitoringDateTo),
      this.dashboardService.getAllProducts(),
    ]).subscribe({
      next: ([salesReport, products]) => {
        const merged = this.mergeSalesRecordAndProducts(salesReport.data || [], products.data || []);
        this.buildMonitoringSummary(merged);
      },
      error: (err) => {
        console.error('Failed to load monitoring report:', err);
      }
    });
  }

  private buildMonitoringSummary(transactions: any[]) {
    const byDate: Record<string, Record<string, number>> = {};
    const totals: Record<string, number> = {};

    transactions.forEach(txn => {
      const dateKey = txn.createdAt ? new Date(txn.createdAt).toDateString() : 'Unknown';
      txn.products?.forEach((product: Product) => {
        const type = product?.type;
        if (!type) {
          return;
        }
        // same counting rule as cardTotalDonut pipe: donut by itemQuantity, others by entry count
        const qty = type === 'donut' ? product.itemQuantity || 0 : 1;
        byDate[dateKey] ??= {};
        byDate[dateKey][type] = (byDate[dateKey][type] ?? 0) + qty;
        totals[type] = (totals[type] ?? 0) + qty;
      });
    });

    this.monitoringReport = Object.entries(byDate)
      .map(([date, types]) => ({ date: new Date(date), types }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    this.monitoringTypeTotals = totals;
  }

  onChangePaymentTab(tab: string) {
    this.currentPaymentTab = tab;
    if (this.currentPaymentTab === 'All') {
      this.filteredPaymentMethod = this.salesReport;
      return;
    } else {
      this.filteredPaymentMethod = this.salesReport.filter((item: any) => {
        return item.paymentMethod.toLowerCase() === tab.toLowerCase();
      })
    }

  }

  check() {
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

      // Find matching products for each ID; drop unmatched ids (deleted/missing products)
      const saleProducts = productIds
        .map((pid: number) => products.find(prod => prod.id === pid))
        .filter((p): p is Product => !!p);

      return {
        ...sale,
        products: saleProducts // attach full product objects
      };
    });

    return mergedReport
  }

  getSummaryTotalSoldProducts() {

    const totals = this.summarizeSalesReport.reduce((acc, staff) => {
      staff.salesProducts.forEach((product: any) => {
        if (!acc[product.type]) {
          acc[product.type] = 0;
        }
        acc[product.type] += product.totalSoldItem;
      });
      return acc;
    }, {} as Record<string, number>);
    return totals;
  }

  summarizeTotalSoldProducts: any = {};

  onSearchClicked() {
    if (this.selectedDate) {
      this.selectedStaffSummaryTab = '';
      this.selectedStaffSummaryReport = null;
      forkJoin([
        this.apiService.getSalesReportFor(this.selectedDate),
        this.dashboardService.getAllProducts(),
      ]).subscribe({
        next: ([salesReport, products]) => {
          // console.log('product: ' , this.findProductByProductId((salesReport.data)));
          const product = this.findProductByProductId((salesReport.data))

          // this.salesReport = salesReport.data;
          this.salesReport = this.mergeSalesRecordAndProducts(salesReport.data, products.data);
          ;
          this.summarizeReport(salesReport.data);
          // this.filteredPaymentMethod = this.salesReport.filter((item: any) => {
          //   return item.paymentMethod.toLowerCase() === this.currentPaymentTab.toLowerCase();
          // })
          const mergedRecord = this.mergeSalesRecordAndProducts(this.salesReport, products.data);

          this.summarizeSalesReport = this.summarizeSales(mergedRecord);
          this.summarizeTotalSoldProducts = this.getSummaryTotalSoldProducts();
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

  getProductDetailById(productId: string) {
    const product = this.productsList.find((p: any) => p.id === Number(productId));
    return product;
  }

  findProductByProductId(data: any[]) {
    if (data && data.length > 0) {
      const updatedData = data.map(d => {
        const productList: any[] = [];
        d.productsId.split(',').map((pid: string) => {
          const product = this.getProductDetailById(pid);
          productList.push(product);
        })
        return {
          ...d,
          products: productList
        }
      })

      return updatedData;
    }
    return [];
    // const id = productId.split(',').map((pid: string) => Number(pid.trim()));
    // console.log('id: ' , id);
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
      const typesInTxn: Set<string> = new Set(products.map((p: Product) => p?.type));

      products.forEach((product: Product) => {
        const type = product?.type;

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

  productItemDetails: any[] = [];
  onProducListClicked(item: any) {
    this.productItemDetails = [];
    this.apiService.getProductItemProductRecordBySalesId(item.id).subscribe(res => {
      if (res.data && res.data.length) {
        const productItems = res.data;
        productItems.forEach((item: any) => {
          const product = this.productsList.find(p => p.id == item.productId);
          if (product) {
            const productName = product.name;
            const itemIds = item?.itemIds?.split(",");
            let itemName: any[] = [];
            itemIds?.forEach((item: any) => {
              const product = this.productItems.find(p => p.id == item);

              itemName.push(product);

            });
            const detail = {
              name: productName,
              productItems: itemName
            }
            this.productItemDetails.push(detail);
          }
        });
      }
    })
    this.isProductListDialogVisible = true;
  }

  closeProductListDialog() {
    this.isProductListDialogVisible = false;
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
    data = data.filter(item => item.productsId) // to remove the underfined productsId from the sales report
    
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

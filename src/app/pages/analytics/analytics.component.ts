import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProductItem } from '../../core/interfaces/interface';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TodayComponent } from './today/today.component';
import { DatePickerModule } from 'primeng/datepicker';
import { ApiService } from '../../core/apis/api.service';
import { jsPDF } from 'jspdf';
import { PrintService } from '../../core/services/print.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, TabsModule, DatePickerModule, FormsModule,
    CardModule, ButtonModule, DialogModule, FloatLabelModule, TodayComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {

  constructor(private http: HttpClient, private fb: FormBuilder, private analyticsService: AnalyticsService,
    private apiService: ApiService, private printService: PrintService) { }
  private bridgeUrl = 'http://localhost:3000/print';

  displayAddProductDialog = false;
  addProductForm!: FormGroup;
  startDate: Date | undefined = new Date();
  endDate: Date | undefined = new Date();

  ngOnInit(): void {
    this.addProductForm = this.fb.group({
      productName: ['', Validators.required],
      description: ['']
    });
  }

  onSearchClicked() {
    console.log('startDate: ', this.startDate);
    console.log('endDate: ', this.endDate);
    if (this.startDate && this.endDate) {
      this.generateFullReport()
      // this.apiService.getSalesReport(this.startDate, this.endDate).subscribe(res => {
      //   console.log('res; ', res);
      // })
    }

  }
  printText(text: string) {
    return this.http.post(this.bridgeUrl, text, {
      headers: new HttpHeaders({ 'Content-Type': 'text/plain' }),
      responseType: 'text'
    });
  }

  printNow() {
    this.printService.printReceipt();
    // const printWindow = window.open('', '_blank');
  
    // if (printWindow) {
    //   printWindow.document.write(`
    //     <!DOCTYPE html>
    //     <html>
    //     <body>
    //       <h1>Printing Report...</h1>
    //     </body>
    //     </html>
    //   `);
  
    //   printWindow.document.close();
  
    //   setTimeout(() => {
    //     printWindow.print();
    //   }, 1000);
    // }
  }

  testPrint() {

    const doc = new jsPDF();
    doc.text('Hello, World!', 10, 10);
    doc.save('Hello_World.pdf');
    this.printText('Hello, World!').subscribe(response => {
      console.log('Print response:', response);

    }, error => {
      console.error('Print error:', error);
    }
    )
  }
  // ESC/POS binary (ArrayBuffer)
  printEscPos(text: string) {
    const encoder = new TextEncoder();
    const txtBytes = encoder.encode(text);
    const init = new Uint8Array([0x1B, 0x40]); // ESC @
    const cut = new Uint8Array([0x1D, 0x56, 0x41]); // cut
    const payload = new Uint8Array(init.length + txtBytes.length + cut.length);
    payload.set(init, 0);
    payload.set(txtBytes, init.length);
    payload.set(cut, init.length + txtBytes.length);
    return this.http.post(this.bridgeUrl, payload.buffer, {
      headers: new HttpHeaders({ 'Content-Type': 'application/octet-stream' }),
      responseType: 'text'
    });
  }

  addProduct() {
    this.displayAddProductDialog = true;
  }

  closeAddProductDialog() {
    this.displayAddProductDialog = false;
    this.addProductForm.reset();
  }

  onConfirmAddProduct(): void {
    if (this.addProductForm.valid) {
      const productData = this.addProductForm.value;
      const productItem: ProductItem = {
        name: productData.productName,
        description: productData.description
      }
      this.analyticsService.addNewProductItem(productItem);
      console.log('Product added:', productData);
      this.closeAddProductDialog();
    }
  }

  generateFullReport() {
    if (!this.startDate || !this.endDate) {
      console.error('Start date and end date must be selected.');
      return;
    }

    this.apiService.getSalesReport(this.startDate, this.endDate).subscribe((salesData: any) => {
      const grossSales = salesData.data.reduce((sum: any, sale: any) => sum + sale.totalPrice, 0);

      const salesByDate: { [key: string]: number } = {};
      salesData.data.forEach((sale: any) => {
        const date = new Date(sale.createdAt).toISOString().split('T')[0]; // Extract date part
        salesByDate[date] = (salesByDate[date] || 0) + sale.totalPrice;
      });

      const doc = new jsPDF();

      // Add header with blue background
      doc.setFillColor(70, 130, 180); // Steel blue color
      doc.rect(0, 0, 210, 30, 'F'); // Full-width rectangle
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255); // White text
      doc.text('Hey Donuts', 10, 15);
      doc.setFontSize(12);
      doc.text(`Gross Sales: RM${grossSales.toFixed(2)}`, 10, 25);
      doc.text(`Date Range: ${this.startDate?.toDateString()} - ${this.endDate?.toDateString()}`, 120, 25);

      // Add content below the header
      doc.setTextColor(0, 0, 0); // Black text
      doc.setFontSize(14);
      let yPosition = 40;
      doc.text('Sales by Date:', 10, yPosition);
      yPosition += 10;

      doc.setFontSize(10); // Smaller font for sales-by-date section
      Object.keys(salesByDate).forEach(date => {
        doc.text(`${date}: RM${salesByDate[date].toFixed(2)}`, 10, yPosition);
        yPosition += 6; // Smaller line spacing
      });

      // Save the PDF
      doc.save('Sales_Report.pdf');
    }, error => {
      console.error('Error fetching sales data:', error);
    });
  }

}
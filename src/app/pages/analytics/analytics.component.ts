import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, TabsModule, CardModule, ButtonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {

  testPrint() {
    console.log('test print');
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow?.document.write(`
    <html>
      <body onload="window.print();window.close()">
        <pre>
          TEST RECEIPT
          -------------
          Item 1   RM 5.00
          Item 2   RM 3.00
          -------------
          Total    RM 8.00
        </pre>
      </body>
    </html>
  `);
    printWindow?.document.close();
  }

}

import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  
  constructor(private http: HttpClient) { }
  private bridgeUrl = 'http://127.0.0.1:3000/print';

  
  printText(text: string) {
    return this.http.post(this.bridgeUrl, text, {
      headers: new HttpHeaders({ 'Content-Type': 'text/plain' }),
      responseType: 'text'
    });
  }
  testPrint() {
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
    const cut  = new Uint8Array([0x1D, 0x56, 0x41]); // cut
    const payload = new Uint8Array(init.length + txtBytes.length + cut.length);
    payload.set(init, 0);
    payload.set(txtBytes, init.length);
    payload.set(cut, init.length + txtBytes.length);
    return this.http.post(this.bridgeUrl, payload.buffer, {
      headers: new HttpHeaders({ 'Content-Type': 'application/octet-stream' }),
      responseType: 'text'
    });
  }
  
  
}
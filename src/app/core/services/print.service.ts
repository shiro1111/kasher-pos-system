import { Injectable } from '@angular/core';
import * as pako from 'pako';
import { Cart } from '../interfaces/interface';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() { }


  getDateNow(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = now.getFullYear();
    const formattedDate =  `${day}-${month}-${year}`;

    // Format Time: 12-hour format with am/pm
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    const formattedTime = `${String(hours).padStart(2, '0')}:${minutes}${ampm}`;

    return `${formattedDate} ${formattedTime}`;
  }

  printReceipt(orderData?: Cart | null, invoiceNumber?: number) {
    const date = this.getDateNow();    
    // 1. Setup header layout
    let receiptText =
      "[L]<font size='big'><b>DOSE Hey Donuts</b></font>\n" +
      "[L]<font><b>Selayang Mall</b></font>\n" +
      `[L]Date: ${date} `+ 
      `[L]Inv: #${invoiceNumber}\n` +
      "[L]--------------------------------\n" +
      "[L]<b>Item</b>[R]<b>Price</b>\n" +
      "[C]--------------------------------\n";

    // 2. Loop through each product dynamically
    orderData?.products.forEach((product: any) => {
      // Print main item name and price (formatting price to 2 decimal places)
      receiptText += `[L]${product.name} [R]RM${product.price.toFixed(2)}\n`;

      // Check if item contains sub-products (like choices inside a combo box)
      if (product.productItems && product.productItems.length > 0) {
        product.productItems.forEach((subItem: any) => {
          // Render indented sub-items with a '-' mark for clear receipt layout
          receiptText += `[L] - ${subItem.productName}\n`;
        });
      }
    });

    // 3. Append footer elements
    receiptText +=
      "[C]--------------------------------\n" +
      `[R]Subtotal RM${orderData?.totalPrice.toFixed(2)}\n` +
      `[L]Payment: ${orderData?.paymentMethod.toUpperCase()}\n` +
      "[L]Thank you! Visit again\n\n\n";

    // 4. Compress and send to POSBridge
    try {
      const buffer = pako.gzip(receiptText, { level: 9 });
      let base64String = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const urlSafeBase64 = base64String
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      window.location.href = `pos-bridge://print?print-data=${urlSafeBase64}`;
    } catch (error) {
      console.error('POSBridge encoding failed:', error);
    }
  }
}

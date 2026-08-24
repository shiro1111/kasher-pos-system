import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { Button } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumber } from 'primeng/inputnumber';
import { PopoverModule } from 'primeng/popover';
import { SplitButtonModule } from 'primeng/splitbutton';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnalyticsService } from '../../../../core/services/analytics.service';
import { ProductItem } from '../../../../core/interfaces/interface';

@Component({
  selector: 'app-product-summary-record',
  standalone: true,
  imports: [PopoverModule, CommonModule, Button, InputNumber,
    SplitButtonModule, FormsModule, ProductSummaryRecordComponent,
    DividerModule, AccordionModule, DialogModule, ReactiveFormsModule],
  templateUrl: './product-summary-record.component.html',
  styleUrl: './product-summary-record.component.scss'
})
export class ProductSummaryRecordComponent {
  @Input('product') product: any | null = null;
  itemName: string = '';
  totalItems: number = 0;
  lastTotalItems: number = 0;
  newItem: number = 0;
  waste: number = 0;
  closingAmount: number = 0;
  isClosing: boolean = false;
  totalClosing: number = 0;
  totalSold: number = 0;

  private holdStartTime: number | null = null;
  private holdThreshold = 2000;
  private isHeldTooLong = false;
  settingSplitButtonItems: any[] = [];
  addSplitButtonItem: any[] = [];
  wasteSplitButtonItems: any[] = [];
  displayClosingDialog: boolean = false;
  closingForm!: FormGroup;

  constructor(private fb: FormBuilder, private anaylticsService: AnalyticsService) {
    this.setSplitButton();

    this.closingForm = this.fb.group({
      closingDonuts: ['', Validators.required]
    });

  }

  ngOnInit() {
    console.log('product: ', this.product);

  }

  addNewItem() {
    this.newItem += 1;
    this.totalItems += 1;
  }

  addWaste() {
    this.waste += 1;
    this.totalItems -= 1;
  }
  onClosing() {
    this.totalSold = this.totalItems - this.totalClosing;
    this.isClosing = true;
  }

  setSplitButton() {

    this.settingSplitButtonItems = [
      {
        label: 'Undo add new donut',
        icon: 'pi pi-refresh',
        command: () => {
          this.newItem -= 1;
          this.totalItems -= 1;
        },
      },
      {
        label: 'Undo waste',
        icon: 'pi pi-refresh',
        command: () => {
          this.waste -= 1;
          this.totalItems += 1;
        },
      },

      {
        separator: true,
      },
      {
        label: 'Closing',
        icon: 'pi pi-power-off',
        command: () => {
          this.displayClosingDialog = true; // Show the dialog
        },
      },
    ];
  }

  onHoldStart() {
    this.holdStartTime = Date.now();
    console.log('hold start');

    this.isHeldTooLong = false;
  }

  onHoldEnd() {
    if (this.holdStartTime) {
      const holdDuration = Date.now() - this.holdStartTime;
      console.log('hold end');


      if (holdDuration >= this.holdThreshold) {
        this.newItem--; // held for 2s → reduce once
        this.isHeldTooLong = true;
      }

      this.holdStartTime = null;
    }
  }

  closeClosingDialog() {
    this.displayClosingDialog = false;
    this.closingForm.reset();
  }

  confirmClosing() {
    if (this.closingForm.valid) {
      const closingData = this.closingForm.value;
      console.log('Closing data:', closingData);
      this.closeClosingDialog();
    }
  }

  popoverMode: 'closing' | 'new' | 'waste' | null = null;
  setPopoverMode(mode: 'closing' | 'new' | 'waste') {
    this.popoverMode = mode;
  }
}

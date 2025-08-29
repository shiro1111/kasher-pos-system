import { Component } from '@angular/core';
import { InventoryService } from '../../core/services/inventory.service';
import { Inventory } from '../../core/interfaces/interface';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ApiService } from '../../core/apis/api.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, InputNumberModule, ButtonModule, SelectModule, ReactiveFormsModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent {
  inventoryList: Inventory[] = [];
  isShowSideDetail: boolean = false;
  formGroup! : FormGroup; 
  constructor(private inventoryService: InventoryService, private alertService: AlertService,
    private fb: FormBuilder, private apiService: ApiService){}

  
  ngOnInit() {
    this.getInventoryData();
    this.initForm();
  }

  initForm() {
    this.formGroup = this.fb.group({
      stock: ['', Validators.required],
      quantity: ['', Validators.required]

    })
  }
  getInventoryData() {
    this.inventoryService.getInventoryData().subscribe(res => {
      if (res) {
        this.inventoryList = res.data as Inventory[];
      }
    })
  }

  openSideDetail(mode: string) {
    this.isShowSideDetail = !this.isShowSideDetail;
  }

  onConfirmBtnClickeed() {
    const inventory = this.formGroup.controls['stock'].value as Inventory;
    const quantity = this.formGroup.controls['quantity'].value;
    const newQuantity = inventory.quantity + quantity;
    
    this.apiService.updateInventory(inventory, newQuantity).subscribe({
      next: (res) => {
        this.alertService.showSuccess('Update successfully', 'Your inventory have been updated!')
        this.getInventoryData();
        this.formGroup.reset();
        this.isShowSideDetail = false;
        this.alertService.showSuccess('Success add new stock!')
      },
      error: () => {
        this.alertService.showError('Failed', 'Please try again later')
        // todo: need to handle error
      }
    }
    );
    
  }
}

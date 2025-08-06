import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private messageService: MessageService
  ) { }

  showSuccess(title: string, desc?: string) {
    this.messageService.add({ severity: 'success', summary: title, detail: desc ? desc : '' });
  }
  
  showError(title: string, desc?: string) {
    this.messageService.add({ severity: 'error', summary: title, detail: desc ? desc : '' });
  }

}

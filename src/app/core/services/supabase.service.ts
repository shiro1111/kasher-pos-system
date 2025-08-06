import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Environment } from '../../../../environments/environment';
import { Cart, CashRecordRequest, Inventory, Staff } from '../interfaces/interface';


enum TABLE {
  STAFF = 'staff',
  INVENTORY = 'inventory',
  CASH_RECORD = 'cash_record',
  PRODUCTS = 'products',
  ATTENDANCE_RECORD = 'attendance_record',
  SALES_REPORT = 'sales_report'
}
const ALL = '*';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private static ALL = '*';
  private supabase: SupabaseClient;


  constructor() {
    this.supabase = createClient(Environment.supabaseUrl, Environment.apiKey);
  }

  getAllStaff() {
    return this.supabase
      .from(TABLE.STAFF)
      .select(ALL);
  }

  getInventoryData() {
    return this.supabase.from(TABLE.INVENTORY).select(ALL);
  }

  getInventoryQuantityAndIdAndType() {
    return this.supabase.from(TABLE.INVENTORY).select('id,quantity,type')
  }

  getPackagingList() {
    return this.supabase.from(TABLE.INVENTORY).select('id,name').eq('type', 'box');
  }

  getInventoryFor(type: string) {
    return this.supabase.from(TABLE.INVENTORY).select('type,quantity')
      .eq('type', type);
  }

  updateInventory(inventory: Inventory, newQuantity: number) {
    return this.supabase
      .from(TABLE.INVENTORY).update({ quantity: newQuantity })
      .eq('id', inventory.id)
  }

  getLatestCashAmount() {
    return this.supabase
      .from(TABLE.CASH_RECORD)
      .select('total_amount')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
  }

  getAllProducts() {
    return this.supabase
      .from(TABLE.PRODUCTS)
      .select(ALL)
  }

  getSalesReportFor(startDate: Date, endDate: Date) {
    console.log('Start UTC:', startDate.toISOString());
    console.log('End UTC:', endDate.toISOString());
    return this.supabase
      .from(TABLE.SALES_REPORT)
      .select(ALL)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());
  }

  async addNewCashRecord(data: CashRecordRequest) {
    const { error, data: result } = await this.supabase
      .from(TABLE.CASH_RECORD)
      .insert([{
        total_amount: data.totalAmount,
        remark: data.remark,
        created_by: data.createdBy,
        record_amount: data.recordAmount,
        record_from: data.recordFrom
      }]);

    if (error) {
      console.error('Insert failed:', error);
      throw error;
    }
    return true;
  }

  async addNewSalesRecord(cart: Cart) {
    const { error, data: result } = await this.supabase
      .from(TABLE.SALES_REPORT)
      .insert([{
        created_by: cart.createdBy,
        payment_method: cart.paymentMethod,
        total_price: cart.totalPrice,
      }]);

    if (error) {
      console.error('Insert failed:', error);
      throw error;
    }
    return true;
  }

  async clockInToAttendanceRecord(staff: Staff) {
    const { error, data: result } = await this.supabase
      .from(TABLE.ATTENDANCE_RECORD)
      .insert([{
        in_work: true,
        staff_id: staff.staffId,
        staff_name: staff.staffName,
      }]);

    if (error) {
      console.error('Insert failed:', error);
      throw error;
    }
    return true;
  }

  getInWorkAttendanceRecordById(staffId: string) {
    return this.supabase
      .from(TABLE.ATTENDANCE_RECORD)
      .select('in_work')
      .eq('staff_id', staffId)
      .order('clock_in', { ascending: false }) // sort latest first
      .limit(1); // only the latest record
  }


  async clockOutToAttendanceRecord(staffId: string, dateTime: Date) {
    const { error, data: result } = await this.supabase
      .from(TABLE.ATTENDANCE_RECORD)
      .update({ in_work: false, 'clock_out': dateTime }).eq('staff_id', staffId);

    if (error) {
      console.error('Insert failed:', error);
      throw error;
    }
    return true;
  }
}

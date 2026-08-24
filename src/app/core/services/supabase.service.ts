import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Environment } from '../../../../environments/environment';
import { Cart, CashRecordRequest, Inventory, ProductItem, Staff, WalletRecordRequest } from '../interfaces/interface';


enum TABLE {
  STAFF = 'staff',
  INVENTORY = 'inventory',
  CASH_RECORD = 'cash_record',
  WALLET_RECORD = 'wallet_record',
  PRODUCTS = 'products',
  ATTENDANCE_RECORD = 'attendance_record',
  SALES_REPORT = 'sales_report',
  PRODUCT_ITEMS = 'product_items',
  PRODUCT_SUMMARY = 'product_summary',
  PRODUCT_DAILY_RECORD = 'product_daily_record',
  SALES_PRODUCT_ITEMS = 'sales_product_items',
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

  getCashRecordHistory() {
    return this.supabase
      .from(TABLE.CASH_RECORD)
      .select(ALL)
      .limit(5)
      .order('created_at', { ascending: false });
  }


  getCashRecordHistoryPaginated(from: number, to: number) {
    return this.supabase
      .from(TABLE.CASH_RECORD)
      .select(ALL)
      .order('created_at', { ascending: false }) // latest first
      .range(from, to);
  }

  getCashRecordHistoryByDate(dateFrom: Date, dateTo: Date) {
    // Convert Dates to ISO strings so Supabase can read them correctly
    const fromStr = dateFrom.toISOString();
    const toStr = dateTo.toISOString();
  
    return this.supabase
      .from(TABLE.CASH_RECORD)
      .select(ALL)
      .gte('created_at', fromStr)
      .lte('created_at', toStr)
      .order('created_at', { ascending: false }); // latest first
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

  getProductItems() {
    return this.supabase.from(TABLE.INVENTORY).select('id,name').eq('type', 'box');
  }

  getPackagingList() {
    return this.supabase.from(TABLE.INVENTORY).select('id,name').eq('type', 'box');
  }

  getSalesProductItem(startDate: string, endDate: string) {
    return this.supabase.from(TABLE.SALES_PRODUCT_ITEMS)
      .select(ALL)
      .gte('created_at', startDate)
      .lt('created_at', endDate);
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

  getProductItemProductRecordBySalesId(id: number) {
    return this.supabase
      .from(TABLE.SALES_PRODUCT_ITEMS)
      .select(ALL)
      .eq('sales_id', id);
  }

  getLatestWalletAmount() {
    return this.supabase
      .from(TABLE.WALLET_RECORD)
      .select('total_amount')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
  }

  getAllProducts() {
    return this.supabase
      .from(TABLE.PRODUCTS)
      .select(ALL)
  }

  getSalesReportByStaff(staff: Staff, startDate?: Date, endDate?: Date) {
    return this.supabase
      .from(TABLE.SALES_REPORT)
      .select('created_at,total_price,payment_method,products_id,created_by')
      .eq('created_by', staff.staffName)
      .gte('created_at', startDate?.toISOString())
      .lt('created_at', endDate?.toISOString());
  }

  getSalesReportFor(startDate: Date, endDate: Date) {
    return this.supabase
      .from(TABLE.SALES_REPORT)
      .select(ALL)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });
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

  async addNewProductItem(item: ProductItem) {
    const { error, data: result } = await this.supabase
      .from(TABLE.PRODUCT_ITEMS)
      .insert([{
        product_name: item.name,
        product_desc: item.description,
      }]);

    if (error) {
      console.error('Insert failed:', error);
      throw error;
    }
    return true;
  }

  getAllProductItems() {
    return this.supabase
      .from(TABLE.PRODUCT_ITEMS)
      .select(ALL)
  }

  getDailyProductRecordForToday() {
    const today = new Date().toISOString().split('T')[0];
    console.log('today: ', today);

    return this.supabase
      .from(TABLE.PRODUCT_DAILY_RECORD)
      .select(ALL)
      .eq('record_date', new Date().toISOString().split('T')[0]);
  }

  getProductSummary() {
    return this.supabase
      .from(TABLE.PRODUCT_SUMMARY)
      .select(ALL)
  }

  async addNewWalletRecord(walletRecord: WalletRecordRequest, cashRecord: CashRecordRequest) {
    try {
      // await this.addNewCashRecord(cashRecord); // save to cash record first
      const walletAmount = await this.getLatestWalletAmount();
      const dataWallet = walletAmount['data'];
      const totalAmount = dataWallet?.total_amount ?? 0;

      // const cleanRecord = JSON.parse(JSON.stringify(cashRecord));
      // const lastDrawer = Number(cleanRecord.totalAmount);
      // const walletAmt = Number(cleanRecord.walletAmount);
      // const currentAmt = Number(cleanRecord.currentAmount);
      // const transferAmt = Number(cleanRecord.transferAmount);

      // 3. Send to Supabase
      const { error, data } = await this.supabase
        .from(TABLE.WALLET_RECORD)
        .insert([
          {
            created_by: walletRecord.createdBy,
            total_amount: totalAmount + walletRecord.recordAmount,
            transfer_amount: walletRecord.recordAmount,
          }
        ])
        .select();

      if (error) {
        console.error('Insert failed:', error);
        throw error;
      }

      return data;
    } catch (err) {
      console.error("Transaction failed inside saveToWallet:", err);
      return false;
    }
  }

  async addNewSalesRecord(cart: Cart, stringId: string) {
    const { error, data } = await this.supabase
      .from(TABLE.SALES_REPORT)
      .insert([
        {
          created_by: cart.createdBy,
          payment_method: cart.paymentMethod,
          total_price: cart.totalPrice,
          products_id: stringId,
        }
      ])
      .select();

    if (error) {
      console.error('Insert failed:', error);
      throw error;
    }

    return data;
  }

  async addNewProductItemsRecord(salesProduct: any) {
    const { error, data } = await this.supabase
      .from(TABLE.SALES_PRODUCT_ITEMS)
      .insert([
        {
          sales_id: salesProduct.id,
          item_ids: salesProduct.itemsId,
          product_id: salesProduct.productId,
          created_by: salesProduct.createdBy,
          total_price: salesProduct.totalPrice
        }
      ])
    if (error) {
      console.error('Insert failed:', error);
      throw error;
    }

    return data;
  }

  // async addNewSalesRecord(cart: Cart, stringId: string) {
  //   const { error, data: result } = await this.supabase
  //     .from(TABLE.SALES_REPORT)
  //     .insert([{
  //       created_by: cart.createdBy,
  //       payment_method: cart.paymentMethod,
  //       total_price: cart.totalPrice,
  //       products_id: stringId,

  //     }]);

  //   if (error) {
  //     console.error('Insert failed:', error);
  //     throw error;
  //   }
  //   return true;
  // }

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

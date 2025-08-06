export enum SideNavStatus {
    MAX = 'MAX',
    MIN = 'MIN'
} 

export enum CategoryId {
    ALL = 'all',
    DONUT = 'donut',
    DESSERT = 'dessert',
    DRINK = 'drink'

}
export interface Category {
    id: string,
    name: string,
    noOfItems: number,
    icon?: string,
}

export interface Product {
    id: string,
    name: string, 
    price: number,
    type: string,
    cartId?: number,
    itemQuantity: number
}

export interface Staff {
    staffId: string,
    staffName: string,
    password?: string
}

export enum LoggedStatus {
    CLOCK_IN = 'CLOCK_IN',
    CLOCK_OUT = 'CLOCK_OUT',
}

export interface Inventory {
    id: number,
    name: string,
    quantity: number,
    lastUpdate: string,
    type: string
}

export interface SBResponse {
    count: string,
    data: any,
    error: string,
    status: number
}

export interface CashRecordRequest {
    totalAmount?: number,
    remark: string, 
    createdBy: string,
    recordAmount: number,
    recordFrom: RecordFrom,
}

export type RecordFrom = 'cashIn' | 'cashOut' | 'payment';

export interface Packaging {
    id: number,
    name: string,
    cartId?: number
}

export interface Cart {
    products: Product[],
    packaging: Packaging[],
    totalPrice: number,
    paymentMethod: string,
    createdBy: string
} 

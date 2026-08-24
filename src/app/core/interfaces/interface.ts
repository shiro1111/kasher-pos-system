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

export interface ProductItem {
    id?: string,
    name: string,
    description: string
}

export interface Item {
    id: number,
    productName: string,
    productDesc: string,
    type: string,
    price: number,
    cartId?: string,
    isPremium: boolean
}

export interface SalesProductItem {
    id: number,
    createdAt: string,
    itemIds: string,
    productId: number,
    salesId: number,
    itemDetail?: any[],
    createdBy: string,
    totalPrice: number
}

export interface Product {
    id: number,
    name: string,
    price: number,
    type: string,
    cartId?: number,
    itemQuantity: number,
    enable: boolean,
    productItems?: any[],
    productItemsIds?: string
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
    walletAmount?: number,
    currentAmount?: number,
    transferAmount?: number
}

export interface WalletRecordRequest {
    totalAmount: number,
    createdBy: string,
    recordAmount: number,
}

export type RecordFrom = 'cashIn' | 'cashOut' | 'payment' | 'saveToWallet';

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

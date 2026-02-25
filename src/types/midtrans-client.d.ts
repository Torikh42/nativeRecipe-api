declare module "midtrans-client" {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface CustomerDetails {
    email: string;
    phone: string;
    first_name: string;
    last_name?: string;
  }

  interface Callbacks {
    finish: string;
    error?: string;
    pending?: string;
  }

  interface PaymentParameters {
    transaction_details: TransactionDetails;
    customer_details: CustomerDetails;
    enabled_payments?: string[];
    callbacks?: Callbacks;
    item_details?: any[];
    shipping_address?: any;
    billing_address?: any;
  }

  interface SnapResponse {
    token: string;
    redirect: string;
  }

  class Snap {
    constructor(options: SnapOptions);
    createTransaction(parameters: PaymentParameters): Promise<SnapResponse>;
  }

  class CoreApi {
    constructor(options: TransactionOptions);
    charge(parameters: any): Promise<any>;
    capture(parameters: any): Promise<any>;
    transactionStatus(orderId: string): Promise<any>;
    cancelTransaction(orderId: string): Promise<any>;
    approveTransaction(orderId: string): Promise<any>;
  }

  export { Snap, CoreApi };
  export default { Snap, CoreApi };
}

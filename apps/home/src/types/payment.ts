export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'canceled';
  clientSecret: string;
  paymentMethodId?: string;
  created: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billingDetails: {
    name: string;
    email: string;
  };
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  invoicePdf: string;
  hostedInvoiceUrl: string;
  created: number;
  dueDate: number;
  subscriptionId: string;
} 
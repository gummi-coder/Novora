import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentIntent, PaymentMethod } from '../types/payment';

const API_URL = import.meta.env.VITE_API_URL;
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export const paymentService = {
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    const response = await axios.post(`${API_URL}/payments/create-intent`, {
      amount,
      currency
    });
    return response.data;
  },

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentIntent> {
    const response = await axios.post(`${API_URL}/payments/confirm`, {
      paymentIntentId,
      paymentMethodId
    });
    return response.data;
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await axios.get(`${API_URL}/payments/methods`);
    return response.data;
  },

  async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    const response = await axios.post(`${API_URL}/payments/methods`, {
      paymentMethodId
    });
    return response.data;
  },

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    await axios.delete(`${API_URL}/payments/methods/${paymentMethodId}`);
  },

  async getInvoices(): Promise<any[]> {
    const response = await axios.get(`${API_URL}/payments/invoices`);
    return response.data;
  },

  getStripeInstance() {
    return stripePromise;
  }
}; 
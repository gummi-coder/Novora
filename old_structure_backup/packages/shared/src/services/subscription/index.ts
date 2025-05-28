import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { AuthError } from '../auth/errors';
import { logger } from '../../infrastructure/logging';
import { prisma } from '../../lib/prisma';
import { Plan, Subscription, BillingHistory, PaymentMethod, SubscriptionLimits } from '../../types/subscription';

const prismaClient = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export interface SubscriptionPlan {
  id: string;
  name: 'FREE' | 'PRO' | 'ENTERPRISE';
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    teams: number;
    dashboards: number;
    members: number;
    storage: number;
  };
}

export class SubscriptionService {
  private static instance: SubscriptionService;
  private stripe: Stripe;

  private constructor() {
    this.stripe = stripe;
  }

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  public getPlans(): Plan[] {
    return [
      {
        id: 'free',
        name: 'Free',
        type: 'FREE',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: ['Basic dashboard', 'Limited analytics', '1 team'],
        limits: {
          teams: 1,
          dashboards: 3,
          members: 5,
          widgets: 10,
          storage: 100,
          apiCalls: 1000
        }
      },
      {
        id: 'pro',
        name: 'Pro',
        type: 'PRO',
        price: 29,
        currency: 'USD',
        interval: 'month',
        features: ['Advanced analytics', 'Multiple teams', 'Custom widgets'],
        limits: {
          teams: 3,
          dashboards: 10,
          members: 20,
          widgets: 50,
          storage: 1000,
          apiCalls: 10000
        }
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        type: 'ENTERPRISE',
        price: 99,
        currency: 'USD',
        interval: 'month',
        features: ['Unlimited everything', 'Priority support', 'Custom integrations'],
        limits: {
          teams: -1, // unlimited
          dashboards: -1,
          members: -1,
          widgets: -1,
          storage: -1,
          apiCalls: -1
        }
      }
    ];
  }

  public async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'active' }
    });
    return subscription;
  }

  public async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const customer = await prisma.customer.findUnique({
      where: { userId }
    });

    if (!customer?.stripeCustomerId) {
      return [];
    }

    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customer.stripeCustomerId,
      type: 'card'
    });

    return paymentMethods.data.map(pm => ({
      id: pm.id,
      userId,
      type: 'card',
      last4: pm.card?.last4 || '',
      brand: pm.card?.brand || '',
      expMonth: pm.card?.exp_month || 0,
      expYear: pm.card?.exp_year || 0,
      isDefault: false,
      createdAt: new Date(pm.created * 1000)
    }));
  }

  public async addPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    const customer = await prisma.customer.findUnique({
      where: { userId }
    });

    if (!customer?.stripeCustomerId) {
      throw new Error('Customer not found');
    }

    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.stripeCustomerId
    });
  }

  public async removePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    const customer = await prisma.customer.findUnique({
      where: { userId }
    });

    if (!customer?.stripeCustomerId) {
      throw new Error('Customer not found');
    }

    await this.stripe.paymentMethods.detach(paymentMethodId);
  }

  public async createSubscription(
    userId: string,
    planId: string,
    paymentMethodId: string
  ): Promise<Subscription> {
    const customer = await this.getOrCreateCustomer(userId);
    const plan = this.getPlans().find(p => p.id === planId);

    if (!plan) {
      throw new Error('Invalid plan');
    }

    const subscription = await this.stripe.subscriptions.create({
      customer: customer.stripeCustomerId,
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    return prisma.subscription.create({
      data: {
        id: subscription.id,
        userId,
        planId,
        status: subscription.status as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  }

  public async updateSubscription(
    userId: string,
    newPlanId: string
  ): Promise<Subscription> {
    const subscription = await this.getCurrentSubscription(userId);

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    const updatedSubscription = await this.stripe.subscriptions.update(
      subscription.id,
      {
        items: [{ id: subscription.id, price: newPlanId }]
      }
    );

    return prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: newPlanId,
        status: updatedSubscription.status as any,
        currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end
      }
    });
  }

  public async cancelSubscription(userId: string): Promise<void> {
    const subscription = await this.getCurrentSubscription(userId);

    if (!subscription) {
      throw new Error('No active subscription found');
    }

    await this.stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true }
    });
  }

  public async getBillingHistory(userId: string): Promise<BillingHistory[]> {
    const customer = await prisma.customer.findUnique({
      where: { userId }
    });

    if (!customer?.stripeCustomerId) {
      return [];
    }

    const invoices = await this.stripe.invoices.list({
      customer: customer.stripeCustomerId
    });

    return invoices.data.map(invoice => ({
      id: invoice.id,
      userId,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status as any,
      description: invoice.description || '',
      invoiceUrl: invoice.invoice_pdf || undefined,
      createdAt: new Date(invoice.created * 1000)
    }));
  }

  public async handleWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionChange(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handleSuccessfulPayment(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleFailedPayment(event.data.object);
        break;
    }
  }

  public async checkSubscriptionLimits(
    userId: string,
    resource: keyof SubscriptionLimits
  ): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(userId);
    const plan = subscription ? this.getPlans().find(p => p.id === subscription.planId) : this.getPlans()[0];

    if (!plan) {
      return false;
    }

    const limit = plan.limits[resource];
    if (limit === -1) {
      return true;
    }

    const usage = await this.getResourceUsage(userId, resource);
    return usage < limit;
  }

  private async getOrCreateCustomer(userId: string) {
    let customer = await prisma.customer.findUnique({
      where: { userId }
    });

    if (!customer) {
      const stripeCustomer = await this.stripe.customers.create({
        metadata: { userId }
      });

      customer = await prisma.customer.create({
        data: {
          userId,
          stripeCustomerId: stripeCustomer.id
        }
      });
    }

    return customer;
  }

  private async handleSubscriptionChange(subscription: any) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  }

  private async handleSuccessfulPayment(invoice: any) {
    // Handle successful payment logic
  }

  private async handleFailedPayment(invoice: any) {
    // Handle failed payment logic
  }

  private async getResourceUsage(userId: string, resource: keyof SubscriptionLimits): Promise<number> {
    switch (resource) {
      case 'teams':
        return prisma.team.count({ where: { userId } });
      case 'dashboards':
        return prisma.dashboard.count({ where: { userId } });
      case 'members':
        return prisma.teamMember.count({ where: { team: { userId } } });
      case 'widgets':
        return prisma.widget.count({ where: { dashboard: { userId } } });
      case 'storage':
        return prisma.file.count({ where: { userId } });
      case 'apiCalls':
        return prisma.apiLog.count({ where: { userId } });
      default:
        return 0;
    }
  }
} 
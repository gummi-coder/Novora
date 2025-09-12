import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { pricingTiers } from '@/config/pricing';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';
import { PlanComparison } from "@/components/marketing/PlanComparison";
import { TrialSignupModal } from "@/components/marketing/TrialSignupModal";

const benefits = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "Experience blazing fast performance with our optimized platform.",
  },
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: "Enterprise Security",
    description: "Bank-grade security with end-to-end encryption and compliance.",
  },
  {
    icon: <ArrowRight className="h-6 w-6" />,
    title: "Easy Integration",
    description: "Seamlessly integrate with your existing tools and workflows.",
  },
];

const faqs = [
  {
    question: "What happens after my free trial?",
    answer: "After your 14-day free trial, you can choose to upgrade to any of our paid plans. If you don't upgrade, your account will be automatically downgraded to the free tier with limited features.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.",
  },
];

export default function PricingPage() {
  const { currentTier, upgradeTier } = useSubscription();
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Choose the Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required. Upgrade or
            downgrade at any time.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => setIsTrialModalOpen(true)}>
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="flex flex-col items-center text-center p-6"
              >
                <div className="mb-4 text-primary">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan Comparison Section */}
      <section className="py-16">
        <PlanComparison />
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.question} className="space-y-2">
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust our platform.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => setIsTrialModalOpen(true)}>
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Trial Signup Modal */}
      <TrialSignupModal
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
      />

      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start with our Core plan and upgrade as your needs grow. All plans include our essential features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={cn(
                'relative transition-all duration-200',
                tier.id === 'professional' && 'border-primary shadow-lg scale-105',
                tier.id === 'basic' && 'border-muted'
              )}
            >
              {tier.id === 'professional' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </span>
                </div>
              )}
              {tier.id === 'basic' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-muted text-muted-foreground px-4 py-1 rounded-full text-sm">
                    Perfect for Starters
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-2">
                      <Check className={cn(
                        "h-5 w-5 mt-0.5",
                        tier.id === 'professional' ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <div>
                        <span className="font-medium">{feature.name}</span>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={cn(
                    "w-full",
                    tier.id === currentTier.id && "bg-muted hover:bg-muted/80"
                  )}
                  variant={tier.id === currentTier.id ? 'outline' : 'default'}
                  onClick={() => upgradeTier(tier.id)}
                  disabled={tier.id === currentTier.id}
                >
                  {tier.id === currentTier.id
                    ? 'Current Plan'
                    : tier.id === 'enterprise'
                    ? 'Contact Sales'
                    : 'Get Started'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
          <p className="text-muted-foreground mb-6">
            Contact our sales team for a tailored plan that fits your specific needs
          </p>
          <Button size="lg" variant="outline">Contact Sales</Button>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">All Plans Include</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="space-y-2">
              <h3 className="font-semibold">Core Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Basic Analytics</li>
                <li>Email Support</li>
                <li>Standard Templates</li>
                <li>Basic Reporting</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Security</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>SSL Encryption</li>
                <li>Data Backup</li>
                <li>Secure Storage</li>
                <li>Access Control</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Support</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Documentation</li>
                <li>Knowledge Base</li>
                <li>Community Forum</li>
                <li>Regular Updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
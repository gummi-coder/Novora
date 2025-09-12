import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: {
      monthly: 29,
      yearly: 290,
    },
    description: "Perfect for small teams and startups",
    features: [
      "Up to 5 team members",
      "Basic analytics",
      "Email support",
      "1GB storage",
      "Basic integrations",
    ],
    excluded: [
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
      "Team management",
      "API access",
    ],
  },
  {
    name: "Pro",
    price: {
      monthly: 99,
      yearly: 990,
    },
    description: "Ideal for growing businesses",
    features: [
      "Up to 20 team members",
      "Advanced analytics",
      "Priority support",
      "10GB storage",
      "Advanced integrations",
      "Team management",
      "API access",
    ],
    excluded: [
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantees",
    ],
  },
  {
    name: "Enterprise",
    price: {
      monthly: 299,
      yearly: 2990,
    },
    description: "For large organizations",
    features: [
      "Unlimited team members",
      "Custom analytics",
      "24/7 priority support",
      "Unlimited storage",
      "Custom integrations",
      "Advanced team management",
      "Full API access",
      "Dedicated account manager",
      "SLA guarantees",
    ],
    excluded: [],
  },
];

export function PlanComparison() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-muted-foreground mb-8">
          Select the perfect plan for your business needs
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={billingCycle === "monthly" ? "default" : "outline"}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === "yearly" ? "default" : "outline"}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
            <span className="ml-2 text-xs bg-primary-foreground text-primary px-2 py-1 rounded-full">
              Save 20%
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className="relative">
            {plan.name === "Pro" && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${plan.price[billingCycle]}
                </span>
                <span className="text-muted-foreground">/{billingCycle}</span>
              </div>
              <p className="text-muted-foreground mt-2">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.excluded.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-muted-foreground">
                      <X className="h-4 w-4" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-6">
                  {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold mb-4">Need a custom solution?</h3>
        <p className="text-muted-foreground mb-8">
          Contact our sales team for a tailored plan that fits your specific needs
        </p>
        <Button variant="outline" size="lg">
          Contact Sales
        </Button>
      </div>
    </div>
  );
} 
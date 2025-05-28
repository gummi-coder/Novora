import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { pricingTiers, features } from '@/config/pricing';
import { cn } from '@/lib/utils';

export function FeatureComparison() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4">Feature</th>
                  {pricingTiers.map((tier) => (
                    <th key={tier.id} className="text-center p-4">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr key={feature.id} className="border-t">
                    <td className="p-4">
                      <div>
                        <span className="font-medium">{feature.name}</span>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </td>
                    {pricingTiers.map((tier) => (
                      <td key={tier.id} className="text-center p-4">
                        {tier.features.some((f) => f.id === feature.id) ? (
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <div key={tier.id} className="space-y-4">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Surveys</span>
                    <span className="text-sm font-medium">
                      {tier.limits.surveys === -1 ? 'Unlimited' : tier.limits.surveys}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Team Members</span>
                    <span className="text-sm font-medium">
                      {tier.limits.teamMembers === -1 ? 'Unlimited' : tier.limits.teamMembers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage</span>
                    <span className="text-sm font-medium">
                      {tier.limits.storage}GB
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Calls</span>
                    <span className="text-sm font-medium">
                      {tier.limits.apiCalls === -1 ? 'Unlimited' : tier.limits.apiCalls}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
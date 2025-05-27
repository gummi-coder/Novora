import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TrialExpiredPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Trial Expired</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">
              Your trial period has ended. We hope you enjoyed using our platform!
            </p>
            <p>
              To continue using all features, please upgrade to a paid plan.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button asChild>
              <a href="/pricing">View Pricing Plans</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/contact">Contact Sales</a>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Need help deciding?</p>
            <p>Our team is here to help you choose the right plan for your needs.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
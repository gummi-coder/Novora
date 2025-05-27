import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, Settings, BookOpen } from 'lucide-react';
import { prisma } from '@/lib/prisma';

const onboardingSteps = [
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: 'Complete Your Profile',
    description: 'Add your company details and preferences to get started.',
    action: 'Complete Profile',
    href: '/settings/profile',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Invite Team Members',
    description: 'Collaborate with your team by inviting them to your workspace.',
    action: 'Invite Team',
    href: '/settings/team',
  },
  {
    icon: <Settings className="h-6 w-6" />,
    title: 'Configure Your Workspace',
    description: 'Set up your workspace settings and integrations.',
    action: 'Configure',
    href: '/settings/workspace',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Read Documentation',
    description: 'Learn how to make the most of your trial period.',
    action: 'View Docs',
    href: '/docs',
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [trialStatus, setTrialStatus] = useState<{
    isActive: boolean;
    daysRemaining: number;
    status: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkTrialStatus() {
      try {
        const response = await fetch('/api/auth/trial-status');
        const data = await response.json();

        if (!data.isActive) {
          router.push('/trial-expired');
          return;
        }

        setTrialStatus(data);
      } catch (error) {
        console.error('Failed to check trial status:', error);
        router.push('/error');
      } finally {
        setLoading(false);
      }
    }

    checkTrialStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!trialStatus?.isActive) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your Trial!</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Let's get you set up and ready to go.
          </p>
          {trialStatus.daysRemaining > 0 && (
            <p className="text-sm text-muted-foreground">
              Your trial expires in {trialStatus.daysRemaining} days
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {onboardingSteps.map((step) => (
            <Card key={step.title} className="relative">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="text-primary">{step.icon}</div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <Button asChild>
                  <a href={step.href}>{step.action}</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you get started.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <a href="/docs">View Documentation</a>
            </Button>
            <Button asChild>
              <a href="/support">Contact Support</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
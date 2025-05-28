import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrivacyPolicy } from '@/components/compliance/PrivacyPolicy';
import { TermsOfService } from '@/components/compliance/TermsOfService';
import { DataProcessingAgreement } from '@/components/compliance/DataProcessingAgreement';
import { ComplianceSettings } from '@/components/compliance/ComplianceSettings';

export function CompliancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance & Legal</h1>
          <p className="text-muted-foreground">
            Manage compliance settings, privacy policy, terms of service, and data processing agreements.
          </p>
        </div>

        <Tabs defaultValue="privacy" className="space-y-4">
          <TabsList>
            <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
            <TabsTrigger value="dpa">Data Processing Agreement</TabsTrigger>
            <TabsTrigger value="settings">Compliance Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="space-y-4">
            <PrivacyPolicy />
          </TabsContent>

          <TabsContent value="terms" className="space-y-4">
            <TermsOfService />
          </TabsContent>

          <TabsContent value="dpa" className="space-y-4">
            <DataProcessingAgreement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <ComplianceSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 
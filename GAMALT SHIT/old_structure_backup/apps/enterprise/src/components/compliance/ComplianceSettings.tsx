import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

export function ComplianceSettings() {
  const [settings, setSettings] = useState({
    dataRetention: {
      enabled: true,
      period: '12',
      unit: 'months',
    },
    dataExport: {
      enabled: true,
      format: 'json',
      includeMetadata: true,
    },
    auditLogging: {
      enabled: true,
      retention: '24',
      unit: 'months',
    },
    dataMinimization: {
      enabled: true,
      anonymizeAfter: '6',
      unit: 'months',
    },
    consentManagement: {
      enabled: true,
      requireExplicit: true,
      allowWithdrawal: true,
    },
    securityMeasures: {
      encryption: true,
      twoFactorAuth: true,
      sessionTimeout: '30',
      unit: 'minutes',
    },
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value,
      },
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="data" className="space-y-4">
          <TabsList>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="consent">Consent</TabsTrigger>
            <TabsTrigger value="audit">Audit & Logging</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Data Management</AlertTitle>
              <AlertDescription>
                Configure how personal data is stored, retained, and exported.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Data Retention</Label>
                  <Switch
                    checked={settings.dataRetention.enabled}
                    onCheckedChange={(checked) => handleSettingChange('dataRetention', 'enabled', checked)}
                  />
                </div>
                {settings.dataRetention.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      value={settings.dataRetention.period}
                      onChange={(e) => handleSettingChange('dataRetention', 'period', e.target.value)}
                    />
                    <Select
                      value={settings.dataRetention.unit}
                      onValueChange={(value) => handleSettingChange('dataRetention', 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Data Export</Label>
                  <Switch
                    checked={settings.dataExport.enabled}
                    onCheckedChange={(checked) => handleSettingChange('dataExport', 'enabled', checked)}
                  />
                </div>
                {settings.dataExport.enabled && (
                  <div className="space-y-2">
                    <Select
                      value={settings.dataExport.format}
                      onValueChange={(value) => handleSettingChange('dataExport', 'format', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.dataExport.includeMetadata}
                        onCheckedChange={(checked) => handleSettingChange('dataExport', 'includeMetadata', checked)}
                      />
                      <Label>Include Metadata</Label>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Data Minimization</Label>
                  <Switch
                    checked={settings.dataMinimization.enabled}
                    onCheckedChange={(checked) => handleSettingChange('dataMinimization', 'enabled', checked)}
                  />
                </div>
                {settings.dataMinimization.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      value={settings.dataMinimization.anonymizeAfter}
                      onChange={(e) => handleSettingChange('dataMinimization', 'anonymizeAfter', e.target.value)}
                    />
                    <Select
                      value={settings.dataMinimization.unit}
                      onValueChange={(value) => handleSettingChange('dataMinimization', 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Security Settings</AlertTitle>
              <AlertDescription>
                Configure security measures to protect personal data.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Data Encryption</Label>
                <Switch
                  checked={settings.securityMeasures.encryption}
                  onCheckedChange={(checked) => handleSettingChange('securityMeasures', 'encryption', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Two-Factor Authentication</Label>
                <Switch
                  checked={settings.securityMeasures.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('securityMeasures', 'twoFactorAuth', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    value={settings.securityMeasures.sessionTimeout}
                    onChange={(e) => handleSettingChange('securityMeasures', 'sessionTimeout', e.target.value)}
                  />
                  <Select
                    value={settings.securityMeasures.unit}
                    onValueChange={(value) => handleSettingChange('securityMeasures', 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="consent" className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Consent Management</AlertTitle>
              <AlertDescription>
                Configure how user consent is collected and managed.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Consent Management</Label>
                <Switch
                  checked={settings.consentManagement.enabled}
                  onCheckedChange={(checked) => handleSettingChange('consentManagement', 'enabled', checked)}
                />
              </div>

              {settings.consentManagement.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <Label>Require Explicit Consent</Label>
                    <Switch
                      checked={settings.consentManagement.requireExplicit}
                      onCheckedChange={(checked) => handleSettingChange('consentManagement', 'requireExplicit', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Allow Consent Withdrawal</Label>
                    <Switch
                      checked={settings.consentManagement.allowWithdrawal}
                      onCheckedChange={(checked) => handleSettingChange('consentManagement', 'allowWithdrawal', checked)}
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Audit & Logging</AlertTitle>
              <AlertDescription>
                Configure audit logging and retention settings.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Audit Logging</Label>
                <Switch
                  checked={settings.auditLogging.enabled}
                  onCheckedChange={(checked) => handleSettingChange('auditLogging', 'enabled', checked)}
                />
              </div>

              {settings.auditLogging.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    value={settings.auditLogging.retention}
                    onChange={(e) => handleSettingChange('auditLogging', 'retention', e.target.value)}
                  />
                  <Select
                    value={settings.auditLogging.unit}
                    onValueChange={(value) => handleSettingChange('auditLogging', 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
} 
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CDNConfig as CDNConfigType } from '@/types/cdn';

const defaultConfig: CDNConfigType = {
  provider: 'cloudflare',
  domain: '',
  apiKey: '',
  enabled: false,
  cacheControl: 'max-age=3600',
  compression: true,
  sslEnabled: true,
  regions: ['global'],
};

export function CDNConfig() {
  const [config, setConfig] = useState<CDNConfigType>(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would typically make an API call to save the configuration
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      console.log('CDN configuration saved:', config);
    } catch (error) {
      console.error('Failed to save CDN configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof CDNConfigType) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CDN Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>CDN Provider</Label>
                <Select
                  value={config.provider}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, provider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cloudflare">Cloudflare</SelectItem>
                    <SelectItem value="akamai">Akamai</SelectItem>
                    <SelectItem value="aws">AWS CloudFront</SelectItem>
                    <SelectItem value="fastly">Fastly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Domain</Label>
                <Input
                  value={config.domain}
                  onChange={(e) => setConfig(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="cdn.yourdomain.com"
                />
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter API key"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.enabled}
                  onCheckedChange={() => handleToggle('enabled')}
                />
                <Label>Enable CDN</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.sslEnabled}
                  onCheckedChange={() => handleToggle('sslEnabled')}
                />
                <Label>Enable SSL/TLS</Label>
              </div>

              <div className="space-y-2">
                <Label>Cache Control</Label>
                <Input
                  value={config.cacheControl}
                  onChange={(e) => setConfig(prev => ({ ...prev, cacheControl: e.target.value }))}
                  placeholder="max-age=3600"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.compression}
                  onCheckedChange={() => handleToggle('compression')}
                />
                <Label>Enable Compression</Label>
              </div>

              <div className="space-y-2">
                <Label>Edge Regions</Label>
                <Select
                  value={config.regions[0]}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, regions: [value] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="eu">Europe</SelectItem>
                    <SelectItem value="asia">Asia Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
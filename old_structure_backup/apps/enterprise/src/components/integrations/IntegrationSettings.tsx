import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FeatureGuard } from '@/components/common/FeatureGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Key, Upload, Download, Webhook } from 'lucide-react';

export const IntegrationSettings: React.FC = () => {
  const [ssoEnabled, setSsoEnabled] = React.useState(false);
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [showApiKey, setShowApiKey] = React.useState(false);

  const handleGenerateApiKey = () => {
    // Simulate API key generation
    setApiKey('sk_test_' + Math.random().toString(36).substring(2, 15));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Integration Settings</h1>
      </div>

      <Tabs defaultValue="sso" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sso">SSO</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
          <FeatureGuard featureId="data-export">
            <TabsTrigger value="data">Data Import/Export</TabsTrigger>
          </FeatureGuard>
        </TabsList>

        <TabsContent value="sso">
          <FeatureGuard featureId="sso" requiredTier="enterprise">
            <Card>
              <CardHeader>
                <CardTitle>Single Sign-On Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Enable SSO</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure enterprise SSO integration
                      </p>
                    </div>
                    <Switch
                      checked={ssoEnabled}
                      onCheckedChange={setSsoEnabled}
                    />
                  </div>

                  {ssoEnabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Identity Provider URL</label>
                        <Input placeholder="https://your-idp.com/sso" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Entity ID</label>
                        <Input placeholder="urn:your-entity-id" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">X.509 Certificate</label>
                        <Input type="file" accept=".pem,.cer,.crt" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </FeatureGuard>
        </TabsContent>

        <TabsContent value="api">
          <FeatureGuard featureId="api-access" requiredTier="pro">
            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">API Key</h3>
                    <div className="flex items-center gap-4">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey || ''}
                        readOnly
                        placeholder="Generate an API key to get started"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? 'Hide' : 'Show'}
                      </Button>
                      <Button onClick={handleGenerateApiKey}>
                        Generate New Key
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">API Documentation</h3>
                    <p className="text-sm text-muted-foreground">
                      View our comprehensive API documentation to learn how to integrate with our platform.
                    </p>
                    <Button variant="outline">
                      View Documentation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FeatureGuard>
        </TabsContent>

        <FeatureGuard featureId="data-export">
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Import/Export</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Import Data</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Import your data from CSV or Excel files
                      </p>
                      <div className="flex items-center gap-4">
                        <Input type="file" accept=".csv,.xlsx" />
                        <Button>
                          <Upload className="w-4 h-4 mr-2" />
                          Import
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Export Data</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Export your data in various formats
                      </p>
                      <div className="flex items-center gap-4">
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export Excel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </FeatureGuard>
      </Tabs>
    </div>
  );
}; 
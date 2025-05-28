import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CacheManager } from '@/components/infrastructure/CacheManager';
import { CDNConfig } from '@/components/infrastructure/CDNConfig';
import { DatabaseIndexManager } from '@/components/infrastructure/DatabaseIndexManager';
import { BackupManager } from '@/components/infrastructure/BackupManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InfrastructurePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Infrastructure</h1>
          <p className="text-muted-foreground">
            Manage system infrastructure, caching, CDN, backups, and performance settings.
          </p>
        </div>

        <Tabs defaultValue="cache" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cache">Cache Management</TabsTrigger>
            <TabsTrigger value="cdn">CDN Configuration</TabsTrigger>
            <TabsTrigger value="database">Database Indexes</TabsTrigger>
            <TabsTrigger value="backup">Backup System</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="cache" className="space-y-4">
            <CacheManager />
          </TabsContent>

          <TabsContent value="cdn" className="space-y-4">
            <CDNConfig />
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <DatabaseIndexManager />
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <BackupManager />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Performance settings and optimizations will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  System monitoring and metrics will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 
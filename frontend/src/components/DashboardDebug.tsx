import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const DashboardDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // Check localStorage
      info.localStorage = {
        token: localStorage.getItem('token') ? 'Present' : 'Missing',
        user: localStorage.getItem('user') ? 'Present' : 'Missing',
        userData: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
      };

      // Check API health
      try {
        const health = await api.healthCheck();
        info.apiHealth = health;
      } catch (error) {
        info.apiHealth = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Check environment
      info.environment = {
        mode: import.meta.env.MODE,
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
        nodeEnv: import.meta.env.NODE_ENV
      };

      // Check window location
      info.location = {
        href: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search
      };

      // Check if components are loaded
      info.components = {
        PulseOverview: typeof require('@/components/dashboard/PulseOverview') !== 'undefined',
        TeamBreakdown: typeof require('@/components/dashboard/TeamBreakdown') !== 'undefined',
        DashboardSidebar: typeof require('@/components/layout/DashboardSidebar') !== 'undefined'
      };

    } catch (error) {
      info.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setDebugInfo(info);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Dashboard Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? 'Running Diagnostics...' : 'Refresh Diagnostics'}
        </Button>
        
        <div className="mt-4 space-y-4">
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardDebug;


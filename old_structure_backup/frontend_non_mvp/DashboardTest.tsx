import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DashboardTest = () => {
  const { user, loading } = useAuth();

  console.log('DashboardTest render:', { user, loading });

  const setupTestData = () => {
    const defaultUser = {
      id: '1',
      email: 'admin@novora.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      company_name: 'Novora',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('token', 'mock-token-for-testing');
    localStorage.setItem('user', JSON.stringify(defaultUser));
    
    window.location.reload();
  };

  const clearTestData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Auth Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
            <div><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'No user'}</div>
            <div><strong>User Role:</strong> {user?.role || 'No role'}</div>
            <div><strong>Is Manager:</strong> {user?.role === 'manager' ? 'Yes' : 'No'}</div>
            <div><strong>Is Admin:</strong> {user?.role === 'admin' ? 'Yes' : 'No'}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Local Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div><strong>Token:</strong> {localStorage.getItem('token') || 'No token'}</div>
            <div><strong>User Data:</strong> {localStorage.getItem('user') || 'No user data'}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-x-4">
            <Button onClick={setupTestData} variant="default">
              Setup Test Data
            </Button>
            <Button onClick={clearTestData} variant="outline">
              Clear Test Data
            </Button>
            <Link to="/dashboard">
              <Button variant="secondary">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTest;

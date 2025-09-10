import React from 'react';

const TestMVPDashboard = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          🎉 MVP Dashboard Test - WORKING!
        </h1>
        <p className="text-xl text-blue-800 mb-4">
          If you can see this, the routing is working correctly!
        </p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Test Data</h2>
          <ul className="text-left space-y-2">
            <li>✅ Route: /test-mvp-dashboard</li>
            <li>✅ Component: TestMVPDashboard</li>
            <li>✅ Import: Working</li>
            <li>✅ Rendering: Success</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestMVPDashboard;

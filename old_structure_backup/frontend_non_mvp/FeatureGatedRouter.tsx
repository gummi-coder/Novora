import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Simple test component
const TestDashboard = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Dashboard Loaded Successfully!</h1>
      <p className="text-gray-600">MVP Feature Gating is working</p>
    </div>
  </div>
);

const FeatureGatedRouter: React.FC = () => {
  return (
    <Routes>
      {/* Core MVP Routes - Always Available */}
      <Route path="/dashboard" element={<TestDashboard />} />
      <Route path="/survey" element={<div>Survey Page</div>} />
      <Route path="/create" element={<div>Create Survey</div>} />
      <Route path="/surveys" element={<div>Surveys List</div>} />
      
      {/* Feature-gated routes - Only load if feature flags are enabled */}
      {typeof __FEATURE_PHOTO__ !== 'undefined' && __FEATURE_PHOTO__ && (
        <Route path="/photo" element={<div>Photo Survey (Feature Flagged)</div>} />
      )}
      
      {typeof __FEATURE_ADMIN__ !== 'undefined' && __FEATURE_ADMIN__ && (
        <Route path="/admin" element={<div>Admin Dashboard (Feature Flagged)</div>} />
      )}
      
      {typeof __FEATURE_AUTOPILOT__ !== 'undefined' && __FEATURE_AUTOPILOT__ && (
        <Route path="/auto-pilot" element={<div>Auto-Pilot Dashboard (Feature Flagged)</div>} />
      )}
      
      {typeof __FEATURE_ADVANCED_ANALYTICS__ !== 'undefined' && __FEATURE_ADVANCED_ANALYTICS__ && (
        <Route path="/analytics" element={<div>Advanced Analytics (Feature Flagged)</div>} />
      )}
      
      {typeof __FEATURE_INTEGRATIONS__ !== 'undefined' && __FEATURE_INTEGRATIONS__ && (
        <Route path="/integrations" element={<div>Integrations (Feature Flagged)</div>} />
      )}
      
      {/* Pro features */}
      {typeof __FEATURE_PRO__ !== 'undefined' && __FEATURE_PRO__ && (
        <Route path="/pro-dashboard" element={<TestDashboard />} />
      )}
      
      {/* Export features */}
      {typeof __FEATURE_EXPORTS__ !== 'undefined' && __FEATURE_EXPORTS__ && (
        <Route path="/exports" element={<div>Export Dashboard (Feature Flagged)</div>} />
      )}
    </Routes>
  );
};

export default FeatureGatedRouter;

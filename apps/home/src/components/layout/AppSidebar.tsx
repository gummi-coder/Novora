import React from 'react';
import { Link } from 'react-router-dom';

const AppSidebar = () => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/uploads/5b77ec96-2245-4206-9aa7-a6b00a8dea4c.png"
            alt="Novora Logo"
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold text-gray-900">Novora</span>
        </Link>
      </div>
      {/* Add navigation items here */}
    </div>
  );
};

export default AppSidebar; 
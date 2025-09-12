// API Configuration
window.API_CONFIG = {
  // Temporary backend URL - using a different service
  BASE_URL: 'https://novora-backend.vercel.app',
  
  // Frontend URL for survey links
  FRONTEND_URL: 'https://novorasurveys.com',
  
  // API endpoints
  ENDPOINTS: {
    AUTH: '/api/v1/auth',
    SURVEYS: '/api/v1/surveys',
    RESPONSES: '/api/v1/responses',
    HEALTH: '/api/v1/health'
  }
};

// Override hardcoded localhost URLs
window.ENVIRONMENT_CONFIG = {
  VITE_API_URL: 'https://novora-backend.vercel.app',
  VITE_FRONTEND_URL: 'https://novorasurveys.com',
  NODE_ENV: 'production'
};

// Production security guard - disable mock data and fix localhost URLs
if (typeof window !== 'undefined') {
  // Block mock data in production
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    window.USE_MOCK_DATA = false;
    window.MOCK_MODE = false;
    
    // Override any mock data functions
    if (window.mockData) {
      window.mockData = null;
    }
    if (window.getMockSurveys) {
      window.getMockSurveys = () => [];
    }
    if (window.getMockUser) {
      window.getMockUser = () => null;
    }
    
    // CRITICAL: Override hardcoded localhost URLs in compiled JS
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (typeof url === 'string') {
        // Replace localhost:8000 with production backend
        url = url.replace('http://localhost:8000', 'https://novora-backend.vercel.app');
        url = url.replace('https://localhost:8000', 'https://novora-backend.vercel.app');
        // Replace localhost:3000 with production frontend
        url = url.replace('http://localhost:3000', 'https://novorasurveys.com');
        url = url.replace('https://localhost:3000', 'https://novorasurveys.com');
      }
      return originalFetch(url, options);
    };
    
    // Override XMLHttpRequest as well
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...args) {
      if (typeof url === 'string') {
        url = url.replace('http://localhost:8000', 'https://novora-backend.vercel.app');
        url = url.replace('https://localhost:8000', 'https://novora-backend.vercel.app');
        url = url.replace('http://localhost:3000', 'https://novorasurveys.com');
        url = url.replace('https://localhost:3000', 'https://novorasurveys.com');
      }
      return originalXHROpen.call(this, method, url, ...args);
    };
  }
  
  window.API_CONFIG = window.API_CONFIG;
  window.ENVIRONMENT_CONFIG = window.ENVIRONMENT_CONFIG;
}
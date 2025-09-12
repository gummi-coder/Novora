// API Configuration
window.API_CONFIG = {
  // Your actual Render backend URL
  BASE_URL: 'https://novora.onrender.com',
  
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
  VITE_API_URL: 'https://novora.onrender.com',
  VITE_FRONTEND_URL: 'https://novorasurveys.com',
  NODE_ENV: 'production'
};

// Production security guard - disable mock data
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
  }
  
  window.API_CONFIG = window.API_CONFIG;
  window.ENVIRONMENT_CONFIG = window.ENVIRONMENT_CONFIG;
}
import React, { useEffect, useRef } from 'react';
import { Button, formatDate, isValidEmail } from '@your-org/shared';
import { backendConfig } from '@your-org/shared/config/backend';
import { frontendConfig } from '@your-org/shared/config/frontend';
import { logger, auditLogger, performanceMonitor, analytics } from '@your-org/shared/monitoring';
import { securityMiddleware, validateInput, commonSchemas } from './middleware/security';
import { SecurityProvider } from './middleware/frontend-security';
import { useFormValidation, securityUtils, useXSSProtection, useAuthProtection, secureApiRequest } from './middleware/frontend-security';
import surveyRoutes from './api/survey';
import { SurveySyncService } from './services/SurveySyncService';
import { SessionManager } from './services/session-manager';
import { Router } from 'express';
import { EmailService } from './services/EmailService';
import { EmailTemplateManager } from './services/EmailTemplateManager';
import { DataExportService } from './services/DataExportService';
import { DataImportService } from './services/DataImportService';
import { BackupService } from './services/BackupService';
import { FeatureFlagService } from './services/FeatureFlagService';
import { useFeatureFlag, useFeatureFlagVariant } from './hooks/useFeatureFlag';
import { NotificationService } from './services/NotificationService';
import { useNotifications } from './hooks/useNotifications';
import { useAnalytics } from './hooks/useAnalytics';
import { AnalyticsService } from './services/AnalyticsService';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  const apiUrl = backendConfig.API_URL;
  const theme = frontendConfig.DEFAULT_THEME;

  const { trackEvent, trackPageView } = useAnalytics();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    trackPageView('/dashboard');
  }, [trackPageView]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  return (
    <SecurityProvider>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4 text-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div
            ref={modalRef}
            className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all ${sizes[size]} w-full`}
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-4">{children}</div>
          </div>
        </div>
      </div>
    </SecurityProvider>
  );
};

// Track user actions
function handleButtonClick() {
  analytics.trackButtonClick('submit', {
    page: 'checkout',
    cartValue: 99.99,
  });
}

// For login endpoint
app.post('/auth/login', 
  validateInput(z.object({
    email: commonSchemas.email,
    password: commonSchemas.password
  })),
  loginController
);

function LoginForm() {
  const { validate, errors } = useFormValidation(securityUtils.validationSchemas.user.login);

  const handleSubmit = async (data: unknown) => {
    if (validate(data)) {
      // Proceed with form submission
    }
  };
}

function CommentForm() {
  const { sanitizeInput } = useXSSProtection();

  const handleSubmit = (comment: string) => {
    const sanitizedComment = sanitizeInput(comment);
    // Submit sanitized comment
  };
}

function AdminDashboard() {
  const { isAuthenticated, userRoles } = useAuthProtection(['admin']);

  if (!isAuthenticated) {
    return <Loading />;
  }

  return <Dashboard />;
}

async function fetchUserData() {
  try {
    const userData = await secureApiRequest('/api/user/profile');
    // Handle user data
  } catch (error) {
    // Handle error
  }
}

app.use('/api/survey', surveyRoutes);

const surveySync = SurveySyncService.getInstance();
await surveySync.startSync();

const sessionManager = SessionManager.getInstance();

app.use(async (req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  const token = req.headers.authorization?.split(' ')[1];

  if (sessionId && token) {
    const isValid = await sessionManager.validateSession(sessionId, token);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid session' });
    }
  }
  next();
});

const router = Router();

router.get('/sessions', async (req, res) => {
  const sessions = await sessionManager.getActiveSessions(req.user.id);
  res.json(sessions);
});

router.delete('/sessions/:id', async (req, res) => {
  await sessionManager.revokeSession(req.params.id);
  res.json({ success: true });
});

router.delete('/sessions', async (req, res) => {
  await sessionManager.revokeAllSessions(req.user.id);
  res.json({ success: true });
});

export default router;

const emailService = EmailService.getInstance();
const templateManager = EmailTemplateManager.getInstance();

// Send a welcome email
await emailService.queueEmail(
  await templateManager.getTemplate('welcome'),
  {
    to: 'user@example.com',
    variables: {
      name: 'John Doe',
      activationLink: 'https://example.com/activate/123',
    },
  },
  {
    userId: 'user-123',
    campaignId: 'welcome-2024',
  }
);

// Export data
const exportService = DataExportService.getInstance();
const exportResult = await exportService.exportData('surveys', {
  format: 'csv',
  includeMetadata: true,
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date(),
  },
});

// Import data
const importService = DataImportService.getInstance();
const importResult = await importService.importData('users', fileBuffer, {
  format: 'csv',
  conflictResolution: 'merge',
  validateOnly: false,
});

// Create backup
const backupService = BackupService.getInstance();
const backupResult = await backupService.createBackup({
  includeData: true,
  includeSchema: true,
  compression: true,
  encryption: true,
  retention: 30,
});

const flagService = FeatureFlagService.getInstance();
const isEnabled = await flagService.isEnabled('beta-features', {
  userId: user.id,
  subscriptionTier: user.subscriptionTier,
});

function SurveyAnalytics() {
  const { isEnabled, isLoading } = useFeatureFlag('advanced-analytics');
  
  if (isLoading) return <Loading />;
  if (!isEnabled) return <BasicAnalytics />;
  
  return <AdvancedAnalytics />;
}

function SurveyForm() {
  const formVariant = useFeatureFlagVariant('survey-form-variant', {
    layout: 'standard',
    questionsPerPage: 5,
  });
  
  return (
    <Form
      layout={formVariant.layout}
      questionsPerPage={formVariant.questionsPerPage}
    />
  );
}

// Creating a notification
const notificationService = NotificationService.getInstance();
await notificationService.createNotification(
  userId,
  'survey_completed',
  'Survey Completed',
  'Your survey has been submitted successfully',
  {
    channels: ['in_app', 'email'],
    priority: 'high',
    data: {
      surveyId: '123',
      completionTime: '5 minutes',
    },
  }
);

// Using notifications in a React component
function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2>Notifications ({unreadCount} unread)</h2>
        <button onClick={markAllAsRead}>Mark all as read</button>
      </div>
      
      <div className="space-y-4">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={() => markAsRead(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Track custom event
const handleSurveySubmit = async () => {
  await trackEvent('survey', 'submit', {
    surveyId: '123',
    questions: 10,
    duration: 300,
  });
};

// Tracking performance
const { trackPerformance, trackApiCall } = useAnalytics();

// Track API call
const fetchData = async () => {
  const start = performance.now();
  const response = await fetch('/api/data');
  const duration = performance.now() - start;
  
  await trackApiCall('/api/data', 'GET', duration, response.status);
};

// Generate report
const analyticsService = AnalyticsService.getInstance();
const report = await analyticsService.generateReport({
  startDate: new Date('2024-01-01'),
  endDate: new Date(),
  metrics: ['page_views', 'unique_users'],
  dimensions: ['page', 'date'],
  filters: {
    type: 'page_view',
  },
}); 
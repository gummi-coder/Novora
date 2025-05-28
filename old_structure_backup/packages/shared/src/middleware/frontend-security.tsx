import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import {
  cspConfig,
  frontendValidationSchemas,
  xssConfig,
  csrfConfig,
  securityHeaders,
} from '../config/frontend-security';

// Security Provider Component
export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Apply security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      document.head.appendChild(
        Object.assign(document.createElement('meta'), {
          httpEquiv: key,
          content: value,
        })
      );
    });

    // Set up CSRF token
    const csrfToken = generateCSRFToken();
    document.cookie = `${csrfConfig.cookieName}=${csrfToken}; ${Object.entries(csrfConfig.cookieOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}`;

    // Clean up on unmount
    return () => {
      document.head.querySelectorAll('meta[http-equiv]').forEach(meta => meta.remove());
    };
  }, []);

  return <>{children}</>;
};

// Form Validation Hook
export const useFormValidation = <T extends z.ZodType>(schema: T) => {
  const [errors, setErrors] = React.useState<z.ZodError | null>(null);
  const [isValid, setIsValid] = React.useState(false);

  const validate = (data: unknown) => {
    try {
      schema.parse(data);
      setErrors(null);
      setIsValid(true);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error);
        setIsValid(false);
      }
      return false;
    }
  };

  return { validate, errors, isValid };
};

// XSS Protection Hook
export const useXSSProtection = () => {
  const sanitizeInput = (input: string): string => {
    let sanitized = input;
    
    // Remove dangerous patterns
    xssConfig.dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove HTML tags except allowed ones
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitized;
    
    // Remove all tags except allowed ones
    const allowedTags = new Set(xssConfig.allowedTags);
    const elements = tempDiv.getElementsByTagName('*');
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (!allowedTags.has(element.tagName.toLowerCase())) {
        element.parentNode?.removeChild(element);
      } else {
        // Remove disallowed attributes
        const allowedAttrs = xssConfig.allowedAttributes[element.tagName.toLowerCase()] || [];
        Array.from(element.attributes).forEach(attr => {
          if (!allowedAttrs.includes(attr.name)) {
            element.removeAttribute(attr.name);
          }
        });
      }
    }

    return tempDiv.innerHTML;
  };

  return { sanitizeInput };
};

// Authentication Protection Hook
export const useAuthProtection = (requiredRoles?: string[]) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRoles, setUserRoles] = React.useState<string[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
          headers: {
            [csrfConfig.headerName]: getCSRFToken(),
          },
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const data = await response.json();
        setIsAuthenticated(true);
        setUserRoles(data.roles);

        if (requiredRoles && !requiredRoles.some(role => data.roles.includes(role))) {
          navigate('/unauthorized');
        }
      } catch (error) {
        setIsAuthenticated(false);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate, requiredRoles]);

  return { isAuthenticated, userRoles };
};

// CSRF Token Management
const generateCSRFToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const getCSRFToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(csrfConfig.cookieName))
    ?.split('=')[1];
};

// API Request Security Wrapper
export const secureApiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const csrfToken = getCSRFToken();
  
  const secureOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      [csrfConfig.headerName]: csrfToken,
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, secureOptions);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

// Export all security utilities
export const securityUtils = {
  SecurityProvider,
  useFormValidation,
  useXSSProtection,
  useAuthProtection,
  secureApiRequest,
  validationSchemas: frontendValidationSchemas,
}; 
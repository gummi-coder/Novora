import { Request, Response, NextFunction } from 'express';
import { ComplianceService } from '../services/compliance-service';
import { ErrorService, ErrorCategory, ErrorSeverity } from '../services/error-service';

const complianceService = new ComplianceService();
const errorService = new ErrorService();

// Middleware to check if user has given consent to the latest privacy policy
export const checkPrivacyPolicyConsent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next();
    }

    const latestPolicy = await complianceService.getPrivacyPolicy('latest');
    const consentHistory = await complianceService.getConsentHistory(userId);
    const hasConsent = consentHistory.some(
      consent => 
        consent.policyVersion === latestPolicy.version &&
        consent.consentStatus === 'granted'
    );

    if (latestPolicy.requiredConsent && !hasConsent) {
      return res.status(403).json({
        error: 'PRIVACY_POLICY_CONSENT_REQUIRED',
        message: 'Please accept the latest privacy policy to continue',
        policy: latestPolicy
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to handle GDPR data subject requests
export const handleDataSubjectRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw errorService.createError(
        'UNAUTHORIZED',
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.ERROR,
        'User must be authenticated to make data subject requests'
      );
    }

    const { requestType } = req.body;
    if (!requestType) {
      throw errorService.createError(
        'INVALID_REQUEST',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        'Request type is required'
      );
    }

    await complianceService.createDataSubjectRequest({
      userId,
      requestType,
      status: 'pending',
      requestDate: new Date()
    });

    res.status(202).json({
      message: 'Data subject request received',
      status: 'pending'
    });
  } catch (error) {
    next(error);
  }
};

// Middleware to handle consent management
export const handleConsent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw errorService.createError(
        'UNAUTHORIZED',
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.ERROR,
        'User must be authenticated to manage consent'
      );
    }

    const { policyVersion, consentType, consentSource } = req.body;
    if (!policyVersion || !consentType || !consentSource) {
      throw errorService.createError(
        'INVALID_REQUEST',
        ErrorCategory.VALIDATION,
        ErrorSeverity.ERROR,
        'Policy version, consent type, and consent source are required'
      );
    }

    await complianceService.recordConsent({
      userId,
      policyVersion,
      consentDate: new Date(),
      consentType,
      consentSource,
      consentStatus: 'granted',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    res.status(200).json({
      message: 'Consent recorded successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Middleware to enforce data retention policies
export const enforceDataRetention = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await complianceService.enforceRetentionPolicies();
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to log compliance-related actions
export const logComplianceAction = (
  action: string,
  resource: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next();
      }

      await complianceService.logAudit(
        action,
        resource,
        req.params.id || 'unknown',
        req.body,
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          method: req.method,
          path: req.path
        }
      );

      next();
    } catch (error) {
      next(error);
    }
  };
}; 
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsEvent, analyticsEventSchema } from './types';
import { frontendConfig } from '../config/frontend';

// Analytics provider interface
interface AnalyticsProvider {
  track(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void>;
  identify(userId: string, traits?: Record<string, unknown>): Promise<void>;
}

// Segment.io transport
class SegmentAnalytics implements AnalyticsProvider {
  private readonly writeKey: string;

  constructor(writeKey: string) {
    this.writeKey = writeKey;
  }

  async track(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    // In a real implementation, you would use the Segment.io client
    // to track events
    console.log(`[SegmentAnalytics] Tracking event:`, {
      writeKey: this.writeKey,
      event: event.event,
      properties: event.properties,
      userId: event.user.id,
      anonymousId: event.user.anonymousId,
    });
  }

  async identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
    // In a real implementation, you would use the Segment.io client
    // to identify users
    console.log(`[SegmentAnalytics] Identifying user:`, {
      writeKey: this.writeKey,
      userId,
      traits,
    });
  }
}

// Google Analytics transport
class GoogleAnalytics implements AnalyticsProvider {
  private readonly measurementId: string;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  async track(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    // In a real implementation, you would use the Google Analytics client
    // to track events
    console.log(`[GoogleAnalytics] Tracking event:`, {
      measurementId: this.measurementId,
      event: event.event,
      properties: event.properties,
      userId: event.user.id,
    });
  }

  async identify(userId: string, traits?: Record<string, unknown>): Promise<void> {
    // In a real implementation, you would use the Google Analytics client
    // to identify users
    console.log(`[GoogleAnalytics] Identifying user:`, {
      measurementId: this.measurementId,
      userId,
      traits,
    });
  }
}

// Analytics manager
export class AnalyticsManager {
  private readonly providers: AnalyticsProvider[];
  private readonly defaultProperties: Record<string, unknown>;

  constructor(
    providers: AnalyticsProvider[],
    defaultProperties: Record<string, unknown> = {}
  ) {
    this.providers = providers;
    this.defaultProperties = {
      ...defaultProperties,
      appName: frontendConfig.APP_NAME,
      appVersion: frontendConfig.APP_VERSION,
      environment: frontendConfig.NODE_ENV,
    };
  }

  async track(
    event: string,
    properties: Record<string, unknown> = {},
    userId?: string
  ): Promise<void> {
    const analyticsEvent: Omit<AnalyticsEvent, 'timestamp'> = {
      event,
      properties: {
        ...this.defaultProperties,
        ...properties,
      },
      user: {
        id: userId,
        anonymousId: !userId ? uuidv4() : undefined,
      },
      context: {
        page: {
          url: window.location.href,
          referrer: document.referrer,
          title: document.title,
        },
        userAgent: navigator.userAgent,
        locale: navigator.language,
      },
    };

    await Promise.all(
      this.providers.map(provider => provider.track(analyticsEvent))
    );
  }

  async identify(
    userId: string,
    traits: Record<string, unknown> = {}
  ): Promise<void> {
    await Promise.all(
      this.providers.map(provider => provider.identify(userId, traits))
    );
  }

  // Helper methods for common events
  async trackPageView(
    path: string,
    properties: Record<string, unknown> = {},
    userId?: string
  ): Promise<void> {
    await this.track('page_view', {
      ...properties,
      path,
    }, userId);
  }

  async trackButtonClick(
    buttonId: string,
    properties: Record<string, unknown> = {},
    userId?: string
  ): Promise<void> {
    await this.track('button_click', {
      ...properties,
      buttonId,
    }, userId);
  }

  async trackFormSubmit(
    formId: string,
    success: boolean,
    properties: Record<string, unknown> = {},
    userId?: string
  ): Promise<void> {
    await this.track('form_submit', {
      ...properties,
      formId,
      success,
    }, userId);
  }
}

// Create default analytics manager instance
export const analytics = new AnalyticsManager([
  new SegmentAnalytics('your-segment-write-key'),
  new GoogleAnalytics(frontendConfig.GOOGLE_ANALYTICS_ID || ''),
]); 
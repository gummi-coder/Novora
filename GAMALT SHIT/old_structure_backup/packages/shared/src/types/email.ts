import { z } from 'zod';

export const EmailTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string(),
  html: z.string(),
  text: z.string(),
  variables: z.array(z.string()),
});

export type EmailTemplate = z.infer<typeof EmailTemplateSchema>;

export const EmailDataSchema = z.object({
  to: z.string().email(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  variables: z.record(z.unknown()),
});

export type EmailData = z.infer<typeof EmailDataSchema>;

export const EmailTrackingSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  campaignId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type EmailTracking = z.infer<typeof EmailTrackingSchema>;

export const EmailEventSchema = z.object({
  id: z.string(),
  type: z.enum(['sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained']),
  email: z.string().email(),
  timestamp: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export type EmailEvent = z.infer<typeof EmailEventSchema>;

export const EmailTemplateCategorySchema = z.enum([
  'welcome',
  'password-reset',
  'verification',
  'notification',
  'billing',
  'marketing',
]);

export type EmailTemplateCategory = z.infer<typeof EmailTemplateCategorySchema>; 
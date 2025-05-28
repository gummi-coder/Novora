import { Schema, model, Document } from 'mongoose';

export interface IUsageMetrics extends Document {
  userId: string;
  resource: string;
  count: number;
  limit: number;
  lastUpdated: Date;
}

export interface IUsageHistory extends Document {
  userId: string;
  date: Date;
  metrics: {
    surveys: number;
    responses: number;
    storage: number;
    apiCalls: number;
  };
}

export interface IUsageAlert extends Document {
  userId: string;
  type: 'warning' | 'critical';
  metric: string;
  threshold: number;
  currentValue: number;
  message: string;
  createdAt: Date;
  resolvedAt?: Date;
}

const UsageMetricsSchema = new Schema<IUsageMetrics>({
  userId: { type: String, required: true, index: true },
  resource: { type: String, required: true },
  count: { type: Number, required: true, default: 0 },
  limit: { type: Number, required: true },
  lastUpdated: { type: Date, required: true, default: Date.now },
});

const UsageHistorySchema = new Schema<IUsageHistory>({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  metrics: {
    surveys: { type: Number, required: true, default: 0 },
    responses: { type: Number, required: true, default: 0 },
    storage: { type: Number, required: true, default: 0 },
    apiCalls: { type: Number, required: true, default: 0 },
  },
});

const UsageAlertSchema = new Schema<IUsageAlert>({
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true, enum: ['warning', 'critical'] },
  metric: { type: String, required: true },
  threshold: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  resolvedAt: { type: Date },
});

// Indexes for efficient querying
UsageMetricsSchema.index({ userId: 1, resource: 1 }, { unique: true });
UsageHistorySchema.index({ userId: 1, date: 1 });
UsageAlertSchema.index({ userId: 1, createdAt: -1 });

export const UsageMetrics = model<IUsageMetrics>('UsageMetrics', UsageMetricsSchema);
export const UsageHistory = model<IUsageHistory>('UsageHistory', UsageHistorySchema);
export const UsageAlert = model<IUsageAlert>('UsageAlert', UsageAlertSchema); 
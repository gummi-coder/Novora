import { UsageMetrics, UsageHistory, UsageAlert } from '../db/schema/usage';
import type { IUsageMetrics, IUsageHistory, IUsageAlert } from '../db/schema/usage';

export class UsageRepository {
  // Usage Metrics
  async getMetrics(userId: string): Promise<IUsageMetrics[]> {
    return UsageMetrics.find({ userId });
  }

  async getMetric(userId: string, resource: string): Promise<IUsageMetrics | null> {
    return UsageMetrics.findOne({ userId, resource });
  }

  async updateMetric(userId: string, resource: string, count: number, limit: number): Promise<IUsageMetrics> {
    return UsageMetrics.findOneAndUpdate(
      { userId, resource },
      { count, limit, lastUpdated: new Date() },
      { upsert: true, new: true }
    );
  }

  async incrementMetric(userId: string, resource: string, amount: number = 1): Promise<IUsageMetrics> {
    return UsageMetrics.findOneAndUpdate(
      { userId, resource },
      { $inc: { count: amount }, lastUpdated: new Date() },
      { new: true }
    );
  }

  // Usage History
  async getHistory(userId: string, startDate: Date, endDate: Date): Promise<IUsageHistory[]> {
    return UsageHistory.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });
  }

  async addHistoryEntry(userId: string, metrics: IUsageHistory['metrics']): Promise<IUsageHistory> {
    return UsageHistory.create({
      userId,
      date: new Date(),
      metrics,
    });
  }

  // Usage Alerts
  async getAlerts(userId: string): Promise<IUsageAlert[]> {
    return UsageAlert.find({
      userId,
      resolvedAt: { $exists: false },
    }).sort({ createdAt: -1 });
  }

  async createAlert(alert: Omit<IUsageAlert, 'createdAt'>): Promise<IUsageAlert> {
    return UsageAlert.create({
      ...alert,
      createdAt: new Date(),
    });
  }

  async resolveAlert(alertId: string): Promise<IUsageAlert | null> {
    return UsageAlert.findByIdAndUpdate(
      alertId,
      { resolvedAt: new Date() },
      { new: true }
    );
  }

  // Aggregation methods
  async getTotalUsage(userId: string): Promise<Record<string, number>> {
    const metrics = await UsageMetrics.find({ userId });
    return metrics.reduce((acc, metric) => ({
      ...acc,
      [metric.resource]: metric.count,
    }), {});
  }

  async getUsageTrends(userId: string, days: number): Promise<Record<string, number[]>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await UsageHistory.find({
      userId,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    return history.reduce((acc, entry) => ({
      surveys: [...(acc.surveys || []), entry.metrics.surveys],
      responses: [...(acc.responses || []), entry.metrics.responses],
      storage: [...(acc.storage || []), entry.metrics.storage],
      apiCalls: [...(acc.apiCalls || []), entry.metrics.apiCalls],
    }), {});
  }
}

export const usageRepository = new UsageRepository(); 
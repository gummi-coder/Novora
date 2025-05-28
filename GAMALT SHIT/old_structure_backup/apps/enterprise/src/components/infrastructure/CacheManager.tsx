import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CacheService, CacheConfig } from '@/services/CacheService';
import { Progress } from '@/components/ui/progress';

interface CacheStats {
  size: number;
  maxSize: number;
  itemCount: number;
  utilization: number;
}

export function CacheManager() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [strategy, setStrategy] = useState<CacheConfig['strategy']>('memory');
  const [ttl, setTtl] = useState<number>(3600000); // 1 hour

  const cacheService = CacheService.getInstance({
    ttl,
    maxSize: 100 * 1024 * 1024, // 100MB
    strategy,
  });

  useEffect(() => {
    const updateStats = () => {
      setStats(cacheService.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, [cacheService]);

  const handleClearCache = async () => {
    await cacheService.clear();
    setStats(cacheService.getStats());
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cache Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading cache statistics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cache Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Cache Strategy</label>
            <Select
              value={strategy}
              onValueChange={(value: CacheConfig['strategy']) => setStrategy(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="memory">Memory</SelectItem>
                <SelectItem value="localStorage">Local Storage</SelectItem>
                <SelectItem value="sessionStorage">Session Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cache TTL</label>
            <Select
              value={ttl.toString()}
              onValueChange={(value) => setTtl(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select TTL" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300000">5 minutes</SelectItem>
                <SelectItem value="900000">15 minutes</SelectItem>
                <SelectItem value="1800000">30 minutes</SelectItem>
                <SelectItem value="3600000">1 hour</SelectItem>
                <SelectItem value="86400000">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Cache Utilization</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(stats.size)} / {formatBytes(stats.maxSize)}
              </span>
            </div>
            <Progress value={stats.utilization} className="h-2" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.itemCount}</div>
                <p className="text-xs text-muted-foreground">Cached Items</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{formatTime(ttl)}</div>
                <p className="text-xs text-muted-foreground">Time To Live</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleClearCache}>
            Clear Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
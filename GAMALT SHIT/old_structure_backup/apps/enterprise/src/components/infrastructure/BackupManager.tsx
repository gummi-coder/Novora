import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BackupService } from '@/services/BackupService';
import { BackupConfig, BackupJob, BackupStats } from '@/types/backup';
import { format } from 'date-fns';

export function BackupManager() {
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newConfig, setNewConfig] = useState<Partial<BackupConfig>>({
    type: 'full',
    schedule: {
      frequency: 'daily',
      time: '00:00',
      retention: 7,
    },
    storage: {
      type: 'local',
      path: '',
    },
    compression: true,
    encryption: false,
  });

  const backupService = BackupService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [configsData, jobsData, statsData] = await Promise.all([
        backupService.getBackupConfigs(),
        backupService.getBackupJobs(),
        backupService.getBackupStats(),
      ]);
      setConfigs(configsData);
      setJobs(jobsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConfig = async () => {
    try {
      if (!newConfig.name || !newConfig.storage?.path) {
        return;
      }

      const createdConfig = await backupService.createBackupConfig(newConfig as Omit<BackupConfig, 'id' | 'status' | 'lastBackup' | 'nextBackup'>);
      setConfigs(prev => [...prev, createdConfig]);
      setNewConfig({
        type: 'full',
        schedule: {
          frequency: 'daily',
          time: '00:00',
          retention: 7,
        },
        storage: {
          type: 'local',
          path: '',
        },
        compression: true,
        encryption: false,
      });
      await loadData();
    } catch (error) {
      console.error('Failed to create backup config:', error);
    }
  };

  const handleStartBackup = async (configId: string) => {
    try {
      const job = await backupService.startBackup(configId);
      setJobs(prev => [...prev, job]);
      await loadData();
    } catch (error) {
      console.error('Failed to start backup:', error);
    }
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backup Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading backup data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="configs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="configs">Backup Configs</TabsTrigger>
            <TabsTrigger value="jobs">Backup Jobs</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="create">Create Backup</TabsTrigger>
          </TabsList>

          <TabsContent value="configs" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Backup</TableHead>
                  <TableHead>Next Backup</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>{config.name}</TableCell>
                    <TableCell>{config.type}</TableCell>
                    <TableCell>
                      {config.schedule.frequency} at {config.schedule.time}
                    </TableCell>
                    <TableCell>{config.storage.type}</TableCell>
                    <TableCell>
                      <Badge variant={config.status === 'active' ? 'default' : 'secondary'}>
                        {config.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {config.lastBackup ? format(config.lastBackup, 'PPp') : 'Never'}
                    </TableCell>
                    <TableCell>
                      {config.nextBackup ? format(config.nextBackup, 'PPp') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleStartBackup(config.id)}
                      >
                        Start Backup
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Config</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      {configs.find(c => c.id === job.configId)?.name || job.configId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'failed' ? 'destructive' :
                        job.status === 'running' ? 'secondary' : 'outline'
                      }>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(job.startTime, 'PPp')}</TableCell>
                    <TableCell>{job.endTime ? format(job.endTime, 'PPp') : '-'}</TableCell>
                    <TableCell>{job.size ? formatBytes(job.size) : '-'}</TableCell>
                    <TableCell>{job.files}</TableCell>
                    <TableCell>
                      <Progress value={job.progress} className="h-2" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {stats && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{stats.totalBackups}</div>
                      <p className="text-xs text-muted-foreground">Total Backups</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
                      <p className="text-xs text-muted-foreground">Total Size</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{(stats.successRate * 100).toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Storage Usage</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Used Space</Label>
                      <span>{formatBytes(stats.storageUsage.used)}</span>
                    </div>
                    <Progress
                      value={(stats.storageUsage.used / stats.storageUsage.total) * 100}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(stats.storageUsage.available)} available of {formatBytes(stats.storageUsage.total)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recent Jobs</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Config</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Size</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            {configs.find(c => c.id === job.configId)?.name || job.configId}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              job.status === 'completed' ? 'default' :
                              job.status === 'failed' ? 'destructive' :
                              job.status === 'running' ? 'secondary' : 'outline'
                            }>
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(job.startTime, 'PPp')}</TableCell>
                          <TableCell>
                            {job.endTime
                              ? `${((job.endTime.getTime() - job.startTime.getTime()) / 1000).toFixed(0)}s`
                              : '-'
                            }
                          </TableCell>
                          <TableCell>{job.size ? formatBytes(job.size) : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Backup Name</Label>
                <Input
                  value={newConfig.name || ''}
                  onChange={(e) => setNewConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter backup name"
                />
              </div>

              <div className="space-y-2">
                <Label>Backup Type</Label>
                <Select
                  value={newConfig.type}
                  onValueChange={(value: BackupConfig['type']) => setNewConfig(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="incremental">Incremental</SelectItem>
                    <SelectItem value="differential">Differential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Schedule</Label>
                <div className="grid gap-2">
                  <Select
                    value={newConfig.schedule?.frequency}
                    onValueChange={(value: BackupConfig['schedule']['frequency']) => setNewConfig(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule!, frequency: value },
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="time"
                    value={newConfig.schedule?.time}
                    onChange={(e) => setNewConfig(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule!, time: e.target.value },
                    }))}
                  />

                  <Input
                    type="number"
                    value={newConfig.schedule?.retention}
                    onChange={(e) => setNewConfig(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule!, retention: parseInt(e.target.value) },
                    }))}
                    placeholder="Retention period (days)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Storage</Label>
                <div className="grid gap-2">
                  <Select
                    value={newConfig.storage?.type}
                    onValueChange={(value: BackupConfig['storage']['type']) => setNewConfig(prev => ({
                      ...prev,
                      storage: { ...prev.storage!, type: value },
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select storage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="s3">Amazon S3</SelectItem>
                      <SelectItem value="azure">Azure Blob Storage</SelectItem>
                      <SelectItem value="gcp">Google Cloud Storage</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={newConfig.storage?.path}
                    onChange={(e) => setNewConfig(prev => ({
                      ...prev,
                      storage: { ...prev.storage!, path: e.target.value },
                    }))}
                    placeholder="Storage path"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newConfig.compression}
                    onCheckedChange={(checked) => setNewConfig(prev => ({ ...prev, compression: checked }))}
                  />
                  <Label>Compression</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newConfig.encryption}
                    onCheckedChange={(checked) => setNewConfig(prev => ({ ...prev, encryption: checked }))}
                  />
                  <Label>Encryption</Label>
                </div>
              </div>

              <Button onClick={handleCreateConfig}>Create Backup Config</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 
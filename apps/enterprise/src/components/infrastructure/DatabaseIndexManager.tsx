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
import { DatabaseService } from '@/services/DatabaseService';
import { IndexConfig, IndexStats } from '@/types/database';
import { Progress } from '@/components/ui/progress';

export function DatabaseIndexManager() {
  const [indexes, setIndexes] = useState<IndexConfig[]>([]);
  const [stats, setStats] = useState<IndexStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newIndex, setNewIndex] = useState<Partial<IndexConfig>>({
    type: 'single',
    unique: false,
    sparse: false,
    background: true,
    fields: [{ field: '', order: 'asc' }],
  });

  const databaseService = DatabaseService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [indexesData, statsData] = await Promise.all([
        databaseService.getIndexes(),
        databaseService.getIndexStats(),
      ]);
      setIndexes(indexesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateIndex = async () => {
    try {
      if (!newIndex.name || !newIndex.collection || !newIndex.fields?.[0]?.field) {
        return;
      }

      const createdIndex = await databaseService.createIndex(newIndex as Omit<IndexConfig, 'status' | 'size'>);
      setIndexes(prev => [...prev, createdIndex]);
      setNewIndex({
        type: 'single',
        unique: false,
        sparse: false,
        background: true,
        fields: [{ field: '', order: 'asc' }],
      });
      await loadData();
    } catch (error) {
      console.error('Failed to create index:', error);
    }
  };

  const handleDropIndex = async (indexName: string) => {
    try {
      await databaseService.dropIndex(indexName);
      setIndexes(prev => prev.filter(index => index.name !== indexName));
      await loadData();
    } catch (error) {
      console.error('Failed to drop index:', error);
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
          <CardTitle>Database Indexes</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading index data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Indexes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="indexes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="indexes">Indexes</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="create">Create Index</TabsTrigger>
          </TabsList>

          <TabsContent value="indexes" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Collection</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indexes.map((index) => (
                  <TableRow key={index.name}>
                    <TableCell>{index.name}</TableCell>
                    <TableCell>{index.collection}</TableCell>
                    <TableCell>{index.type}</TableCell>
                    <TableCell>
                      {index.fields.map(f => `${f.field} (${f.order})`).join(', ')}
                    </TableCell>
                    <TableCell>{formatBytes(index.size)}</TableCell>
                    <TableCell>
                      <Badge variant={index.status === 'active' ? 'default' : 'secondary'}>
                        {index.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDropIndex(index.name)}
                      >
                        Drop
                      </Button>
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
                      <div className="text-2xl font-bold">{stats.totalIndexes}</div>
                      <p className="text-xs text-muted-foreground">Total Indexes</p>
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
                      <div className="text-2xl font-bold">{formatBytes(stats.averageSize)}</div>
                      <p className="text-xs text-muted-foreground">Average Size</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Performance Impact</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Read Latency</Label>
                      <span>{stats.performanceImpact.readLatency.toFixed(2)}ms</span>
                    </div>
                    <Progress value={stats.performanceImpact.readLatency} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Write Latency</Label>
                      <span>{stats.performanceImpact.writeLatency.toFixed(2)}ms</span>
                    </div>
                    <Progress value={stats.performanceImpact.writeLatency} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Query Time</Label>
                      <span>{stats.performanceImpact.queryTime.toFixed(2)}ms</span>
                    </div>
                    <Progress value={stats.performanceImpact.queryTime / 10} className="h-2" />
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Index Name</Label>
                <Input
                  value={newIndex.name || ''}
                  onChange={(e) => setNewIndex(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter index name"
                />
              </div>

              <div className="space-y-2">
                <Label>Collection</Label>
                <Input
                  value={newIndex.collection || ''}
                  onChange={(e) => setNewIndex(prev => ({ ...prev, collection: e.target.value }))}
                  placeholder="Enter collection name"
                />
              </div>

              <div className="space-y-2">
                <Label>Index Type</Label>
                <Select
                  value={newIndex.type}
                  onValueChange={(value: IndexConfig['type']) => setNewIndex(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="compound">Compound</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="geospatial">Geospatial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Field</Label>
                <div className="flex gap-2">
                  <Input
                    value={newIndex.fields?.[0]?.field || ''}
                    onChange={(e) => setNewIndex(prev => ({
                      ...prev,
                      fields: [{ ...prev.fields?.[0], field: e.target.value }],
                    }))}
                    placeholder="Enter field name"
                  />
                  <Select
                    value={newIndex.fields?.[0]?.order || 'asc'}
                    onValueChange={(value: IndexConfig['fields'][0]['order']) => setNewIndex(prev => ({
                      ...prev,
                      fields: [{ ...prev.fields?.[0], order: value }],
                    }))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="2d">2D</SelectItem>
                      <SelectItem value="2dsphere">2DSphere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newIndex.unique}
                    onCheckedChange={(checked) => setNewIndex(prev => ({ ...prev, unique: checked }))}
                  />
                  <Label>Unique</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newIndex.sparse}
                    onCheckedChange={(checked) => setNewIndex(prev => ({ ...prev, sparse: checked }))}
                  />
                  <Label>Sparse</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newIndex.background}
                    onCheckedChange={(checked) => setNewIndex(prev => ({ ...prev, background: checked }))}
                  />
                  <Label>Background</Label>
                </div>
              </div>

              <Button onClick={handleCreateIndex}>Create Index</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 
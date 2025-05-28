import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFeatureToggle } from '@/contexts/FeatureToggleContext';
import { api } from '@/lib/api';
import { Plus, Save, Trash2 } from 'lucide-react';

interface FeatureToggle {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiredTier: 'basic' | 'pro' | 'enterprise';
  percentage?: number;
}

export const FeatureToggleManager: React.FC = () => {
  const { features, isLoading, refreshFeatures } = useFeatureToggle();
  const [editingFeature, setEditingFeature] = React.useState<string | null>(null);
  const [newFeature, setNewFeature] = React.useState<Partial<FeatureToggle>>({
    enabled: true,
    requiredTier: 'basic',
  });

  const handleSaveFeature = async (featureId: string, updates: Partial<FeatureToggle>) => {
    try {
      await api.patch(`/features/${featureId}`, updates);
      await refreshFeatures();
      setEditingFeature(null);
    } catch (error) {
      console.error('Failed to update feature:', error);
    }
  };

  const handleCreateFeature = async () => {
    try {
      await api.post('/features', newFeature);
      await refreshFeatures();
      setNewFeature({
        enabled: true,
        requiredTier: 'basic',
      });
    } catch (error) {
      console.error('Failed to create feature:', error);
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    try {
      await api.delete(`/features/${featureId}`);
      await refreshFeatures();
    } catch (error) {
      console.error('Failed to delete feature:', error);
    }
  };

  if (isLoading) {
    return <div>Loading features...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feature Toggle Manager</h1>
        <Button onClick={handleCreateFeature}>
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Feature ID</label>
              <Input
                value={newFeature.id || ''}
                onChange={(e) => setNewFeature({ ...newFeature, id: e.target.value })}
                placeholder="feature-id"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newFeature.name || ''}
                onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                placeholder="Feature Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newFeature.description || ''}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                placeholder="Feature Description"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Tier</label>
              <Select
                value={newFeature.requiredTier}
                onValueChange={(value: 'basic' | 'pro' | 'enterprise') =>
                  setNewFeature({ ...newFeature, requiredTier: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {Object.entries(features).map(([id, feature]) => (
          <Card key={id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{feature.name}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Required Tier: {feature.requiredTier}</span>
                    {feature.percentage !== undefined && (
                      <span>• Rollout: {feature.percentage}%</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={(checked) =>
                        handleSaveFeature(id, { enabled: checked })
                      }
                    />
                    <span className="text-sm">
                      {feature.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFeature(id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 
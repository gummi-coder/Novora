import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertRule, AlertSeverity } from '@/types/alerts';
import { defaultAlertRules } from '@/data/alertRules';
import { Save, RotateCcw, AlertTriangle, TrendingDown, Users, MessageSquare, Clock } from 'lucide-react';

const typeIcons = {
  score_drop: TrendingDown,
  critical_low_score: AlertTriangle,
  participation_drop: Users,
  sentiment_spike: MessageSquare,
  flagged_comment: AlertTriangle,
  recurring_risk: Clock,
};

const severityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200',
};

export const AlertConfiguration: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>(defaultAlertRules);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  console.log('AlertConfiguration rendered with rules:', rules.length, rules);

  useEffect(() => {
    const hasRuleChanges = JSON.stringify(rules) !== JSON.stringify(defaultAlertRules);
    setHasChanges(hasRuleChanges);
  }, [rules]);

  const updateRule = (ruleId: string, updates: Partial<AlertRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const updateThreshold = (ruleId: string, thresholdKey: string, value: number) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { 
            ...rule, 
            thresholds: { 
              ...rule.thresholds, 
              [thresholdKey]: value 
            } 
          }
        : rule
    ));
  };

  const resetToDefaults = () => {
    setRules([...defaultAlertRules]);
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      console.log('Saving alert configuration:', rules);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simple Test Header */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800">Alert Configuration</h3>
        <p className="text-sm text-blue-600">Found {rules.length} alert rules to configure</p>
        <p className="text-xs text-blue-500 mt-1">Rules: {rules.map(r => r.name).join(', ')}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={resetToDefaults}
          disabled={saving}
          size="sm"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button
          onClick={saveConfiguration}
          disabled={!hasChanges || saving}
          size="sm"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => {
          const TypeIcon = typeIcons[rule.type];

          return (
            <div key={rule.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${severityColors[rule.severity]}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{rule.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={severityColors[rule.severity]}>
                        {rule.severity}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                        {rule.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`${rule.id}-enabled`} className="text-sm font-medium">
                    Enabled
                  </Label>
                  <Switch
                    id={`${rule.id}-enabled`}
                    checked={rule.enabled}
                    onCheckedChange={(checked) => updateRule(rule.id, { enabled: checked })}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

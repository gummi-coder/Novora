import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Minus,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMetricById } from "@/hooks/useMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingProvider } from './contexts/LoadingContext';
import useLoadingState from '../hooks/useLoadingState';
import { LoadingSpinner, SkeletonList } from '../components/common/LoadingComponents';
import { ErrorBoundary } from 'react-error-boundary';
import { withErrorBoundary } from 'react-error-boundary';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { z } from 'zod';
import { useFormWithValidation } from '../hooks/useFormWithValidation';
import { FormProvider } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/ui/submit-button';
import { Form } from '@/components/ui/form';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export interface MetricCardProps {
  title: string;
  value: number | string;
  change: number;
  icon: React.ReactNode;
  trend: { date: string; value: number; }[];
  gradientId: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  trend,
  gradientId
}) => {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{change}% from last period
        </div>
        <div className="h-[60px] mt-4">
          <ChartContainer config={{}} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <ChartTooltip />
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  fill={`url(#${gradientId})`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

const App = () => (
  <LoadingProvider>
    <YourApp />
  </LoadingProvider>
);

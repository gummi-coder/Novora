
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TrendPoint {
  date: string;
  value: number;
}

interface AnalyticsKpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: TrendPoint[];
  metricPath: string;
  icon?: React.ComponentType<{ className?: string }>;
  info?: string;
  className?: string;
}

export function AnalyticsKpiCard({
  title,
  value,
  change,
  trend = [],
  metricPath,
  icon: Icon,
  info,
  className,
}: AnalyticsKpiCardProps) {
  const navigate = useNavigate();
  
  // Get change element based on positive, negative, or neutral change
  const getChangeElement = () => {
    if (change === undefined) return null;
    
    if (change > 0) {
      return (
        <div className="flex items-center text-emerald-600 text-xs">
          <ArrowUpRight className="h-3 w-3" />
          <span className="ml-1">+{change}%</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-rose-600 text-xs">
          <ArrowDownRight className="h-3 w-3" />
          <span className="ml-1">{change}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-muted-foreground text-xs">
          <Minus className="h-3 w-3" />
          <span className="ml-1">0%</span>
        </div>
      );
    }
  };

  // Generate gradient ID from title to ensure uniqueness
  const gradientId = `gradient-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const handleViewDetails = () => {
    navigate(`/analytics/${metricPath}`);
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">{value}</p>
            
            {change !== undefined && (
              <div className="mt-1 flex items-center">
                {getChangeElement()}
                <span className="text-xs text-muted-foreground ml-1">
                  vs last period
                </span>
              </div>
            )}
            
            {info && (
              <p className="text-xs text-muted-foreground mt-1">{info}</p>
            )}
          </div>
          
          {Icon && (
            <div className="bg-primary/10 p-3 rounded-full h-fit">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        
        {trend && trend.length > 0 && (
          <div className="absolute bottom-0 right-0 w-full h-16 opacity-60">
            <ChartContainer config={{}} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill={`url(#${gradientId})`} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
        
        <Button 
          variant="link" 
          className="absolute bottom-1 left-6 px-0 text-xs"
          onClick={handleViewDetails}
        >
          View Details →
        </Button>
      </CardContent>
    </Card>
  );
}

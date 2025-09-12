
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ComponentType<{ className?: string }>;
  info?: string;
  className?: string;
  children?: React.ReactNode;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  info,
  className,
  children
}: MetricCardProps) {
  // Determine if change is positive, negative, or neutral
  const getChangeElement = () => {
    if (change === undefined) return null;
    
    if (change > 0) {
      return (
        <div className="metric-change-positive">
          <ArrowUpRight className="w-3 h-3" />
          <span>+{change}%</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="metric-change-negative">
          <ArrowDownRight className="w-3 h-3" />
          <span>{change}%</span>
        </div>
      );
    } else {
      return (
        <div className="metric-change-neutral">
          <Minus className="w-3 h-3" />
          <span>0%</span>
        </div>
      );
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="metric-title">{title}</p>
            <p className="metric-value mt-2">{value}</p>
            {change !== undefined && (
              <div className="mt-1">
                {getChangeElement()}
                <span className="text-xs text-muted-foreground ml-1">vs last period</span>
              </div>
            )}
            {info && <p className="text-xs text-muted-foreground mt-1">{info}</p>}
          </div>
          {Icon && (
            <div className="bg-primary/10 p-3 rounded-full h-fit">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

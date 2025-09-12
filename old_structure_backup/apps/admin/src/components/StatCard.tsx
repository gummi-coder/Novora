
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

const StatCard = ({ title, value, icon, trend, description, className }: StatCardProps) => {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <ArrowUpIcon className="h-4 w-4 text-success-600" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-danger-600" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-success-600" : "text-danger-600"
                )}
              >
                {trend.value}%
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          )}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;


import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsightCardProps {
  type: "positive" | "negative" | "warning" | "info";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function InsightCard({ 
  type, 
  title, 
  description, 
  actionLabel = "View Details", 
  onAction 
}: InsightCardProps) {
  // Define icon and color based on the type
  const getIconForType = () => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-emerald-600" />;
      case "negative":
        return <TrendingDown className="h-5 w-5 text-rose-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
    }
  };
  
  const getTextColorForType = () => {
    switch (type) {
      case "positive": return "text-emerald-600";
      case "negative": return "text-rose-600";
      case "warning": return "text-amber-600";
      case "info": return "text-blue-600";
      default: return "text-blue-600";
    }
  };

  return (
    <Card className="bg-card border rounded-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {getIconForType()}
          <h3 className={`font-medium ${getTextColorForType()}`}>{title}</h3>
        </div>
        <p className="mt-2 text-muted-foreground text-sm">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button 
            variant="outline" 
            className="mt-3 text-xs h-8" 
            size="sm"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

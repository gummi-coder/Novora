
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface FeedbackItem {
  id: string;
  text: string;
  source: string;
  date: string;
}

interface FeedbackListProps {
  feedbackItems: FeedbackItem[];
}

export function FeedbackList({ feedbackItems }: FeedbackListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {feedbackItems.length > 0 ? (
        feedbackItems.map((item) => (
          <Card key={item.id} className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full mt-1">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-2">{item.text}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.source}</span>
                    <span>{formatDate(item.date)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-4">
          No feedback available
        </p>
      )}
    </div>
  );
}

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupportSystem } from '@/components/support/SupportSystem';
import { FeedbackSystem } from '@/components/support/FeedbackSystem';
import { BugReport } from '@/components/support/BugReport';
import { MessageSquare, ThumbsUp, Bug } from 'lucide-react';

export function SupportPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support & Feedback</h1>
          <p className="text-muted-foreground">
            Get help, report bugs, and share your feedback to help us improve
          </p>
        </div>
      </div>

      <Tabs defaultValue="support" className="space-y-4">
        <TabsList>
          <TabsTrigger value="support" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Support Tickets</span>
          </TabsTrigger>
          <TabsTrigger value="bugs" className="flex items-center space-x-2">
            <Bug className="h-4 w-4" />
            <span>Bug Reports</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center space-x-2">
            <ThumbsUp className="h-4 w-4" />
            <span>User Feedback</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <SupportSystem />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bugs">
          <Card>
            <CardHeader>
              <CardTitle>Bug Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <BugReport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackSystem />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
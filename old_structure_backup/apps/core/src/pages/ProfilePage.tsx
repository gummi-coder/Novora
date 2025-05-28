import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { EngagementSummary } from "@/components/profile/EngagementSummary";
import { FeedbackList } from "@/components/profile/FeedbackList";
import { GrowthTracker } from "@/components/profile/GrowthTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

export default function ProfilePage() {
  // In a real app, this would come from an API call using React Query
  const userData = {
    id: "user-123",
    name: "Jane Doe",
    role: "Product Manager",
    department: "Engineering",
    email: "jane.doe@company.com",
    phone: "+1 (555) 123-4567",
    avatarUrl: null,
    joinDate: "2022-05-15",
  };

  // Mock engagement data
  const engagementData = {
    enpsScores: [8, 7, 9, 8, 9],
    surveyCompletionRate: 92,
    averageScore: 8.2,
  };

  // Mock feedback data
  const feedbackData = [
    {
      id: "feedback-1",
      text: "Great leadership during the product launch last month.",
      source: "Team Feedback",
      date: "2023-10-15",
    },
    {
      id: "feedback-2",
      text: "Always available to help team members with questions.",
      source: "Peer Review",
      date: "2023-09-20",
    },
  ];

  // Mock growth data - fix the status to match the expected union type
  const growthData = [
    {
      id: "task-1",
      title: "Complete Leadership Training",
      status: "In Progress" as const, // Use const assertion to ensure type is correct
      dueDate: "2023-12-15",
    },
    {
      id: "task-2",
      title: "Mentor Junior Team Member",
      status: "Completed" as const, // Use const assertion to ensure type is correct
      dueDate: "2023-11-30",
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button asChild variant="outline">
            <Link to="/settings/account">
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Profile Header */}
          <ProfileHeader
            name={userData.name}
            role={userData.role}
            department={userData.department}
            email={userData.email}
            phone={userData.phone}
            avatarUrl={userData.avatarUrl}
            isPersonalProfile={true}
          />

          {/* Engagement Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <EngagementSummary
                enpsScores={engagementData.enpsScores}
                surveyCompletionRate={engagementData.surveyCompletionRate}
                averageScore={engagementData.averageScore}
              />
            </CardContent>
          </Card>

          {/* Feedback Received */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Received</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackList feedbackItems={feedbackData} />
            </CardContent>
          </Card>

          {/* Growth Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Growth Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <GrowthTracker growthItems={growthData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

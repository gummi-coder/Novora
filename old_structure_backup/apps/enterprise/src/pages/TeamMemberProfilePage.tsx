import React from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ScoreChart } from "@/components/profile/ScoreChart";
import { FeedbackList } from "@/components/profile/FeedbackList";
import { GrowthTracker } from "@/components/profile/GrowthTracker";
import { ActionPanel } from "@/components/profile/ActionPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamMemberProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  
  // In a real app, these would come from API calls using React Query
  // based on the userId parameter
  const userData = {
    id: userId || "user-456",
    name: "John Smith",
    role: "Software Engineer",
    department: "Engineering",
    email: "john.smith@company.com",
    phone: "+1 (555) 987-6543",
    avatarUrl: null,
    manager: "Jane Doe",
    joinDate: "2022-08-10",
  };

  // Mock score data for the chart
  const scoreData = [
    { date: "Jan", satisfaction: 7, wellbeing: 8, relationships: 6 },
    { date: "Feb", satisfaction: 8, wellbeing: 7, relationships: 7 },
    { date: "Mar", satisfaction: 6, wellbeing: 7, relationships: 8 },
    { date: "Apr", satisfaction: 7, wellbeing: 8, relationships: 8 },
    { date: "May", satisfaction: 8, wellbeing: 9, relationships: 7 },
    { date: "Jun", satisfaction: 9, wellbeing: 8, relationships: 9 },
  ];

  // Mock feedback data
  const feedbackData = [
    {
      id: "feedback-1",
      text: "Excellent problem-solving skills during the backend refactoring.",
      source: "Manager Feedback",
      date: "2023-10-05",
    },
    {
      id: "feedback-2",
      text: "Great team player, always willing to help others.",
      source: "Peer Review",
      date: "2023-09-15",
    },
  ];

  // Mock growth data - fix the status to match the expected union type
  const growthData = [
    {
      id: "task-1",
      title: "Advanced React Course",
      status: "Completed" as const, // Use const assertion to ensure type is correct
      dueDate: "2023-10-30",
    },
    {
      id: "task-2",
      title: "System Architecture Workshop",
      status: "In Progress" as const, // Use const assertion to ensure type is correct
      dueDate: "2023-12-15",
    },
  ];

  // Mock recognition data
  const recognitionData = {
    badges: ["Team Player", "Problem Solver", "Innovation"],
    kudosCount: 12,
  };

  // Determine if current user has admin/lead permissions
  // In a real app, this would come from an auth context or similar
  const hasAdminPermissions = true;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Team Member Profile</h1>
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
            manager={userData.manager}
            isPersonalProfile={false}
          />

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreChart data={scoreData} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Responses & Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback & Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackList feedbackItems={feedbackData} />
              </CardContent>
            </Card>

            {/* Recognition & Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Recognition & Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Recognition</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {recognitionData.badges.map((badge) => (
                      <span 
                        key={badge} 
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Received <span className="font-medium">{recognitionData.kudosCount}</span> kudos this year
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Growth Tasks</h3>
                  <GrowthTracker growthItems={growthData} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Panel (for admins/leads only) */}
          {hasAdminPermissions && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ActionPanel userId={userData.id} userName={userData.name} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

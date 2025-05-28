import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const documentationSections = [
  {
    title: "Getting Started",
    articles: [
      {
        title: "Welcome to Novora",
        content: "Learn about Novora's employee sentiment survey platform and how it can help your organization.",
        path: "/docs/getting-started/welcome"
      },
      {
        title: "Quick Start Guide",
        content: "Get up and running with Novora in minutes.",
        path: "/docs/getting-started/quick-start"
      },
      {
        title: "System Requirements",
        content: "Check if your system meets the requirements to use Novora.",
        path: "/docs/getting-started/requirements"
      }
    ]
  },
  {
    title: "Surveys",
    articles: [
      {
        title: "Creating Surveys",
        content: "Learn how to create and customize employee surveys.",
        path: "/docs/surveys/creating"
      },
      {
        title: "Survey Templates",
        content: "Use and customize pre-built survey templates.",
        path: "/docs/surveys/templates"
      },
      {
        title: "Survey Distribution",
        content: "Learn about different ways to distribute surveys to employees.",
        path: "/docs/surveys/distribution"
      }
    ]
  },
  {
    title: "Analytics",
    articles: [
      {
        title: "Understanding Analytics",
        content: "Learn how to interpret survey results and analytics.",
        path: "/docs/analytics/understanding"
      },
      {
        title: "Custom Reports",
        content: "Create and customize reports for your organization.",
        path: "/docs/analytics/reports"
      },
      {
        title: "Data Export",
        content: "Export your survey data for external analysis.",
        path: "/docs/analytics/export"
      }
    ]
  },
  {
    title: "Administration",
    articles: [
      {
        title: "User Management",
        content: "Manage users and their permissions.",
        path: "/docs/admin/users"
      },
      {
        title: "Security Settings",
        content: "Configure security settings and access controls.",
        path: "/docs/admin/security"
      },
      {
        title: "System Configuration",
        content: "Configure system-wide settings and preferences.",
        path: "/docs/admin/configuration"
      }
    ]
  }
];

export function HelpDocumentation() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = documentationSections.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.articles.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {section.articles.map((article) => (
                  <div key={article.title} className="space-y-2">
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                    <p className="text-sm text-muted-foreground">{article.content}</p>
                    <Button variant="link" className="p-0 h-auto">
                      Read more →
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
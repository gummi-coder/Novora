import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqCategories = [
  {
    title: "Getting Started",
    questions: [
      {
        question: "What is Novora?",
        answer: "Novora is a B2B software-as-a-service platform that helps companies measure employee sentiment through anonymous monthly surveys sent via SMS or email. We provide tools for creating, distributing, and analyzing employee feedback."
      },
      {
        question: "How do I get started with Novora?",
        answer: "Getting started is easy! After signing up, you'll be guided through a quick setup process where you can configure your organization's settings, add team members, and create your first survey. Our onboarding team is available to help you every step of the way."
      },
      {
        question: "What types of surveys can I create?",
        answer: "You can create various types of surveys including employee satisfaction surveys, pulse surveys, engagement surveys, and custom surveys. Our platform supports multiple question types including multiple choice, rating scales, and open-ended questions."
      }
    ]
  },
  {
    title: "Account & Security",
    questions: [
      {
        question: "How do I manage user permissions?",
        answer: "You can manage user permissions through the Admin Dashboard. Navigate to Settings > User Management to add, remove, or modify user roles and access levels. We offer different permission levels including Admin, Manager, and Viewer roles."
      },
      {
        question: "How secure is my data?",
        answer: "We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and strict access controls. All data is stored in EU-based data centers and we comply with GDPR requirements."
      },
      {
        question: "Can I enable two-factor authentication?",
        answer: "Yes, two-factor authentication is available for all accounts. You can enable it in your account settings under Security. We support both SMS and authenticator app-based 2FA."
      }
    ]
  },
  {
    title: "Surveys & Data Collection",
    questions: [
      {
        question: "How does Novora ensure survey anonymity?",
        answer: "We use a combination of technical measures and data processing practices to ensure survey responses remain anonymous. This includes data anonymization, secure storage, and strict access controls. Survey responses are never linked to individual employees unless explicitly configured by the organization."
      },
      {
        question: "Can I customize survey questions?",
        answer: "Yes, you have full control over survey questions. You can use our pre-built templates, modify existing questions, or create entirely new ones. Our question library includes best practices and validated questions for various survey types."
      },
      {
        question: "How often can I send surveys?",
        answer: "You can send surveys as frequently as needed. We recommend monthly pulse surveys for regular feedback, but you can also schedule quarterly or annual surveys. The frequency can be adjusted based on your organization's needs."
      }
    ]
  },
  {
    title: "Analytics & Reporting",
    questions: [
      {
        question: "What types of reports are available?",
        answer: "We offer various report types including engagement scores, sentiment analysis, trend reports, and custom reports. You can generate reports at different levels (organization, department, team) and export them in multiple formats."
      },
      {
        question: "Can I export survey data?",
        answer: "Yes, you can export survey data in multiple formats including CSV, Excel, and PDF. Data can be exported at any time through the Analytics dashboard, and you can schedule regular exports if needed."
      },
      {
        question: "How do I interpret the analytics?",
        answer: "Our analytics dashboard provides clear visualizations and insights. We offer detailed explanations of metrics, benchmarks against industry standards, and trend analysis. Our support team can also help you understand the data."
      }
    ]
  },
  {
    title: "Billing & Subscription",
    questions: [
      {
        question: "How is pricing determined?",
        answer: "Pricing is based on the number of employees in your organization and the features you need. We offer flexible plans that can be customized to your requirements. Contact our sales team for a detailed quote."
      },
      {
        question: "Can I change my subscription plan?",
        answer: "Yes, you can upgrade or downgrade your subscription plan at any time. Changes will be reflected in your next billing cycle. Contact our support team to make changes to your subscription."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards and can also accommodate bank transfers for annual plans. All payments are processed securely through our payment processor, Stripe."
      }
    ]
  }
];

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredCategories = faqCategories
    .filter(category => !selectedCategory || category.title === selectedCategory)
    .map(category => ({
      ...category,
      questions: category.questions.filter(q =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(category => category.questions.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </Button>
          {faqCategories.map((category) => (
            <Button
              key={category.title}
              variant={selectedCategory === category.title ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.title)}
            >
              {category.title}
            </Button>
          ))}
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or category filter
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredCategories.map((category, categoryIndex) => (
            <Card key={category.title}>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.questions.map((item, questionIndex) => {
                    const key = `${categoryIndex}-${questionIndex}`;
                    const isExpanded = expandedQuestions[key];

                    return (
                      <div key={item.question} className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-between text-left font-semibold"
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        >
                          {item.question}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <div
                          className={cn(
                            "overflow-hidden text-sm text-muted-foreground pl-4 border-l-2 border-muted",
                            isExpanded ? "block" : "hidden"
                          )}
                        >
                          {item.answer}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
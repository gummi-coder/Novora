import { useState } from "react";
import { 
  BarChart, 
  MessageSquare, 
  Bell, 
  FileText, 
  Calendar, 
  Settings, 
  Link as LinkIcon 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import FeatureCard from "@/components/FeatureCard";

// Feature data
const features = [
  {
    id: "analytics",
    icon: <BarChart size={24} />,
    title: "Analytics",
    description: "Powerful data visualization and business intelligence tools",
    longDescription: "Transform raw data into actionable insights with our comprehensive analytics suite. Create custom dashboards, monitor KPIs in real-time, and discover trends with our intuitive visualization tools.",
    benefits: [
      "Real-time data visualization",
      "Custom dashboard creation",
      "Advanced filtering and segmentation",
      "Trend analysis and forecasting",
      "Exportable reports in multiple formats"
    ]
  },
  {
    id: "surveys",
    icon: <MessageSquare size={24} />,
    title: "Surveys",
    description: "Collect and analyze feedback from customers and team members",
    longDescription: "Design beautiful surveys, polls, and questionnaires to gather insights from your audience. Our survey tools include advanced branching logic, custom themes, and comprehensive response analytics.",
    benefits: [
      "Custom survey creation with branching logic",
      "Multiple question types and formats",
      "Response analytics and sentiment analysis",
      "Theme customization to match your brand",
      "Automated email distribution"
    ]
  },
  {
    id: "alerts",
    icon: <Bell size={24} />,
    title: "Alerts",
    description: "Stay informed with customizable notifications",
    longDescription: "Never miss important information with our smart alert system. Set up custom triggers based on metrics that matter to your business, and receive timely notifications across multiple channels.",
    benefits: [
      "Custom alert triggers based on metrics",
      "Multi-channel notifications (email, SMS, in-app)",
      "Alert scheduling and frequency controls",
      "Team-based alert distribution",
      "Alert history and audit logs"
    ]
  },
  {
    id: "reports",
    icon: <FileText size={24} />,
    title: "Reports",
    description: "Generate comprehensive reports with just a few clicks",
    longDescription: "Create professional reports that tell your data story effectively. Choose from multiple templates, customize layouts, and share securely with stakeholders via various channels.",
    benefits: [
      "Customizable report templates",
      "Scheduled automated reporting",
      "Export to PDF, Excel, or PowerPoint",
      "Interactive data visualizations",
      "Secure sharing options with access controls"
    ]
  },
  {
    id: "calendar",
    icon: <Calendar size={24} />,
    title: "Calendar",
    description: "Plan, schedule, and manage events efficiently",
    longDescription: "Our calendar tool makes planning and scheduling effortless. Integrate with popular calendar providers, set up recurring events, and send automatic reminders to boost attendance rates.",
    benefits: [
      "Team calendar with shared access controls",
      "Integration with Google and Outlook calendars",
      "Automated reminders and notifications",
      "Resource booking and management",
      "Scheduling analytics and attendance tracking"
    ]
  },
  {
    id: "settings",
    icon: <Settings size={24} />,
    title: "Settings",
    description: "Customize the platform to meet your specific needs",
    longDescription: "Tailor Novora to work exactly the way you want. Our comprehensive settings allow you to configure user permissions, workflow preferences, and integration options to match your unique business requirements.",
    benefits: [
      "Granular user permissions and role management",
      "White-labeling and custom branding options",
      "Workflow customization and automation rules",
      "Data retention and privacy controls",
      "Audit logs for security compliance"
    ]
  },
  {
    id: "integrations",
    icon: <LinkIcon size={24} />,
    title: "Integrations",
    description: "Connect with your favorite tools and platforms",
    longDescription: "Novora connects seamlessly with your existing tech stack. Whether you use Slack, Microsoft Teams, Google Workspace, or other tools, our integrations keep everything in sync with minimal configuration.",
    benefits: [
      "One-click integration with popular platforms",
      "Custom API access for unique integrations",
      "Automated data synchronization",
      "Webhooks for real-time event processing",
      "Integration health monitoring and alerts"
    ]
  }
];

// FAQ data
const faqs = [
  {
    question: "What makes Novora different from other analytics platforms?",
    answer: "Novora combines powerful analytics with team collaboration tools, giving you a complete solution rather than just data visualization. Our platform is designed to be user-friendly while offering advanced capabilities that grow with your business."
  },
  {
    question: "Can I customize dashboards for different team members?",
    answer: "Yes! You can create role-based dashboards with different access levels and visibility settings. Each team member can also customize their own view while maintaining the data governance rules you establish."
  },
  {
    question: "How secure is my data on Novora?",
    answer: "Security is our top priority. Novora uses enterprise-grade encryption both in transit and at rest, role-based access controls, regular security audits, and complies with major regulations including GDPR and SOC 2."
  },
  {
    question: "Do you offer training for new users?",
    answer: "Absolutely. All plans include access to our knowledge base and video tutorials. Business and Enterprise plans also include personalized onboarding sessions and dedicated customer success managers to ensure your team gets maximum value from the platform."
  },
  {
    question: "What kind of support do you offer?",
    answer: "Our support options vary by plan: Free plans include community support, Professional plans offer email support with 24-hour response time, and Enterprise plans include priority support with 4-hour SLA and a dedicated account manager."
  },
  {
    question: "Can Novora integrate with my existing tools?",
    answer: "Yes! Novora offers pre-built integrations with popular tools like Slack, Google Workspace, Microsoft 365, Salesforce, HubSpot, and many more. We also provide a robust API for custom integrations with your unique tech stack."
  }
];

const Features = () => {
  const [activeTab, setActiveTab] = useState("analytics");

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <PageHeader
              title="Powerful Features for Modern Teams"
              subtitle="Discover how Novora helps you streamline workflows, gather insights, and make data-driven decisions."
            />
          </div>
        </section>
        
        {/* Feature Tabs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <Tabs 
                defaultValue="analytics" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {features.map(feature => (
                    <TabsTrigger 
                      key={feature.id} 
                      value={feature.id}
                      className="flex flex-col items-center py-3 px-4"
                    >
                      <span className="mb-2">{feature.icon}</span>
                      <span>{feature.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {features.map(feature => (
                  <TabsContent 
                    key={feature.id} 
                    value={feature.id}
                    className="mt-8"
                  >
                    <div className="grid grid-cols-1 gap-8">
                      <AnimateOnScroll>
                        <div className="bg-gray-50 rounded-lg p-8">
                          <div className="flex items-center mb-4">
                            <div className="mr-3 bg-novora-50 p-2 rounded-md text-novora-600">
                              {feature.icon}
                            </div>
                            <h2 className="text-3xl font-heading font-bold">{feature.title}</h2>
                          </div>
                          <p className="text-xl text-gray-600 mb-6">{feature.longDescription}</p>
                          
                          <h3 className="text-lg font-bold mb-3">Key Benefits:</h3>
                          <ul className="space-y-2 mb-6">
                            {feature.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-start">
                                <svg
                                  className="h-5 w-5 text-novora-600 mr-2 mt-0.5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </AnimateOnScroll>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </AnimateOnScroll>
          </div>
        </section>
        
        {/* All Features */}
        <section id="all-features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <h2 className="text-3xl font-heading font-bold text-center mb-4">
                All Features
              </h2>
              <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
                Explore the complete suite of tools Novora offers to help your team collaborate and achieve results.
              </p>
            </AnimateOnScroll>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.id}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  linkText="Learn more"
                  linkHref={`#${feature.id}`}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <h2 className="text-3xl font-heading font-bold text-center mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
                Find quick answers to common questions about Novora's features
              </p>
            </AnimateOnScroll>
            
            <div className="max-w-3xl mx-auto">
              <AnimateOnScroll>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-lg font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-16 bg-novora-950 text-white">
          <div className="container mx-auto px-4 text-center">
            <AnimateOnScroll>
              <h2 className="text-3xl font-heading font-bold mb-6">
                Ready to explore Novora's features?
              </h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
                Start your free trial today and discover how our powerful features can transform your workflow.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/auth/signup">
                  <Button className="bg-white text-novora-900 hover:bg-gray-100">
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" className="text-white border-white hover:bg-white/10">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Features;

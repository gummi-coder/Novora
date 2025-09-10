import { useState } from "react";
import { 
  BarChart, 
  MessageSquare, 
  Bell, 
  FileText, 
  Calendar, 
  Settings, 
  Link as LinkIcon,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Globe,
  Award,
  Star,
  CheckCircle,
  ArrowRight,
  Target,
  Cpu,
  Database,
  Clock,
  BarChart3,
  PieChart,
  Activity
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
    icon: <BarChart3 size={24} />,
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleButtonClick = () => {
    scrollToTop();
  };

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        {/* Feature Tabs */}
        <section className="pt-32 pb-20 bg-white relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(56,189,248,0.05),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                  <span className="text-slate-900">Choose Your</span>
                  <span className="block bg-gradient-to-r from-novora-600 to-teal-600 bg-clip-text text-transparent">
                    Perfect Features
                  </span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Discover the powerful tools that will transform your workflow. Every feature designed to help your team succeed.
                </p>
              </div>
            </AnimateOnScroll>
            
            <AnimateOnScroll>
              <Tabs 
                defaultValue="analytics" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 p-2 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/50">
                  {features.map(feature => (
                    <TabsTrigger 
                      key={feature.id} 
                      value={feature.id}
                      className="flex flex-col items-center py-4 px-3 rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-slate-200"
                    >
                      <span className="mb-2 text-novora-600">{feature.icon}</span>
                      <span className="text-sm font-medium">{feature.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {features.map(feature => (
                  <TabsContent 
                    key={feature.id} 
                    value={feature.id}
                    className="mt-12"
                  >
                    <div className="grid grid-cols-1 gap-8">
                      <AnimateOnScroll>
                        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-10 border border-slate-200/50 shadow-xl backdrop-blur-sm">
                          <div className="flex items-center mb-6">
                            <div className="mr-4 bg-gradient-to-r from-novora-600 to-teal-600 p-3 rounded-xl text-white shadow-lg">
                              {feature.icon}
                            </div>
                            <h2 className="text-4xl font-heading font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                              {feature.title}
                            </h2>
                          </div>
                          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                            {feature.longDescription}
                          </p>
                          
                          <h3 className="text-xl font-semibold mb-6 text-slate-900">Key Benefits:</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {feature.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-start p-4 bg-white/60 rounded-lg border border-slate-200/50 backdrop-blur-sm">
                                <CheckCircle className="h-5 w-5 text-novora-600 mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-slate-700">{benefit}</span>
                              </div>
                            ))}
                          </div>
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
        <section id="all-features" className="py-24 bg-gradient-to-b from-white to-slate-50 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.05),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                  <span className="text-slate-900">Complete Suite of</span>
                  <span className="block bg-gradient-to-r from-novora-600 to-teal-600 bg-clip-text text-transparent">
                    Powerful Tools
                  </span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Explore the comprehensive suite of tools Novora offers to help your team collaborate, 
                  analyze data, and achieve exceptional results.
                </p>
              </div>
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
                  onClick={handleButtonClick}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ */}
        <section className="py-24 bg-white relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.03),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                  <span className="text-slate-900">Frequently Asked</span>
                  <span className="block bg-gradient-to-r from-novora-600 to-teal-600 bg-clip-text text-transparent">
                    Questions
                  </span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Find quick answers to common questions about Novora's powerful features and capabilities.
                </p>
              </div>
            </AnimateOnScroll>
            
            <div className="max-w-4xl mx-auto">
              <AnimateOnScroll>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border border-slate-200/50 rounded-xl bg-white/60 backdrop-blur-sm">
                      <AccordionTrigger className="text-lg font-semibold px-6 py-4 hover:text-novora-600 transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 px-6 pb-4 leading-relaxed">
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
        <section className="py-24 bg-gradient-to-br from-novora-900 via-novora-800 to-slate-900 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.08),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <AnimateOnScroll>
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                Ready to explore Novora's features?
              </h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto mb-12 leading-relaxed">
                Start your free trial today and discover how our powerful features can transform your workflow 
                and drive unprecedented growth for your business.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link to="/auth/signup" onClick={handleButtonClick}>
                  <Button className="group relative bg-gradient-to-r from-white to-slate-100 text-novora-900 hover:from-slate-100 hover:to-white text-lg px-8 py-6 h-auto font-semibold shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 border-0">
                    <span className="relative z-10 flex items-center gap-2">
                      Start Free Trial
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                  </Button>
                </Link>
                <Link to="/pricing" onClick={handleButtonClick}>
                  <Button variant="outline" className="text-white border-2 border-white/30 hover:bg-white/10 text-lg px-8 py-6 h-auto font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
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

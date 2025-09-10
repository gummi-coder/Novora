import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Check, 
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
  Activity,
  MessageSquare,
  Bell,
  FileText,
  Calendar,
  Settings,
  Link as LinkIcon,
  Eye,
  Brain,
  Lock,
  Mail,
  Smartphone,
  Download,
  Share2,
  Calendar as CalendarIcon,
  UserCheck,
  Crown,
  Building,
  Zap as ZapIcon
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateOnScroll from "@/components/AnimateOnScroll";

// Core features included in all plans
const coreFeatures = [
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Pulse Surveys (auto-sent)",
    description: "Monthly pulse with 0–10 mood score and optional written comments"
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "Fully Anonymous",
    description: "Trust-first design with guaranteed anonymity"
  },
  {
    icon: <Smartphone className="w-5 h-5" />,
    title: "Multi-channel Delivery",
    description: "Email + SMS delivery for maximum response rates"
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Basic Dashboard",
    description: "Mood score overview with 2–3 month trends"
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: "AI Assistant",
    description: "1-paragraph auto-summary + MoodupGPT insights"
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Enterprise Security",
    description: "GDPR compliant with end-to-end encryption"
  }
];

// Pricing plans with detailed features
const plans = [
  {
    name: "Starter",
    description: "Pulse basics for small teams",
    price: {
      monthly: "€99",
      annually: "€79"
    },
    period: "/month",
    badge: "Perfect for small teams",
    features: [
      { text: "Up to 50 employees", included: true },
      { text: "Mood score + basic trend (2–3 months)", included: true },
      { text: "Team breakdown table (basic)", included: true },
      { text: "Anonymous comments (plain list)", included: true },
      { text: "Create next survey (template only)", included: true },
      { text: "Standard email support", included: true },
      { text: "Drop alerts", included: false },
      { text: "Comments viewer filters", included: false },
      { text: "PDF export", included: false },
      { text: "Survey scheduling", included: false },
      { text: "SSO authentication", included: false },
      { text: "Advanced permissions", included: false }
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Growth",
    description: "Scale visibility + control for growing teams",
    price: {
      monthly: "€249",
      annually: "€199"
    },
    period: "/month",
    badge: "Most Popular",
    features: [
      { text: "Up to 100 employees", included: true },
      { text: "Full trend graph (up to 6 months)", included: true },
      { text: "Color-coded states (green/yellow/red)", included: true },
      { text: "Basic auto drop alerts", included: true },
      { text: "Full team breakdown with sentiment", included: true },
      { text: "Comments filters (by team + date)", included: true },
      { text: "Sentiment analysis (pos/neu/neg)", included: true },
      { text: "PDF export (history) + shareable link", included: true },
      { text: "Create/edit surveys (templates + edits)", included: true },
      { text: "Basic scheduling (day/time, email only)", included: true },
      { text: "SSO authentication (basic)", included: true },
      { text: "Priority email support", included: true },
      { text: "Advanced permissions", included: false },
      { text: "Custom branding", included: false },
      { text: "API access", included: false },
      { text: "Dedicated success manager", included: false }
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    description: "Total control, customization, and integrations at scale",
    price: {
      monthly: "€499+",
      annually: "€399+"
    },
    period: "/month",
    badge: "For large organizations",
    features: [
      { text: "Unlimited employees", included: true },
      { text: "Real-time drop alerts", included: true },
      { text: "Custom thresholds & routing", included: true },
      { text: "Drop alert flags on teams", included: true },
      { text: "Deeper filters (location, manager)", included: true },
      { text: "Flag comments for follow-up", included: true },
      { text: "Export comments with context", included: true },
      { text: "Full SMS + Email delivery", included: true },
      { text: "Auto-prefill from last survey", included: true },
      { text: "Recurring survey scheduling", included: true },
      { text: "Custom survey logic (branching)", included: true },
      { text: "Custom department hierarchy", included: true },
      { text: "Advanced permissions (RBAC)", included: true },
      { text: "Custom branding (domain, logo)", included: true },
      { text: "API access", included: true },
      { text: "HRIS integrations", included: true },
      { text: "Dedicated success manager", included: true },
      { text: "24/7 support (email, phone, remote)", included: true }
    ],
    cta: "Contact Sales",
    popular: false
  }
];

// Feature comparison matrix
const featureMatrix = [
  {
    feature: "Mood Score + Basic Trend",
    starter: "2–3 months only",
    growth: "Full 6 months",
    enterprise: "Full 12+ months"
  },
  {
    feature: "Drop Alerts",
    starter: "❌",
    growth: "✅ Basic auto alerts",
    enterprise: "✅ Custom thresholds/routing"
  },
  {
    feature: "Team Breakdown Table",
    starter: "Basic",
    growth: "Full w/ sentiment",
    enterprise: "Full + deep filters"
  },
  {
    feature: "Sentiment Tags",
    starter: "Simple pos/neg",
    growth: "Full analysis",
    enterprise: "Advanced themes + NLP"
  },
  {
    feature: "Comments Viewer Filters",
    starter: "❌",
    growth: "✅ Team/date filters",
    enterprise: "✅ Advanced + exportable"
  },
  {
    feature: "Export PDF",
    starter: "Last survey only",
    growth: "History exports + link",
    enterprise: "Auto reports + API"
  },
  {
    feature: "Survey Creation",
    starter: "Template only",
    growth: "Template + edits",
    enterprise: "Full logic, branding"
  },
  {
    feature: "Scheduling",
    starter: "❌",
    growth: "✅ Basic (day/time)",
    enterprise: "✅ Recurring + SMS/email"
  },
  {
    feature: "SSO",
    starter: "❌",
    growth: "✅ Basic SSO",
    enterprise: "✅ SSO + SCIM/HRIS"
  },
  {
    feature: "Permissions",
    starter: "❌",
    growth: "❌",
    enterprise: "✅ Advanced (roles, team)"
  },
  {
    feature: "Branding & API",
    starter: "❌",
    growth: "❌",
    enterprise: "✅ Custom domain, API"
  },
  {
    feature: "Support",
    starter: "Docs only",
    growth: "Priority email",
    enterprise: "24/7 + Success Manager"
  }
];

// Pricing FAQ data
const pricingFAQs = [
  {
    question: "Can I upgrade or downgrade my plan at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes to upgraded plans take effect immediately. Downgrades will take effect at the end of your current billing cycle."
  },
  {
    question: "How does billing work?",
    answer: "We offer both monthly and annual billing options. With annual billing, you get a 20% discount compared to monthly billing. You can pay with all major credit cards or via invoicing for Enterprise plans."
  },
  {
    question: "What happens when I hit my employee limit?",
    answer: "When you reach your employee limit, you can add more employees at any time from your account settings. Additional employees are charged at €1-2 per employee per month depending on your plan."
  },
  {
    question: "Are there any long-term contracts?",
    answer: "No, there are no long-term contracts required. You can cancel your subscription at any time. For annual plans, we offer prorated refunds if you cancel before the end of your billing year."
  },
  {
    question: "Do you offer discounts for non-profits or educational institutions?",
    answer: "Yes, we offer special pricing for qualified non-profit organizations, educational institutions, and startups. Please contact our sales team to learn more about these discounts."
  },
  {
    question: "What type of support is included in each plan?",
    answer: "Starter plans include documentation and community support. Growth plans include priority email support with 24-hour response time. Enterprise plans come with 24/7 support (email, phone, remote) and a dedicated customer success manager."
  }
];

// Animated Price Component
const AnimatedPrice = ({ 
  monthlyPrice, 
  annualPrice, 
  isAnnual, 
  period 
}: { 
  monthlyPrice: string; 
  annualPrice: string; 
  isAnnual: boolean; 
  period: string; 
}) => {
  const [displayPrice, setDisplayPrice] = useState(isAnnual ? annualPrice : monthlyPrice);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setDisplayPrice(isAnnual ? annualPrice : monthlyPrice);
      setIsAnimating(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [isAnnual, monthlyPrice, annualPrice]);

  return (
    <div className="flex items-baseline justify-center">
      <span 
        className={`text-5xl font-bold text-slate-900 transition-all duration-300 ${
          isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {displayPrice}
      </span>
      <span className="text-slate-600 ml-2">{period}</span>
    </div>
  );
};

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");

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
        {/* Pricing Plans */}
        <section className="pt-32 pb-24 bg-gradient-to-b from-white to-slate-50 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.05),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                  <span className="text-slate-900">Choose Your</span>
                  <span className="block bg-gradient-to-r from-novora-600 to-teal-600 bg-clip-text text-transparent">
                    Perfect Plan
                  </span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Simple flat pricing that scales with your team. No hidden fees, no surprises.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Billing toggle */}
            <AnimateOnScroll>
              <div className="flex justify-center mb-12">
                <div className="bg-slate-100/80 backdrop-blur-sm p-1 rounded-full flex items-center border border-slate-200/50">
                  <button
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      billingCycle === "monthly"
                        ? "bg-white shadow-lg text-slate-900"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      billingCycle === "annually"
                        ? "bg-white shadow-lg text-slate-900"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    onClick={() => setBillingCycle("annually")}
                  >
                    <span className="flex items-center">
                      Annually
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Save 20%
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan, index) => (
                <AnimateOnScroll key={index} delay={index * 0.2}>
                  <Card className={`relative border-2 transition-all duration-300 hover:shadow-2xl ${
                    plan.popular 
                      ? 'border-novora-600 bg-gradient-to-br from-white to-novora-50/30 shadow-xl' 
                      : 'border-slate-200/50 bg-white/80 backdrop-blur-sm hover:border-novora-300'
                  }`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-novora-600 to-teal-600 text-white px-4 py-2 text-sm font-semibold">
                          {plan.badge}
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-8">
                      <CardTitle className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</CardTitle>
                      <CardDescription className="text-slate-600">{plan.description}</CardDescription>
                      <div className="mt-6">
                        <AnimatedPrice
                          monthlyPrice={plan.price.monthly}
                          annualPrice={plan.price.annually}
                          isAnnual={billingCycle === "annually"}
                          period={plan.period}
                        />
                        {billingCycle === "annually" && (
                          <p className="text-sm text-slate-500 mt-2 transition-all duration-300">Billed annually</p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start">
                          {feature.included ? (
                            <Check className="w-5 h-5 text-novora-600 mr-3 mt-0.5 flex-shrink-0" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-slate-300 rounded-full mr-3 mt-0.5 flex-shrink-0"></div>
                          )}
                          <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </CardContent>

                    <CardFooter className="pt-8">
                      {plan.name === "Enterprise" ? (
                        <Link to="/book" onClick={handleButtonClick}>
                          <Button 
                            className={`w-full py-6 text-lg font-semibold ${
                              plan.popular 
                                ? 'bg-gradient-to-r from-novora-600 to-teal-600 text-white hover:from-novora-700 hover:to-teal-700' 
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {plan.cta}
                            <ChevronRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      ) : (
                        <Link to="/auth/signup" onClick={handleButtonClick}>
                          <Button 
                            className={`w-full py-6 text-lg font-semibold ${
                              plan.popular 
                                ? 'bg-gradient-to-r from-novora-600 to-teal-600 text-white hover:from-novora-700 hover:to-teal-700' 
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {plan.cta}
                            <ChevronRight className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Core Features Included */}
        <section className="py-20 bg-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(56,189,248,0.05),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                  <span className="text-slate-900">Included in</span>
                  <span className="block bg-gradient-to-r from-novora-600 to-teal-600 bg-clip-text text-transparent">
                    All Plans
                  </span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  These core features are always on — your foundation for honest, anonymous feedback.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreFeatures.map((feature, index) => (
                <AnimateOnScroll key={index} delay={index * 0.1}>
                  <Card className="border border-slate-200/50 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-gradient-to-r from-novora-600 to-teal-600 rounded-lg flex items-center justify-center text-white mr-4 flex-shrink-0">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                          <p className="text-slate-600 text-sm">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.03),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                  <span className="text-slate-900">Detailed Feature</span>
                  <span className="block bg-gradient-to-r from-novora-600 to-teal-600 bg-clip-text text-transparent">
                    Comparison
                  </span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  See exactly what's included in each plan to make the best choice for your team.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-4 px-6 font-semibold text-slate-900">Feature</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-900">Starter</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-900">Growth</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {featureMatrix.map((row, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-900">{row.feature}</td>
                      <td className="py-4 px-6 text-center text-slate-600">{row.starter}</td>
                      <td className="py-4 px-6 text-center text-slate-600">{row.growth}</td>
                      <td className="py-4 px-6 text-center text-slate-600">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.03),transparent_50%)]"></div>
          
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
                  Everything you need to know about our pricing and plans.
                </p>
              </div>
            </AnimateOnScroll>
            
            <div className="max-w-4xl mx-auto">
              <AnimateOnScroll>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {pricingFAQs.map((faq, index) => (
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
                Ready to get started?
              </h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto mb-12 leading-relaxed">
                Join thousands of teams already using Novora to get honest feedback and drive growth.
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
                <Link to="/book" onClick={handleButtonClick}>
                  <Button variant="outline" className="text-white border-2 border-white/30 hover:bg-white/10 text-lg px-8 py-6 h-auto font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                    Book a Demo
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

export default Pricing;

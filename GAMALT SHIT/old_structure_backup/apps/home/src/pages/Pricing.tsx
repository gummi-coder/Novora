import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/PageHeader";
import AnimateOnScroll from "@/components/AnimateOnScroll";

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
    question: "What happens when I hit my user limit?",
    answer: "When you reach your user limit, you can add more users at any time from your account settings. The additional cost will be prorated for your current billing period."
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
    answer: "Free plans include community support through our knowledge base and forums. Professional plans include email support with 24-hour response time. Enterprise plans come with priority support with a 4-hour SLA and a dedicated customer success manager."
  }
];

// Pricing plan features
const plans = [
  {
    name: "Core",
    description: "For individuals and small teams getting started",
    price: {
      monthly: "€99",
      annually: "€79"
    },
    features: [
      "Up to 50 employees included ($1 per extra)",
      "Custom questions from library",
      "Multi-channel delivery (Email & SMS)",
      "Standard email support",
      "Monthly pulse surveys",
      "Novora GPT"
    ],
    cta: "Get started",
    mostPopular: false
  },
  {
    name: "Professional",
    description: "For growing teams with advanced needs",
    price: {
      monthly: "€249",
      annually: "€199"
    },
    features: [
      "Up to 100 employees included ($2 per extra)",
      "Custom questions",
      "Priority email support",
      "Advanced access controls",
      "Manager reviews",
      "Data export (Excel)",
      "SSO authentication"
    ],
    cta: "Start free trial",
    mostPopular: true
  },
  {
    name: "Enterprise",
    description: "For organizations requiring enhanced security and support",
    price: {
      monthly: "Custom",
      annually: "Custom"
    },
    features: [
      "Unlimited employees",
      "Advanced analytics suite",
      "Custom department hierarchy",
      "Custom branding options (Custom domain & email for surveys)",
      "Custom survey frequency",
      "Uptime, security & privacy guarantees",
      "24/7 priority support (Email, Phone & Remote sessions)",
      "HR system integrations"
    ],
    cta: "Contact sales",
    mostPopular: false
  }
];

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <PageHeader
              title="Simple, Transparent Pricing"
              subtitle="Choose the plan that's right for your team with no hidden fees."
            />

            {/* Billing toggle */}
            <div className="flex justify-center mt-12 mb-6">
              <AnimateOnScroll>
                <div className="bg-gray-100 p-1 rounded-full flex items-center">
                  <button
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      billingCycle === "monthly"
                        ? "bg-white shadow text-novora-800"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </button>
                  <button
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      billingCycle === "annually"
                        ? "bg-white shadow text-novora-800"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setBillingCycle("annually")}
                  >
                    <span className="flex items-center">
                      Annually
                      <span className="ml-1 bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">
                        Save 20%
                      </span>
                    </span>
                  </button>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <AnimateOnScroll key={plan.name} delay={index * 0.5}>
                  <Card className={`border ${
                    plan.mostPopular 
                      ? "border-novora-600 shadow-lg shadow-novora-100" 
                      : "border-gray-200"
                  } h-full flex flex-col relative`}>
                    {plan.mostPopular && (
                      <div className="absolute top-0 right-0 bg-novora-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg rounded-tr-lg">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="mt-2">{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">
                          {billingCycle === "monthly" 
                            ? plan.price.monthly 
                            : plan.price.annually}
                        </span>
                        {plan.price.monthly !== "Custom" && (
                          <span className="text-gray-500 ml-2">/ month</span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex">
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link 
                        to={plan.name === "Enterprise" ? "/book" : "/auth/signup"}
                        className="w-full"
                      >
                        <Button 
                          className={`w-full ${
                            plan.mostPopular 
                              ? "bg-gradient-to-r from-novora-600 to-teal-500 text-white" 
                              : ""
                          }`}
                          variant={plan.mostPopular ? "default" : "outline"}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise callout */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-8 md:p-12 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <AnimateOnScroll>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                      Need a custom solution?
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                      Our Enterprise plan offers enhanced security, custom integrations, and dedicated support for larger organizations.
                    </p>
                    <ul className="space-y-3 mb-6">
                      <li className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Single Sign-On (SSO) integration</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Dedicated environment & data residency options</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>Custom contract terms with SLA guarantees</span>
                      </li>
                      <li className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>24/7 priority support with 4-hour SLA</span>
                      </li>
                    </ul>
                    <Link to="/book">
                      <Button>
                        Contact Sales
                      </Button>
                    </Link>
                  </div>
                </AnimateOnScroll>
                
                <AnimateOnScroll delay={1}>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-3">Enterprise customers include:</h3>
                    <div className="grid grid-cols-2 gap-6 items-center text-center">
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <span className="font-bold text-xl text-gray-400">GlobalCorp</span>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <span className="font-bold text-xl text-gray-400">TechGiant</span>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <span className="font-bold text-xl text-gray-400">MegaFirm</span>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm">
                        <span className="font-bold text-xl text-gray-400">BigBrand</span>
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              </div>
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
                Find answers to common questions about our pricing and plans
              </p>
            </AnimateOnScroll>
            
            <div className="max-w-3xl mx-auto">
              <AnimateOnScroll>
                <Accordion type="single" collapsible className="w-full">
                  {pricingFAQs.map((faq, index) => (
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
        <section className="py-16 bg-novora-50">
          <div className="container mx-auto px-4 text-center">
            <AnimateOnScroll>
              <h2 className="text-3xl font-heading font-bold mb-6">
                Start your free trial today
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Try Novora risk-free for 14 days. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/auth/signup">
                  <Button className="bg-gradient-to-r from-novora-600 to-teal-500 text-white">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/book">
                  <Button variant="outline">
                    Schedule Demo
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

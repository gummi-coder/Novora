
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Check, Clock, MapPin, User, ArrowRight, Play, Award, Target, Lightbulb, Shield, Zap, Users, Star, Sparkles, ChevronRight, Brain, FileText, BarChart3, MessageSquare, Eye, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateOnScroll from "@/components/AnimateOnScroll";

// Form schema validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  company: z.string().min(1, { message: "Company name is required." }),
  timeZone: z.string().min(1, { message: "Please select your time zone." }),
  companySize: z.string().min(1, { message: "Please select your company size." }),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const BookMeeting = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      timeZone: "",
      companySize: "",
      message: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log("Form submitted with values:", values);
    toast({
      title: "Meeting requested!",
      description: "We'll contact you shortly to confirm your booking.",
    });
    setSubmitted(true);
  };

  const timeZones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  ];

  const companySizes = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-100", label: "51-100 employees" },
    { value: "101-250", label: "101-250 employees" },
    { value: "251-500", label: "251-500 employees" },
    { value: "500+", label: "500+ employees" },
  ];

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
        {/* Booking Section */}
        <section className="pt-32 pb-16 bg-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(56,189,248,0.05),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Enhanced Booking Form */}
              <AnimateOnScroll>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-xl border border-slate-200/50 p-6 md:p-8 backdrop-blur-sm">
                  {!submitted ? (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-novora-600 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-900">Request Your Meeting</h2>
                        <p className="text-slate-600 text-sm">Tell us about your needs and we'll schedule a personalized demo</p>
                      </div>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-6"
                        >
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold text-slate-900">Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} className="h-10 text-sm border-slate-200 focus:border-novora-500" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold text-slate-900">Work Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="john.doe@company.com"
                                    type="email"
                                    {...field}
                                    className="h-10 text-sm border-slate-200 focus:border-novora-500"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold text-slate-900">Company Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Acme Inc." {...field} className="h-10 text-sm border-slate-200 focus:border-novora-500" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="timeZone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-slate-900">Your Time Zone</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-10 text-sm border-slate-200 focus:border-novora-500">
                                        <SelectValue placeholder="Select time zone" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {timeZones.map((tz) => (
                                        <SelectItem key={tz.value} value={tz.value}>
                                          {tz.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="companySize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-semibold text-slate-900">Company Size</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-10 text-sm border-slate-200 focus:border-novora-500">
                                        <SelectValue placeholder="Select company size" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {companySizes.map((size) => (
                                        <SelectItem key={size.value} value={size.value}>
                                          {size.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-semibold text-slate-900">Additional Information (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us about your specific needs or questions..."
                                    rows={3}
                                    {...field}
                                    className="text-sm border-slate-200 focus:border-novora-500"
                                  />
                                </FormControl>
                                <FormDescription className="text-sm text-slate-600">
                                  Share any specific topics you'd like to discuss during the meeting.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-novora-600 to-teal-600 text-white hover:from-novora-700 hover:to-teal-700 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            Request Meeting
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </form>
                      </Form>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Check className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold mb-3 text-slate-900">Meeting Request Submitted!</h2>
                      <p className="text-slate-600 mb-6 text-base leading-relaxed">
                        Thank you for your interest in Novora. One of our team members will be in touch shortly to confirm your meeting details.
                      </p>
                      <div className="bg-gradient-to-br from-novora-50 to-teal-50 rounded-xl p-6 text-left border border-novora-100">
                        <h3 className="font-bold mb-4 text-lg flex items-center text-slate-900">
                          <Target className="w-4 h-4 mr-2 text-novora-600" />
                          What happens next?
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <span className="bg-gradient-to-r from-novora-600 to-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 font-bold text-sm">1</span>
                            <span className="text-slate-700 text-sm">You'll receive a confirmation email within 24 hours.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-gradient-to-r from-novora-600 to-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 font-bold text-sm">2</span>
                            <span className="text-slate-700 text-sm">Our team will propose specific meeting times based on your preferences.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-gradient-to-r from-novora-600 to-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 font-bold text-sm">3</span>
                            <span className="text-slate-700 text-sm">You'll receive a calendar invite once the meeting is confirmed.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </AnimateOnScroll>

              {/* Enhanced Benefits Section */}
              <AnimateOnScroll delay={0.2}>
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                      <span className="text-slate-900">Why Schedule a</span>
                      <span className="block bg-gradient-to-r from-novora-600 to-teal-600 bg-clip-text text-transparent">
                        Demo?
                      </span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Get a personalized walkthrough of how Novora can transform your team's feedback culture and drive meaningful change.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-novora-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1 text-slate-900">Personalized Experience</h3>
                        <p className="text-slate-600 text-sm">
                          See Novora configured specifically for your organization's size and needs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-novora-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1 text-slate-900">Expert Guidance</h3>
                        <p className="text-slate-600 text-sm">
                          Get insights from our team on best practices for implementing anonymous feedback.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-novora-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1 text-slate-900">Security & Privacy</h3>
                        <p className="text-slate-600 text-sm">
                          Learn about our enterprise-grade security and GDPR compliance measures.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-novora-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1 text-slate-900">Quick Setup</h3>
                        <p className="text-slate-600 text-sm">
                          See how easy it is to get started with Novora in just minutes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-novora-50 to-teal-50 rounded-xl p-6 border border-novora-100">
                    <h3 className="text-lg font-bold mb-3 flex items-center text-slate-900">
                      <Star className="w-4 h-4 mr-2 text-novora-600" />
                      What You'll Learn
                    </h3>
                    <ul className="space-y-2 text-slate-700 text-sm">
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-novora-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>How to create and customize anonymous surveys</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-novora-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Understanding your dashboard and analytics</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-novora-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Best practices for driving response rates</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-novora-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Integration options with your existing tools</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-novora-600 mr-3 mt-0.5 flex-shrink-0" />
                        <span>Pricing and implementation timeline</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-novora-900 via-novora-800 to-slate-900 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.08),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <AnimateOnScroll>
              <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                Ready to Transform Your Team?
              </h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto mb-12 leading-relaxed">
                Join thousands of organizations already using Novora to build better workplaces through honest, anonymous feedback.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button 
                  className="group relative bg-gradient-to-r from-white to-slate-100 text-novora-900 hover:from-slate-100 hover:to-white text-lg px-8 py-6 h-auto font-semibold shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105 border-0"
                  onClick={handleButtonClick}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Trial
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                </Button>
                <Button variant="outline" className="text-white border-2 border-white/30 hover:bg-white/10 text-lg px-8 py-6 h-auto font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                  <span className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Watch Demo Video
                  </span>
                </Button>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BookMeeting;

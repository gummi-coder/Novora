
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Check, Clock, MapPin, User, ArrowRight, Play, Award, Target, Lightbulb, Shield, Zap, Users, Star } from "lucide-react";
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
import PageHeader from "@/components/PageHeader";
import AnimateOnScroll from "@/components/AnimateOnScroll";

// Form schema validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  company: z.string().min(1, { message: "Company name is required." }),
  timeZone: z.string().min(1, { message: "Please select your time zone." }),
  preferredTime: z.string().min(1, { message: "Please select a preferred time." }),
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
      preferredTime: "",
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

  const preferredTimes = [
    { value: "morning", label: "Morning (9AM - 12PM)" },
    { value: "afternoon", label: "Afternoon (12PM - 5PM)" },
    { value: "evening", label: "Evening (5PM - 8PM)" },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Enhanced Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-br from-white via-novora-50 to-teal-50 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-novora-400/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-400/20 to-transparent rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <div className="inline-flex items-center px-4 py-2 bg-novora-100 text-novora-700 rounded-full text-sm font-medium mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Your Demo
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
                  Book a Personalized
                  <span className="block bg-gradient-to-r from-novora-600 to-teal-500 bg-clip-text text-transparent">
                    Demo
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Schedule a personalized demo with our team to see how Novora can transform your organization's culture and drive sustainable growth.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Enhanced Booking Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Enhanced Booking Form */}
              <AnimateOnScroll>
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
                  {!submitted ? (
                    <>
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-novora-600 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Request Your Meeting</h2>
                        <p className="text-gray-600">Tell us about your needs and we'll schedule a personalized demo</p>
                      </div>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-8"
                        >
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold">Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} className="h-12 text-base" />
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
                                <FormLabel className="text-base font-semibold">Work Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="john.doe@company.com"
                                    type="email"
                                    {...field}
                                    className="h-12 text-base"
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
                                <FormLabel className="text-base font-semibold">Company Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Acme Inc." {...field} className="h-12 text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="timeZone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-semibold">Your Time Zone</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-12 text-base">
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
                              name="preferredTime"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base font-semibold">Preferred Time</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="Select time" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {preferredTimes.map((time) => (
                                        <SelectItem key={time.value} value={time.value}>
                                          {time.label}
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
                                <FormLabel className="text-base font-semibold">Additional Information (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us about your specific needs or questions..."
                                    rows={4}
                                    {...field}
                                    className="text-base"
                                  />
                                </FormControl>
                                <FormDescription className="text-sm">
                                  Share any specific topics you'd like to discuss during the meeting.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-novora-600 to-teal-500 text-white hover:from-novora-700 hover:to-teal-600 h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                          >
                            Request Meeting
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Button>
                        </form>
                      </Form>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <Check className="h-10 w-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold mb-4">Meeting Request Submitted!</h2>
                      <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                        Thank you for your interest in Novora. One of our team members will be in touch shortly to confirm your meeting details.
                      </p>
                      <div className="bg-gradient-to-br from-novora-50 to-teal-50 rounded-2xl p-8 text-left border border-novora-100">
                        <h3 className="font-bold mb-6 text-xl flex items-center">
                          <Target className="w-5 h-5 mr-2 text-novora-600" />
                          What happens next?
                        </h3>
                        <ul className="space-y-4">
                          <li className="flex items-start">
                            <span className="bg-gradient-to-r from-novora-600 to-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-0.5 font-bold">1</span>
                            <span className="text-gray-700">You'll receive a confirmation email within 24 hours.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-gradient-to-r from-novora-600 to-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-0.5 font-bold">2</span>
                            <span className="text-gray-700">Our team will propose specific meeting times based on your preferences.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-gradient-to-r from-novora-600 to-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-0.5 font-bold">3</span>
                            <span className="text-gray-700">You'll receive a calendar invite once the meeting is confirmed.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </AnimateOnScroll>

              {/* Enhanced Meeting Info */}
              <AnimateOnScroll delay={1}>
                <div>
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      What to Expect
                    </div>
                    <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                      Your Personalized
                      <span className="block bg-gradient-to-r from-teal-600 to-novora-500 bg-clip-text text-transparent">
                        Demo Experience
                      </span>
                    </h2>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2">30-Minute Session</h3>
                          <p className="text-gray-700 leading-relaxed">
                            A focused conversation about your specific needs and how Novora can help transform your organization's culture.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2">Personalized Demo</h3>
                          <p className="text-gray-700 leading-relaxed">
                            See how Novora works with examples relevant to your industry and specific use cases that matter to your organization.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2">Flexible Scheduling</h3>
                          <p className="text-gray-700 leading-relaxed">
                            We'll work around your calendar to find a time that works best for you and your team.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2">Virtual Meeting</h3>
                          <p className="text-gray-700 leading-relaxed">
                            Meetings are conducted via Zoom or your preferred video conferencing tool for maximum convenience.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 bg-gradient-to-br from-novora-50 to-teal-50 rounded-2xl p-8 border border-novora-100">
                    <h3 className="font-bold mb-4 text-xl flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-novora-600" />
                      Not ready for a meeting yet?
                    </h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      You can explore our features or pricing pages to learn more about Novora before scheduling a demo.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                      <Button variant="outline" asChild className="flex-1">
                        <a href="/features" className="flex items-center justify-center">
                          <Zap className="mr-2 h-4 w-4" />
                          Explore Features
                        </a>
                      </Button>
                      <Button variant="outline" asChild className="flex-1">
                        <a href="/pricing" className="flex items-center justify-center">
                          <Star className="mr-2 h-4 w-4" />
                          View Pricing
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* New Testimonials Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-novora-50">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <div className="inline-flex items-center px-4 py-2 bg-novora-100 text-novora-700 rounded-full text-sm font-medium mb-6">
                  <Users className="w-4 h-4 mr-2" />
                  What Our Customers Say
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                  Trusted by Teams
                  <span className="block bg-gradient-to-r from-novora-600 to-teal-500 bg-clip-text text-transparent">
                    Worldwide
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  See what our customers have to say about their demo experience
                </p>
              </div>
            </AnimateOnScroll>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimateOnScroll delay={1}>
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  <div className="flex space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "The demo was incredibly insightful. The team really understood our challenges and showed us exactly how Novora could help."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">S</span>
                    </div>
                    <div>
                      <p className="font-semibold">Sarah Chen</p>
                      <p className="text-gray-600 text-sm">HR Director, TechCorp</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={2}>
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  <div className="flex space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "Professional, thorough, and tailored to our specific needs. The demo convinced us to move forward with Novora."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">M</span>
                    </div>
                    <div>
                      <p className="font-semibold">Michael Rodriguez</p>
                      <p className="text-gray-600 text-sm">CTO, InnovateLabs</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={3}>
                <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                  <div className="flex space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "The personalized approach made all the difference. They showed us exactly how Novora fits our workflow."
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold">L</span>
                    </div>
                    <div>
                      <p className="font-semibold">Lisa Thompson</p>
                      <p className="text-gray-600 text-sm">VP Operations, GlobalFirm</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BookMeeting;

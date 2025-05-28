
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Check, Clock, MapPin, User } from "lucide-react";
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
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <PageHeader
              title="Book a Meeting"
              subtitle="Schedule a personalized demo with our team to see how Novora can help your business."
            />
          </div>
        </section>

        {/* Booking Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Booking Form */}
              <AnimateOnScroll>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                  {!submitted ? (
                    <>
                      <h2 className="text-2xl font-bold mb-6">Request Your Meeting</h2>
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
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
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
                                <FormLabel>Work Email</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="john.doe@company.com"
                                    type="email"
                                    {...field}
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
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Acme Inc." {...field} />
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
                                  <FormLabel>Your Time Zone</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
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
                                  <FormLabel>Preferred Time</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
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
                                <FormLabel>Additional Information (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Tell us about your specific needs or questions..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Share any specific topics you'd like to discuss during the meeting.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-novora-600 to-teal-500 text-white"
                          >
                            Request Meeting
                          </Button>
                        </form>
                      </Form>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="h-8 w-8 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold mb-3">Meeting Request Submitted!</h2>
                      <p className="text-gray-600 mb-6">
                        Thank you for your interest in Novora. One of our team members will be in touch shortly to confirm your meeting details.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-6 text-left">
                        <h3 className="font-bold mb-3">What happens next?</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <span className="bg-novora-100 text-novora-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">1</span>
                            <span>You'll receive a confirmation email within 24 hours.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-novora-100 text-novora-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">2</span>
                            <span>Our team will propose specific meeting times based on your preferences.</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-novora-100 text-novora-600 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">3</span>
                            <span>You'll receive a calendar invite once the meeting is confirmed.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </AnimateOnScroll>

              {/* Meeting Info */}
              <AnimateOnScroll delay={1}>
                <div>
                  <h2 className="text-2xl font-bold mb-6">What to Expect</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                      <div className="flex items-start">
                        <Clock className="h-6 w-6 text-novora-600 mr-3 mt-1" />
                        <div>
                          <h3 className="font-bold mb-1">30-Minute Session</h3>
                          <p className="text-gray-600">
                            A focused conversation about your specific needs and how Novora can help.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                      <div className="flex items-start">
                        <User className="h-6 w-6 text-novora-600 mr-3 mt-1" />
                        <div>
                          <h3 className="font-bold mb-1">Personalized Demo</h3>
                          <p className="text-gray-600">
                            See how Novora works with examples relevant to your industry and use cases.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                      <div className="flex items-start">
                        <Calendar className="h-6 w-6 text-novora-600 mr-3 mt-1" />
                        <div>
                          <h3 className="font-bold mb-1">Flexible Scheduling</h3>
                          <p className="text-gray-600">
                            We'll work around your calendar to find a time that works best for you.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                      <div className="flex items-start">
                        <MapPin className="h-6 w-6 text-novora-600 mr-3 mt-1" />
                        <div>
                          <h3 className="font-bold mb-1">Virtual Meeting</h3>
                          <p className="text-gray-600">
                            Meetings are conducted via Zoom or your preferred video conferencing tool.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-novora-50 rounded-lg p-6">
                    <h3 className="font-bold mb-2">Not ready for a meeting yet?</h3>
                    <p className="text-gray-600 mb-4">
                      You can explore our features or pricing pages to learn more about Novora.
                    </p>
                    <div className="flex space-x-3">
                      <Button variant="outline" asChild>
                        <a href="/features">Explore Features</a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href="/pricing">View Pricing</a>
                      </Button>
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

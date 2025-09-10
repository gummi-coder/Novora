
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Check, Mail, ArrowLeft, Sparkles, Award, Shield, Zap, ChevronRight, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateOnScroll from "@/components/AnimateOnScroll";

// Form schema validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type FormValues = z.infer<typeof formSchema>;

const ForgotPassword = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    console.log("Password reset requested for:", values.email);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, we'll just show a toast
    toast({
      title: "Reset link sent!",
      description: "Check your email for instructions to reset your password.",
    });
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 bg-gradient-to-br from-slate-50 via-novora-50/30 to-white overflow-hidden">
          {/* Premium decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.08),transparent_50%)]"></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-novora-400/20 to-teal-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-novora-300/15 to-teal-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%230284c7%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-md mx-auto">
              {/* Reset badge */}
              <AnimateOnScroll>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-novora-600/10 to-teal-500/10 border border-novora-200/50 rounded-full text-sm font-medium text-novora-700 mb-6 backdrop-blur-sm">
                    <Lock className="w-4 h-4 text-novora-600" />
                    <span>Password Reset</span>
                    <Shield className="w-4 h-4 text-teal-500" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-heading font-bold leading-[1.1] mb-4 tracking-tight">
                    <span className="block text-slate-900">Reset Your</span>
                    <span className="block bg-gradient-to-r from-novora-600 via-novora-700 to-teal-600 bg-clip-text text-transparent">
                      Password
                    </span>
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {isSubmitted 
                      ? "Check your email for reset instructions" 
                      : "Enter your email to receive a secure password reset link"}
                  </p>
                </div>
              </AnimateOnScroll>

              {/* Enhanced Reset Form */}
              <AnimateOnScroll delay={0.2}>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-2xl border border-slate-200/50 p-8 md:p-10 backdrop-blur-sm">
                  {!isSubmitted ? (
                    <>
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-novora-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-slate-900">Send Reset Link</h2>
                        <p className="text-slate-600">We'll send you a secure link to reset your password</p>
                      </div>
                      
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-6"
                        >
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-novora-600" />
                                  Email Address
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="name@company.com"
                                    type="email"
                                    disabled={isLoading}
                                    {...field}
                                    className="h-12 text-base border-slate-200 focus:border-novora-500 bg-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-novora-600 to-teal-600 text-white hover:from-novora-700 hover:to-teal-700 h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Sending...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                Send Reset Link
                                <ChevronRight className="w-5 h-5" />
                              </div>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <Check className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-slate-900">Check Your Email</h3>
                      <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                        We've sent a secure password reset link to your email address. Please check your inbox and spam folder.
                      </p>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 mb-8">
                        <h4 className="font-semibold mb-4 text-slate-900 flex items-center">
                          <Shield className="w-5 h-5 mr-2 text-green-600" />
                          What happens next?
                        </h4>
                        <div className="space-y-3 text-sm text-slate-700">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Click the link in your email to reset your password</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Create a new secure password</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Sign in with your new password</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-500 mb-6">
                        The link will expire in 1 hour for security.
                      </p>
                      
                      <Button
                        variant="outline"
                        className="w-full h-12 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                        onClick={() => setIsSubmitted(false)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Try a different email
                      </Button>
                    </div>
                  )}

                  <div className="mt-8 text-center">
                    <p className="text-sm text-slate-600">
                      Remember your password?{" "}
                      <Link
                        to="/auth/signin"
                        className="font-semibold text-novora-600 hover:text-novora-700 transition-colors flex items-center justify-center gap-1 mt-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sign In
                      </Link>
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Security Info Section */}
              <AnimateOnScroll delay={0.4}>
                <div className="mt-12 bg-gradient-to-br from-novora-50 to-teal-50 rounded-2xl p-8 border border-novora-100">
                  <h3 className="text-lg font-bold mb-6 text-slate-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-novora-600" />
                    Security & Privacy
                  </h3>
                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-novora-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Reset links are encrypted and expire after 1 hour</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-novora-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>We never store your password in plain text</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-novora-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>All communications are secured with SSL encryption</span>
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

export default ForgotPassword;

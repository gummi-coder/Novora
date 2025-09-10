
import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Building, Lock, Eye, EyeOff, Sparkles, Award, Shield, Zap, ChevronRight, Check, Star, Users, Target, Lightbulb } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateOnScroll from "@/components/AnimateOnScroll";

// Form schema validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  company: z.string().min(1, { message: "Company name is required." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password must contain uppercase, lowercase and numbers",
    }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and privacy policy.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const SignUp = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          firstName: values.name.split(' ')[0] || values.name,
          lastName: values.name.split(' ').slice(1).join(' ') || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to sign up');
      }

      // Store the token and user data in localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Also set cookie for middleware compatibility
      document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;

      toast({
        title: "Sign up successful!",
        description: "Welcome to Novora.",
      });

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign up. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: string) => {
    setIsLoading(true);
    
    // Simulate API call
    console.log(`Sign up with ${provider}`);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: `${provider} sign up initiated`,
      description: "Redirecting to authentication provider...",
    });
    
    setIsLoading(false);
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
              {/* Trial badge */}
              <AnimateOnScroll>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-novora-600/10 to-teal-500/10 border border-novora-200/50 rounded-full text-sm font-medium text-novora-700 mb-6 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-novora-600" />
                    <span>Start Free Trial</span>
                    <Star className="w-4 h-4 text-teal-500" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-heading font-bold leading-[1.1] mb-4 tracking-tight">
                    <span className="block text-slate-900">Create Your</span>
                    <span className="block bg-gradient-to-r from-novora-600 via-novora-700 to-teal-600 bg-clip-text text-transparent">
                      Account
                    </span>
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Start your free 30-day trial
                  </p>
                </div>
              </AnimateOnScroll>

              {/* Enhanced Sign Up Form */}
              <AnimateOnScroll delay={0.2}>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-2xl border border-slate-200/50 p-8 md:p-10 backdrop-blur-sm">
                  {/* Social Sign Up */}
                  <div className="space-y-3 mb-8">
                    <Button
                      variant="outline"
                      className="w-full h-12 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                      disabled={isLoading}
                      onClick={() => handleSocialSignUp("Google")}
                    >
                      <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span className="font-medium">Continue with Google</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full h-12 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                      disabled={isLoading}
                      onClick={() => handleSocialSignUp("GitHub")}
                    >
                      <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span className="font-medium">Continue with GitHub</span>
                    </Button>
                  </div>

                  <div className="relative mb-8">
                    <Separator className="bg-slate-200" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-gradient-to-br from-slate-50 to-white px-4 text-sm text-slate-500 font-medium">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Email Sign Up Form */}
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
                            <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                              <User className="w-4 h-4 text-novora-600" />
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                disabled={isLoading}
                                {...field}
                                className="h-12 text-base border-slate-200 focus:border-novora-500 bg-white"
                              />
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
                            <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-novora-600" />
                              Work Email
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

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                              <Building className="w-4 h-4 text-novora-600" />
                              Company Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Acme Inc."
                                disabled={isLoading}
                                {...field}
                                className="h-12 text-base border-slate-200 focus:border-novora-500 bg-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                              <Lock className="w-4 h-4 text-novora-600" />
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="••••••••"
                                  type={showPassword ? "text" : "password"}
                                  disabled={isLoading}
                                  {...field}
                                  className="h-12 text-base border-slate-200 focus:border-novora-500 bg-white pr-12"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormDescription className="text-sm text-slate-600">
                              Must be at least 8 characters with uppercase, lowercase, and numbers.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                              <Lock className="w-4 h-4 text-novora-600" />
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="••••••••"
                                  type={showConfirmPassword ? "text" : "password"}
                                  disabled={isLoading}
                                  {...field}
                                  className="h-12 text-base border-slate-200 focus:border-novora-500 bg-white pr-12"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading}
                                className="mt-1"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal text-slate-700">
                                I agree to the{" "}
                                <a
                                  href="#"
                                  className="text-novora-600 hover:underline font-medium"
                                >
                                  Terms of Service
                                </a>{" "}
                                and{" "}
                                <a
                                  href="#"
                                  className="text-novora-600 hover:underline font-medium"
                                >
                                  Privacy Policy
                                </a>
                              </FormLabel>
                              <FormMessage />
                            </div>
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
                            Creating account...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Start Free Trial
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-8 text-center">
                    <p className="text-sm text-slate-600">
                      Already have an account?{" "}
                      <Link
                        to="/auth/signin"
                        className="font-semibold text-novora-600 hover:text-novora-700 transition-colors"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Trial Benefits Section */}
              <AnimateOnScroll delay={0.4}>
                <div className="mt-12 bg-gradient-to-br from-novora-50 to-teal-50 rounded-2xl p-8 border border-novora-100">
                  <h3 className="text-lg font-bold mb-6 text-slate-900 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-novora-600" />
                    What's Included in Your Trial?
                  </h3>
                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-novora-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>30-day free trial</strong> - Full access to all features</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-novora-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Unlimited surveys</strong> - Create as many as you need</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-novora-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Full feature access</strong> - All premium features included</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-novora-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Expert support</strong> - Get help when you need it</span>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Trust Indicators */}
              <AnimateOnScroll delay={0.6}>
                <div className="mt-8 text-center">
                  <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>GDPR Compliant</span>
                    </div>
                    <div className="w-px h-3 bg-slate-300"></div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>99.9% Uptime</span>
                    </div>
                    <div className="w-px h-3 bg-slate-300"></div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>10,000+ Users</span>
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

export default SignUp;

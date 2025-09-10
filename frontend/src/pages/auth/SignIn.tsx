import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Eye, EyeOff, Sparkles, Award, Shield, Zap, ChevronRight, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateOnScroll from "@/components/AnimateOnScroll";
// import { authService } from "@/services/auth"; // Not used - using direct fetch calls

const API_ROOT = (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";

// Form schema validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

const SignIn = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_ROOT}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to sign in');
      }

      // Store the token in localStorage
      localStorage.setItem('token', data.access_token);
      // Also set cookie for middleware compatibility
      document.cookie = `token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
      
      // Get user info
      const userResponse = await fetch(`${API_ROOT}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // Show success toast
      toast({
        title: "Sign in successful!",
        description: "Welcome back to Novora.",
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true);
    
    // Simulate API call
    console.log(`Sign in with ${provider}`);
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: `${provider} sign in initiated`,
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
              {/* Welcome badge */}
              <AnimateOnScroll>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-novora-600/10 to-teal-500/10 border border-novora-200/50 rounded-full text-sm font-medium text-novora-700 mb-6 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-novora-600" />
                    <span>Welcome Back</span>
                    <Award className="w-4 h-4 text-teal-500" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-heading font-bold leading-[1.1] mb-4 tracking-tight">
                    <span className="block text-slate-900">Sign In to</span>
                    <span className="block bg-gradient-to-r from-novora-600 via-novora-700 to-teal-600 bg-clip-text text-transparent">
                      Novora
                    </span>
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    Access your dashboard and continue building better workplaces
                  </p>
                </div>
              </AnimateOnScroll>

              {/* Enhanced Sign In Form */}
              <AnimateOnScroll delay={0.2}>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl shadow-2xl border border-slate-200/50 p-8 md:p-10 backdrop-blur-sm">
                  {/* Social Sign In */}
                  <div className="space-y-3 mb-8">
                    <Button
                      variant="outline"
                      className="w-full h-12 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                      disabled={isLoading}
                      onClick={() => handleSocialSignIn("Google")}
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
                      onClick={() => handleSocialSignIn("GitHub")}
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

                  {/* Email Sign In Form */}
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

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-novora-600" />
                                Password
                              </FormLabel>
                              <Link
                                to="/auth/forgot-password"
                                className="text-sm font-medium text-novora-600 hover:text-novora-700 transition-colors"
                              >
                                Forgot password?
                              </Link>
                            </div>
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
                            Signing in...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Sign In
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-8 text-center">
                    <p className="text-sm text-slate-600">
                      Don't have an account?{" "}
                      <Link
                        to="/auth/signup"
                        className="font-semibold text-novora-600 hover:text-novora-700 transition-colors"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Benefits Section */}
              <AnimateOnScroll delay={0.4}>
                <div className="mt-12 bg-gradient-to-br from-novora-50 to-teal-50 rounded-2xl p-8 border border-novora-100">
                  <h3 className="text-lg font-bold mb-6 text-slate-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-novora-600" />
                    Why Choose Novora?
                  </h3>
                  <div className="space-y-4 text-sm text-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-novora-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Enterprise-grade security and GDPR compliance</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-novora-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Anonymous feedback that drives real change</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-novora-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Advanced analytics and actionable insights</span>
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

export default SignIn;

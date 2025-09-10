import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { 
  ChevronRight, 
  BarChart, 
  MessageSquare, 
  Bell, 
  FileText, 
  Calendar, 
  Settings, 
  Link as LinkIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
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
  Play,
  Download,
  ExternalLink,
  Target,
  Cpu,
  Database,
  Lock as LockIcon,
  Clock,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  Globe as GlobeIcon
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post<LoginResponse>("http://localhost:8000/api/v1/auth/login", {
        email,
        password,
      });
      
      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        // Also set cookie for middleware compatibility
        document.cookie = `token=${response.data.access_token}; path=/; max-age=86400; SameSite=Lax`;
        toast.success("Successfully logged in");
        // Redirect to the dashboard
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-novora-50/30 to-white overflow-hidden">
          {/* Premium decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.08),transparent_50%)]"></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-novora-400/20 to-teal-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-novora-300/15 to-teal-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-novora-500/10 to-teal-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%230284c7%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-6xl mx-auto">
              {/* Launch badge */}
              <AnimateOnScroll>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-novora-600/10 to-teal-500/10 border border-novora-200/50 rounded-full text-sm font-medium text-novora-700 mb-8 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-novora-600" />
                  <span>Now Available - Join the Future of Business Intelligence</span>
                  <Award className="w-4 h-4 text-teal-500" />
                </div>
              </AnimateOnScroll>

              {/* Main headline */}
              <AnimateOnScroll>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1] mb-8 tracking-tight">
                  <span className="block text-slate-900">Transform Your</span>
                  <span className="block bg-gradient-to-r from-novora-600 via-novora-700 to-teal-600 bg-clip-text text-transparent">
                    Business Intelligence
                  </span>
                  <span className="block text-slate-900">with Novora</span>
                </h1>
              </AnimateOnScroll>

              {/* Subtitle */}
              <AnimateOnScroll delay={0.2}>
                <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                  The enterprise-grade platform that empowers teams to make data-driven decisions, 
                  <span className="font-medium text-slate-800"> streamline workflows</span>, and 
                  <span className="font-medium text-slate-800"> drive unprecedented growth</span>.
                </p>
              </AnimateOnScroll>

              {/* Key benefits */}
              <AnimateOnScroll delay={0.4}>
                <div className="flex flex-wrap justify-center items-center gap-6 mb-12 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-novora-600" />
                    <span>40% faster insights</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal-600" />
                    <span>Enterprise security</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-novora-600" />
                    <span>99.9% uptime</span>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* CTA Buttons */}
              <AnimateOnScroll delay={0.6}>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
                  <Link to="/auth/signup" onClick={handleButtonClick}>
                    <Button className="group relative bg-gradient-to-r from-novora-600 to-teal-600 text-white hover:from-novora-700 hover:to-teal-700 text-lg px-8 py-6 h-auto font-semibold shadow-2xl hover:shadow-novora-500/25 transition-all duration-300 transform hover:scale-105 border-0">
                      <span className="relative z-10 flex items-center gap-2">
                        Start Free Trial
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-novora-600 to-teal-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    className="group text-slate-700 border-2 border-slate-300 hover:border-novora-600 hover:text-novora-600 text-lg px-8 py-6 h-auto font-semibold transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm"
                    onClick={() => setShowLoginForm(!showLoginForm)}
                  >
                    <span className="flex items-center gap-2">
                      Sign In
                      <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </span>
                  </Button>
                  
                  <Link to="/book" onClick={handleButtonClick}>
                    <Button variant="ghost" className="group text-slate-600 hover:text-novora-600 text-lg px-8 py-6 h-auto font-semibold transition-all duration-300">
                      <span className="flex items-center gap-2">
                        Book Demo
                        <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </AnimateOnScroll>

              {/* Login Form */}
              {showLoginForm && (
                <AnimateOnScroll>
                  <Card className="max-w-md mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold text-slate-900">Welcome Back</CardTitle>
                      <CardDescription className="text-slate-600">
                        Access your enterprise dashboard
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 h-12 border-slate-200 focus:border-novora-500 focus:ring-novora-500"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 pr-10 h-12 border-slate-200 focus:border-novora-500 focus:ring-novora-500"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-slate-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-slate-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-novora-600 to-teal-600 text-white hover:from-novora-700 hover:to-teal-700 h-12 font-semibold shadow-lg"
                          disabled={isLoading}
                        >
                          {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>
                    </CardContent>
                    <CardFooter className="flex justify-center pt-0">
                      <Link to="/auth/forgot-password" className="text-sm text-novora-600 hover:text-novora-700 font-medium transition-colors">
                        Forgot your password?
                      </Link>
                    </CardFooter>
                  </Card>
                </AnimateOnScroll>
              )}
            </div>
          </div>
          
          {/* Premium wave separator */}
          <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
            <svg
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
              className="absolute bottom-0 left-0 w-full h-full text-white fill-current"
            >
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
            </svg>
          </div>
        </section>



        {/* Feature Highlights */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-novora-50 border border-novora-200 rounded-full text-sm font-semibold text-novora-700 mb-6">
                  <Star className="w-4 h-4" />
                  Enterprise Features
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-6">
                  Powerful Tools for <span className="bg-gradient-to-r from-novora-600 to-teal-600 bg-clip-text text-transparent">Modern Teams</span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Everything you need to stay organized, collaborate effectively, and drive business growth with enterprise-grade reliability.
                </p>
              </div>
            </AnimateOnScroll>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<BarChart size={28} />}
                title="Advanced Analytics"
                description="Gain valuable insights with real-time data visualization and customizable dashboards."
                linkText="Learn more"
                linkHref="/features"
                onClick={handleButtonClick}
                delay={1}
              />
              <FeatureCard
                icon={<MessageSquare size={28} />}
                title="Survey Tools"
                description="Create and distribute surveys to collect feedback and make data-driven decisions."
                linkText="Learn more"
                linkHref="/features"
                onClick={handleButtonClick}
                delay={2}
              />
              <FeatureCard
                icon={<Bell size={28} />}
                title="Smart Alerts"
                description="Stay informed with customizable notifications when important events occur."
                linkText="Learn more"
                linkHref="/features"
                onClick={handleButtonClick}
                delay={3}
              />
              <FeatureCard
                icon={<FileText size={28} />}
                title="Detailed Reports"
                description="Generate comprehensive reports with just a few clicks to share with stakeholders."
                linkText="Learn more"
                linkHref="/features"
                onClick={handleButtonClick}
                delay={4}
              />
            </div>
          </div>
        </section>

        {/* Advanced Features Grid */}
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-6">
                  Enterprise-Grade <span className="bg-gradient-to-r from-novora-600 to-teal-600 bg-clip-text text-transparent">Capabilities</span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  Built for scale, security, and performance with advanced features that enterprise teams demand.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimateOnScroll delay={1}>
                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-novora-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                      <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">AI-Powered Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      Leverage machine learning algorithms to uncover hidden patterns and predict trends with 95% accuracy.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-novora-600 font-medium">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              <AnimateOnScroll delay={2}>
                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-novora-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                      <Database className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">Real-time Processing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      Process millions of data points in real-time with sub-second latency for instant decision making.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-novora-600 font-medium">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              <AnimateOnScroll delay={3}>
                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-novora-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                      <LockIcon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">Bank-Level Security</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      Enterprise-grade encryption, multi-factor authentication, and compliance with global security standards.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-novora-600 font-medium">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              <AnimateOnScroll delay={4}>
                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-novora-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                      <GlobeIcon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">Global Infrastructure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      Deployed across 20+ data centers worldwide ensuring lightning-fast performance and 99.99% availability.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-novora-600 font-medium">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              <AnimateOnScroll delay={5}>
                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-novora-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">Predictive Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      Forecast trends and identify opportunities with advanced predictive modeling and scenario planning.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-novora-600 font-medium">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              <AnimateOnScroll delay={6}>
                <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-novora-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">Team Collaboration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      Seamless collaboration with role-based access, real-time commenting, and integrated workflow management.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-novora-600 font-medium">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Early Access Benefits */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="text-center mb-12">
                <h3 className="text-2xl font-heading font-bold text-slate-900 mb-4">
                  Early Access Benefits
                </h3>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Be among the first to experience the future of business intelligence with exclusive launch benefits
                </p>
              </div>
            </AnimateOnScroll>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <AnimateOnScroll delay={1}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-novora-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Launch Pricing</h4>
                  <p className="text-slate-600 text-sm">
                    Lock in special early adopter rates before prices increase
                  </p>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={2}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-novora-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Priority Support</h4>
                  <p className="text-slate-600 text-sm">
                    Direct access to our founding team for personalized assistance
                  </p>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={3}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-novora-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Feature Requests</h4>
                  <p className="text-slate-600 text-sm">
                    Help shape the product roadmap with direct input on new features
                  </p>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-6">
                  How Novora <span className="bg-gradient-to-r from-novora-600 to-teal-600 bg-clip-text text-transparent">Works</span>
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                  A simple three-step process to transform your team's productivity and drive business growth
                </p>
              </div>
            </AnimateOnScroll>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <AnimateOnScroll delay={1}>
                <div className="text-center px-6 group">
                  <div className="relative mb-8">
                    <div className="bg-gradient-to-br from-novora-500 to-teal-500 w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                      1
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-novora-600 to-teal-600 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">Sign Up</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Create your account and set up your team members with personalized access levels and enterprise-grade security.
                  </p>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={2}>
                <div className="text-center px-6 group">
                  <div className="relative mb-8">
                    <div className="bg-gradient-to-br from-novora-500 to-teal-500 w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                      2
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-novora-600 to-teal-600 rounded-full flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">Customize</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Tailor dashboards, reports, and notifications to match your specific business needs and workflows.
                  </p>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={3}>
                <div className="text-center px-6 group">
                  <div className="relative mb-8">
                    <div className="bg-gradient-to-br from-novora-500 to-teal-500 w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                      3
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-novora-600 to-teal-600 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">Analyze & Grow</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Make data-driven decisions using Novora's powerful analytics and drive unprecedented business growth.
                  </p>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 bg-gradient-to-br from-slate-50 via-novora-50/20 to-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="max-w-5xl mx-auto text-center">
                <div className="mb-8">
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <svg
                    className="w-16 h-16 text-novora-200 mx-auto mb-6"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                <p className="text-3xl font-medium text-slate-800 mb-10 leading-relaxed max-w-4xl mx-auto">
                  "We're excited to be launching Novora to help teams transform their business intelligence capabilities. Our platform is designed from the ground up to deliver enterprise-grade performance with the simplicity modern teams demand."
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-novora-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    NT
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-slate-900">Novora Team</p>
                    <p className="text-slate-600">Building the future of business intelligence</p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-br from-novora-900 via-novora-800 to-slate-900 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.08),transparent_50%)]"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-8 leading-tight">
                  Ready to transform your <span className="bg-gradient-to-r from-novora-400 to-teal-400 bg-clip-text text-transparent">workflow</span>?
                </h2>
                <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto mb-12 leading-relaxed">
                  Join thousands of teams already using Novora to streamline their operations and drive unprecedented growth.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                  <Link to="/auth/signup" onClick={handleButtonClick}>
                    <Button className="group bg-gradient-to-r from-novora-500 to-teal-500 text-white hover:from-novora-600 hover:to-teal-600 text-lg px-10 py-6 h-auto font-semibold shadow-2xl hover:shadow-novora-500/25 transition-all duration-300 transform hover:scale-105 border-0">
                      <span className="relative z-10 flex items-center gap-3">
                        Start Free Trial
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-novora-500 to-teal-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                    </Button>
                  </Link>
                  <Link to="/book" onClick={handleButtonClick}>
                    <Button variant="outline" className="text-white border-2 border-white/30 hover:bg-white/10 text-lg px-10 py-6 h-auto font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                      <span className="flex items-center gap-3">
                        Book a Demo
                        <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Index;

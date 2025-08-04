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
  EyeOff
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
      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-32 bg-gradient-to-b from-novora-200 via-novora-100/60 to-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-gradient-to-br from-teal-500/20 to-novora-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-56 h-56 bg-gradient-to-tr from-novora-400/20 to-teal-500/20 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-3/4 mx-auto text-center">
                <AnimateOnScroll>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6">
                    <span className="block">Streamline your workflow</span>
                    <span className="block">with <span className="bg-gradient-to-r from-novora-600 to-teal-500 bg-clip-text text-transparent">Novora</span></span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
                    The all-in-one platform that helps teams collaborate, analyze data, and deliver exceptional results.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link to="/auth/signup" onClick={handleButtonClick}>
                      <Button className="bg-gradient-to-r from-novora-600 to-teal-500 text-white hover:from-novora-700 hover:to-teal-600 text-base px-6 py-6 h-auto font-medium shadow-lg hover:shadow-xl transition-all">
                        Start Free Trial
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="text-gray-900 border-2 border-gray-900 hover:bg-novora-600 hover:border-novora-600 hover:text-white text-base px-6 py-6 h-auto font-medium transition-colors"
                      onClick={() => setShowLoginForm(!showLoginForm)}
                    >
                      Sign In
                    </Button>
                    <Link to="/book" onClick={handleButtonClick}>
                      <Button variant="outline" className="text-gray-900 border-2 border-gray-900 hover:bg-novora-600 hover:border-novora-600 hover:text-white text-base px-6 py-6 h-auto font-medium transition-colors">
                        Book a Meeting
                      </Button>
                    </Link>
                  </div>

                  {/* Login Form */}
                  {showLoginForm && (
                    <AnimateOnScroll>
                      <Card className="max-w-md mx-auto mt-8 shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-center">Welcome Back</CardTitle>
                          <CardDescription className="text-center">
                            Sign in to access your dashboard
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                              <label htmlFor="email" className="text-sm font-medium">
                                Email
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="Enter your email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="pl-10"
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="password" className="text-sm font-medium">
                                Password
                              </label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  className="pl-10 pr-10"
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
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <Button
                              type="submit"
                              className="w-full bg-gradient-to-r from-novora-600 to-teal-500 text-white hover:from-novora-700 hover:to-teal-600"
                              disabled={isLoading}
                            >
                              {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                          </form>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                          <Link to="/auth/forgot-password" className="text-sm text-novora-600 hover:underline">
                            Forgot your password?
                          </Link>
                        </CardFooter>
                      </Card>
                    </AnimateOnScroll>
                  )}
                </AnimateOnScroll>
              </div>
            </div>
          </div>
          
          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
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
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <h2 className="text-3xl font-heading font-bold text-center mb-4">
                Powerful Features for Modern Teams
              </h2>
              <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-12">
                Everything you need to stay organized, collaborate effectively, and drive business growth.
              </p>
            </AnimateOnScroll>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<BarChart size={24} />}
                title="Advanced Analytics"
                description="Gain valuable insights with real-time data visualization and customizable dashboards."
                linkText="Learn more"
                linkHref="/features"
                onClick={handleButtonClick}
                delay={1}
              />
              <FeatureCard
                icon={<MessageSquare size={24} />}
                title="Survey Tools"
                description="Create and distribute surveys to collect feedback and make data-driven decisions."
                linkText="Learn more"
                linkHref="/features"
                onClick={handleButtonClick}
                delay={2}
              />
              <FeatureCard
                icon={<Bell size={24} />}
                title="Smart Alerts"
                description="Stay informed with customizable notifications when important events occur."
                linkText="Learn more"
                linkHref="/features"
                onClick={handleButtonClick}
                delay={3}
              />
              <FeatureCard
                icon={<FileText size={24} />}
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

        {/* Logos */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <p className="text-center text-gray-500 font-medium mb-8">
                Trusted by innovative companies worldwide
              </p>
            </AnimateOnScroll>
            
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-70">
              <AnimateOnScroll delay={1}>
                <div className="flex items-center justify-center h-12">
                  <span className="font-bold text-xl text-gray-400">ACME Inc</span>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={2}>
                <div className="flex items-center justify-center h-12">
                  <span className="font-bold text-xl text-gray-400">TechCorp</span>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={3}>
                <div className="flex items-center justify-center h-12">
                  <span className="font-bold text-xl text-gray-400">GlobalFirm</span>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={4}>
                <div className="flex items-center justify-center h-12">
                  <span className="font-bold text-xl text-gray-400">InnovateLabs</span>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={5}>
                <div className="flex items-center justify-center h-12">
                  <span className="font-bold text-xl text-gray-400">FutureTech</span>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <h2 className="text-3xl font-heading font-bold text-center mb-4">
                How Novora Works
              </h2>
              <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto mb-16">
                A simple three-step process to transform your team's productivity
              </p>
            </AnimateOnScroll>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimateOnScroll delay={1}>
                <div className="text-center px-4">
                  <div className="bg-novora-50 w-16 h-16 rounded-full flex items-center justify-center text-novora-600 font-bold text-xl mx-auto mb-6">1</div>
                  <h3 className="text-xl font-bold mb-3">Sign Up</h3>
                  <p className="text-gray-600">
                    Create your account and set up your team members with personalized access levels.
                  </p>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={2}>
                <div className="text-center px-4">
                  <div className="bg-novora-50 w-16 h-16 rounded-full flex items-center justify-center text-novora-600 font-bold text-xl mx-auto mb-6">2</div>
                  <h3 className="text-xl font-bold mb-3">Customize</h3>
                  <p className="text-gray-600">
                    Tailor dashboards, reports, and notifications to match your specific business needs.
                  </p>
                </div>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={3}>
                <div className="text-center px-4">
                  <div className="bg-novora-50 w-16 h-16 rounded-full flex items-center justify-center text-novora-600 font-bold text-xl mx-auto mb-6">3</div>
                  <h3 className="text-xl font-bold mb-3">Analyze & Grow</h3>
                  <p className="text-gray-600">
                    Make data-driven decisions using Novora's powerful analytics and drive business growth.
                  </p>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto text-center">
                <svg
                  className="w-12 h-12 text-novora-200 mx-auto mb-4"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-2xl font-medium text-gray-800 mb-8">
                  "Novora has revolutionized how our team manages projects and analyzes data. The customizable dashboards and alerts system have increased our efficiency by over 40%."
                </p>
                <div>
                  <p className="font-bold">Sarah Johnson</p>
                  <p className="text-gray-600">CTO, InnovateCorp</p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-novora-900 to-novora-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <AnimateOnScroll>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                Ready to transform your workflow?
              </h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
                Join thousands of teams already using Novora to streamline their operations and drive growth.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/auth/signup" onClick={handleButtonClick}>
                  <Button className="bg-gradient-to-r from-novora-600 to-teal-500 text-white hover:from-novora-700 hover:to-teal-600 text-base px-6 py-6 h-auto font-medium shadow-lg hover:shadow-xl transition-all">
                    Start Free Trial
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/book" onClick={handleButtonClick}>
                  <Button variant="outline" className="text-gray-900 border-2 border-gray-900 hover:bg-novora-600 hover:border-novora-600 hover:text-white text-base px-6 py-6 h-auto font-medium transition-colors">
                    Book a Meeting
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

export default Index;

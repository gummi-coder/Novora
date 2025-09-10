import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  Users,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

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

const MVPSignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // For MVP, we'll use a simple mock login
      // In production, this would connect to your backend
      if (email && password) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful login
        const mockUser = {
          id: "mvp-user-1",
          email: email,
          firstName: "MVP",
          lastName: "User",
          role: "manager",
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem("mvp_token", "mvp-demo-token");
        localStorage.setItem("mvp_user", JSON.stringify(mockUser));
        
        toast.success(t('mvp.signin.success.message'));
        navigate("/mvp-dashboard");
      } else {
        toast.error(t('mvp.signin.error.credentials'));
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t('mvp.signin.error.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-novora-50/30 to-white flex items-center justify-center p-4">
      {/* Background decorative elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.08),transparent_50%)]"></div>
        
        {/* Floating shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-novora-400/20 to-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-novora-300/15 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Language Selector */}
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/mvp" className="inline-block mb-6">
            <div className="text-3xl font-bold bg-gradient-to-r from-novora-600 via-novora-700 to-teal-600 bg-clip-text text-transparent">
              {t('mvp.brand')}
            </div>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-novora-600/10 to-teal-500/10 border border-novora-200/50 rounded-full text-xs font-medium text-novora-700 mb-4">
            <Shield className="w-3 h-3" />
            {t('mvp.badge')} Access
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {t('mvp.signin.title')}
          </h1>
          <p className="text-slate-600">
            {t('mvp.signin.subtitle')}
          </p>
        </div>

        {/* Sign In Form */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-slate-900">{t('mvp.signin.form.title')}</CardTitle>
            <CardDescription>
              {t('mvp.signin.form.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('mvp.signin.email.label')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('mvp.signin.email.placeholder')}
                    className="pl-10 border-slate-300 focus:border-novora-500 focus:ring-novora-500"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('mvp.signin.password.label')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('mvp.signin.password.placeholder')}
                    className="pl-10 pr-10 border-slate-300 focus:border-novora-500 focus:ring-novora-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-novora-600 hover:bg-novora-700 text-white py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('mvp.signin.button.signing')}
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {t('mvp.signin.button.text')}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Demo Access */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">{t('mvp.signin.demo.title')}</h3>
              <p className="text-xs text-slate-600 mb-3">
                {t('mvp.signin.demo.description')}
              </p>
              <div className="text-xs text-slate-500 space-y-1">
                <div>{t('mvp.signin.demo.email')} <span className="font-mono bg-slate-200 px-1 rounded">demo@example.com</span></div>
                <div>{t('mvp.signin.demo.password')} <span className="font-mono bg-slate-200 px-1 rounded">any-password</span></div>
              </div>
            </div>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <Link 
                to="/mvp" 
                className="text-sm text-novora-600 hover:text-novora-700 hover:underline"
              >
                {t('mvp.signin.back.link')}
              </Link>
              <div className="text-xs text-slate-500">
                {t('mvp.signin.no.access')} <Link to="/mvp-signup" className="text-novora-600 hover:underline">{t('mvp.signin.create.account')}</Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MVP Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Shield className="w-8 h-8 text-novora-600 mb-2" />
            <span className="text-xs text-slate-600">{t('mvp.signin.benefits.anonymous')}</span>
          </div>
          <div className="flex flex-col items-center">
            <TrendingUp className="w-8 h-8 text-novora-600 mb-2" />
            <span className="text-xs text-slate-600">{t('mvp.signin.benefits.insights')}</span>
          </div>
          <div className="flex flex-col items-center">
            <CheckCircle className="w-8 h-8 text-novora-600 mb-2" />
            <span className="text-xs text-slate-600">{t('mvp.signin.benefits.actionable')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MVPSignIn;

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
  User,
  Building,
  ArrowRight,
  Shield,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const MVPSignUp = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error(t('mvp.signup.error.passwords'));
        return;
      }

      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.companyName || !formData.password) {
        toast.error(t('mvp.signup.error.required'));
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful signup
      const mockUser = {
        id: "mvp-user-new",
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: "manager",
        status: "active",
        companyName: formData.companyName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem("mvp_token", "mvp-demo-token");
      localStorage.setItem("mvp_user", JSON.stringify(mockUser));
      
      toast.success(t('mvp.signup.success.message'));
      navigate("/mvp-dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(t('mvp.signup.error.failed'));
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
      
      <div className="relative z-10 w-full max-w-lg">
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
            {t('mvp.badge')} Registration
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {t('mvp.signup.title')}
          </h1>
          <p className="text-slate-600">
            {t('mvp.signup.subtitle')}
          </p>
        </div>

        {/* Sign Up Form */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-slate-900">{t('mvp.signup.form.title')}</CardTitle>
            <CardDescription>
              {t('mvp.signup.form.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                    {t('mvp.signup.firstname.label')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder={t('mvp.signup.firstname.placeholder')}
                      className="pl-10 border-slate-300 focus:border-novora-500 focus:ring-novora-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                    {t('mvp.signup.lastname.label')} *
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={t('mvp.signup.lastname.placeholder')}
                    className="border-slate-300 focus:border-novora-500 focus:ring-novora-500"
                    required
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('mvp.signup.company.label')} *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder={t('mvp.signup.company.placeholder')}
                    className="pl-10 border-slate-300 focus:border-novora-500 focus:ring-novora-500"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  {t('mvp.signup.email.label')} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('mvp.signup.email.placeholder')}
                    className="pl-10 border-slate-300 focus:border-novora-500 focus:ring-novora-500"
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    {t('mvp.signup.password.label')} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={t('mvp.signup.password.placeholder')}
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
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                    {t('mvp.signup.confirmpassword.label')} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder={t('mvp.signup.confirmpassword.placeholder')}
                      className="pl-10 pr-10 border-slate-300 focus:border-novora-500 focus:ring-novora-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-novora-600 hover:bg-novora-700 text-white py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('mvp.signup.button.creating')}
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {t('mvp.signup.button.text')}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* MVP Benefits */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('mvp.signup.benefits.title')}</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-novora-600" />
                  <span>{t('mvp.signup.benefits.anonymous')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-novora-600" />
                  <span>{t('mvp.signup.benefits.insights')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-novora-600" />
                  <span>{t('mvp.signup.benefits.privacy')}</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <div className="text-sm text-slate-600">
                {t('mvp.signup.already.have')}{" "}
                <Link to="/mvp-signin" className="text-novora-600 hover:text-novora-700 hover:underline">
                  {t('mvp.signup.signin.link')}
                </Link>
              </div>
              <Link 
                to="/mvp" 
                className="text-sm text-novora-600 hover:text-novora-700 hover:underline"
              >
                {t('mvp.signup.back.link')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MVPSignUp;

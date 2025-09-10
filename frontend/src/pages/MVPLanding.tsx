import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, 
  Shield, 
  Clock, 
  TrendingUp, 
  Users, 
  Lock,
  CheckCircle,
  BarChart3,
  Sparkles,
  Award,
  Zap,
  MessageSquare,
  Target,
  Star
} from "lucide-react";
import MVPFooter from "@/components/MVPFooter";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const MVPLanding = () => {
  const { t } = useLanguage();

  return (
    <>
      {/* MVP Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-novora-600">{t('mvp.brand')}</div>
              <div className="px-2 py-1 bg-gradient-to-r from-novora-100 to-blue-100 text-novora-700 text-xs font-medium rounded-full border border-novora-200">
                {t('mvp.badge')}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <LanguageSelector />
              <Link to="/mvp-dashboard?demo=1">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-novora-600">
                  {t('mvp.nav.demo')}
                </Button>
              </Link>
              <Link to="/mvp-signin">
                <Button className="bg-novora-600 hover:bg-novora-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                  {t('mvp.nav.start.pilot')}
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-novora-50/30 to-white overflow-hidden">
          {/* Premium decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.08),transparent_50%)]"></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-novora-400/20 to-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-novora-300/15 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-novora-500/10 to-blue-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%230284c7%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-6xl mx-auto">
              {/* Launch badge */}
              <AnimateOnScroll>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-novora-600/10 to-blue-500/10 border border-novora-200/50 rounded-full text-sm font-medium text-novora-700 mb-8 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-novora-600" />
                  <span>{t('mvp.pilot.badge')}</span>
                  <Award className="w-4 h-4 text-blue-500" />
                </div>
              </AnimateOnScroll>

              {/* Main headline */}
              <AnimateOnScroll>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1] mb-8 tracking-tight">
                  <span className="block text-slate-900">{t('mvp.hero.title.line1')}</span>
                  <span className="block bg-gradient-to-r from-novora-600 via-novora-700 to-blue-600 bg-clip-text text-transparent">
                    {t('mvp.hero.title.line2')}
                  </span>
                  <span className="block text-slate-900">{t('mvp.hero.title.line3')}</span>
                </h1>
              </AnimateOnScroll>

              {/* Subtitle */}
              <AnimateOnScroll delay={0.2}>
                <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
                  {t('mvp.hero.subtitle')}
                  <span className="font-medium text-slate-800"> {t('mvp.hero.subtitle.bold1')}</span> with 
                  <span className="font-medium text-slate-800"> {t('mvp.hero.subtitle.bold2')}</span>.
                </p>
              </AnimateOnScroll>

              {/* Key benefits */}
              <AnimateOnScroll delay={0.4}>
                <div className="flex flex-wrap justify-center items-center gap-6 mb-12 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-novora-600" />
                    <span>{t('mvp.hero.benefit1')}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>{t('mvp.hero.benefit2')}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-novora-600" />
                    <span>{t('mvp.hero.benefit3')}</span>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* CTA Buttons */}
              <AnimateOnScroll delay={0.6}>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
                  <Link to="/mvp-signin">
                    <Button className="group relative bg-novora-600 hover:bg-novora-700 text-white text-lg px-8 py-6 h-auto font-semibold shadow-2xl hover:shadow-novora-500/25 transition-all duration-300 transform hover:scale-105 border-0">
                      <span className="relative z-10 flex items-center gap-2">
                        {t('mvp.hero.cta.primary')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                  
                  <Link to="/mvp-dashboard?demo=1">
                    <Button 
                      variant="outline" 
                      className="group text-slate-700 border-2 border-slate-300 hover:border-novora-600 hover:text-novora-600 text-lg px-8 py-6 h-auto font-semibold transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm"
                    >
                      <span className="flex items-center gap-2">
                        {t('mvp.hero.cta.secondary')}
                        <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  {t('mvp.how.title')}
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  {t('mvp.how.subtitle')}
                </p>
              </div>
            </AnimateOnScroll>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <AnimateOnScroll delay={0.2}>
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-br from-novora-100 to-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold bg-gradient-to-r from-novora-600 to-blue-600 bg-clip-text text-transparent">1</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">{t('mvp.how.step1.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-lg">{t('mvp.how.step1.desc')}</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={0.4}>
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-br from-novora-100 to-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold bg-gradient-to-r from-novora-600 to-blue-600 bg-clip-text text-transparent">2</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">{t('mvp.how.step2.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-lg">{t('mvp.how.step2.desc')}</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={0.6}>
                <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-br from-novora-100 to-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold bg-gradient-to-r from-novora-600 to-blue-600 bg-clip-text text-transparent">3</span>
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">{t('mvp.how.step3.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 text-lg">{t('mvp.how.step3.desc')}</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Trust / Anonymity Section */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto text-center">
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="bg-gradient-to-br from-novora-100 to-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-12 h-12 text-novora-600" />
                    </div>
                    <CardTitle className="text-4xl font-bold text-slate-900 mb-4">
                      {t('mvp.trust.title')}
                    </CardTitle>
                    <CardDescription className="text-xl text-slate-600">
                      {t('mvp.trust.subtitle')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <div className="flex items-center gap-2 text-slate-700 text-lg">
                        <Lock className="h-6 w-6 text-novora-600" />
                        <span>{t('mvp.trust.feature')}</span>
                      </div>
                      <Link to="/privacy" className="text-novora-600 hover:text-novora-700 hover:underline font-medium">
                        {t('mvp.trust.link')}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Value Props */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  {t('mvp.value.title')}
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  {t('mvp.value.subtitle')}
                </p>
              </div>
            </AnimateOnScroll>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <AnimateOnScroll delay={0.2}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader>
                    <div className="bg-gradient-to-br from-novora-100 to-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-novora-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{t('mvp.value.fast.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{t('mvp.value.fast.desc')}</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={0.4}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader>
                    <div className="bg-gradient-to-br from-novora-100 to-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                      <Target className="w-8 h-8 text-novora-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{t('mvp.value.insights.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{t('mvp.value.insights.desc')}</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={0.6}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader>
                    <div className="bg-gradient-to-br from-novora-100 to-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-8 h-8 text-novora-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{t('mvp.value.trends.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{t('mvp.value.trends.desc')}</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={0.8}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardHeader>
                    <div className="bg-gradient-to-br from-novora-100 to-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-novora-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{t('mvp.value.fix.title')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{t('mvp.value.fix.desc')}</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                </div>
                <p className="text-xl text-slate-700 font-medium">
                  {t('mvp.social.text')}
                </p>
                <p className="text-slate-600 mt-2">
                  {t('mvp.social.subtext')}
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                  {t('mvp.faq.title')}
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  {t('mvp.faq.subtitle')}
                </p>
              </div>
            </AnimateOnScroll>
            
            <div className="max-w-4xl mx-auto space-y-8">
              <AnimateOnScroll delay={0.2}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-900">{t('mvp.faq.q1')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{t('mvp.faq.a1')}</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={0.4}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-900">{t('mvp.faq.q2')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{t('mvp.faq.a2')}</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
              
              <AnimateOnScroll delay={0.6}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-900">{t('mvp.faq.q3')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{t('mvp.faq.a3')}</p>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-novora-600 to-blue-600">
          <div className="container mx-auto px-4">
            <AnimateOnScroll>
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  {t('mvp.cta.title')}
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  {t('mvp.cta.subtitle')}
                </p>
                <Link to="/mvp-signin">
                  <Button size="lg" className="bg-white text-novora-600 hover:bg-blue-50 px-8 py-6 h-auto text-lg font-semibold shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105">
                    {t('mvp.cta.button')}
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </main>
      <MVPFooter />
    </>
  );
};

export default MVPLanding;

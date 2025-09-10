import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Copy, 
  Mail, 
  TrendingUp, 
  Shield,
  Activity,
  Target,
  Clock,
  Star,
  LogOut,
  Bell,
  MessageCircle,
  Smartphone,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";
import { userSurveyService } from "@/services/userSurveyService";

// Mock data for MVP demo
const mockData = {
  surveys: [
    {
      id: 1,
      title: "Team Pulse Survey - Week 1",
      responseCount: 12, // Reached max submissions
      teamSize: 12,
      minRequired: 5,
      maxSubmissions: 12, // Company size = max submissions
      averageScore: 7.8,
      previousScore: 7.2,
      trend: "up",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      link: "https://novora.com/s/abc123",
      questionBreakdown: {
        mood: { score: 7.5, responses: 10, locked: false },
        managerSupport: { score: 8.2, responses: 3, locked: true },
        workload: { score: 6.8, responses: 4, locked: true },
        recognition: { score: 7.9, responses: 3, locked: true }
      },
      comments: [
        "Great team collaboration, but could use more flexible working hours",
        "Love the new project management tools, really helping with organization",
        "Communication has improved significantly this month",
        "Would appreciate more opportunities for skill development",
        "Team meetings are productive and well-structured",
        "The new office setup is working really well",
        "Could use more feedback on individual performance",
        "Overall very satisfied with the current work environment",
        "The new coffee machine in the break room is a great addition",
        "Would love to see more team building activities outside of work"
      ]
    },
    {
      id: 2,
      title: "Team Pulse Survey - Week 2",
      responseCount: 3,
      teamSize: 12,
      minRequired: 5,
      maxSubmissions: 12, // Company size = max submissions
      averageScore: 6.5,
      previousScore: 7.8,
      trend: "down",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      link: "https://novora.com/s/def456",
      questionBreakdown: {
        mood: { score: 6.5, responses: 3, locked: true },
        managerSupport: { score: 7.2, responses: 3, locked: true },
        workload: { score: 5.8, responses: 3, locked: true },
        recognition: { score: 6.9, responses: 3, locked: true }
      },
      comments: [
        "Workload seems heavier this week",
        "Need more support from management"
      ]
    },
    {
      id: 3,
      title: "Team Pulse Survey - Week 4",
      responseCount: 0,
      teamSize: 12,
      minRequired: 5,
      maxSubmissions: 12, // Company size = max submissions
      averageScore: 0,
      previousScore: 6.5,
      trend: "up",
      createdAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day in the future (not started yet)
      link: "https://novora.com/s/ghi789",
      questionBreakdown: {
        mood: { score: 0, responses: 0, locked: true },
        managerSupport: { score: 0, responses: 0, locked: true },
        workload: { score: 0, responses: 0, locked: true },
        recognition: { score: 0, responses: 0, locked: true }
      },
      comments: []
    }
  ],
  currentSurveyIndex: 0
};

const MVPDashboard = () => {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === '1';
  const [currentSurveyIndex, setCurrentSurveyIndex] = useState(0);
  const { t } = useLanguage();

  // Get user info for logged-in users
  const getUserInfo = () => {
    if (isDemo) return null;
    const userStr = localStorage.getItem('mvp_user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const user = getUserInfo();
  const isLoggedIn = !isDemo && user;

  const currentSurvey = mockData.surveys[currentSurveyIndex];
  const canShowResults = currentSurvey.responseCount >= currentSurvey.minRequired;

  // Calculate days remaining (7 days from creation)
  const getDaysRemaining = (createdAt: Date) => {
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 7 - daysSinceCreation);
    return daysRemaining;
  };

  const daysRemaining = getDaysRemaining(currentSurvey.createdAt);

  // Check if a survey is completed (has enough responses or time expired)
  const isSurveyCompleted = (survey: any) => {
    const daysSinceCreation = Math.floor((new Date().getTime() - survey.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return survey.responseCount >= survey.minRequired || daysSinceCreation >= 7;
  };

  // Check if a survey is closed due to reaching submission limit
  const isSurveyClosed = (survey: any): boolean => {
    return survey.responseCount >= survey.maxSubmissions;
  };

  // Get available surveys (completed surveys + next available survey)
  const getAvailableSurveys = () => {
    const available = [];
    let foundIncomplete = false;
    
    for (let i = 0; i < mockData.surveys.length; i++) {
      const survey = mockData.surveys[i];
      const isCompleted = isSurveyCompleted(survey);
      
      if (isCompleted) {
        available.push({ ...survey, index: i, status: 'completed' });
      } else if (!foundIncomplete) {
        available.push({ ...survey, index: i, status: 'active' });
        foundIncomplete = true;
      }
    }
    
    return available;
  };

  const availableSurveys = getAvailableSurveys();
  const maxAvailableIndex = Math.max(...availableSurveys.map(s => s.index));

  // Generate user-specific survey links
  const generateUserSurveyLink = async (surveyId: number): Promise<string> => {
    if (isDemo) {
      // Demo uses static links
      return mockData.surveys[surveyId - 1]?.link || 'https://novora.com/s/demo';
    }
    
    if (!user) {
      return 'https://novora.com/s/login-required';
    }

    // For MVP, use client-side generation (backend integration can be added later)
    const randomString = Math.random().toString(36).substring(2, 15);
    const userToken = `${user.id}_${surveyId}_${randomString}`;
    return `http://localhost:3001/survey/${userToken}`;
  };

  // Synchronous version for display (cached)
  const [surveyLinks, setSurveyLinks] = useState<Record<number, string>>({});
  
  const getSurveyLink = (surveyId: number): string => {
    if (isDemo) {
      return mockData.surveys[surveyId - 1]?.link || 'https://novora.com/s/demo';
    }
    
    if (!user) {
      return 'https://novora.com/s/login-required';
    }

    // Return cached link or generate new one
    if (surveyLinks[surveyId]) {
      return surveyLinks[surveyId];
    }

    // Generate link immediately (synchronous for display)
    const randomString = Math.random().toString(36).substring(2, 15);
    const userToken = `${user.id}_${surveyId}_${randomString}`;
    const link = `http://localhost:3001/survey/${userToken}`;
    
    // Cache the link
    setSurveyLinks(prev => ({ ...prev, [surveyId]: link }));
    
    return link;
  };

  // Color coding for scores: 0-5: danger, 5-7: warning, 7-10: success
  const getScoreColor = (score: number) => {
    if (score <= 5) return '#ef4444'; // red-500
    if (score <= 7) return '#f59e0b'; // amber-500
    return '#10b981'; // emerald-500
  };

  const copySurveyLink = () => {
    const userSpecificLink = getSurveyLink(currentSurvey.id);
    console.log('Generated survey link:', userSpecificLink);
    console.log('User info:', user);
    console.log('Is demo:', isDemo);
    navigator.clipboard.writeText(userSpecificLink);
    toast.success("Survey link copied to clipboard!");
  };

  const nextSurvey = () => {
    const currentAvailableIndex = availableSurveys.findIndex(s => s.index === currentSurveyIndex);
    if (currentAvailableIndex < availableSurveys.length - 1) {
      const nextSurvey = availableSurveys[currentAvailableIndex + 1];
      setCurrentSurveyIndex(nextSurvey.index);
    }
  };

  const prevSurvey = () => {
    const currentAvailableIndex = availableSurveys.findIndex(s => s.index === currentSurveyIndex);
    if (currentAvailableIndex > 0) {
      const prevSurvey = availableSurveys[currentAvailableIndex - 1];
      setCurrentSurveyIndex(prevSurvey.index);
    }
  };

  const shareViaWhatsApp = () => {
    const userSpecificLink = getSurveyLink(currentSurvey.id);
    const message = t('mvp.dashboard.share.whatsapp.message').replace('{LINK}', userSpecificLink);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const userSpecificLink = getSurveyLink(currentSurvey.id);
    const subject = t('mvp.dashboard.share.email.subject');
    const body = t('mvp.dashboard.share.email.body').replace('{LINK}', userSpecificLink);
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
  };

  const shareViaSMS = () => {
    const userSpecificLink = getSurveyLink(currentSurvey.id);
    const message = t('mvp.dashboard.share.sms.message').replace('{LINK}', userSpecificLink);
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_blank');
  };

  const sendEmailReminder = () => {
    const userSpecificLink = getSurveyLink(currentSurvey.id);
    const subject = t('mvp.dashboard.reminder.email.subject');
    const body = t('mvp.dashboard.reminder.email.body').replace('{LINK}', userSpecificLink);
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
  };

  const sendSMSReminder = () => {
    const userSpecificLink = getSurveyLink(currentSurvey.id);
    const message = t('mvp.dashboard.reminder.sms.message').replace('{LINK}', userSpecificLink);
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_blank');
  };

  const sendWhatsAppReminder = () => {
    const userSpecificLink = getSurveyLink(currentSurvey.id);
    const message = t('mvp.dashboard.reminder.whatsapp.message').replace('{LINK}', userSpecificLink);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem("mvp_token");
    localStorage.removeItem("mvp_user");
    window.location.href = "/mvp";
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
              {isDemo && (
                <>
                  <Link to="/mvp-dashboard?demo=1">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-novora-600">
                      {t('mvp.nav.demo.mode')}
                    </Button>
                  </Link>
                  <Link to="/mvp">
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-novora-600">
                      {t('mvp.nav.back.landing')}
                    </Button>
                  </Link>
                </>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-slate-600 hover:text-novora-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('mvp.nav.logout')}
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('mvp.dashboard.title')}</h1>
          <p className="text-slate-600">{t('mvp.dashboard.subtitle')}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{t('mvp.dashboard.kpi.responses')}</CardTitle>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{currentSurvey.responseCount}</div>
              <p className="text-xs text-slate-500 mt-1">
                {currentSurvey.responseCount >= currentSurvey.minRequired ? t('mvp.dashboard.kpi.results.visible') : `${currentSurvey.minRequired - currentSurvey.responseCount} ${t('mvp.dashboard.kpi.more.needed')}`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{t('mvp.dashboard.kpi.score')}</CardTitle>
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{currentSurvey.averageScore}</div>
              <div className="flex items-center text-xs text-slate-500 mt-1">
                <TrendingUp className={`h-3 w-3 mr-1 ${currentSurvey.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                <span className={currentSurvey.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {currentSurvey.trend === 'up' ? '+' : ''}{(currentSurvey.averageScore - currentSurvey.previousScore).toFixed(1)} {t('mvp.dashboard.kpi.from.last.month')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{t('mvp.dashboard.kpi.rate')}</CardTitle>
                <Activity className="h-4 w-4 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {Math.round((currentSurvey.responseCount / currentSurvey.teamSize) * 100)}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentSurvey.responseCount} of {currentSurvey.teamSize} {t('mvp.dashboard.kpi.team.members')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{t('mvp.dashboard.kpi.status')}</CardTitle>
                <Target className="h-4 w-4 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${canShowResults ? 'text-green-600' : 'text-amber-600'}`}>
                {canShowResults ? t('mvp.dashboard.kpi.active') : t('mvp.dashboard.kpi.collecting')}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {canShowResults ? t('mvp.dashboard.kpi.results.visible') : t('mvp.dashboard.kpi.building.anonymity')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Banner */}
        {!canShowResults && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">{t('mvp.dashboard.privacy.title')}</h3>
                  <p className="text-amber-700 text-sm">
                    {t('mvp.dashboard.privacy.desc').replace('{min}', currentSurvey.minRequired.toString()).replace('{current}', currentSurvey.responseCount.toString())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments Feed */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-novora-600" />
              {t('mvp.dashboard.comments.title')}
            </CardTitle>
            <CardDescription>
              {canShowResults ? t('mvp.dashboard.comments.visible') : t('mvp.dashboard.comments.hidden')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canShowResults ? (
              <div className={`space-y-4 ${currentSurvey.comments.length > 8 ? 'max-h-96 overflow-y-auto' : ''}`}>
                {currentSurvey.comments.map((comment, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border-l-4 border-novora-200">
                    <p className="text-slate-700">{comment}</p>
                    <div className="text-xs text-slate-500 mt-2">
                      {t('mvp.dashboard.comments.anonymous')} • {Math.floor(Math.random() * 7) + 1} {t('mvp.dashboard.comments.days.ago')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 mb-2">
                  {t('mvp.dashboard.comments.threshold').replace('{min}', currentSurvey.minRequired.toString())}
                </p>
                <p className="text-sm text-slate-400">
                  {t('mvp.dashboard.comments.protection')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Share & Collect Responses */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('mvp.dashboard.share.title')}</CardTitle>
                <CardDescription>
                  {t('mvp.dashboard.share.subtitle')}
                </CardDescription>
              </div>
              {/* Survey Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={prevSurvey}
                  disabled={availableSurveys.findIndex(s => s.index === currentSurveyIndex) === 0 || isDemo}
                  variant="outline"
                  size="sm"
                  className="disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 min-w-[100px] text-center">
                  {availableSurveys.findIndex(s => s.index === currentSurveyIndex) + 1} of {mockData.surveys.length}
                </span>
                <Button
                  onClick={nextSurvey}
                  disabled={availableSurveys.findIndex(s => s.index === currentSurveyIndex) === availableSurveys.length - 1 || isDemo}
                  variant="outline"
                  size="sm"
                  className="disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Survey Info */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{currentSurvey.title}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isSurveyCompleted(currentSurvey)
                        ? 'bg-green-100 text-green-800'
                        : currentSurvey.createdAt > new Date()
                        ? 'bg-gray-100 text-gray-800'
                        : canShowResults 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {isSurveyCompleted(currentSurvey)
                        ? 'Completed'
                        : currentSurvey.createdAt > new Date()
                        ? 'Not started yet'
                        : canShowResults 
                        ? 'Active • Results visible' 
                        : 'Collecting responses'}
                    </span>
                    {daysRemaining > 0 && currentSurvey.createdAt <= new Date() && (
                      <span className="text-slate-600">
                        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                      </span>
                    )}
                    {currentSurvey.createdAt > new Date() && (
                      <span className="text-slate-600">
                        Starts in {Math.ceil((currentSurvey.createdAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} day{Math.ceil((currentSurvey.createdAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  {currentSurvey.responseCount} of {currentSurvey.teamSize} team members responded
                </p>
              </div>

              {/* Survey Link */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {t('mvp.dashboard.share.link.label')}
                  </label>
                  {isLoggedIn && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Your Personal Link
                    </span>
                  )}
                  {isDemo && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      Demo Link
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={getSurveyLink(currentSurvey.id)}
                    readOnly
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-600"
                  />
                  <Button 
                    onClick={copySurveyLink} 
                    size="sm" 
                    disabled={isDemo || currentSurvey.createdAt > new Date()}
                    className="bg-novora-600 hover:bg-novora-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {t('mvp.dashboard.share.copy')}
                  </Button>
                  <Button 
                    onClick={() => {
                      const link = getSurveyLink(currentSurvey.id);
                      window.open(link, '_blank');
                    }}
                    size="sm" 
                    disabled={isDemo || currentSurvey.createdAt > new Date()}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Test Link
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <Button 
                  onClick={shareViaWhatsApp}
                  disabled={isDemo || currentSurvey.createdAt > new Date()}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t('mvp.dashboard.share.whatsapp')}
                </Button>
                <Button 
                  onClick={shareViaEmail}
                  disabled={isDemo || currentSurvey.createdAt > new Date()}
                  className="bg-novora-600 hover:bg-novora-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {t('mvp.dashboard.share.email')}
                </Button>
                <Button 
                  onClick={shareViaSMS}
                  disabled={isDemo || currentSurvey.createdAt > new Date()}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  {t('mvp.dashboard.share.sms')}
                </Button>
              </div>

              {/* Status */}
              <div className="text-sm text-slate-600">
                <span className="font-medium">{t('mvp.dashboard.share.status')}</span> 
                {isSurveyClosed(currentSurvey) ? (
                  <span className="text-red-600 ml-2">Closed • Max submissions reached ({currentSurvey.maxSubmissions})</span>
                ) : canShowResults ? (
                  <span className="text-green-600 ml-2">{t('mvp.dashboard.share.status.active')}</span>
                ) : (
                  <span className="text-amber-600 ml-2">{t('mvp.dashboard.share.status.collecting').replace('{current}', currentSurvey.responseCount.toString()).replace('{min}', currentSurvey.minRequired.toString())}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Reminder Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>{t('mvp.dashboard.reminder.title')}</CardTitle>
            <CardDescription>
              {t('mvp.dashboard.reminder.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button 
                onClick={sendWhatsAppReminder}
                disabled={isDemo}
                variant="outline" 
                className="border-orange-300 hover:border-orange-500 hover:text-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('mvp.dashboard.reminder.whatsapp.button')}
              </Button>
              <Button 
                onClick={sendEmailReminder}
                disabled={isDemo}
                variant="outline" 
                className="border-orange-300 hover:border-orange-500 hover:text-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4 mr-2" />
                {t('mvp.dashboard.reminder.email.button')}
              </Button>
              <Button 
                onClick={sendSMSReminder}
                disabled={isDemo}
                variant="outline" 
                className="border-orange-300 hover:border-orange-500 hover:text-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                {t('mvp.dashboard.reminder.sms.button')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Breakdown Section - Only for logged in users */}
        {!isDemo && canShowResults && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-novora-600" />
                {t('mvp.dashboard.questions.title')}
              </CardTitle>
              <CardDescription>
                Individual question performance across survey weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mood - Average across all weeks */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{t('mvp.dashboard.questions.mood')}</h4>
                    <span className="text-sm text-gray-500">{t('mvp.dashboard.questions.responses').replace('{count}', currentSurvey.questionBreakdown.mood.responses.toString())}</span>
                  </div>
                  {currentSurvey.questionBreakdown.mood.locked ? (
                    <div className="text-center py-4">
                      <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {t('mvp.dashboard.questions.locked').replace('{count}', (currentSurvey.minRequired - currentSurvey.questionBreakdown.mood.responses).toString())}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold mb-2" style={{ color: getScoreColor(currentSurvey.questionBreakdown.mood.score) }}>
                        {currentSurvey.questionBreakdown.mood.score.toFixed(1)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(currentSurvey.questionBreakdown.mood.score / 10) * 100}%`,
                            backgroundColor: getScoreColor(currentSurvey.questionBreakdown.mood.score)
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>

                {/* Manager Support - W1 only */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{t('mvp.dashboard.questions.manager')}</h4>
                    <span className="text-sm text-gray-500">{t('mvp.dashboard.questions.responses').replace('{count}', currentSurvey.questionBreakdown.managerSupport.responses.toString())}</span>
                  </div>
                  {currentSurvey.questionBreakdown.managerSupport.locked ? (
                    <div className="text-center py-4">
                      <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {t('mvp.dashboard.questions.locked').replace('{count}', (currentSurvey.minRequired - currentSurvey.questionBreakdown.managerSupport.responses).toString())}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold mb-2" style={{ color: getScoreColor(currentSurvey.questionBreakdown.managerSupport.score) }}>
                        {currentSurvey.questionBreakdown.managerSupport.score.toFixed(1)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(currentSurvey.questionBreakdown.managerSupport.score / 10) * 100}%`,
                            backgroundColor: getScoreColor(currentSurvey.questionBreakdown.managerSupport.score)
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>

                {/* Workload - W2 only */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{t('mvp.dashboard.questions.workload')}</h4>
                    <span className="text-sm text-gray-500">{t('mvp.dashboard.questions.responses').replace('{count}', currentSurvey.questionBreakdown.workload.responses.toString())}</span>
                  </div>
                  {currentSurvey.questionBreakdown.workload.locked ? (
                    <div className="text-center py-4">
                      <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {t('mvp.dashboard.questions.locked').replace('{count}', (currentSurvey.minRequired - currentSurvey.questionBreakdown.workload.responses).toString())}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold mb-2" style={{ color: getScoreColor(currentSurvey.questionBreakdown.workload.score) }}>
                        {currentSurvey.questionBreakdown.workload.score.toFixed(1)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(currentSurvey.questionBreakdown.workload.score / 10) * 100}%`,
                            backgroundColor: getScoreColor(currentSurvey.questionBreakdown.workload.score)
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>

                {/* Recognition - W4 only */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{t('mvp.dashboard.questions.recognition')}</h4>
                    <span className="text-sm text-gray-500">{t('mvp.dashboard.questions.responses').replace('{count}', currentSurvey.questionBreakdown.recognition.responses.toString())}</span>
                  </div>
                  {currentSurvey.questionBreakdown.recognition.locked ? (
                    <div className="text-center py-4">
                      <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {t('mvp.dashboard.questions.locked').replace('{count}', (currentSurvey.minRequired - currentSurvey.questionBreakdown.recognition.responses).toString())}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold mb-2" style={{ color: getScoreColor(currentSurvey.questionBreakdown.recognition.score) }}>
                        {currentSurvey.questionBreakdown.recognition.score.toFixed(1)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(currentSurvey.questionBreakdown.recognition.score / 10) * 100}%`,
                            backgroundColor: getScoreColor(currentSurvey.questionBreakdown.recognition.score)
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Notice */}
        {isDemo && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 mt-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">{t('mvp.dashboard.demo.title')}</h3>
                  <p className="text-amber-700 text-sm">
                    {t('mvp.dashboard.demo.desc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MVPDashboard;

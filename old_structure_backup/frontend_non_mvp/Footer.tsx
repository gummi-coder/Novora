
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail, ArrowRight, Shield, Zap, Users, Star, ChevronRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-novora-950 to-slate-900 text-white overflow-hidden">
      {/* Premium decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.08),transparent_50%)]"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-novora-400/10 to-teal-500/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-novora-300/8 to-teal-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company info */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-8 group">
              <div className="relative">
                <span className="text-3xl font-bold bg-gradient-to-r from-novora-400 via-novora-500 to-teal-500 bg-clip-text text-transparent group-hover:from-novora-300 group-hover:to-teal-400 transition-all duration-300">
                  Novora
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-novora-400/20 to-teal-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
            <p className="text-slate-300 mb-8 leading-relaxed text-lg">
              Empowering teams to build better workplaces through honest, anonymous feedback and actionable insights.
            </p>
            

            
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-novora-400 transition-all duration-300 transform hover:scale-110" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-novora-400 transition-all duration-300 transform hover:scale-110" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-novora-400 transition-all duration-300 transform hover:scale-110" aria-label="GitHub">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-novora-400" />
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span>Features</span>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span>Pricing</span>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span>Book a Meeting</span>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link to="/auth/signin" className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span>Sign In</span>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center">
              <Shield className="w-5 h-5 mr-2 text-teal-400" />
              Support
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span>Help Center</span>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span>Documentation</span>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span>Status</span>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span>API</span>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-all duration-300 flex items-center group">
                  <span>Contact Us</span>
                  <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center">
              <Mail className="w-5 h-5 mr-2 text-novora-400" />
              Stay Updated
            </h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Subscribe to our newsletter to get the latest updates and insights on building better workplaces.
            </p>
            <form className="space-y-4">
              <div className="relative">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus-visible:ring-novora-500 focus-visible:border-novora-500 backdrop-blur-sm"
                  required
                />
                <Button 
                  type="submit" 
                  className="absolute right-1 top-1 h-10 px-4 bg-gradient-to-r from-novora-600 to-teal-600 hover:from-novora-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </form>
            

          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Novora. All rights reserved.
          </p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="text-sm text-slate-400 hover:text-white transition-all duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-slate-400 hover:text-white transition-all duration-300">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-slate-400 hover:text-white transition-all duration-300">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

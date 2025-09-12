import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, ChevronRight } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLinkClick = () => {
    scrollToTop();
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const checkHomePage = () => {
      setIsHomePage(window.location.pathname === '/');
    };

    window.addEventListener('scroll', handleScroll);
    checkHomePage();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled || !isHomePage 
        ? 'bg-white/95 backdrop-blur-md shadow-xl border-b border-slate-200/50' 
        : 'bg-transparent'
    }`}>
      {/* Premium gradient overlay for scrolled state */}
      {isScrolled || !isHomePage && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/90 to-white/80 backdrop-blur-sm"></div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center group" onClick={handleLinkClick}>
              <div className="relative">
                <span className="text-2xl md:text-3xl font-bold font-heading bg-gradient-to-r from-novora-600 via-novora-700 to-teal-600 bg-clip-text text-transparent group-hover:from-novora-700 group-hover:to-teal-700 transition-all duration-300">
                  Novora
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-novora-600/20 to-teal-600/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8 lg:space-x-10">
            <Link 
              to="/" 
              className="relative text-sm font-semibold text-slate-700 hover:text-novora-600 transition-all duration-300 group" 
              onClick={handleLinkClick}
            >
              <span className="relative z-10">Home</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-novora-600 to-teal-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link 
              to="/features" 
              className="relative text-sm font-semibold text-slate-700 hover:text-novora-600 transition-all duration-300 group" 
              onClick={handleLinkClick}
            >
              <span className="relative z-10">Features</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-novora-600 to-teal-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link 
              to="/pricing" 
              className="relative text-sm font-semibold text-slate-700 hover:text-novora-600 transition-all duration-300 group" 
              onClick={handleLinkClick}
            >
              <span className="relative z-10">Pricing</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-novora-600 to-teal-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link 
              to="/book" 
              className="relative text-sm font-semibold text-slate-700 hover:text-novora-600 transition-all duration-300 group" 
              onClick={handleLinkClick}
            >
              <span className="relative z-10">Book a Meeting</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-novora-600 to-teal-600 group-hover:w-full transition-all duration-300"></div>
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/auth/signin" onClick={handleLinkClick}>
              <Button 
                variant="ghost" 
                className="text-sm font-semibold text-slate-700 hover:text-novora-600 hover:bg-novora-50/80 transition-all duration-300 h-10 px-4"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/auth/signup" onClick={handleLinkClick}>
              <Button className="group relative bg-gradient-to-r from-novora-600 to-teal-600 text-white hover:from-novora-700 hover:to-teal-700 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-10 px-6">
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start Free Trial
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-novora-600 to-teal-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              </Button>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="text-novora-600 hover:bg-novora-50/80 transition-all duration-300"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Enhanced Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-2xl border-b border-slate-200/50">
          <div className="container mx-auto px-4 py-6">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-base font-semibold text-slate-700 hover:text-novora-600 transition-all duration-300 py-2 border-b border-slate-100 hover:border-novora-200"
                onClick={handleLinkClick}
              >
                Home
              </Link>
              <Link 
                to="/features"
                className="text-base font-semibold text-slate-700 hover:text-novora-600 transition-all duration-300 py-2 border-b border-slate-100 hover:border-novora-200"
                onClick={handleLinkClick}
              >
                Features
              </Link>
              <Link 
                to="/pricing"
                className="text-base font-semibold text-slate-700 hover:text-novora-600 transition-all duration-300 py-2 border-b border-slate-100 hover:border-novora-200"
                onClick={handleLinkClick}
              >
                Pricing
              </Link>
              <Link 
                to="/book"
                className="text-base font-semibold text-slate-700 hover:text-novora-600 transition-all duration-300 py-2 border-b border-slate-100 hover:border-novora-200"
                onClick={handleLinkClick}
              >
                Book a Meeting
              </Link>
              <div className="pt-4 space-y-3">
                <Link 
                  to="/auth/signin"
                  className="block text-base font-semibold text-slate-700 hover:text-novora-600 transition-all duration-300 py-2"
                  onClick={handleLinkClick}
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth/signup"
                  className="block"
                  onClick={handleLinkClick}
                >
                  <Button className="w-full bg-gradient-to-r from-novora-600 to-teal-600 text-white hover:from-novora-700 hover:to-teal-700 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-12">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || !isHomePage ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={handleLinkClick}>
              <span className="text-2xl font-bold font-heading bg-gradient-to-r from-novora-600 to-teal-500 bg-clip-text text-transparent">
                Novora
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-10">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-novora-600 transition-colors border-b-2 border-transparent hover:border-novora-600" onClick={handleLinkClick}>
              Home
            </Link>
            <Link to="/features" className="text-sm font-medium text-gray-700 hover:text-novora-600 transition-colors border-b-2 border-transparent hover:border-novora-600" onClick={handleLinkClick}>
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-gray-700 hover:text-novora-600 transition-colors border-b-2 border-transparent hover:border-novora-600" onClick={handleLinkClick}>
              Pricing
            </Link>
            <Link to="/book" className="text-sm font-medium text-gray-700 hover:text-novora-600 transition-colors border-b-2 border-transparent hover:border-novora-600" onClick={handleLinkClick}>
              Book a Meeting
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/auth/signin" onClick={handleLinkClick}>
              <Button variant="ghost" className="text-sm font-medium hover:bg-novora-50">
                Sign In
              </Button>
            </Link>
            <Link to="/auth/signup" onClick={handleLinkClick}>
              <Button className="bg-gradient-to-r from-novora-600 to-teal-500 text-white hover:from-novora-700 hover:to-teal-600 text-sm font-medium shadow-md hover:shadow-lg">
                Start Free Trial
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
              className="text-novora-600"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-base font-medium text-gray-700 hover:text-novora-600 transition-colors"
                onClick={handleLinkClick}
              >
                Home
              </Link>
              <Link 
                to="/features"
                className="text-base font-medium text-gray-700 hover:text-novora-600 transition-colors"
                onClick={handleLinkClick}
              >
                Features
              </Link>
              <Link 
                to="/pricing"
                className="text-base font-medium text-gray-700 hover:text-novora-600 transition-colors"
                onClick={handleLinkClick}
              >
                Pricing
              </Link>
              <Link 
                to="/book"
                className="text-base font-medium text-gray-700 hover:text-novora-600 transition-colors"
                onClick={handleLinkClick}
              >
                Book a Meeting
              </Link>
              <Link 
                to="/auth/signin"
                className="text-base font-medium text-gray-700 hover:text-novora-600 transition-colors"
                onClick={handleLinkClick}
              >
                Sign In
              </Link>
              <Link 
                to="/auth/signup"
                className="text-base font-medium text-gray-700 hover:text-novora-600 transition-colors"
                onClick={handleLinkClick}
              >
                Start Free Trial
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

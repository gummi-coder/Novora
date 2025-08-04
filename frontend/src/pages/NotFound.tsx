
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-novora-600 to-teal-500 bg-clip-text text-transparent mb-4">
              404
            </h1>
            <p className="text-2xl font-bold mb-4">Page Not Found</p>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild>
                <Link to="/">
                  Return Home
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/features">
                  Explore Features
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;

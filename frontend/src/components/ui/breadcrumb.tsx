import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBreadcrumbs } from "@/utils/navigation";

interface BreadcrumbProps {
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ className }) => {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for main dashboard
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-gray-500", className)}>
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          {index === 0 ? (
            <Link
              to={breadcrumb.path}
              className={cn(
                "flex items-center space-x-1 hover:text-gray-700 transition-colors",
                breadcrumb.isActive && "text-gray-900 font-medium"
              )}
            >
              <Home className="w-4 h-4" />
              <span>{breadcrumb.label}</span>
            </Link>
          ) : (
            <Link
              to={breadcrumb.path}
              className={cn(
                "hover:text-gray-700 transition-colors",
                breadcrumb.isActive && "text-gray-900 font-medium"
              )}
            >
              {breadcrumb.label}
            </Link>
          )}
          
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;

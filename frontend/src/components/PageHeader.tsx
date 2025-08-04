
import React from 'react';
import AnimateOnScroll from './AnimateOnScroll';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  align = 'center',
  className = ''
}) => {
  const textAlign = align === 'center' ? 'text-center' : 'text-left';
  
  return (
    <div className={`bg-gradient-to-b from-novora-100 to-white pt-40 pb-28 ${textAlign} ${className} relative`}>
      <div className="max-w-4xl mx-auto px-4">
        <AnimateOnScroll>
          <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-novora-700 to-teal-500 bg-clip-text text-transparent mb-6">
            {title}
          </h1>
        </AnimateOnScroll>
        
        {subtitle && (
          <AnimateOnScroll delay={1}>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              {subtitle}
            </p>
          </AnimateOnScroll>
        )}
      </div>
      
      {/* Decorative wave separator */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-full text-white fill-current"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default PageHeader;

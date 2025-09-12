import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AnimateOnScroll from './AnimateOnScroll';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  linkText?: string;
  linkHref?: string;
  delay?: number;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  linkText,
  linkHref = '#',
  delay = 0,
  onClick
}) => {
  return (
    <AnimateOnScroll delay={delay}>
      <Card className="border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full bg-gradient-to-b from-white to-gray-50">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="mb-5 text-novora-600 bg-novora-50 p-3.5 rounded-xl w-14 h-14 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-xl font-heading font-bold mb-3">{title}</h3>
          <p className="text-gray-600 mb-4 flex-grow">{description}</p>
          
          {linkText && (
            <a 
              href={linkHref} 
              onClick={onClick}
              className="text-novora-600 hover:text-novora-700 font-medium inline-flex items-center group mt-2"
            >
              {linkText}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1.5 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </CardContent>
      </Card>
    </AnimateOnScroll>
  );
};

export default FeatureCard;

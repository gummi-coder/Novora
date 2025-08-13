import React from 'react';
import { cn } from '@/lib/utils';

interface QuestionImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export const QuestionImage: React.FC<QuestionImageProps> = ({
  src,
  alt,
  className,
  width = 300,
  height = 200
}) => {
  return (
    <div className={cn("mt-4 mb-6", className)}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-auto rounded-lg shadow-md object-cover"
        loading="lazy"
      />
    </div>
  );
};

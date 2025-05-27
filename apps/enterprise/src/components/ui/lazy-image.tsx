import React from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholder?: string;
  threshold?: number;
  rootMargin?: string;
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNFNUU3RUIiLz48L3N2Zz4=',
  threshold = 0,
  rootMargin = '50px',
  ...props
}: LazyImageProps) {
  const { elementRef, isVisible } = useLazyLoad<HTMLImageElement>({
    threshold,
    rootMargin
  });

  return (
    <img
      ref={elementRef}
      src={isVisible ? src : placeholder}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        !isVisible && 'opacity-0',
        isVisible && 'opacity-100',
        className
      )}
      {...props}
    />
  );
} 
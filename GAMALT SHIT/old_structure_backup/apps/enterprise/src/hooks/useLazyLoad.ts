import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useLazyLoad<T extends HTMLElement>(options: UseLazyLoadOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: options.threshold || 0,
        rootMargin: options.rootMargin || '0px'
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return { elementRef, isVisible };
} 
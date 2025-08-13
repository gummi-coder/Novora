import React, { useState, useRef, useEffect } from 'react';
import { Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 10,
  className,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleMouseMove(e);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleTouchMove(e);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !trackRef.current || disabled) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newValue = Math.round(min + percentage * (max - min));
    
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (!isDragging || !trackRef.current || disabled) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newValue = Math.round(min + percentage * (max - min));
    
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, value, min, max]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Slider Track */}
      <div
        ref={trackRef}
        className={cn(
          "relative h-3 bg-gray-200 rounded-full cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Filled Track */}
        <div
          className="absolute h-full bg-blue-500 rounded-full transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Handle */}
        <div
          className={cn(
            "absolute top-1/2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110",
            disabled && "cursor-not-allowed hover:scale-100"
          )}
          style={{ left: `${percentage}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="w-full h-full flex items-center justify-center">
            <Pause className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>

      {/* Tick Marks and Labels */}
      <div className="mt-4 relative">
        <div className="flex justify-between">
          {Array.from({ length: max - min + 1 }, (_, i) => {
            const tickValue = min + i;
            const isActive = tickValue <= value;
            
            return (
              <div key={tickValue} className="flex flex-col items-center">
                {/* Tick Mark */}
                <div
                  className={cn(
                    "w-0.5 h-3 mb-1",
                    isActive ? "bg-gray-800" : "bg-gray-300"
                  )}
                />
                {/* Number Label */}
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {tickValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

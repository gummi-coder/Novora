
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  id?: string;
}

export function ColorPicker({ 
  label, 
  color, 
  onChange, 
  id 
}: ColorPickerProps) {
  const [value, setValue] = useState(color);
  
  useEffect(() => {
    setValue(color);
  }, [color]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setValue(newColor);
    onChange(newColor);
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center space-x-2">
        <div 
          className="h-8 w-8 rounded-md border" 
          style={{ backgroundColor: value }}
        />
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => onChange(value)}
          className="w-32"
          placeholder="#RRGGBB"
        />
        <Input
          type="color"
          value={value}
          onChange={handleChange}
          className="w-12 h-8 p-0 border-none"
        />
      </div>
    </div>
  );
}

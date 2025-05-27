
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface ApiKeyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function ApiKeyInput({
  label,
  value,
  onChange,
  placeholder = "Enter API key",
  id,
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);

  const toggleVisibility = () => {
    setShowKey(!showKey);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex">
        <Input
          id={id}
          type={showKey ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-r-none"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-l-none"
          onClick={toggleVisibility}
        >
          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

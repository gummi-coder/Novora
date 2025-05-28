
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface AvatarUploaderProps {
  currentImageUrl?: string;
  onImageChange?: (file: File | null) => void;
  name?: string;
}

export function AvatarUploader({ 
  currentImageUrl, 
  onImageChange,
  name = "John Doe"
}: AvatarUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  
  // Get initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
        if (onImageChange) {
          onImageChange(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (onImageChange) {
      onImageChange(null);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        {previewUrl ? (
          <AvatarImage src={previewUrl} alt="Profile" />
        ) : (
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        )}
      </Avatar>
      
      <div className="flex gap-2">
        <Label 
          htmlFor="avatar-upload" 
          className="cursor-pointer flex items-center gap-1 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
        >
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </Label>
        
        <Input 
          id="avatar-upload" 
          type="file" 
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {previewUrl && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRemove}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            <span>Remove</span>
          </Button>
        )}
      </div>
    </div>
  );
}

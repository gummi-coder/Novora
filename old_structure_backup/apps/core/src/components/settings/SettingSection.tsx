
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SettingSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isLoading?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
}

export function SettingSection({ 
  title, 
  description, 
  children, 
  footer,
  isLoading = false,
  onSubmit 
}: SettingSectionProps) {
  
  const content = (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {(footer || onSubmit) && (
        <CardFooter className="flex justify-end border-t pt-6">
          {footer || (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );

  if (onSubmit) {
    return (
      <form onSubmit={onSubmit}>
        {content}
      </form>
    );
  }

  return content;
}

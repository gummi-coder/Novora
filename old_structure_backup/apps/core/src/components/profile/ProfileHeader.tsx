
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarUploader } from "@/components/settings/AvatarUploader";
import { Mail, Phone, Users } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  manager?: string;
  isPersonalProfile: boolean;
}

export function ProfileHeader({
  name,
  role,
  department,
  email,
  phone,
  avatarUrl,
  manager,
  isPersonalProfile,
}: ProfileHeaderProps) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-primary h-24"></div>
      <CardContent className="pt-0">
        <div className="flex flex-col md:flex-row gap-6 -mt-12">
          <div className="flex justify-center">
            {isPersonalProfile ? (
              <div className="mt-1">
                <AvatarUploader 
                  currentImageUrl={avatarUrl || undefined} 
                  name={name} 
                  onImageChange={(file) => console.log("Image uploaded:", file)} 
                />
              </div>
            ) : (
              <div className="mt-1">
                <AvatarUploader 
                  currentImageUrl={avatarUrl || undefined} 
                  name={name} 
                />
              </div>
            )}
          </div>
          <div className="flex-1 pt-12 md:pt-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{name}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-muted-foreground">
                <p>{role}</p>
                <div className="hidden sm:block">•</div>
                <p>{department}</p>
                {manager && (
                  <>
                    <div className="hidden sm:block">•</div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Reports to {manager}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${email}`} className="hover:text-primary transition-colors">
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href={`tel:${phone}`} className="hover:text-primary transition-colors">
                  {phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

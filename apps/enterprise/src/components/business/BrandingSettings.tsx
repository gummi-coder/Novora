import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBranding } from "@/contexts/BrandingContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, RefreshCw } from "lucide-react";
import { CompanyService } from '@/services/CompanyService';
import { cacheService } from '@/services/CacheService';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LazyImage } from '@/components/ui/lazy-image';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
];

const BORDER_RADIUS_OPTIONS = [
  { value: '0.25rem', label: 'Small' },
  { value: '0.5rem', label: 'Medium' },
  { value: '0.75rem', label: 'Large' },
  { value: '1rem', label: 'Extra Large' },
];

interface CompanyData {
  companies: any[];
  company: any;
  stats: any;
  searchResults: any[];
}

export function BrandingSettings() {
  const { settings, updateSettings, resetToDefault } = useBranding();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companies, company, stats, searchResults] = await Promise.all([
          CompanyService.getCompanies(1, 10),
          CompanyService.getCompanyById('some-id'),
          CompanyService.getCompanyStats(),
          CompanyService.searchCompanies('tech')
        ]);

        setCompanyData({ companies, company, stats, searchResults });
      } catch (error) {
        console.error('Error fetching company data:', error);
        toast({
          title: "Error",
          description: "Failed to load company data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ logo: reader.result as string });
        toast({
          title: "Logo Updated",
          description: "Your company logo has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (key: keyof typeof settings, value: string) => {
    updateSettings({ [key]: value });
  };

  const handleChartColorChange = (index: number, value: string) => {
    const newColors = [...settings.chartColors];
    newColors[index] = value;
    updateSettings({ chartColors: newColors });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Branding Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Company Name</Label>
              <Input
                value={settings.companyName}
                onChange={(e) => handleColorChange('companyName', e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4 mt-2">
                {settings.logo && (
                  <LazyImage
                    src={settings.logo}
                    alt="Company Logo"
                    className="h-12 w-12 object-contain"
                    threshold={0.1}
                    rootMargin="100px"
                  />
                )}
                <Button variant="outline" className="relative">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                  <Input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Primary Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Secondary Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Accent Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Chart Colors</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {settings.chartColors.map((color, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => handleChartColorChange(index, e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={color}
                      onChange={(e) => handleChartColorChange(index, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Font Family</Label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => handleColorChange('fontFamily', e.target.value)}
                  className="w-full mt-2 rounded-md border border-input bg-background px-3 py-2"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Border Radius</Label>
                <select
                  value={settings.borderRadius}
                  onChange={(e) => handleColorChange('borderRadius', e.target.value)}
                  className="w-full mt-2 rounded-md border border-input bg-background px-3 py-2"
                >
                  {BORDER_RADIUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={resetToDefault}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
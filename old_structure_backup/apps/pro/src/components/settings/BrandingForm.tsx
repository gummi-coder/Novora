
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SettingSection } from "./SettingSection";
import { ColorPicker } from "./ColorPicker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";

// Define form schema
const brandingFormSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  customCss: z.string().optional(),
});

type BrandingFormValues = z.infer<typeof brandingFormSchema>;

export function BrandingForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [previewTab, setPreviewTab] = useState("survey");
  
  // File state for logo and favicon
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  // Setup form
  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      primaryColor: "#0284c7", // blue-600
      secondaryColor: "#10b981", // emerald-500
      accentColor: "#f59e0b", // amber-500
      customCss: "/* Add your custom CSS here */\n\n/* Example:\n.survey-header {\n  font-weight: 600;\n}\n*/",
    },
  });

  // Watch color values for live preview
  const primaryColor = form.watch("primaryColor");
  const secondaryColor = form.watch("secondaryColor");
  const accentColor = form.watch("accentColor");

  // Handle file changes
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFavicon(file);
      const url = URL.createObjectURL(file);
      setFaviconPreview(url);
    }
  };

  // Handle form submission
  const onSubmit = (data: BrandingFormValues) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Branding data:", data);
      console.log("Logo:", logo);
      console.log("Favicon:", favicon);
      toast({
        title: "Branding updated",
        description: "Your branding settings have been updated successfully.",
      });
      setIsLoading(false);
    }, 1000);
  };

  // Remove uploaded files
  const removeLogo = () => {
    setLogo(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
  };

  const removeFavicon = () => {
    setFavicon(null);
    if (faviconPreview) {
      URL.revokeObjectURL(faviconPreview);
      setFaviconPreview(null);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Logo Upload */}
          <SettingSection
            title="Company Logo"
            description="Upload your company logo for use in surveys and reports"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="border rounded-md w-40 h-20 flex items-center justify-center bg-white">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Company logo" 
                      className="max-w-full max-h-full object-contain" 
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">No logo uploaded</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label 
                    htmlFor="logo-upload" 
                    className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors text-sm"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Logo</span>
                  </Label>
                  <Input 
                    id="logo-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  {logoPreview && (
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={removeLogo}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Remove</span>
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Recommended size: 360 x 120 pixels (3:1 ratio). PNG or SVG with transparent background preferred.
              </p>
            </div>
          </SettingSection>

          {/* Favicon Upload */}
          <SettingSection
            title="Favicon"
            description="Upload a favicon for browser tabs and bookmarks"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="border rounded-md w-16 h-16 flex items-center justify-center bg-white">
                  {faviconPreview ? (
                    <img 
                      src={faviconPreview} 
                      alt="Favicon" 
                      className="max-w-full max-h-full object-contain" 
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">No favicon</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label 
                    htmlFor="favicon-upload" 
                    className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors text-sm"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Favicon</span>
                  </Label>
                  <Input 
                    id="favicon-upload" 
                    type="file" 
                    accept="image/x-icon,image/png" 
                    onChange={handleFaviconChange}
                    className="hidden"
                  />
                  {faviconPreview && (
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={removeFavicon}
                      className="flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Remove</span>
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a 32x32 pixel .ico or .png file. This will be used as the browser tab icon.
              </p>
            </div>
          </SettingSection>

          {/* Color Scheme */}
          <SettingSection
            title="Color Scheme"
            description="Customize the colors used throughout the application"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <ColorPicker
                      label="Primary Color"
                      color={field.value}
                      onChange={field.onChange}
                      id="primary-color"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <ColorPicker
                      label="Secondary Color"
                      color={field.value}
                      onChange={field.onChange}
                      id="secondary-color"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accentColor"
                render={({ field }) => (
                  <FormItem>
                    <ColorPicker
                      label="Accent Color"
                      color={field.value}
                      onChange={field.onChange}
                      id="accent-color"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SettingSection>

          {/* Custom CSS */}
          <SettingSection
            title="Advanced Customization"
            description="Add custom CSS for further customization of your surveys and reports"
          >
            <FormField
              control={form.control}
              name="customCss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom CSS</FormLabel>
                  <FormControl>
                    <Textarea
                      className="font-mono text-sm h-40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SettingSection>

          {/* Preview */}
          <SettingSection
            title="Branding Preview"
            description="Preview your branding on survey and dashboard interfaces"
            isLoading={isLoading}
          >
            <Tabs 
              value={previewTab} 
              onValueChange={setPreviewTab}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="survey">Survey Preview</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="survey" className="space-y-4">
                <Card className="overflow-hidden">
                  <div 
                    className="h-2" 
                    style={{ backgroundColor: primaryColor }}
                  ></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo" 
                            className="max-w-full max-h-full object-contain" 
                          />
                        ) : (
                          <span className="text-white font-bold">A</span>
                        )}
                      </div>
                      <h3 className="font-medium">Employee Engagement Survey</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-medium">How satisfied are you with your current role?</h4>
                        <div className="flex gap-3">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-muted/50"
                              style={{ borderColor: value === 5 ? primaryColor : undefined }}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                        <p className="flex justify-between text-xs">
                          <span>Not at all</span>
                          <span>Very satisfied</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Do you feel valued at work?</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border" 
                              style={{ backgroundColor: accentColor }}
                            ></div>
                            <span>Always</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border"></div>
                            <span>Sometimes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border"></div>
                            <span>Rarely</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button style={{ backgroundColor: secondaryColor }}>
                          Next Question
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dashboard" className="space-y-4">
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo" 
                            className="max-w-full max-h-full object-contain" 
                          />
                        ) : (
                          <span className="text-white font-bold">A</span>
                        )}
                      </div>
                      <h3 className="font-medium">Employee Engagement Dashboard</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="border rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Engagement Score</p>
                        <p className="text-xl font-bold" style={{ color: secondaryColor }}>78%</p>
                        <div className="w-full h-2 bg-muted rounded-full mt-2">
                          <div className="h-full rounded-full" style={{ width: '78%', backgroundColor: secondaryColor }}></div>
                        </div>
                      </div>
                      <div className="border rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Response Rate</p>
                        <p className="text-xl font-bold" style={{ color: primaryColor }}>92%</p>
                        <div className="w-full h-2 bg-muted rounded-full mt-2">
                          <div className="h-full rounded-full" style={{ width: '92%', backgroundColor: primaryColor }}></div>
                        </div>
                      </div>
                      <div className="border rounded-md p-3">
                        <p className="text-xs text-muted-foreground">eNPS</p>
                        <p className="text-xl font-bold" style={{ color: accentColor }}>+45</p>
                        <div className="w-full h-2 bg-muted rounded-full mt-2">
                          <div className="h-full rounded-full" style={{ width: '72%', backgroundColor: accentColor }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-md p-3">
                      <p className="font-medium mb-2">Department Engagement</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Engineering</span>
                            <span className="font-medium">85%</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full mt-1">
                            <div className="h-full rounded-full" style={{ width: '85%', backgroundColor: primaryColor }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Sales</span>
                            <span className="font-medium">76%</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full mt-1">
                            <div className="h-full rounded-full" style={{ width: '76%', backgroundColor: primaryColor }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Marketing</span>
                            <span className="font-medium">68%</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full mt-1">
                            <div className="h-full rounded-full" style={{ width: '68%', backgroundColor: primaryColor }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </SettingSection>
        </div>
      </form>
    </Form>
  );
}

function Label({ 
  htmlFor, 
  children, 
  className 
}: { 
  htmlFor?: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium ${className || ''}`}
    >
      {children}
    </label>
  );
}

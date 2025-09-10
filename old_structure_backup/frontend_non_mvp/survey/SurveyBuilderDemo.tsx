import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Smartphone,
  Monitor,
  Globe,
  Palette,
  Share2,
  Save,
  CheckCircle,
  Play
} from "lucide-react";

interface SurveyBuilderDemoProps {
  onStartDemo: () => void;
}

const SurveyBuilderDemo: React.FC<SurveyBuilderDemoProps> = ({ onStartDemo }) => {
  const features = [
    {
      icon: Globe,
      title: "Language & Branding",
      description: "Customize survey language and company branding",
      features: ["Multi-language support", "Company logo upload", "Custom colors", "Branded survey design"]
    },
    {
      icon: Eye,
      title: "Preview Mode",
      description: "Preview your survey before sending",
      features: ["Desktop preview", "Mobile preview", "Full-screen preview", "Interactive testing"]
    },
    {
      icon: Share2,
      title: "Distribution",
      description: "Multiple distribution channels",
      features: ["Email distribution", "Direct links", "QR codes", "Website embedding"]
    },
    {
      icon: Save,
      title: "Save & Send",
      description: "Save drafts and send surveys",
      features: ["Save as draft", "Save as template", "Send immediately", "Schedule for later"]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Survey Builder Steps 4-7
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Complete your survey with language customization, preview, distribution, and save/send functionality
        </p>
        <Button onClick={onStartDemo} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Play className="h-5 w-5 mr-2" />
          Start Demo
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Key Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-center">Key Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Save className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Save Functionality</h3>
              <p className="text-sm text-gray-600">
                Save drafts and templates for future use with automatic validation
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Preview Mode</h3>
              <p className="text-sm text-gray-600">
                Desktop and mobile preview with interactive testing capabilities
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Share2 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Distribution</h3>
              <p className="text-sm text-gray-600">
                Multiple distribution channels with scheduling and automation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Frontend Features</h4>
              <ul className="space-y-2 text-sm">
                <li>• Step-based navigation with progress tracking</li>
                <li>• Real-time preview with desktop/mobile modes</li>
                <li>• File upload for logos and branding</li>
                <li>• Color picker for custom branding</li>
                <li>• Multi-language selection interface</li>
                <li>• Distribution channel selection</li>
                <li>• Save/send dialog with validation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Backend Integration</h4>
              <ul className="space-y-2 text-sm">
                <li>• Survey service with CRUD operations</li>
                <li>• Template saving and management</li>
                <li>• File upload handling</li>
                <li>• Survey validation and error handling</li>
                <li>• Local storage for offline functionality</li>
                <li>• QR code generation for mobile access</li>
                <li>• Email template customization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyBuilderDemo;

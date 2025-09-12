import React, { createContext, useContext, useState, useEffect } from 'react';

interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  companyName: string;
  chartColors: string[];
  fontFamily: string;
  borderRadius: string;
}

interface BrandingContextType {
  settings: BrandingSettings;
  updateSettings: (newSettings: Partial<BrandingSettings>) => void;
  resetToDefault: () => void;
}

const defaultSettings: BrandingSettings = {
  primaryColor: '#4f46e5',
  secondaryColor: '#818cf8',
  accentColor: '#c7d2fe',
  logo: '',
  companyName: 'Enterprise Dashboard',
  chartColors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'],
  fontFamily: 'Inter',
  borderRadius: '0.5rem',
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BrandingSettings>(() => {
    const savedSettings = localStorage.getItem('brandingSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('brandingSettings', JSON.stringify(settings));
    // Apply theme to document
    document.documentElement.style.setProperty('--primary', settings.primaryColor);
    document.documentElement.style.setProperty('--secondary', settings.secondaryColor);
    document.documentElement.style.setProperty('--accent', settings.accentColor);
    document.documentElement.style.setProperty('--font-family', settings.fontFamily);
    document.documentElement.style.setProperty('--radius', settings.borderRadius);
  }, [settings]);

  const updateSettings = (newSettings: Partial<BrandingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetToDefault = () => {
    setSettings(defaultSettings);
  };

  return (
    <BrandingContext.Provider value={{ settings, updateSettings, resetToDefault }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
} 
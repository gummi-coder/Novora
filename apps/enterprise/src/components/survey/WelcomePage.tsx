import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import type { SurveyLanguage } from '../../lib/types/survey';

interface WelcomePageProps {
  languages: SurveyLanguage[];
  onStart: (selectedLanguages: SurveyLanguage[]) => void;
}

const languageNames: Record<SurveyLanguage, string> = {
  en: 'English',
  is: 'Icelandic',
  pl: 'Polish',
  lt: 'Lithuanian'
};

const anonymityDisclaimer = `This survey is completely anonymous. Your responses will be collected and analyzed in aggregate form only. 
No individual responses will be shared with your manager or HR. Your participation is voluntary, and you can skip any questions you prefer not to answer.`;

export function WelcomePage({ languages, onStart }: WelcomePageProps) {
  const [selectedLanguages, setSelectedLanguages] = React.useState<SurveyLanguage[]>([]);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = React.useState(false);

  const handleLanguageChange = (language: SurveyLanguage) => {
    setSelectedLanguages(prev => 
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const handleStart = () => {
    if (selectedLanguages.length > 0 && acceptedDisclaimer) {
      onStart(selectedLanguages);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome to the Survey</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Language Selection */}
        <div className="space-y-4">
          <Label>Select Survey Language(s)</Label>
          <div className="grid grid-cols-2 gap-4">
            {languages.map(language => (
              <div key={language} className="flex items-center space-x-2">
                <Checkbox
                  id={language}
                  checked={selectedLanguages.includes(language)}
                  onCheckedChange={() => handleLanguageChange(language)}
                />
                <Label htmlFor={language}>{languageNames[language]}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Anonymity Disclaimer */}
        <div className="space-y-4">
          <Label>Anonymity Disclaimer</Label>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{anonymityDisclaimer}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="disclaimer"
              checked={acceptedDisclaimer}
              onCheckedChange={(checked) => setAcceptedDisclaimer(checked as boolean)}
            />
            <Label htmlFor="disclaimer">I understand and accept the anonymity terms</Label>
          </div>
        </div>

        {/* Start Button */}
        <Button
          className="w-full"
          onClick={handleStart}
          disabled={selectedLanguages.length === 0 || !acceptedDisclaimer}
        >
          Start Survey
        </Button>
      </CardContent>
    </Card>
  );
} 
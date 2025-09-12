import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Survey } from './Survey';
import { Check, Copy, Eye, Share2 } from 'lucide-react';
import type { Survey as SurveyType } from '../../lib/types/survey';
import { toast } from 'sonner';

interface SurveyPreviewProps {
  survey: SurveyType;
  onShare?: (link: string) => void;
}

export function SurveyPreview({ survey, onShare }: SurveyPreviewProps) {
  const [activeTab, setActiveTab] = React.useState('preview');
  const [shareLink, setShareLink] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    // Generate a shareable link
    const baseUrl = 'https://novorasurveys.com';
    const link = `${baseUrl}/surveys/${survey.id}`;
    setShareLink(link);
  }, [survey.id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: survey.title,
        text: `Please take a moment to complete this survey: ${survey.title}`,
        url: shareLink,
      }).catch(() => {
        toast.error('Failed to share');
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{survey.title}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share Survey
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy Link
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Label className="font-medium">Share Link:</Label>
              <Input
                value={shareLink}
                readOnly
                className="flex-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Share this link with your team members to collect their responses.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview Survey
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Card>
            <CardContent className="pt-6">
              <Survey
                survey={survey}
                onSubmit={(response) => {
                  console.log('Preview Response:', response);
                  toast.success('Survey preview submitted successfully!');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground">
                  Survey results will appear here once responses are collected.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
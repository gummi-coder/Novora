import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';

interface FinalPageProps {
  finalQuestion: string;
  onSubmit: (comment: string) => void;
  onBack: () => void;
}

export function FinalPage({ finalQuestion, onSubmit, onBack }: FinalPageProps) {
  const [comment, setComment] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = () => {
    onSubmit(comment);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Thank You!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <p className="text-lg">
            Thank you for completing the survey. Your feedback is valuable to us.
          </p>
          <p className="text-sm text-muted-foreground">
            You can now close this window.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Final Thoughts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label className="text-lg">{finalQuestion}</Label>
          <Textarea
            placeholder="Share your thoughts here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[150px]"
          />
        </div>

        <div className="flex space-x-4">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Submit Survey
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 
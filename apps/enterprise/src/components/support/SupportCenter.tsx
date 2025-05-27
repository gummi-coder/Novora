import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FeatureGuard } from '@/components/subscription/FeatureGuard';
import { Search, Book, Video, FileText, MessageCircle, Phone } from 'lucide-react';

interface SupportArticle {
  id: string;
  title: string;
  category: string;
  content: string;
}

interface TrainingMaterial {
  id: string;
  title: string;
  type: 'video' | 'document' | 'guide';
  duration?: string;
  url: string;
}

export function SupportCenter() {
  const { currentTier } = useSubscription();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [articles, setArticles] = React.useState<SupportArticle[]>([]);
  const [trainingMaterials, setTrainingMaterials] = React.useState<TrainingMaterial[]>([]);

  React.useEffect(() => {
    // TODO: Implement API calls to fetch support content
    const mockArticles: SupportArticle[] = [
      {
        id: '1',
        title: 'Getting Started with Surveys',
        category: 'Basics',
        content: 'Learn how to create and manage your first survey...',
      },
      {
        id: '2',
        title: 'Advanced Analytics Guide',
        category: 'Analytics',
        content: 'Discover how to use advanced analytics features...',
      },
    ];

    const mockTraining: TrainingMaterial[] = [
      {
        id: '1',
        title: 'Platform Overview',
        type: 'video',
        duration: '15 min',
        url: '/training/platform-overview',
      },
      {
        id: '2',
        title: 'Survey Creation Best Practices',
        type: 'guide',
        url: '/training/survey-creation',
      },
    ];

    setArticles(mockArticles);
    setTrainingMaterials(mockTraining);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Support Center</h1>
        <FeatureGuard featureId="priority_support">
          <Button variant="outline">
            <Phone className="w-4 h-4 mr-2" />
            Contact Priority Support
          </Button>
        </FeatureGuard>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search support articles..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="knowledge-base" className="space-y-4">
        <TabsList>
          <TabsTrigger value="knowledge-base">Knowledge Base</TabsTrigger>
          <TabsTrigger value="training">Training Materials</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge-base">
          <div className="grid gap-4">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{article.content}</p>
                  <Button variant="link" className="p-0 mt-2">
                    Read more
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training">
          <div className="grid gap-4">
            {trainingMaterials.map((material) => (
              <Card key={material.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground">
                      {material.type === 'video' && (
                        <>
                          <Video className="w-4 h-4 mr-2" />
                          {material.duration}
                        </>
                      )}
                      {material.type === 'document' && (
                        <FileText className="w-4 h-4" />
                      )}
                      {material.type === 'guide' && (
                        <Book className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Start {material.type === 'video' ? 'Watching' : 'Reading'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Welcome to the Platform</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn the basics of our survey platform
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Create Your First Survey</h3>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step guide to creating surveys
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Book className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Best Practices</h3>
                    <p className="text-sm text-muted-foreground">
                      Tips for creating effective surveys
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
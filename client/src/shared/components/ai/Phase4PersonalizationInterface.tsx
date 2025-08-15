import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Heart, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Search, 
  Settings,
  Brain,
  Sparkles,
  ChartLine,
  Users,
  Star,
  Filter,
  Zap
} from 'lucide-react';

interface PersonalizationData {
  userId: string;
  profileSummary?: any;
  preferences?: any;
  culturalProfile?: any;
  recommendations?: any[];
  searchOptimization?: any;
  behaviorAnalytics?: any;
}

interface RecommendationResult {
  productId: string;
  title: string;
  score: number;
  reasons: string[];
  category: string;
  price: number;
  culturalRelevance?: number;
}

const Phase4PersonalizationInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData>({
    userId: 'user_001'
  });
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [behaviorInsights, setBehaviorInsights] = useState<any>(null);
  
  const { toast } = useToast();

  // Update user personalization profile
  const updatePersonalizationProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/personalization/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: personalizationData.userId,
          interactionData: {
            searchQueries: [
              { query: 'smartphone under 50000', timestamp: new Date().toISOString(), resultClicks: ['prod001'] },
              { query: 'traditional saree collection', timestamp: new Date().toISOString() }
            ],
            productInteractions: [
              { productId: 'prod001', action: 'view', timestamp: new Date().toISOString(), duration: 120 },
              { productId: 'prod002', action: 'wishlist', timestamp: new Date().toISOString() }
            ],
            categoryPreferences: [
              { categoryId: 'electronics', score: 0.8, source: 'implicit' },
              { categoryId: 'fashion', score: 0.6, source: 'explicit' }
            ]
          },
          profileData: {
            demographics: { ageGroup: '25-34', location: 'dhaka' },
            culturalProfile: { 
              languagePreference: 'mixed', 
              festivalCelebrations: ['eid', 'pohela_boishakh'],
              religiousPractice: 'islam'
            }
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setPersonalizationData(prev => ({
          ...prev,
          profileSummary: result.data.profileSummary,
          preferences: result.data.preferences,
          culturalProfile: result.data.culturalProfile
        }));
        toast({
          title: "Profile Updated",
          description: `Personalization profile updated successfully in ${result.data.processingTime}ms`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get AI-powered recommendations
  const getRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/recommendations/collaborative-filtering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: personalizationData.userId,
          recommendationType: 'hybrid',
          context: {
            currentSession: {
              viewedProducts: ['prod001', 'prod002'],
              searchQueries: ['smartphone', 'fashion'],
              timeSpent: 300
            },
            culturalContext: {
              language: 'mixed',
              festivals: ['eid'],
              location: 'bangladesh'
            }
          },
          filterOptions: {
            maxResults: 10,
            includeExplanation: true,
            diversityBoost: 0.3
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setRecommendations(result.data.recommendations || []);
        setPersonalizationData(prev => ({
          ...prev,
          recommendations: result.data
        }));
        toast({
          title: "Recommendations Generated",
          description: `Found ${result.data.recommendations?.length || 0} personalized recommendations`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Recommendations Failed",
        description: error instanceof Error ? error.message : 'Failed to get recommendations',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Optimize search results in real-time
  const optimizeSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a search query",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/search-optimization/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQuery,
          userId: personalizationData.userId,
          context: {
            userProfile: {
              searchHistory: ['smartphone', 'electronics', 'samsung'],
              preferences: personalizationData.preferences,
              location: 'dhaka'
            },
            sessionData: {
              previousQueries: ['phone', 'mobile'],
              deviceType: 'desktop'
            },
            marketContext: {
              trendingProducts: ['prod001', 'prod002'],
              culturalEvents: ['eid']
            }
          },
          optimizationType: 'personalization'
        })
      });

      const result = await response.json();
      if (result.success) {
        setOptimizationResults(result.data);
        toast({
          title: "Search Optimized",
          description: `Optimized ${result.data.optimizedResults?.length || 0} results in ${result.data.processingTime}ms`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : 'Failed to optimize search',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Analyze user behavior patterns
  const analyzeBehavior = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/behavior-analytics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: personalizationData.userId,
          analyticsType: 'user',
          timeframe: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        setBehaviorInsights(result.data);
        toast({
          title: "Behavior Analyzed",
          description: `Found ${result.data.patterns?.length || 0} behavior patterns`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'Failed to analyze behavior',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Phase 4: Advanced Personalization & ML Intelligence
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Experience cutting-edge ML-powered personalization with collaborative filtering, 
          real-time search optimization, and intelligent behavior analytics tailored for Bangladesh market
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Optimization
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Behavior Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Personalization Profile Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">User ID</label>
                  <Input
                    value={personalizationData.userId}
                    onChange={(e) => setPersonalizationData(prev => ({
                      ...prev,
                      userId: e.target.value
                    }))}
                    placeholder="Enter user ID"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={updatePersonalizationProfile}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </div>

              {personalizationData.profileSummary && (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">Profile Summary:</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Top Categories:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {personalizationData.profileSummary.topCategories?.map((cat: any, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {cat.category} ({(cat.score * 100).toFixed(0)}%)
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Engagement:</span>
                          <Badge className="ml-2">
                            {personalizationData.profileSummary.engagementLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={getRecommendations}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Recommendations'}
              </Button>

              {recommendations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Personalized Recommendations:</h3>
                  <div className="grid gap-3">
                    {recommendations.map((rec, idx) => (
                      <Card key={idx} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h4 className="font-medium">{rec.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{rec.category}</Badge>
                              <span className="text-sm text-gray-600">৳{rec.price.toLocaleString()}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {rec.reasons?.map((reason, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">{(rec.score * 100).toFixed(0)}%</span>
                            </div>
                            {rec.culturalRelevance && (
                              <div className="text-sm text-gray-600">
                                Cultural: {(rec.culturalRelevance * 100).toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Real-Time Search Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter search query (e.g., smartphone under 50000)"
                  className="flex-1"
                />
                <Button 
                  onClick={optimizeSearch}
                  disabled={loading || !searchQuery.trim()}
                >
                  {loading ? 'Optimizing...' : 'Optimize'}
                </Button>
              </div>

              {optimizationResults && (
                <div className="space-y-4">
                  <Alert>
                    <ChartLine className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-medium">Optimization Results:</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Results:</span>
                            <span className="ml-2">{optimizationResults.optimizedResults?.length || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium">Processing Time:</span>
                            <span className="ml-2">{optimizationResults.processingTime}ms</span>
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {optimizationResults.refinementSuggestions?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Refinement Suggestions:</h4>
                      <div className="flex flex-wrap gap-2">
                        {optimizationResults.refinementSuggestions.map((suggestion: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Filter className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                User Behavior Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={analyzeBehavior}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Analyzing...' : 'Analyze Behavior Patterns'}
              </Button>

              {behaviorInsights && (
                <div className="space-y-4">
                  <Alert>
                    <Users className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-medium">Behavior Insights:</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Patterns Found:</span>
                            <span className="ml-2">{behaviorInsights.patterns?.length || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium">Insights:</span>
                            <span className="ml-2">{behaviorInsights.insights?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {behaviorInsights.patterns?.map((pattern: any, idx: number) => (
                    <Card key={idx} className="p-4">
                      <div className="space-y-2">
                        <div className="font-medium">{pattern.type?.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-sm text-gray-600">{pattern.description}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            Confidence: {(pattern.confidence * 100).toFixed(0)}%
                          </Badge>
                          {pattern.frequency && (
                            <Badge variant="outline">{pattern.frequency}</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Phase4PersonalizationInterface;
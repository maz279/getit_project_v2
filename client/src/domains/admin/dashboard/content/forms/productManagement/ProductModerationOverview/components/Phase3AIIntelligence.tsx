/**
 * PHASE 3: AI INTELLIGENCE DASHBOARD COMPONENT
 * Admin interface for monitoring and managing Phase 3 AI capabilities
 * Investment: $35,000 | Frontend Integration
 * Date: July 26, 2025
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  processIntelligentQuery,
  fetchCulturalIntelligence,
  generateCulturalRecommendations,
  startConversation,
  continueConversation,
  fetchPerformanceMetrics,
  fetchConversationStats,
  setCurrentQuery,
  setSelectedDistrict,
  clearCurrentQuery,
  selectAIResponse,
  selectModelSelection,
  selectDistricts,
  selectCulturalIntelligence,
  selectCulturalRecommendations,
  selectPerformanceMetrics,
  selectConversationStats,
  selectPhase3Loading,
  selectPhase3Errors,
  selectCurrentConversationId,
  selectFollowUpQuestions
} from '@/store/slices/phase3AISlice';
import { 
  Brain, 
  MessageSquare, 
  Globe, 
  TrendingUp, 
  Users, 
  Zap, 
  MapPin, 
  Calendar,
  BarChart3,
  Activity,
  Clock,
  DollarSign,
  Target,
  Lightbulb
} from 'lucide-react';

interface Phase3AIIntelligenceProps {
  className?: string;
}

const Phase3AIIntelligence: React.FC<Phase3AIIntelligenceProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const aiResponse = useSelector(selectAIResponse);
  const modelSelection = useSelector(selectModelSelection);
  const districts = useSelector(selectDistricts);
  const culturalIntelligence = useSelector(selectCulturalIntelligence);
  const culturalRecommendations = useSelector(selectCulturalRecommendations);
  const performanceMetrics = useSelector(selectPerformanceMetrics);
  const conversationStats = useSelector(selectConversationStats);
  const loading = useSelector(selectPhase3Loading);
  const errors = useSelector(selectPhase3Errors);
  const currentConversationId = useSelector(selectCurrentConversationId);
  const followUpQuestions = useSelector(selectFollowUpQuestions);

  // Local state
  const [activeTab, setActiveTab] = useState('orchestration');
  const [queryInput, setQueryInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'bengali' | 'english'>('english');
  const [selectedQueryType, setSelectedQueryType] = useState<'product_search' | 'cultural_context' | 'technical_support' | 'conversational' | 'recommendation'>('conversational');
  const [selectedDistrict, setSelectedDistrictLocal] = useState('');
  const [conversationInput, setConversationInput] = useState('');

  // Load initial data
  useEffect(() => {
    dispatch(fetchCulturalIntelligence() as any);
    dispatch(fetchPerformanceMetrics() as any);
    dispatch(fetchConversationStats() as any);
  }, [dispatch]);

  // Handle intelligent query
  const handleIntelligentQuery = async () => {
    if (!queryInput.trim()) return;

    const queryContext = {
      query: queryInput,
      userId: 'admin-test',
      location: selectedDistrict || 'Dhaka',
      language: selectedLanguage,
      queryType: selectedQueryType,
      complexity: queryInput.length > 50 ? 'complex' : queryInput.length > 20 ? 'medium' : 'simple' as 'simple' | 'medium' | 'complex',
      urgency: 'medium' as 'low' | 'medium' | 'high' | 'critical'
    };

    dispatch(setCurrentQuery(queryContext));
    dispatch(processIntelligentQuery(queryContext) as any);
  };

  // Handle cultural recommendations
  const handleCulturalRecommendations = async () => {
    if (!selectedDistrict) return;

    dispatch(generateCulturalRecommendations({
      district: selectedDistrict,
      userId: 'admin-test',
      queryContext: queryInput || 'General recommendations'
    }) as any);
  };

  // Handle conversation start
  const handleStartConversation = async () => {
    if (!conversationInput.trim()) return;

    dispatch(startConversation({
      userId: 'admin-test',
      initialMessage: conversationInput,
      preferences: {
        communicationStyle: 'professional',
        responseLength: 'conversational',
        technicalLevel: 'advanced',
        culturalSensitivity: 'high',
        languagePreference: selectedLanguage === 'bengali' ? 'bengali' : 'english'
      }
    }) as any);
  };

  // Handle conversation continue
  const handleContinueConversation = async () => {
    if (!currentConversationId || !conversationInput.trim()) return;

    dispatch(continueConversation({
      conversationId: currentConversationId,
      userInput: conversationInput
    }) as any);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Phase 3 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Phase 3: AI Intelligence Expansion
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Multi-model orchestration, cultural intelligence, and conversational AI
          </p>
        </div>
        <Badge variant="secondary" className="text-green-700 bg-green-100">
          Investment: $35,000 | 3-4 weeks
        </Badge>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Models Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceMetrics?.modelsActive || 3}
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Districts Supported</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {districts.length || 64}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Conversations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {conversationStats?.activeConversations || 0}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceMetrics?.averageResponseTime || '<2'}s
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orchestration" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Orchestration
          </TabsTrigger>
          <TabsTrigger value="cultural" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Cultural Intelligence
          </TabsTrigger>
          <TabsTrigger value="conversation" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Conversational AI
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* AI Orchestration Tab */}
        <TabsContent value="orchestration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Multi-Model AI Orchestration
              </CardTitle>
              <CardDescription>
                Test intelligent query routing across Grok, DeepSeek, and OpenAI models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={selectedLanguage} onValueChange={(value: 'bengali' | 'english') => setSelectedLanguage(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="bengali">Bengali (বাংলা)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Query Type</label>
                  <Select value={selectedQueryType} onValueChange={(value: any) => setSelectedQueryType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select query type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="product_search">Product Search</SelectItem>
                      <SelectItem value="cultural_context">Cultural Context</SelectItem>
                      <SelectItem value="technical_support">Technical Support</SelectItem>
                      <SelectItem value="recommendation">Recommendation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Query</label>
                <Textarea 
                  placeholder="Enter your test query here..."
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleIntelligentQuery}
                disabled={loading.intelligentQuery || !queryInput.trim()}
                className="w-full"
              >
                {loading.intelligentQuery ? 'Processing...' : 'Process Intelligent Query'}
              </Button>

              {errors.intelligentQuery && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                  <p className="text-red-700 text-sm">{errors.intelligentQuery}</p>
                </div>
              )}

              {aiResponse && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">AI Response</h4>
                    {modelSelection && (
                      <Badge variant="outline">
                        Model: {modelSelection.selectedModel}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-sm">{aiResponse.response}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Confidence:</span>
                      <Progress value={aiResponse.confidence * 100} className="mt-1" />
                    </div>
                    <div>
                      <span className="text-gray-600">Processing Time:</span>
                      <p className="font-medium">{aiResponse.processingTime}ms</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost:</span>
                      <p className="font-medium">${aiResponse.cost.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cultural Intelligence Tab */}
        <TabsContent value="cultural" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Bangladesh Cultural Intelligence
              </CardTitle>
              <CardDescription>
                64 districts localization with festival-aware recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select District</label>
                <Select value={selectedDistrict} onValueChange={(value) => {
                  setSelectedDistrictLocal(value);
                  dispatch(setSelectedDistrict(value));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.name} value={district.name}>
                        {district.name} ({district.division})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCulturalRecommendations}
                disabled={loading.culturalData || !selectedDistrict}
                className="w-full"
              >
                {loading.culturalData ? 'Generating...' : 'Generate Cultural Recommendations'}
              </Button>

              {culturalRecommendations && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Recommendations
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {culturalRecommendations.recommendations.map((rec, idx) => (
                          <li key={idx} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Festival Alerts
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {culturalRecommendations.festivalAlerts.map((alert, idx) => (
                          <li key={idx} className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                            {alert}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {culturalIntelligence && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{culturalIntelligence.totalDistricts}</p>
                    <p className="text-sm text-gray-600">Total Districts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{culturalIntelligence.upcomingFestivalsCount}</p>
                    <p className="text-sm text-gray-600">Upcoming Festivals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{culturalIntelligence.currentSeason}</p>
                    <p className="text-sm text-gray-600">Current Season</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{culturalIntelligence.activeUserProfiles}</p>
                    <p className="text-sm text-gray-600">User Profiles</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversational AI Tab */}
        <TabsContent value="conversation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Multi-Turn Conversational AI
              </CardTitle>
              <CardDescription>
                Test context-aware conversations with Bengali language support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Conversation Message</label>
                <Textarea 
                  placeholder="Start a conversation or continue existing one..."
                  value={conversationInput}
                  onChange={(e) => setConversationInput(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleStartConversation}
                  disabled={loading.conversation || !conversationInput.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  Start New Conversation
                </Button>
                <Button 
                  onClick={handleContinueConversation}
                  disabled={loading.conversation || !conversationInput.trim() || !currentConversationId}
                  className="flex-1"
                >
                  Continue Conversation
                </Button>
              </div>

              {followUpQuestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Suggested Follow-ups
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {followUpQuestions.map((question, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setConversationInput(question.question)}
                        className="text-left justify-start h-auto p-2"
                      >
                        <div>
                          <p className="text-sm">{question.question}</p>
                          {question.questionInBengali && (
                            <p className="text-xs text-gray-500">{question.questionInBengali}</p>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {conversationStats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{conversationStats.totalConversations}</p>
                    <p className="text-sm text-gray-600">Total Conversations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{conversationStats.activeConversations}</p>
                    <p className="text-sm text-gray-600">Active Now</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{conversationStats.averageTurns.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Avg Turns</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {performanceMetrics ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Cultural Relevance</span>
                        <span className="text-sm font-medium">{(performanceMetrics.culturalRelevance * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={performanceMetrics.culturalRelevance * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Technical Accuracy</span>
                        <span className="text-sm font-medium">{(performanceMetrics.technicalAccuracy * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={performanceMetrics.technicalAccuracy * 100} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Personalization</span>
                        <span className="text-sm font-medium">{(performanceMetrics.personalization * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={performanceMetrics.personalization * 100} />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No performance data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Orchestrator</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cultural Intelligence</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conversational AI</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <Badge variant="outline">
                      <2s
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Phase3AIIntelligence;
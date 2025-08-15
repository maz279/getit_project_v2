/**
 * Phase 3: Ask Stage - Product Q&A
 * Amazon.com 5 A's Framework Implementation
 * Interactive Questions & Answers with AI Support
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Search, 
  Star,
  CheckCircle,
  Clock,
  Users,
  Brain,
  Zap,
  Award,
  Filter,
  Send,
  Bot,
  User,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductQnAProps {
  productId?: string;
  className?: string;
}

interface Question {
  id: string;
  text: string;
  category: 'technical' | 'compatibility' | 'shipping' | 'warranty' | 'usage' | 'general';
  askedBy: QnAUser;
  askedAt: string;
  votes: number;
  hasAnswer: boolean;
  answers: Answer[];
  tags: string[];
  views: number;
  featured: boolean;
}

interface Answer {
  id: string;
  text: string;
  answeredBy: QnAUser;
  answeredAt: string;
  votes: number;
  verified: boolean;
  helpful: boolean;
  source: 'user' | 'seller' | 'expert' | 'ai';
  confidence?: number;
}

interface QnAUser {
  id: string;
  name: string;
  avatar?: string;
  type: 'customer' | 'seller' | 'expert' | 'ai';
  verified: boolean;
  reputation: number;
  badges: string[];
}

interface QnAData {
  questions: Question[];
  aiSuggestions: string[];
  popularTopics: PopularTopic[];
  quickAnswers: QuickAnswer[];
}

interface PopularTopic {
  id: string;
  topic: string;
  count: number;
  category: string;
}

interface QuickAnswer {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

const ProductQnA: React.FC<ProductQnAProps> = ({
  productId,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'ask' | 'ai-help'>('questions');
  const [qnaData, setQnaData] = useState<QnAData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'unanswered'>('helpful');
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState<string>('general');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Q&A data
    const loadQnAData = () => {
      const mockUsers: QnAUser[] = [
        {
          id: 'user1',
          name: 'Ahmed Rahman',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50',
          type: 'customer',
          verified: true,
          reputation: 850,
          badges: ['Helpful Reviewer', 'Top Contributor']
        },
        {
          id: 'seller1',
          name: 'TechShop BD',
          avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50',
          type: 'seller',
          verified: true,
          reputation: 2340,
          badges: ['Verified Seller', 'Quick Response']
        },
        {
          id: 'expert1',
          name: 'Dr. Tech Expert',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50',
          type: 'expert',
          verified: true,
          reputation: 4500,
          badges: ['Tech Expert', 'Audio Specialist']
        },
        {
          id: 'ai',
          name: 'Sophie AI Assistant',
          type: 'ai',
          verified: true,
          reputation: 9999,
          badges: ['AI Assistant', 'Instant Response']
        }
      ];

      const mockQuestions: Question[] = [
        {
          id: 'q1',
          text: 'Does this headset work with PS5 and Xbox Series X?',
          category: 'compatibility',
          askedBy: mockUsers[0],
          askedAt: '2024-12-10',
          votes: 23,
          hasAnswer: true,
          views: 156,
          featured: true,
          tags: ['gaming', 'ps5', 'xbox', 'compatibility'],
          answers: [
            {
              id: 'a1',
              text: 'Yes, this headset is fully compatible with both PS5 and Xbox Series X. It connects via USB-C for the PS5 and includes a 3.5mm adapter for Xbox controllers. You can also use it wirelessly with both consoles.',
              answeredBy: mockUsers[1],
              answeredAt: '2024-12-10',
              votes: 18,
              verified: true,
              helpful: true,
              source: 'seller'
            },
            {
              id: 'a2',
              text: 'I can confirm this works perfectly with my PS5. The audio quality is excellent and the wireless connection is stable. Also works great with my PC for gaming.',
              answeredBy: mockUsers[0],
              answeredAt: '2024-12-11',
              votes: 12,
              verified: false,
              helpful: true,
              source: 'user'
            }
          ]
        },
        {
          id: 'q2',
          text: 'How long does the battery last on a single charge?',
          category: 'technical',
          askedBy: mockUsers[0],
          askedAt: '2024-12-08',
          votes: 19,
          hasAnswer: true,
          views: 203,
          featured: false,
          tags: ['battery', 'usage-time', 'charging'],
          answers: [
            {
              id: 'a3',
              text: 'The battery provides 50+ hours of use with RGB lighting off, and approximately 25-30 hours with RGB lighting on. It charges fully in about 2 hours using the included USB-C cable.',
              answeredBy: mockUsers[2],
              answeredAt: '2024-12-08',
              votes: 15,
              verified: true,
              helpful: true,
              source: 'expert'
            }
          ]
        },
        {
          id: 'q3',
          text: 'Is there any warranty included with this product?',
          category: 'warranty',
          askedBy: mockUsers[0],
          askedAt: '2024-12-07',
          votes: 8,
          hasAnswer: true,
          views: 89,
          featured: false,
          tags: ['warranty', 'support', 'guarantee'],
          answers: [
            {
              id: 'a4',
              text: 'Yes, this product comes with a 2-year international warranty covering manufacturing defects. We also provide 30 days replacement guarantee and free technical support.',
              answeredBy: mockUsers[1],
              answeredAt: '2024-12-07',
              votes: 6,
              verified: true,
              helpful: true,
              source: 'seller'
            }
          ]
        },
        {
          id: 'q4',
          text: 'Can I use this for professional audio mixing and music production?',
          category: 'usage',
          askedBy: mockUsers[0],
          askedAt: '2024-12-05',
          votes: 5,
          hasAnswer: false,
          views: 34,
          featured: false,
          tags: ['professional', 'music-production', 'audio-quality'],
          answers: []
        }
      ];

      const mockData: QnAData = {
        questions: mockQuestions,
        aiSuggestions: [
          'How to set up RGB lighting?',
          'Best audio settings for gaming',
          'Troubleshooting connection issues',
          'Cleaning and maintenance tips',
          'Compatible accessories'
        ],
        popularTopics: [
          { id: 't1', topic: 'Compatibility', count: 45, category: 'technical' },
          { id: 't2', topic: 'Battery Life', count: 38, category: 'technical' },
          { id: 't3', topic: 'Audio Quality', count: 32, category: 'usage' },
          { id: 't4', topic: 'Gaming Setup', count: 28, category: 'usage' },
          { id: 't5', topic: 'Warranty', count: 22, category: 'warranty' }
        ],
        quickAnswers: [
          {
            id: 'qa1',
            question: 'How to connect to Bluetooth?',
            answer: 'Hold the power button for 5 seconds until the LED flashes blue. Then pair from your device.',
            category: 'technical',
            helpful: 45
          },
          {
            id: 'qa2',
            question: 'What\'s included in the box?',
            answer: 'Headset, USB-C charging cable, 3.5mm audio cable, user manual, and carrying case.',
            category: 'general',
            helpful: 38
          }
        ]
      };

      setTimeout(() => {
        setQnaData(mockData);
        setLoading(false);
      }, 1000);
    };

    loadQnAData();
  }, [productId]);

  const handleAskAI = async (question: string) => {
    setAiLoading(true);
    
    // Simulate AI response
    const aiResponses = [
      'Based on the product specifications, this headset offers excellent compatibility across multiple platforms. The 50mm drivers provide rich, detailed audio perfect for gaming and entertainment.',
      'This product features advanced Bluetooth 5.2 technology ensuring stable wireless connectivity up to 30 feet. The battery life is industry-leading at 50+ hours.',
      'The build quality uses premium materials including aluminum frames and memory foam padding. It\'s designed for extended gaming sessions with optimal comfort.',
      'For professional use, this headset provides studio-quality audio with frequency response from 20Hz to 40kHz, making it suitable for content creation and streaming.'
    ];

    setTimeout(() => {
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setAiResponse(response);
      setAiLoading(false);
    }, 2000);
  };

  const filterAndSortQuestions = (questions: Question[]) => {
    let filtered = questions;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        return filtered.sort((a, b) => new Date(b.askedAt).getTime() - new Date(a.askedAt).getTime());
      case 'unanswered':
        return filtered.sort((a, b) => Number(a.hasAnswer) - Number(b.hasAnswer));
      default:
        return filtered.sort((a, b) => b.votes - a.votes);
    }
  };

  const submitQuestion = () => {
    if (!newQuestion.trim()) return;
    
    // Here you would submit the question to your backend
    console.log('Submitting question:', newQuestion, 'Category:', newQuestionCategory);
    
    // Reset form
    setNewQuestion('');
    setNewQuestionCategory('general');
    
    // Show success message
    alert('Your question has been submitted successfully!');
  };

  const QuestionCard = ({ question }: { question: Question }) => (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={question.askedBy.avatar} />
            <AvatarFallback>{question.askedBy.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium">{question.askedBy.name}</span>
              {question.askedBy.verified && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
              <Badge variant="outline" className="text-xs">{question.category}</Badge>
              {question.featured && (
                <Badge className="text-xs bg-yellow-500">Featured</Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-lg mb-2">{question.text}</h3>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{question.votes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{question.answers.length} answers</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{question.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{question.askedAt}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {question.hasAnswer && question.answers.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Answers</h4>
            {question.answers.map((answer) => (
              <div key={answer.id} className="mb-4 last:mb-0">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={answer.answeredBy.avatar} />
                    <AvatarFallback>
                      {answer.source === 'ai' ? <Bot className="h-4 w-4" /> : answer.answeredBy.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{answer.answeredBy.name}</span>
                      {answer.verified && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                      <Badge variant={
                        answer.source === 'seller' ? 'default' :
                        answer.source === 'expert' ? 'destructive' :
                        answer.source === 'ai' ? 'secondary' : 'outline'
                      } className="text-xs">
                        {answer.source}
                      </Badge>
                      {answer.source === 'ai' && answer.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {answer.confidence}% confidence
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm mb-2">{answer.text}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-primary">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{answer.votes}</span>
                      </button>
                      <span>{answer.answeredAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!question.hasAnswer && (
          <div className="border-t pt-4">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No answers yet. Be the first to help!</p>
              <Button size="sm" className="mt-2">Answer Question</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-10 bg-muted rounded w-full"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!qnaData) {
    return (
      <div className={cn('max-w-6xl mx-auto p-6', className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Q&A Unavailable</h3>
            <p className="text-muted-foreground">
              Questions and answers are not available for this product.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredQuestions = filterAndSortQuestions(qnaData.questions);

  return (
    <div className={cn('max-w-6xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-green-500" />
          Product Questions & Answers
        </h1>
        <p className="text-muted-foreground">
          Get answers from customers, sellers, and AI assistance
        </p>
      </div>

      {/* Q&A Stats */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{qnaData.questions.length}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {qnaData.questions.filter(q => q.hasAnswer).length}
              </div>
              <div className="text-sm text-muted-foreground">Answered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">96%</div>
              <div className="text-sm text-muted-foreground">Response Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">2.1h</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Q&A Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions">Browse Questions</TabsTrigger>
          <TabsTrigger value="ask">Ask Question</TabsTrigger>
          <TabsTrigger value="ai-help">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-6">
          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="compatibility">Compatibility</option>
                  <option value="shipping">Shipping</option>
                  <option value="warranty">Warranty</option>
                  <option value="usage">Usage</option>
                  <option value="general">General</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border rounded px-3 py-2"
                >
                  <option value="helpful">Most Helpful</option>
                  <option value="recent">Most Recent</option>
                  <option value="unanswered">Unanswered First</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Popular Topics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {qnaData.popularTopics.map((topic) => (
                  <Button
                    key={topic.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(topic.topic)}
                  >
                    {topic.topic} ({topic.count})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Questions ({filteredQuestions.length})
              </h2>
            </div>
            
            {filteredQuestions.length > 0 ? (
              <div>
                {filteredQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Questions Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or be the first to ask a question!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ask" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question Category</label>
                <select
                  value={newQuestionCategory}
                  onChange={(e) => setNewQuestionCategory(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="compatibility">Compatibility</option>
                  <option value="shipping">Shipping</option>
                  <option value="warranty">Warranty</option>
                  <option value="usage">Usage</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Your Question</label>
                <Textarea
                  placeholder="What would you like to know about this product?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="min-h-32"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={submitQuestion} disabled={!newQuestion.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Question
                </Button>
                <Button variant="outline" onClick={() => handleAskAI(newQuestion)}>
                  <Brain className="h-4 w-4 mr-2" />
                  Ask AI First
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Answers */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Answers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {qnaData.quickAnswers.map((qa) => (
                  <div key={qa.id} className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-sm mb-1">{qa.question}</h4>
                    <p className="text-sm text-muted-foreground">{qa.answer}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{qa.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {qa.helpful} people found this helpful
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-help" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Sophie AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Get instant answers powered by AI. Ask about product features, compatibility, 
                usage tips, and more.
              </p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Ask Sophie about this product..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAskAI(newQuestion)}
                />
                <Button 
                  onClick={() => handleAskAI(newQuestion)}
                  disabled={aiLoading || !newQuestion.trim()}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ask AI
                </Button>
              </div>
              
              {aiLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Sophie is thinking...</p>
                </div>
              )}
              
              {aiResponse && (
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Sophie AI Response</h4>
                        <p className="text-sm">{aiResponse}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Helpful
                          </Button>
                          <Button size="sm" variant="outline">
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Not Helpful
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div>
                <h4 className="font-semibold mb-3">AI Suggested Questions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {qnaData.aiSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAskAI(suggestion)}
                      className="text-left justify-start"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductQnA;
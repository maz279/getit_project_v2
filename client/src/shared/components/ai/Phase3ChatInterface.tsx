/**
 * Phase 3 Chat Interface Component
 * Advanced conversational AI interface with Bangladesh expertise
 * Implementation Date: July 20, 2025
 */

import React, { useState, useRef, useEffect } from 'react';
import { Phase3ConversationalService } from '../../services/Phase3ConversationalService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, Globe, MapPin, CreditCard, ShoppingBag, Star, Clock } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    bangladeshInsights?: any;
    suggestedActions?: string[];
  };
}

interface Phase3ChatInterfaceProps {
  onProductInquiry?: (productInfo: any) => void;
  onPriceComparison?: (priceData: any) => void;
  onExpertiseRequest?: (expertise: any) => void;
  className?: string;
  language?: 'en' | 'bn';
  userPreferences?: {
    paymentMethods?: string[];
    deliveryZone?: string;
    preferredBrands?: string[];
    culturalContext?: string;
  };
}

export function Phase3ChatInterface({
  onProductInquiry,
  onPriceComparison,
  onExpertiseRequest,
  className,
  language = 'en',
  userPreferences
}: Phase3ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [bangladeshInsights, setBangladeshInsights] = useState<any>(null);
  const [conversationCapabilities, setConversationCapabilities] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const conversationalService = Phase3ConversationalService.getInstance();

  useEffect(() => {
    // Initialize conversation capabilities
    initializeCapabilities();
    
    // Set user preferences and language
    if (userPreferences) {
      conversationalService.setUserPreferences(userPreferences);
    }
    conversationalService.setLanguage(language);
    
    // Add welcome message
    addWelcomeMessage();
  }, [language, userPreferences]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    scrollToBottom();
  }, [messages]);

  const initializeCapabilities = async () => {
    try {
      const capabilities = await conversationalService.getCapabilities();
      setConversationCapabilities(capabilities);
    } catch (error) {
      console.error('Failed to get capabilities:', error);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: language === 'bn' 
        ? 'আস্সালামু আলাইকুম! আমি GetIt এর AI সহায়ক। আমি আপনাকে পণ্য খোঁজা, দাম তুলনা, এবং বাংলাদেশী ব্র্যান্ড সম্পর্কে সাহায্য করতে পারি। আপনি কীভাবে শুরু করতে চান?'
        : 'Hello! I\'m your GetIt AI Assistant with specialized Bangladesh market expertise. I can help you find products, compare prices, get cultural recommendations, and assist with local payment methods. How can I help you today?',
      timestamp: new Date().toISOString(),
      metadata: {
        intent: 'greeting',
        confidence: 1.0,
        suggestedActions: language === 'bn' 
          ? ['পণ্য খুঁজুন', 'দাম তুলনা করুন', 'বাংলাদেশী ব্র্যান্ড', 'পেমেন্ট সাহায্য']
          : ['Search Products', 'Compare Prices', 'Bangladesh Brands', 'Payment Help']
      }
    };
    
    setMessages([welcomeMessage]);
    setSuggestedActions(welcomeMessage.metadata?.suggestedActions || []);
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const sendMessage = async (message: string, contextHints?: any) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    
    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Use enhanced processing with context awareness
      const result = await conversationalService.processMessageWithContext(message, contextHints);
      
      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.conversationResponse.response,
        timestamp: new Date().toISOString(),
        metadata: {
          intent: result.conversationResponse.intent,
          confidence: result.conversationResponse.confidence,
          bangladeshInsights: result.conversationResponse.bangladeshInsights,
          suggestedActions: result.conversationResponse.suggestedActions
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSuggestedActions(result.conversationResponse.suggestedActions);
      setBangladeshInsights(result.conversationResponse.bangladeshInsights);

      // Handle related data callbacks
      if (result.relatedData) {
        if (result.relatedData.internetSearch && onPriceComparison) {
          onPriceComparison(result.relatedData.internetSearch);
        }
        
        if (result.relatedData.bangladeshExpertise && onExpertiseRequest) {
          onExpertiseRequest(result.relatedData.bangladeshExpertise);
        }
      }

      // Handle specific intents
      if (result.conversationResponse.intent === 'product_search' && onProductInquiry) {
        onProductInquiry({
          query: message,
          intent: result.conversationResponse.intent,
          suggestions: result.conversationResponse.suggestedActions,
          bangladeshInsights: result.conversationResponse.bangladeshInsights
        });
      }

    } catch (error) {
      console.error('Message sending failed:', error);
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: language === 'bn' 
          ? 'দুঃখিত, আমি এই মুহূর্তে আপনার বার্তা প্রক্রিয়া করতে পারছি না। দয়া করে আবার চেষ্টা করুন।'
          : 'I apologize, but I\'m having trouble processing your message right now. Please try again.',
        timestamp: new Date().toISOString(),
        metadata: {
          intent: 'error',
          confidence: 0,
          suggestedActions: [language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again']
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedAction = (action: string) => {
    let contextHints: any = {};
    
    // Determine context based on action
    if (action.toLowerCase().includes('product') || action.includes('পণ্য')) {
      contextHints.isProductInquiry = true;
    } else if (action.toLowerCase().includes('price') || action.includes('দাম')) {
      contextHints.isPriceComparison = true;
    } else if (action.toLowerCase().includes('payment') || action.includes('পেমেন্ট')) {
      contextHints.isPaymentHelp = true;
    } else if (action.toLowerCase().includes('delivery') || action.includes('ডেলিভারি')) {
      contextHints.isDeliveryQuestion = true;
    } else if (action.toLowerCase().includes('cultural') || action.includes('সাংস্কৃতিক')) {
      contextHints.isCulturalQuery = true;
    }
    
    sendMessage(action, contextHints);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case 'product_search':
        return <ShoppingBag className="h-4 w-4" />;
      case 'price_inquiry':
        return <Star className="h-4 w-4" />;
      case 'payment_help':
        return <CreditCard className="h-4 w-4" />;
      case 'cultural_inquiry':
        return <Globe className="h-4 w-4" />;
      case 'order_status':
        return <MapPin className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case 'product_search':
        return 'bg-blue-100 text-blue-800';
      case 'price_inquiry':
        return 'bg-green-100 text-green-800';
      case 'payment_help':
        return 'bg-purple-100 text-purple-800';
      case 'cultural_inquiry':
        return 'bg-orange-100 text-orange-800';
      case 'order_status':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`h-[600px] flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {language === 'bn' ? 'AI সহায়ক - বাংলাদেশ এক্সপার্ট' : 'AI Assistant - Bangladesh Expert'}
          {conversationCapabilities && (
            <Badge variant="secondary" className="ml-auto">
              {conversationCapabilities.supportedLanguages?.join(' • ')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] space-y-2`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(message.timestamp)}
                    
                    {message.metadata?.intent && message.role === 'assistant' && (
                      <>
                        <Separator orientation="vertical" className="h-3" />
                        <Badge variant="outline" className={`text-xs ${getIntentColor(message.metadata.intent)}`}>
                          {getIntentIcon(message.metadata.intent)}
                          <span className="ml-1">{message.metadata.intent.replace('_', ' ')}</span>
                        </Badge>
                        
                        {message.metadata.confidence && (
                          <span className="text-xs">
                            {Math.round(message.metadata.confidence * 100)}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {language === 'bn' ? 'টাইপ করছি...' : 'Typing...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Actions */}
        {suggestedActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">
              {language === 'bn' ? 'সুপারিশকৃত কার্যক্রম:' : 'Suggested Actions:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedAction(action)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Bangladesh Insights */}
        {bangladeshInsights && Object.keys(bangladeshInsights).length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {language === 'bn' ? 'বাংলাদেশ বিশেষজ্ঞতা' : 'Bangladesh Insights'}
              </span>
            </div>
            <div className="text-xs text-green-700">
              {bangladeshInsights.culturalRelevance && (
                <p>{bangladeshInsights.culturalRelevance.seasonalContext}</p>
              )}
              {bangladeshInsights.localPreferences && (
                <p>{language === 'bn' ? 'জনপ্রিয় ব্র্যান্ড:' : 'Popular brands:'} {bangladeshInsights.localPreferences.popularBrands?.join(', ')}</p>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
            placeholder={language === 'bn' 
              ? 'আপনার প্রশ্ন লিখুন...' 
              : 'Type your message...'}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
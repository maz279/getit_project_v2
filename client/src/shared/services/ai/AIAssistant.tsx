import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  MicOff, 
  Search,
  ShoppingCart,
  Package,
  Heart,
  Star,
  MessageCircle,
  Zap,
  Clock,
  CheckCircle,
  Settings,
  HelpCircle,
  Phone,
  Mail,
  Globe,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Refresh,
  Volume2,
  VolumeX,
  Minimize,
  Maximize,
  X
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  suggestions?: string[];
  actions?: Array<{
    label: string;
    type: 'navigate' | 'search' | 'cart' | 'wishlist';
    data?: any;
  }>;
}

interface AIAssistantProps {
  minimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  minimized = false,
  onMinimize,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m Sophie, your AI shopping assistant. How can I help you today? I can help you find products, track orders, answer questions, and much more!',
      timestamp: '2024-07-15T10:00:00Z',
      status: 'delivered',
      suggestions: ['Find products', 'Track my order', 'Help with returns', 'Product recommendations']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [assistantSettings, setAssistantSettings] = useState({
    voiceEnabled: true,
    autoSpeak: false,
    language: 'en-US',
    personality: 'friendly',
    quickResponses: true
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(inputMessage),
        timestamp: new Date().toISOString(),
        status: 'delivered',
        suggestions: generateSuggestions(inputMessage),
        actions: generateActions(inputMessage)
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);

      if (assistantSettings.autoSpeak) {
        speakMessage(aiResponse.content);
      }
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('order') || input.includes('track')) {
      return 'I can help you track your order! Please provide your order number (e.g., ORD-2024-001) and I\'ll get the latest status for you.';
    }
    
    if (input.includes('product') || input.includes('find') || input.includes('search')) {
      return 'I\'d be happy to help you find products! What are you looking for? I can search by category, brand, price range, or specific features.';
    }
    
    if (input.includes('return') || input.includes('refund')) {
      return 'I can assist with returns and refunds. Most items can be returned within 30 days of purchase. Would you like me to start a return request for a specific order?';
    }
    
    if (input.includes('recommendation') || input.includes('suggest')) {
      return 'Based on your shopping history and preferences, I can recommend products you might like. What category interests you most - electronics, fashion, home, or something else?';
    }
    
    if (input.includes('payment') || input.includes('bkash') || input.includes('nagad')) {
      return 'I can help with payment issues! We support bKash, Nagad, Rocket, and credit cards. What payment method would you like assistance with?';
    }
    
    if (input.includes('delivery') || input.includes('shipping')) {
      return 'For delivery information, I can check shipping options and estimated delivery times. What\'s your location, and what type of delivery do you prefer?';
    }
    
    return 'I understand you need help with that. Could you provide a bit more detail so I can assist you better? I\'m here to help with products, orders, payments, and any other questions you might have!';
  };

  const generateSuggestions = (userInput: string): string[] => {
    const input = userInput.toLowerCase();
    
    if (input.includes('order')) {
      return ['Check order status', 'Update delivery address', 'Cancel order', 'Download invoice'];
    }
    
    if (input.includes('product')) {
      return ['Show similar products', 'Check availability', 'Compare prices', 'Add to wishlist'];
    }
    
    if (input.includes('return')) {
      return ['Start return process', 'Check return policy', 'Track return status', 'Contact support'];
    }
    
    return ['Browse categories', 'Special offers', 'Customer support', 'Account settings'];
  };

  const generateActions = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('product') || input.includes('find')) {
      return [
        { label: 'Search Products', type: 'search' as const, data: { query: userInput } },
        { label: 'Browse Categories', type: 'navigate' as const, data: { url: '/categories' } }
      ];
    }
    
    if (input.includes('cart')) {
      return [
        { label: 'View Cart', type: 'cart' as const },
        { label: 'Checkout', type: 'navigate' as const, data: { url: '/checkout' } }
      ];
    }
    
    return [];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const startListening = () => {
    setIsListening(true);
    // In real implementation, this would use Speech Recognition API
    setTimeout(() => {
      setIsListening(false);
      setInputMessage('Can you help me find wireless headphones?');
    }, 2000);
  };

  const speakMessage = (message: string) => {
    if (!assistantSettings.voiceEnabled) return;
    
    setIsSpeaking(true);
    // In real implementation, this would use Speech Synthesis API
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent': return <CheckCircle className="w-3 h-3 text-blue-500" />;
      case 'delivered': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'read': return <CheckCircle className="w-3 h-3 text-green-600" />;
      default: return null;
    }
  };

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onMinimize}
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Bot className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Bot className="w-6 h-6 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <CardTitle className="text-lg">Sophie AI Assistant</CardTitle>
                <CardDescription className="text-sm">
                  {isLoading ? 'Typing...' : 'Online • Ready to help'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={onMinimize}>
                <Minimize className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full px-4">
              <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
              <TabsTrigger value="quick" className="flex-1">Quick Actions</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="p-4 space-y-4">
              {/* Chat Messages */}
              <ScrollArea ref={scrollRef} className="h-64 pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.type === 'user' && (
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(message.status)}
                            </div>
                          )}
                        </div>
                        
                        {/* Suggestions */}
                        {message.suggestions && (
                          <div className="mt-2 space-y-1">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 mr-1 mb-1"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {/* Actions */}
                        {message.actions && (
                          <div className="mt-2 space-y-1">
                            {message.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant="secondary"
                                size="sm"
                                className="text-xs h-6 mr-1 mb-1"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startListening}
                    disabled={isListening}
                    className={isListening ? 'bg-red-100' : ''}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quick" className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-16 flex-col">
                  <Search className="w-5 h-5 mb-1" />
                  <span className="text-xs">Find Products</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-xs">Track Order</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <ShoppingCart className="w-5 h-5 mb-1" />
                  <span className="text-xs">View Cart</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Heart className="w-5 h-5 mb-1" />
                  <span className="text-xs">Wishlist</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <HelpCircle className="w-5 h-5 mb-1" />
                  <span className="text-xs">Help Center</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Phone className="w-5 h-5 mb-1" />
                  <span className="text-xs">Contact</span>
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Frequently Asked</h4>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full text-left text-xs justify-start h-8">
                    How do I return an item?
                  </Button>
                  <Button variant="ghost" className="w-full text-left text-xs justify-start h-8">
                    What payment methods do you accept?
                  </Button>
                  <Button variant="ghost" className="w-full text-left text-xs justify-start h-8">
                    How long does delivery take?
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Voice Responses</p>
                    <p className="text-xs text-gray-600">Enable voice responses from AI</p>
                  </div>
                  <Button
                    variant={assistantSettings.voiceEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAssistantSettings({
                      ...assistantSettings,
                      voiceEnabled: !assistantSettings.voiceEnabled
                    })}
                  >
                    {assistantSettings.voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Auto Speak</p>
                    <p className="text-xs text-gray-600">Automatically speak AI responses</p>
                  </div>
                  <Button
                    variant={assistantSettings.autoSpeak ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAssistantSettings({
                      ...assistantSettings,
                      autoSpeak: !assistantSettings.autoSpeak
                    })}
                  >
                    {assistantSettings.autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Quick Responses</p>
                    <p className="text-xs text-gray-600">Show suggestion buttons</p>
                  </div>
                  <Button
                    variant={assistantSettings.quickResponses ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAssistantSettings({
                      ...assistantSettings,
                      quickResponses: !assistantSettings.quickResponses
                    })}
                  >
                    {assistantSettings.quickResponses ? <Zap className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="pt-2 border-t">
                  <h4 className="font-medium text-sm mb-2">Assistant Info</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Powered by advanced AI technology</p>
                    <p>• Available 24/7 for instant support</p>
                    <p>• Continuously learning and improving</p>
                    <p>• Secure and privacy-focused</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Refresh className="w-4 h-4 mr-1" />
                    Reset Chat
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Help
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
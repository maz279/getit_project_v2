import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Badge } from '@/shared/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  User, 
  Bot, 
  Phone,
  Mail,
  Clock,
  Star,
  FileText,
  Camera,
  Paperclip
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  rating: number;
  responseTime: string;
}

export const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStatus, setChatStatus] = useState<'queue' | 'connected' | 'ended'>('queue');
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock agent data
  const mockAgent: Agent = {
    id: 'agent-001',
    name: 'Sarah Ahmed',
    avatar: '/api/placeholder/40/40',
    status: 'online',
    rating: 4.9,
    responseTime: '< 30 seconds'
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial system message
      const welcomeMessage: Message = {
        id: '1',
        type: 'system',
        content: 'Welcome to GetIt Customer Support! An agent will be with you shortly.',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);

      // Simulate agent connection
      setTimeout(() => {
        setCurrentAgent(mockAgent);
        setChatStatus('connected');
        
        const agentMessage: Message = {
          id: '2',
          type: 'agent',
          content: 'Hi! I\'m Sarah from GetIt support. How can I help you today?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentMessage]);
      }, 2000);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false);
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: getAgentResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentResponse]);
    }, 1500);
  };

  const getAgentResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('order') || message.includes('tracking')) {
      return 'I can help you track your order. Please provide your order number (format: GIT-XXXX-XXX) and I\'ll look it up for you.';
    }
    if (message.includes('return') || message.includes('refund')) {
      return 'I\'ll help you with your return. You can initiate a return through your account, or I can guide you through the process. What item would you like to return?';
    }
    if (message.includes('payment') || message.includes('bkash') || message.includes('nagad')) {
      return 'I can assist with payment issues. Are you having trouble with a specific payment method? We support bKash, Nagad, Rocket, and credit/debit cards.';
    }
    if (message.includes('delivery') || message.includes('shipping')) {
      return 'For delivery inquiries, I can check your shipping status or help with delivery preferences. We offer same-day, next-day, and standard delivery options.';
    }
    return 'Thank you for your message. Let me look into that for you. Is there any specific information you can provide to help me assist you better?';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      console.log('Files uploaded:', files);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const quickActions = [
    { label: 'Track Order', action: () => setInputMessage('I need to track my order') },
    { label: 'Return Item', action: () => setInputMessage('I want to return an item') },
    { label: 'Payment Issue', action: () => setInputMessage('I have a payment problem') },
    { label: 'Delivery Info', action: () => setInputMessage('When will my order arrive?') }
  ];

  // Chat bubble button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 relative"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 h-96 ${isMinimized ? 'h-14' : 'h-96'} shadow-xl transition-all duration-300`}>
        {/* Header */}
        <CardHeader className="pb-2 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <CardTitle className="text-sm">Customer Support</CardTitle>
                {currentAgent && (
                  <div className="flex items-center space-x-1 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{currentAgent.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="h-6 w-6 p-0 text-white hover:bg-blue-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Agent Info */}
            {currentAgent && chatStatus === 'connected' && (
              <div className="p-3 bg-gray-50 border-b">
                <div className="flex items-center space-x-2">
                  <img 
                    src={currentAgent.avatar} 
                    alt={currentAgent.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{currentAgent.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{currentAgent.rating}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{currentAgent.responseTime}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">Online</Badge>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%]`}>
                    {message.type !== 'user' && (
                      <div className="flex-shrink-0">
                        {message.type === 'agent' ? (
                          <img 
                            src={currentAgent?.avatar || '/api/placeholder/24/24'} 
                            alt="Agent"
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <Bot className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                    )}
                    <div
                      className={`rounded-lg p-2 text-sm ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.type === 'system'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                      <div className={`text-xs mt-1 opacity-70`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start space-x-2">
                  <img 
                    src={currentAgent?.avatar || '/api/placeholder/24/24'} 
                    alt="Agent"
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="bg-gray-100 rounded-lg p-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="p-3 border-t bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
                <div className="grid grid-cols-2 gap-1">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="text-xs h-8"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 p-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default LiveChatWidget;
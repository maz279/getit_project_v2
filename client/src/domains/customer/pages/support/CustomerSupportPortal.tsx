// CustomerSupportPortal.tsx - Amazon.com/Shopee.sg-Level Customer Support Portal
import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, Search, Clock, User, CheckCircle, AlertCircle, FileText, Headphones, Video, Bot, Zap, Star, ThumbsUp, ArrowRight } from 'lucide-react';
import { useSEO } from '@/shared/hooks/useSEO';

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: Date;
  lastResponse: Date;
  messages: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
  tags: string[];
}

const CustomerSupportPortal: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showLiveChat, setShowLiveChat] = useState(false);

  useSEO({
    title: 'Customer Support Portal - Get Help 24/7 | GetIt Bangladesh',
    description: 'Get instant help with live chat, phone support, comprehensive FAQ, and ticket system. 24/7 customer service for Bangladesh.',
    keywords: 'customer support, help center, live chat, FAQ, ticket system, Bangladesh support'
  });

  useEffect(() => {
    // Mock support data
    const mockTickets: SupportTicket[] = [
      {
        id: 'TK-2025-001',
        subject: 'Refund request for order #GIT12345',
        status: 'in_progress',
        priority: 'medium',
        category: 'Refunds & Returns',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastResponse: new Date(Date.now() - 4 * 60 * 60 * 1000),
        messages: 3
      },
      {
        id: 'TK-2025-002',
        subject: 'bKash payment not processing',
        status: 'resolved',
        priority: 'high',
        category: 'Payment Issues',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lastResponse: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        messages: 5
      }
    ];

    const mockFAQs: FAQ[] = [
      {
        id: 'faq-1',
        question: 'How do I track my order?',
        answer: 'You can track your order by going to the "Order Tracking" page and entering your order number, or by logging into your account and viewing your order history. You\'ll receive SMS updates with tracking information.',
        category: 'Orders & Shipping',
        helpful: 234,
        notHelpful: 12,
        tags: ['tracking', 'order', 'shipping']
      },
      {
        id: 'faq-2',
        question: 'What payment methods do you accept?',
        answer: 'We accept various payment methods including bKash, Nagad, Rocket, credit/debit cards (Visa, MasterCard), bank transfers, and cash on delivery (COD) for most areas in Bangladesh.',
        category: 'Payment & Billing',
        helpful: 189,
        notHelpful: 8,
        tags: ['payment', 'bkash', 'nagad', 'rocket', 'cod']
      },
      {
        id: 'faq-3',
        question: 'How do I return or exchange an item?',
        answer: 'You can return most items within 7 days of delivery. Go to your order history, select the item, and choose "Return/Exchange". For electronics, the return period is 3 days. Items must be in original condition.',
        category: 'Returns & Refunds',
        helpful: 156,
        notHelpful: 23,
        tags: ['return', 'exchange', 'refund']
      },
      {
        id: 'faq-4',
        question: 'How long does delivery take?',
        answer: 'Delivery times vary by location: Dhaka (1-2 days), Chittagong & Sylhet (2-3 days), other cities (3-5 days). Express delivery is available in major cities for same-day or next-day delivery.',
        category: 'Orders & Shipping',
        helpful: 267,
        notHelpful: 15,
        tags: ['delivery', 'shipping', 'dhaka', 'bangladesh']
      },
      {
        id: 'faq-5',
        question: 'How do I cancel an order?',
        answer: 'You can cancel your order before it\'s shipped by going to your order history and clicking "Cancel Order". If the order has already been shipped, you\'ll need to return it after delivery.',
        category: 'Orders & Shipping',
        helpful: 145,
        notHelpful: 9,
        tags: ['cancel', 'order']
      }
    ];

    setTickets(mockTickets);
    setFaqs(mockFAQs);
    setIsLoading(false);
  }, []);

  const categories = ['all', 'Orders & Shipping', 'Payment & Billing', 'Returns & Refunds', 'Account & Profile', 'Technical Issues'];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading support portal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">How can we help you?</h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Get instant help with our 24/7 customer support. Search our knowledge base or contact our expert team.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles, guides, or FAQs..."
              className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-xl border-none focus:ring-4 focus:ring-white/30 text-lg"
            />
          </div>
          
          {/* Quick Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => setShowLiveChat(true)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all group"
            >
              <MessageSquare className="h-8 w-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Live Chat</h3>
              <p className="text-sm opacity-80">Chat with our AI assistant or agent</p>
            </button>
            
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all group">
              <Phone className="h-8 w-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p className="text-sm opacity-80">+880 1700-123456</p>
            </button>
            
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all group">
              <Video className="h-8 w-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Video Call</h3>
              <p className="text-sm opacity-80">Screen sharing support</p>
            </button>
            
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/20 transition-all group">
              <Mail className="h-8 w-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm opacity-80">support@getit.com.bd</p>
            </button>
          </div>
        </div>
      </section>

      {/* Support Stats */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">&lt; 2 min</h3>
              <p className="text-gray-600">Average Response Time</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">4.9/5</h3>
              <p className="text-gray-600">Customer Satisfaction</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">24/7</h3>
              <p className="text-gray-600">Support Available</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4">
                <ThumbsUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">98%</h3>
              <p className="text-gray-600">Issue Resolution Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* My Support Tickets */}
      {tickets.length > 0 && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">My Support Tickets</h2>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Create New Ticket
              </button>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span>Ticket #{ticket.id}</span>
                          <span>{ticket.category}</span>
                          <span>{ticket.messages} messages</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Created: {formatTimestamp(ticket.createdAt)}</span>
                          <span>Last response: {formatTimestamp(ticket.lastResponse)}</span>
                        </div>
                      </div>
                      
                      <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredFAQs.map(faq => (
              <div key={faq.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{faq.question}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {faq.category}
                  </span>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-4">{faq.answer}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Was this helpful?</span>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{faq.helpful}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors">
                        <ThumbsUp className="h-4 w-4 transform rotate-180" />
                        <span>{faq.notHelpful}</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {faq.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? `No articles match your search for "${searchQuery}"`
                  : 'No FAQs available for this category.'
                }
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Still need help?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Assistant</h3>
              <p className="text-gray-600 mb-6">Get instant answers from our smart AI assistant trained on thousands of customer queries.</p>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Chat with AI
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Live Agent</h3>
              <p className="text-gray-600 mb-6">Connect with our experienced customer service agents for personalized assistance.</p>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                Start Live Chat
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Headphones className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Phone Support</h3>
              <p className="text-gray-600 mb-6">Speak directly with our support team. Available 24/7 for urgent matters.</p>
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                Call Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Chat Widget */}
      {showLiveChat && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <div className="bg-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold">Live Chat Support</h3>
            <button
              onClick={() => setShowLiveChat(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          </div>
          
          <div className="p-4 h-80 flex items-center justify-center text-gray-600">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Chat feature coming soon!</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerSupportPortal;
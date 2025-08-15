// HelpCenter.tsx - Amazon.com/Shopee.sg-Level Help & Support Center
import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Phone, Mail, Book, Video, Clock, Star, ChevronRight, Headphones, Shield, Truck, CreditCard, User, ArrowLeft } from 'lucide-react';
import { useSEO } from '@/shared/hooks/useSEO';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  tags: string[];
}

interface SupportTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  articles: number;
  color: string;
}

interface ContactOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  availability: string;
  responseTime: string;
  action: string;
  color: string;
}

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [supportTopics, setSupportTopics] = useState<SupportTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Help Center - Get Support & Find Answers | GetIt Bangladesh',
    description: 'Find answers to your questions, contact our 24/7 support team, and get help with orders, payments, shipping, and more.',
    keywords: 'help center, customer support, FAQ, contact support, order help, payment help, shipping help, returns'
  });

  useEffect(() => {
    // Mock FAQ data
    const mockFAQs: FAQItem[] = [
      {
        id: '1',
        question: 'How do I track my order?',
        answer: 'You can track your order by logging into your account and visiting the "My Orders" section. You\'ll also receive tracking information via SMS and email once your order ships.',
        category: 'orders',
        helpful: 245,
        tags: ['tracking', 'orders', 'shipping']
      },
      {
        id: '2',
        question: 'What payment methods do you accept?',
        answer: 'We accept bKash, Nagad, Rocket, credit/debit cards (Visa, MasterCard), bank transfers, and cash on delivery (COD) for most areas in Bangladesh.',
        category: 'payments',
        helpful: 189,
        tags: ['payment', 'mobile banking', 'COD']
      },
      {
        id: '3',
        question: 'How can I return or exchange an item?',
        answer: 'You can return items within 7 days of delivery. Go to "My Orders", select the item you want to return, and follow the return process. We offer free returns for most products.',
        category: 'returns',
        helpful: 167,
        tags: ['returns', 'exchange', 'refund']
      },
      {
        id: '4',
        question: 'Is cash on delivery available in my area?',
        answer: 'Cash on delivery (COD) is available in most areas across Bangladesh including Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, and Mymensingh divisions.',
        category: 'delivery',
        helpful: 134,
        tags: ['COD', 'delivery', 'areas']
      },
      {
        id: '5',
        question: 'How do I use mobile banking for payment?',
        answer: 'Select your preferred mobile banking option (bKash, Nagad, or Rocket) at checkout. You\'ll be redirected to your mobile banking app or receive an OTP to complete the payment securely.',
        category: 'payments',
        helpful: 198,
        tags: ['mobile banking', 'bKash', 'Nagad', 'Rocket']
      }
    ];

    const mockSupportTopics: SupportTopic[] = [
      {
        id: 'orders',
        title: 'Orders & Tracking',
        description: 'Track orders, modify orders, order status',
        icon: Truck,
        articles: 25,
        color: 'blue'
      },
      {
        id: 'payments',
        title: 'Payments & Billing',
        description: 'Payment methods, refunds, billing issues',
        icon: CreditCard,
        articles: 18,
        color: 'green'
      },
      {
        id: 'account',
        title: 'Account & Profile',
        description: 'Login issues, profile settings, security',
        icon: User,
        articles: 15,
        color: 'purple'
      },
      {
        id: 'returns',
        title: 'Returns & Refunds',
        description: 'Return process, exchange, refund status',
        icon: ArrowLeft,
        articles: 12,
        color: 'orange'
      },
      {
        id: 'delivery',
        title: 'Shipping & Delivery',
        description: 'Delivery areas, shipping costs, delivery time',
        icon: Truck,
        articles: 20,
        color: 'red'
      },
      {
        id: 'security',
        title: 'Security & Privacy',
        description: 'Data protection, fraud prevention, privacy',
        icon: Shield,
        articles: 10,
        color: 'gray'
      }
    ];

    setFaqs(mockFAQs);
    setSupportTopics(mockSupportTopics);
    setLoading(false);
  }, []);

  const contactOptions: ContactOption[] = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team instantly',
      icon: MessageCircle,
      availability: '24/7',
      responseTime: 'Instant',
      action: 'Start Chat',
      color: 'blue'
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Call our customer service hotline',
      icon: Phone,
      availability: '9 AM - 9 PM',
      responseTime: 'Immediate',
      action: 'Call Now',
      color: 'green'
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      availability: '24/7',
      responseTime: '2-4 hours',
      action: 'Send Email',
      color: 'purple'
    },
    {
      id: 'callback',
      title: 'Request Callback',
      description: 'We\'ll call you back at your convenience',
      icon: Headphones,
      availability: '9 AM - 9 PM',
      responseTime: '15-30 mins',
      action: 'Request Callback',
      color: 'orange'
    }
  ];

  const categories = ['all', 'orders', 'payments', 'account', 'returns', 'delivery', 'security'];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getTopicColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
      red: 'bg-red-100 text-red-700',
      gray: 'bg-gray-100 text-gray-700'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const getContactColor = (color: string) => {
    const colors = {
      blue: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
      green: 'border-green-200 hover:border-green-300 hover:bg-green-50',
      purple: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50',
      orange: 'border-orange-200 hover:border-orange-300 hover:bg-orange-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getContactButtonColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-green-600 hover:bg-green-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      orange: 'bg-orange-600 hover:bg-orange-700'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading help center...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            How can we help you?
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Find answers, get support, and resolve issues quickly
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help articles, FAQs, or ask a question..."
                className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg shadow-lg text-lg focus:ring-4 focus:ring-white/30 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
            <span className="bg-white/20 px-4 py-2 rounded-full">📦 Order Tracking</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">💳 Payment Help</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">🚚 Delivery Issues</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">🔄 Returns & Refunds</span>
          </div>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contact Our Support Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactOptions.map(option => (
              <div 
                key={option.id} 
                className={`bg-white border-2 rounded-lg p-6 text-center transition-all cursor-pointer ${getContactColor(option.color)}`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${getTopicColor(option.color)}`}>
                  <option.icon className="h-6 w-6" />
                </div>
                
                <h3 className="font-bold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                
                <div className="text-xs text-gray-500 mb-4">
                  <div>Available: {option.availability}</div>
                  <div>Response: {option.responseTime}</div>
                </div>
                
                <button className={`w-full text-white py-2 px-4 rounded-lg font-medium transition-colors ${getContactButtonColor(option.color)}`}>
                  {option.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Topics */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Topic</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportTopics.map(topic => (
              <div 
                key={topic.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${getTopicColor(topic.color)}`}>
                    <topic.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{topic.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{topic.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{topic.articles} articles</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-white">
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
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFAQs.map(faq => (
              <div key={faq.id} className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-purple-600">Q:</span>
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    <span className="text-green-600 font-medium">A:</span> {faq.answer}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {faq.tags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Was this helpful?</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{faq.helpful}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <Book className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">
                  {searchQuery 
                    ? `No results found for "${searchQuery}". Try different keywords or browse by category.`
                    : 'No articles available in this category.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Additional Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center">
              <Video className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Video Tutorials</h3>
              <p className="text-gray-600 text-sm mb-4">
                Watch step-by-step guides on how to use our platform
              </p>
              <button className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                Watch Videos →
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center">
              <Book className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">User Guide</h3>
              <p className="text-gray-600 text-sm mb-4">
                Complete documentation on all platform features
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Read Guide →
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center">
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">System Status</h3>
              <p className="text-gray-600 text-sm mb-4">
                Check current system status and ongoing maintenance
              </p>
              <button className="text-green-600 font-medium hover:text-green-700 transition-colors">
                View Status →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our support team is available 24/7 to assist you with any questions or issues
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Start Live Chat
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-all flex items-center justify-center gap-2">
              <Phone className="h-5 w-5" />
              Call Support
            </button>
          </div>
          
          <p className="text-sm mt-6 opacity-75">
            Average response time: Less than 2 minutes • Customer satisfaction: 98%
          </p>
        </div>
      </section>
    </>
  );
};

export default HelpCenter;
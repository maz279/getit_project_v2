import { useState } from 'react';
import { Phone, MessageCircle, Mail, Clock, MapPin, Star, ChevronRight, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export default function CustomerServicePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('en');

  const faqData = [
    {
      question: language === 'bn' ? 'অর্ডার কিভাবে ট্র্যাক করবো?' : 'How can I track my order?',
      answer: language === 'bn' ? 'আপনার অর্ডার ট্র্যাক করতে আপনার অ্যাকাউন্টে লগইন করুন এবং "আমার অর্ডার" অংশে যান।' : 'You can track your order by logging into your account and going to "My Orders" section.',
      category: 'orders'
    },
    {
      question: language === 'bn' ? 'রিটার্ন পলিসি কি?' : 'What is the return policy?',
      answer: language === 'bn' ? 'আমাদের ৩০ দিনের রিটার্ন পলিসি আছে। পণ্য অবশ্যই মূল অবস্থায় থাকতে হবে।' : 'We have a 30-day return policy. Items must be in original condition.',
      category: 'returns'
    },
    {
      question: language === 'bn' ? 'পেমেন্ট মেথড কি কি?' : 'What payment methods are accepted?',
      answer: language === 'bn' ? 'আমরা বিকাশ, নগদ, রকেট, ক্রেডিট কার্ড এবং ক্যাশ অন ডেলিভারি গ্রহণ করি।' : 'We accept bKash, Nagad, Rocket, Credit Cards, and Cash on Delivery.',
      category: 'payment'
    },
    {
      question: language === 'bn' ? 'ডেলিভারি সময় কত?' : 'How long does delivery take?',
      answer: language === 'bn' ? 'ঢাকায় ২৪ ঘন্টার মধ্যে, ঢাকার বাইরে ৩-৫ দিনের মধ্যে ডেলিভারি।' : 'Delivery within 24 hours in Dhaka, 3-5 days outside Dhaka.',
      category: 'delivery'
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: language === 'bn' ? 'ফোন সাপোর্ট' : 'Phone Support',
      description: language === 'bn' ? '২৪/৭ ফোন সাপোর্ট' : '24/7 Phone Support',
      contact: '+880 1700-000000',
      action: language === 'bn' ? 'কল করুন' : 'Call Now'
    },
    {
      icon: MessageCircle,
      title: language === 'bn' ? 'লাইভ চ্যাট' : 'Live Chat',
      description: language === 'bn' ? 'তাৎক্ষণিক সাহায্য' : 'Instant Help',
      contact: language === 'bn' ? 'চ্যাট শুরু করুন' : 'Start Chat',
      action: language === 'bn' ? 'চ্যাট' : 'Chat'
    },
    {
      icon: Mail,
      title: language === 'bn' ? 'ইমেইল সাপোর্ট' : 'Email Support',
      description: language === 'bn' ? '২৪ ঘন্টার মধ্যে জবাব' : 'Response within 24 hours',
      contact: 'support@getit.com.bd',
      action: language === 'bn' ? 'ইমেইল' : 'Email'
    }
  ];

  const filteredFAQ = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              {language === 'bn' ? 'গ্রাহক সেবা' : 'Customer Service'}
            </h1>
            <p className="text-xl text-orange-100">
              {language === 'bn' ? 'আমরা সবসময় আপনার সাহায্যের জন্য প্রস্তুত' : 'We are always here to help you'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <method.icon className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg font-semibold">{method.title}</CardTitle>
                <p className="text-gray-600">{method.description}</p>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg font-medium text-gray-800 mb-4">{method.contact}</p>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  {method.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {language === 'bn' ? 'প্রায়শই জিজ্ঞাসিত প্রশ্ন' : 'Frequently Asked Questions'}
            </CardTitle>
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={language === 'bn' ? 'প্রশ্ন খুঁজুন...' : 'Search questions...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFAQ.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <HelpCircle className="h-5 w-5 text-orange-600 mr-2" />
                      {faq.question}
                    </h3>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mt-2 ml-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center">
              <Clock className="h-6 w-6 text-orange-600 mr-2" />
              {language === 'bn' ? 'অফিস সময়' : 'Operating Hours'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">
                  {language === 'bn' ? 'ফোন সাপোর্ট' : 'Phone Support'}
                </h4>
                <p className="text-gray-600">
                  {language === 'bn' ? 'সপ্তাহের সব দিন ২৪ ঘন্টা' : '24 hours, 7 days a week'}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">
                  {language === 'bn' ? 'লাইভ চ্যাট' : 'Live Chat'}
                </h4>
                <p className="text-gray-600">
                  {language === 'bn' ? 'সকাল ৯টা - রাত ১১টা' : '9:00 AM - 11:00 PM'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Office Address */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center">
              <MapPin className="h-6 w-6 text-orange-600 mr-2" />
              {language === 'bn' ? 'অফিস ঠিকানা' : 'Office Address'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600">
              <p className="mb-2">
                {language === 'bn' ? 'গেটইট হেড অফিস' : 'GetIt Head Office'}
              </p>
              <p className="mb-2">
                {language === 'bn' ? '১২৩ গুলশান এভিনিউ, গুলশান-২' : '123 Gulshan Avenue, Gulshan-2'}
              </p>
              <p className="mb-2">
                {language === 'bn' ? 'ঢাকা-১২১২, বাংলাদেশ' : 'Dhaka-1212, Bangladesh'}
              </p>
              <p className="font-semibold">
                {language === 'bn' ? 'ফোন: +৮৮০ ১৭০০-০০০০০০' : 'Phone: +880 1700-000000'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language Toggle */}
        <div className="text-center mt-8">
          <Button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            variant="outline"
            className="border-orange-600 text-orange-600 hover:bg-orange-50"
          >
            {language === 'en' ? 'বাংলায় দেখুন' : 'View in English'}
          </Button>
        </div>
      </div>
    </div>
  );
}
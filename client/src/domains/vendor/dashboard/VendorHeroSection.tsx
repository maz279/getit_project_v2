
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/shared/ui/carousel';
import { Users, Award, Truck, Star, Globe, DollarSign } from 'lucide-react';

const stats = [
  { label: "Active Customers", value: "2M+", icon: Users },
  { label: "Vendors", value: "5K+", icon: Award },
  { label: "Daily Orders", value: "50K+", icon: Truck },
  { label: "Rating", value: "4.8/5", icon: Star },
  { label: "Districts", value: "64", icon: Globe },
  { label: "Sales", value: "৳500Cr+", icon: DollarSign }
];

const slides = [
  {
    title: "🚀 Start Your Success Story",
    subtitle: "Join 5,000+ thriving vendors on GetIt",
    description: "✨ From local shop to nationwide success - GetIt makes it possible with zero setup costs",
    testimonial: "⭐ \"From ৳50K to ৳5L monthly sales in 8 months\" - Rashida Khan, Fashion Store",
    background: "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
  },
  {
    title: "💎 Premium Vendor Benefits",
    subtitle: "Lowest commission rates in Bangladesh",
    description: "🏆 Only 2% commission + FREE marketing support + Priority customer service",
    testimonial: "💼 \"GetIt's support helped me expand to 64 districts\" - Karim Electronics",
    background: "bg-gradient-to-br from-green-50 via-blue-50 to-teal-50"
  },
  {
    title: "🎯 Smart Business Growth",
    subtitle: "AI-powered analytics & instant payments",
    description: "📊 Real-time sales tracking + Weekly payouts + Smart inventory management",
    testimonial: "🚀 \"GetIt's analytics doubled my profit margins\" - Fatima Fashion",
    background: "bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50"
  },
  {
    title: "🌟 Complete Business Solution",
    subtitle: "Everything you need to succeed online",
    description: "📱 Professional store setup + Marketing tools + 24/7 customer support",
    testimonial: "💫 \"GetIt transformed my small business into a brand\" - Ahmed Handicrafts",
    background: "bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50"
  }
];

export const VendorHeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleStartJourney = () => {
    // Scroll to the vendor onboarding section
    const vendorSection = document.getElementById('vendor-onboarding');
    if (vendorSection) {
      vendorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 py-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-5 left-5 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-5 right-5 w-64 h-64 bg-pink-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-52 h-52 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <Carousel className="mb-6">
          <CarouselContent>
            {slides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center shadow-2xl">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-lg text-white/90 mb-2 drop-shadow-md">
                    {slide.subtitle}
                  </p>
                  <p className="text-base text-white/80 mb-4 drop-shadow-sm">
                    {slide.description}
                  </p>
                  
                  <Button 
                    size="default" 
                    className="mb-4 text-base py-2 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    onClick={handleStartJourney}
                  >
                    🏪 Start Your Business Journey
                  </Button>
                  
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 p-3 rounded-xl inline-block shadow-lg">
                    <p className="text-white font-medium drop-shadow-sm text-sm">{slide.testimonial}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
          <CarouselNext className="right-4 bg-white/20 border-white/30 text-white hover:bg-white/30" />
        </Carousel>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 text-center p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="pt-2">
                <stat.icon className="w-5 h-5 mx-auto mb-1 text-white drop-shadow-sm" />
                <div className="text-base font-bold text-white drop-shadow-sm">{stat.value}</div>
                <p className="text-xs text-white/80 drop-shadow-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

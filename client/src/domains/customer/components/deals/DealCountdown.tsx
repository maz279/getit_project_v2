import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Clock, Zap, Star, Gift } from 'lucide-react';

interface DealCountdownProps {
  className?: string;
}

export const DealCountdown: React.FC<DealCountdownProps> = ({ className }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  const megaDeals = [
    {
      title: '🔥 Flash Sale',
      description: 'Up to 80% off electronics',
      endTime: '2024-07-12T18:00:00',
      color: 'from-red-500 to-orange-500',
      icon: Zap,
      dealCount: 156
    },
    {
      title: '⭐ Weekend Special',
      description: 'Buy 2 Get 1 Free on fashion',
      endTime: '2024-07-14T23:59:59',
      color: 'from-purple-500 to-pink-500',
      icon: Star,
      dealCount: 89
    },
    {
      title: '🎁 Daily Surprise',
      description: 'Mystery boxes starting ৳99',
      endTime: '2024-07-11T23:59:59',
      color: 'from-green-500 to-blue-500',
      icon: Gift,
      dealCount: 45
    }
  ];

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const CountdownTimer = ({ time }: { time: typeof timeLeft }) => (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[60px]">
          <div className="text-2xl font-bold text-white">{String(time.hours).padStart(2, '0')}</div>
          <div className="text-xs text-white/80">Hours</div>
        </div>
      </div>
      <div className="text-white text-xl">:</div>
      <div className="text-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[60px]">
          <div className="text-2xl font-bold text-white">{String(time.minutes).padStart(2, '0')}</div>
          <div className="text-xs text-white/80">Minutes</div>
        </div>
      </div>
      <div className="text-white text-xl">:</div>
      <div className="text-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 min-w-[60px]">
          <div className="text-2xl font-bold text-white">{String(time.seconds).padStart(2, '0')}</div>
          <div className="text-xs text-white/80">Seconds</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Flash Sale Countdown */}
      <Card className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 border-0 overflow-hidden">
        <CardContent className="p-6 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-6 h-6 text-white" />
                  <Badge className="bg-white text-red-600 font-bold">LIVE NOW</Badge>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  ⚡ Flash Sale Ends In
                </h2>
                <p className="text-lg text-white/90">
                  Don't miss out on incredible savings!
                </p>
              </div>
              
              <CountdownTimer time={timeLeft} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multiple Deal Countdowns */}
      <div className="grid md:grid-cols-3 gap-4">
        {megaDeals.map((deal, index) => {
          const Icon = deal.icon;
          return (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-br ${deal.color} p-4 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="w-6 h-6" />
                    <Badge className="bg-white/20 text-white border-0">
                      {deal.dealCount} deals
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-1">{deal.title}</h3>
                  <p className="text-sm text-white/90 mb-4">{deal.description}</p>
                  
                  {/* Mini Countdown */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <div className="flex items-center gap-1 text-sm">
                      <span className="bg-white/20 px-2 py-1 rounded">
                        {String(timeLeft.hours + index).padStart(2, '0')}h
                      </span>
                      <span>:</span>
                      <span className="bg-white/20 px-2 py-1 rounded">
                        {String(timeLeft.minutes + (index * 10)).padStart(2, '0')}m
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Urgency Banner */}
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-3 text-white">
            <Zap className="w-5 h-5 animate-pulse" />
            <span className="font-bold">
              🔥 {timeLeft.hours}h {timeLeft.minutes}m left! Shop now before prices go back up!
            </span>
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
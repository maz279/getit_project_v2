import React from 'react';
import { 
  Zap, 
  Play, 
  Gift, 
  ShoppingBag, 
  Crown, 
  Gamepad2, 
  Users, 
  Coins,
  Timer,
  Sparkles
} from 'lucide-react';
import { Link } from 'wouter';

interface QuickAccessItem {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  link: string;
  gradient: string;
  iconBg: string;
  badge?: string;
}

const quickAccessItems: QuickAccessItem[] = [
  {
    id: 1,
    title: "Flash Sale",
    subtitle: "Time Limited",
    icon: <Zap className="w-6 h-6" />,
    link: "/flash-sale",
    gradient: "bg-gradient-to-br from-red-500 to-orange-500",
    iconBg: "bg-red-100",
    badge: "LIVE"
  },
  {
    id: 2,
    title: "GetIt Live",
    subtitle: "Watch & Shop",
    icon: <Play className="w-6 h-6" />,
    link: "/live",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
    iconBg: "bg-purple-100"
  },
  {
    id: 3,
    title: "Premium Mall",
    subtitle: "Authentic Only",
    icon: <Crown className="w-6 h-6" />,
    link: "/premium-mall",
    gradient: "bg-gradient-to-br from-blue-600 to-indigo-600",
    iconBg: "bg-blue-100"
  },
  {
    id: 4,
    title: "Vouchers",
    subtitle: "Save More",
    icon: <Gift className="w-6 h-6" />,
    link: "/vouchers",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
    iconBg: "bg-green-100"
  },
  {
    id: 5,
    title: "Group Buy",
    subtitle: "Better Price",
    icon: <Users className="w-6 h-6" />,
    link: "/group-buy",
    gradient: "bg-gradient-to-br from-teal-500 to-cyan-500",
    iconBg: "bg-teal-100"
  },
  {
    id: 6,
    title: "GetIt Games",
    subtitle: "Play & Win",
    icon: <Gamepad2 className="w-6 h-6" />,
    link: "/games",
    gradient: "bg-gradient-to-br from-yellow-500 to-orange-500",
    iconBg: "bg-yellow-100"
  },
  {
    id: 7,
    title: "Coin Rewards",
    subtitle: "Earn Points",
    icon: <Coins className="w-6 h-6" />,
    link: "/rewards",
    gradient: "bg-gradient-to-br from-amber-500 to-yellow-500",
    iconBg: "bg-amber-100"
  },
  {
    id: 8,
    title: "Daily Check-in",
    subtitle: "Free Coins",
    icon: <Sparkles className="w-6 h-6" />,
    link: "/daily-checkin",
    gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
    iconBg: "bg-pink-100"
  }
];

export const QuickAccessFeatures: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-slate-50 via-zinc-50 to-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Quick Access Features
          </h2>
          <p className="text-gray-600 text-xs">
            Discover amazing deals, live shopping, games, and rewards
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {quickAccessItems.map((item) => (
            <Link key={item.id} href={item.link}>
              <div className="group cursor-pointer">
                {/* Feature Card */}
                <div className="relative bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200">
                  {/* Badge */}
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold z-10">
                      {item.badge}
                    </div>
                  )}

                  {/* Icon Container */}
                  <div className="flex justify-center mb-1">
                    <div className={`${item.iconBg} p-1.5 rounded-full group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-gray-700">
                        {React.cloneElement(item.icon as React.ReactElement, { className: "w-4 h-4" })}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-800 text-xs mb-0.5 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Gradient Overlay on Hover */}
                  <div className={`absolute inset-0 ${item.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Special Promotion Banner */}
        <div className="mt-3 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-lg p-2 text-white text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Timer className="w-3 h-3" />
              <span className="font-bold text-sm">⚡ MEGA FLASH SALE ⚡</span>
            </div>
            <p className="text-xs opacity-90">
              Up to 90% OFF | Free Shipping | Limited Time Only!
            </p>
            <div className="mt-1 text-xs opacity-80">
              ⏰ Ends in: 23:45:12
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-1 left-2 w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute bottom-1 right-3 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-6 w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccessFeatures;
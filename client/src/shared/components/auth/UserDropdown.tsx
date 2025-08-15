import { useState } from 'react';
import { User, Settings, ShoppingBag, Heart, MapPin, Bell, Shield, CreditCard, LogOut, Crown, UserCircle, Package, History, HelpCircle, Star } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu';
import { Badge } from '@/shared/ui/badge';
import { useAuth } from '@/domains/customer/auth/components/AuthProvider';
import { useSimpleLanguage } from '@/contexts/SimpleLanguageContext';

interface UserDropdownProps {
  className?: string;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const { language } = useSimpleLanguage();

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      section: language === 'bn' ? 'অ্যাকাউন্ট' : 'Account',
      items: [
        {
          icon: UserCircle,
          label: language === 'bn' ? 'প্রোফাইল' : 'Profile',
          href: '/profile',
          description: language === 'bn' ? 'ব্যক্তিগত তথ্য ও সেটিংস' : 'Personal info & settings'
        },
        {
          icon: Settings,
          label: language === 'bn' ? 'অ্যাকাউন্ট সেটিংস' : 'Account Settings',
          href: '/account/settings',
          description: language === 'bn' ? 'গোপনীয়তা ও নিরাপত্তা' : 'Privacy & security'
        }
      ]
    },
    {
      section: language === 'bn' ? 'অর্ডার' : 'Orders',
      items: [
        {
          icon: ShoppingBag,
          label: language === 'bn' ? 'আমার অর্ডার' : 'My Orders',
          href: '/orders',
          badge: '2',
          description: language === 'bn' ? 'অর্ডারের ইতিহাস ও ট্র্যাকিং' : 'Order history & tracking'
        },
        {
          icon: Package,
          label: language === 'bn' ? 'ট্র্যাক অর্ডার' : 'Track Orders',
          href: '/orders/track',
          description: language === 'bn' ? 'লাইভ অর্ডার ট্র্যাকিং' : 'Live order tracking'
        },
        {
          icon: History,
          label: language === 'bn' ? 'অর্ডার ইতিহাস' : 'Order History',
          href: '/orders/history',
          description: language === 'bn' ? 'সম্পূর্ণ অর্ডার ইতিহাস' : 'Complete order history'
        }
      ]
    },
    {
      section: language === 'bn' ? 'শপিং' : 'Shopping',
      items: [
        {
          icon: Heart,
          label: language === 'bn' ? 'উইশলিস্ট' : 'Wishlist',
          href: '/wishlist',
          badge: '8',
          description: language === 'bn' ? 'পছন্দের পণ্যের তালিকা' : 'Saved favorite items'
        },
        {
          icon: Star,
          label: language === 'bn' ? 'রিভিউ' : 'Reviews',
          href: '/reviews',
          description: language === 'bn' ? 'আপনার পণ্যের রিভিউ' : 'Your product reviews'
        },
        {
          icon: MapPin,
          label: language === 'bn' ? 'ঠিকানা' : 'Addresses',
          href: '/addresses',
          description: language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery addresses'
        }
      ]
    },
    {
      section: language === 'bn' ? 'পেমেন্ট' : 'Payment',
      items: [
        {
          icon: CreditCard,
          label: language === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Methods',
          href: '/payment/methods',
          description: language === 'bn' ? 'কার্ড ও মোবাইল ব্যাংকিং' : 'Cards & mobile banking'
        }
      ]
    },
    {
      section: language === 'bn' ? 'সাপোর্ট' : 'Support',
      items: [
        {
          icon: HelpCircle,
          label: language === 'bn' ? 'সাহায্য কেন্দ্র' : 'Help Center',
          href: '/help',
          description: language === 'bn' ? 'FAQ ও গ্রাহক সেবা' : 'FAQ & customer service'
        },
        {
          icon: Bell,
          label: language === 'bn' ? 'নোটিফিকেশন' : 'Notifications',
          href: '/notifications',
          badge: '3',
          description: language === 'bn' ? 'অর্ডার ও অফার আপডেট' : 'Order & offer updates'
        }
      ]
    }
  ];

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative h-10 w-10 rounded-full hover:bg-white/10 transition-colors ${className}`}
        >
          <Avatar className="h-9 w-9 border-2 border-white/20">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
              {getUserInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          
          {user.role === 'premium' && (
            <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 fill-current" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 max-h-[80vh] overflow-y-auto" align="end" forceMount>
        {/* User Profile Header */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                {user.role === 'premium' && (
                  <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    {language === 'bn' ? 'প্রিমিয়াম' : 'Premium'}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <div className="flex items-center mt-1 space-x-1">
                {user.isEmailVerified && (
                  <Badge variant="outline" className="text-green-600 border-green-200 text-xs px-1">
                    ✓ {language === 'bn' ? 'ইমেইল' : 'Email'}
                  </Badge>
                )}
                {user.isPhoneVerified && (
                  <Badge variant="outline" className="text-green-600 border-green-200 text-xs px-1">
                    ✓ {language === 'bn' ? 'ফোন' : 'Phone'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items by Section */}
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <DropdownMenuLabel className="text-xs font-medium text-gray-500 px-4 py-2">
              {section.section}
            </DropdownMenuLabel>
            
            {section.items.map((item, itemIndex) => {
              const Icon = item.icon;
              return (
                <DropdownMenuItem
                  key={itemIndex}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 flex items-center justify-between"
                  onClick={() => window.location.href = item.href}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
            
            {sectionIndex < menuItems.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}

        <DropdownMenuSeparator />
        
        {/* Logout */}
        <DropdownMenuItem
          className="px-4 py-3 cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span className="font-medium">{language === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
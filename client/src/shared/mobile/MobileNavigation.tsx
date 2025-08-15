/**
 * Phase 2: Mobile Navigation Component
 * Amazon.com/Shopee.sg-Level Mobile-First Navigation
 * Optimized for Bangladesh mobile users
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  ShoppingCart, 
  User, 
  Heart,
  Grid3X3,
  Star,
  Gift,
  Headphones,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  badge?: number;
  active?: boolean;
}

interface MobileNavigationProps {
  items?: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
  showBadges?: boolean;
  position?: 'bottom' | 'top';
  variant?: 'tabs' | 'hamburger' | 'hybrid';
  hapticFeedback?: boolean;
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  onItemClick,
  showBadges = true,
  position = 'bottom',
  variant = 'hybrid',
  hapticFeedback = true,
  className,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Default navigation items for GetIt Bangladesh
  const defaultItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: '/',
      active: true,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Grid3X3,
      href: '/categories',
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      href: '/search',
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart,
      href: '/cart',
      badge: 3,
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      href: '/account',
    },
  ];

  const navigationItems = items || defaultItems;

  // Extended menu items for hamburger menu
  const extendedMenuItems: NavigationItem[] = [
    ...navigationItems,
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      href: '/wishlist',
      badge: 5,
    },
    {
      id: 'deals',
      label: 'Flash Deals',
      icon: Star,
      href: '/deals',
    },
    {
      id: 'gifts',
      label: 'Gift Cards',
      icon: Gift,
      href: '/gifts',
    },
    {
      id: 'support',
      label: 'Support',
      icon: Headphones,
      href: '/help',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      href: '/notifications',
      badge: 2,
    },
  ];

  // Haptic feedback
  const triggerHapticFeedback = () => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }
  };

  // Handle item click
  const handleItemClick = (item: NavigationItem) => {
    triggerHapticFeedback();
    setActiveItem(item.id);
    onItemClick?.(item);
    
    if (item.href) {
      window.location.href = item.href;
    }
    
    if (variant === 'hamburger') {
      setIsMenuOpen(false);
    }
  };

  // Toggle menu
  const toggleMenu = () => {
    triggerHapticFeedback();
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [isMenuOpen]);

  // Tab Navigation (Bottom Bar)
  const TabNavigation = () => (
    <div
      className={cn(
        'fixed left-0 right-0 z-50 bg-background border-t',
        'flex items-center justify-around',
        'h-16 px-2 safe-area-pb',
        position === 'bottom' ? 'bottom-0' : 'top-0',
        className
      )}
    >
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.active || activeItem === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={cn(
              'flex flex-col items-center justify-center',
              'min-h-[44px] min-w-[44px] px-2 py-1',
              'transition-all duration-200',
              'active:scale-95',
              isActive && 'text-primary'
            )}
          >
            <div className="relative">
              <Icon className={cn(
                'h-5 w-5 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )} />
              
              {showBadges && item.badge && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </div>
            
            <span className={cn(
              'text-xs mt-1 transition-colors',
              isActive ? 'text-primary font-medium' : 'text-muted-foreground'
            )}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Hamburger Menu
  const HamburgerMenu = () => (
    <>
      {/* Menu Button */}
      <div className={cn(
        'fixed z-50',
        position === 'bottom' ? 'bottom-4 right-4' : 'top-4 right-4'
      )}>
        <Button
          onClick={toggleMenu}
          size="lg"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div
            ref={menuRef}
            className={cn(
              'fixed z-50 bg-background rounded-lg shadow-xl',
              'max-h-[80vh] overflow-y-auto',
              position === 'bottom' 
                ? 'bottom-20 right-4 left-4'
                : 'top-20 right-4 left-4 max-w-sm ml-auto'
            )}
          >
            <Card>
              <CardContent className="p-2">
                <div className="space-y-1">
                  {extendedMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.active || activeItem === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-lg',
                          'transition-all duration-200',
                          'hover:bg-muted active:scale-95',
                          'min-h-[48px]',
                          isActive && 'bg-primary/10 text-primary'
                        )}
                      >
                        <div className="relative">
                          <Icon className="h-5 w-5" />
                          
                          {showBadges && item.badge && (
                            <Badge
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                            >
                              {item.badge > 99 ? '99+' : item.badge}
                            </Badge>
                          )}
                        </div>
                        
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  );

  // Hybrid Navigation (Tab bar + hamburger for overflow)
  const HybridNavigation = () => (
    <>
      <TabNavigation />
      
      {/* Hamburger button in tab bar */}
      <div className={cn(
        'fixed z-50',
        position === 'bottom' ? 'bottom-16 right-2' : 'top-16 right-2'
      )}>
        <Button
          onClick={toggleMenu}
          size="sm"
          variant="outline"
          className="h-8 w-8 rounded-full"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Extended menu for overflow items */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          <div
            ref={menuRef}
            className={cn(
              'fixed z-50 bg-background rounded-lg shadow-xl p-2',
              position === 'bottom' 
                ? 'bottom-28 right-4 left-4'
                : 'top-28 right-4 left-4 max-w-xs ml-auto'
            )}
          >
            <div className="grid grid-cols-2 gap-2">
              {extendedMenuItems.slice(5).map((item) => {
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg',
                      'transition-all duration-200',
                      'hover:bg-muted active:scale-95',
                      'min-h-[60px]'
                    )}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5" />
                      
                      {showBadges && item.badge && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                        >
                          {item.badge > 99 ? '99+' : item.badge}
                        </Badge>
                      )}
                    </div>
                    
                    <span className="text-xs text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );

  // Render based on variant
  switch (variant) {
    case 'tabs':
      return <TabNavigation />;
    case 'hamburger':
      return <HamburgerMenu />;
    case 'hybrid':
      return <HybridNavigation />;
    default:
      return <TabNavigation />;
  }
};

export default MobileNavigation;
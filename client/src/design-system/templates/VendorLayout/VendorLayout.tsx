/**
 * VendorLayout Template - Vendor dashboard layout
 * Amazon.com/Shopee.sg Enterprise Standards
 */

import { ReactNode, useState } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import { Icon, UserIcon } from '../../atoms/Icon/Icon';
import { cn } from '@/lib/utils';

export interface VendorLayoutProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  breadcrumb?: {
    label: string;
    href?: string;
  }[];
  vendor?: {
    name: string;
    email: string;
    avatar?: string;
    storeName: string;
    verified: boolean;
  };
  navigation?: {
    label: string;
    href: string;
    icon?: ReactNode;
    active?: boolean;
    badge?: string;
  }[];
  actions?: ReactNode;
  sidebar?: ReactNode;
  collapsible?: boolean;
}

export const VendorLayout = ({
  children,
  className,
  title,
  subtitle,
  breadcrumb = [],
  vendor,
  navigation = [],
  actions,
  sidebar,
  collapsible = true,
  ...props
}: VendorLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const defaultNavigation = [
    {
      label: 'Dashboard',
      href: '/vendor',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /></Icon>,
      active: false
    },
    {
      label: 'Products',
      href: '/vendor/products',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></Icon>,
      active: false
    },
    {
      label: 'Orders',
      href: '/vendor/orders',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8" /></Icon>,
      active: false,
      badge: '5'
    },
    {
      label: 'Inventory',
      href: '/vendor/inventory',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h1.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H19a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></Icon>,
      active: false
    },
    {
      label: 'Analytics',
      href: '/vendor/analytics',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></Icon>,
      active: false
    },
    {
      label: 'Promotions',
      href: '/vendor/promotions',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></Icon>,
      active: false
    },
    {
      label: 'Finance',
      href: '/vendor/finance',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></Icon>,
      active: false
    },
    {
      label: 'Reviews',
      href: '/vendor/reviews',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></Icon>,
      active: false
    },
    {
      label: 'Store Settings',
      href: '/vendor/settings',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>,
      active: false
    }
  ];

  const activeNavigation = navigation.length > 0 ? navigation : defaultNavigation;

  return (
    <div className={cn('min-h-screen bg-background', className)} {...props}>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-muted border-r transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Store Info */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className={cn('flex items-center space-x-2', sidebarCollapsed && 'justify-center')}>
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                <Typography variant="small" className="font-bold text-white">
                  V
                </Typography>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <Typography variant="h6" className="font-bold">
                    Vendor Portal
                  </Typography>
                  {vendor?.storeName && (
                    <Typography variant="caption" className="text-muted-foreground">
                      {vendor.storeName}
                    </Typography>
                  )}
                </div>
              )}
            </div>
            
            {collapsible && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={cn(sidebarCollapsed && 'hidden')}
              >
                <Icon className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </Icon>
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {activeNavigation.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                  item.active
                    ? 'bg-green-600 text-white'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  sidebarCollapsed && 'justify-center'
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </a>
            ))}
          </nav>

          {/* Vendor Info */}
          {vendor && (
            <div className="p-4 border-t">
              <div className={cn('flex items-center space-x-3', sidebarCollapsed && 'justify-center')}>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  {vendor.avatar ? (
                    <img src={vendor.avatar} alt={vendor.name} className="w-full h-full rounded-full" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-white" />
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Typography variant="small" className="font-medium">
                        {vendor.name}
                      </Typography>
                      {vendor.verified && (
                        <Icon className="h-3 w-3 text-green-600">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </Icon>
                      )}
                    </div>
                    <Typography variant="caption" className="text-muted-foreground">
                      {vendor.verified ? 'Verified Vendor' : 'Pending Verification'}
                    </Typography>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
        {/* Header */}
        <header className="bg-background border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {collapsible && sidebarCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(false)}
                >
                  <Icon className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </Icon>
                </Button>
              )}

              <div>
                {breadcrumb.length > 0 && (
                  <nav className="flex items-center space-x-2 text-sm mb-1">
                    {breadcrumb.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {item.label}
                          </a>
                        ) : (
                          <span className="text-foreground font-medium">{item.label}</span>
                        )}
                        {index < breadcrumb.length - 1 && (
                          <Icon className="h-3 w-3 text-muted-foreground">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </Icon>
                        )}
                      </div>
                    ))}
                  </nav>
                )}
                
                {title && (
                  <Typography variant="h4" className="font-semibold">
                    {title}
                  </Typography>
                )}
                
                {subtitle && (
                  <Typography variant="small" className="text-muted-foreground">
                    {subtitle}
                  </Typography>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <Button variant="outline" size="sm">
                <Icon className="h-4 w-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </Icon>
                Add Product
              </Button>
              
              <Button variant="outline" size="sm">
                <Icon className="h-4 w-4 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a7.5 7.5 0 0115 0v10z" />
                </Icon>
                Bulk Upload
              </Button>

              {/* Store Status */}
              <div className="flex items-center space-x-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  vendor?.verified ? 'bg-green-500' : 'bg-yellow-500'
                )} />
                <Typography variant="small" className="text-muted-foreground">
                  {vendor?.verified ? 'Store Active' : 'Pending Review'}
                </Typography>
              </div>

              {/* Custom Actions */}
              {actions}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {sidebar ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                {sidebar}
              </div>
              <div className="lg:col-span-3">
                {children}
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
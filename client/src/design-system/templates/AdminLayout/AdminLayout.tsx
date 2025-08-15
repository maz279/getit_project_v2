/**
 * AdminLayout Template - Admin dashboard layout
 * Amazon.com/Shopee.sg Enterprise Standards
 */

import { ReactNode, useState } from 'react';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import { Icon, UserIcon } from '../../atoms/Icon/Icon';
import { cn } from '@/lib/utils';

export interface AdminLayoutProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  breadcrumb?: {
    label: string;
    href?: string;
  }[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
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

export const AdminLayout = ({
  children,
  className,
  title,
  subtitle,
  breadcrumb = [],
  user,
  navigation = [],
  actions,
  sidebar,
  collapsible = true,
  ...props
}: AdminLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const defaultNavigation = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" /></Icon>,
      active: false
    },
    {
      label: 'Products',
      href: '/admin/products',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></Icon>,
      active: false
    },
    {
      label: 'Orders',
      href: '/admin/orders',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8" /></Icon>,
      active: false,
      badge: '12'
    },
    {
      label: 'Customers',
      href: '/admin/customers',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" /></Icon>,
      active: false
    },
    {
      label: 'Analytics',
      href: '/admin/analytics',
      icon: <Icon><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></Icon>,
      active: false
    },
    {
      label: 'Settings',
      href: '/admin/settings',
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
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className={cn('flex items-center space-x-2', sidebarCollapsed && 'justify-center')}>
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Typography variant="small" className="font-bold text-primary-foreground">
                  G
                </Typography>
              </div>
              {!sidebarCollapsed && (
                <Typography variant="h6" className="font-bold">
                  GetIt Admin
                </Typography>
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
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  sidebarCollapsed && 'justify-center'
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </a>
            ))}
          </nav>

          {/* User Info */}
          {user && (
            <div className="p-4 border-t">
              <div className={cn('flex items-center space-x-3', sidebarCollapsed && 'justify-center')}>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1">
                    <Typography variant="small" className="font-medium">
                      {user.name}
                    </Typography>
                    <Typography variant="caption" className="text-muted-foreground">
                      {user.role}
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
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
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

export default AdminLayout;
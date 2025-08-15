/**
 * CustomerLayout Template - Customer-facing page layout
 * Amazon.com/Shopee.sg Enterprise Standards
 */

import { ReactNode } from 'react';
import { Header } from '../../organisms/Header/Header';
import { Typography } from '../../atoms/Typography/Typography';
import { Button } from '../../atoms/Button/Button';
import { Icon } from '../../atoms/Icon/Icon';
import { cn } from '@/lib/utils';

export interface CustomerLayoutProps {
  children: ReactNode;
  className?: string;
  header?: {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    cartCount?: number;
    wishlistCount?: number;
    isAuthenticated?: boolean;
    navigation?: {
      label: string;
      href: string;
      active?: boolean;
    }[];
  };
  footer?: {
    showNewsletter?: boolean;
    showSocialLinks?: boolean;
    showCulturalInfo?: boolean;
  };
  breadcrumb?: {
    label: string;
    href?: string;
  }[];
  pageTitle?: string;
  pageDescription?: string;
  sidebar?: ReactNode;
  sticky?: boolean;
  culturalMode?: boolean;
}

export const CustomerLayout = ({
  children,
  className,
  header = {},
  footer = {},
  breadcrumb = [],
  pageTitle,
  pageDescription,
  sidebar,
  sticky = true,
  culturalMode = false,
  ...props
}: CustomerLayoutProps) => {
  const defaultNavigation = [
    { label: 'Home', href: '/', active: false },
    { label: 'Categories', href: '/categories', active: false },
    { label: 'Deals', href: '/deals', active: false },
    { label: 'New Arrivals', href: '/new-arrivals', active: false },
    { label: 'Brands', href: '/brands', active: false },
    { label: 'Help', href: '/help', active: false }
  ];

  const footerLinks = {
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Blog', href: '/blog' }
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Track Order', href: '/track-order' },
      { label: 'Returns', href: '/returns' }
    ],
    policies: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Refund Policy', href: '/refunds' }
    ]
  };

  const culturalLinks = culturalMode ? [
    { label: 'Islamic Calendar', href: '/islamic-calendar' },
    { label: 'Prayer Times', href: '/prayer-times' },
    { label: 'Halal Products', href: '/halal' },
    { label: 'Ramadan Collection', href: '/ramadan' }
  ] : [];

  return (
    <div className={cn('min-h-screen bg-background', className)} {...props}>
      {/* Header */}
      <Header
        variant={culturalMode ? 'cultural' : 'default'}
        sticky={sticky}
        navigation={header.navigation || defaultNavigation}
        {...header}
      />

      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="border-b bg-muted/50">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm">
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
          </div>
        </div>
      )}

      {/* Page Header */}
      {(pageTitle || pageDescription) && (
        <div className="border-b bg-background">
          <div className="container mx-auto px-4 py-8">
            {pageTitle && (
              <Typography variant="h1" className="mb-2">
                {pageTitle}
              </Typography>
            )}
            {pageDescription && (
              <Typography variant="lead" className="text-muted-foreground">
                {pageDescription}
              </Typography>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {sidebar ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <aside className="lg:col-span-1">
                {sidebar}
              </aside>
              <div className="lg:col-span-3">
                {children}
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <Typography variant="h5" className="mb-4">
                GetIt
              </Typography>
              <Typography variant="small" className="text-muted-foreground mb-4">
                Your trusted e-commerce platform for Bangladesh. 
                {culturalMode && ' Serving with Islamic values and cultural sensitivity.'}
              </Typography>
              
              {footer.showSocialLinks && (
                <div className="flex space-x-4">
                  <Button variant="ghost" size="icon">
                    <Icon className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </Icon>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Icon className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </Icon>
                  </Button>
                </div>
              )}
            </div>

            {/* Company Links */}
            <div>
              <Typography variant="h6" className="mb-4">
                Company
              </Typography>
              <ul className="space-y-2">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <Typography variant="h6" className="mb-4">
                Support
              </Typography>
              <ul className="space-y-2">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies / Cultural */}
            <div>
              <Typography variant="h6" className="mb-4">
                {culturalMode ? 'Cultural Services' : 'Policies'}
              </Typography>
              <ul className="space-y-2">
                {(culturalMode ? culturalLinks : footerLinks.policies).map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          {footer.showNewsletter && (
            <div className="border-t mt-8 pt-8">
              <div className="max-w-md">
                <Typography variant="h6" className="mb-2">
                  Stay Updated
                </Typography>
                <Typography variant="small" className="text-muted-foreground mb-4">
                  Subscribe to our newsletter for exclusive deals and updates.
                </Typography>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 border border-input rounded-md text-sm bg-background"
                  />
                  <Button size="sm">Subscribe</Button>
                </div>
              </div>
            </div>
          )}

          {/* Copyright */}
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <Typography variant="small" className="text-muted-foreground">
              © 2025 GetIt. All rights reserved.
            </Typography>
            
            {footer.showCulturalInfo && culturalMode && (
              <Typography variant="small" className="text-muted-foreground">
                Serving Bangladesh with Islamic values • Halal certified products
              </Typography>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
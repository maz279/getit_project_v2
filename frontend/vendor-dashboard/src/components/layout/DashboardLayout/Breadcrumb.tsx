/**
 * Breadcrumb Component - Amazon.com/Shopee.sg-Level Navigation Breadcrumbs
 * 
 * Complete Breadcrumb Navigation System:
 * - Dynamic breadcrumb generation based on current route
 * - Vendor-specific page hierarchy and navigation
 * - Bangladesh-specific page names and translations
 * - Click-to-navigate functionality
 * - Mobile-responsive design
 * - SEO-optimized structured data
 */

import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../../utils/helpers/className';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();

  // Generate breadcrumb items based on current path
  const breadcrumbItems = useMemo(() => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    // Remove 'vendor' prefix for cleaner breadcrumbs
    const vendorSegments = segments.slice(1);
    
    const items: BreadcrumbItem[] = [
      {
        label: 'Dashboard',
        href: '/vendor/dashboard'
      }
    ];

    // Map route segments to readable labels
    const routeLabels: Record<string, string> = {
      'dashboard': 'Dashboard',
      'products': 'Products',
      'add': 'Add Product',
      'edit': 'Edit Product',
      'bulk-upload': 'Bulk Upload',
      'inventory': 'Inventory',
      'categories': 'Categories',
      'reviews': 'Reviews',
      'orders': 'Orders',
      'processing': 'Processing',
      'shipping': 'Shipping',
      'returns': 'Returns & Refunds',
      'customers': 'Customers',
      'segments': 'Customer Segments',
      'communication': 'Communication',
      'marketing': 'Marketing',
      'promotions': 'Promotions',
      'campaigns': 'Campaigns',
      'advertising': 'Advertising',
      'seo': 'SEO Tools',
      'finances': 'Finances',
      'earnings': 'Earnings',
      'transactions': 'Transactions',
      'invoicing': 'Invoicing',
      'tax-reports': 'Tax Reports',
      'banking': 'Banking',
      'payouts': 'Payouts',
      'store': 'Store',
      'settings': 'Settings',
      'design': 'Store Design',
      'kyc': 'KYC Verification',
      'performance': 'Performance',
      'analytics': 'Analytics',
      'reports': 'Reports',
      'notifications': 'Notifications',
      'support': 'Support',
      'tickets': 'Help Desk',
      'docs': 'Documentation',
      'training': 'Training',
      'account': 'Account Settings',
      'payments': 'Payment Setup',
      'integrations': 'Integrations',
      'profile': 'Profile'
    };

    // Build breadcrumb path
    let currentPath = '/vendor';
    
    vendorSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === vendorSegments.length - 1;
      
      // Skip dashboard as it's already included
      if (segment === 'dashboard' && index === 0) return;
      
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      items.push({
        label,
        href: isLast ? undefined : currentPath,
        isCurrentPage: isLast
      });
    });

    return items;
  }, [location.pathname]);

  // Don't show breadcrumbs on dashboard home
  if (location.pathname === '/vendor/dashboard' || location.pathname === '/vendor') {
    return null;
  }

  return (
    <nav className="py-3" aria-label="Breadcrumb">
      <div className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
            
            {item.isCurrentPage ? (
              <span 
                className="text-gray-900 font-medium"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href!}
                className={cn(
                  "text-gray-500 hover:text-gray-700 transition-colors",
                  index === 0 && "flex items-center"
                )}
              >
                {index === 0 && <Home className="h-4 w-4 mr-1" />}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbItems.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              "item": item.href ? `${window.location.origin}${item.href}` : undefined
            }))
          })
        }}
      />
    </nav>
  );
};

export default Breadcrumb;
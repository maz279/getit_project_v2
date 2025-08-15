/**
 * AdminBreadcrumb - Navigation breadcrumb for admin panel
 */

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'wouter';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <ol className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
        <li>
          <Link href="/admin">
            <a className="flex items-center hover:text-gray-700 dark:hover:text-gray-300">
              <Home className="h-4 w-4" />
            </a>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            {item.href ? (
              <Link href={item.href}>
                <a className="hover:text-gray-700 dark:hover:text-gray-300">
                  {item.label}
                </a>
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100 font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default AdminBreadcrumb;
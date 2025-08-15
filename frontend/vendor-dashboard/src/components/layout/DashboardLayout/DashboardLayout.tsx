/**
 * DashboardLayout Component - Amazon.com/Shopee.sg-Level Vendor Dashboard Layout
 * 
 * Complete Dashboard Layout System:
 * - Responsive sidebar navigation with vendor-specific sections
 * - Top header with notifications, vendor info, and quick actions
 * - Main content area with breadcrumb navigation
 * - Real-time notifications and performance indicators
 * - Bangladesh-specific vendor features integration
 * - Mobile-responsive with collapsible sidebar
 * - Multi-language support (Bengali/English)
 * - Theme management (light/dark/vendor themes)
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../../utils/helpers/className';
import { 
  Menu, 
  X, 
  Bell, 
  Settings, 
  HelpCircle,
  ChevronRight,
  Store,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Components
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import NotificationCenter from '../../dashboard/Notifications/NotificationCenter';

// Hooks and Context
import { useVendorAuth } from '../../../hooks/auth/useVendorAuth';
import { useNotifications } from '../../../hooks/dashboard/useNotifications';
import { useVendorStore } from '../../../hooks/store/useVendorStore';

// Types
interface DashboardLayoutProps {
  children?: React.ReactNode;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { vendor, isAuthenticated, loading } = useVendorAuth();
  const { notifications, unreadCount } = useNotifications();
  const { storeStatus, kycStatus } = useVendorStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);

  // Check for system alerts based on vendor status
  useEffect(() => {
    const alerts: SystemAlert[] = [];

    // KYC Status Alerts
    if (kycStatus === 'pending') {
      alerts.push({
        id: 'kyc-pending',
        type: 'warning',
        title: 'KYC Verification Pending',
        message: 'Your KYC verification is under review. You have limited access until verification is complete.',
        action: {
          label: 'View Status',
          onClick: () => window.location.href = '/vendor/kyc-verification'
        }
      });
    } else if (kycStatus === 'rejected') {
      alerts.push({
        id: 'kyc-rejected',
        type: 'error',
        title: 'KYC Verification Failed',
        message: 'Your KYC verification was rejected. Please update your documents and resubmit.',
        action: {
          label: 'Update Documents',
          onClick: () => window.location.href = '/vendor/kyc-verification'
        }
      });
    }

    // Store Status Alerts
    if (storeStatus === 'inactive') {
      alerts.push({
        id: 'store-inactive',
        type: 'warning',
        title: 'Store Inactive',
        message: 'Your store is currently inactive. Activate it to start receiving orders.',
        action: {
          label: 'Activate Store',
          onClick: () => window.location.href = '/vendor/store/settings'
        }
      });
    }

    // Payout Alerts
    if (vendor?.pendingPayoutAmount && vendor.pendingPayoutAmount > 0) {
      alerts.push({
        id: 'pending-payout',
        type: 'info',
        title: 'Pending Payout Available',
        message: `You have ৳${vendor.pendingPayoutAmount.toLocaleString()} pending for payout.`,
        action: {
          label: 'View Details',
          onClick: () => window.location.href = '/vendor/finances/payouts'
        }
      });
    }

    setSystemAlerts(alerts);
  }, [kycStatus, storeStatus, vendor]);

  // Handle mobile sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle notifications panel toggle
  const toggleNotifications = () => {
    setNotificationsPanelOpen(!notificationsPanelOpen);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to access the vendor dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/vendor/login'}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-center justify-between py-3 px-4 rounded-lg my-2",
                  {
                    "bg-blue-50 border border-blue-200": alert.type === 'info',
                    "bg-yellow-50 border border-yellow-200": alert.type === 'warning',
                    "bg-red-50 border border-red-200": alert.type === 'error',
                    "bg-green-50 border border-green-200": alert.type === 'success'
                  }
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {alert.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-600" />}
                    {alert.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                    {alert.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                    {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                  <div>
                    <h4 className={cn(
                      "text-sm font-medium",
                      {
                        "text-blue-800": alert.type === 'info',
                        "text-yellow-800": alert.type === 'warning',
                        "text-red-800": alert.type === 'error',
                        "text-green-800": alert.type === 'success'
                      }
                    )}>
                      {alert.title}
                    </h4>
                    <p className={cn(
                      "text-sm",
                      {
                        "text-blue-700": alert.type === 'info',
                        "text-yellow-700": alert.type === 'warning',
                        "text-red-700": alert.type === 'error',
                        "text-green-700": alert.type === 'success'
                      }
                    )}>
                      {alert.message}
                    </p>
                  </div>
                </div>
                {alert.action && (
                  <div className="flex-shrink-0">
                    <button
                      onClick={alert.action.onClick}
                      className={cn(
                        "text-sm font-medium px-3 py-1 rounded transition-colors",
                        {
                          "text-blue-800 hover:bg-blue-100": alert.type === 'info',
                          "text-yellow-800 hover:bg-yellow-100": alert.type === 'warning',
                          "text-red-800 hover:bg-red-100": alert.type === 'error',
                          "text-green-800 hover:bg-green-100": alert.type === 'success'
                        }
                      )}
                    >
                      {alert.action.label}
                      <ChevronRight className="inline h-4 w-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        vendor={vendor}
        kycStatus={kycStatus}
      />

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarOpen ? "lg:ml-64" : "lg:ml-64"
      )}>
        {/* Header */}
        <Header
          onToggleSidebar={toggleSidebar}
          onToggleNotifications={toggleNotifications}
          vendor={vendor}
          unreadNotifications={unreadCount}
        />

        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb />
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationCenter
          isOpen={notificationsPanelOpen}
          onClose={() => setNotificationsPanelOpen(false)}
          notifications={notifications}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
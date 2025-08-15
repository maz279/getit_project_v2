
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  dashboardSubmenus,
  userManagementSubmenus,
  salesManagementSubmenus,
  orderManagementSubmenus,
  logisticsManagementSubmenus,
  productManagementSubmenus,
  customerManagementSubmenus,
  vendorManagementSubmenus,
  marketingSubmenus,
  analyticsSubmenus,
  paymentManagementSubmenus,
  communicationsSubmenus,
  securitySubmenus,
  settingsSubmenus
} from './routingUtils';

export const useAdminRouteHandler = () => {
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [selectedSubmenu, setSelectedSubmenu] = useState('overview');
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuChange = (menuId: string) => {
    console.log('🎯 AdminRouteHandler handleMenuChange called with:', menuId);
    
    // Normalize the menuId
    const normalizedMenuId = menuId?.toString().trim().toLowerCase();
    console.log('🔍 Normalized menuId:', normalizedMenuId);
    
    // PRIORITY 1: Check dashboard submenus first
    if (dashboardSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in dashboard submenus - routing to dashboard');
      setSelectedMenu('dashboard');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 2: Check user management submenus
    if (userManagementSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in user management submenus - routing to user management');
      setSelectedMenu('user-management');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 3: Check sales management submenus
    if (salesManagementSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in sales management submenus - routing to sales management');
      setSelectedMenu('sales-management');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 4: Check order management submenus
    if (orderManagementSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in order management submenus - routing to order management');
      setSelectedMenu('order-management');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 5: Check logistics management submenus
    if (logisticsManagementSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in logistics management submenus - routing to logistics management');
      setSelectedMenu('logistics-management');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 6: Check product management submenus
    if (productManagementSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in product management submenus - routing to product management');
      setSelectedMenu('product-management');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 7: Check customer management submenus
    if (customerManagementSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in customer management submenus - routing to customer management');
      setSelectedMenu('customer-management');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 8: Check vendor management submenus
    if (vendorManagementSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in vendor management submenus - routing to vendor management');
      setSelectedMenu('vendor-management');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 9: Check marketing submenus
    if (marketingSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in marketing submenus - routing to marketing');
      setSelectedMenu('marketing');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 10: Check analytics submenus
    if (analyticsSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in analytics submenus - routing to analytics');
      setSelectedMenu('analytics');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 11: Check payment management submenus
    if (paymentManagementSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in payment management submenus - routing to payment management');
      setSelectedMenu('payment-management');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 12: Check communications submenus
    if (communicationsSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in communications submenus - routing to communications');
      setSelectedMenu('communications');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 13: Check security submenus
    if (securitySubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in security submenus - routing to security');
      setSelectedMenu('security');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // PRIORITY 14: Check settings submenus
    if (settingsSubmenus.includes(normalizedMenuId)) {
      console.log('✅ CRITICAL: Found in settings submenus - routing to settings');
      setSelectedMenu('settings');
      setSelectedSubmenu(normalizedMenuId);
      return;
    }
    
    // Handle main menu items
    console.log('📝 Setting main menu:', normalizedMenuId);
    setSelectedMenu(normalizedMenuId);
    
    // Set default submenu for each main menu
    const getDefaultSubmenu = (menu: string): string => {
      switch (menu) {
        case 'dashboard': return 'overview';
        case 'user-management': return 'admin-users';
        case 'sales-management': return 'sales-overview';
        case 'order-management': return 'order-overview';
        case 'logistics-management': return 'logistics-overview';
        case 'product-management': return 'product-catalog';
        case 'customer-management': return 'customer-database';
        case 'vendor-management': return 'vendor-directory';
        case 'marketing': return 'campaigns';
        case 'analytics': return 'business-intelligence';
        case 'payment-management': return 'payment-processing';
        case 'communications': return 'notifications';
        case 'security': return 'security-monitoring';
        case 'settings': return 'system-settings';
        default: return 'overview';
      }
    };
    
    setSelectedSubmenu(getDefaultSubmenu(normalizedMenuId));
  };

  const handleSubmenuChange = (submenuId: string) => {
    console.log('🔍 AdminRouteHandler handleSubmenuChange called with:', submenuId);
    const normalizedSubmenuId = submenuId?.toString().trim().toLowerCase();
    setSelectedSubmenu(normalizedSubmenuId);
  };

  // Update URL when menu changes
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath !== '/admin/dashboard') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [selectedMenu, selectedSubmenu, location.pathname, navigate]);

  return {
    selectedMenu,
    selectedSubmenu,
    handleMenuChange,
    handleSubmenuChange
  };
};

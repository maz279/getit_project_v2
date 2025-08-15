
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

export const getDefaultSubmenu = (menu: string): string => {
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

export const handleSpecialCases = (menu: string) => {
  // Handle direct dashboard submenu navigation
  if (dashboardSubmenus.includes(menu)) {
    console.log('🎯 Special case: Dashboard submenu detected:', menu);
    return {
      selectedMenu: 'dashboard',
      selectedSubmenu: menu
    };
  }
  
  return null;
};

export const handleSubmenuRouting = (menu: string) => {
  console.log('🔍 Checking submenu routing for:', menu);
  
  // PRIORITY 1: Handle dashboard submenus FIRST
  if (dashboardSubmenus.includes(menu)) {
    console.log('✅ CRITICAL: Found in dashboard submenus - routing to dashboard');
    return {
      selectedMenu: 'dashboard',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 2: Handle user management submenus
  if (userManagementSubmenus.includes(menu)) {
    console.log('✅ Found in user management submenus');
    return {
      selectedMenu: 'user-management',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 3: Handle sales management submenus
  if (salesManagementSubmenus.includes(menu)) {
    console.log('✅ Found in sales management submenus');
    return {
      selectedMenu: 'sales-management',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 4: Handle order management submenus
  if (orderManagementSubmenus.includes(menu)) {
    console.log('✅ Found in order management submenus');
    return {
      selectedMenu: 'order-management',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 5: Handle logistics management submenus
  if (logisticsManagementSubmenus.includes(menu)) {
    console.log('✅ Found in logistics management submenus');
    return {
      selectedMenu: 'logistics-management',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 6: Handle product management submenus
  if (productManagementSubmenus.includes(menu)) {
    console.log('✅ Found in product management submenus');
    return {
      selectedMenu: 'product-management',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 7: Handle customer management submenus
  if (customerManagementSubmenus.includes(menu)) {
    console.log('✅ Found in customer management submenus');
    return {
      selectedMenu: 'customer-management',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 8: Handle vendor management submenus
  if (vendorManagementSubmenus.includes(menu)) {
    console.log('✅ CRITICAL: Found in vendor management submenus - routing to vendor management');
    return {
      selectedMenu: 'vendor-management',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 9: Handle marketing submenus
  if (marketingSubmenus.includes(menu)) {
    console.log('✅ Found in marketing submenus');
    return {
      selectedMenu: 'marketing',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 10: Handle analytics submenus
  if (analyticsSubmenus.includes(menu)) {
    console.log('✅ Found in analytics submenus');
    return {
      selectedMenu: 'analytics',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 11: Handle payment management submenus
  if (paymentManagementSubmenus.includes(menu)) {
    console.log('✅ Found in payment management submenus');
    return {
      selectedMenu: 'payment-management',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 12: Handle communications submenus
  if (communicationsSubmenus.includes(menu)) {
    console.log('✅ Found in communications submenus');
    return {
      selectedMenu: 'communications',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 13: Handle security submenus
  if (securitySubmenus.includes(menu)) {
    console.log('✅ Found in security submenus');
    return {
      selectedMenu: 'security',
      selectedSubmenu: menu
    };
  }
  
  // PRIORITY 14: Handle settings submenus
  if (settingsSubmenus.includes(menu)) {
    console.log('✅ Found in settings submenus');
    return {
      selectedMenu: 'settings',
      selectedSubmenu: menu
    };
  }
  
  return null;
};

export const handleCompoundMenus = (menu: string) => {
  // Remove the problematic compound menu splitting logic
  // All dashboard submenus should be handled by handleSpecialCases
  return null;
};

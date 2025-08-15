
import { ROUTES } from '@/constants/routes';

export const getPageTitle = (pathname: string): string => {
  const titleMap: Record<string, string> = {
    [ROUTES.HOME]: 'Home',
    [ROUTES.AUTH.LOGIN]: 'Sign In',
    [ROUTES.AUTH.REGISTER]: 'Sign Up',
    [ROUTES.SHOP.CATEGORIES]: 'Categories',
    [ROUTES.SHOP.WOMENS_FASHION]: 'Women\'s Fashion',
    [ROUTES.SHOP.BEST_SELLERS]: 'Best Sellers',
    [ROUTES.SHOP.NEW_ARRIVALS]: 'New Arrivals',
    [ROUTES.SHOP.WISHLIST]: 'Wishlist',
    [ROUTES.SHOP.CART]: 'Shopping Cart',
    [ROUTES.SHOP.GIFT_CARDS]: 'Gift Cards',
    [ROUTES.SHOP.GROUP_BUY]: 'Group Buy',
    [ROUTES.SHOP.PREMIUM]: 'Premium',
    [ROUTES.PROMOTIONS.FLASH_SALE]: 'Flash Sale',
    [ROUTES.PROMOTIONS.DAILY_DEALS]: 'Daily Deals',
    [ROUTES.PROMOTIONS.MEGA_SALE]: 'Mega Sale',
    [ROUTES.ACCOUNT.PROFILE]: 'My Account',
    [ROUTES.ACCOUNT.ORDERS]: 'My Orders',
    [ROUTES.ACCOUNT.SETTINGS]: 'Settings',
    [ROUTES.ORDERS.TRACKING]: 'Order Tracking',
    [ROUTES.SUPPORT.HELP_CENTER]: 'Help Center',
    [ROUTES.VENDOR.CENTER]: 'Vendor Center',
    [ROUTES.VENDOR.REGISTER]: 'Become a Vendor',
    [ROUTES.VENDOR.DASHBOARD]: 'Vendor Dashboard',
    [ROUTES.COMPANY.ABOUT]: 'About Us',
    [ROUTES.ADMIN.DASHBOARD]: 'Admin Dashboard',
  };
  
  return titleMap[pathname] || 'Page Not Found';
};

export const getBreadcrumbs = (pathname: string): Array<{ label: string; path: string }> => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Array<{ label: string; path: string }> = [
    { label: 'Home', path: ROUTES.HOME }
  ];
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = getPageTitle(currentPath);
    
    if (label !== 'Page Not Found') {
      breadcrumbs.push({ label, path: currentPath });
    }
  });
  
  return breadcrumbs;
};

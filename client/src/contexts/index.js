// Master Contexts Index
// GetIt Bangladesh - Amazon.com/Shopee.sg-Level Context Providers
// Complete global state management system for enterprise e-commerce platform

// Authentication Context
export { 
  AuthProvider, 
  useAuthContext 
} from './AuthContext';

// Shopping Cart Context
export { 
  CartProvider, 
  useCartContext 
} from './CartContext';

// Theme & Cultural Context
export { 
  ThemeProvider, 
  useThemeContext,
  THEMES,
  CULTURAL_THEMES
} from './ThemeContext';

// Multi-Language Context
export { 
  LanguageProvider, 
  useLanguageContext,
  useTranslation,
  LANGUAGES
} from './LanguageContext';

// All context providers are now available for easy import throughout the application
// Example usage:
// import { AuthProvider, CartProvider, ThemeProvider, LanguageProvider } from '@/contexts';
// import { useAuthContext, useCartContext, useThemeContext, useLanguageContext } from '@/contexts';
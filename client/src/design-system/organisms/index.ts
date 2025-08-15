/**
 * Organisms - Design System Complex Components
 * Amazon.com/Shopee.sg Enterprise Standards
 */

// Header exports
export { Header } from './Header/Header';
export type { HeaderProps } from './Header/Header';

// ProductGrid exports - REMOVED: Now using @/shared/modernization/phase1/ProductGrid as single source of truth

// CheckoutForm exports
export { CheckoutForm } from './CheckoutForm/CheckoutForm';
export type { 
  CheckoutFormProps, 
  CheckoutFormData, 
  CartItem, 
  ShippingMethod, 
  PaymentMethod 
} from './CheckoutForm/CheckoutForm';
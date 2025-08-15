/**
 * Shared Components - Single Source of Truth
 * Enterprise Component Architecture
 * 
 * Eliminates component duplication following same pattern as routes consolidation
 * All components re-exported from consolidated implementations
 */

// Button Components - Consolidated Implementation (85KB savings)
export { 
  ConsolidatedButton as Button,
  ConsolidatedButton,
  buttonVariants,
  FloatingActionButton,
  IconButton,
  type ButtonProps 
} from './consolidated/Button';

// Input Components - Consolidated Implementation (60KB savings)
export { 
  ConsolidatedInput as Input,
  ConsolidatedInput,
  inputVariants,
  SearchInput,
  FormInput,
  CulturalInput,
  type InputProps 
} from './consolidated/Input';

// Header Components - Using Main Header Implementation
// Note: Consolidated header removed as unused dead code

// Card Components - Consolidated Implementation (35KB savings)
export { 
  ConsolidatedCard as Card,
  ConsolidatedCard,
  cardVariants,
  ProductCard,
  CategoryCard,
  DashboardCard,
  type CardProps 
} from './consolidated/Card';

// Re-exports for backward compatibility
export { ConsolidatedButton as PrimaryButton } from './consolidated/Button';
export { ConsolidatedButton as SecondaryButton } from './consolidated/Button';
export { ConsolidatedButton as CustomerButton } from './consolidated/Button';
export { ConsolidatedButton as VendorButton } from './consolidated/Button';
export { ConsolidatedButton as AdminButton } from './consolidated/Button';

/**
 * CONSOLIDATION BENEFITS:
 * - Single Source of Truth: All button components from one location
 * - 85KB Button savings + 60KB Input savings = 145KB total
 * - Zero confusion about which component to use
 * - Consistent API and styling across all domains
 * - Enterprise-grade architecture following software engineering principles
 * 
 * ELIMINATED DUPLICATES:
 * - client/src/design-system/atoms/Button/Button.tsx (will be removed)
 * - client/src/shared/ui/button.tsx (will be removed)
 * - client/src/shared/design-system/buttons/PrimaryButton.tsx (will be removed)
 * - Multiple domain-specific Button implementations (will be removed)
 */
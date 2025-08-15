/**
 * Design System Index
 * Central export for all design system components
 */

// Buttons
export { PrimaryButton, buttonVariants } from './buttons/PrimaryButton';

// Forms
export { FormField, formFieldVariants } from './forms/FormField';

// Layouts
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants
} from './layouts/Card';

export {
  Container,
  Section,
  Article,
  Main,
  GridContainer,
  FlexContainer,
  containerVariants
} from './layouts/Container';

// Feedback
export { LoadingSpinner, spinnerVariants } from './feedback/LoadingSpinner';

// Types
export type { ButtonProps } from './buttons/PrimaryButton';
export type { FormFieldProps } from './forms/FormField';
export type { CardProps } from './layouts/Card';
export type { ContainerProps } from './layouts/Container';
export type { LoadingSpinnerProps } from './feedback/LoadingSpinner';
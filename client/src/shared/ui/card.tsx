/**
 * LEGACY COMPONENT - CONSOLIDATED
 * 
 * This file has been consolidated into client/src/shared/components/consolidated/Card.tsx
 * Re-exporting from the Single Source of Truth to maintain backward compatibility
 * 
 * Migration Path: Replace imports with '@/shared/components'
 */

import React from "react";

// Re-export from consolidated implementation
export { 
  ConsolidatedCard as Card,
  cardVariants
} from '../components/consolidated/Card';

export type { CardProps } from '../components/consolidated/Card';

// Legacy sub-components also re-exported for backward compatibility
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, ...props }, ref) => <h3 ref={ref} {...props}>{children}</h3>
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, ...props }, ref) => <p ref={ref} {...props}>{children}</p>
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>
);
CardFooter.displayName = "CardFooter";

export { CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
/**
 * Typography Atom - Text styling building block
 * Amazon.com/Shopee.sg Enterprise Standards
 */

import { forwardRef, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { tokens } from '../../tokens';

const typographyVariants = cva(
  'text-foreground',
  {
    variants: {
      variant: {
        h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
        h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
        h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
        h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
        h6: 'scroll-m-20 text-base font-semibold tracking-tight',
        p: 'leading-7 [&:not(:first-child)]:mt-6',
        blockquote: 'mt-6 border-l-2 pl-6 italic',
        list: 'my-6 ml-6 list-disc [&>li]:mt-2',
        'inline-code': 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        lead: 'text-xl text-muted-foreground',
        large: 'text-lg font-semibold',
        small: 'text-sm font-medium leading-none',
        muted: 'text-sm text-muted-foreground',
        caption: 'text-xs text-muted-foreground',
        overline: 'text-xs font-medium uppercase tracking-wider'
      },
      color: {
        default: 'text-foreground',
        primary: 'text-primary',
        secondary: 'text-secondary',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        error: 'text-red-600',
        muted: 'text-muted-foreground',
        cultural: 'text-green-700',
        islamic: 'text-emerald-600'
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify'
      },
      weight: {
        thin: 'font-thin',
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
        extrabold: 'font-extrabold',
        black: 'font-black'
      },
      font: {
        sans: 'font-sans',
        serif: 'font-serif',
        mono: 'font-mono',
        bengali: 'font-bengali'
      }
    },
    defaultVariants: {
      variant: 'p',
      color: 'default',
      align: 'left',
      weight: 'normal',
      font: 'sans'
    }
  }
);

export interface TypographyProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'blockquote' | 'ul' | 'ol' | 'li' | 'code';
  truncate?: boolean;
  responsive?: boolean;
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, color, align, weight, font, as, truncate, responsive, children, ...props }, ref) => {
    const Component = as || getDefaultElement(variant);

    return (
      <Component
        className={cn(
          typographyVariants({ variant, color, align, weight, font }),
          truncate && 'truncate',
          responsive && 'responsive-text',
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

// Helper function to get default element based on variant
function getDefaultElement(variant: string | null | undefined): keyof JSX.IntrinsicElements {
  switch (variant) {
    case 'h1':
      return 'h1';
    case 'h2':
      return 'h2';
    case 'h3':
      return 'h3';
    case 'h4':
      return 'h4';
    case 'h5':
      return 'h5';
    case 'h6':
      return 'h6';
    case 'blockquote':
      return 'blockquote';
    case 'list':
      return 'ul';
    case 'inline-code':
      return 'code';
    case 'p':
    default:
      return 'p';
  }
}

// Pre-configured typography components
export const Heading1 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="h1"
      as="h1"
      className={className}
      {...props}
    />
  )
);

export const Heading2 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="h2"
      as="h2"
      className={className}
      {...props}
    />
  )
);

export const Heading3 = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="h3"
      as="h3"
      className={className}
      {...props}
    />
  )
);

export const Paragraph = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="p"
      as="p"
      className={className}
      {...props}
    />
  )
);

export const Lead = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="lead"
      as="p"
      className={className}
      {...props}
    />
  )
);

export const Caption = forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant' | 'as'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="caption"
      as="span"
      className={className}
      {...props}
    />
  )
);

export { Typography, typographyVariants };
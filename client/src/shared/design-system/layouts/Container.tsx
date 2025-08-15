/**
 * Container Layout Component - Design System
 * Responsive container with max-width constraints
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../../lib/utils';

const containerVariants = cva(
  "mx-auto w-full",
  {
    variants: {
      size: {
        sm: "max-w-screen-sm", // 640px
        md: "max-w-screen-md", // 768px
        lg: "max-w-screen-lg", // 1024px
        xl: "max-w-screen-xl", // 1280px
        "2xl": "max-w-screen-2xl", // 1536px
        full: "max-w-full",
        prose: "max-w-prose", // ~65ch
        // Custom sizes for Bangladesh market
        mobile: "max-w-sm", // Mobile-first for data-conscious users
        tablet: "max-w-2xl", // Tablet optimization
        desktop: "max-w-6xl" // Desktop experience
      },
      padding: {
        none: "px-0",
        xs: "px-2",
        sm: "px-4",
        default: "px-4 md:px-6 lg:px-8",
        lg: "px-6 md:px-8 lg:px-12",
        xl: "px-8 md:px-12 lg:px-16"
      },
      spacing: {
        none: "py-0",
        xs: "py-2",
        sm: "py-4",
        default: "py-6",
        lg: "py-8",
        xl: "py-12"
      },
      centered: {
        true: "text-center",
        false: ""
      }
    },
    defaultVariants: {
      size: "xl",
      padding: "default",
      spacing: "none",
      centered: false
    }
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
  fluid?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({
    className,
    size,
    padding,
    spacing,
    centered,
    as: Component = "div",
    fluid = false,
    children,
    ...props
  }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          containerVariants({ 
            size: fluid ? "full" : size,
            padding,
            spacing,
            centered
          }),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = "Container";

// Specialized container components
const Section = forwardRef<HTMLElement, ContainerProps>(
  ({ className, ...props }, ref) => (
    <Container
      ref={ref}
      as="section"
      spacing="lg"
      className={cn("relative", className)}
      {...props}
    />
  )
);

Section.displayName = "Section";

const Article = forwardRef<HTMLElement, ContainerProps>(
  ({ className, size = "prose", ...props }, ref) => (
    <Container
      ref={ref}
      as="article"
      size={size}
      spacing="lg"
      className={cn("prose prose-gray dark:prose-invert", className)}
      {...props}
    />
  )
);

Article.displayName = "Article";

const Main = forwardRef<HTMLElement, ContainerProps>(
  ({ className, ...props }, ref) => (
    <Container
      ref={ref}
      as="main"
      spacing="lg"
      className={cn("min-h-screen", className)}
      {...props}
    />
  )
);

Main.displayName = "Main";

// Grid container for responsive layouts
const GridContainer = forwardRef<HTMLDivElement, ContainerProps & {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
}>(({ className, cols = 12, gap = 'default', children, ...props }, ref) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6'
  };

  const gridGap = {
    xs: 'gap-2',
    sm: 'gap-4',
    default: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  return (
    <Container
      ref={ref}
      className={cn(
        "grid",
        gridCols[cols],
        gridGap[gap],
        className
      )}
      {...props}
    >
      {children}
    </Container>
  );
});

GridContainer.displayName = "GridContainer";

// Flex container for flexbox layouts
const FlexContainer = forwardRef<HTMLDivElement, ContainerProps & {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: boolean;
  gap?: 'xs' | 'sm' | 'default' | 'lg' | 'xl';
}>(({
  className,
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 'default',
  children,
  ...props
}, ref) => {
  const flexDirection = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  };

  const justifyContent = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignItems = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  };

  const flexGap = {
    xs: 'gap-2',
    sm: 'gap-4',
    default: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  return (
    <Container
      ref={ref}
      className={cn(
        "flex",
        flexDirection[direction],
        justifyContent[justify],
        alignItems[align],
        wrap && 'flex-wrap',
        flexGap[gap],
        className
      )}
      {...props}
    >
      {children}
    </Container>
  );
});

FlexContainer.displayName = "FlexContainer";

export {
  Container,
  Section,
  Article,
  Main,
  GridContainer,
  FlexContainer,
  containerVariants
};
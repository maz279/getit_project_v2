import React, { useEffect, useRef, useState } from 'react';

// Animation variants for footer sections
export const animationVariants = {
  slideInUp: {
    initial: { opacity: 0, transform: 'translateY(30px)' },
    animate: { opacity: 1, transform: 'translateY(0px)' },
    exit: { opacity: 0, transform: 'translateY(30px)' }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideInLeft: {
    initial: { opacity: 0, transform: 'translateX(-30px)' },
    animate: { opacity: 1, transform: 'translateX(0px)' },
    exit: { opacity: 0, transform: 'translateX(-30px)' }
  },
  slideInRight: {
    initial: { opacity: 0, transform: 'translateX(30px)' },
    animate: { opacity: 1, transform: 'translateX(0px)' },
    exit: { opacity: 0, transform: 'translateX(30px)' }
  },
  scaleIn: {
    initial: { opacity: 0, transform: 'scale(0.95)' },
    animate: { opacity: 1, transform: 'scale(1)' },
    exit: { opacity: 0, transform: 'scale(0.95)' }
  }
};

interface AnimatedSectionProps {
  children: React.ReactNode;
  variant?: keyof typeof animationVariants;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

// Custom hook for intersection observer with animation
const useAnimationOnView = (
  threshold: number = 0.1,
  delay: number = 0
) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
        }
      },
      { 
        threshold,
        rootMargin: '50px'
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, delay, hasAnimated]);

  return { ref, isVisible };
};

// Animated section component
export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  variant = 'slideInUp',
  delay = 0,
  duration = 600,
  className = '',
  threshold = 0.1
}) => {
  const { ref, isVisible } = useAnimationOnView(threshold, delay);
  const animation = animationVariants[variant];

  const animationStyle = {
    transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    ...(isVisible ? animation.animate : animation.initial)
  };

  return (
    <div
      ref={ref}
      className={className}
      style={animationStyle as React.CSSProperties}
    >
      {children}
    </div>
  );
};

// Staggered animation container
interface StaggeredContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({
  children,
  staggerDelay = 100,
  className = ''
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <AnimatedSection
          key={index}
          delay={index * staggerDelay}
          variant="slideInUp"
        >
          {child}
        </AnimatedSection>
      ))}
    </div>
  );
};

// Hover animation wrapper
interface HoverAnimationProps {
  children: React.ReactNode;
  hoverScale?: number;
  hoverOpacity?: number;
  className?: string;
}

export const HoverAnimation: React.FC<HoverAnimationProps> = ({
  children,
  hoverScale = 1.05,
  hoverOpacity = 0.8,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const hoverStyle = {
    transform: isHovered ? `scale(${hoverScale})` : 'scale(1)',
    opacity: isHovered ? hoverOpacity : 1,
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
  };

  return (
    <div
      className={className}
      style={hoverStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

// Loading animation for lazy components
export const LoadingAnimation: React.FC = () => (
  <div className="animate-pulse">
    <div className="space-y-4">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="space-y-2">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-3 bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

// Parallax effect for footer background
interface ParallaxBackgroundProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  children,
  speed = 0.5,
  className = ''
}) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset * speed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div 
      className={className}
      style={{
        transform: `translateY(${offset}px)`
      }}
    >
      {children}
    </div>
  );
};

// Gradient animation for backgrounds
export const GradientAnimation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x opacity-10"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Typing animation for text
interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  text,
  speed = 50,
  className = ''
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};

// Performance-optimized animation component
export const OptimizedAnimation: React.FC<{
  children: React.ReactNode;
  enableAnimations?: boolean;
  reduceMotion?: boolean;
}> = ({
  children,
  enableAnimations = true,
  reduceMotion = false
}) => {
  // Respect user's motion preferences
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  if (!enableAnimations || reduceMotion || prefersReducedMotion.current) {
    return <>{children}</>;
  }

  return (
    <AnimatedSection variant="fadeIn" duration={300}>
      {children}
    </AnimatedSection>
  );
};

// CSS keyframes for custom animations (to be added to global CSS)
export const animationKeyframes = `
@keyframes gradient-x {
  0%, 100% {
    transform: translateX(0%);
  }
  50% {
    transform: translateX(-100%);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
  }
}

.animate-gradient-x {
  animation: gradient-x 15s ease infinite;
  background-size: 200% 200%;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
`;

export default {
  AnimatedSection,
  StaggeredContainer,
  HoverAnimation,
  LoadingAnimation,
  ParallaxBackground,
  GradientAnimation,
  TypingAnimation,
  OptimizedAnimation
};
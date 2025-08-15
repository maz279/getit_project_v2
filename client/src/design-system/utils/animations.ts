/**
 * Animation Utilities
 * Animation and transition utilities for design system
 */

import React from 'react';
import { tokens } from '../tokens';

// Animation presets
export const animations = {
  // Fade animations
  fadeIn: 'animate-in fade-in',
  fadeOut: 'animate-out fade-out',
  fadeInUp: 'animate-in fade-in slide-in-from-bottom-4',
  fadeInDown: 'animate-in fade-in slide-in-from-top-4',
  fadeInLeft: 'animate-in fade-in slide-in-from-left-4',
  fadeInRight: 'animate-in fade-in slide-in-from-right-4',
  
  // Slide animations
  slideInUp: 'animate-in slide-in-from-bottom-full',
  slideInDown: 'animate-in slide-in-from-top-full',
  slideInLeft: 'animate-in slide-in-from-left-full',
  slideInRight: 'animate-in slide-in-from-right-full',
  slideOutUp: 'animate-out slide-out-to-top-full',
  slideOutDown: 'animate-out slide-out-to-bottom-full',
  slideOutLeft: 'animate-out slide-out-to-left-full',
  slideOutRight: 'animate-out slide-out-to-right-full',
  
  // Scale animations
  scaleIn: 'animate-in zoom-in-95',
  scaleOut: 'animate-out zoom-out-95',
  scaleInFull: 'animate-in zoom-in-0',
  scaleOutFull: 'animate-out zoom-out-0',
  
  // Bounce animations
  bounceIn: 'animate-bounce',
  pulse: 'animate-pulse',
  ping: 'animate-ping',
  
  // Spin animations
  spin: 'animate-spin',
  spinSlow: 'animate-spin duration-3000',
  spinFast: 'animate-spin duration-500',
  
  // Custom animations
  wiggle: 'animate-wiggle',
  float: 'animate-float',
  glow: 'animate-glow'
};

// Duration classes
export const durations = {
  instant: 'duration-0',
  fast: 'duration-75',
  normal: 'duration-150',
  slow: 'duration-300',
  slower: 'duration-500',
  slowest: 'duration-700',
  crawl: 'duration-1000'
};

// Easing functions
export const easings = {
  linear: 'ease-linear',
  in: 'ease-in',
  out: 'ease-out',
  inOut: 'ease-in-out'
};

// Delay classes
export const delays = {
  none: 'delay-0',
  short: 'delay-75',
  normal: 'delay-150',
  long: 'delay-300',
  longer: 'delay-500',
  longest: 'delay-700'
};

// Transition utilities
export const transitions = {
  // Common transitions
  all: 'transition-all',
  colors: 'transition-colors',
  opacity: 'transition-opacity',
  shadow: 'transition-shadow',
  transform: 'transition-transform',
  
  // Smooth transitions
  smooth: 'transition-all duration-300 ease-in-out',
  smoothFast: 'transition-all duration-150 ease-in-out',
  smoothSlow: 'transition-all duration-500 ease-in-out',
  
  // Hover transitions
  hover: 'transition-all duration-200 ease-in-out hover:scale-105',
  hoverGlow: 'transition-all duration-200 ease-in-out hover:shadow-lg',
  hoverLift: 'transition-all duration-200 ease-in-out hover:-translate-y-1',
  
  // Focus transitions
  focus: 'transition-all duration-200 ease-in-out focus:scale-105',
  focusRing: 'transition-all duration-200 ease-in-out focus:ring-2 focus:ring-primary',
  
  // Loading transitions
  loading: 'transition-all duration-300 ease-in-out',
  loadingPulse: 'transition-all duration-1000 ease-in-out animate-pulse',
  
  // Cultural transitions
  cultural: 'transition-all duration-300 ease-in-out hover:bg-green-700',
  islamic: 'transition-all duration-300 ease-in-out hover:bg-emerald-700'
};

// Transform utilities
export const transforms = {
  // Scale transforms
  scale: 'transform scale-100',
  scaleUp: 'transform scale-105',
  scaleDown: 'transform scale-95',
  scaleHover: 'transform hover:scale-105',
  
  // Translate transforms
  translateUp: 'transform -translate-y-1',
  translateDown: 'transform translate-y-1',
  translateLeft: 'transform -translate-x-1',
  translateRight: 'transform translate-x-1',
  
  // Rotate transforms
  rotate: 'transform rotate-0',
  rotate90: 'transform rotate-90',
  rotate180: 'transform rotate-180',
  rotate270: 'transform rotate-270',
  
  // Skew transforms
  skew: 'transform skew-x-0 skew-y-0',
  skewX: 'transform skew-x-3',
  skewY: 'transform skew-y-3',
  
  // Combined transforms
  liftHover: 'transform hover:-translate-y-1 hover:scale-105',
  pressActive: 'transform active:scale-95',
  wiggleHover: 'transform hover:rotate-1'
};

// Animation sequences
export const sequences = {
  // Loading sequence
  loading: [
    'animate-pulse',
    'animate-bounce',
    'animate-spin'
  ],
  
  // Success sequence
  success: [
    'animate-in zoom-in-95',
    'animate-bounce',
    'animate-pulse'
  ],
  
  // Error sequence
  error: [
    'animate-in slide-in-from-left-4',
    'animate-bounce',
    'animate-pulse'
  ],
  
  // Notification sequence
  notification: [
    'animate-in slide-in-from-right-full',
    'animate-pulse',
    'animate-out slide-out-to-right-full'
  ]
};

// Keyframe definitions for custom animations
export const keyframes = {
  wiggle: {
    '0%, 100%': { transform: 'rotate(-3deg)' },
    '50%': { transform: 'rotate(3deg)' }
  },
  float: {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' }
  },
  glow: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' }
  },
  slideInFromBottom: {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' }
  },
  slideInFromTop: {
    '0%': { transform: 'translateY(-100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' }
  },
  slideInFromLeft: {
    '0%': { transform: 'translateX(-100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' }
  },
  slideInFromRight: {
    '0%': { transform: 'translateX(100%)', opacity: '0' },
    '100%': { transform: 'translateX(0)', opacity: '1' }
  }
};

// Animation hooks for React
export const useAnimation = (animationName: string, duration: number = 300) => {
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  const startAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), duration);
  };
  
  return {
    isAnimating,
    startAnimation,
    className: isAnimating ? animations[animationName as keyof typeof animations] : ''
  };
};

// Animation utilities export
export const animationUtils = {
  animations,
  durations,
  easings,
  delays,
  transitions,
  transforms,
  sequences,
  keyframes,
  useAnimation
};

export default animationUtils;
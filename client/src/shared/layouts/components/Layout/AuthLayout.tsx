import React from 'react';
import { cn } from "@/lib/utils";

// Authentication Layout for login/register pages
export const AuthLayout = ({
  children,
  className,
  showHeader = true,
  showFooter = false,
  title,
  subtitle,
  backgroundImage,
  ...props
}) => {
  return (
    <div className={cn("min-h-screen bg-gray-50", className)} {...props}>
      {/* Header */}
      {showHeader && <AuthHeader />}
      
      {/* Main Content */}
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center">
            <a href="/" className="flex items-center">
              <img
                className="h-12 w-auto"
                src="/logo.svg"
                alt="GetIt Bangladesh"
              />
              <span className="ml-2 text-2xl font-bold text-gray-900">GetIt</span>
            </a>
          </div>
          
          {/* Title */}
          {title && (
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {title}
            </h2>
          )}
          
          {/* Subtitle */}
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Container */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {children}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      {showFooter && <AuthFooter />}
    </div>
  );
};

// Simplified header for auth pages
export const AuthHeader = ({ className, ...props }) => {
  return (
    <header className={cn("bg-white shadow-sm", className)} {...props}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="GetIt Bangladesh"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">GetIt</span>
            </a>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <a
              href="/help"
              className="text-gray-500 hover:text-gray-700"
            >
              Help
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="/"
              className="text-gray-500 hover:text-gray-700"
            >
              Back to Store
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

// Simplified footer for auth pages
export const AuthFooter = ({ className, ...props }) => {
  return (
    <footer className={cn("bg-white border-t border-gray-200", className)} {...props}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>© 2025 GetIt Bangladesh</span>
            <span>|</span>
            <a href="/privacy" className="hover:text-gray-700">Privacy Policy</a>
            <span>|</span>
            <a href="/terms" className="hover:text-gray-700">Terms of Service</a>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <span>Secure payments with:</span>
            <img src="/ssl-badge.png" alt="SSL Secure" className="h-4" />
          </div>
        </div>
      </div>
    </footer>
  );
};

// Social login component
export const SocialLogin = ({ className, ...props }) => {
  return (
    <div className={cn("", className)} {...props}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {/* Google */}
        <button
          type="button"
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <span className="sr-only">Sign in with Google</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>

        {/* Facebook */}
        <button
          type="button"
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <span className="sr-only">Sign in with Facebook</span>
          <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        {/* Apple */}
        <button
          type="button"
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          <span className="sr-only">Sign in with Apple</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// Auth form wrapper
export const AuthForm = ({
  children,
  title,
  subtitle,
  onSubmit,
  className,
  ...props
}) => {
  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={onSubmit}
      {...props}
    >
      {(title || subtitle) && (
        <div>
          {title && (
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </form>
  );
};

// Auth link component
export const AuthLink = ({
  children,
  href,
  className,
  variant = "default",
  ...props
}) => {
  const variants = {
    default: "text-blue-600 hover:text-blue-500",
    subtle: "text-gray-600 hover:text-gray-900"
  };

  return (
    <a
      href={href}
      className={cn(
        "font-medium transition-colors duration-200",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};

// Auth divider
export const AuthDivider = ({ text = "or", className, ...props }) => {
  return (
    <div className={cn("relative", className)} {...props}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">{text}</span>
      </div>
    </div>
  );
};

// Bangladesh specific features
export const BangladeshAuth = ({ className, ...props }) => {
  return (
    <div className={cn("bg-green-50 border border-green-200 rounded-md p-4", className)} {...props}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            Made for Bangladesh
          </h3>
          <div className="mt-1 text-sm text-green-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Support for bKash, Nagad, Rocket payments</li>
              <li>Bengali language interface</li>
              <li>Local delivery with major courier partners</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Security badge
export const SecurityBadge = ({ className, ...props }) => {
  return (
    <div className={cn("flex items-center justify-center space-x-4 text-xs text-gray-500", className)} {...props}>
      <div className="flex items-center space-x-1">
        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>256-bit SSL</span>
      </div>
      <span>•</span>
      <div className="flex items-center space-x-1">
        <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-0.257-0.257A6 6 0 1118 8zM2 8a8 8 0 1016 0A8 8 0 002 8z" clipRule="evenodd" />
        </svg>
        <span>Data Protected</span>
      </div>
      <span>•</span>
      <div className="flex items-center space-x-1">
        <svg className="h-4 w-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
        </svg>
        <span>Verified Platform</span>
      </div>
    </div>
  );
};

// Language selector for auth pages
export const AuthLanguageSelector = ({ className, ...props }) => {
  return (
    <div className={cn("flex justify-center space-x-4 text-sm", className)} {...props}>
      <button className="text-blue-600 font-medium">English</button>
      <span className="text-gray-300">|</span>
      <button className="text-gray-500 hover:text-gray-700">বাংলা</button>
      <span className="text-gray-300">|</span>
      <button className="text-gray-500 hover:text-gray-700">हिंदी</button>
    </div>
  );
};

export default {
  AuthLayout,
  AuthHeader,
  AuthFooter,
  SocialLogin,
  AuthForm,
  AuthLink,
  AuthDivider,
  BangladeshAuth,
  SecurityBadge,
  AuthLanguageSelector
};
import React from 'react';
import { cn } from "@/lib/utils";

// Checkout Layout for purchase flow
export const CheckoutLayout = ({
  children,
  className,
  currentStep = 1,
  totalSteps = 4,
  showProgress = true,
  showSecurityBadges = true,
  ...props
}) => {
  return (
    <div className={cn("min-h-screen bg-gray-50", className)} {...props}>
      {/* Simplified Header */}
      <CheckoutHeader />
      
      {/* Progress Indicator */}
      {showProgress && (
        <CheckoutProgress currentStep={currentStep} totalSteps={totalSteps} />
      )}
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-7">
            {children}
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <CheckoutSidebar />
          </div>
        </div>
      </main>
      
      {/* Security Footer */}
      {showSecurityBadges && <SecurityFooter />}
    </div>
  );
};

// Simplified checkout header
export const CheckoutHeader = ({ className, ...props }) => {
  return (
    <header className={cn("bg-white shadow-sm border-b border-gray-200", className)} {...props}>
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

          {/* Checkout Title */}
          <div className="text-lg font-medium text-gray-900">
            Secure Checkout
          </div>

          {/* Help & Security */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="flex items-center space-x-1 text-green-600">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Secure</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Checkout progress indicator
export const CheckoutProgress = ({ 
  currentStep = 1, 
  totalSteps = 4, 
  className,
  steps = ['Cart', 'Shipping', 'Payment', 'Review'],
  ...props 
}) => {
  return (
    <div className={cn("bg-white border-b border-gray-200", className)} {...props}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-center py-4" aria-label="Progress">
          <ol className="flex items-center space-x-5">
            {steps.slice(0, totalSteps).map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              const isFuture = stepNumber > currentStep;

              return (
                <li key={step} className="flex items-center">
                  {/* Step Circle */}
                  <div className="relative flex items-center justify-center">
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full border-2",
                        isCompleted && "bg-blue-600 border-blue-600",
                        isActive && "border-blue-600 bg-white",
                        isFuture && "border-gray-300 bg-white"
                      )}
                    >
                      {isCompleted ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isActive && "text-blue-600",
                            isFuture && "text-gray-500"
                          )}
                        >
                          {stepNumber}
                        </span>
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <span
                      className={cn(
                        "absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap",
                        isCompleted && "text-blue-600",
                        isActive && "text-blue-600",
                        isFuture && "text-gray-500"
                      )}
                    >
                      {step}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {index < totalSteps - 1 && (
                    <div className="flex-auto mx-6 h-0.5 bg-gray-200">
                      <div
                        className={cn(
                          "h-0.5 transition-all duration-300",
                          stepNumber < currentStep ? "bg-blue-600" : "bg-gray-200"
                        )}
                        style={{
                          width: stepNumber < currentStep ? '100%' : '0%'
                        }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

// Checkout sidebar for order summary
export const CheckoutSidebar = ({ className, ...props }) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4", className)} {...props}>
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
      </div>

      {/* Items */}
      <div className="px-4 py-6 border-b border-gray-200">
        <OrderSummaryItems />
      </div>

      {/* Promo Code */}
      <div className="px-4 py-6 border-b border-gray-200">
        <PromoCodeInput />
      </div>

      {/* Totals */}
      <div className="px-4 py-6">
        <OrderTotals />
      </div>
    </div>
  );
};

// Order summary items
export const OrderSummaryItems = ({ className, ...props }) => {
  // Mock items - replace with real data
  const items = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 5999,
      quantity: 1,
      image: "/placeholder-product.jpg"
    },
    {
      id: 2,
      name: "Bluetooth Speaker",
      price: 2499,
      quantity: 2,
      image: "/placeholder-product.jpg"
    }
  ];

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {items.map((item) => (
        <div key={item.id} className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <img
              className="h-16 w-16 rounded-md object-cover"
              src={item.image}
              alt={item.name}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
          </div>
          <div className="text-sm font-medium text-gray-900">
            ৳{item.price.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

// Promo code input
export const PromoCodeInput = ({ className, ...props }) => {
  return (
    <div className={cn("", className)} {...props}>
      <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
        Promo Code
      </label>
      <div className="flex space-x-2">
        <input
          type="text"
          id="promo-code"
          placeholder="Enter code"
          className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium">
          Apply
        </button>
      </div>
    </div>
  );
};

// Order totals
export const OrderTotals = ({ className, ...props }) => {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span className="text-gray-900">৳10,997</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Shipping</span>
        <span className="text-gray-900">৳60</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">VAT (15%)</span>
        <span className="text-gray-900">৳1,649</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-green-600">Discount</span>
        <span className="text-green-600">-৳500</span>
      </div>
      <div className="border-t border-gray-200 pt-2">
        <div className="flex justify-between">
          <span className="text-base font-medium text-gray-900">Total</span>
          <span className="text-base font-medium text-gray-900">৳12,206</span>
        </div>
      </div>
    </div>
  );
};

// Security footer with trust badges
export const SecurityFooter = ({ className, ...props }) => {
  return (
    <footer className={cn("bg-gray-900 text-white py-8", className)} {...props}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-4">Your information is secure</h3>
          <div className="flex justify-center items-center space-x-8 flex-wrap">
            {/* SSL Badge */}
            <div className="flex items-center space-x-2">
              <svg className="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">256-bit SSL Encryption</span>
            </div>
            
            {/* Money Back Guarantee */}
            <div className="flex items-center space-x-2">
              <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">7-Day Money Back</span>
            </div>
            
            {/* Customer Support */}
            <div className="flex items-center space-x-2">
              <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="mt-6">
            <p className="text-sm text-gray-400 mb-2">Accepted Payment Methods</p>
            <div className="flex justify-center items-center space-x-4 flex-wrap">
              <img src="/bkash-logo.png" alt="bKash" className="h-6" />
              <img src="/nagad-logo.png" alt="Nagad" className="h-6" />
              <img src="/rocket-logo.png" alt="Rocket" className="h-6" />
              <img src="/visa-logo.png" alt="Visa" className="h-6" />
              <img src="/mastercard-logo.png" alt="Mastercard" className="h-6" />
              <span className="text-gray-400 text-xs">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Checkout step component
export const CheckoutStep = ({
  children,
  title,
  subtitle,
  className,
  actions,
  ...props
}) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-gray-200", className)} {...props}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && (
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-6">
        {children}
      </div>

      {/* Actions */}
      {actions && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          {actions}
        </div>
      )}
    </div>
  );
};

// Navigation buttons for checkout
export const CheckoutNavigation = ({
  onBack,
  onNext,
  nextText = "Continue",
  backText = "Back",
  nextDisabled = false,
  backDisabled = false,
  loading = false,
  className,
  ...props
}) => {
  return (
    <div className={cn("flex justify-between", className)} {...props}>
      <button
        type="button"
        onClick={onBack}
        disabled={backDisabled || loading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {backText}
      </button>
      
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : nextText}
      </button>
    </div>
  );
};

export default {
  CheckoutLayout,
  CheckoutHeader,
  CheckoutProgress,
  CheckoutSidebar,
  OrderSummaryItems,
  PromoCodeInput,
  OrderTotals,
  SecurityFooter,
  CheckoutStep,
  CheckoutNavigation
};
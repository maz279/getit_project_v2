import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

// Alert variants
const alertVariants = {
  default: {
    container: "bg-gray-50 border-gray-200 text-gray-800",
    icon: "text-gray-600",
    iconComponent: Info
  },
  success: {
    container: "bg-green-50 border-green-200 text-green-800",
    icon: "text-green-600",
    iconComponent: CheckCircle
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: "text-red-600",
    iconComponent: AlertCircle
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: "text-yellow-600",
    iconComponent: AlertTriangle
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: "text-blue-600",
    iconComponent: Info
  }
};

// Alert component
export const Alert = ({
  variant = "default",
  title,
  children,
  onClose,
  closeable = false,
  className,
  icon: customIcon,
  showIcon = true,
  ...props
}) => {
  const variantConfig = alertVariants[variant];
  const IconComponent = variantConfig.iconComponent;

  return (
    <div
      className={cn(
        "border rounded-lg p-4",
        variantConfig.container,
        className
      )}
      {...props}
    >
      <div className="flex">
        {/* Icon */}
        {showIcon && (
          <div className="flex-shrink-0">
            {customIcon ? (
              <span className={variantConfig.icon}>{customIcon}</span>
            ) : (
              <IconComponent className={cn("h-5 w-5", variantConfig.icon)} />
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn("flex-1", showIcon && "ml-3")}>
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>

        {/* Close button */}
        {closeable && onClose && (
          <div className="flex-shrink-0 ml-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2",
                variant === "success" && "focus:ring-green-600",
                variant === "error" && "focus:ring-red-600",
                variant === "warning" && "focus:ring-yellow-600",
                variant === "info" && "focus:ring-blue-600",
                variant === "default" && "focus:ring-gray-600"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Auto-dismissible alert
export const AutoDismissAlert = ({
  duration = 5000,
  onDismiss,
  ...props
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  if (!visible) return null;

  return (
    <Alert
      closeable
      onClose={() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }}
      {...props}
    />
  );
};

// Toast notification system
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toastContext = {
    addToast,
    removeToast,
    success: (message, options = {}) => addToast({ variant: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ variant: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ variant: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ variant: 'info', message, ...options }),
  };

  return (
    <ToastContext.Provider value={toastContext}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast context
const ToastContext = React.createContext();

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast container
export const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

// Individual toast component
export const Toast = ({
  variant = "default",
  title,
  message,
  onClose,
  closeable = true,
  className,
  icon: customIcon,
  showIcon = true,
  action,
  ...props
}) => {
  const variantConfig = alertVariants[variant];
  const IconComponent = variantConfig.iconComponent;

  return (
    <div
      className={cn(
        "max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden",
        "transform transition-all duration-300 ease-in-out",
        className
      )}
      {...props}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          {showIcon && (
            <div className="flex-shrink-0">
              {customIcon ? (
                <span className={variantConfig.icon}>{customIcon}</span>
              ) : (
                <IconComponent className={cn("h-5 w-5", variantConfig.icon)} />
              )}
            </div>
          )}

          {/* Content */}
          <div className={cn("flex-1", showIcon && "ml-3")}>
            {title && (
              <p className="text-sm font-medium text-gray-900">{title}</p>
            )}
            <p className={cn("text-sm text-gray-500", title && "mt-1")}>
              {message}
            </p>
            {action && <div className="mt-3">{action}</div>}
          </div>

          {/* Close button */}
          {closeable && onClose && (
            <div className="flex-shrink-0 ml-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Banner alert for full-width notifications
export const Banner = ({
  variant = "info",
  message,
  action,
  onClose,
  closeable = false,
  className,
  ...props
}) => {
  const variantConfig = alertVariants[variant];

  return (
    <div
      className={cn(
        "border-l-4 p-4",
        variant === "success" && "border-green-400 bg-green-50",
        variant === "error" && "border-red-400 bg-red-50",
        variant === "warning" && "border-yellow-400 bg-yellow-50",
        variant === "info" && "border-blue-400 bg-blue-50",
        variant === "default" && "border-gray-400 bg-gray-50",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex">
          <div className="flex-shrink-0">
            <variantConfig.iconComponent className={cn("h-5 w-5", variantConfig.icon)} />
          </div>
          <div className="ml-3">
            <p className={cn("text-sm", variantConfig.container.split(' ')[2])}>
              {message}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {action && <div>{action}</div>}
          {closeable && onClose && (
            <button
              type="button"
              onClick={onClose}
              className={cn("p-1 rounded hover:bg-black/5", variantConfig.icon)}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Floating notification
export const FloatingNotification = ({
  variant = "info",
  title,
  message,
  visible = true,
  onClose,
  position = "top-right",
  className,
  ...props
}) => {
  if (!visible) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div className={cn("fixed z-50", positionClasses[position])}>
      <Toast
        variant={variant}
        title={title}
        message={message}
        onClose={onClose}
        className={className}
        {...props}
      />
    </div>
  );
};

// Confirmation dialog
export const ConfirmationDialog = ({
  open = false,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "warning",
  loading = false
}) => {
  if (!open) return null;

  const variantConfig = alertVariants[variant];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onCancel}
        />

        {/* Dialog */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={cn(
                "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10",
                variant === "warning" && "bg-yellow-100",
                variant === "error" && "bg-red-100",
                variant === "info" && "bg-blue-100",
                variant === "success" && "bg-green-100"
              )}>
                <variantConfig.iconComponent className={cn("h-6 w-6", variantConfig.icon)} />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm",
                variant === "warning" && "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
                variant === "error" && "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                variant === "info" && "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
                variant === "success" && "bg-green-600 hover:bg-green-700 focus:ring-green-500",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? "Loading..." : confirmText}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Progress notification
export const ProgressNotification = ({
  title = "Processing...",
  progress = 0,
  message,
  variant = "info",
  onClose,
  className
}) => {
  const variantConfig = alertVariants[variant];

  return (
    <div className={cn(
      "max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden",
      className
    )}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <variantConfig.iconComponent className={cn("h-5 w-5", variantConfig.icon)} />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            {message && (
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            )}
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    variant === "success" && "bg-green-600",
                    variant === "error" && "bg-red-600",
                    variant === "warning" && "bg-yellow-600",
                    variant === "info" && "bg-blue-600",
                    variant === "default" && "bg-gray-600"
                  )}
                  style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 text-right">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
          {onClose && (
            <div className="flex-shrink-0 ml-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default {
  Alert,
  AutoDismissAlert,
  ToastProvider,
  useToast,
  Toast,
  Banner,
  FloatingNotification,
  ConfirmationDialog,
  ProgressNotification
};
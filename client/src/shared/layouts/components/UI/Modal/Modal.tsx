import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// Base Modal component
export const Modal = ({
  open = false,
  onClose,
  children,
  size = "md",
  className,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventBodyScroll = true,
  ...props
}) => {
  const modalRef = useRef(null);

  // Size configurations
  const sizeClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full mx-4"
  };

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Handle body scroll
  useEffect(() => {
    if (!preventBodyScroll) return;

    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, preventBodyScroll]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        />

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal panel */}
        <div
          ref={modalRef}
          className={cn(
            "inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {/* Close button */}
          {showCloseButton && onClose && (
            <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
              <button
                type="button"
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Close</span>
                <X className="h-6 w-6" />
              </button>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

// Modal Header
export const ModalHeader = ({
  children,
  className,
  divider = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "px-4 py-3 sm:px-6",
        divider && "border-b border-gray-200",
        className
      )}
      {...props}
    >
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        {children}
      </h3>
    </div>
  );
};

// Modal Body
export const ModalBody = ({
  children,
  className,
  padding = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        padding && "px-4 py-5 sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Modal Footer
export const ModalFooter = ({
  children,
  className,
  divider = true,
  justify = "end",
  ...props
}) => {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between"
  };

  return (
    <div
      className={cn(
        "px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse",
        divider && "border-t border-gray-200",
        justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Confirmation Modal
export const ConfirmModal = ({
  open = false,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  loading = false,
  ...props
}) => {
  const variantStyles = {
    warning: {
      button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      icon: "text-yellow-600"
    },
    danger: {
      button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      icon: "text-red-600"
    },
    success: {
      button: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      icon: "text-green-600"
    },
    info: {
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      icon: "text-blue-600"
    }
  };

  const style = variantStyles[variant] || variantStyles.warning;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      {...props}
    >
      <ModalBody>
        <div className="sm:flex sm:items-start">
          <div className={cn(
            "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10",
            variant === "warning" && "bg-yellow-100",
            variant === "danger" && "bg-red-100",
            variant === "success" && "bg-green-100",
            variant === "info" && "bg-blue-100"
          )}>
            <svg
              className={cn("h-6 w-6", style.icon)}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {variant === "warning" && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              )}
              {variant === "danger" && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              )}
              {variant === "success" && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              )}
              {variant === "info" && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
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
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm",
            style.button,
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {loading ? "Loading..." : confirmText}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

// Form Modal
export const FormModal = ({
  open = false,
  onClose,
  onSubmit,
  title,
  children,
  submitText = "Submit",
  cancelText = "Cancel",
  loading = false,
  submitDisabled = false,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      {...props}
    >
      <form onSubmit={handleSubmit}>
        {title && (
          <ModalHeader>{title}</ModalHeader>
        )}
        <ModalBody>
          {children}
        </ModalBody>
        <ModalFooter>
          <button
            type="submit"
            disabled={loading || submitDisabled}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : submitText}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// Fullscreen Modal
export const FullscreenModal = ({
  open = false,
  onClose,
  children,
  title,
  className,
  showCloseButton = true,
  ...props
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          {title && (
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          )}
          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={cn("flex-1 p-4 sm:p-6", className)} {...props}>
        {children}
      </div>
    </div>
  );
};

// Drawer Modal (slides from side)
export const DrawerModal = ({
  open = false,
  onClose,
  children,
  side = "right",
  size = "md",
  title,
  className,
  ...props
}) => {
  const sideClasses = {
    left: {
      container: "justify-start",
      panel: "translate-x-0",
      closed: "-translate-x-full"
    },
    right: {
      container: "justify-end",
      panel: "translate-x-0",
      closed: "translate-x-full"
    },
    top: {
      container: "items-start",
      panel: "translate-y-0",
      closed: "-translate-y-full"
    },
    bottom: {
      container: "items-end",
      panel: "translate-y-0",
      closed: "translate-y-full"
    }
  };

  const sizeClasses = {
    sm: side === "left" || side === "right" ? "max-w-sm" : "max-h-sm",
    md: side === "left" || side === "right" ? "max-w-md" : "max-h-md",
    lg: side === "left" || side === "right" ? "max-w-lg" : "max-h-lg",
    xl: side === "left" || side === "right" ? "max-w-xl" : "max-h-xl",
    "2xl": side === "left" || side === "right" ? "max-w-2xl" : "max-h-2xl",
    full: side === "left" || side === "right" ? "w-full" : "h-full"
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer container */}
      <div className={cn(
        "fixed inset-0 flex",
        sideClasses[side].container
      )}>
        <div
          className={cn(
            "relative bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
            side === "left" || side === "right" ? "h-full" : "w-full",
            sizeClasses[size],
            open ? sideClasses[side].panel : sideClasses[side].closed,
            className
          )}
          {...props}
        >
          {/* Header */}
          {title && (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Image Modal for viewing images
export const ImageModal = ({
  open = false,
  onClose,
  src,
  alt = "Image",
  caption,
  ...props
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-90"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Image container */}
      <div className="relative max-w-full max-h-full">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain"
          {...props}
        />
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 text-center">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ConfirmModal,
  FormModal,
  FullscreenModal,
  DrawerModal,
  ImageModal
};
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * useModal - Advanced Modal Management Hook
 * Amazon.com/Shopee.sg-Level Modal System with Bangladesh Integration
 */
export const useModal = (initialState = {}) => {
  const { trackUserActivity } = useAuth();
  const [modalState, setModalState] = useState({
    modals: {},
    modalStack: [],
    globalBlocking: false,
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out'
    },
    ...initialState
  });

  // Track modal interactions
  const trackModalInteraction = useCallback((action, modalId, data = {}) => {
    trackUserActivity(`modal_${action}`, null, {
      modalId,
      timestamp: new Date().toISOString(),
      ...data
    });
  }, [trackUserActivity]);

  // Open modal
  const openModal = useCallback((modalId, props = {}) => {
    const modal = {
      id: modalId,
      isOpen: true,
      isLoading: false,
      error: null,
      data: null,
      props: {
        size: 'md', // xs, sm, md, lg, xl, full
        variant: 'default', // default, success, warning, error, info
        backdrop: 'blur', // blur, dark, transparent, none
        keyboard: true, // ESC key to close
        persistent: false, // Cannot be closed by clicking outside
        animation: 'fade', // fade, slide, zoom, none
        position: 'center', // center, top, bottom, left, right
        fullscreen: false,
        scrollable: false,
        centered: true,
        closeButton: true,
        overlayClose: true,
        focusTrap: true,
        autoFocus: true,
        restoreFocus: true,
        preventBodyScroll: true,
        zIndex: 1050,
        ...props
      },
      callbacks: {
        onOpen: props.onOpen,
        onClose: props.onClose,
        onConfirm: props.onConfirm,
        onCancel: props.onCancel,
        onEscape: props.onEscape
      },
      openedAt: new Date(),
      lastInteraction: new Date()
    };

    setModalState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        [modalId]: modal
      },
      modalStack: [...prev.modalStack, modalId]
    }));

    // Handle body scroll lock
    if (modal.props.preventBodyScroll) {
      document.body.style.overflow = 'hidden';
    }

    // Call onOpen callback
    if (modal.callbacks.onOpen) {
      modal.callbacks.onOpen(modal);
    }

    // Track modal opening
    trackModalInteraction('opened', modalId, {
      size: modal.props.size,
      variant: modal.props.variant
    });

    return modal;
  }, [trackModalInteraction]);

  // Close modal
  const closeModal = useCallback((modalId, reason = 'user') => {
    const modal = modalState.modals[modalId];
    if (!modal || !modal.isOpen) return false;

    // Check if modal is persistent and reason is not force
    if (modal.props.persistent && reason !== 'force') {
      return false;
    }

    setModalState(prev => {
      const updatedModals = { ...prev.modals };
      delete updatedModals[modalId];
      
      const updatedStack = prev.modalStack.filter(id => id !== modalId);
      
      // Restore body scroll if no modals remain
      if (updatedStack.length === 0) {
        document.body.style.overflow = '';
      }

      return {
        ...prev,
        modals: updatedModals,
        modalStack: updatedStack
      };
    });

    // Call onClose callback
    if (modal.callbacks.onClose) {
      modal.callbacks.onClose(modal, reason);
    }

    // Track modal closing
    trackModalInteraction('closed', modalId, {
      reason,
      duration: new Date() - modal.openedAt
    });

    return true;
  }, [modalState.modals, trackModalInteraction]);

  // Close all modals
  const closeAllModals = useCallback((reason = 'user') => {
    const modalIds = Object.keys(modalState.modals);
    
    modalIds.forEach(modalId => {
      closeModal(modalId, reason);
    });

    // Ensure body scroll is restored
    document.body.style.overflow = '';

    return modalIds.length;
  }, [modalState.modals, closeModal]);

  // Close top modal (last opened)
  const closeTopModal = useCallback((reason = 'user') => {
    if (modalState.modalStack.length === 0) return false;
    
    const topModalId = modalState.modalStack[modalState.modalStack.length - 1];
    return closeModal(topModalId, reason);
  }, [modalState.modalStack, closeModal]);

  // Update modal properties
  const updateModal = useCallback((modalId, updates) => {
    const modal = modalState.modals[modalId];
    if (!modal) return false;

    setModalState(prev => ({
      ...prev,
      modals: {
        ...prev.modals,
        [modalId]: {
          ...modal,
          ...updates,
          props: {
            ...modal.props,
            ...(updates.props || {})
          },
          lastInteraction: new Date()
        }
      }
    }));

    return true;
  }, [modalState.modals]);

  // Set modal loading state
  const setModalLoading = useCallback((modalId, loading = true) => {
    return updateModal(modalId, { isLoading: loading });
  }, [updateModal]);

  // Set modal error
  const setModalError = useCallback((modalId, error) => {
    return updateModal(modalId, { 
      error, 
      isLoading: false,
      lastInteraction: new Date()
    });
  }, [updateModal]);

  // Set modal data
  const setModalData = useCallback((modalId, data) => {
    return updateModal(modalId, { 
      data,
      lastInteraction: new Date()
    });
  }, [updateModal]);

  // Confirm modal (for confirmation dialogs)
  const confirmModal = useCallback((modalId, result = true) => {
    const modal = modalState.modals[modalId];
    if (!modal) return false;

    // Call onConfirm callback
    if (modal.callbacks.onConfirm) {
      modal.callbacks.onConfirm(modal, result);
    }

    // Track confirmation
    trackModalInteraction('confirmed', modalId, { result });

    // Close modal
    return closeModal(modalId, 'confirmed');
  }, [modalState.modals, closeModal, trackModalInteraction]);

  // Cancel modal
  const cancelModal = useCallback((modalId) => {
    const modal = modalState.modals[modalId];
    if (!modal) return false;

    // Call onCancel callback
    if (modal.callbacks.onCancel) {
      modal.callbacks.onCancel(modal);
    }

    // Track cancellation
    trackModalInteraction('cancelled', modalId);

    // Close modal
    return closeModal(modalId, 'cancelled');
  }, [modalState.modals, closeModal, trackModalInteraction]);

  // Handle ESC key
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape' && modalState.modalStack.length > 0) {
      const topModalId = modalState.modalStack[modalState.modalStack.length - 1];
      const topModal = modalState.modals[topModalId];
      
      if (topModal && topModal.props.keyboard) {
        // Call onEscape callback if exists
        if (topModal.callbacks.onEscape) {
          const shouldClose = topModal.callbacks.onEscape(topModal);
          if (shouldClose !== false) {
            closeModal(topModalId, 'escape');
          }
        } else {
          closeModal(topModalId, 'escape');
        }
      }
    }
  }, [modalState.modalStack, modalState.modals, closeModal]);

  // Set up global keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleEscapeKey]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Restore body scroll on cleanup
      document.body.style.overflow = '';
    };
  }, []);

  // Preset modal types for common use cases
  const showAlert = useCallback((options) => {
    const modalId = `alert_${Date.now()}`;
    return openModal(modalId, {
      variant: 'info',
      size: 'sm',
      persistent: false,
      closeButton: true,
      ...options,
      type: 'alert'
    });
  }, [openModal]);

  const showConfirm = useCallback((options) => {
    const modalId = `confirm_${Date.now()}`;
    return openModal(modalId, {
      variant: 'warning',
      size: 'sm',
      persistent: true,
      closeButton: false,
      keyboard: false,
      overlayClose: false,
      ...options,
      type: 'confirm'
    });
  }, [openModal]);

  const showError = useCallback((options) => {
    const modalId = `error_${Date.now()}`;
    return openModal(modalId, {
      variant: 'error',
      size: 'md',
      persistent: false,
      closeButton: true,
      ...options,
      type: 'error'
    });
  }, [openModal]);

  const showSuccess = useCallback((options) => {
    const modalId = `success_${Date.now()}`;
    return openModal(modalId, {
      variant: 'success',
      size: 'sm',
      persistent: false,
      closeButton: true,
      ...options,
      type: 'success'
    });
  }, [openModal]);

  const showLoading = useCallback((options) => {
    const modalId = `loading_${Date.now()}`;
    return openModal(modalId, {
      variant: 'default',
      size: 'sm',
      persistent: true,
      closeButton: false,
      keyboard: false,
      overlayClose: false,
      backdrop: 'dark',
      ...options,
      type: 'loading'
    });
  }, [openModal]);

  // E-commerce specific modals
  const showProductQuickView = useCallback((productId, options = {}) => {
    const modalId = `product_quickview_${productId}`;
    return openModal(modalId, {
      size: 'lg',
      variant: 'default',
      scrollable: true,
      ...options,
      type: 'product_quickview',
      productId
    });
  }, [openModal]);

  const showCartModal = useCallback((options = {}) => {
    const modalId = 'cart_modal';
    return openModal(modalId, {
      size: 'md',
      variant: 'default',
      position: 'right',
      animation: 'slide',
      scrollable: true,
      ...options,
      type: 'cart'
    });
  }, [openModal]);

  const showAuthModal = useCallback((mode = 'login', options = {}) => {
    const modalId = `auth_${mode}`;
    return openModal(modalId, {
      size: 'sm',
      variant: 'default',
      persistent: false,
      ...options,
      type: 'auth',
      mode
    });
  }, [openModal]);

  // Bangladesh-specific modals
  const showBangladeshPaymentModal = useCallback((paymentMethod, options = {}) => {
    const modalId = `bangladesh_payment_${paymentMethod}`;
    return openModal(modalId, {
      size: 'md',
      variant: 'default',
      persistent: true,
      ...options,
      type: 'bangladesh_payment',
      paymentMethod
    });
  }, [openModal]);

  const showBangladeshShippingModal = useCallback((options = {}) => {
    const modalId = 'bangladesh_shipping';
    return openModal(modalId, {
      size: 'lg',
      variant: 'default',
      scrollable: true,
      ...options,
      type: 'bangladesh_shipping'
    });
  }, [openModal]);

  // Computed values
  const activeModals = useMemo(() => {
    return Object.values(modalState.modals).filter(modal => modal.isOpen);
  }, [modalState.modals]);

  const topModal = useMemo(() => {
    if (modalState.modalStack.length === 0) return null;
    const topId = modalState.modalStack[modalState.modalStack.length - 1];
    return modalState.modals[topId] || null;
  }, [modalState.modalStack, modalState.modals]);

  const hasActiveModals = useMemo(() => {
    return activeModals.length > 0;
  }, [activeModals]);

  const isModalOpen = useCallback((modalId) => {
    return modalState.modals[modalId]?.isOpen || false;
  }, [modalState.modals]);

  const getModal = useCallback((modalId) => {
    return modalState.modals[modalId] || null;
  }, [modalState.modals]);

  const getModalsByType = useCallback((type) => {
    return Object.values(modalState.modals).filter(modal => 
      modal.props.type === type && modal.isOpen
    );
  }, [modalState.modals]);

  const modalCount = useMemo(() => {
    return activeModals.length;
  }, [activeModals]);

  const hasLoadingModals = useMemo(() => {
    return activeModals.some(modal => modal.isLoading);
  }, [activeModals]);

  const hasErrorModals = useMemo(() => {
    return activeModals.some(modal => modal.error);
  }, [activeModals]);

  return {
    // State
    modals: modalState.modals,
    modalStack: modalState.modalStack,
    globalBlocking: modalState.globalBlocking,
    animations: modalState.animations,
    
    // Core methods
    openModal,
    closeModal,
    closeAllModals,
    closeTopModal,
    updateModal,
    setModalLoading,
    setModalError,
    setModalData,
    confirmModal,
    cancelModal,
    
    // Preset modals
    showAlert,
    showConfirm,
    showError,
    showSuccess,
    showLoading,
    
    // E-commerce modals
    showProductQuickView,
    showCartModal,
    showAuthModal,
    
    // Bangladesh-specific modals
    showBangladeshPaymentModal,
    showBangladeshShippingModal,
    
    // Utility methods
    isModalOpen,
    getModal,
    getModalsByType,
    
    // Computed values
    activeModals,
    topModal,
    hasActiveModals,
    modalCount,
    hasLoadingModals,
    hasErrorModals,
    
    // Quick access
    isAnyModalOpen: hasActiveModals,
    isLoadingActive: hasLoadingModals,
    isErrorActive: hasErrorModals,
    canCloseTopModal: topModal && !topModal.props.persistent,
    
    // Modal stack info
    stackDepth: modalState.modalStack.length,
    isMultiModal: modalState.modalStack.length > 1,
    
    // Animation helpers
    animationsEnabled: modalState.animations.enabled,
    animationDuration: modalState.animations.duration
  };
};

export default useModal;
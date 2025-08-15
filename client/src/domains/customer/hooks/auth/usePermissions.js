import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';

/**
 * usePermissions - Role-Based Access Control Hook
 * Amazon.com/Shopee.sg-Level Permission Management with Bangladesh Compliance
 */
export const usePermissions = () => {
  const { user, hasPermission, hasRole } = useAuth();
  const [permissionState, setPermissionState] = useState({
    loading: false,
    error: null,
    userPermissions: [],
    userRoles: [],
    availablePermissions: [],
    availableRoles: [],
    resourcePermissions: {},
    contextualPermissions: {}
  });

  // Load comprehensive permission data
  useEffect(() => {
    if (user) {
      loadUserPermissions();
    }
  }, [user]);

  // Load user permissions and roles
  const loadUserPermissions = useCallback(async () => {
    try {
      setPermissionState(prev => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/v1/users/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPermissionState(prev => ({
          ...prev,
          loading: false,
          userPermissions: data.permissions || [],
          userRoles: data.roles || [],
          availablePermissions: data.availablePermissions || [],
          availableRoles: data.availableRoles || [],
          resourcePermissions: data.resourcePermissions || {},
          contextualPermissions: data.contextualPermissions || {}
        }));
      } else {
        setPermissionState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load permissions'
        }));
      }
    } catch (error) {
      console.error('Permission loading error:', error);
      setPermissionState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load permissions'
      }));
    }
  }, []);

  // Check specific permission
  const checkPermission = useCallback((permission, resource = null, context = {}) => {
    // Use auth context first for basic permissions
    if (hasPermission && hasPermission(permission)) {
      return true;
    }

    // Check direct user permissions
    if (permissionState.userPermissions.includes(permission)) {
      return true;
    }

    // Check resource-specific permissions
    if (resource && permissionState.resourcePermissions[resource]) {
      const resourcePerms = permissionState.resourcePermissions[resource];
      if (resourcePerms.includes(permission)) {
        return true;
      }
    }

    // Check contextual permissions (e.g., vendor can edit own products)
    if (Object.keys(context).length > 0) {
      return checkContextualPermission(permission, resource, context);
    }

    return false;
  }, [hasPermission, permissionState]);

  // Check role-based access
  const checkRole = useCallback((role) => {
    // Use auth context first
    if (hasRole && hasRole(role)) {
      return true;
    }

    // Check user roles from state
    return permissionState.userRoles.some(userRole => 
      userRole.name === role || userRole.slug === role
    );
  }, [hasRole, permissionState.userRoles]);

  // Check multiple permissions (AND logic)
  const checkAllPermissions = useCallback((permissions, resource = null, context = {}) => {
    return permissions.every(permission => 
      checkPermission(permission, resource, context)
    );
  }, [checkPermission]);

  // Check multiple permissions (OR logic)
  const checkAnyPermission = useCallback((permissions, resource = null, context = {}) => {
    return permissions.some(permission => 
      checkPermission(permission, resource, context)
    );
  }, [checkPermission]);

  // Check contextual permissions (business logic)
  const checkContextualPermission = useCallback((permission, resource, context) => {
    const { userId, vendorId, orderId, productId } = context;

    // Vendor permissions - can manage own resources
    if (checkRole('vendor') && vendorId && user?.vendorId === vendorId) {
      const vendorPermissions = [
        'products.create', 'products.edit', 'products.delete',
        'orders.view', 'orders.update',
        'analytics.view', 'payouts.view'
      ];
      
      if (vendorPermissions.includes(permission)) {
        return true;
      }
    }

    // Customer permissions - can manage own data
    if (checkRole('customer') && userId && user?.id === userId) {
      const customerPermissions = [
        'profile.edit', 'orders.view', 'reviews.create',
        'wishlist.manage', 'addresses.manage'
      ];
      
      if (customerPermissions.includes(permission)) {
        return true;
      }
    }

    // Admin permissions - full access with restrictions
    if (checkRole('admin')) {
      // Bangladesh compliance restrictions for admin
      const restrictedPermissions = [
        'users.delete_permanently',
        'financial_data.export_all',
        'kyc_data.export'
      ];
      
      if (restrictedPermissions.includes(permission)) {
        return checkRole('super_admin');
      }
      
      return true;
    }

    return false;
  }, [checkRole, user]);

  // Get user role hierarchy
  const getUserRoleHierarchy = useCallback(() => {
    const roleHierarchy = {
      'super_admin': 100,
      'admin': 90,
      'manager': 80,
      'vendor': 70,
      'moderator': 60,
      'customer': 50,
      'guest': 10
    };

    const userRoleLevel = Math.max(
      ...permissionState.userRoles.map(role => 
        roleHierarchy[role.name] || roleHierarchy[role.slug] || 0
      ),
      0
    );

    return {
      level: userRoleLevel,
      canAccessLevel: (requiredLevel) => userRoleLevel >= requiredLevel,
      isHigherThan: (targetRole) => userRoleLevel > (roleHierarchy[targetRole] || 0),
      isEqualOrHigher: (targetRole) => userRoleLevel >= (roleHierarchy[targetRole] || 0)
    };
  }, [permissionState.userRoles]);

  // Bangladesh-specific permission checks
  const checkBangladeshCompliance = useCallback((action, data = {}) => {
    const complianceRoles = ['compliance_officer', 'admin', 'super_admin'];
    
    // KYC data access restrictions
    if (action.includes('kyc') || action.includes('verification')) {
      return checkAnyPermission(['kyc.manage']) || 
             complianceRoles.some(role => checkRole(role));
    }

    // Financial data restrictions (Bangladesh Bank compliance)
    if (action.includes('financial') || action.includes('payment')) {
      return checkAnyPermission(['finance.manage']) || 
             complianceRoles.some(role => checkRole(role));
    }

    // Tax data restrictions (NBR compliance)
    if (action.includes('tax') || action.includes('vat')) {
      return checkAnyPermission(['tax.manage']) || 
             complianceRoles.some(role => checkRole(role));
    }

    return true;
  }, [checkAnyPermission, checkRole]);

  // Get permission groups for UI
  const getPermissionGroups = useMemo(() => {
    const groups = {
      user_management: {
        label: 'User Management',
        permissions: permissionState.userPermissions.filter(p => 
          p.startsWith('users.') || p.startsWith('profile.')
        )
      },
      product_management: {
        label: 'Product Management',
        permissions: permissionState.userPermissions.filter(p => 
          p.startsWith('products.') || p.startsWith('categories.')
        )
      },
      order_management: {
        label: 'Order Management',
        permissions: permissionState.userPermissions.filter(p => 
          p.startsWith('orders.') || p.startsWith('shipping.')
        )
      },
      financial_management: {
        label: 'Financial Management',
        permissions: permissionState.userPermissions.filter(p => 
          p.startsWith('finance.') || p.startsWith('payments.')
        )
      },
      vendor_management: {
        label: 'Vendor Management',
        permissions: permissionState.userPermissions.filter(p => 
          p.startsWith('vendors.') || p.startsWith('stores.')
        )
      },
      analytics: {
        label: 'Analytics & Reports',
        permissions: permissionState.userPermissions.filter(p => 
          p.startsWith('analytics.') || p.startsWith('reports.')
        )
      },
      bangladesh_compliance: {
        label: 'Bangladesh Compliance',
        permissions: permissionState.userPermissions.filter(p => 
          p.startsWith('kyc.') || p.startsWith('compliance.') || p.startsWith('tax.')
        )
      }
    };

    return groups;
  }, [permissionState.userPermissions]);

  // Enhanced permission decorator for components
  const withPermission = useCallback((permission, fallbackComponent = null) => {
    return (Component) => (props) => {
      if (checkPermission(permission, props.resource, props.context)) {
        return <Component {...props} />;
      }
      return fallbackComponent;
    };
  }, [checkPermission]);

  return {
    // State
    ...permissionState,
    
    // Methods
    loadUserPermissions,
    checkPermission,
    checkRole,
    checkAllPermissions,
    checkAnyPermission,
    checkBangladeshCompliance,
    getUserRoleHierarchy,
    withPermission,

    // Computed values
    permissionGroups: getPermissionGroups,
    roleHierarchy: getUserRoleHierarchy(),
    isAdmin: checkRole('admin') || checkRole('super_admin'),
    isVendor: checkRole('vendor'),
    isCustomer: checkRole('customer'),
    isSuperAdmin: checkRole('super_admin'),
    isManager: checkRole('manager'),
    isModerator: checkRole('moderator'),
    
    // Quick permission checks for common actions
    canManageUsers: checkPermission('users.manage'),
    canManageProducts: checkPermission('products.manage'),
    canManageOrders: checkPermission('orders.manage'),
    canManageFinance: checkPermission('finance.manage'),
    canManageVendors: checkPermission('vendors.manage'),
    canViewAnalytics: checkPermission('analytics.view'),
    canManageKYC: checkPermission('kyc.manage'),
    canExportData: checkPermission('data.export'),
    canManageCompliance: checkBangladeshCompliance('compliance.manage')
  };
};

export default usePermissions;
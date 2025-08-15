import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * useProfile - Advanced Profile Management Hook
 * Amazon.com/Shopee.sg-Level Profile Features with Bangladesh Integration
 */
export const useProfile = () => {
  const { user, updateProfile, trackUserActivity } = useAuth();
  const [profileState, setProfileState] = useState({
    loading: false,
    uploading: false,
    saving: false,
    error: null,
    successMessage: null,
    profileData: null,
    originalData: null,
    hasChanges: false,
    imagePreview: null,
    preferences: {},
    addresses: [],
    phoneNumbers: [],
    socialAccounts: [],
    securitySettings: {}
  });

  // Initialize profile data
  useEffect(() => {
    if (user) {
      const initialData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
        timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: user.language || 'en',
        currency: user.currency || 'BDT'
      };

      setProfileState(prev => ({
        ...prev,
        profileData: initialData,
        originalData: { ...initialData },
        preferences: user.preferences || {},
        addresses: user.addresses || [],
        phoneNumbers: user.phoneNumbers || [],
        socialAccounts: user.socialAccounts || [],
        securitySettings: user.securitySettings || {}
      }));
    }
  }, [user]);

  // Update profile field
  const updateField = useCallback((field, value) => {
    setProfileState(prev => {
      const newData = { ...prev.profileData, [field]: value };
      const hasChanges = JSON.stringify(newData) !== JSON.stringify(prev.originalData);
      
      return {
        ...prev,
        profileData: newData,
        hasChanges,
        error: null,
        successMessage: null
      };
    });
  }, []);

  // Update multiple fields
  const updateFields = useCallback((updates) => {
    setProfileState(prev => {
      const newData = { ...prev.profileData, ...updates };
      const hasChanges = JSON.stringify(newData) !== JSON.stringify(prev.originalData);
      
      return {
        ...prev,
        profileData: newData,
        hasChanges,
        error: null,
        successMessage: null
      };
    });
  }, []);

  // Save profile changes
  const saveProfile = useCallback(async () => {
    if (!profileState.hasChanges) {
      return { success: true, message: 'No changes to save' };
    }

    try {
      setProfileState(prev => ({ ...prev, saving: true, error: null }));

      // Validate profile data
      const validationError = validateProfileData(profileState.profileData);
      if (validationError) {
        setProfileState(prev => ({
          ...prev,
          saving: false,
          error: validationError
        }));
        return { success: false, error: validationError };
      }

      // Save to backend
      const result = await updateProfile(profileState.profileData);

      if (result.success) {
        setProfileState(prev => ({
          ...prev,
          saving: false,
          originalData: { ...prev.profileData },
          hasChanges: false,
          successMessage: 'Profile updated successfully'
        }));

        // Track profile update
        await trackUserActivity('profile_updated', user.id);
        
        return result;
      } else {
        setProfileState(prev => ({
          ...prev,
          saving: false,
          error: result.error
        }));
        return result;
      }
    } catch (error) {
      console.error('Profile save error:', error);
      setProfileState(prev => ({
        ...prev,
        saving: false,
        error: 'Failed to save profile. Please try again.'
      }));
      return { success: false, error: 'Failed to save profile. Please try again.' };
    }
  }, [profileState, updateProfile, user, trackUserActivity]);

  // Upload profile image
  const uploadImage = useCallback(async (file) => {
    try {
      setProfileState(prev => ({ ...prev, uploading: true, error: null }));

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setProfileState(prev => ({
          ...prev,
          uploading: false,
          error: validation.error
        }));
        return { success: false, error: validation.error };
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      setProfileState(prev => ({ ...prev, imagePreview: preview }));

      // Upload to server
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/v1/users/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const { avatarUrl } = await response.json();
        
        setProfileState(prev => ({
          ...prev,
          uploading: false,
          profileData: { ...prev.profileData, avatar: avatarUrl },
          hasChanges: true,
          imagePreview: null,
          successMessage: 'Profile image updated successfully'
        }));

        // Track image upload
        await trackUserActivity('avatar_uploaded', user.id);
        
        return { success: true, avatarUrl, message: 'Image uploaded successfully' };
      } else {
        const error = await response.json();
        setProfileState(prev => ({
          ...prev,
          uploading: false,
          imagePreview: null,
          error: error.message || 'Failed to upload image'
        }));
        return { success: false, error: error.message || 'Failed to upload image' };
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setProfileState(prev => ({
        ...prev,
        uploading: false,
        imagePreview: null,
        error: 'Failed to upload image. Please try again.'
      }));
      return { success: false, error: 'Failed to upload image. Please try again.' };
    }
  }, [user, trackUserActivity]);

  // Remove profile image
  const removeImage = useCallback(async () => {
    try {
      setProfileState(prev => ({ ...prev, uploading: true, error: null }));

      const response = await fetch('/api/v1/users/remove-avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setProfileState(prev => ({
          ...prev,
          uploading: false,
          profileData: { ...prev.profileData, avatar: '' },
          hasChanges: true,
          successMessage: 'Profile image removed successfully'
        }));

        // Track image removal
        await trackUserActivity('avatar_removed', user.id);
        
        return { success: true, message: 'Image removed successfully' };
      } else {
        const error = await response.json();
        setProfileState(prev => ({
          ...prev,
          uploading: false,
          error: error.message || 'Failed to remove image'
        }));
        return { success: false, error: error.message || 'Failed to remove image' };
      }
    } catch (error) {
      console.error('Image removal error:', error);
      setProfileState(prev => ({
        ...prev,
        uploading: false,
        error: 'Failed to remove image. Please try again.'
      }));
      return { success: false, error: 'Failed to remove image. Please try again.' };
    }
  }, [user, trackUserActivity]);

  // Update preferences
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      setProfileState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/v1/users/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      });

      if (response.ok) {
        const preferences = await response.json();
        setProfileState(prev => ({
          ...prev,
          loading: false,
          preferences,
          successMessage: 'Preferences updated successfully'
        }));

        // Track preferences update
        await trackUserActivity('preferences_updated', user.id);
        
        return { success: true, preferences };
      } else {
        const error = await response.json();
        setProfileState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to update preferences'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Preferences update error:', error);
      setProfileState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update preferences. Please try again.'
      }));
      return { success: false, error: 'Failed to update preferences. Please try again.' };
    }
  }, [user, trackUserActivity]);

  // Add address
  const addAddress = useCallback(async (addressData) => {
    try {
      setProfileState(prev => ({ ...prev, loading: true, error: null }));

      // Validate Bangladesh address
      const validationError = validateBangladeshAddress(addressData);
      if (validationError) {
        setProfileState(prev => ({
          ...prev,
          loading: false,
          error: validationError
        }));
        return { success: false, error: validationError };
      }

      const response = await fetch('/api/v1/users/addresses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const address = await response.json();
        setProfileState(prev => ({
          ...prev,
          loading: false,
          addresses: [...prev.addresses, address],
          successMessage: 'Address added successfully'
        }));

        // Track address addition
        await trackUserActivity('address_added', user.id);
        
        return { success: true, address };
      } else {
        const error = await response.json();
        setProfileState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to add address'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Address addition error:', error);
      setProfileState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to add address. Please try again.'
      }));
      return { success: false, error: 'Failed to add address. Please try again.' };
    }
  }, [user, trackUserActivity]);

  // Update address
  const updateAddress = useCallback(async (addressId, addressData) => {
    try {
      setProfileState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/v1/users/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const updatedAddress = await response.json();
        setProfileState(prev => ({
          ...prev,
          loading: false,
          addresses: prev.addresses.map(addr => 
            addr.id === addressId ? updatedAddress : addr
          ),
          successMessage: 'Address updated successfully'
        }));

        return { success: true, address: updatedAddress };
      } else {
        const error = await response.json();
        setProfileState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to update address'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Address update error:', error);
      setProfileState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update address. Please try again.'
      }));
      return { success: false, error: 'Failed to update address. Please try again.' };
    }
  }, []);

  // Delete address
  const deleteAddress = useCallback(async (addressId) => {
    try {
      setProfileState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/v1/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setProfileState(prev => ({
          ...prev,
          loading: false,
          addresses: prev.addresses.filter(addr => addr.id !== addressId),
          successMessage: 'Address deleted successfully'
        }));

        return { success: true };
      } else {
        const error = await response.json();
        setProfileState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to delete address'
        }));
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Address deletion error:', error);
      setProfileState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to delete address. Please try again.'
      }));
      return { success: false, error: 'Failed to delete address. Please try again.' };
    }
  }, []);

  // Reset changes
  const resetChanges = useCallback(() => {
    setProfileState(prev => ({
      ...prev,
      profileData: { ...prev.originalData },
      hasChanges: false,
      error: null,
      successMessage: null,
      imagePreview: null
    }));
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setProfileState(prev => ({
      ...prev,
      error: null,
      successMessage: null
    }));
  }, []);

  return {
    // State
    ...profileState,
    
    // Methods
    updateField,
    updateFields,
    saveProfile,
    uploadImage,
    removeImage,
    updatePreferences,
    addAddress,
    updateAddress,
    deleteAddress,
    resetChanges,
    clearMessages,

    // Computed values
    isComplete: isProfileComplete(profileState.profileData),
    completionPercentage: getProfileCompletionPercentage(profileState.profileData),
    canSave: profileState.hasChanges && !profileState.saving
  };
};

// Helper functions
const validateProfileData = (data) => {
  const { firstName, lastName, email, phone } = data;

  if (!firstName || firstName.length < 2) {
    return 'First name must be at least 2 characters long';
  }

  if (!lastName || lastName.length < 2) {
    return 'Last name must be at least 2 characters long';
  }

  if (!email || !isValidEmail(email)) {
    return 'Please enter a valid email address';
  }

  if (phone && !isValidBangladeshPhone(phone)) {
    return 'Please enter a valid Bangladesh phone number';
  }

  if (data.dateOfBirth && !isValidDate(data.dateOfBirth)) {
    return 'Please enter a valid date of birth';
  }

  if (data.website && !isValidUrl(data.website)) {
    return 'Please enter a valid website URL';
  }

  return null;
};

const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image file must be less than 5MB' };
  }

  return { valid: true };
};

const validateBangladeshAddress = (address) => {
  const { division, district, area, streetAddress } = address;

  if (!division) {
    return 'Please select a division';
  }

  if (!district) {
    return 'Please select a district';
  }

  if (!area) {
    return 'Please enter an area/thana';
  }

  if (!streetAddress || streetAddress.length < 10) {
    return 'Please enter a detailed street address (minimum 10 characters)';
  }

  return null;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidBangladeshPhone = (phone) => {
  const phoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isProfileComplete = (data) => {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
  return requiredFields.every(field => data[field] && data[field].trim() !== '');
};

const getProfileCompletionPercentage = (data) => {
  const fields = [
    'firstName', 'lastName', 'email', 'phone', 'avatar',
    'dateOfBirth', 'gender', 'bio', 'location'
  ];
  
  const completedFields = fields.filter(field => 
    data[field] && data[field].toString().trim() !== ''
  );
  
  return Math.round((completedFields.length / fields.length) * 100);
};

export default useProfile;
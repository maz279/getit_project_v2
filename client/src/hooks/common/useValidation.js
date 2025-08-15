import { useState, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * useValidation - Advanced Form & Input Validation Hook
 * Amazon.com/Shopee.sg-Level Validation System with Bangladesh Integration
 */
export const useValidation = (initialConfig = {}) => {
  const { trackUserActivity } = useAuth();
  const [validationState, setValidationState] = useState({
    fields: {},
    errors: {},
    touched: {},
    isValidating: false,
    isValid: true,
    isDirty: false,
    validationCount: 0,
    
    // Configuration
    config: {
      validateOnChange: true,
      validateOnBlur: true,
      validateOnSubmit: true,
      debounceDelay: 300,
      showErrorsOnTouch: true,
      clearErrorsOnFocus: false,
      enableAsyncValidation: true,
      enableRealTimeValidation: true,
      storageKey: 'validation_cache',
      enableValidationMetrics: true,
      ...initialConfig
    },

    // Validation rules registry
    rules: {
      required: {
        validate: (value) => {
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'string') return value.trim().length > 0;
          return value !== null && value !== undefined && value !== '';
        },
        message: 'This field is required'
      },
      
      email: {
        validate: (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return !value || emailRegex.test(value);
        },
        message: 'Please enter a valid email address'
      },
      
      phone: {
        validate: (value) => {
          const phoneRegex = /^(\+88)?01[3-9]\d{8}$/; // Bangladesh mobile format
          return !value || phoneRegex.test(value.replace(/\s/g, ''));
        },
        message: 'Please enter a valid Bangladesh mobile number'
      },
      
      password: {
        validate: (value) => {
          if (!value) return true;
          const hasMinLength = value.length >= 8;
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumbers = /\d/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          return hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
        },
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      },
      
      confirmPassword: {
        validate: (value, allValues) => {
          return !value || value === allValues.password;
        },
        message: 'Passwords do not match'
      },
      
      minLength: (min) => ({
        validate: (value) => !value || value.length >= min,
        message: `Must be at least ${min} characters long`
      }),
      
      maxLength: (max) => ({
        validate: (value) => !value || value.length <= max,
        message: `Must be no more than ${max} characters long`
      }),
      
      min: (min) => ({
        validate: (value) => !value || Number(value) >= min,
        message: `Must be at least ${min}`
      }),
      
      max: (max) => ({
        validate: (value) => !value || Number(value) <= max,
        message: `Must be no more than ${max}`
      }),
      
      pattern: (regex, message) => ({
        validate: (value) => !value || regex.test(value),
        message: message || 'Invalid format'
      }),
      
      // Bangladesh-specific validators
      nid: {
        validate: (value) => {
          if (!value) return true;
          const nidRegex = /^\d{10}$|^\d{13}$|^\d{17}$/; // 10, 13, or 17 digit NID
          return nidRegex.test(value.replace(/\s/g, ''));
        },
        message: 'Please enter a valid NID number (10, 13, or 17 digits)'
      },
      
      bkashNumber: {
        validate: (value) => {
          if (!value) return true;
          const bkashRegex = /^(\+88)?01[3-9]\d{8}$/;
          return bkashRegex.test(value.replace(/\s/g, ''));
        },
        message: 'Please enter a valid bKash number'
      },
      
      postalCode: {
        validate: (value) => {
          if (!value) return true;
          const postalRegex = /^\d{4}$/; // Bangladesh postal code format
          return postalRegex.test(value);
        },
        message: 'Please enter a valid postal code (4 digits)'
      },
      
      price: {
        validate: (value) => {
          if (!value) return true;
          const price = parseFloat(value);
          return !isNaN(price) && price >= 0 && price <= 10000000; // Max 1 crore
        },
        message: 'Please enter a valid price'
      },
      
      bengaliText: {
        validate: (value) => {
          if (!value) return true;
          const bengaliRegex = /^[\u0980-\u09FF\s]+$/;
          return bengaliRegex.test(value);
        },
        message: 'Please enter text in Bengali only'
      }
    },

    // Async validation cache
    asyncValidationCache: {},
    asyncValidationPromises: {},
    
    // Validation metrics
    validationMetrics: {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      averageValidationTime: 0,
      validationTimes: [],
      fieldValidationCounts: {},
      mostValidatedField: null
    }
  });

  const debounceTimers = useRef({});
  const validationStartTimes = useRef({});

  // Track validation interaction
  const trackValidationInteraction = useCallback((action, data = {}) => {
    if (validationState.config.enableValidationMetrics) {
      trackUserActivity(`validation_${action}`, null, {
        timestamp: new Date().toISOString(),
        ...data
      });
    }
  }, [trackUserActivity, validationState.config.enableValidationMetrics]);

  // Add validation rule
  const addRule = useCallback((name, rule) => {
    setValidationState(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        [name]: rule
      }
    }));
  }, []);

  // Validate single field
  const validateField = useCallback(async (fieldName, value, allValues = {}, rules = []) => {
    const startTime = performance.now();
    validationStartTimes.current[fieldName] = startTime;
    
    setValidationState(prev => ({
      ...prev,
      isValidating: true
    }));

    let fieldErrors = [];
    
    try {
      // Run synchronous validations
      for (const rule of rules) {
        let validator, message;
        
        if (typeof rule === 'string') {
          // Built-in rule
          const builtInRule = validationState.rules[rule];
          if (builtInRule) {
            validator = builtInRule.validate;
            message = builtInRule.message;
          }
        } else if (typeof rule === 'function') {
          // Custom function
          validator = rule;
          message = 'Validation failed';
        } else if (typeof rule === 'object') {
          // Rule object
          validator = rule.validate || rule.validator;
          message = rule.message || 'Validation failed';
        }
        
        if (validator) {
          const isValid = await validator(value, allValues, fieldName);
          if (!isValid) {
            fieldErrors.push(message);
          }
        }
      }

      // Run async validation if enabled
      if (validationState.config.enableAsyncValidation && rules.some(rule => rule.async)) {
        const asyncRules = rules.filter(rule => rule.async);
        for (const rule of asyncRules) {
          const cacheKey = `${fieldName}_${value}_${JSON.stringify(rule)}`;
          
          // Check cache first
          if (validationState.asyncValidationCache[cacheKey]) {
            const cachedResult = validationState.asyncValidationCache[cacheKey];
            if (!cachedResult.isValid) {
              fieldErrors.push(cachedResult.message);
            }
            continue;
          }
          
          // Run async validation
          try {
            const isValid = await rule.validate(value, allValues, fieldName);
            const result = { isValid, message: rule.message };
            
            // Cache result
            setValidationState(prev => ({
              ...prev,
              asyncValidationCache: {
                ...prev.asyncValidationCache,
                [cacheKey]: result
              }
            }));
            
            if (!isValid) {
              fieldErrors.push(rule.message);
            }
          } catch (error) {
            console.error(`Async validation error for ${fieldName}:`, error);
            fieldErrors.push('Validation error occurred');
          }
        }
      }

      const validationTime = performance.now() - startTime;
      
      // Update validation metrics
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        errors: {
          ...prev.errors,
          [fieldName]: fieldErrors
        },
        validationMetrics: {
          ...prev.validationMetrics,
          totalValidations: prev.validationMetrics.totalValidations + 1,
          successfulValidations: fieldErrors.length === 0 ? prev.validationMetrics.successfulValidations + 1 : prev.validationMetrics.successfulValidations,
          failedValidations: fieldErrors.length > 0 ? prev.validationMetrics.failedValidations + 1 : prev.validationMetrics.failedValidations,
          validationTimes: [...prev.validationMetrics.validationTimes.slice(-19), validationTime],
          averageValidationTime: [...prev.validationMetrics.validationTimes.slice(-19), validationTime].reduce((a, b) => a + b, 0) / Math.min(prev.validationMetrics.validationTimes.length + 1, 20),
          fieldValidationCounts: {
            ...prev.validationMetrics.fieldValidationCounts,
            [fieldName]: (prev.validationMetrics.fieldValidationCounts[fieldName] || 0) + 1
          }
        }
      }));

      trackValidationInteraction('field_validated', {
        fieldName,
        isValid: fieldErrors.length === 0,
        errorCount: fieldErrors.length,
        validationTime
      });

      return fieldErrors;
      
    } catch (error) {
      console.error(`Validation error for ${fieldName}:`, error);
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        errors: {
          ...prev.errors,
          [fieldName]: ['Validation error occurred']
        }
      }));
      return ['Validation error occurred'];
    }
  }, [validationState.rules, validationState.config.enableAsyncValidation, validationState.asyncValidationCache, trackValidationInteraction]);

  // Debounced validation
  const debouncedValidateField = useCallback((fieldName, value, allValues, rules) => {
    if (debounceTimers.current[fieldName]) {
      clearTimeout(debounceTimers.current[fieldName]);
    }
    
    debounceTimers.current[fieldName] = setTimeout(() => {
      validateField(fieldName, value, allValues, rules);
    }, validationState.config.debounceDelay);
  }, [validateField, validationState.config.debounceDelay]);

  // Set field value with validation
  const setFieldValue = useCallback((fieldName, value, rules = [], allValues = {}) => {
    setValidationState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: value
      },
      isDirty: true
    }));

    if (validationState.config.validateOnChange) {
      if (validationState.config.enableRealTimeValidation) {
        debouncedValidateField(fieldName, value, { ...validationState.fields, ...allValues, [fieldName]: value }, rules);
      }
    }
  }, [validationState.config.validateOnChange, validationState.config.enableRealTimeValidation, validationState.fields, debouncedValidateField]);

  // Mark field as touched
  const setFieldTouched = useCallback((fieldName, touched = true) => {
    setValidationState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [fieldName]: touched
      }
    }));
  }, []);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName, value, rules = [], allValues = {}) => {
    setFieldTouched(fieldName, true);
    
    if (validationState.config.validateOnBlur) {
      validateField(fieldName, value, { ...validationState.fields, ...allValues }, rules);
    }
  }, [setFieldTouched, validationState.config.validateOnBlur, validateField, validationState.fields]);

  // Handle field focus
  const handleFieldFocus = useCallback((fieldName) => {
    if (validationState.config.clearErrorsOnFocus) {
      setValidationState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: []
        }
      }));
    }
  }, [validationState.config.clearErrorsOnFocus]);

  // Validate entire form
  const validateForm = useCallback(async (values, schema) => {
    const startTime = performance.now();
    setValidationState(prev => ({
      ...prev,
      isValidating: true
    }));

    const allErrors = {};
    const validationPromises = [];

    for (const [fieldName, rules] of Object.entries(schema)) {
      const value = values[fieldName];
      const promise = validateField(fieldName, value, values, rules).then(errors => {
        if (errors.length > 0) {
          allErrors[fieldName] = errors;
        }
      });
      validationPromises.push(promise);
    }

    await Promise.all(validationPromises);
    
    const isValid = Object.keys(allErrors).length === 0;
    const validationTime = performance.now() - startTime;

    setValidationState(prev => ({
      ...prev,
      isValidating: false,
      errors: allErrors,
      isValid,
      validationCount: prev.validationCount + 1
    }));

    trackValidationInteraction('form_validated', {
      isValid,
      errorCount: Object.keys(allErrors).length,
      fieldCount: Object.keys(schema).length,
      validationTime
    });

    return { isValid, errors: allErrors };
  }, [validateField, trackValidationInteraction]);

  // Clear validation errors
  const clearErrors = useCallback((fieldName = null) => {
    setValidationState(prev => ({
      ...prev,
      errors: fieldName ? 
        { ...prev.errors, [fieldName]: [] } : 
        {}
    }));
  }, []);

  // Clear all validation state
  const clearValidation = useCallback(() => {
    setValidationState(prev => ({
      ...prev,
      fields: {},
      errors: {},
      touched: {},
      isValid: true,
      isDirty: false
    }));
    
    // Clear debounce timers
    Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    debounceTimers.current = {};
  }, []);

  // Reset validation state
  const resetValidation = useCallback((initialValues = {}) => {
    setValidationState(prev => ({
      ...prev,
      fields: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isDirty: false
    }));
  }, []);

  // Get field validation status
  const getFieldStatus = useCallback((fieldName) => {
    const hasError = validationState.errors[fieldName] && validationState.errors[fieldName].length > 0;
    const isTouched = validationState.touched[fieldName];
    const showError = validationState.config.showErrorsOnTouch ? (hasError && isTouched) : hasError;
    
    return {
      hasError,
      isTouched,
      showError,
      errors: validationState.errors[fieldName] || [],
      value: validationState.fields[fieldName]
    };
  }, [validationState.errors, validationState.touched, validationState.fields, validationState.config.showErrorsOnTouch]);

  // Bangladesh-specific validation helpers
  const bangladeshValidators = useMemo(() => ({
    validateBangladeshPhone: (phone) => {
      const cleaned = phone.replace(/\s/g, '');
      const bangladeshPhoneRegex = /^(\+88)?01[3-9]\d{8}$/;
      return bangladeshPhoneRegex.test(cleaned);
    },
    
    validateBangladeshNID: (nid) => {
      const cleaned = nid.replace(/\s/g, '');
      return /^\d{10}$|^\d{13}$|^\d{17}$/.test(cleaned);
    },
    
    validateBangladeshPostalCode: (code) => {
      return /^\d{4}$/.test(code);
    },
    
    validateBengaliText: (text) => {
      return /^[\u0980-\u09FF\s]+$/.test(text);
    },
    
    validateBkashNumber: (number) => {
      const cleaned = number.replace(/\s/g, '');
      return /^(\+88)?01[3-9]\d{8}$/.test(cleaned);
    }
  }), []);

  // Form field registration helper
  const register = useCallback((fieldName, rules = []) => {
    return {
      name: fieldName,
      value: validationState.fields[fieldName] || '',
      onChange: (e) => {
        const value = e.target ? e.target.value : e;
        setFieldValue(fieldName, value, rules, validationState.fields);
      },
      onBlur: (e) => {
        const value = e.target ? e.target.value : e;
        handleFieldBlur(fieldName, value, rules, validationState.fields);
      },
      onFocus: () => handleFieldFocus(fieldName),
      ...getFieldStatus(fieldName)
    };
  }, [validationState.fields, setFieldValue, handleFieldBlur, handleFieldFocus, getFieldStatus]);

  // Computed values
  const hasErrors = useMemo(() => {
    return Object.values(validationState.errors).some(errors => errors && errors.length > 0);
  }, [validationState.errors]);

  const touchedFields = useMemo(() => {
    return Object.keys(validationState.touched).filter(key => validationState.touched[key]);
  }, [validationState.touched]);

  const validFields = useMemo(() => {
    return Object.keys(validationState.fields).filter(key => 
      !validationState.errors[key] || validationState.errors[key].length === 0
    );
  }, [validationState.fields, validationState.errors]);

  const invalidFields = useMemo(() => {
    return Object.keys(validationState.errors).filter(key => 
      validationState.errors[key] && validationState.errors[key].length > 0
    );
  }, [validationState.errors]);

  return {
    // Core state
    fields: validationState.fields,
    errors: validationState.errors,
    touched: validationState.touched,
    isValidating: validationState.isValidating,
    isValid: validationState.isValid,
    isDirty: validationState.isDirty,
    
    // Validation methods
    validateField,
    validateForm,
    setFieldValue,
    setFieldTouched,
    handleFieldBlur,
    handleFieldFocus,
    
    // Utility methods
    clearErrors,
    clearValidation,
    resetValidation,
    getFieldStatus,
    register,
    addRule,
    
    // State information
    hasErrors,
    touchedFields,
    validFields,
    invalidFields,
    
    // Configuration
    config: validationState.config,
    rules: validationState.rules,
    
    // Bangladesh-specific
    bangladeshValidators,
    
    // Metrics
    validationMetrics: validationState.validationMetrics,
    
    // Quick validation methods
    isEmailValid: (email) => validationState.rules.email.validate(email),
    isPhoneValid: (phone) => validationState.rules.phone.validate(phone),
    isPasswordValid: (password) => validationState.rules.password.validate(password),
    isRequiredValid: (value) => validationState.rules.required.validate(value),
    
    // Form helpers
    getFormData: () => validationState.fields,
    getFormErrors: () => validationState.errors,
    isFormValid: () => validationState.isValid && !hasErrors,
    getValidationSummary: () => ({
      totalFields: Object.keys(validationState.fields).length,
      validFields: validFields.length,
      invalidFields: invalidFields.length,
      touchedFields: touchedFields.length,
      isFormComplete: Object.keys(validationState.fields).length > 0 && validFields.length === Object.keys(validationState.fields).length
    }),
    
    // Advanced features
    debounceValidation: debouncedValidateField,
    batchValidate: async (validations) => {
      const results = await Promise.all(validations.map(({ field, value, rules, allValues }) => 
        validateField(field, value, allValues, rules)
      ));
      return results;
    }
  };
};

export default useValidation;
/**
 * Store Validation - Amazon.com/Shopee.sg-Level Store Validation
 * 
 * Complete validation for store operations:
 * - Store creation and update validation
 * - Design and customization validation
 * - File upload validation (logos, banners)
 * - SEO and business hours validation
 * - Bangladesh-specific store requirements
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class StoreValidation {

  /**
   * Validate store creation data
   */
  async validateStoreCreation(storeData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Required fields validation
    if (!storeData.storeName || storeData.storeName.trim().length === 0) {
      errors.push('Store name is required');
    } else if (storeData.storeName.length < 3) {
      errors.push('Store name must be at least 3 characters long');
    } else if (storeData.storeName.length > 100) {
      errors.push('Store name must not exceed 100 characters');
    }

    if (!storeData.storeDescription || storeData.storeDescription.trim().length === 0) {
      errors.push('Store description is required');
    } else if (storeData.storeDescription.length < 20) {
      errors.push('Store description must be at least 20 characters long');
    } else if (storeData.storeDescription.length > 1000) {
      errors.push('Store description must not exceed 1000 characters');
    }

    // Store URL validation
    if (storeData.storeUrl) {
      if (!this.isValidStoreUrl(storeData.storeUrl)) {
        errors.push('Store URL must contain only lowercase letters, numbers, and hyphens');
      }
      if (storeData.storeUrl.length < 3 || storeData.storeUrl.length > 50) {
        errors.push('Store URL must be between 3 and 50 characters');
      }
    }

    // Category validation
    if (!storeData.category || storeData.category.trim().length === 0) {
      errors.push('Store category is required');
    } else if (!this.isValidCategory(storeData.category)) {
      errors.push('Invalid store category selected');
    }

    // Business hours validation
    if (storeData.businessHours && !this.isValidBusinessHours(storeData.businessHours)) {
      errors.push('Invalid business hours format');
    }

    // Bangladesh-specific validations
    if (storeData.division && !this.isValidBangladeshDivision(storeData.division)) {
      errors.push('Invalid Bangladesh division');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate store update data
   */
  async validateStoreUpdate(updateData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Optional field validations (only validate if provided)
    if (updateData.storeName !== undefined) {
      if (!updateData.storeName || updateData.storeName.trim().length === 0) {
        errors.push('Store name cannot be empty');
      } else if (updateData.storeName.length < 3) {
        errors.push('Store name must be at least 3 characters long');
      } else if (updateData.storeName.length > 100) {
        errors.push('Store name must not exceed 100 characters');
      }
    }

    if (updateData.storeDescription !== undefined) {
      if (!updateData.storeDescription || updateData.storeDescription.trim().length === 0) {
        errors.push('Store description cannot be empty');
      } else if (updateData.storeDescription.length < 20) {
        errors.push('Store description must be at least 20 characters long');
      } else if (updateData.storeDescription.length > 1000) {
        errors.push('Store description must not exceed 1000 characters');
      }
    }

    if (updateData.storeUrl !== undefined) {
      if (!this.isValidStoreUrl(updateData.storeUrl)) {
        errors.push('Store URL must contain only lowercase letters, numbers, and hyphens');
      }
      if (updateData.storeUrl.length < 3 || updateData.storeUrl.length > 50) {
        errors.push('Store URL must be between 3 and 50 characters');
      }
    }

    if (updateData.phoneNumber !== undefined && !this.isValidBangladeshPhone(updateData.phoneNumber)) {
      errors.push('Invalid Bangladesh phone number format');
    }

    if (updateData.email !== undefined && !this.isValidEmail(updateData.email)) {
      errors.push('Invalid email address format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate store design data
   */
  async validateStoreDesign(designData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Theme validation
    if (designData.theme && !this.isValidTheme(designData.theme)) {
      errors.push('Invalid theme selected');
    }

    // Layout validation
    if (designData.layout && !this.isValidLayout(designData.layout)) {
      errors.push('Invalid layout selected');
    }

    // Colors validation
    if (designData.colors) {
      if (designData.colors.primary && !this.isValidColor(designData.colors.primary)) {
        errors.push('Invalid primary color format');
      }
      if (designData.colors.secondary && !this.isValidColor(designData.colors.secondary)) {
        errors.push('Invalid secondary color format');
      }
      if (designData.colors.accent && !this.isValidColor(designData.colors.accent)) {
        errors.push('Invalid accent color format');
      }
    }

    // Typography validation
    if (designData.typography) {
      if (designData.typography.headingFont && !this.isValidFont(designData.typography.headingFont)) {
        errors.push('Invalid heading font');
      }
      if (designData.typography.bodyFont && !this.isValidFont(designData.typography.bodyFont)) {
        errors.push('Invalid body font');
      }
    }

    // Custom CSS validation
    if (designData.customCSS && designData.customCSS.length > 10000) {
      errors.push('Custom CSS must not exceed 10,000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate logo file
   */
  async validateLogoFile(file: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('Logo must be a JPEG, PNG, or SVG file');
    }

    // File size validation (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('Logo file size must not exceed 2MB');
    }

    // File dimensions validation (would require image processing library in production)
    // For now, we'll add basic validation
    if (file.size < 1000) {
      errors.push('Logo file appears to be too small or corrupted');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate banner file
   */
  async validateBannerFile(file: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('Banner must be a JPEG or PNG file');
    }

    // File size validation (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('Banner file size must not exceed 5MB');
    }

    // File dimensions validation (basic check)
    if (file.size < 5000) {
      errors.push('Banner file appears to be too small or corrupted');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate SEO settings
   */
  async validateSEOSettings(seoData: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Title validation
    if (seoData.title) {
      if (seoData.title.length > 60) {
        errors.push('SEO title should not exceed 60 characters for optimal display');
      }
      if (seoData.title.length < 10) {
        errors.push('SEO title should be at least 10 characters long');
      }
    }

    // Description validation
    if (seoData.description) {
      if (seoData.description.length > 160) {
        errors.push('SEO description should not exceed 160 characters for optimal display');
      }
      if (seoData.description.length < 50) {
        errors.push('SEO description should be at least 50 characters long');
      }
    }

    // Keywords validation
    if (seoData.keywords) {
      const keywordArray = Array.isArray(seoData.keywords) 
        ? seoData.keywords 
        : seoData.keywords.split(',').map((k: string) => k.trim());
      
      if (keywordArray.length > 10) {
        errors.push('Maximum 10 keywords are recommended for SEO');
      }
      
      const tooLongKeywords = keywordArray.filter((keyword: string) => keyword.length > 50);
      if (tooLongKeywords.length > 0) {
        errors.push('Each keyword should not exceed 50 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate business hours
   */
  async validateBusinessHours(businessHours: any): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!businessHours || typeof businessHours !== 'object') {
      errors.push('Business hours must be an object');
      return { isValid: false, errors };
    }

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of daysOfWeek) {
      if (businessHours[day]) {
        if (!this.isValidDaySchedule(businessHours[day])) {
          errors.push(`Invalid schedule format for ${day}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper validation methods

  /**
   * Check if store URL is valid
   */
  private isValidStoreUrl(url: string): boolean {
    const urlPattern = /^[a-z0-9-]+$/;
    return urlPattern.test(url) && !url.startsWith('-') && !url.endsWith('-');
  }

  /**
   * Check if category is valid
   */
  private isValidCategory(category: string): boolean {
    const validCategories = [
      'electronics', 'clothing', 'home-garden', 'health-beauty', 'sports-outdoors',
      'books-media', 'toys-games', 'automotive', 'food-beverages', 'jewelry-accessories',
      'business-industrial', 'handmade', 'services', 'others'
    ];
    return validCategories.includes(category);
  }

  /**
   * Check if business hours format is valid
   */
  private isValidBusinessHours(businessHours: any): boolean {
    if (!businessHours || typeof businessHours !== 'object') {
      return false;
    }

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of daysOfWeek) {
      if (businessHours[day] && !this.isValidDaySchedule(businessHours[day])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if day schedule is valid
   */
  private isValidDaySchedule(daySchedule: any): boolean {
    if (!daySchedule || typeof daySchedule !== 'object') {
      return false;
    }

    if (daySchedule.isClosed === true) {
      return true;
    }

    if (!daySchedule.openTime || !daySchedule.closeTime) {
      return false;
    }

    const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timePattern.test(daySchedule.openTime) && timePattern.test(daySchedule.closeTime);
  }

  /**
   * Check if Bangladesh division is valid
   */
  private isValidBangladeshDivision(division: string): boolean {
    const validDivisions = [
      'dhaka', 'chittagong', 'sylhet', 'barisal', 'khulna', 'rajshahi', 'rangpur', 'mymensingh'
    ];
    return validDivisions.includes(division.toLowerCase());
  }

  /**
   * Check if theme is valid
   */
  private isValidTheme(theme: string): boolean {
    const validThemes = ['default', 'modern', 'classic', 'minimal', 'dark', 'colorful'];
    return validThemes.includes(theme);
  }

  /**
   * Check if layout is valid
   */
  private isValidLayout(layout: string): boolean {
    const validLayouts = ['grid', 'list', 'masonry', 'carousel'];
    return validLayouts.includes(layout);
  }

  /**
   * Check if color format is valid (hex, rgb, hsl)
   */
  private isValidColor(color: string): boolean {
    // Hex color validation
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexPattern.test(color)) {
      return true;
    }

    // RGB color validation
    const rgbPattern = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
    if (rgbPattern.test(color)) {
      const matches = color.match(rgbPattern);
      if (matches) {
        const [, r, g, b] = matches;
        return parseInt(r) <= 255 && parseInt(g) <= 255 && parseInt(b) <= 255;
      }
    }

    // HSL color validation
    const hslPattern = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/;
    if (hslPattern.test(color)) {
      const matches = color.match(hslPattern);
      if (matches) {
        const [, h, s, l] = matches;
        return parseInt(h) <= 360 && parseInt(s) <= 100 && parseInt(l) <= 100;
      }
    }

    // Named colors (basic set)
    const namedColors = ['red', 'blue', 'green', 'black', 'white', 'gray', 'yellow', 'purple', 'orange', 'pink'];
    return namedColors.includes(color.toLowerCase());
  }

  /**
   * Check if font is valid
   */
  private isValidFont(font: string): boolean {
    const validFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Trebuchet MS',
      'Impact', 'Comic Sans MS', 'Palatino', 'Lucida', 'Tahoma', 'Geneva',
      'Open Sans', 'Roboto', 'Lato', 'Montserrat', 'Poppins', 'Nunito'
    ];
    return validFonts.includes(font);
  }

  /**
   * Check if Bangladesh phone number is valid
   */
  private isValidBangladeshPhone(phone: string): boolean {
    // Bangladesh phone number patterns
    const patterns = [
      /^(\+88)?01[3-9]\d{8}$/, // Mobile numbers
      /^(\+88)?02\d{7,8}$/, // Dhaka landline
      /^(\+88)?0[3-9]\d{7,8}$/ // Other landlines
    ];
    
    return patterns.some(pattern => pattern.test(phone));
  }

  /**
   * Check if email format is valid
   */
  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email) && email.length <= 254;
  }
}
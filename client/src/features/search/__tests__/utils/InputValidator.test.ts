/**
 * InputValidator Unit Tests
 * Phase 6: Comprehensive Testing - Validation Layer
 */

import { InputValidator } from '../../services/validation/InputValidator';
import '../setup';

describe('InputValidator', () => {
  let validator: InputValidator;

  beforeEach(() => {
    validator = new InputValidator();
  });

  describe('validateSearchInput', () => {
    it('should validate normal search queries', () => {
      const result = validator.validateSearchInput('laptop computer');

      expect(result.isValid).toBe(true);
      expect(result.sanitizedInput).toBe('laptop computer');
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should reject empty or whitespace-only queries', () => {
      const emptyResult = validator.validateSearchInput('');
      const whitespaceResult = validator.validateSearchInput('   ');

      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.errors).toContain('Search query cannot be empty');

      expect(whitespaceResult.isValid).toBe(false);
      expect(whitespaceResult.errors).toContain('Search query cannot be empty');
    });

    it('should reject queries that are too long', () => {
      const longQuery = 'a'.repeat(1001);
      const result = validator.validateSearchInput(longQuery);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Search query is too long (max 1000 characters)');
    });

    it('should reject queries that are too short', () => {
      const result = validator.validateSearchInput('a');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Search query is too short (min 2 characters)');
    });

    it('should detect and prevent XSS attacks', () => {
      const xssInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        'onclick="alert(1)"',
      ];

      xssInputs.forEach(xssInput => {
        const result = validator.validateSearchInput(xssInput);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid characters detected in search query');
      });
    });

    it('should detect SQL injection attempts', () => {
      const sqlInputs = [
        "'; DROP TABLE users; --",
        '1; DELETE FROM products',
        "' OR '1'='1",
        'UNION SELECT * FROM users',
        '1\' OR 1=1#',
      ];

      sqlInputs.forEach(sqlInput => {
        const result = validator.validateSearchInput(sqlInput);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid characters detected in search query');
      });
    });

    it('should allow Bengali text', () => {
      const bengaliQuery = 'মোবাইল ফোন';
      const result = validator.validateSearchInput(bengaliQuery);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedInput).toBe(bengaliQuery);
    });

    it('should allow mixed Bengali and English', () => {
      const mixedQuery = 'Samsung মোবাইল phone';
      const result = validator.validateSearchInput(mixedQuery);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedInput).toBe(mixedQuery);
    });

    it('should sanitize excessive whitespace', () => {
      const result = validator.validateSearchInput('  laptop   computer  ');

      expect(result.isValid).toBe(true);
      expect(result.sanitizedInput).toBe('laptop computer');
    });

    it('should allow common punctuation and symbols', () => {
      const validInputs = [
        'iPhone 15 Pro',
        'Samsung Galaxy S24+',
        'MacBook Pro 13"',
        'Price: $999',
        'laptop (gaming)',
        'WiFi 802.11ac',
        'USB-C cable',
        'phone & accessories',
      ];

      validInputs.forEach(input => {
        const result = validator.validateSearchInput(input);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedInput).toBe(input);
      });
    });

    it('should provide warnings for potentially problematic queries', () => {
      const result = validator.validateSearchInput('a'.repeat(500));

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Search query is quite long and may return too many results');
    });

    it('should handle special characters in product names', () => {
      const specialInputs = [
        'C++ programming',
        'F# language',
        'A+ certification',
        'B&O speakers',
        'AT&T phone',
      ];

      specialInputs.forEach(input => {
        const result = validator.validateSearchInput(input);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject queries with excessive special characters', () => {
      const result = validator.validateSearchInput('!!!@@@###$$$%%%^^^&&&***');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Search query contains too many special characters');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = 'laptop <b>computer</b>';
      const result = validator.sanitizeInput(input);

      expect(result).toBe('laptop computer');
    });

    it('should remove script content', () => {
      const input = 'search<script>alert("xss")</script>query';
      const result = validator.sanitizeInput(input);

      expect(result).toBe('searchquery');
    });

    it('should normalize whitespace', () => {
      const input = '  laptop\t\ncomputer  ';
      const result = validator.sanitizeInput(input);

      expect(result).toBe('laptop computer');
    });

    it('should preserve Bengali characters', () => {
      const input = '  মোবাইল   ফোন  ';
      const result = validator.sanitizeInput(input);

      expect(result).toBe('মোবাইল ফোন');
    });

    it('should handle empty input', () => {
      const result = validator.sanitizeInput('');
      expect(result).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(validator.sanitizeInput(null as any)).toBe('');
      expect(validator.sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('isValidSearchQuery', () => {
    it('should return true for valid queries', () => {
      expect(validator.isValidSearchQuery('laptop')).toBe(true);
      expect(validator.isValidSearchQuery('মোবাইল ফোন')).toBe(true);
      expect(validator.isValidSearchQuery('iPhone 15 Pro')).toBe(true);
    });

    it('should return false for invalid queries', () => {
      expect(validator.isValidSearchQuery('')).toBe(false);
      expect(validator.isValidSearchQuery('a')).toBe(false);
      expect(validator.isValidSearchQuery('<script>alert("xss")</script>')).toBe(false);
      expect(validator.isValidSearchQuery('a'.repeat(1001))).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(validator.isValidSearchQuery(null as any)).toBe(false);
      expect(validator.isValidSearchQuery(undefined as any)).toBe(false);
    });
  });

  describe('detectThreats', () => {
    it('should detect XSS threats', () => {
      const threats = validator.detectThreats('<script>alert("xss")</script>');
      expect(threats).toContain('xss');
    });

    it('should detect SQL injection threats', () => {
      const threats = validator.detectThreats("'; DROP TABLE users; --");
      expect(threats).toContain('sql_injection');
    });

    it('should detect suspicious patterns', () => {
      const threats = validator.detectThreats('javascript:alert(1)');
      expect(threats).toContain('xss');
    });

    it('should return empty array for safe input', () => {
      const threats = validator.detectThreats('laptop computer');
      expect(threats).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle Unicode characters', () => {
      const unicodeQuery = '🔥 hot deals 🔥';
      const result = validator.validateSearchInput(unicodeQuery);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedInput).toBe(unicodeQuery);
    });

    it('should handle numeric queries', () => {
      const numericQuery = '12345';
      const result = validator.validateSearchInput(numericQuery);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedInput).toBe(numericQuery);
    });

    it('should handle queries with only numbers and spaces', () => {
      const result = validator.validateSearchInput('123 456 789');

      expect(result.isValid).toBe(true);
      expect(result.sanitizedInput).toBe('123 456 789');
    });

    it('should reject queries with only special characters', () => {
      const result = validator.validateSearchInput('!@#$%^&*()');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Search query contains too many special characters');
    });

    it('should handle very long valid queries', () => {
      const longValidQuery = 'laptop computer gaming high performance graphics card processor memory storage' + ' word'.repeat(50);
      const result = validator.validateSearchInput(longValidQuery);

      // Should be valid but with warnings
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should validate large inputs efficiently', () => {
      const largeInput = 'laptop computer '.repeat(50);
      const startTime = performance.now();
      
      validator.validateSearchInput(largeInput);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple validations efficiently', () => {
      const queries = [
        'laptop',
        'mobile phone',
        'tablet computer',
        'gaming console',
        'smart watch',
      ];

      const startTime = performance.now();
      
      queries.forEach(query => {
        validator.validateSearchInput(query);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete all validations quickly
      expect(duration).toBeLessThan(50);
    });
  });
});
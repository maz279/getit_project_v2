/**
 * Input Validation Services
 * Extracted from AISearchBar for better maintainability and reusability
 */

import { VALIDATION_PATTERNS, SEARCH_CONFIG, HTML_ENTITIES } from '../../constants/searchConstants';
import type { ValidationResult, ValidationRule } from '../../components/AISearchBar/AISearchBar.types';

export class InputValidator {
  public static validate(input: string, forSearch: boolean = false): { isValid: boolean; sanitizedInput: string; risks: string[] } {
    const risks: string[] = [];
    
    // Basic validation
    if (typeof input !== 'string') {
      return { isValid: false, sanitizedInput: '', risks: ['Invalid input type'] };
    }
    
    // Only check minimum length when validating for search, not for input typing
    if (forSearch && input.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      return { isValid: false, sanitizedInput: input, risks: ['Search query too short'] };
    }
    
    if (input.length > SEARCH_CONFIG.MAX_QUERY_LENGTH) {
      return { 
        isValid: false, 
        sanitizedInput: input.substring(0, SEARCH_CONFIG.MAX_QUERY_LENGTH), 
        risks: ['Input too long'] 
      };
    }
    
    // Security validation - XSS patterns
    for (const pattern of VALIDATION_PATTERNS.DANGEROUS_XSS) {
      if (pattern.test(input)) {
        risks.push('Potentially dangerous content detected');
        break;
      }
    }

    // SQL injection validation
    for (const pattern of VALIDATION_PATTERNS.SQL_INJECTION) {
      if (pattern.test(input)) {
        risks.push('SQL injection attempt detected');
        break;
      }
    }
    
    // Character validation only for search submission, not for input typing
    if (forSearch && input.length > 0 && !VALIDATION_PATTERNS.VALID_CHARS.test(input)) {
      risks.push('Invalid characters detected');
    }
    
    // Enhanced sanitization with HTML entity encoding
    let sanitizedInput = input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/["']/g, "'") // Normalize quotes
      .trim();

    // HTML entity encoding for enhanced security
    sanitizedInput = this.encodeHTMLEntities(sanitizedInput);

    return {
      isValid: risks.length === 0,
      sanitizedInput,
      risks,
    };
  }

  private static encodeHTMLEntities(text: string): string {
    return text.replace(/[&<>"'\/]/g, (match) => HTML_ENTITIES[match as keyof typeof HTML_ENTITIES] || match);
  }

  public static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export class AdvancedInputValidator {
  public static validateInput(input: string): ValidationResult {
    const risks: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check for dangerous patterns
    for (const pattern of VALIDATION_PATTERNS.DANGEROUS_XSS) {
      if (pattern.test(input)) {
        risks.push('Potential XSS attack detected');
        severity = 'critical';
        break;
      }
    }

    // Check for SQL injection patterns
    for (const pattern of VALIDATION_PATTERNS.SQL_INJECTION) {
      if (pattern.test(input)) {
        risks.push('SQL injection attempt detected');
        severity = severity === 'critical' ? 'critical' : 'high';
        break;
      }
    }

    // Check input length
    if (input.length > SEARCH_CONFIG.MAX_QUERY_LENGTH) {
      risks.push('Input length exceeds maximum allowed');
      severity = severity === 'critical' ? 'critical' : 'medium';
    }

    // Enhanced sanitization with HTML entity encoding
    let sanitizedInput = input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/["']/g, "'") // Normalize quotes
      .trim();

    // HTML entity encoding
    sanitizedInput = this.encodeHTMLEntities(sanitizedInput);

    return {
      isValid: risks.length === 0 || severity === 'low',
      errors: risks,
      severity,
      sanitizedInput
    };
  }

  private static encodeHTMLEntities(text: string): string {
    return text.replace(/[&<>"'\/]/g, (match) => HTML_ENTITIES[match as keyof typeof HTML_ENTITIES] || match);
  }

  public static createValidationRule(
    pattern: RegExp, 
    message: string, 
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): ValidationRule {
    return { pattern, message, severity };
  }

  public static validateWithRules(input: string, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    for (const rule of rules) {
      if (rule.pattern.test(input)) {
        errors.push(rule.message);
        if (this.getSeverityLevel(rule.severity) > this.getSeverityLevel(maxSeverity)) {
          maxSeverity = rule.severity;
        }
      }
    }

    const sanitizedInput = this.encodeHTMLEntities(input.trim());

    return {
      isValid: errors.length === 0,
      errors,
      severity: maxSeverity,
      sanitizedInput
    };
  }

  private static getSeverityLevel(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    const levels = { low: 1, medium: 2, high: 3, critical: 4 };
    return levels[severity];
  }
}
/**
 * Customer Journey Module Index
 * Amazon.com/Shopee.sg-Level Customer Journey Components
 * Implements the complete 5 A's Framework (Aware→Appeal→Ask→Act→Advocate)
 */

// Amazon 5 A's Framework Components
export { default as AIPersonalizationEngine } from './aware/AIPersonalizationEngine';
export { default as DynamicPricingEngine } from './appeal/DynamicPricingEngine';
export { default as AdvancedSearchInterface } from './ask/AdvancedSearchInterface';
export { default as OneClickCheckoutSystem } from './act/OneClickCheckoutSystem';
export { default as CustomerLoyaltyEngine } from './advocate/CustomerLoyaltyEngine';

// Journey Stage Exports
export * from './aware';
export * from './appeal';
export * from './ask';
export * from './act';
export * from './advocate';
/**
 * Customer Account Module Index
 * Consolidates all account management components (Profile, Orders, Wishlist)
 */

export { default as CustomerAccountHub } from './CustomerAccountHub';

// Re-export account-related components
export * from './ProfileSettings';
export * from './OrderHistory';
export * from './WishlistManager';
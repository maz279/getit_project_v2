/**
 * Customer Deals Module Index
 * Consolidates all deal-related components - SINGLE SOURCE OF TRUTH
 */

// Core Deal Components (CONSOLIDATED)
export { default as DealsHub } from './DealsHub';
export { TodaysDeals } from './TodaysDeals';
export { DailyOffers } from './DailyOffers';
export { DealCategories } from './DealCategories';
export { DealCountdown } from './DealCountdown';
export { UpcomingDeals } from './UpcomingDeals';

// Flash Sales Components  
export * from './flash-sales/FlashSaleHero';
export * from './flash-sales/FlashSaleProductGrid';

// Mega Sales Components
export * from './mega-sales/MegaSaleHero';

// Daily Deals Components
export * from './daily-deals/TodaysHighlightsSection';
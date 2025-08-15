/**
 * Vendor Utility Functions - Amazon.com/Shopee.sg Level Utilities
 * Enterprise-grade utility functions for vendor operations
 */

import { VendorKYCStatus, VendorStatus } from '../types/vendor.types';

/**
 * Generate unique vendor ID with Bangladesh prefix
 */
export const generateVendorId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BD-VENDOR-${timestamp}-${random}`;
};

/**
 * Generate KYC reference number
 */
export const generateKYCReference = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KYC-${timestamp}-${random}`;
};

/**
 * Generate payout reference number
 */
export const generatePayoutReference = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAYOUT-${timestamp}-${random}`;
};

/**
 * Validate Bangladesh mobile number
 */
export const isValidBangladeshMobile = (mobile: string): boolean => {
  const pattern = /^(\+8801|8801|01)[3-9]\d{8}$/;
  return pattern.test(mobile);
};

/**
 * Validate Bangladesh NID (National ID)
 */
export const isValidBangladeshNID = (nid: string): boolean => {
  // Bangladesh NID can be 10, 13, or 17 digits
  const pattern = /^[0-9]{10}$|^[0-9]{13}$|^[0-9]{17}$/;
  return pattern.test(nid);
};

/**
 * Validate Bangladesh TIN (Tax Identification Number)
 */
export const isValidBangladeshTIN = (tin: string): boolean => {
  const pattern = /^[0-9]{12}$/;
  return pattern.test(tin);
};

/**
 * Format currency amount for Bangladesh (BDT)
 */
export const formatBDTAmount = (amount: number): string => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format percentage with proper localization
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate commission amount based on rate
 */
export const calculateCommission = (amount: number, rate: number): number => {
  return Math.round((amount * rate / 100) * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate vendor payout amount (total - commission - fees)
 */
export const calculatePayoutAmount = (
  totalAmount: number, 
  commissionRate: number, 
  processingFee: number = 0
): { payout: number; commission: number; fee: number } => {
  const commission = calculateCommission(totalAmount, commissionRate);
  const fee = processingFee;
  const payout = totalAmount - commission - fee;
  
  return {
    payout: Math.max(0, payout),
    commission,
    fee
  };
};

/**
 * Check if vendor can request payout
 */
export const canRequestPayout = (
  currentBalance: number,
  minimumPayout: number = 500,
  kycStatus: VendorKYCStatus,
  vendorStatus: VendorStatus
): { canRequest: boolean; reason?: string } => {
  if (vendorStatus !== 'active') {
    return { canRequest: false, reason: 'Vendor account is not active' };
  }
  
  if (kycStatus !== 'approved') {
    return { canRequest: false, reason: 'KYC verification is required' };
  }
  
  if (currentBalance < minimumPayout) {
    return { 
      canRequest: false, 
      reason: `Minimum payout amount is ${formatBDTAmount(minimumPayout)}` 
    };
  }
  
  return { canRequest: true };
};

/**
 * Get vendor status color for UI display
 */
export const getVendorStatusColor = (status: VendorStatus): string => {
  const colors = {
    pending: '#f59e0b', // amber
    active: '#10b981',  // emerald
    suspended: '#ef4444', // red
    rejected: '#6b7280'   // gray
  };
  
  return colors[status] || colors.pending;
};

/**
 * Get KYC status color for UI display
 */
export const getKYCStatusColor = (status: VendorKYCStatus): string => {
  const colors = {
    pending: '#f59e0b',    // amber
    approved: '#10b981',   // emerald
    rejected: '#ef4444',   // red
    under_review: '#3b82f6' // blue
  };
  
  return colors[status] || colors.pending;
};

/**
 * Generate vendor analytics summary
 */
export const generateAnalyticsSummary = (data: {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;
}): string => {
  const { totalSales, totalOrders, totalProducts, averageOrderValue, conversionRate } = data;
  
  const salesFormatted = formatBDTAmount(totalSales);
  const aovFormatted = formatBDTAmount(averageOrderValue);
  const conversionFormatted = formatPercentage(conversionRate);
  
  return `Total Sales: ${salesFormatted} | Orders: ${totalOrders} | Products: ${totalProducts} | AOV: ${aovFormatted} | Conversion: ${conversionFormatted}`;
};

/**
 * Validate business registration number format
 */
export const isValidBusinessRegistration = (registrationNumber: string): boolean => {
  // Bangladesh business registration can have various formats
  // This is a basic validation - in production, this would connect to government APIs
  return registrationNumber.length >= 5 && registrationNumber.length <= 50;
};

/**
 * Validate trade license number format
 */
export const isValidTradeLicense = (licenseNumber: string): boolean => {
  // Trade license validation - in production, this would connect to relevant authorities
  return licenseNumber.length >= 5 && licenseNumber.length <= 50;
};

/**
 * Get Bangladesh bank list for validation
 */
export const getBangladeshBanks = (): string[] => {
  return [
    'Sonali Bank Limited',
    'Janata Bank Limited',
    'Agrani Bank Limited',
    'Rupali Bank Limited',
    'BASIC Bank Limited',
    'Bangladesh Development Bank Limited',
    'Dutch-Bangla Bank Limited',
    'BRAC Bank Limited',
    'Eastern Bank Limited',
    'IFIC Bank Limited',
    'Mutual Trust Bank Limited',
    'Prime Bank Limited',
    'City Bank Limited',
    'Southeast Bank Limited',
    'Standard Bank Limited',
    'Islami Bank Bangladesh Limited',
    'Al-Arafah Islami Bank Limited',
    'Social Islami Bank Limited',
    'Trust Bank Limited',
    'Bank Asia Limited',
    'The City Bank Limited',
    'National Credit & Commerce Bank Limited',
    'United Commercial Bank Limited',
    'Uttara Bank Limited',
    'National Bank Limited',
    'IFIC Bank Limited',
    'Mercantile Bank Limited',
    'Pubali Bank Limited',
    'AB Bank Limited',
    'One Bank Limited',
    'EXIM Bank Limited',
    'Shahjalal Islami Bank Limited',
    'First Security Islami Bank Limited',
    'Union Bank Limited',
    'Bangladesh Commerce Bank Limited',
    'Modhumoti Bank Limited',
    'South Bangla Agriculture & Commerce Bank Limited',
    'NRB Commercial Bank Limited',
    'NRB Bank Limited',
    'Midland Bank Limited',
    'Community Bank Bangladesh Limited'
  ];
};

/**
 * Check if bank name is valid Bangladesh bank
 */
export const isValidBangladeshBank = (bankName: string): boolean => {
  const banks = getBangladeshBanks();
  return banks.some(bank => 
    bank.toLowerCase().includes(bankName.toLowerCase()) || 
    bankName.toLowerCase().includes(bank.toLowerCase())
  );
};

/**
 * Generate vendor performance score based on metrics
 */
export const calculateVendorPerformanceScore = (metrics: {
  orderFulfillmentRate: number;  // 0-100
  customerRating: number;        // 0-5
  responseTime: number;          // hours
  returnRate: number;            // 0-100
  onTimeDeliveryRate: number;    // 0-100
}): { score: number; grade: string; recommendations: string[] } => {
  const { orderFulfillmentRate, customerRating, responseTime, returnRate, onTimeDeliveryRate } = metrics;
  
  // Weighted scoring algorithm
  const fulfillmentScore = Math.min(orderFulfillmentRate, 100) * 0.25;
  const ratingScore = (customerRating / 5) * 100 * 0.25;
  const responseScore = Math.max(0, 100 - (responseTime * 5)) * 0.15; // Penalty for slow response
  const returnScore = Math.max(0, 100 - returnRate) * 0.15; // Lower return rate is better
  const deliveryScore = Math.min(onTimeDeliveryRate, 100) * 0.20;
  
  const totalScore = fulfillmentScore + ratingScore + responseScore + returnScore + deliveryScore;
  
  let grade: string;
  let recommendations: string[] = [];
  
  if (totalScore >= 90) {
    grade = 'A+';
  } else if (totalScore >= 80) {
    grade = 'A';
  } else if (totalScore >= 70) {
    grade = 'B';
    recommendations.push('Focus on improving customer satisfaction');
  } else if (totalScore >= 60) {
    grade = 'C';
    recommendations.push('Improve order fulfillment rate');
    recommendations.push('Reduce response time to customer inquiries');
  } else {
    grade = 'D';
    recommendations.push('Urgent improvement needed in all areas');
    recommendations.push('Consider vendor training programs');
    recommendations.push('Review operational processes');
  }
  
  // Specific recommendations based on weak areas
  if (orderFulfillmentRate < 95) {
    recommendations.push('Improve inventory management');
  }
  
  if (customerRating < 4.0) {
    recommendations.push('Focus on product quality and customer service');
  }
  
  if (responseTime > 4) {
    recommendations.push('Reduce customer inquiry response time');
  }
  
  if (returnRate > 10) {
    recommendations.push('Analyze return reasons and improve product descriptions');
  }
  
  if (onTimeDeliveryRate < 90) {
    recommendations.push('Work with shipping partners to improve delivery times');
  }
  
  return {
    score: Math.round(totalScore),
    grade,
    recommendations: [...new Set(recommendations)] // Remove duplicates
  };
};

/**
 * Mask sensitive information for logging
 */
export const maskSensitiveData = (data: any): any => {
  const sensitiveFields = ['password', 'pin', 'secret', 'token', 'key', 'nid', 'tin', 'accountNumber'];
  
  if (typeof data === 'string') {
    return data.length > 4 ? `${data.substring(0, 2)}***${data.substring(data.length - 2)}` : '***';
  }
  
  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }
  
  if (data && typeof data === 'object') {
    const masked: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          masked[key] = '***';
        } else {
          masked[key] = maskSensitiveData(data[key]);
        }
      }
    }
    return masked;
  }
  
  return data;
};
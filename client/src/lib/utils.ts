import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check if it's a Bangladesh number
  if (digits.startsWith('880')) {
    // Format as +880 XXXX-XXXXXX
    return `+880 ${digits.slice(3, 7)}-${digits.slice(7)}`;
  } else if (digits.startsWith('01') && digits.length === 11) {
    // Format local Bangladesh number as +880 XXXX-XXXXXX
    return `+880 ${digits.slice(1, 5)}-${digits.slice(5)}`;
  }
  
  return phone; // Return original if not a recognized format
}

export function validateBangladeshPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  
  // Check if it's a valid Bangladesh mobile number
  return (
    (digits.startsWith('880') && digits.length === 13) ||
    (digits.startsWith('01') && digits.length === 11)
  );
}
/**
 * WhatsApp OTP Service for Frontend
 * Handles WhatsApp verification for international phone numbers
 */

interface WhatsAppOTPResponse {
  success: boolean;
  message: string;
  notificationId?: string;
  expiresIn?: string;
  expiresAt?: string;
  phoneNumber?: string;
  countryCode?: string;
  method?: string;
  whatsappStatus?: string;
  whatsappMessageId?: string;
  devOtp?: string;
  error?: string;
}

interface WhatsAppOTPVerifyResponse {
  success: boolean;
  message: string;
  verified?: boolean;
  phoneNumber?: string;
  error?: string;
}

export async function sendWhatsAppOtp(phone: string, type: string = 'registration', language: string = 'en'): Promise<WhatsAppOTPResponse> {
  console.log(`🔧 DEBUG: sendWhatsAppOtp called with phone: "${phone}"`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const requestBody = {
      phone,
      type,
      language,
      expiryMinutes: 2
    };
    
    console.log(`🔧 DEBUG: WhatsApp request body:`, requestBody);
    
    const response = await fetch('/api/v1/notifications/whatsapp/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log(`🔧 DEBUG: WhatsApp response status:`, response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`🔧 DEBUG: WhatsApp error response:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log(`🔧 DEBUG: WhatsApp response data:`, responseData);
    
    return responseData;
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('❌ WhatsApp OTP send failed:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    throw new Error(error.message || 'Failed to send WhatsApp OTP');
  }
}

export async function verifyWhatsAppOtp(phone: string, otp: string): Promise<WhatsAppOTPVerifyResponse> {
  console.log(`🔧 DEBUG: verifyWhatsAppOtp called with phone: "${phone}", otp: "${otp}"`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const requestBody = {
      phone,
      otp
    };
    
    console.log(`🔧 DEBUG: WhatsApp verify request body:`, requestBody);
    
    const response = await fetch('/api/v1/notifications/sms/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log(`🔧 DEBUG: WhatsApp verify response status:`, response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`🔧 DEBUG: WhatsApp verify error response:`, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log(`🔧 DEBUG: WhatsApp verify response data:`, responseData);
    
    return responseData;
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('❌ WhatsApp OTP verification failed:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    throw new Error(error.message || 'Failed to verify WhatsApp OTP');
  }
}
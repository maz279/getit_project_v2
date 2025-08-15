import { toast } from '@/shared/hooks/use-toast';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'mobile_banking' | 'credit_card' | 'digital_wallet';
  provider: string;
  status: 'active' | 'inactive' | 'pending';
  configuration: any;
  fees: {
    fixed: number;
    percentage: number;
  };
}

export interface BankAccount {
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  branchName: string;
  routingNumber: string;
  swiftCode?: string;
  accountType: 'checking' | 'savings' | 'business';
  currency: 'BDT' | 'USD' | 'EUR';
}

export interface MobileBankingAccount {
  provider: 'bkash' | 'nagad' | 'rocket';
  accountNumber: string;
  accountHolderName: string;
  verified: boolean;
  dailyLimit: number;
  monthlyLimit: number;
}

export interface PaymentGateway {
  provider: 'stripe' | 'paypal' | 'sslcommerz' | 'portwallet';
  apiKey: string;
  secretKey: string;
  webhookUrl: string;
  testMode: boolean;
  supportedMethods: string[];
}

export interface ValidationResult {
  valid: boolean;
  validationScore: number;
  validationDetails: ValidationCheck[];
}

export interface ValidationCheck {
  check: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
}

export interface CommissionCalculation {
  transactionAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  paymentMethod: string;
  vendorTier: string;
  breakdown: {
    gross: number;
    commission: number;
    gateway_fee: number;
    net: number;
  };
}

export interface PayoutConfiguration {
  success: boolean;
  payoutMethod: string;
  schedule: 'daily' | 'weekly' | 'monthly';
  minimumAmount: number;
  bankAccount?: BankAccount;
  mobileBanking?: MobileBankingAccount;
  configurationId: string;
  status: string;
  nextPayoutDate: string;
}

export class PaymentIntegrationService {
  private static instance: PaymentIntegrationService;
  private baseUrl = '/api/v1/payment-integration';

  private constructor() {}

  static getInstance(): PaymentIntegrationService {
    if (!PaymentIntegrationService.instance) {
      PaymentIntegrationService.instance = new PaymentIntegrationService();
    }
    return PaymentIntegrationService.instance;
  }

  // Get Available Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-methods`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payment methods',
        variant: 'destructive'
      });
      throw error;
    }
  }

  // Validate Bank Account
  async validateBankAccount(bankAccount: Partial<BankAccount>): Promise<ValidationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-bank-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bankAccount)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating bank account:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate bank account',
        variant: 'destructive'
      });
      throw error;
    }
  }

  // Validate Mobile Banking Account
  async validateMobileBanking(mobileBanking: Partial<MobileBankingAccount>): Promise<ValidationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-mobile-banking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mobileBanking)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating mobile banking:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate mobile banking account',
        variant: 'destructive'
      });
      throw error;
    }
  }

  // Configure Payment Gateway
  async configurePaymentGateway(gateway: Partial<PaymentGateway>): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/configure-payment-gateway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gateway)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error configuring payment gateway:', error);
      toast({
        title: 'Error',
        description: 'Failed to configure payment gateway',
        variant: 'destructive'
      });
      throw error;
    }
  }

  // Calculate Commission
  async calculateCommission(transactionAmount: number, paymentMethod: string, vendorTier: string): Promise<CommissionCalculation> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate-commission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionAmount,
          paymentMethod,
          vendorTier
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error calculating commission:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate commission',
        variant: 'destructive'
      });
      throw error;
    }
  }

  // Configure Payout
  async configurePayout(payoutConfig: any): Promise<PayoutConfiguration> {
    try {
      const response = await fetch(`${this.baseUrl}/configure-payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payoutConfig)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error configuring payout:', error);
      toast({
        title: 'Error',
        description: 'Failed to configure payout',
        variant: 'destructive'
      });
      throw error;
    }
  }

  // Get Payment History
  async getPaymentHistory(vendorId: string, limit: number = 10, offset: number = 0): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-history?vendorId=${vendorId}&limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payment history',
        variant: 'destructive'
      });
      throw error;
    }
  }

  // Validate Financial Data
  async validateFinancialData(vendorData: any, paymentMethods: any[], bankAccounts: any[]): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-financial-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendorData,
          paymentMethods,
          bankAccounts
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating financial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate financial data',
        variant: 'destructive'
      });
      throw error;
    }
  }

  // Format Currency
  formatCurrency(amount: number, currency: string = 'BDT'): string {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Get Payment Method Icon
  getPaymentMethodIcon(paymentMethod: string): string {
    const icons = {
      'bkash': '🟦',
      'nagad': '🟠',
      'rocket': '🟣',
      'bank_transfer': '🏦',
      'stripe': '💳',
      'paypal': '🅿️',
      'sslcommerz': '🔒',
      'portwallet': '💰'
    };
    return icons[paymentMethod] || '💳';
  }

  // Get Payment Method Color
  getPaymentMethodColor(paymentMethod: string): string {
    const colors = {
      'bkash': '#E2136E',
      'nagad': '#F47920',
      'rocket': '#8B1874',
      'bank_transfer': '#1E40AF',
      'stripe': '#635BFF',
      'paypal': '#003087',
      'sslcommerz': '#16A34A',
      'portwallet': '#7C2D12'
    };
    return colors[paymentMethod] || '#6B7280';
  }
}
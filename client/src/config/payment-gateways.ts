// Bangladesh Payment Gateway Configuration

interface PaymentGateway {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  enabled: boolean;
  testMode?: boolean;
  apiUrl?: {
    sandbox: string;
    production: string;
  };
  currencies: string[];
  minAmount: number;
  maxAmount: number;
  fees: {
    percentage: number;
    fixed: number;
  };
  description: string;
  availableZones?: string[];
  supportedBanks?: string[];
  tenures?: number[];
  interestRates?: Record<number, number>;
}

export const PAYMENT_GATEWAYS: Record<string, PaymentGateway> = {
  BKASH: {
    id: 'bkash',
    name: 'bKash',
    displayName: 'bKash Mobile Banking',
    icon: '/assets/images/payments/bkash-logo.png',
    enabled: true,
    testMode: process.env.NODE_ENV === 'development',
    apiUrl: {
      sandbox: 'https://checkout.sandbox.bka.sh/v1.2.0-beta',
      production: 'https://checkout.pay.bka.sh/v1.2.0-beta'
    },
    currencies: ['BDT'],
    minAmount: 10,
    maxAmount: 25000,
    fees: {
      percentage: 1.85,
      fixed: 0
    },
    description: 'Pay securely with your bKash mobile banking account'
  },
  NAGAD: {
    id: 'nagad',
    name: 'Nagad',
    displayName: 'Nagad Digital Banking',
    icon: '/assets/images/payments/nagad-logo.png',
    enabled: true,
    testMode: process.env.NODE_ENV === 'development',
    apiUrl: {
      sandbox: 'http://sandbox.mynagad.com:10080/remote-payment-gateway-1.0/api/dfs',
      production: 'https://api.mynagad.com/api/dfs'
    },
    currencies: ['BDT'],
    minAmount: 10,
    maxAmount: 50000,
    fees: {
      percentage: 1.99,
      fixed: 0
    },
    description: 'Fast and secure payment with Nagad digital banking'
  },
  ROCKET: {
    id: 'rocket',
    name: 'Rocket',
    displayName: 'Dutch-Bangla Rocket',
    icon: '/assets/images/payments/rocket-logo.png',
    enabled: true,
    testMode: process.env.NODE_ENV === 'development',
    apiUrl: {
      sandbox: 'https://sandbox.rocketpay.com.bd/api',
      production: 'https://api.rocketpay.com.bd/api'
    },
    currencies: ['BDT'],
    minAmount: 10,
    maxAmount: 30000,
    fees: {
      percentage: 1.8,
      fixed: 5
    },
    description: 'Reliable payment solution by Dutch-Bangla Bank'
  },
  COD: {
    id: 'cod',
    name: 'Cash on Delivery',
    displayName: 'Cash on Delivery (COD)',
    icon: '/assets/images/payments/cod-icon.png',
    enabled: true,
    currencies: ['BDT'],
    minAmount: 50,
    maxAmount: 10000,
    fees: {
      percentage: 0,
      fixed: 30
    },
    description: 'Pay in cash when your order is delivered to your doorstep',
    availableZones: ['dhaka', 'chittagong', 'sylhet', 'rajshahi', 'khulna', 'barishal']
  },
  BANK_TRANSFER: {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    displayName: 'Direct Bank Transfer',
    icon: '/assets/images/payments/bank-transfer-icon.png',
    enabled: true,
    currencies: ['BDT'],
    minAmount: 100,
    maxAmount: 500000,
    fees: {
      percentage: 0,
      fixed: 15
    },
    description: 'Transfer directly from your bank account',
    supportedBanks: [
      'Dutch-Bangla Bank',
      'Brac Bank',
      'Eastern Bank',
      'City Bank',
      'Standard Chartered',
      'HSBC Bangladesh',
      'Islami Bank Bangladesh',
      'Prime Bank',
      'Trust Bank',
      'Mutual Trust Bank'
    ]
  },
  EMI: {
    id: 'emi',
    name: 'Installment Payment',
    displayName: 'Easy Monthly Installments (EMI)',
    icon: '/assets/images/payments/emi-icon.png',
    enabled: true,
    currencies: ['BDT'],
    minAmount: 5000,
    maxAmount: 200000,
    fees: {
      percentage: 2.5,
      fixed: 0
    },
    description: 'Pay in easy monthly installments with 0% to 24% interest',
    tenures: [3, 6, 9, 12, 18, 24], // months
    interestRates: {
      3: 0,     // 0% for 3 months
      6: 6,     // 6% annual for 6 months  
      9: 9,     // 9% annual for 9 months
      12: 12,   // 12% annual for 12 months
      18: 15,   // 15% annual for 18 months
      24: 18    // 18% annual for 24 months
    }
  }
};

export const PAYMENT_METHODS = Object.values(PAYMENT_GATEWAYS);

export const DEFAULT_CURRENCY = 'BDT';

export const CURRENCY_SYMBOL = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

export const getPaymentGateway = (gatewayId: string) => {
  return PAYMENT_GATEWAYS[gatewayId.toUpperCase() as keyof typeof PAYMENT_GATEWAYS];
};

export const getEnabledPaymentMethods = () => {
  return PAYMENT_METHODS.filter(method => method.enabled);
};

export const calculatePaymentFee = (gatewayId: string, amount: number) => {
  const gateway = getPaymentGateway(gatewayId);
  if (!gateway) return 0;
  
  const percentageFee = (amount * gateway.fees.percentage) / 100;
  return percentageFee + gateway.fees.fixed;
};

export const formatCurrency = (amount: number, currency: string = 'BDT') => {
  const symbol = CURRENCY_SYMBOL[currency as keyof typeof CURRENCY_SYMBOL] || '৳';
  return `${symbol}${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const isPaymentMethodAvailable = (gatewayId: string, amount: number, zone?: string) => {
  const gateway = getPaymentGateway(gatewayId);
  if (!gateway || !gateway.enabled) return false;
  
  if (amount < gateway.minAmount || amount > gateway.maxAmount) return false;
  
  // Check zone availability for COD
  if (gatewayId === 'cod' && zone && gateway.availableZones) {
    return gateway.availableZones.includes(zone);
  }
  
  return true;
};

export const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh',
  'Comilla', 'Gazipur', 'Narayanganj', 'Tangail', 'Jamalpur', 'Kishoreganj', 'Manikganj',
  'Munshiganj', 'Narsingdi', 'Netrokona', 'Rajbari', 'Shariatpur', 'Sherpur', 'Faridpur',
  'Gopalganj', 'Madaripur', 'Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Kushtia',
  'Magura', 'Meherpur', 'Narail', 'Satkhira', 'Barguna', 'Bhola', 'Jhalokati', 'Patuakhali',
  'Pirojpur', 'Bandarban', 'Brahmanbaria', 'Chandpur', 'Feni', 'Lakshmipur', 'Noakhali',
  'Rangamati', 'Habiganj', 'Moulvibazar', 'Sunamganj', 'Bogra', 'Joypurhat', 'Naogaon',
  'Natore', 'Nawabganj', 'Pabna', 'Sirajganj', 'Dinajpur', 'Gaibandha', 'Kurigram',
  'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon'
];
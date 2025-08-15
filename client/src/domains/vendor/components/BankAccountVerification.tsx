import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { 
  Building, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Loader2,
  Shield,
  Clock,
  MapPin
} from 'lucide-react';
import { PaymentIntegrationService, BankAccount, ValidationResult } from '../services/paymentIntegrationService';

interface BankAccountVerificationProps {
  bankAccount: Partial<BankAccount>;
  onBankAccountUpdate: (account: Partial<BankAccount>) => void;
  onValidationComplete: (result: ValidationResult) => void;
}

export const BankAccountVerification: React.FC<BankAccountVerificationProps> = ({
  bankAccount,
  onBankAccountUpdate,
  onValidationComplete
}) => {
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const paymentService = PaymentIntegrationService.getInstance();

  const bangladeshBanks = [
    { code: 'DBBL', name: 'Dutch-Bangla Bank Limited' },
    { code: 'BRAC', name: 'BRAC Bank Limited' },
    { code: 'CITY', name: 'City Bank Limited' },
    { code: 'EAST', name: 'Eastern Bank Limited' },
    { code: 'MTB', name: 'Mutual Trust Bank Limited' },
    { code: 'PRIME', name: 'Prime Bank Limited' },
    { code: 'PUBALI', name: 'Pubali Bank Limited' },
    { code: 'IFIC', name: 'IFIC Bank Limited' },
    { code: 'MERC', name: 'Mercantile Bank Limited' },
    { code: 'STDCH', name: 'Standard Chartered Bank' },
    { code: 'HSBC', name: 'HSBC Limited' },
    { code: 'TRUST', name: 'Trust Bank Limited' },
    { code: 'SOUTH', name: 'Southeast Bank Limited' },
    { code: 'UCBL', name: 'United Commercial Bank Limited' },
    { code: 'FIRST', name: 'First Security Islami Bank Limited' }
  ];

  const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'business', label: 'Business Account' }
  ];

  const handleInputChange = (field: keyof BankAccount, value: string) => {
    const updatedAccount = { ...bankAccount, [field]: value };
    onBankAccountUpdate(updatedAccount);
  };

  const validateBankAccount = async () => {
    if (!bankAccount.accountNumber || !bankAccount.bankName || !bankAccount.accountHolderName) {
      return;
    }

    setValidating(true);
    try {
      const result = await paymentService.validateBankAccount(bankAccount);
      setValidationResult(result);
      onValidationComplete(result);
    } catch (error) {
      console.error('Bank account validation failed:', error);
      setValidationResult({
        valid: false,
        validationScore: 0,
        validationDetails: [
          {
            check: 'Validation Error',
            status: 'failed',
            message: 'Failed to validate bank account. Please try again.'
          }
        ]
      });
    } finally {
      setValidating(false);
    }
  };

  const formatAccountNumber = (value: string) => {
    // Remove any non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as Bangladesh bank account number (typically 10-20 digits)
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  };

  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const canValidate = bankAccount.accountNumber && bankAccount.bankName && bankAccount.accountHolderName;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Building className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Bank Account Verification</h3>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Required for Payouts
        </Badge>
      </div>

      {/* Bank Account Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Account Information
          </CardTitle>
          <CardDescription>
            Enter your bank account details for payment processing and payouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Select
                value={bankAccount.bankName || ''}
                onValueChange={(value) => handleInputChange('bankName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  {bangladeshBanks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.name}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type *</Label>
              <Select
                value={bankAccount.accountType || ''}
                onValueChange={(value) => handleInputChange('accountType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name *</Label>
            <Input
              id="accountHolderName"
              value={bankAccount.accountHolderName || ''}
              onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
              placeholder="Enter account holder name (as per bank records)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={bankAccount.accountNumber || ''}
                onChange={(e) => {
                  const formatted = formatAccountNumber(e.target.value);
                  handleInputChange('accountNumber', formatted);
                }}
                placeholder="1234-5678-9012-3456"
                maxLength={23}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number *</Label>
              <Input
                id="routingNumber"
                value={bankAccount.routingNumber || ''}
                onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                placeholder="Enter routing number"
                maxLength={9}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branchName">Branch Name *</Label>
              <Input
                id="branchName"
                value={bankAccount.branchName || ''}
                onChange={(e) => handleInputChange('branchName', e.target.value)}
                placeholder="Enter branch name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="swiftCode">SWIFT Code (Optional)</Label>
              <Input
                id="swiftCode"
                value={bankAccount.swiftCode || ''}
                onChange={(e) => handleInputChange('swiftCode', e.target.value)}
                placeholder="Enter SWIFT code for international transfers"
                maxLength={11}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={validateBankAccount}
              disabled={!canValidate || validating}
              className="min-w-[120px]"
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Validate Account
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Validation Result */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.valid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              Validation Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Validation Score</span>
                <Badge 
                  variant={validationResult.validationScore >= 90 ? 'default' : 'destructive'}
                >
                  {validationResult.validationScore}%
                </Badge>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Validation Details</h4>
                {validationResult.validationDetails.map((detail, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {getValidationIcon(detail.status)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{detail.check}</div>
                      <div className="text-sm text-gray-600">{detail.message}</div>
                    </div>
                  </div>
                ))}
              </div>

              {validationResult.valid ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Bank account verified successfully!</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Ready for Payouts
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm">
                      Your bank account has been validated and is ready to receive payments.
                    </p>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold">Bank account validation failed</div>
                    <p className="mt-1 text-sm">
                      Please check your account details and try again. If the problem persists, 
                      contact your bank to verify the account information.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="font-semibold">Important Information</div>
          <ul className="mt-2 text-sm space-y-1">
            <li>• Account holder name must match exactly as per bank records</li>
            <li>• Account must be active and have sufficient transaction history</li>
            <li>• Business accounts are recommended for vendor operations</li>
            <li>• SWIFT code is required for international payments</li>
            <li>• All account information will be encrypted and stored securely</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};
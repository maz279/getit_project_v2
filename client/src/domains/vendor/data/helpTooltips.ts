/**
 * Help Tooltips Data - Vendor Registration Help Content
 * Comprehensive contextual help for all registration steps
 */

export const helpTooltips = {
  // Basic Information Step
  businessName: {
    content: "Enter your official business name as it appears on your legal documents. This will be displayed to customers and used for verification.",
    type: "info" as const,
  },
  businessEmail: {
    content: "Use a professional email address that you actively monitor. This will be used for important notifications and customer communications.",
    type: "info" as const,
  },
  businessPhone: {
    content: "Provide a valid phone number where you can be reached during business hours. Include country code (e.g., +880 for Bangladesh).",
    type: "info" as const,
  },
  businessAddress: {
    content: "Enter your complete business address including street, city, postal code. This will be used for shipping origin and legal verification.",
    type: "info" as const,
  },
  businessType: {
    content: "Select the type that best describes your business. This helps us understand your needs and provide relevant features.",
    type: "help" as const,
  },
  businessCategory: {
    content: "Choose the primary category of products you plan to sell. You can add more categories later from your dashboard.",
    type: "help" as const,
  },

  // Business Verification Step
  businessLicense: {
    content: "Upload a clear photo of your business license or trade license. Accepted formats: JPG, PNG, PDF. Maximum size: 5MB.",
    type: "info" as const,
  },
  taxCertificate: {
    content: "Upload your tax registration certificate (TIN certificate in Bangladesh). This is required for tax compliance.",
    type: "info" as const,
  },
  ownerNID: {
    content: "Upload both front and back of the business owner's National ID card. Ensure all text is clearly visible.",
    type: "info" as const,
  },
  businessRegistration: {
    content: "Upload your business registration certificate from the relevant authority (e.g., RJSC in Bangladesh).",
    type: "info" as const,
  },

  // KYC Documents Step
  bankStatement: {
    content: "Upload a recent bank statement (not older than 3 months) showing your business account details.",
    type: "info" as const,
  },
  utilityBill: {
    content: "Upload a recent utility bill (electricity, gas, water, or phone) from your business address to verify location.",
    type: "info" as const,
  },
  authorizedSignatory: {
    content: "Upload ID documents of all authorized signatories who can make financial decisions for the business.",
    type: "info" as const,
  },
  companyProfile: {
    content: "Upload a company profile or brochure that describes your business, products, and services.",
    type: "help" as const,
  },

  // Payment Setup Step
  bankAccountNumber: {
    content: "Enter your business bank account number. This is where you'll receive payments from sales.",
    type: "info" as const,
  },
  bankName: {
    content: "Select your bank from the dropdown or enter manually if not listed. Ensure it's a registered bank in Bangladesh.",
    type: "info" as const,
  },
  accountHolderName: {
    content: "Enter the exact name as it appears on your bank account. This must match your business name or authorized signatory.",
    type: "info" as const,
  },
  routingNumber: {
    content: "Enter your bank's routing number. This is a 9-digit number that identifies your bank for electronic transfers.",
    type: "info" as const,
  },
  mobileBanking: {
    content: "Add your mobile banking details (bKash, Nagad, Rocket) for faster payments. This is optional but recommended.",
    type: "help" as const,
  },

  // Store Setup Step
  storeName: {
    content: "Choose a unique store name that customers will see. This should be memorable and related to your business.",
    type: "help" as const,
  },
  storeDescription: {
    content: "Write a compelling description of your store and products. This helps customers understand what you offer.",
    type: "help" as const,
  },
  storeLogo: {
    content: "Upload your store logo (recommended size: 200x200 pixels). This will appear on your store page and products.",
    type: "info" as const,
  },
  returnPolicy: {
    content: "Define your return and refund policy. Be clear about time limits, conditions, and process. This builds customer trust.",
    type: "info" as const,
  },
  shippingPolicy: {
    content: "Specify your shipping methods, delivery times, and costs. Include information about free shipping thresholds if applicable.",
    type: "info" as const,
  },

  // Shipping Configuration Step
  shippingZones: {
    content: "Select the areas where you can deliver products. You can always expand to new zones later.",
    type: "help" as const,
  },
  deliveryTime: {
    content: "Set realistic delivery timeframes for each zone. Consider processing time, shipping method, and distance.",
    type: "info" as const,
  },
  shippingRates: {
    content: "Set competitive shipping rates. Consider offering free shipping above a certain order value to increase sales.",
    type: "help" as const,
  },
  codAvailable: {
    content: "Cash on Delivery (COD) is popular in Bangladesh. Enable this to increase customer confidence and sales.",
    type: "info" as const,
  },

  // Agreement Step
  termsOfService: {
    content: "Read and accept our terms of service. This governs your relationship with the platform and your responsibilities as a vendor.",
    type: "warning" as const,
  },
  privacyPolicy: {
    content: "Review our privacy policy to understand how we handle your data and your customers' information.",
    type: "info" as const,
  },
  vendorAgreement: {
    content: "Accept the vendor agreement which outlines commission rates, payment terms, and performance expectations.",
    type: "warning" as const,
  },
  dataProcessing: {
    content: "Consent to data processing for order management, analytics, and customer service purposes.",
    type: "info" as const,
  },

  // Review and Submit Step
  reviewInfo: {
    content: "Carefully review all information before submission. You can edit any section by clicking the edit button.",
    type: "warning" as const,
  },
  submitApplication: {
    content: "Once submitted, our team will review your application within 2-3 business days. You'll receive an email notification.",
    type: "info" as const,
  },
  afterSubmission: {
    content: "After approval, you'll receive login credentials and can start listing products. Our support team will help with onboarding.",
    type: "help" as const,
  },

  // General Step Information
  stepProgress: {
    content: "Complete all required fields in this step to proceed to the next one. Optional fields can be completed later.",
    type: "help" as const,
  },
  saveProgress: {
    content: "Your progress is automatically saved. You can return later to complete the registration process.",
    type: "info" as const,
  },
  requiredFields: {
    content: "Fields marked with an asterisk (*) are required and must be completed before proceeding.",
    type: "warning" as const,
  },
  documentUpload: {
    content: "Ensure documents are clear, legible, and in the correct format. Poor quality documents may delay approval.",
    type: "warning" as const,
  },
  supportContact: {
    content: "Need help? Contact our vendor support team at vendor-support@getit.com or call +880-1234-567890.",
    type: "info" as const,
  },
};

export type HelpTooltipKey = keyof typeof helpTooltips;
/**
 * Invoice Service - Enterprise Invoice Generation & Management
 * Amazon.com/Shopee.sg-level invoice processing and compliance business logic
 */

import { db } from '../../../db';
import { orders, orderItems, vendors, users, products } from '@shared/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  vendorId: string;
  customerId: string;
  invoiceType: string;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  status: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class InvoiceService {
  
  /**
   * Generate invoice for order
   */
  async generateInvoice(params: {
    orderId: string;
    invoiceType: string;
    includeVAT: boolean;
    customNotes?: string;
    dueDate?: Date;
    generatedBy: string;
  }) {
    try {
      // Get order details
      const [order] = await db.select()
        .from(orders)
        .where(eq(orders.id, params.orderId))
        .limit(1);

      if (!order) {
        throw new Error('Order not found');
      }

      // Get order items
      const items = await db.select({
        id: orderItems.id,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        totalPrice: orderItems.totalPrice,
        productName: products.name
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, params.orderId));

      // Calculate invoice amounts
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const vatAmount = params.includeVAT ? subtotal * 0.15 : 0; // 15% VAT
      const totalAmount = subtotal + vatAmount;

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(params.invoiceType);

      // Determine due date
      const dueDate = params.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      const invoice = {
        id: this.generateId(),
        invoiceNumber,
        orderId: params.orderId,
        vendorId: order.vendorId || '',
        customerId: order.userId,
        invoiceType: params.invoiceType,
        subtotal,
        vatAmount,
        totalAmount,
        status: 'draft',
        dueDate,
        lineItems: items,
        customNotes: params.customNotes,
        generatedBy: params.generatedBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save invoice to database (simplified - would use actual invoice table)
      await this.saveInvoice(invoice);

      return invoice;
    } catch (error) {
      throw new Error(`Failed to generate invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get invoices with filtering and pagination
   */
  async getInvoices(filters: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    invoiceType?: string;
    vendorId?: string;
    customerId?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    try {
      // This would query the actual invoices table
      // For now, returning mock data structure
      const invoices = await this.queryInvoices(filters);

      return {
        invoices,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: invoices.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get invoices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get invoice by ID with full details
   */
  async getInvoiceById(invoiceId: string, options: {
    includeLineItems: boolean;
    includePaymentHistory: boolean;
    requestedBy: string;
  }) {
    try {
      const invoice = await this.findInvoiceById(invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (options.includeLineItems) {
        invoice.lineItems = await this.getInvoiceLineItems(invoiceId);
      }

      if (options.includePaymentHistory) {
        invoice.paymentHistory = await this.getInvoicePaymentHistory(invoiceId);
      }

      return invoice;
    } catch (error) {
      throw new Error(`Failed to get invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(params: {
    invoiceId: string;
    status: string;
    notes?: string;
    paymentReference?: string;
    updatedBy: string;
  }) {
    try {
      const invoice = await this.findInvoiceById(params.invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const previousStatus = invoice.status;
      
      const updatedInvoice = {
        ...invoice,
        status: params.status,
        notes: params.notes,
        paymentReference: params.paymentReference,
        previousStatus,
        updatedBy: params.updatedBy,
        updatedAt: new Date()
      };

      // Update invoice in database
      await this.updateInvoice(params.invoiceId, updatedInvoice);

      return updatedInvoice;
    } catch (error) {
      throw new Error(`Failed to update invoice status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send invoice to customer via email
   */
  async sendInvoice(params: {
    invoiceId: string;
    emailAddress: string;
    subject?: string;
    customMessage?: string;
    attachmentFormat: string;
    sentBy: string;
  }) {
    try {
      const invoice = await this.findInvoiceById(params.invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Generate PDF attachment if requested
      let attachment;
      if (params.attachmentFormat === 'pdf') {
        attachment = await this.generateInvoicePDF({
          invoiceId: params.invoiceId,
          template: 'standard',
          includeLogo: true,
          language: 'en',
          requestedBy: params.sentBy
        });
      }

      // Prepare email content
      const emailContent = {
        to: params.emailAddress,
        subject: params.subject || `Invoice ${invoice.invoiceNumber}`,
        body: params.customMessage || this.getDefaultInvoiceEmailBody(invoice),
        attachment
      };

      // Send email (would integrate with email service)
      const emailResult = await this.sendEmail(emailContent);

      // Log email sent
      await this.logInvoiceEmail(params.invoiceId, {
        emailAddress: params.emailAddress,
        sentBy: params.sentBy,
        sentAt: new Date(),
        emailId: emailResult.id
      });

      return {
        success: true,
        emailId: emailResult.id,
        sentAt: new Date(),
        recipientEmail: params.emailAddress
      };
    } catch (error) {
      throw new Error(`Failed to send invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate invoice PDF
   */
  async generateInvoicePDF(params: {
    invoiceId: string;
    template: string;
    includeLogo: boolean;
    language: string;
    requestedBy: string;
  }) {
    try {
      const invoice = await this.findInvoiceById(params.invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Get additional data for PDF
      const vendor = await this.getVendorDetails(invoice.vendorId);
      const customer = await this.getCustomerDetails(invoice.customerId);

      // Generate PDF content
      const pdfContent = await this.createPDFContent({
        invoice,
        vendor,
        customer,
        template: params.template,
        includeLogo: params.includeLogo,
        language: params.language
      });

      // Convert to PDF buffer
      const pdfBuffer = await this.generatePDFBuffer(pdfContent);

      return pdfBuffer;
    } catch (error) {
      throw new Error(`Failed to generate invoice PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Record payment for invoice
   */
  async recordPayment(params: {
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    paymentReference?: string;
    paymentDate: Date;
    notes?: string;
    recordedBy: string;
  }) {
    try {
      const invoice = await this.findInvoiceById(params.invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Create payment record
      const payment = {
        id: this.generateId(),
        invoiceId: params.invoiceId,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        paymentReference: params.paymentReference,
        paymentDate: params.paymentDate,
        notes: params.notes,
        recordedBy: params.recordedBy,
        createdAt: new Date()
      };

      // Save payment record
      await this.savePaymentRecord(payment);

      // Update invoice status based on payment
      const totalPaid = await this.calculateTotalPaid(params.invoiceId);
      let newStatus = 'partially_paid';
      
      if (totalPaid >= invoice.totalAmount) {
        newStatus = 'paid';
      } else if (totalPaid === 0) {
        newStatus = 'unpaid';
      }

      // Update invoice status
      await this.updateInvoiceStatus({
        invoiceId: params.invoiceId,
        status: newStatus,
        notes: `Payment recorded: ${params.paymentMethod}`,
        paymentReference: params.paymentReference,
        updatedBy: params.recordedBy
      });

      return {
        payment,
        invoiceStatus: newStatus,
        totalPaid,
        remainingAmount: Math.max(0, invoice.totalAmount - totalPaid)
      };
    } catch (error) {
      throw new Error(`Failed to record payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate credit note for invoice
   */
  async generateCreditNote(params: {
    invoiceId: string;
    creditAmount?: number;
    reason: string;
    lineItemIds?: string[];
    notes?: string;
    generatedBy: string;
  }) {
    try {
      const invoice = await this.findInvoiceById(params.invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Calculate credit amount
      let creditAmount = params.creditAmount;
      if (!creditAmount && params.lineItemIds?.length) {
        creditAmount = await this.calculateLineItemsTotal(params.lineItemIds);
      } else if (!creditAmount) {
        creditAmount = invoice.totalAmount;
      }

      // Generate credit note number
      const creditNoteNumber = await this.generateCreditNoteNumber();

      const creditNote = {
        id: this.generateId(),
        creditNoteNumber,
        originalInvoiceId: params.invoiceId,
        originalInvoiceNumber: invoice.invoiceNumber,
        creditAmount,
        reason: params.reason,
        lineItemIds: params.lineItemIds,
        notes: params.notes,
        status: 'issued',
        generatedBy: params.generatedBy,
        createdAt: new Date()
      };

      // Save credit note
      await this.saveCreditNote(creditNote);

      // Update invoice status
      const remainingAmount = invoice.totalAmount - creditAmount;
      const newStatus = remainingAmount <= 0 ? 'credited' : 'partially_credited';
      
      await this.updateInvoiceStatus({
        invoiceId: params.invoiceId,
        status: newStatus,
        notes: `Credit note issued: ${creditNoteNumber}`,
        updatedBy: params.generatedBy
      });

      return creditNote;
    } catch (error) {
      throw new Error(`Failed to generate credit note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get invoice analytics and reports
   */
  async getInvoiceAnalytics(params: {
    startDate?: Date;
    endDate?: Date;
    vendorId?: string;
    analyticsType: string;
    groupBy: string;
  }) {
    try {
      const startDate = params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = params.endDate || new Date();

      // Get invoice data for analytics
      const invoices = await this.getInvoicesForAnalytics({
        startDate,
        endDate,
        vendorId: params.vendorId
      });

      // Process analytics based on type
      const analytics = await this.processInvoiceAnalytics(
        invoices,
        params.analyticsType,
        params.groupBy
      );

      return {
        period: { startDate, endDate },
        analyticsType: params.analyticsType,
        groupBy: params.groupBy,
        data: analytics,
        summary: {
          totalInvoices: invoices.length,
          totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
          paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
          overdueInvoices: invoices.filter(inv => this.isOverdue(inv)).length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get invoice analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(params: {
    vendorId?: string;
    daysPastDue: number;
    includePartialPayments: boolean;
    page: number;
    limit: number;
  }) {
    try {
      const cutoffDate = new Date(Date.now() - params.daysPastDue * 24 * 60 * 60 * 1000);
      
      const overdueInvoices = await this.queryOverdueInvoices({
        vendorId: params.vendorId,
        cutoffDate,
        includePartialPayments: params.includePartialPayments,
        page: params.page,
        limit: params.limit
      });

      return {
        invoices: overdueInvoices,
        summary: {
          totalOverdue: overdueInvoices.length,
          totalOverdueAmount: overdueInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
          averageDaysOverdue: this.calculateAverageDaysOverdue(overdueInvoices)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get overdue invoices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Bulk invoice operations
   */
  async bulkInvoiceOperations(params: {
    operation: string;
    invoiceIds: string[];
    operationData?: any;
    performedBy: string;
  }) {
    try {
      const results = {
        successCount: 0,
        failureCount: 0,
        results: [] as any[]
      };

      for (const invoiceId of params.invoiceIds) {
        try {
          let result;
          
          switch (params.operation) {
            case 'send':
              result = await this.sendInvoice({
                invoiceId,
                emailAddress: params.operationData.emailAddress,
                attachmentFormat: 'pdf',
                sentBy: params.performedBy
              });
              break;
              
            case 'mark_paid':
              result = await this.updateInvoiceStatus({
                invoiceId,
                status: 'paid',
                updatedBy: params.performedBy
              });
              break;
              
            case 'mark_overdue':
              result = await this.updateInvoiceStatus({
                invoiceId,
                status: 'overdue',
                updatedBy: params.performedBy
              });
              break;
              
            default:
              throw new Error(`Unknown operation: ${params.operation}`);
          }

          results.successCount++;
          results.results.push({
            invoiceId,
            status: 'success',
            result
          });
        } catch (error) {
          results.failureCount++;
          results.results.push({
            invoiceId,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to perform bulk invoice operations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Setup recurring invoice
   */
  async setupRecurringInvoice(params: {
    baseInvoiceId: string;
    frequency: string;
    nextInvoiceDate: Date;
    endDate?: Date;
    maxOccurrences?: number;
    setupBy: string;
  }) {
    try {
      const baseInvoice = await this.findInvoiceById(params.baseInvoiceId);
      
      if (!baseInvoice) {
        throw new Error('Base invoice not found');
      }

      const recurringInvoice = {
        id: this.generateId(),
        baseInvoiceId: params.baseInvoiceId,
        frequency: params.frequency,
        nextInvoiceDate: params.nextInvoiceDate,
        endDate: params.endDate,
        maxOccurrences: params.maxOccurrences,
        currentOccurrence: 0,
        isActive: true,
        setupBy: params.setupBy,
        createdAt: new Date()
      };

      // Save recurring invoice configuration
      await this.saveRecurringInvoice(recurringInvoice);

      return recurringInvoice;
    } catch (error) {
      throw new Error(`Failed to setup recurring invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private async generateInvoiceNumber(invoiceType: string): Promise<string> {
    const prefix = invoiceType.toUpperCase().substring(0, 3);
    const year = new Date().getFullYear();
    const sequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    return `${prefix}${year}${sequence}`;
  }

  private generateId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async saveInvoice(invoice: any) {
    // Save invoice to database
    // Implementation would depend on the invoice table schema
  }

  private async queryInvoices(filters: any) {
    // Query invoices from database with filters
    return [];
  }

  private async findInvoiceById(invoiceId: string) {
    // Find invoice by ID
    return null;
  }

  private async getInvoiceLineItems(invoiceId: string) {
    // Get line items for invoice
    return [];
  }

  private async getInvoicePaymentHistory(invoiceId: string) {
    // Get payment history for invoice
    return [];
  }

  private async updateInvoice(invoiceId: string, updateData: any) {
    // Update invoice in database
  }

  private async getVendorDetails(vendorId: string) {
    const [vendor] = await db.select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);
    
    return vendor;
  }

  private async getCustomerDetails(customerId: string) {
    const [customer] = await db.select()
      .from(users)
      .where(eq(users.id, customerId))
      .limit(1);
    
    return customer;
  }

  private async createPDFContent(params: any) {
    // Create PDF content from invoice data
    return {
      html: `<h1>Invoice ${params.invoice.invoiceNumber}</h1>`,
      styles: ''
    };
  }

  private async generatePDFBuffer(content: any): Promise<Buffer> {
    // Generate PDF buffer from content
    return Buffer.from('PDF content here');
  }

  private getDefaultInvoiceEmailBody(invoice: any): string {
    return `
      Dear Customer,
      
      Please find attached your invoice ${invoice.invoiceNumber} for ${invoice.totalAmount} BDT.
      
      Payment is due by ${invoice.dueDate}.
      
      Thank you for your business.
      
      Best regards,
      GetIt Team
    `;
  }

  private async sendEmail(emailContent: any) {
    // Send email via email service
    return { id: `email_${Date.now()}` };
  }

  private async logInvoiceEmail(invoiceId: string, emailData: any) {
    // Log email sent for invoice
  }

  private async savePaymentRecord(payment: any) {
    // Save payment record to database
  }

  private async calculateTotalPaid(invoiceId: string): Promise<number> {
    // Calculate total amount paid for invoice
    return 0;
  }

  private async generateCreditNoteNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const sequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    return `CN${year}${sequence}`;
  }

  private async calculateLineItemsTotal(lineItemIds: string[]): Promise<number> {
    // Calculate total for specific line items
    return 0;
  }

  private async saveCreditNote(creditNote: any) {
    // Save credit note to database
  }

  private async getInvoicesForAnalytics(filters: any) {
    // Get invoices for analytics processing
    return [];
  }

  private async processInvoiceAnalytics(invoices: any[], analyticsType: string, groupBy: string) {
    // Process analytics based on type and grouping
    return {};
  }

  private isOverdue(invoice: any): boolean {
    return new Date() > new Date(invoice.dueDate) && invoice.status !== 'paid';
  }

  private async queryOverdueInvoices(params: any) {
    // Query overdue invoices
    return [];
  }

  private calculateAverageDaysOverdue(invoices: any[]): number {
    if (invoices.length === 0) return 0;
    
    const totalDaysOverdue = invoices.reduce((sum, inv) => {
      const daysOverdue = Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / (24 * 60 * 60 * 1000));
      return sum + Math.max(0, daysOverdue);
    }, 0);
    
    return totalDaysOverdue / invoices.length;
  }

  private async saveRecurringInvoice(recurringInvoice: any) {
    // Save recurring invoice configuration
  }
}
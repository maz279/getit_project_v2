import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Finance Service API Integration
 * Amazon.com/Shopee.sg-level financial management functionality with complete backend synchronization
 */
class FinanceApiService {
  constructor() {
    this.baseUrl = '/api/v1/finance';
  }

  // ================================
  // ACCOUNTING OPERATIONS
  // ================================

  /**
   * Get comprehensive accounting overview
   */
  async getAccountingOverview(filters = {}) {
    const params = new URLSearchParams({
      period: filters.period || 'current_month',
      vendorId: filters.vendorId || '',
      includeForecasts: filters.includeForecasts || 'true',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/accounting/overview?${params}`);
  }

  /**
   * Get chart of accounts
   */
  async getChartOfAccounts(filters = {}) {
    const params = new URLSearchParams({
      accountType: filters.accountType || '',
      isActive: filters.isActive || 'true',
      parentAccountId: filters.parentAccountId || ''
    });

    return await apiRequest(`${this.baseUrl}/accounting/chart-of-accounts?${params}`);
  }

  /**
   * Create journal entry
   */
  async createJournalEntry(entryData) {
    return await apiRequest(`${this.baseUrl}/accounting/journal-entries`, {
      method: 'POST',
      body: JSON.stringify(entryData)
    });
  }

  /**
   * Get trial balance
   */
  async getTrialBalance(asOfDate, includeClosingEntries = false) {
    const params = new URLSearchParams({
      asOfDate,
      includeClosingEntries: includeClosingEntries.toString()
    });

    return await apiRequest(`${this.baseUrl}/accounting/trial-balance?${params}`);
  }

  /**
   * Generate financial statements
   */
  async getFinancialStatements(type, period, vendorId = '') {
    const params = new URLSearchParams({
      type, // 'balance_sheet', 'income_statement', 'cash_flow'
      period,
      vendorId
    });

    return await apiRequest(`${this.baseUrl}/accounting/financial-statements?${params}`);
  }

  // ================================
  // TAX MANAGEMENT
  // ================================

  /**
   * Calculate tax for transaction
   */
  async calculateTax(transactionData) {
    return await apiRequest(`${this.baseUrl}/tax/calculate`, {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  /**
   * Get tax summary report
   */
  async getTaxSummary(period, taxType = '') {
    const params = new URLSearchParams({
      period,
      taxType // 'vat', 'income', 'withholding', 'customs'
    });

    return await apiRequest(`${this.baseUrl}/tax/summary?${params}`);
  }

  /**
   * File tax return
   */
  async fileTaxReturn(taxReturnData) {
    return await apiRequest(`${this.baseUrl}/tax/file-return`, {
      method: 'POST',
      body: JSON.stringify(taxReturnData)
    });
  }

  /**
   * Get VAT report for Bangladesh
   */
  async getVATReport(startDate, endDate, vendorId = '') {
    const params = new URLSearchParams({
      startDate,
      endDate,
      vendorId,
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/tax/vat-report?${params}`);
  }

  // ================================
  // INVOICE MANAGEMENT
  // ================================

  /**
   * Generate invoice
   */
  async generateInvoice(invoiceData) {
    return await apiRequest(`${this.baseUrl}/invoices/generate`, {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId) {
    return await apiRequest(`${this.baseUrl}/invoices/${invoiceId}`);
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(invoiceId, status, notes = '') {
    return await apiRequest(`${this.baseUrl}/invoices/${invoiceId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }

  /**
   * Get invoice list with filters
   */
  async getInvoices(filters = {}) {
    const params = new URLSearchParams({
      page: filters.page || '1',
      limit: filters.limit || '20',
      status: filters.status || '',
      vendorId: filters.vendorId || '',
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/invoices?${params}`);
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoicePDF(invoiceId) {
    return await apiRequest(`${this.baseUrl}/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
  }

  // ================================
  // PAYMENT RECONCILIATION
  // ================================

  /**
   * Reconcile bank statement
   */
  async reconcileBankStatement(statementData) {
    return await apiRequest(`${this.baseUrl}/reconciliation/bank-statement`, {
      method: 'POST',
      body: JSON.stringify(statementData)
    });
  }

  /**
   * Reconcile payment gateway transactions
   */
  async reconcilePaymentGateway(gatewayType, startDate, endDate) {
    return await apiRequest(`${this.baseUrl}/reconciliation/payment-gateway`, {
      method: 'POST',
      body: JSON.stringify({ gatewayType, startDate, endDate })
    });
  }

  /**
   * Get reconciliation report
   */
  async getReconciliationReport(period, accountId = '') {
    const params = new URLSearchParams({
      period,
      accountId
    });

    return await apiRequest(`${this.baseUrl}/reconciliation/report?${params}`);
  }

  /**
   * Match transactions
   */
  async matchTransactions(transactionIds) {
    return await apiRequest(`${this.baseUrl}/reconciliation/match`, {
      method: 'POST',
      body: JSON.stringify({ transactionIds })
    });
  }

  // ================================
  // VENDOR PAYOUTS
  // ================================

  /**
   * Process vendor payout
   */
  async processVendorPayout(payoutData) {
    return await apiRequest(`${this.baseUrl}/payouts/process`, {
      method: 'POST',
      body: JSON.stringify(payoutData)
    });
  }

  /**
   * Get payout schedule
   */
  async getPayoutSchedule(vendorId = '', status = '') {
    const params = new URLSearchParams({
      vendorId,
      status // 'pending', 'processing', 'completed', 'failed'
    });

    return await apiRequest(`${this.baseUrl}/payouts/schedule?${params}`);
  }

  /**
   * Calculate vendor commission
   */
  async calculateVendorCommission(vendorId, orderId) {
    return await apiRequest(`${this.baseUrl}/payouts/commission/calculate`, {
      method: 'POST',
      body: JSON.stringify({ vendorId, orderId })
    });
  }

  /**
   * Get payout history
   */
  async getPayoutHistory(vendorId, page = 1, limit = 20) {
    const params = new URLSearchParams({
      vendorId,
      page: page.toString(),
      limit: limit.toString()
    });

    return await apiRequest(`${this.baseUrl}/payouts/history?${params}`);
  }

  /**
   * Request payout
   */
  async requestPayout(vendorId, amount, paymentMethod = 'bkash') {
    return await apiRequest(`${this.baseUrl}/payouts/request`, {
      method: 'POST',
      body: JSON.stringify({ vendorId, amount, paymentMethod })
    });
  }

  // ================================
  // COMMISSION MANAGEMENT
  // ================================

  /**
   * Get commission structure
   */
  async getCommissionStructure(vendorId = '', categoryId = '') {
    const params = new URLSearchParams({
      vendorId,
      categoryId
    });

    return await apiRequest(`${this.baseUrl}/commission/structure?${params}`);
  }

  /**
   * Update commission rates
   */
  async updateCommissionRates(commissionData) {
    return await apiRequest(`${this.baseUrl}/commission/rates`, {
      method: 'PUT',
      body: JSON.stringify(commissionData)
    });
  }

  /**
   * Get commission analytics
   */
  async getCommissionAnalytics(period, vendorId = '') {
    const params = new URLSearchParams({
      period,
      vendorId
    });

    return await apiRequest(`${this.baseUrl}/commission/analytics?${params}`);
  }

  // ================================
  // FINANCIAL REPORTING
  // ================================

  /**
   * Generate financial report
   */
  async generateFinancialReport(reportType, period, filters = {}) {
    return await apiRequest(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      body: JSON.stringify({ reportType, period, ...filters })
    });
  }

  /**
   * Get profit and loss statement
   */
  async getProfitLossStatement(startDate, endDate, vendorId = '') {
    const params = new URLSearchParams({
      startDate,
      endDate,
      vendorId
    });

    return await apiRequest(`${this.baseUrl}/reports/profit-loss?${params}`);
  }

  /**
   * Get cash flow statement
   */
  async getCashFlowStatement(startDate, endDate, vendorId = '') {
    const params = new URLSearchParams({
      startDate,
      endDate,
      vendorId
    });

    return await apiRequest(`${this.baseUrl}/reports/cash-flow?${params}`);
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(period, breakdown = 'daily') {
    const params = new URLSearchParams({
      period,
      breakdown // 'daily', 'weekly', 'monthly'
    });

    return await apiRequest(`${this.baseUrl}/reports/revenue-analytics?${params}`);
  }

  // ================================
  // BANGLADESH-SPECIFIC FEATURES
  // ================================

  /**
   * Get Bangladesh tax compliance status
   */
  async getBangladeshTaxCompliance(vendorId = '') {
    const params = new URLSearchParams({
      vendorId,
      country: 'BD'
    });

    return await apiRequest(`${this.baseUrl}/tax/bangladesh-compliance?${params}`);
  }

  /**
   * Process bKash business payment
   */
  async processBkashBusinessPayment(paymentData) {
    return await apiRequest(`${this.baseUrl}/payouts/bkash-business`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  /**
   * Get NBR reporting data
   */
  async getNBRReportingData(taxYear, vendorId = '') {
    const params = new URLSearchParams({
      taxYear,
      vendorId,
      format: 'xml'
    });

    return await apiRequest(`${this.baseUrl}/tax/nbr-reporting?${params}`);
  }

  /**
   * Calculate withholding tax for Bangladesh
   */
  async calculateBangladeshWithholdingTax(transactionData) {
    return await apiRequest(`${this.baseUrl}/tax/bangladesh-withholding`, {
      method: 'POST',
      body: JSON.stringify({ ...transactionData, country: 'BD' })
    });
  }

  // ================================
  // BUDGET & FORECASTING
  // ================================

  /**
   * Create budget
   */
  async createBudget(budgetData) {
    return await apiRequest(`${this.baseUrl}/budget/create`, {
      method: 'POST',
      body: JSON.stringify(budgetData)
    });
  }

  /**
   * Get budget vs actual report
   */
  async getBudgetVsActual(budgetId, period) {
    const params = new URLSearchParams({
      budgetId,
      period
    });

    return await apiRequest(`${this.baseUrl}/budget/vs-actual?${params}`);
  }

  /**
   * Generate financial forecast
   */
  async generateFinancialForecast(forecastData) {
    return await apiRequest(`${this.baseUrl}/forecast/generate`, {
      method: 'POST',
      body: JSON.stringify(forecastData)
    });
  }

  // ================================
  // CURRENCY & EXCHANGE
  // ================================

  /**
   * Get exchange rates
   */
  async getExchangeRates(baseCurrency = 'BDT', targetCurrencies = ['USD', 'EUR']) {
    const params = new URLSearchParams({
      base: baseCurrency,
      targets: targetCurrencies.join(',')
    });

    return await apiRequest(`${this.baseUrl}/exchange/rates?${params}`);
  }

  /**
   * Convert currency amount
   */
  async convertCurrency(amount, fromCurrency, toCurrency) {
    return await apiRequest(`${this.baseUrl}/exchange/convert`, {
      method: 'POST',
      body: JSON.stringify({ amount, fromCurrency, toCurrency })
    });
  }

  // ================================
  // AUDIT & COMPLIANCE
  // ================================

  /**
   * Get audit trail
   */
  async getAuditTrail(filters = {}) {
    const params = new URLSearchParams({
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      userId: filters.userId || '',
      action: filters.action || '',
      page: filters.page || '1',
      limit: filters.limit || '50'
    });

    return await apiRequest(`${this.baseUrl}/audit/trail?${params}`);
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(reportType, period) {
    return await apiRequest(`${this.baseUrl}/compliance/report`, {
      method: 'POST',
      body: JSON.stringify({ reportType, period })
    });
  }

  // ================================
  // EXPORT & INTEGRATION
  // ================================

  /**
   * Export financial data
   */
  async exportFinancialData(exportType, filters = {}) {
    const params = new URLSearchParams({
      type: exportType, // 'csv', 'excel', 'pdf'
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Sync with external accounting software
   */
  async syncWithAccountingSoftware(softwareType, credentials) {
    return await apiRequest(`${this.baseUrl}/integration/sync`, {
      method: 'POST',
      body: JSON.stringify({ softwareType, credentials })
    });
  }

  // ================================
  // REAL-TIME MONITORING
  // ================================

  /**
   * Get real-time financial metrics
   */
  async getRealTimeMetrics() {
    return await apiRequest(`${this.baseUrl}/real-time/metrics`);
  }

  /**
   * Subscribe to financial alerts
   */
  subscribeToFinancialAlerts(onAlert, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/finance/alerts/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', filters }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onAlert(data);
    };
    
    return ws;
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Format currency for Bangladesh market
   */
  formatBDT(amount) {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format financial percentage
   */
  formatPercentage(value, decimals = 2) {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Calculate financial ratios
   */
  calculateFinancialRatios(financialData) {
    const {
      currentAssets,
      currentLiabilities,
      totalRevenue,
      totalExpenses,
      grossProfit,
      netProfit
    } = financialData;

    return {
      currentRatio: currentAssets / currentLiabilities,
      profitMargin: (netProfit / totalRevenue) * 100,
      grossMargin: (grossProfit / totalRevenue) * 100,
      expenseRatio: (totalExpenses / totalRevenue) * 100
    };
  }

  /**
   * Handle API errors with proper financial context
   */
  handleError(error, operation) {
    console.error(`Finance API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected financial error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Financial authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this financial operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested financial record was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Financial data conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid financial data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many financial requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Financial server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const financeApiService = new FinanceApiService();

// Export as default
export default FinanceApiService;
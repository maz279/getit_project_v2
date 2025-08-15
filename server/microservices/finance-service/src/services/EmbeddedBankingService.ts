/**
 * Embedded Banking Service - Amazon.com/Shopee.sg Level
 * Digital account management, wallet services, and embedded banking operations
 */

import { db } from '../../../../db.js';
import { LoggingService } from '../../../../services/LoggingService';
import { RedisService } from '../../../../services/RedisService';

export class EmbeddedBankingService {
  private loggingService: LoggingService;
  private redisService: RedisService;

  constructor() {
    this.loggingService = new LoggingService();
    this.redisService = new RedisService();
  }

  /**
   * Create digital account for customer
   */
  async createDigitalAccount(params: {
    customerId: string;
    accountType: string;
    currency: string;
    createdBy: string;
  }) {
    const { customerId, accountType, currency, createdBy } = params;

    try {
      // Generate unique account number
      const accountNumber = this.generateAccountNumber();

      const account = {
        id: this.generateId(),
        customerId,
        accountNumber,
        accountType,
        currency,
        balance: 0,
        status: 'active',
        createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Cache account for quick access
      await this.redisService.setCache(`account:${account.id}`, account, 3600);

      this.loggingService.logInfo('Digital account created', {
        accountId: account.id,
        customerId,
        accountNumber,
        accountType,
        currency
      });

      return account;

    } catch (error) {
      this.loggingService.logError('Failed to create digital account', error);
      throw error;
    }
  }

  /**
   * Create digital wallet for customer
   */
  async createDigitalWallet(params: {
    customerId: string;
    walletType: string;
    currency: string;
    createdBy: string;
  }) {
    const { customerId, walletType, currency, createdBy } = params;

    try {
      const wallet = {
        id: this.generateId(),
        customerId,
        walletNumber: this.generateWalletNumber(),
        walletType,
        currency,
        balance: 0,
        status: 'active',
        dailyLimit: this.getDailyLimit(walletType),
        monthlyLimit: this.getMonthlyLimit(walletType),
        createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Cache wallet for quick access
      await this.redisService.setCache(`wallet:${wallet.id}`, wallet, 3600);

      this.loggingService.logInfo('Digital wallet created', {
        walletId: wallet.id,
        customerId,
        walletNumber: wallet.walletNumber,
        walletType,
        currency
      });

      return wallet;

    } catch (error) {
      this.loggingService.logError('Failed to create digital wallet', error);
      throw error;
    }
  }

  /**
   * Process wallet top-up
   */
  async processWalletTopup(params: {
    walletId: string;
    amount: number;
    paymentMethod: string;
    source: string;
    processedBy: string;
  }) {
    const { walletId, amount, paymentMethod, source, processedBy } = params;

    try {
      // Validate wallet exists and is active
      const wallet = await this.getWalletDetails(walletId);
      if (wallet.status !== 'active') {
        throw new Error('Wallet is not active');
      }

      // Validate amount
      if (amount <= 0) {
        throw new Error('Invalid top-up amount');
      }

      // Check daily limits
      const dailyTotal = await this.getDailyTopupTotal(walletId);
      if (dailyTotal + amount > wallet.dailyLimit) {
        throw new Error('Daily top-up limit exceeded');
      }

      const topup = {
        id: this.generateId(),
        walletId,
        amount,
        paymentMethod,
        source,
        status: 'completed',
        transactionId: this.generateTransactionId(),
        processedBy,
        processedAt: new Date().toISOString()
      };

      // Update wallet balance
      wallet.balance += amount;
      wallet.updatedAt = new Date().toISOString();

      // Update cache
      await this.redisService.setCache(`wallet:${walletId}`, wallet, 3600);

      this.loggingService.logInfo('Wallet top-up processed', {
        topupId: topup.id,
        walletId,
        amount,
        paymentMethod,
        newBalance: wallet.balance
      });

      return topup;

    } catch (error) {
      this.loggingService.logError('Failed to process wallet top-up', error);
      throw error;
    }
  }

  /**
   * Get wallet details
   */
  async getWalletDetails(walletId: string) {
    try {
      // Try cache first
      const cachedWallet = await this.redisService.getCache(`wallet:${walletId}`);
      if (cachedWallet) {
        return cachedWallet;
      }

      // Mock wallet data for now - replace with actual database query
      const wallet = {
        id: walletId,
        customerId: 'customer123',
        walletNumber: 'WLT001234567890',
        walletType: 'personal',
        currency: 'BDT',
        balance: 5000,
        status: 'active',
        dailyLimit: 50000,
        monthlyLimit: 500000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Cache for future requests
      await this.redisService.setCache(`wallet:${walletId}`, wallet, 3600);

      return wallet;

    } catch (error) {
      this.loggingService.logError('Failed to get wallet details', error);
      throw error;
    }
  }

  /**
   * Process wallet-to-wallet transfer
   */
  async processWalletTransfer(params: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    note?: string;
    transferType: string;
    initiatedBy: string;
  }) {
    const { fromWalletId, toWalletId, amount, note, transferType, initiatedBy } = params;

    try {
      // Validate wallets
      const fromWallet = await this.getWalletDetails(fromWalletId);
      const toWallet = await this.getWalletDetails(toWalletId);

      if (fromWallet.status !== 'active' || toWallet.status !== 'active') {
        throw new Error('One or both wallets are not active');
      }

      // Validate amount and balance
      if (amount <= 0) {
        throw new Error('Invalid transfer amount');
      }

      if (fromWallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const transfer = {
        id: this.generateId(),
        fromWalletId,
        toWalletId,
        amount,
        note,
        transferType,
        status: 'completed',
        transactionId: this.generateTransactionId(),
        initiatedBy,
        processedAt: new Date().toISOString()
      };

      // Update balances
      fromWallet.balance -= amount;
      toWallet.balance += amount;
      fromWallet.updatedAt = new Date().toISOString();
      toWallet.updatedAt = new Date().toISOString();

      // Update cache
      await this.redisService.setCache(`wallet:${fromWalletId}`, fromWallet, 3600);
      await this.redisService.setCache(`wallet:${toWalletId}`, toWallet, 3600);

      this.loggingService.logInfo('Wallet transfer processed', {
        transferId: transfer.id,
        fromWalletId,
        toWalletId,
        amount,
        transferType
      });

      return transfer;

    } catch (error) {
      this.loggingService.logError('Failed to process wallet transfer', error);
      throw error;
    }
  }

  /**
   * Get wallet transaction history
   */
  async getWalletTransactions(walletId: string, filters: {
    startDate?: Date;
    endDate?: Date;
    transactionType?: string;
    page: number;
    limit: number;
  }) {
    try {
      // Mock transaction data for now - replace with actual database query
      const transactions = [
        {
          id: 'txn001',
          walletId,
          type: 'topup',
          amount: 1000,
          description: 'Mobile banking top-up',
          status: 'completed',
          createdAt: new Date().toISOString()
        },
        {
          id: 'txn002',
          walletId,
          type: 'transfer_out',
          amount: -500,
          description: 'Transfer to friend',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      // Apply filters (simplified for mock)
      let filteredTransactions = transactions;
      if (filters.transactionType && filters.transactionType !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === filters.transactionType);
      }

      // Pagination
      const startIndex = (filters.page - 1) * filters.limit;
      const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + filters.limit);

      return {
        transactions: paginatedTransactions,
        total: filteredTransactions.length,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(filteredTransactions.length / filters.limit)
      };

    } catch (error) {
      this.loggingService.logError('Failed to get wallet transactions', error);
      throw error;
    }
  }

  /**
   * Issue virtual card for wallet
   */
  async issueVirtualCard(params: {
    walletId: string;
    cardType: string;
    currency: string;
    issuedBy: string;
  }) {
    const { walletId, cardType, currency, issuedBy } = params;

    try {
      // Validate wallet
      const wallet = await this.getWalletDetails(walletId);
      if (wallet.status !== 'active') {
        throw new Error('Wallet is not active');
      }

      const card = {
        id: this.generateId(),
        walletId,
        cardNumber: this.generateCardNumber(),
        cardType,
        currency,
        status: 'active',
        expiryDate: this.getCardExpiryDate(),
        dailyLimit: 25000,
        monthlyLimit: 200000,
        issuedBy,
        issuedAt: new Date().toISOString()
      };

      this.loggingService.logInfo('Virtual card issued', {
        cardId: card.id,
        walletId,
        cardNumber: this.maskCardNumber(card.cardNumber),
        cardType
      });

      return card;

    } catch (error) {
      this.loggingService.logError('Failed to issue virtual card', error);
      throw error;
    }
  }

  /**
   * Get embedded banking analytics
   */
  async getEmbeddedBankingAnalytics(timeframe: string, currency: string) {
    try {
      // Mock analytics data - replace with actual database aggregations
      const analytics = {
        totalAccounts: 15420,
        totalWallets: 12890,
        totalBalance: 45680000,
        totalTransactions: 89540,
        totalTopups: 34210,
        totalTransfers: 28900,
        activeUsers: 11250,
        newAccountsToday: 45,
        transactionVolume: {
          today: 1250000,
          thisWeek: 8900000,
          thisMonth: 35600000
        },
        topupMethods: {
          mobile_banking: 65,
          bank_transfer: 25,
          card: 10
        },
        walletTypes: {
          personal: 85,
          business: 15
        },
        averageBalance: 3542,
        averageTransactionAmount: 510
      };

      return analytics;

    } catch (error) {
      this.loggingService.logError('Failed to get embedded banking analytics', error);
      throw error;
    }
  }

  /**
   * Update wallet status (freeze/unfreeze)
   */
  async updateWalletStatus(params: {
    walletId: string;
    status: string;
    reason?: string;
    updatedBy: string;
  }) {
    const { walletId, status, reason, updatedBy } = params;

    try {
      const wallet = await this.getWalletDetails(walletId);
      
      wallet.status = status;
      wallet.updatedAt = new Date().toISOString();

      // Update cache
      await this.redisService.setCache(`wallet:${walletId}`, wallet, 3600);

      this.loggingService.logInfo('Wallet status updated', {
        walletId,
        status,
        reason,
        updatedBy
      });

      return wallet;

    } catch (error) {
      this.loggingService.logError('Failed to update wallet status', error);
      throw error;
    }
  }

  // Helper methods
  private generateId(): string {
    return 'EB' + Date.now() + Math.random().toString(36).substr(2, 9);
  }

  private generateAccountNumber(): string {
    return 'ACC' + Date.now().toString().slice(-10);
  }

  private generateWalletNumber(): string {
    return 'WLT' + Date.now().toString().slice(-12);
  }

  private generateTransactionId(): string {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 6);
  }

  private generateCardNumber(): string {
    return '4532' + Math.random().toString().slice(2, 14);
  }

  private maskCardNumber(cardNumber: string): string {
    return cardNumber.slice(0, 4) + '****' + cardNumber.slice(-4);
  }

  private getCardExpiryDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  }

  private getDailyLimit(walletType: string): number {
    const limits = {
      personal: 50000,
      business: 200000,
      premium: 500000
    };
    return limits[walletType] || 50000;
  }

  private getMonthlyLimit(walletType: string): number {
    const limits = {
      personal: 500000,
      business: 2000000,
      premium: 5000000
    };
    return limits[walletType] || 500000;
  }

  private async getDailyTopupTotal(walletId: string): Promise<number> {
    // Mock implementation - replace with actual database query
    return 5000;
  }
}
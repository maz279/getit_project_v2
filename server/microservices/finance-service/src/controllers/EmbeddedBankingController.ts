/**
 * Embedded Banking Controller - Amazon.com/Shopee.sg Level
 * Digital account management, wallet services, and embedded banking capabilities
 */

import { Request, Response } from 'express';
import { LoggingService } from '../../../../services/LoggingService';
import { EmbeddedBankingService } from '../services/EmbeddedBankingService';

export class EmbeddedBankingController {
  private embeddedBankingService: EmbeddedBankingService;
  private loggingService: LoggingService;

  constructor() {
    this.embeddedBankingService = new EmbeddedBankingService();
    this.loggingService = new LoggingService();
  }

  /**
   * Create digital account for customer
   */
  async createDigitalAccount(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, accountType = 'savings', currency = 'BDT' } = req.body;
      const userId = req.user?.userId;

      const account = await this.embeddedBankingService.createDigitalAccount({
        customerId,
        accountType,
        currency,
        createdBy: userId
      });

      this.loggingService.logInfo('Digital account created', {
        accountId: account.id,
        customerId,
        accountType,
        currency,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Digital account created successfully',
        data: account,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to create digital account', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create digital account',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create digital wallet for customer
   */
  async createDigitalWallet(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, walletType = 'personal', currency = 'BDT' } = req.body;
      const userId = req.user?.userId;

      const wallet = await this.embeddedBankingService.createDigitalWallet({
        customerId,
        walletType,
        currency,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Digital wallet created successfully',
        data: wallet,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to create digital wallet', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create digital wallet',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process wallet top-up
   */
  async processWalletTopup(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { amount, paymentMethod, source = 'customer' } = req.body;
      const userId = req.user?.userId;

      const topup = await this.embeddedBankingService.processWalletTopup({
        walletId,
        amount: parseFloat(amount),
        paymentMethod,
        source,
        processedBy: userId
      });

      this.loggingService.logInfo('Wallet top-up processed', {
        walletId,
        amount,
        paymentMethod,
        topupId: topup.id,
        processedBy: userId
      });

      res.json({
        success: true,
        message: 'Wallet top-up processed successfully',
        data: topup,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to process wallet top-up', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process wallet top-up',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get wallet balance and details
   */
  async getWalletDetails(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const wallet = await this.embeddedBankingService.getWalletDetails(walletId);

      // Check if user has access to this wallet
      if (userRole !== 'admin' && wallet.customerId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own wallet.'
        });
        return;
      }

      res.json({
        success: true,
        data: wallet,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get wallet details', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wallet details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process wallet-to-wallet transfer
   */
  async processWalletTransfer(req: Request, res: Response): Promise<void> {
    try {
      const { fromWalletId, toWalletId, amount, note, transferType = 'personal' } = req.body;
      const userId = req.user?.userId;

      const transfer = await this.embeddedBankingService.processWalletTransfer({
        fromWalletId,
        toWalletId,
        amount: parseFloat(amount),
        note,
        transferType,
        initiatedBy: userId
      });

      this.loggingService.logInfo('Wallet transfer processed', {
        fromWalletId,
        toWalletId,
        amount,
        transferType,
        transferId: transfer.id,
        initiatedBy: userId
      });

      res.json({
        success: true,
        message: 'Wallet transfer processed successfully',
        data: transfer,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to process wallet transfer', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process wallet transfer',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get wallet transaction history
   */
  async getWalletTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { 
        startDate, 
        endDate, 
        transactionType = 'all',
        page = 1, 
        limit = 50 
      } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Verify wallet access
      const wallet = await this.embeddedBankingService.getWalletDetails(walletId);
      if (userRole !== 'admin' && wallet.customerId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own wallet transactions.'
        });
        return;
      }

      const transactions = await this.embeddedBankingService.getWalletTransactions(
        walletId,
        {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          transactionType: transactionType as string,
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        }
      );

      res.json({
        success: true,
        data: transactions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get wallet transactions', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wallet transactions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Issue virtual card for wallet
   */
  async issueVirtualCard(req: Request, res: Response): Promise<void> {
    try {
      const { walletId, cardType = 'virtual', currency = 'BDT' } = req.body;
      const userId = req.user?.userId;

      const card = await this.embeddedBankingService.issueVirtualCard({
        walletId,
        cardType,
        currency,
        issuedBy: userId
      });

      this.loggingService.logInfo('Virtual card issued', {
        walletId,
        cardId: card.id,
        cardType,
        currency,
        issuedBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Virtual card issued successfully',
        data: card,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to issue virtual card', error);
      res.status(500).json({
        success: false,
        message: 'Failed to issue virtual card',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get embedded banking analytics
   */
  async getEmbeddedBankingAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '30d', currency = 'BDT' } = req.query;
      const userRole = req.user?.role;

      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required for analytics.'
        });
        return;
      }

      const analytics = await this.embeddedBankingService.getEmbeddedBankingAnalytics(
        timeframe as string,
        currency as string
      );

      res.json({
        success: true,
        data: analytics,
        timeframe,
        currency,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to get embedded banking analytics', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get embedded banking analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Freeze/unfreeze wallet
   */
  async updateWalletStatus(req: Request, res: Response): Promise<void> {
    try {
      const { walletId } = req.params;
      const { status, reason } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin role required for wallet status updates.'
        });
        return;
      }

      const updatedWallet = await this.embeddedBankingService.updateWalletStatus({
        walletId,
        status,
        reason,
        updatedBy: userId
      });

      this.loggingService.logInfo('Wallet status updated', {
        walletId,
        status,
        reason,
        updatedBy: userId
      });

      res.json({
        success: true,
        message: 'Wallet status updated successfully',
        data: updatedWallet,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.loggingService.logError('Failed to update wallet status', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update wallet status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
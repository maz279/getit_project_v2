/**
 * Accounting Service - Double-Entry Bookkeeping Business Logic
 * Enterprise-grade accounting operations with chart of accounts management
 */

import { db } from '../../../db';
import { chartOfAccounts, journalEntries, journalEntryLineItems, financialPeriods } from '@shared/schema';
import { eq, and, gte, lte, sum, desc, asc } from 'drizzle-orm';

export class AccountingService {
  
  /**
   * Get Chart of Accounts with filtering
   */
  async getChartOfAccounts(filters: {
    accountType?: string;
    isActive?: boolean;
    includeBalance?: boolean;
  }) {
    try {
      let query = db.select().from(chartOfAccounts);
      
      const conditions = [];
      
      if (filters.accountType) {
        conditions.push(eq(chartOfAccounts.accountType, filters.accountType));
      }
      
      if (filters.isActive !== undefined) {
        conditions.push(eq(chartOfAccounts.isActive, filters.isActive));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const accounts = await query.orderBy(asc(chartOfAccounts.accountCode));
      
      if (filters.includeBalance) {
        // Calculate current balance for each account
        const accountsWithBalance = await Promise.all(
          accounts.map(async (account) => {
            const balance = await this.calculateAccountBalance(account.id);
            return { ...account, currentBalance: balance };
          })
        );
        return accountsWithBalance;
      }
      
      return accounts;
    } catch (error) {
      throw new Error(`Failed to get chart of accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create new account in Chart of Accounts
   */
  async createAccount(accountData: {
    accountCode: string;
    accountName: string;
    accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    parentAccountId?: string;
    description?: string;
    isActive?: boolean;
  }, createdBy: string) {
    try {
      // Check if account code already exists
      const existingAccount = await db.select()
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.accountCode, accountData.accountCode))
        .limit(1);
        
      if (existingAccount.length > 0) {
        throw new Error('Account code already exists');
      }

      const [newAccount] = await db.insert(chartOfAccounts)
        .values({
          accountCode: accountData.accountCode,
          accountName: accountData.accountName,
          accountType: accountData.accountType,
          parentAccountId: accountData.parentAccountId || null,
          description: accountData.description || null,
          isActive: accountData.isActive ?? true,
          createdBy,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return newAccount;
    } catch (error) {
      throw new Error(`Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create journal entry with line items
   */
  async createJournalEntry(entryData: {
    entryType: 'manual' | 'automatic' | 'adjustment' | 'closing';
    description: string;
    referenceNumber?: string;
    transactionDate?: Date;
    lineItems: Array<{
      accountId: string;
      debitAmount?: number;
      creditAmount?: number;
      description?: string;
    }>;
  }, createdBy: string) {
    try {
      // Validate that debits equal credits
      const totalDebits = entryData.lineItems.reduce((sum, item) => sum + (item.debitAmount || 0), 0);
      const totalCredits = entryData.lineItems.reduce((sum, item) => sum + (item.creditAmount || 0), 0);
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error('Total debits must equal total credits');
      }

      // Generate entry number
      const entryNumber = await this.generateJournalEntryNumber();
      
      // Create journal entry
      const [journalEntry] = await db.insert(journalEntries)
        .values({
          entryNumber,
          entryType: entryData.entryType,
          description: entryData.description,
          referenceNumber: entryData.referenceNumber || null,
          transactionDate: entryData.transactionDate || new Date(),
          totalDebitAmount: totalDebits,
          totalCreditAmount: totalCredits,
          status: 'draft',
          createdBy,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Create line items
      const lineItemsData = entryData.lineItems.map(item => ({
        journalEntryId: journalEntry.id,
        accountId: item.accountId,
        debitAmount: item.debitAmount || 0,
        creditAmount: item.creditAmount || 0,
        description: item.description || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await db.insert(journalEntryLineItems).values(lineItemsData);

      // Return journal entry with line items
      const entryWithLineItems = await this.getJournalEntryWithLineItems(journalEntry.id);
      return entryWithLineItems;
    } catch (error) {
      throw new Error(`Failed to create journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get journal entries with filtering
   */
  async getJournalEntries(filters: {
    startDate?: Date;
    endDate?: Date;
    entryType?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    try {
      let query = db.select().from(journalEntries);
      
      const conditions = [];
      
      if (filters.startDate) {
        conditions.push(gte(journalEntries.transactionDate, filters.startDate));
      }
      
      if (filters.endDate) {
        conditions.push(lte(journalEntries.transactionDate, filters.endDate));
      }
      
      if (filters.entryType) {
        conditions.push(eq(journalEntries.entryType, filters.entryType));
      }
      
      if (filters.status) {
        conditions.push(eq(journalEntries.status, filters.status));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const entries = await query
        .orderBy(desc(journalEntries.transactionDate))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit);
      
      return entries;
    } catch (error) {
      throw new Error(`Failed to get journal entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Post journal entry (move from draft to posted)
   */
  async postJournalEntry(entryId: string, postedBy: string) {
    try {
      const [updatedEntry] = await db.update(journalEntries)
        .set({
          status: 'posted',
          postedBy,
          postedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(journalEntries.id, entryId))
        .returning();

      if (!updatedEntry) {
        throw new Error('Journal entry not found');
      }

      return updatedEntry;
    } catch (error) {
      throw new Error(`Failed to post journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get general ledger for an account
   */
  async getGeneralLedger(accountId: string, filters: {
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
  }) {
    try {
      // Get account details
      const [account] = await db.select()
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.id, accountId))
        .limit(1);

      if (!account) {
        throw new Error('Account not found');
      }

      // Get transactions for this account
      let query = db.select({
        journalEntryId: journalEntryLineItems.journalEntryId,
        transactionDate: journalEntries.transactionDate,
        description: journalEntries.description,
        referenceNumber: journalEntries.referenceNumber,
        debitAmount: journalEntryLineItems.debitAmount,
        creditAmount: journalEntryLineItems.creditAmount,
        lineDescription: journalEntryLineItems.description
      })
      .from(journalEntryLineItems)
      .innerJoin(journalEntries, eq(journalEntryLineItems.journalEntryId, journalEntries.id))
      .where(and(
        eq(journalEntryLineItems.accountId, accountId),
        eq(journalEntries.status, 'posted')
      ));

      const conditions = [
        eq(journalEntryLineItems.accountId, accountId),
        eq(journalEntries.status, 'posted')
      ];

      if (filters.startDate) {
        conditions.push(gte(journalEntries.transactionDate, filters.startDate));
      }

      if (filters.endDate) {
        conditions.push(lte(journalEntries.transactionDate, filters.endDate));
      }

      query = query.where(and(...conditions));

      const transactions = await query
        .orderBy(desc(journalEntries.transactionDate))
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit);

      // Calculate running balance
      let runningBalance = 0;
      const transactionsWithBalance = transactions.map(transaction => {
        const amount = transaction.debitAmount - transaction.creditAmount;
        runningBalance += amount;
        
        return {
          ...transaction,
          runningBalance
        };
      });

      return {
        account,
        transactions: transactionsWithBalance,
        currentBalance: runningBalance
      };
    } catch (error) {
      throw new Error(`Failed to get general ledger: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get trial balance
   */
  async getTrialBalance(asOfDate: Date) {
    try {
      const accounts = await db.select()
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.isActive, true))
        .orderBy(asc(chartOfAccounts.accountCode));

      const trialBalanceData = await Promise.all(
        accounts.map(async (account) => {
          const balance = await this.calculateAccountBalance(account.id, asOfDate);
          
          return {
            accountId: account.id,
            accountCode: account.accountCode,
            accountName: account.accountName,
            accountType: account.accountType,
            debitBalance: balance > 0 ? balance : 0,
            creditBalance: balance < 0 ? Math.abs(balance) : 0
          };
        })
      );

      const totalDebits = trialBalanceData.reduce((sum, item) => sum + item.debitBalance, 0);
      const totalCredits = trialBalanceData.reduce((sum, item) => sum + item.creditBalance, 0);

      return {
        asOfDate,
        accounts: trialBalanceData,
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
      };
    } catch (error) {
      throw new Error(`Failed to generate trial balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get balance sheet
   */
  async getBalanceSheet(asOfDate: Date) {
    try {
      const accounts = await db.select()
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.isActive, true));

      const balanceSheetData = {
        assets: [] as any[],
        liabilities: [] as any[],
        equity: [] as any[],
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0
      };

      for (const account of accounts) {
        const balance = await this.calculateAccountBalance(account.id, asOfDate);
        
        const accountData = {
          accountId: account.id,
          accountCode: account.accountCode,
          accountName: account.accountName,
          balance: Math.abs(balance)
        };

        if (account.accountType === 'asset' && balance !== 0) {
          balanceSheetData.assets.push(accountData);
          balanceSheetData.totalAssets += Math.abs(balance);
        } else if (account.accountType === 'liability' && balance !== 0) {
          balanceSheetData.liabilities.push(accountData);
          balanceSheetData.totalLiabilities += Math.abs(balance);
        } else if (account.accountType === 'equity' && balance !== 0) {
          balanceSheetData.equity.push(accountData);
          balanceSheetData.totalEquity += Math.abs(balance);
        }
      }

      return {
        asOfDate,
        ...balanceSheetData
      };
    } catch (error) {
      throw new Error(`Failed to generate balance sheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get profit and loss statement
   */
  async getProfitLossStatement(startDate: Date, endDate: Date) {
    try {
      const accounts = await db.select()
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.isActive, true));

      const profitLossData = {
        revenue: [] as any[],
        expenses: [] as any[],
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0
      };

      for (const account of accounts) {
        if (account.accountType === 'revenue' || account.accountType === 'expense') {
          const balance = await this.calculateAccountBalanceForPeriod(account.id, startDate, endDate);
          
          if (balance !== 0) {
            const accountData = {
              accountId: account.id,
              accountCode: account.accountCode,
              accountName: account.accountName,
              balance: Math.abs(balance)
            };

            if (account.accountType === 'revenue') {
              profitLossData.revenue.push(accountData);
              profitLossData.totalRevenue += Math.abs(balance);
            } else {
              profitLossData.expenses.push(accountData);
              profitLossData.totalExpenses += Math.abs(balance);
            }
          }
        }
      }

      profitLossData.netIncome = profitLossData.totalRevenue - profitLossData.totalExpenses;

      return {
        periodStart: startDate,
        periodEnd: endDate,
        ...profitLossData
      };
    } catch (error) {
      throw new Error(`Failed to generate P&L statement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create financial period
   */
  async createFinancialPeriod(periodData: {
    periodName: string;
    fiscalYear: number;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
  }, createdBy: string) {
    try {
      const [period] = await db.insert(financialPeriods)
        .values({
          periodName: periodData.periodName,
          fiscalYear: periodData.fiscalYear,
          startDate: periodData.startDate,
          endDate: periodData.endDate,
          status: 'open',
          isActive: periodData.isActive ?? true,
          createdBy,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return period;
    } catch (error) {
      throw new Error(`Failed to create financial period: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Close financial period
   */
  async closeFinancialPeriod(periodId: string, closedBy: string) {
    try {
      const [closedPeriod] = await db.update(financialPeriods)
        .set({
          status: 'closed',
          closedBy,
          closedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(financialPeriods.id, periodId))
        .returning();

      if (!closedPeriod) {
        throw new Error('Financial period not found');
      }

      return closedPeriod;
    } catch (error) {
      throw new Error(`Failed to close financial period: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private async calculateAccountBalance(accountId: string, asOfDate?: Date): Promise<number> {
    let query = db.select({
      totalDebits: sum(journalEntryLineItems.debitAmount),
      totalCredits: sum(journalEntryLineItems.creditAmount)
    })
    .from(journalEntryLineItems)
    .innerJoin(journalEntries, eq(journalEntryLineItems.journalEntryId, journalEntries.id))
    .where(and(
      eq(journalEntryLineItems.accountId, accountId),
      eq(journalEntries.status, 'posted')
    ));

    if (asOfDate) {
      query = query.where(and(
        eq(journalEntryLineItems.accountId, accountId),
        eq(journalEntries.status, 'posted'),
        lte(journalEntries.transactionDate, asOfDate)
      ));
    }

    const [result] = await query;
    
    const totalDebits = Number(result?.totalDebits || 0);
    const totalCredits = Number(result?.totalCredits || 0);
    
    return totalDebits - totalCredits;
  }

  private async calculateAccountBalanceForPeriod(accountId: string, startDate: Date, endDate: Date): Promise<number> {
    const [result] = await db.select({
      totalDebits: sum(journalEntryLineItems.debitAmount),
      totalCredits: sum(journalEntryLineItems.creditAmount)
    })
    .from(journalEntryLineItems)
    .innerJoin(journalEntries, eq(journalEntryLineItems.journalEntryId, journalEntries.id))
    .where(and(
      eq(journalEntryLineItems.accountId, accountId),
      eq(journalEntries.status, 'posted'),
      gte(journalEntries.transactionDate, startDate),
      lte(journalEntries.transactionDate, endDate)
    ));

    const totalDebits = Number(result?.totalDebits || 0);
    const totalCredits = Number(result?.totalCredits || 0);
    
    return totalDebits - totalCredits;
  }

  private async generateJournalEntryNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Get count of entries for this month
    const startOfMonth = new Date(year, today.getMonth(), 1);
    const endOfMonth = new Date(year, today.getMonth() + 1, 0);
    
    const [count] = await db.select({
      count: sum(journalEntries.id)
    })
    .from(journalEntries)
    .where(and(
      gte(journalEntries.createdAt, startOfMonth),
      lte(journalEntries.createdAt, endOfMonth)
    ));

    const sequence = String((Number(count?.count) || 0) + 1).padStart(4, '0');
    
    return `JE${year}${month}${sequence}`;
  }

  private async getJournalEntryWithLineItems(entryId: string) {
    const [entry] = await db.select()
      .from(journalEntries)
      .where(eq(journalEntries.id, entryId))
      .limit(1);

    const lineItems = await db.select()
      .from(journalEntryLineItems)
      .where(eq(journalEntryLineItems.journalEntryId, entryId));

    return {
      ...entry,
      lineItems
    };
  }
}
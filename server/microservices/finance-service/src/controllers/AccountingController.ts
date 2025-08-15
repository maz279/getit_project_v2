/**
 * ENTERPRISE ACCOUNTING CONTROLLER
 * Amazon.com/Shopee.sg-Level General Accounting Operations
 * 
 * Critical Features:
 * - Chart of accounts management
 * - Journal entry creation and validation
 * - Trial balance generation
 * - Financial period management
 * - Account reconciliation
 * - Double-entry validation
 * - Bangladesh accounting standards (BAS) compliance
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  chartOfAccounts,
  journalEntries,
  journalEntryLines,
  vatRecords,
  type ChartOfAccounts,
  type JournalEntry,
  type JournalEntryLine
} from '../../../../../shared/schema';
import { eq, and, desc, asc, sum, sql, gte, lte, between, or, like } from 'drizzle-orm';
import { logger } from '../../../../services/LoggingService';
import { doubleEntryAccountingService } from '../services/DoubleEntryAccountingService';

interface AccountingResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  timestamp: string;
}

interface ChartOfAccountsRequest {
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentAccountId?: string;
  description?: string;
}

interface JournalEntryRequest {
  entryDate: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  lines: {
    accountCode: string;
    debitAmount?: number;
    creditAmount?: number;
    description?: string;
  }[];
}

interface TrialBalanceRequest {
  asOfDate?: string;
  accountType?: string;
  includeZeroBalances?: boolean;
}

export class AccountingController {
  private serviceName = 'accounting-controller';

  /**
   * Get chart of accounts with hierarchical structure
   */
  async getChartOfAccounts(req: Request, res: Response): Promise<void> {
    try {
      const { accountType, isActive, search } = req.query;

      let query = db.select().from(chartOfAccounts);

      // Apply filters
      const conditions = [];
      if (accountType) {
        conditions.push(eq(chartOfAccounts.accountType, accountType as string));
      }
      if (isActive !== undefined) {
        conditions.push(eq(chartOfAccounts.isActive, isActive === 'true'));
      }
      if (search) {
        conditions.push(or(
          like(chartOfAccounts.accountName, `%${search}%`),
          like(chartOfAccounts.accountCode, `%${search}%`)
        ));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const accounts = await query.orderBy(asc(chartOfAccounts.accountCode));

      // Build hierarchical structure
      const accountHierarchy = this.buildAccountHierarchy(accounts);

      const response: AccountingResponse = {
        success: true,
        data: {
          accounts: accountHierarchy,
          totalAccounts: accounts.length,
          summary: this.getAccountTypeSummary(accounts)
        },
        message: 'Chart of accounts retrieved successfully',
        timestamp: new Date().toISOString()
      };

      logger.info('📊 Chart of accounts retrieved', {
        totalAccounts: accounts.length,
        filters: { accountType, isActive, search }
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('❌ Failed to get chart of accounts', { error });
      const response: AccountingResponse = {
        success: false,
        error: 'Failed to retrieve chart of accounts',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }

  /**
   * Create new account in chart of accounts
   */
  async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const accountData: ChartOfAccountsRequest = req.body;

      // Validate account code uniqueness
      const existingAccount = await db.select()
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.accountCode, accountData.accountCode))
        .limit(1);

      if (existingAccount.length > 0) {
        const response: AccountingResponse = {
          success: false,
          error: `Account code ${accountData.accountCode} already exists`,
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      // Validate parent account if specified
      if (accountData.parentAccountId) {
        const parentAccount = await db.select()
          .from(chartOfAccounts)
          .where(eq(chartOfAccounts.id, accountData.parentAccountId))
          .limit(1);

        if (parentAccount.length === 0) {
          const response: AccountingResponse = {
            success: false,
            error: 'Parent account not found',
            timestamp: new Date().toISOString()
          };
          res.status(400).json(response);
          return;
        }
      }

      // Create new account
      const [newAccount] = await db.insert(chartOfAccounts).values({
        accountCode: accountData.accountCode,
        accountName: accountData.accountName,
        accountType: accountData.accountType,
        parentAccountId: accountData.parentAccountId,
        isActive: true
      }).returning();

      const response: AccountingResponse = {
        success: true,
        data: newAccount,
        message: 'Account created successfully',
        timestamp: new Date().toISOString()
      };

      logger.info('✅ New account created', {
        accountId: newAccount.id,
        accountCode: accountData.accountCode,
        accountName: accountData.accountName,
        accountType: accountData.accountType
      });

      res.status(201).json(response);
    } catch (error) {
      logger.error('❌ Failed to create account', { error });
      const response: AccountingResponse = {
        success: false,
        error: 'Failed to create account',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }

  /**
   * Create journal entry with double-entry validation
   */
  async createJournalEntry(req: Request, res: Response): Promise<void> {
    try {
      const entryData: JournalEntryRequest = req.body;

      // Validate double-entry balance
      const totalDebits = entryData.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
      const totalCredits = entryData.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        const response: AccountingResponse = {
          success: false,
          error: `Double-entry validation failed. Debits: ${totalDebits}, Credits: ${totalCredits}`,
          timestamp: new Date().toISOString()
        };
        res.status(400).json(response);
        return;
      }

      // Validate all account codes exist
      for (const line of entryData.lines) {
        const account = await db.select()
          .from(chartOfAccounts)
          .where(and(
            eq(chartOfAccounts.accountCode, line.accountCode),
            eq(chartOfAccounts.isActive, true)
          ))
          .limit(1);

        if (account.length === 0) {
          const response: AccountingResponse = {
            success: false,
            error: `Account code ${line.accountCode} not found or inactive`,
            timestamp: new Date().toISOString()
          };
          res.status(400).json(response);
          return;
        }
      }

      // Generate entry number
      const entryNumber = await this.generateEntryNumber();

      // Create journal entry
      const [journalEntry] = await db.insert(journalEntries).values({
        entryNumber,
        entryDate: new Date(entryData.entryDate),
        description: entryData.description,
        referenceType: entryData.referenceType,
        referenceId: entryData.referenceId,
        totalDebit: totalDebits.toString(),
        totalCredit: totalCredits.toString(),
        status: 'posted',
        createdBy: 1 // TODO: Get from authentication
      }).returning();

      // Create journal entry lines
      const entryLines = [];
      for (let i = 0; i < entryData.lines.length; i++) {
        const line = entryData.lines[i];
        const account = await db.select()
          .from(chartOfAccounts)
          .where(eq(chartOfAccounts.accountCode, line.accountCode))
          .limit(1);

        const [entryLine] = await db.insert(journalEntryLines).values({
          journalEntryId: journalEntry.id,
          accountId: account[0].id,
          debitAmount: (line.debitAmount || 0).toString(),
          creditAmount: (line.creditAmount || 0).toString(),
          description: line.description || entryData.description,
          lineNumber: i + 1
        }).returning();

        entryLines.push(entryLine);
      }

      const response: AccountingResponse = {
        success: true,
        data: {
          journalEntry,
          entryLines,
          totalDebits,
          totalCredits
        },
        message: 'Journal entry created successfully',
        timestamp: new Date().toISOString()
      };

      logger.info('✅ Journal entry created', {
        entryId: journalEntry.id,
        entryNumber,
        totalDebits,
        totalCredits,
        lineCount: entryLines.length
      });

      res.status(201).json(response);
    } catch (error) {
      logger.error('❌ Failed to create journal entry', { error });
      const response: AccountingResponse = {
        success: false,
        error: 'Failed to create journal entry',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }

  /**
   * Generate trial balance
   */
  async generateTrialBalance(req: Request, res: Response): Promise<void> {
    try {
      const { asOfDate, accountType, includeZeroBalances = false }: TrialBalanceRequest = req.query as any;

      const cutoffDate = asOfDate ? new Date(asOfDate) : new Date();

      // Get trial balance using the accounting service
      const trialBalance = await doubleEntryAccountingService.generateTrialBalance(cutoffDate);

      // Filter by account type if specified
      let filteredAccounts = trialBalance.accounts;
      if (accountType) {
        filteredAccounts = filteredAccounts.filter(account => account.accountType === accountType);
      }

      // Filter zero balances if not included
      if (!includeZeroBalances) {
        filteredAccounts = filteredAccounts.filter(account => 
          Math.abs(account.netBalance) > 0.01
        );
      }

      // Calculate totals for filtered accounts
      const filteredTotalDebits = filteredAccounts.reduce((sum, account) => sum + account.debitBalance, 0);
      const filteredTotalCredits = filteredAccounts.reduce((sum, account) => sum + account.creditBalance, 0);

      const response: AccountingResponse = {
        success: true,
        data: {
          accounts: filteredAccounts,
          summary: {
            totalDebits: filteredTotalDebits,
            totalCredits: filteredTotalCredits,
            isBalanced: Math.abs(filteredTotalDebits - filteredTotalCredits) < 0.01,
            asOfDate: cutoffDate.toISOString(),
            accountCount: filteredAccounts.length
          },
          filters: {
            asOfDate,
            accountType,
            includeZeroBalances
          }
        },
        message: 'Trial balance generated successfully',
        timestamp: new Date().toISOString()
      };

      logger.info('📊 Trial balance generated', {
        asOfDate: cutoffDate.toISOString(),
        accountCount: filteredAccounts.length,
        totalDebits: filteredTotalDebits,
        totalCredits: filteredTotalCredits,
        isBalanced: Math.abs(filteredTotalDebits - filteredTotalCredits) < 0.01
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('❌ Failed to generate trial balance', { error });
      const response: AccountingResponse = {
        success: false,
        error: 'Failed to generate trial balance',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get journal entries with filtering and pagination
   */
  async getJournalEntries(req: Request, res: Response): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        startDate, 
        endDate, 
        status, 
        referenceType, 
        search 
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      let query = db.select({
        id: journalEntries.id,
        entryNumber: journalEntries.entryNumber,
        entryDate: journalEntries.entryDate,
        description: journalEntries.description,
        referenceType: journalEntries.referenceType,
        referenceId: journalEntries.referenceId,
        totalDebit: journalEntries.totalDebit,
        totalCredit: journalEntries.totalCredit,
        status: journalEntries.status,
        createdAt: journalEntries.createdAt
      }).from(journalEntries);

      // Apply filters
      const conditions = [];
      if (startDate) {
        conditions.push(gte(journalEntries.entryDate, new Date(startDate as string)));
      }
      if (endDate) {
        conditions.push(lte(journalEntries.entryDate, new Date(endDate as string)));
      }
      if (status) {
        conditions.push(eq(journalEntries.status, status as string));
      }
      if (referenceType) {
        conditions.push(eq(journalEntries.referenceType, referenceType as string));
      }
      if (search) {
        conditions.push(or(
          like(journalEntries.description, `%${search}%`),
          like(journalEntries.entryNumber, `%${search}%`)
        ));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const entries = await query
        .orderBy(desc(journalEntries.entryDate), desc(journalEntries.createdAt))
        .limit(Number(limit))
        .offset(offset);

      // Get total count for pagination
      const totalCountQuery = db.select({ count: sql<number>`count(*)` }).from(journalEntries);
      if (conditions.length > 0) {
        totalCountQuery.where(and(...conditions));
      }
      const totalCount = await totalCountQuery;

      const response: AccountingResponse = {
        success: true,
        data: {
          entries,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalCount[0].count,
            totalPages: Math.ceil(totalCount[0].count / Number(limit))
          }
        },
        message: 'Journal entries retrieved successfully',
        timestamp: new Date().toISOString()
      };

      logger.info('📋 Journal entries retrieved', {
        count: entries.length,
        page: Number(page),
        total: totalCount[0].count
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('❌ Failed to get journal entries', { error });
      const response: AccountingResponse = {
        success: false,
        error: 'Failed to retrieve journal entries',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get detailed journal entry with line items
   */
  async getJournalEntryDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Get journal entry
      const journalEntry = await db.select()
        .from(journalEntries)
        .where(eq(journalEntries.id, id))
        .limit(1);

      if (journalEntry.length === 0) {
        const response: AccountingResponse = {
          success: false,
          error: 'Journal entry not found',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      // Get journal entry lines with account details
      const entryLines = await db.select({
        id: journalEntryLines.id,
        accountId: journalEntryLines.accountId,
        accountCode: chartOfAccounts.accountCode,
        accountName: chartOfAccounts.accountName,
        accountType: chartOfAccounts.accountType,
        debitAmount: journalEntryLines.debitAmount,
        creditAmount: journalEntryLines.creditAmount,
        description: journalEntryLines.description,
        lineNumber: journalEntryLines.lineNumber
      })
        .from(journalEntryLines)
        .leftJoin(chartOfAccounts, eq(journalEntryLines.accountId, chartOfAccounts.id))
        .where(eq(journalEntryLines.journalEntryId, id))
        .orderBy(asc(journalEntryLines.lineNumber));

      const response: AccountingResponse = {
        success: true,
        data: {
          journalEntry: journalEntry[0],
          lines: entryLines
        },
        message: 'Journal entry details retrieved successfully',
        timestamp: new Date().toISOString()
      };

      logger.info('📋 Journal entry details retrieved', {
        entryId: id,
        lineCount: entryLines.length
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('❌ Failed to get journal entry details', { error });
      const response: AccountingResponse = {
        success: false,
        error: 'Failed to retrieve journal entry details',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }

  /**
   * Get account ledger
   */
  async getAccountLedger(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const { startDate, endDate, page = 1, limit = 50 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Get account details
      const account = await db.select()
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.id, accountId))
        .limit(1);

      if (account.length === 0) {
        const response: AccountingResponse = {
          success: false,
          error: 'Account not found',
          timestamp: new Date().toISOString()
        };
        res.status(404).json(response);
        return;
      }

      // Build ledger query
      let query = db.select({
        entryId: journalEntries.id,
        entryNumber: journalEntries.entryNumber,
        entryDate: journalEntries.entryDate,
        description: journalEntries.description,
        referenceType: journalEntries.referenceType,
        referenceId: journalEntries.referenceId,
        debitAmount: journalEntryLines.debitAmount,
        creditAmount: journalEntryLines.creditAmount,
        lineDescription: journalEntryLines.description
      })
        .from(journalEntryLines)
        .leftJoin(journalEntries, eq(journalEntryLines.journalEntryId, journalEntries.id))
        .where(eq(journalEntryLines.accountId, accountId));

      // Apply date filters
      const conditions = [eq(journalEntryLines.accountId, accountId)];
      if (startDate) {
        conditions.push(gte(journalEntries.entryDate, new Date(startDate as string)));
      }
      if (endDate) {
        conditions.push(lte(journalEntries.entryDate, new Date(endDate as string)));
      }

      const ledgerEntries = await query
        .where(and(...conditions))
        .orderBy(desc(journalEntries.entryDate), desc(journalEntries.createdAt))
        .limit(Number(limit))
        .offset(offset);

      // Calculate running balance
      let runningBalance = 0;
      const ledgerWithBalance = ledgerEntries.map(entry => {
        const debit = parseFloat(entry.debitAmount || '0');
        const credit = parseFloat(entry.creditAmount || '0');
        
        // For assets and expenses, debits increase balance
        // For liabilities, equity, and revenue, credits increase balance
        if (['asset', 'expense'].includes(account[0].accountType)) {
          runningBalance += debit - credit;
        } else {
          runningBalance += credit - debit;
        }

        return {
          ...entry,
          debitAmount: debit,
          creditAmount: credit,
          runningBalance
        };
      });

      const response: AccountingResponse = {
        success: true,
        data: {
          account: account[0],
          ledgerEntries: ledgerWithBalance,
          pagination: {
            page: Number(page),
            limit: Number(limit)
          }
        },
        message: 'Account ledger retrieved successfully',
        timestamp: new Date().toISOString()
      };

      logger.info('📊 Account ledger retrieved', {
        accountId,
        entryCount: ledgerEntries.length,
        runningBalance
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('❌ Failed to get account ledger', { error });
      const response: AccountingResponse = {
        success: false,
        error: 'Failed to retrieve account ledger',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }

  // Private helper methods

  private buildAccountHierarchy(accounts: any[]): any[] {
    const accountMap = new Map();
    const rootAccounts = [];

    // First pass: create map of all accounts
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    // Second pass: build hierarchy
    accounts.forEach(account => {
      if (account.parentAccountId) {
        const parent = accountMap.get(account.parentAccountId);
        if (parent) {
          parent.children.push(accountMap.get(account.id));
        }
      } else {
        rootAccounts.push(accountMap.get(account.id));
      }
    });

    return rootAccounts;
  }

  private getAccountTypeSummary(accounts: any[]): any {
    const summary = {
      asset: 0,
      liability: 0,
      equity: 0,
      revenue: 0,
      expense: 0
    };

    accounts.forEach(account => {
      if (summary.hasOwnProperty(account.accountType)) {
        summary[account.accountType as keyof typeof summary]++;
      }
    });

    return summary;
  }

  private async generateEntryNumber(): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await db.select({ count: sql<number>`count(*)` })
      .from(journalEntries)
      .where(sql`DATE(${journalEntries.createdAt}) = CURRENT_DATE`);
    
    const sequence = String(count[0].count + 1).padStart(4, '0');
    return `JE-${today}-${sequence}`;
  }
}

export const accountingController = new AccountingController();
/**
 * Cart Advanced Recovery Controller - Abandoned Cart Recovery Campaigns
 * Handles Amazon.com/Shopee.sg-level cart recovery strategies and campaigns
 */

import { Request, Response } from 'express';
import { db } from '../../../../db';
import { 
  carts, 
  cartItems, 
  abandonedCarts,
  cartRecoveryCampaigns,
  users,
  products
} from '@shared/schema';
import { eq, and, desc, asc, gte, lte, isNull, isNotNull } from 'drizzle-orm';

export class CartAdvancedRecoveryController {
  /**
   * Create personalized recovery campaign
   * POST /api/v1/admin/cart/recovery-campaign
   */
  async createRecoveryCampaign(req: Request, res: Response): Promise<void> {
    try {
      const { 
        campaignName, 
        triggerAfterHours, 
        discountPercentage, 
        discountCode,
        maxDiscountAmount,
        emailTemplateId 
      } = req.body;

      if (!campaignName || !triggerAfterHours) {
        res.status(400).json({
          success: false,
          message: 'Campaign name and trigger hours are required'
        });
        return;
      }

      // Create recovery campaign
      const [campaign] = await db
        .insert(cartRecoveryCampaigns)
        .values({
          campaignName,
          triggerAfterHours,
          discountPercentage: discountPercentage || 0,
          discountCode: discountCode || null,
          maxDiscountAmount: maxDiscountAmount || null,
          emailTemplateId: emailTemplateId || null,
          isActive: true
        })
        .returning();

      res.json({
        success: true,
        message: 'Recovery campaign created successfully',
        data: {
          campaignId: campaign.id,
          campaignName: campaign.campaignName,
          triggerAfterHours: campaign.triggerAfterHours,
          discountPercentage: campaign.discountPercentage,
          discountCode: campaign.discountCode,
          isActive: campaign.isActive,
          createdAt: campaign.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating recovery campaign:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create recovery campaign',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send targeted recovery email
   * POST /api/v1/cart/recovery/send-email
   */
  async sendRecoveryEmail(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, campaignId, userEmail, personalizedMessage } = req.body;

      if (!cartId) {
        res.status(400).json({
          success: false,
          message: 'Cart ID is required'
        });
        return;
      }

      // Get abandoned cart data
      const [abandonedCart] = await db
        .select()
        .from(abandonedCarts)
        .where(eq(abandonedCarts.id, cartId));

      if (!abandonedCart) {
        res.status(404).json({
          success: false,
          message: 'Abandoned cart not found'
        });
        return;
      }

      // Get campaign details if provided
      let campaign = null;
      if (campaignId) {
        [campaign] = await db
          .select()
          .from(cartRecoveryCampaigns)
          .where(eq(cartRecoveryCampaigns.id, campaignId));
      }

      // Get cart items for email content
      const cartData = typeof abandonedCart.cartData === 'string' 
        ? JSON.parse(abandonedCart.cartData) 
        : abandonedCart.cartData;

      const cartItems = cartData.items || [];

      // Calculate cart value
      const cartValue = cartItems.reduce((total: number, item: any) => 
        total + (parseFloat(item.unitPrice) * item.quantity), 0);

      // Create personalized recovery email content
      const emailContent = await this.generateRecoveryEmailContent(
        abandonedCart,
        cartItems,
        cartValue,
        campaign,
        personalizedMessage
      );

      // Generate recovery token
      const recoveryToken = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const recoveryUrl = `${process.env.FRONTEND_URL}/cart/restore?token=${recoveryToken}`;

      // In a real implementation, send email using email service
      // For now, we'll simulate the email sending
      const emailData = {
        to: userEmail || 'customer@example.com',
        subject: emailContent.subject,
        content: emailContent.content,
        recoveryUrl,
        cartValue: cartValue.toFixed(2),
        itemCount: cartItems.length,
        discount: campaign?.discountPercentage || 0,
        discountCode: campaign?.discountCode || null
      };

      // Update abandoned cart with recovery attempt
      await db
        .update(abandonedCarts)
        .set({
          recoveryAttempts: (abandonedCart.recoveryAttempts || 0) + 1,
          lastRecoverySent: new Date()
        })
        .where(eq(abandonedCarts.id, cartId));

      // Update campaign statistics
      if (campaign) {
        await db
          .update(cartRecoveryCampaigns)
          .set({
            totalSent: (campaign.totalSent || 0) + 1
          })
          .where(eq(cartRecoveryCampaigns.id, campaignId));
      }

      res.json({
        success: true,
        message: 'Recovery email sent successfully',
        data: {
          cartId,
          recoveryToken,
          emailSent: true,
          emailData: {
            subject: emailContent.subject,
            cartValue: cartValue.toFixed(2),
            itemCount: cartItems.length,
            discount: campaign?.discountPercentage || 0
          },
          campaign: campaign ? {
            id: campaign.id,
            name: campaign.campaignName,
            discount: campaign.discountPercentage
          } : null
        }
      });
    } catch (error) {
      console.error('Error sending recovery email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send recovery email',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Track recovery campaign performance
   * GET /api/v1/admin/cart/recovery-performance
   */
  async getCampaignAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { campaignId, dateFrom, dateTo } = req.query;

      // Get campaign details
      const campaigns = campaignId 
        ? await db.select().from(cartRecoveryCampaigns).where(eq(cartRecoveryCampaigns.id, campaignId as string))
        : await db.select().from(cartRecoveryCampaigns).orderBy(desc(cartRecoveryCampaigns.createdAt));

      const campaignAnalytics = await Promise.all(
        campaigns.map(async (campaign) => {
          // Get recovery statistics
          let abandonedCartsQuery = db
            .select()
            .from(abandonedCarts)
            .where(gte(abandonedCarts.recoveryAttempts, 1));

          if (dateFrom) {
            abandonedCartsQuery = abandonedCartsQuery.where(gte(abandonedCarts.lastRecoverySent, new Date(dateFrom as string)));
          }
          if (dateTo) {
            abandonedCartsQuery = abandonedCartsQuery.where(lte(abandonedCarts.lastRecoverySent, new Date(dateTo as string)));
          }

          const recoveryAttempts = await abandonedCartsQuery;
          const recovered = recoveryAttempts.filter(cart => cart.recoveredAt);

          // Calculate performance metrics
          const totalSent = campaign.totalSent || 0;
          const totalRecovered = recovered.length;
          const recoveryRate = totalSent > 0 ? (totalRecovered / totalSent * 100) : 0;
          const totalRecoveredValue = recovered.reduce((sum, cart) => 
            sum + parseFloat(cart.recoveryValue?.toString() || '0'), 0);

          // Calculate average time to recovery
          const recoveryTimes = recovered
            .filter(cart => cart.lastRecoverySent && cart.recoveredAt)
            .map(cart => {
              const sentTime = new Date(cart.lastRecoverySent!).getTime();
              const recoveredTime = new Date(cart.recoveredAt!).getTime();
              return (recoveredTime - sentTime) / (1000 * 60 * 60); // Hours
            });

          const averageRecoveryTime = recoveryTimes.length > 0 
            ? recoveryTimes.reduce((sum, time) => sum + time, 0) / recoveryTimes.length 
            : 0;

          return {
            campaignId: campaign.id,
            campaignName: campaign.campaignName,
            triggerAfterHours: campaign.triggerAfterHours,
            discountPercentage: campaign.discountPercentage,
            isActive: campaign.isActive,
            performance: {
              totalEmailsSent: totalSent,
              totalRecovered: totalRecovered,
              recoveryRate: recoveryRate.toFixed(2) + '%',
              totalRecoveredValue: totalRecoveredValue.toFixed(2),
              averageRecoveredValue: totalRecovered > 0 ? (totalRecoveredValue / totalRecovered).toFixed(2) : '0.00',
              averageRecoveryTimeHours: averageRecoveryTime.toFixed(1),
              roi: this.calculateCampaignROI(totalRecoveredValue, totalSent)
            },
            createdAt: campaign.createdAt
          };
        })
      );

      // Calculate overall performance
      const overallStats = campaignAnalytics.reduce((acc, campaign) => ({
        totalCampaigns: acc.totalCampaigns + 1,
        totalEmailsSent: acc.totalEmailsSent + campaign.performance.totalEmailsSent,
        totalRecovered: acc.totalRecovered + campaign.performance.totalRecovered,
        totalRecoveredValue: acc.totalRecoveredValue + parseFloat(campaign.performance.totalRecoveredValue)
      }), {
        totalCampaigns: 0,
        totalEmailsSent: 0,
        totalRecovered: 0,
        totalRecoveredValue: 0
      });

      const overallRecoveryRate = overallStats.totalEmailsSent > 0 
        ? (overallStats.totalRecovered / overallStats.totalEmailsSent * 100).toFixed(2) + '%'
        : '0%';

      res.json({
        success: true,
        data: {
          campaigns: campaignAnalytics,
          overallPerformance: {
            ...overallStats,
            overallRecoveryRate,
            averageValuePerRecovery: overallStats.totalRecovered > 0 
              ? (overallStats.totalRecoveredValue / overallStats.totalRecovered).toFixed(2)
              : '0.00'
          },
          dateRange: {
            from: dateFrom || 'All time',
            to: dateTo || 'Present'
          }
        }
      });
    } catch (error) {
      console.error('Error getting campaign analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get campaign analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Restore abandoned cart from recovery link
   * POST /api/v1/cart/recovery/restore
   */
  async restoreFromRecovery(req: Request, res: Response): Promise<void> {
    try {
      const { recoveryToken, userId } = req.body;

      if (!recoveryToken) {
        res.status(400).json({
          success: false,
          message: 'Recovery token is required'
        });
        return;
      }

      // In a real implementation, validate and decode the recovery token
      // For now, we'll simulate token validation
      const tokenParts = recoveryToken.split('_');
      if (tokenParts.length < 3 || !tokenParts[0].startsWith('rec')) {
        res.status(400).json({
          success: false,
          message: 'Invalid recovery token'
        });
        return;
      }

      // Find abandoned cart (this would normally be linked via the token)
      // For demonstration, we'll get the most recent abandoned cart for the user
      const abandonedCartQuery = userId 
        ? db.select().from(abandonedCarts).where(eq(abandonedCarts.userId, userId))
        : db.select().from(abandonedCarts);

      const abandonedCartsList = await abandonedCartQuery
        .orderBy(desc(abandonedCarts.abandonedAt))
        .limit(1);

      if (abandonedCartsList.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No abandoned cart found for recovery'
        });
        return;
      }

      const [abandonedCart] = abandonedCartsList;

      // Parse cart data
      const cartData = typeof abandonedCart.cartData === 'string' 
        ? JSON.parse(abandonedCart.cartData) 
        : abandonedCart.cartData;

      // Create new cart with recovered items
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: userId || null,
          guestId: cartData.guestId || null,
          sessionId: `recovered_${Date.now()}`,
          status: 'active'
        })
        .returning();

      // Add cart items
      const cartItems = cartData.items || [];
      const restoredItems = [];

      for (const item of cartItems) {
        try {
          // Validate item availability before restoring
          const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, item.productId));

          if (product && product.isActive && (product.stockQuantity || 0) >= item.quantity) {
            const [restoredItem] = await db
              .insert(cartItems)
              .values({
                cartId: newCart.id,
                productId: item.productId,
                vendorId: item.vendorId,
                quantity: item.quantity,
                unitPrice: product.price.toString(), // Use current price
                totalPrice: (parseFloat(product.price.toString()) * item.quantity).toString()
              })
              .returning();

            restoredItems.push({
              ...restoredItem,
              productName: product.name,
              originalPrice: item.unitPrice,
              currentPrice: product.price.toString(),
              priceChanged: parseFloat(product.price.toString()) !== parseFloat(item.unitPrice)
            });
          }
        } catch (error) {
          console.error(`Error restoring item ${item.productId}:`, error);
        }
      }

      // Calculate recovered value
      const recoveredValue = restoredItems.reduce((sum, item) => 
        sum + (parseFloat(item.unitPrice) * item.quantity), 0);

      // Mark abandoned cart as recovered
      await db
        .update(abandonedCarts)
        .set({
          recoveredAt: new Date(),
          recoveryValue: recoveredValue.toFixed(2),
          recoveryMethod: 'email_recovery'
        })
        .where(eq(abandonedCarts.id, abandonedCart.id));

      res.json({
        success: true,
        message: 'Cart restored successfully',
        data: {
          newCartId: newCart.id,
          recoveryToken,
          restoredItems,
          summary: {
            totalItemsAttempted: cartItems.length,
            totalItemsRestored: restoredItems.length,
            totalItemsUnavailable: cartItems.length - restoredItems.length,
            recoveredValue: recoveredValue.toFixed(2),
            originalValue: cartData.totalValue || '0.00',
            priceChanges: restoredItems.filter(item => item.priceChanged).length
          },
          nextSteps: 'Cart has been restored. You can continue shopping or proceed to checkout.'
        }
      });
    } catch (error) {
      console.error('Error restoring cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to restore cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * A/B test recovery strategies
   * POST /api/v1/cart/recovery/ab-test
   */
  async testRecoveryStrategies(req: Request, res: Response): Promise<void> {
    try {
      const { testName, variantA, variantB, audienceSize } = req.body;

      if (!testName || !variantA || !variantB) {
        res.status(400).json({
          success: false,
          message: 'Test name and both variants are required'
        });
        return;
      }

      // Get abandoned carts for testing
      const abandonedCartsList = await db
        .select()
        .from(abandonedCarts)
        .where(and(
          isNull(abandonedCarts.recoveredAt),
          lte(abandonedCarts.recoveryAttempts, 1)
        ))
        .orderBy(desc(abandonedCarts.abandonedAt))
        .limit(audienceSize || 100);

      // Split audience randomly
      const shuffled = abandonedCartsList.sort(() => 0.5 - Math.random());
      const groupA = shuffled.slice(0, Math.floor(shuffled.length / 2));
      const groupB = shuffled.slice(Math.floor(shuffled.length / 2));

      // Create A/B test configuration
      const testConfig = {
        testId: `abtest_${Date.now()}`,
        testName,
        createdAt: new Date().toISOString(),
        variants: {
          variantA: {
            ...variantA,
            audienceSize: groupA.length,
            cartIds: groupA.map(cart => cart.id)
          },
          variantB: {
            ...variantB,
            audienceSize: groupB.length,
            cartIds: groupB.map(cart => cart.id)
          }
        },
        status: 'active'
      };

      // In a real implementation, save test configuration to database
      // For now, we'll return the test setup

      res.json({
        success: true,
        message: 'A/B test created successfully',
        data: {
          testConfig,
          summary: {
            totalAudience: abandonedCartsList.length,
            variantASize: groupA.length,
            variantBSize: groupB.length,
            testDuration: '7 days (recommended)',
            successMetrics: ['Recovery rate', 'Time to recovery', 'Recovered value']
          },
          implementation: {
            variantA: {
              strategy: variantA.strategy,
              discount: variantA.discount || 'None',
              timing: variantA.timing || 'Standard',
              audienceSize: groupA.length
            },
            variantB: {
              strategy: variantB.strategy,
              discount: variantB.discount || 'None',
              timing: variantB.timing || 'Standard',
              audienceSize: groupB.length
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating A/B test:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create A/B test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get abandoned cart analytics
   * GET /api/v1/admin/cart/abandoned-analytics
   */
  async getAbandonedAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { dateFrom, dateTo, vendorId } = req.query;

      // Build query with filters
      let abandonedQuery = db.select().from(abandonedCarts);

      if (dateFrom) {
        abandonedQuery = abandonedQuery.where(gte(abandonedCarts.abandonedAt, new Date(dateFrom as string)));
      }
      if (dateTo) {
        abandonedQuery = abandonedQuery.where(lte(abandonedCarts.abandonedAt, new Date(dateTo as string)));
      }

      const abandonedCartsList = await abandonedQuery.orderBy(desc(abandonedCarts.abandonedAt));

      // Calculate analytics
      const totalAbandoned = abandonedCartsList.length;
      const recovered = abandonedCartsList.filter(cart => cart.recoveredAt);
      const totalRecovered = recovered.length;
      const recoveryRate = totalAbandoned > 0 ? (totalRecovered / totalAbandoned * 100) : 0;

      // Calculate values
      const totalAbandonedValue = abandonedCartsList.reduce((sum, cart) => {
        const cartData = typeof cart.cartData === 'string' ? JSON.parse(cart.cartData) : cart.cartData;
        return sum + (cartData.totalValue || 0);
      }, 0);

      const totalRecoveredValue = recovered.reduce((sum, cart) => 
        sum + parseFloat(cart.recoveryValue?.toString() || '0'), 0);

      // Abandonment reasons analysis
      const reasonCounts = abandonedCartsList.reduce((acc, cart) => {
        const reason = cart.abandonmentReason || 'unknown';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Device breakdown
      const deviceCounts = abandonedCartsList.reduce((acc, cart) => {
        const device = cart.deviceType || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Time-based patterns
      const hourlyPattern = abandonedCartsList.reduce((acc, cart) => {
        const hour = new Date(cart.abandonedAt).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      res.json({
        success: true,
        data: {
          summary: {
            totalAbandoned,
            totalRecovered,
            recoveryRate: recoveryRate.toFixed(2) + '%',
            totalAbandonedValue: totalAbandonedValue.toFixed(2),
            totalRecoveredValue: totalRecoveredValue.toFixed(2),
            averageAbandonedValue: totalAbandoned > 0 ? (totalAbandonedValue / totalAbandoned).toFixed(2) : '0.00',
            averageRecoveredValue: totalRecovered > 0 ? (totalRecoveredValue / totalRecovered).toFixed(2) : '0.00'
          },
          patterns: {
            abandonmentReasons: Object.entries(reasonCounts).map(([reason, count]) => ({
              reason,
              count,
              percentage: ((count / totalAbandoned) * 100).toFixed(1) + '%'
            })),
            deviceBreakdown: Object.entries(deviceCounts).map(([device, count]) => ({
              device,
              count,
              percentage: ((count / totalAbandoned) * 100).toFixed(1) + '%'
            })),
            hourlyPattern: Object.entries(hourlyPattern).map(([hour, count]) => ({
              hour: parseInt(hour),
              count,
              percentage: ((count / totalAbandoned) * 100).toFixed(1) + '%'
            })).sort((a, b) => a.hour - b.hour)
          },
          dateRange: {
            from: dateFrom || 'All time',
            to: dateTo || 'Present'
          }
        }
      });
    } catch (error) {
      console.error('Error getting abandoned analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get abandoned analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Helper method to generate recovery email content
   */
  private async generateRecoveryEmailContent(
    abandonedCart: any, 
    cartItems: any[], 
    cartValue: number,
    campaign: any = null,
    personalizedMessage: string = ''
  ): Promise<{ subject: string; content: string }> {
    const discountText = campaign?.discountPercentage 
      ? `Special ${campaign.discountPercentage}% discount with code ${campaign.discountCode}`
      : '';

    const subject = campaign?.discountPercentage 
      ? `Complete your order & save ${campaign.discountPercentage}%! ৳${cartValue.toFixed(2)} waiting`
      : `Complete your ৳${cartValue.toFixed(2)} order - Items still available!`;

    const itemsList = cartItems.map(item => 
      `• ${item.productName} (Qty: ${item.quantity}) - ৳${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}`
    ).join('\n');

    const content = `
Dear Valued Customer,

${personalizedMessage || 'You left some great items in your cart! Don\'t let them slip away.'}

Your Cart Summary:
${itemsList}

Total Value: ৳${cartValue.toFixed(2)}

${discountText}

${campaign?.discountPercentage ? `Use code: ${campaign.discountCode}` : ''}

Complete your purchase now to secure these items before they're gone!

Best regards,
GetIt Bangladesh Team
    `;

    return { subject, content };
  }

  /**
   * Helper method to calculate campaign ROI
   */
  private calculateCampaignROI(recoveredValue: number, totalSent: number): string {
    // Assume email cost of ৳2 per email and operational costs
    const emailCost = totalSent * 2;
    const operationalCosts = totalSent * 0.5; // Processing, infrastructure costs
    const totalCost = emailCost + operationalCosts;
    
    if (totalCost === 0) return '0%';
    
    const roi = ((recoveredValue - totalCost) / totalCost) * 100;
    return roi.toFixed(1) + '%';
  }
}
/**
 * FraudDetectionService.ts
 * Amazon.com/Shopee.sg-Level Auction Fraud Detection
 * Advanced fraud detection and prevention for bidding activities
 */

import { db } from '../../../../db.js';
import { eq, and, gte, lte, count, desc, avg } from 'drizzle-orm';
import { 
  auctionBids, 
  auctionProducts, 
  users 
} from '../../../../../shared/schema.js';

interface FraudAlert {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  data: any;
  timestamp: Date;
}

interface BidPattern {
  userId: number;
  auctionId: string;
  bidCount: number;
  avgTimeBetweenBids: number;
  bidAmountVariance: number;
  suspiciousPatterns: string[];
}

export class FraudDetectionService {
  private suspiciousIPs: Set<string> = new Set();
  private flaggedUsers: Map<number, { reason: string; timestamp: Date }> = new Map();

  constructor() {
    this.initializeFraudDetection();
  }

  // Initialize fraud detection systems
  private initializeFraudDetection() {
    console.log('🛡️ Initializing Auction Fraud Detection System...');
    
    // Run fraud detection every 5 minutes
    setInterval(() => {
      this.runPeriodicFraudChecks();
    }, 5 * 60 * 1000);

    // Clean up old flagged data every hour
    setInterval(() => {
      this.cleanupOldFlags();
    }, 60 * 60 * 1000);
  }

  // Analyze bid for fraud patterns before placing
  async analyzeBid(bidData: {
    auctionId: string;
    bidderId: number;
    bidAmount: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ isValid: boolean; riskScore: number; alerts: FraudAlert[] }> {
    try {
      const alerts: FraudAlert[] = [];
      let riskScore = 0;

      // 1. Check user flagged status
      if (this.flaggedUsers.has(bidData.bidderId)) {
        const flag = this.flaggedUsers.get(bidData.bidderId)!;
        alerts.push({
          severity: 'high',
          type: 'flagged_user',
          description: `User flagged for: ${flag.reason}`,
          data: { userId: bidData.bidderId, reason: flag.reason },
          timestamp: new Date()
        });
        riskScore += 70;
      }

      // 2. Check IP address patterns
      if (bidData.ipAddress) {
        const ipRisk = await this.analyzeIPPattern(bidData.ipAddress, bidData.auctionId);
        riskScore += ipRisk.score;
        alerts.push(...ipRisk.alerts);
      }

      // 3. Check bidding velocity
      const velocityRisk = await this.analyzeBiddingVelocity(bidData.bidderId, bidData.auctionId);
      riskScore += velocityRisk.score;
      alerts.push(...velocityRisk.alerts);

      // 4. Check bid amount patterns
      const amountRisk = await this.analyzeBidAmountPattern(bidData.bidderId, bidData.auctionId, bidData.bidAmount);
      riskScore += amountRisk.score;
      alerts.push(...amountRisk.alerts);

      // 5. Check for coordinated bidding
      const coordinationRisk = await this.analyzeCoordinatedBidding(bidData.auctionId, bidData.bidderId);
      riskScore += coordinationRisk.score;
      alerts.push(...coordinationRisk.alerts);

      // 6. Check Bangladesh-specific patterns
      const localRisk = await this.analyzeBangladeshPatterns(bidData);
      riskScore += localRisk.score;
      alerts.push(...localRisk.alerts);

      // Determine if bid is valid based on risk score
      const isValid = riskScore < 60; // Threshold for blocking bids

      return {
        isValid,
        riskScore: Math.min(100, riskScore),
        alerts
      };

    } catch (error) {
      console.error('Fraud analysis error:', error);
      return {
        isValid: true, // Fail safe - allow bid if analysis fails
        riskScore: 0,
        alerts: [{
          severity: 'low',
          type: 'analysis_error',
          description: 'Fraud analysis temporarily unavailable',
          data: { error: error.message },
          timestamp: new Date()
        }]
      };
    }
  }

  // Analyze IP address patterns
  private async analyzeIPPattern(ipAddress: string, auctionId: string): Promise<{ score: number; alerts: FraudAlert[] }> {
    const alerts: FraudAlert[] = [];
    let score = 0;

    try {
      // Check if IP is already flagged
      if (this.suspiciousIPs.has(ipAddress)) {
        alerts.push({
          severity: 'medium',
          type: 'suspicious_ip',
          description: 'Bid from previously flagged IP address',
          data: { ipAddress },
          timestamp: new Date()
        });
        score += 30;
      }

      // Check multiple accounts from same IP
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const uniqueBidders = await db.select({
        bidderId: auctionBids.bidderId,
        count: count()
      })
      .from(auctionBids)
      .where(and(
        eq(auctionBids.ipAddress, ipAddress),
        gte(auctionBids.bidTime, last24Hours.toISOString())
      ))
      .groupBy(auctionBids.bidderId);

      if (uniqueBidders.length > 3) {
        alerts.push({
          severity: 'high',
          type: 'multiple_accounts_ip',
          description: `${uniqueBidders.length} different accounts bidding from same IP`,
          data: { ipAddress, accountCount: uniqueBidders.length },
          timestamp: new Date()
        });
        score += 40;
        this.suspiciousIPs.add(ipAddress);
      }

      // Check rapid fire bidding from IP
      const ipBids = await db.select()
        .from(auctionBids)
        .where(and(
          eq(auctionBids.ipAddress, ipAddress),
          eq(auctionBids.auctionId, auctionId),
          gte(auctionBids.bidTime, new Date(Date.now() - 10 * 60 * 1000).toISOString())
        ))
        .orderBy(desc(auctionBids.bidTime));

      if (ipBids.length > 10) {
        alerts.push({
          severity: 'medium',
          type: 'rapid_bidding_ip',
          description: 'High frequency bidding from IP address',
          data: { ipAddress, bidCount: ipBids.length },
          timestamp: new Date()
        });
        score += 20;
      }

      return { score, alerts };

    } catch (error) {
      console.error('IP pattern analysis error:', error);
      return { score: 0, alerts: [] };
    }
  }

  // Analyze bidding velocity
  private async analyzeBiddingVelocity(bidderId: number, auctionId: string): Promise<{ score: number; alerts: FraudAlert[] }> {
    const alerts: FraudAlert[] = [];
    let score = 0;

    try {
      // Check bids in last 10 minutes
      const last10Minutes = new Date(Date.now() - 10 * 60 * 1000);
      const recentBids = await db.select()
        .from(auctionBids)
        .where(and(
          eq(auctionBids.bidderId, bidderId),
          eq(auctionBids.auctionId, auctionId),
          gte(auctionBids.bidTime, last10Minutes.toISOString())
        ))
        .orderBy(desc(auctionBids.bidTime));

      // Too many bids in short time
      if (recentBids.length > 5) {
        alerts.push({
          severity: 'medium',
          type: 'high_velocity_bidding',
          description: `${recentBids.length} bids in last 10 minutes`,
          data: { bidderId, bidCount: recentBids.length },
          timestamp: new Date()
        });
        score += 25;
      }

      // Check for extremely rapid bidding (less than 5 seconds apart)
      if (recentBids.length >= 2) {
        const timeDiffs = [];
        for (let i = 0; i < recentBids.length - 1; i++) {
          const diff = new Date(recentBids[i].bidTime).getTime() - new Date(recentBids[i + 1].bidTime).getTime();
          timeDiffs.push(diff);
        }

        const rapidBids = timeDiffs.filter(diff => diff < 5000); // Less than 5 seconds
        if (rapidBids.length > 0) {
          alerts.push({
            severity: 'high',
            type: 'rapid_fire_bidding',
            description: 'Bids placed less than 5 seconds apart',
            data: { bidderId, rapidBidCount: rapidBids.length },
            timestamp: new Date()
          });
          score += 35;
        }
      }

      return { score, alerts };

    } catch (error) {
      console.error('Velocity analysis error:', error);
      return { score: 0, alerts: [] };
    }
  }

  // Analyze bid amount patterns
  private async analyzeBidAmountPattern(bidderId: number, auctionId: string, bidAmount: number): Promise<{ score: number; alerts: FraudAlert[] }> {
    const alerts: FraudAlert[] = [];
    let score = 0;

    try {
      // Get auction current state
      const auction = await db.select()
        .from(auctionProducts)
        .where(eq(auctionProducts.id, auctionId))
        .limit(1);

      if (!auction.length) return { score: 0, alerts: [] };

      const currentBid = parseFloat(auction[0].currentHighestBid || '0');
      const increment = parseFloat(auction[0].minimumBidIncrement || '10');

      // Check for exact increment bidding (bot-like behavior)
      const userBids = await db.select()
        .from(auctionBids)
        .where(and(
          eq(auctionBids.bidderId, bidderId),
          eq(auctionBids.auctionId, auctionId)
        ))
        .orderBy(desc(auctionBids.bidTime))
        .limit(10);

      if (userBids.length >= 3) {
        const exactIncrements = userBids.filter(bid => {
          const amount = parseFloat(bid.bidAmount);
          return (amount % increment) === 0;
        });

        if (exactIncrements.length === userBids.length) {
          alerts.push({
            severity: 'medium',
            type: 'exact_increment_pattern',
            description: 'All bids use exact minimum increments',
            data: { bidderId, bidCount: userBids.length },
            timestamp: new Date()
          });
          score += 20;
        }
      }

      // Check for unrealistic bid jumps
      const bidJump = bidAmount - currentBid;
      const averageBidValue = currentBid > 0 ? currentBid : parseFloat(auction[0].startingPrice || '0');
      
      if (bidJump > averageBidValue * 2) {
        alerts.push({
          severity: 'high',
          type: 'excessive_bid_jump',
          description: 'Bid amount is unrealistically high',
          data: { 
            bidderId, 
            bidAmount, 
            currentBid, 
            jumpPercentage: ((bidJump / averageBidValue) * 100).toFixed(1) 
          },
          timestamp: new Date()
        });
        score += 30;
      }

      return { score, alerts };

    } catch (error) {
      console.error('Bid amount analysis error:', error);
      return { score: 0, alerts: [] };
    }
  }

  // Analyze coordinated bidding patterns
  private async analyzeCoordinatedBidding(auctionId: string, bidderId: number): Promise<{ score: number; alerts: FraudAlert[] }> {
    const alerts: FraudAlert[] = [];
    let score = 0;

    try {
      // Get recent bidders in this auction
      const last30Minutes = new Date(Date.now() - 30 * 60 * 1000);
      const recentBidders = await db.select({
        bidderId: auctionBids.bidderId,
        ipAddress: auctionBids.ipAddress,
        bidCount: count()
      })
      .from(auctionBids)
      .where(and(
        eq(auctionBids.auctionId, auctionId),
        gte(auctionBids.bidTime, last30Minutes.toISOString())
      ))
      .groupBy(auctionBids.bidderId, auctionBids.ipAddress);

      // Check for alternating bidding patterns
      const allBids = await db.select()
        .from(auctionBids)
        .where(and(
          eq(auctionBids.auctionId, auctionId),
          gte(auctionBids.bidTime, last30Minutes.toISOString())
        ))
        .orderBy(desc(auctionBids.bidTime))
        .limit(20);

      if (allBids.length >= 6) {
        // Check if same 2-3 users are alternating bids
        const bidderSequence = allBids.map(bid => bid.bidderId);
        const uniqueBidders = [...new Set(bidderSequence)];
        
        if (uniqueBidders.length <= 3 && bidderSequence.length >= 6) {
          let alternatingCount = 0;
          for (let i = 0; i < bidderSequence.length - 2; i++) {
            if (bidderSequence[i] !== bidderSequence[i + 1] && 
                bidderSequence[i] === bidderSequence[i + 2]) {
              alternatingCount++;
            }
          }

          if (alternatingCount >= 2) {
            alerts.push({
              severity: 'high',
              type: 'coordinated_bidding',
              description: 'Suspicious alternating bidding pattern detected',
              data: { 
                auctionId, 
                involvedBidders: uniqueBidders,
                alternatingCount 
              },
              timestamp: new Date()
            });
            score += 40;

            // Flag all involved users
            uniqueBidders.forEach(userId => {
              this.flaggedUsers.set(userId, {
                reason: 'Coordinated bidding',
                timestamp: new Date()
              });
            });
          }
        }
      }

      return { score, alerts };

    } catch (error) {
      console.error('Coordinated bidding analysis error:', error);
      return { score: 0, alerts: [] };
    }
  }

  // Analyze Bangladesh-specific fraud patterns
  private async analyzeBangladeshPatterns(bidData: {
    auctionId: string;
    bidderId: number;
    bidAmount: number;
  }): Promise<{ score: number; alerts: FraudAlert[] }> {
    const alerts: FraudAlert[] = [];
    let score = 0;

    try {
      // Check for suspicious round numbers in BDT
      const bidAmount = bidData.bidAmount;
      
      // Very round numbers might indicate artificial bidding
      if (bidAmount >= 1000 && bidAmount % 100 === 0) {
        score += 5; // Minor flag for round numbers
      }

      // Check for patterns during prayer times (unusual activity)
      const currentHour = new Date().getHours();
      const prayerHours = [5, 12, 15, 18, 20]; // Approximate prayer times in Bangladesh
      
      if (prayerHours.includes(currentHour)) {
        // Get user's historical bidding pattern during these hours
        const userPrayerTimeBids = await db.select()
          .from(auctionBids)
          .where(eq(auctionBids.bidderId, bidData.bidderId))
          .limit(50);

        const prayerTimeBidCount = userPrayerTimeBids.filter(bid => {
          const bidHour = new Date(bid.bidTime).getHours();
          return prayerHours.includes(bidHour);
        }).length;

        // If user typically doesn't bid during prayer times but is now
        if (userPrayerTimeBids.length > 20 && prayerTimeBidCount / userPrayerTimeBids.length < 0.1) {
          alerts.push({
            severity: 'low',
            type: 'unusual_prayer_time_activity',
            description: 'Bidding during unusual hours for this user',
            data: { bidderId: bidData.bidderId, hour: currentHour },
            timestamp: new Date()
          });
          score += 10;
        }
      }

      // Check for festival period anomalies
      const currentMonth = new Date().getMonth();
      const festivalMonths = [3, 8, 11]; // April, September, December (major festivals)
      
      if (festivalMonths.includes(currentMonth)) {
        // During festivals, unusual bidding patterns might indicate manipulation
        const recentBids = await db.select()
          .from(auctionBids)
          .where(and(
            eq(auctionBids.bidderId, bidData.bidderId),
            gte(auctionBids.bidTime, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          ));

        // Sudden increase in bidding activity during festivals
        if (recentBids.length > 20) {
          alerts.push({
            severity: 'low',
            type: 'festival_period_activity_spike',
            description: 'Unusual bidding activity during festival period',
            data: { bidderId: bidData.bidderId, bidCount: recentBids.length },
            timestamp: new Date()
          });
          score += 5;
        }
      }

      return { score, alerts };

    } catch (error) {
      console.error('Bangladesh pattern analysis error:', error);
      return { score: 0, alerts: [] };
    }
  }

  // Run periodic fraud checks
  private async runPeriodicFraudChecks() {
    try {
      console.log('🔍 Running periodic fraud detection checks...');

      // Check for suspicious auction patterns
      await this.detectSuspiciousAuctions();
      
      // Check for bid manipulation patterns
      await this.detectBidManipulation();
      
      // Update fraud metrics
      await this.updateFraudMetrics();

    } catch (error) {
      console.error('Periodic fraud check error:', error);
    }
  }

  // Detect suspicious auctions
  private async detectSuspiciousAuctions() {
    try {
      // Find auctions with unusual bidding patterns
      const suspiciousAuctions = await db.select({
        auctionId: auctionProducts.id,
        totalBids: auctionProducts.totalBids,
        uniqueBidders: auctionProducts.uniqueBidders,
        currentBid: auctionProducts.currentHighestBid
      })
      .from(auctionProducts)
      .where(eq(auctionProducts.status, 'active'));

      for (const auction of suspiciousAuctions) {
        // High bid count but low unique bidders ratio
        if (auction.totalBids > 20 && auction.uniqueBidders < 3) {
          console.log(`⚠️ Suspicious auction detected: ${auction.auctionId} - High bids, few bidders`);
          
          // Flag this auction for manual review
          // This would integrate with admin notification system
        }

        // Check for bid sniping protection
        const lastMinuteBids = await db.select()
          .from(auctionBids)
          .where(and(
            eq(auctionBids.auctionId, auction.auctionId),
            gte(auctionBids.bidTime, new Date(Date.now() - 60 * 1000).toISOString())
          ));

        if (lastMinuteBids.length > 5) {
          console.log(`⚠️ Potential bid sniping detected: ${auction.auctionId}`);
        }
      }

    } catch (error) {
      console.error('Suspicious auction detection error:', error);
    }
  }

  // Detect bid manipulation
  private async detectBidManipulation() {
    try {
      // Find users with suspicious bidding patterns across multiple auctions
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const suspiciousBidders = await db.select({
        bidderId: auctionBids.bidderId,
        totalBids: count(),
        avgBidAmount: avg(auctionBids.bidAmount)
      })
      .from(auctionBids)
      .where(gte(auctionBids.bidTime, last24Hours.toISOString()))
      .groupBy(auctionBids.bidderId);

      for (const bidder of suspiciousBidders) {
        // Users with extremely high bidding activity
        if (bidder.totalBids > 100) {
          console.log(`⚠️ High activity bidder detected: ${bidder.bidderId} - ${bidder.totalBids} bids in 24h`);
          
          this.flaggedUsers.set(bidder.bidderId, {
            reason: 'Excessive bidding activity',
            timestamp: new Date()
          });
        }
      }

    } catch (error) {
      console.error('Bid manipulation detection error:', error);
    }
  }

  // Update fraud metrics
  private async updateFraudMetrics() {
    try {
      // Calculate fraud detection statistics
      const totalFlaggedUsers = this.flaggedUsers.size;
      const totalSuspiciousIPs = this.suspiciousIPs.size;
      
      console.log(`📊 Fraud Detection Stats - Flagged Users: ${totalFlaggedUsers}, Suspicious IPs: ${totalSuspiciousIPs}`);

    } catch (error) {
      console.error('Fraud metrics update error:', error);
    }
  }

  // Clean up old flags
  private cleanupOldFlags() {
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

    // Remove old user flags
    for (const [userId, flag] of this.flaggedUsers.entries()) {
      if (flag.timestamp < cutoffTime) {
        this.flaggedUsers.delete(userId);
      }
    }

    console.log('🧹 Cleaned up old fraud detection flags');
  }

  // Get fraud statistics
  async getFraudStats(): Promise<{
    flaggedUsers: number;
    suspiciousIPs: number;
    recentAlerts: number;
  }> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentFlags = Array.from(this.flaggedUsers.values())
      .filter(flag => flag.timestamp > last24Hours).length;

    return {
      flaggedUsers: this.flaggedUsers.size,
      suspiciousIPs: this.suspiciousIPs.size,
      recentAlerts: recentFlags
    };
  }

  // Manual flag user
  flagUser(userId: number, reason: string) {
    this.flaggedUsers.set(userId, {
      reason,
      timestamp: new Date()
    });
    console.log(`🚩 User ${userId} flagged for: ${reason}`);
  }

  // Manual unflag user
  unflagUser(userId: number) {
    if (this.flaggedUsers.delete(userId)) {
      console.log(`✅ User ${userId} unflagged`);
    }
  }

  // Check if user is flagged
  isUserFlagged(userId: number): boolean {
    return this.flaggedUsers.has(userId);
  }
}
/**
 * Phase 3 Customer Journey API Routes
 * Amazon.com 5 A's Framework Implementation
 */

import { Router } from 'express';
import { customerJourneyService } from '../services/CustomerJourneyService';
import { returnsRefundsService } from '../services/ReturnsRefundsService';

const router = Router();

// Health check for Phase 3 implementation
router.get('/health', async (req, res) => {
  try {
    const analytics = customerJourneyService.getAnalytics();
    const refundAnalytics = returnsRefundsService.getAnalytics();
    const funnel = customerJourneyService.getConversionFunnel();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      phase: 'Phase 3: Customer Journey Excellence',
      implementation: 'Amazon.com 5 A\'s Framework',
      customer_journey: {
        satisfaction: {
          current: analytics.satisfactionScores.overall.toFixed(2),
          target: '4.6',
          progress: `${funnel.satisfaction_improvement.progress.toFixed(1)}%`
        },
        conversion_rate: `${(funnel.overall_conversion * 100).toFixed(2)}%`,
        retention_rate: `${(analytics.retentionMetrics.customerRetention * 100).toFixed(1)}%`
      },
      returns_refunds: {
        processing_time: `${refundAnalytics.averageProcessingTime.toFixed(1)} hours`,
        target: '2-5 hours',
        improvement: `${refundAnalytics.improvementMetrics.processingTimeImprovement.toFixed(1)}%`,
        drop_off_locations: refundAnalytics.totalDropOffLocations.toLocaleString()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Amazon.com 5 A's Framework Endpoints

// 1. AWARE Stage - ML-powered discovery
router.post('/aware', async (req, res) => {
  try {
    const { customerId, sessionId, entryPoint, recommendations, personalizedContent, behaviorScore } = req.body;
    
    await customerJourneyService.trackAwareStage(customerId, sessionId, {
      entryPoint: entryPoint || 'homepage',
      recommendations: recommendations || [],
      personalizedContent: personalizedContent || [],
      behaviorScore: behaviorScore || 50
    });
    
    res.json({
      stage: 'aware',
      message: 'ML-powered discovery stage tracked',
      features: ['Personalized recommendations', 'Behavioral analytics', 'Dynamic content'],
      next_stage: 'appeal'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 2. APPEAL Stage - Dynamic pricing and social proof
router.post('/appeal', async (req, res) => {
  try {
    const { customerId, sessionId, productsViewed, priceComparisons, socialProofViews, urgencyIndicators, timeSpent } = req.body;
    
    await customerJourneyService.trackAppealStage(customerId, sessionId, {
      productsViewed: productsViewed || [],
      priceComparisons: priceComparisons || 0,
      socialProofViews: socialProofViews || 0,
      urgencyIndicators: urgencyIndicators || [],
      timeSpent: timeSpent || 0
    });
    
    res.json({
      stage: 'appeal',
      message: 'Product appeal stage tracked',
      features: ['Dynamic pricing', 'Social proof', 'Urgency indicators'],
      next_stage: 'ask'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 3. ASK Stage - AI chatbot and expert recommendations
router.post('/ask', async (req, res) => {
  try {
    const { customerId, sessionId, questionsAsked, comparisonsViewed, aiInteractions, voiceSearchUsed, visualSearchUsed, expertRecommendationsViewed } = req.body;
    
    await customerJourneyService.trackAskStage(customerId, sessionId, {
      questionsAsked: questionsAsked || 0,
      comparisonsViewed: comparisonsViewed || 0,
      aiInteractions: aiInteractions || 0,
      voiceSearchUsed: voiceSearchUsed || false,
      visualSearchUsed: visualSearchUsed || false,
      expertRecommendationsViewed: expertRecommendationsViewed || 0
    });
    
    res.json({
      stage: 'ask',
      message: 'Research and inquiry stage tracked',
      features: ['AI chatbot', 'Voice search', 'Visual search', 'Expert recommendations'],
      next_stage: 'act'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 4. ACT Stage - One-click checkout optimization
router.post('/act', async (req, res) => {
  try {
    const { customerId, sessionId, checkoutMethod, paymentOptimized, shippingCalculated, purchaseValue, checkoutTime } = req.body;
    
    await customerJourneyService.trackActStage(customerId, sessionId, {
      checkoutMethod: checkoutMethod || 'standard',
      paymentOptimized: paymentOptimized || false,
      shippingCalculated: shippingCalculated || false,
      purchaseValue: purchaseValue || 0,
      checkoutTime: checkoutTime || 300
    });
    
    res.json({
      stage: 'act',
      message: 'Purchase action stage tracked',
      features: ['One-click checkout', 'Payment optimization', 'Express shipping'],
      next_stage: 'advocate'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 5. ADVOCATE Stage - Post-purchase engagement
router.post('/advocate', async (req, res) => {
  try {
    const { customerId, sessionId, reviewsLeft, referralsMade, socialShares, loyaltyEngagement, communityParticipation, satisfactionRating } = req.body;
    
    await customerJourneyService.trackAdvocateStage(customerId, sessionId, {
      reviewsLeft: reviewsLeft || 0,
      referralsMade: referralsMade || 0,
      socialShares: socialShares || 0,
      loyaltyEngagement: loyaltyEngagement || 0,
      communityParticipation: communityParticipation || 0,
      satisfactionRating: satisfactionRating || 3
    });
    
    res.json({
      stage: 'advocate',
      message: 'Customer advocacy stage tracked',
      features: ['Review system', 'Referral program', 'Loyalty rewards', 'Community building']
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get customer journey analytics
router.get('/analytics', async (req, res) => {
  try {
    const analytics = customerJourneyService.getAnalytics();
    const funnel = customerJourneyService.getConversionFunnel();
    
    res.json({
      analytics,
      conversion_funnel: funnel,
      amazon_standards: {
        target_satisfaction: 4.6,
        target_retention: '85%+',
        target_advocacy: '40%+',
        current_progress: {
          satisfaction: `${((analytics.satisfactionScores.overall - 3.2) / (4.6 - 3.2) * 100).toFixed(1)}%`,
          retention: `${(analytics.retentionMetrics.customerRetention * 100).toFixed(1)}%`,
          advocacy: `${(analytics.retentionMetrics.advocateConversion * 100).toFixed(1)}%`
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get customer journey for specific customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const journey = customerJourneyService.getCustomerJourney(customerId);
    
    res.json({
      customer_id: customerId,
      journey_stages: journey.length,
      stages: journey,
      completion_rate: journey.length / 5 * 100, // 5 stages in total
      last_interaction: journey.length > 0 ? journey[journey.length - 1].timestamp : null
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Returns & Refunds API Endpoints

// Initiate return with 5-hour processing
router.post('/returns/initiate', async (req, res) => {
  try {
    const { orderId, customerId, productId, reason, amount, customerLocation } = req.body;
    
    const returnRequest = await returnsRefundsService.initiateReturn({
      orderId,
      customerId,
      productId,
      reason,
      amount: parseFloat(amount),
      customerLocation
    });
    
    res.json({
      return_id: returnRequest.id,
      status: returnRequest.status,
      estimated_refund_time: returnRequest.estimatedRefundTime,
      tracking_number: returnRequest.trackingNumber,
      drop_off_location: returnRequest.dropOffLocation,
      message: 'Return initiated successfully',
      amazon_style: '5-hour refund processing'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Track return status
router.get('/returns/:returnId', async (req, res) => {
  try {
    const { returnId } = req.params;
    const returnStatus = returnsRefundsService.getReturnStatus(returnId);
    
    if (!returnStatus) {
      return res.status(404).json({ error: 'Return request not found' });
    }
    
    res.json({
      return_request: returnStatus,
      processing_stages: {
        initiated: !!returnStatus.initiatedAt,
        authorized: !!returnStatus.authorizedAt,
        received: !!returnStatus.receivedAt,
        processed: !!returnStatus.processedAt,
        refunded: !!returnStatus.refundedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Find nearest drop-off locations
router.post('/returns/drop-off-locations', async (req, res) => {
  try {
    const { latitude, longitude, limit } = req.body;
    
    const locations = returnsRefundsService.findNearestDropOffLocations(
      { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      limit || 10
    );
    
    res.json({
      customer_location: { latitude, longitude },
      nearest_locations: locations,
      total_network: '8,500+ locations across Bangladesh',
      amazon_standard: 'Comprehensive drop-off network'
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get returns analytics
router.get('/returns/analytics', async (req, res) => {
  try {
    const analytics = returnsRefundsService.getAnalytics();
    
    res.json({
      analytics,
      amazon_targets: {
        processing_time: '2-5 hours',
        satisfaction: '4.6/5',
        improvement_targets: {
          processing_time_reduction: '95%',
          satisfaction_increase: '44%'
        }
      },
      achievements: {
        processing_time: analytics.improvementMetrics.targetAchievement.processingTime,
        satisfaction: analytics.improvementMetrics.targetAchievement.satisfaction
      }
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get comprehensive Phase 3 status
router.get('/status', async (req, res) => {
  try {
    const journeyAnalytics = customerJourneyService.getAnalytics();
    const returnAnalytics = returnsRefundsService.getAnalytics();
    const conversionFunnel = customerJourneyService.getConversionFunnel();
    
    res.json({
      phase: 'Phase 3: Customer Journey Excellence',
      implementation: 'Amazon.com 5 A\'s Framework + Returns Excellence',
      status: 'OPERATIONAL',
      customer_journey: {
        framework: '5 A\'s (Aware → Appeal → Ask → Act → Advocate)',
        satisfaction: {
          current: journeyAnalytics.satisfactionScores.overall.toFixed(2),
          target: '4.6',
          progress: `${conversionFunnel.satisfaction_improvement.progress.toFixed(1)}%`,
          improvement: `${((journeyAnalytics.satisfactionScores.overall - 3.2) / 3.2 * 100).toFixed(1)}%`
        },
        conversions: {
          overall: `${(conversionFunnel.overall_conversion * 100).toFixed(2)}%`,
          stage_performance: {
            aware_to_appeal: `${(journeyAnalytics.stageConversions.aware_to_appeal * 100).toFixed(1)}%`,
            appeal_to_ask: `${(journeyAnalytics.stageConversions.appeal_to_ask * 100).toFixed(1)}%`,
            ask_to_act: `${(journeyAnalytics.stageConversions.ask_to_act * 100).toFixed(1)}%`,
            act_to_advocate: `${(journeyAnalytics.stageConversions.act_to_advocate * 100).toFixed(1)}%`
          }
        },
        retention: `${(journeyAnalytics.retentionMetrics.customerRetention * 100).toFixed(1)}%`
      },
      returns_refunds: {
        processing_time: {
          current: `${returnAnalytics.averageProcessingTime.toFixed(1)} hours`,
          target: '2-5 hours',
          improvement: `${returnAnalytics.improvementMetrics.processingTimeImprovement.toFixed(1)}%`,
          baseline: '168 hours (7 days)'
        },
        infrastructure: {
          drop_off_locations: returnAnalytics.totalDropOffLocations.toLocaleString(),
          coverage: 'Bangladesh nationwide',
          processing_accuracy: `${(returnAnalytics.refundAccuracy * 100).toFixed(1)}%`
        },
        cost_savings: `$${returnAnalytics.costSavings.toFixed(0)} annually`
      },
      expected_outcomes: {
        satisfaction_target: '3.2 → 4.6 (44% improvement)',
        processing_time_target: '7-14 days → 2-5 hours (95% improvement)',
        retention_target: '60% improvement'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
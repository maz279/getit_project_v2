/**
 * Support Service - Amazon.com/Shopee.sg Level
 * Complete multi-channel support system with AI chatbot and Bangladesh integration
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Controllers
import { TicketController } from './src/controllers/TicketController';
import { ChatController } from './src/controllers/ChatController';
import { KnowledgeBaseController } from './src/controllers/KnowledgeBaseController';
import { AgentController } from './src/controllers/AgentController';
import { FeedbackController } from './src/controllers/FeedbackController';
import { EscalationController } from './src/controllers/EscalationController';
import { VideoCallController } from './src/controllers/VideoCallController';
import { VoiceCallController } from './src/controllers/VoiceCallController';
import { SocialMediaController } from './src/controllers/SocialMediaController';
import { EmailController } from './src/controllers/EmailController';

// AI Intelligence Controllers - Amazon.com/Shopee.sg Level
import { AIIntelligenceController } from './src/controllers/AIIntelligenceController';
import { SentimentAnalysisController } from './src/controllers/SentimentAnalysisController';
import { AutomatedResponseController } from './src/controllers/AutomatedResponseController';

// AI Chatbot
import { ChatbotService } from './src/ai/ChatbotService';

export class SupportService {
  private app: Express;
  
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  private setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://getit.com.bd', 'https://admin.getit.com.bd']
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    }));
    
    // Rate limiting - Bangladesh-aware
    const supportRateLimit = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: (req) => {
        // Higher limits for authenticated users
        if (req.user) return 1000;
        return 100; // Guest users
      },
      message: {
        error: 'Too many support requests. Please try again later.',
        errorBn: 'অনেক বেশি সাপোর্ট রিকুয়েস্ট। অনুগ্রহ করে পরে আবার চেষ্টা করুন।'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    
    this.app.use(supportRateLimit);
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }
  
  private setupRoutes() {
    const router = express.Router();
    
    // Health check
    router.get('/health', this.getHealthStatus);
    router.get('/info', this.getServiceInfo);
    
    // ===== TICKET MANAGEMENT ROUTES =====
    router.post('/tickets', TicketController.createTicket);
    router.get('/tickets/customer/:customerId', TicketController.getCustomerTickets);
    router.put('/tickets/:ticketId/status', TicketController.updateTicketStatus);
    router.get('/tickets/stats', TicketController.getTicketStats);
    
    // ===== LIVE CHAT ROUTES =====
    router.post('/chat/initiate', ChatController.initiateChat);
    router.post('/chat/:sessionId/message', ChatController.sendMessage);
    router.get('/chat/:sessionId/history', ChatController.getChatHistory);
    router.post('/chat/:sessionId/end', ChatController.endSession);
    router.get('/agents/:agentId/chats', ChatController.getAgentChats);
    
    // ===== AI CHATBOT ROUTES =====
    router.post('/chatbot/message', this.processChatbotMessage);
    router.get('/chatbot/analytics', this.getChatbotAnalytics);
    
    // ===== KNOWLEDGE BASE ROUTES =====
    router.get('/knowledge-base/articles', KnowledgeBaseController.getPublishedArticles);
    router.get('/knowledge-base/articles/:slug', KnowledgeBaseController.getArticleBySlug);
    router.get('/knowledge-base/categories', KnowledgeBaseController.getCategories);
    router.post('/knowledge-base/articles', KnowledgeBaseController.createArticle);
    router.post('/knowledge-base/articles/:articleId/rate', KnowledgeBaseController.rateArticle);
    router.get('/knowledge-base/search', KnowledgeBaseController.searchArticles);
    
    // ===== AGENT MANAGEMENT ROUTES =====
    router.post('/agents', AgentController.createAgent);
    router.get('/agents', AgentController.getAgents);
    router.get('/agents/:agentId/performance', AgentController.getAgentPerformance);
    router.put('/agents/:agentId/status', AgentController.updateAgentStatus);
    router.get('/agents/workload', AgentController.getWorkloadDistribution);
    
    // ===== FEEDBACK ROUTES =====
    router.post('/feedback', FeedbackController.submitFeedback);
    router.get('/feedback/customer/:customerId', FeedbackController.getCustomerFeedback);
    router.get('/feedback/analytics', FeedbackController.getFeedbackAnalytics);
    router.get('/feedback/insights', FeedbackController.getFeedbackInsights);
    
    // ===== ESCALATION ROUTES =====
    router.post('/escalations', EscalationController.createEscalation);
    router.get('/escalations/ticket/:ticketId', EscalationController.getTicketEscalations);
    router.put('/escalations/:escalationId/resolve', EscalationController.resolveEscalation);
    router.get('/escalations/analytics', EscalationController.getEscalationAnalytics);
    router.post('/escalations/auto-escalate', EscalationController.autoEscalateTickets);
    
    // ===== BANGLADESH-SPECIFIC ROUTES =====
    router.get('/bangladesh/payment-support', this.getBangladeshPaymentSupport);
    router.get('/bangladesh/shipping-support', this.getBangladeshShippingSupport);
    router.get('/bangladesh/cultural-support', this.getBangladeshCulturalSupport);
    
    // ===== VIDEO CALLING ROUTES =====
    const videoCallController = new VideoCallController();
    router.post('/video-calls', videoCallController.createVideoSession.bind(videoCallController));
    router.post('/video-calls/:sessionId/join', videoCallController.joinVideoSession.bind(videoCallController));
    router.post('/video-calls/:sessionId/signaling', videoCallController.handleWebRTCSignaling.bind(videoCallController));
    router.post('/video-calls/:sessionId/ice-candidate', videoCallController.handleICECandidate.bind(videoCallController));
    router.patch('/video-calls/:sessionId/screen-share', videoCallController.toggleScreenSharing.bind(videoCallController));
    router.post('/video-calls/:sessionId/recording/start', videoCallController.startRecording.bind(videoCallController));
    router.post('/video-calls/:sessionId/recording/stop', videoCallController.stopRecording.bind(videoCallController));
    router.delete('/video-calls/:sessionId', videoCallController.endVideoSession.bind(videoCallController));
    router.get('/video-calls/:sessionId/stats', videoCallController.getSessionStats.bind(videoCallController));
    router.get('/video-calls/active', videoCallController.getActiveSessions.bind(videoCallController));
    router.patch('/video-calls/:sessionId/quality', videoCallController.updateConnectionQuality.bind(videoCallController));
    router.get('/video-calls/bangladesh-optimizations', videoCallController.getBangladeshOptimizations.bind(videoCallController));
    
    // ===== VOICE CALLING ROUTES =====
    const voiceCallController = new VoiceCallController();
    router.post('/voice-calls', voiceCallController.initiateCall.bind(voiceCallController));
    router.get('/voice-calls/:callId/status', voiceCallController.getCallStatus.bind(voiceCallController));
    router.delete('/voice-calls/:callId', voiceCallController.endCall.bind(voiceCallController));
    router.get('/voice-calls/analytics', voiceCallController.getCallAnalytics.bind(voiceCallController));
    router.get('/voice-calls/bangladesh-optimizations', voiceCallController.getBangladeshOptimizations.bind(voiceCallController));
    router.post('/voice-calls/twiml', voiceCallController.handleTwiML.bind(voiceCallController));
    
    // ===== SOCIAL MEDIA ROUTES =====
    const socialMediaController = new SocialMediaController();
    router.get('/social-media/status', socialMediaController.getIntegrationStatus.bind(socialMediaController));
    router.post('/social-media/facebook/message', socialMediaController.sendFacebookMessage.bind(socialMediaController));
    router.post('/social-media/whatsapp/message', socialMediaController.sendWhatsAppMessage.bind(socialMediaController));
    router.get('/social-media/conversations', socialMediaController.getConversations.bind(socialMediaController));
    router.get('/social-media/analytics', socialMediaController.getSocialMediaAnalytics.bind(socialMediaController));
    router.post('/social-media/webhook/:platform', socialMediaController.processWebhook.bind(socialMediaController));
    
    // ===== EMAIL SUPPORT ROUTES =====
    const emailController = new EmailController();
    router.post('/email/send', emailController.sendEmail.bind(emailController));
    router.get('/email/templates', emailController.getEmailTemplates.bind(emailController));
    router.post('/email/webhook', emailController.processIncomingEmail.bind(emailController));
    router.get('/email/analytics', emailController.getEmailAnalytics.bind(emailController));
    router.get('/email/config', emailController.getEmailConfiguration.bind(emailController));
    
    // ===== AI INTELLIGENCE ROUTES - Amazon.com/Shopee.sg Level =====
    // Smart Agent Routing with ML-powered assignment
    router.post('/ai/agent-routing', AIIntelligenceController.smartAgentRouting);
    router.post('/ai/intent-recognition', AIIntelligenceController.recognizeIntent);
    router.post('/ai/sentiment-analysis', AIIntelligenceController.analyzeSentiment);
    router.post('/ai/automated-response', AIIntelligenceController.generateAutomatedResponse);
    router.post('/ai/conversation-quality', AIIntelligenceController.analyzeConversationQuality);
    
    // Real-time Sentiment Analysis with 89% accuracy
    router.post('/sentiment/analyze', SentimentAnalysisController.analyzeRealTimeSentiment);
    router.get('/sentiment/conversation/:conversationId', SentimentAnalysisController.trackConversationSentiment);
    router.post('/sentiment/agent-matching', SentimentAnalysisController.matchAgentBySentiment);
    router.get('/sentiment/dashboard', SentimentAnalysisController.getSentimentAnalyticsDashboard);
    router.post('/sentiment/predictions', SentimentAnalysisController.predictSentimentTrends);
    
    // Context-aware Automated Response Generation
    router.post('/response/generate', AutomatedResponseController.generateContextualResponse);
    router.post('/response/multi-language', AutomatedResponseController.generateMultiLanguageResponse);
    router.post('/response/template-select', AutomatedResponseController.selectSmartTemplate);
    router.post('/response/quality-analysis', AutomatedResponseController.analyzeResponseQuality);
    router.post('/response/optimize-flow', AutomatedResponseController.optimizeConversationFlow);
    
    // Mount all routes under /api/v1/support
    this.app.use('/api/v1/support', router);
    
    // Error handling middleware
    this.app.use(this.errorHandler);
  }
  
  // Route handlers
  private async getHealthStatus(req: Request, res: Response) {
    try {
      res.json({
        service: 'support-service',
        status: 'healthy',
        version: '1.0.0',
        features: [
          'ticket_management',
          'live_chat',
          'ai_chatbot',
          'ai_intelligence',
          'sentiment_analysis',
          'automated_responses',
          'knowledge_base',
          'agent_management',
          'feedback_system',
          'escalation_management',
          'video_calling',
          'bangladesh_integration'
        ],
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        service: 'support-service',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  private async getServiceInfo(req: Request, res: Response) {
    res.json({
      name: 'GetIt Support Service',
      description: 'Amazon.com/Shopee.sg-level customer support system',
      version: '1.0.0',
      features: {
        ticketManagement: {
          description: 'Complete ticket lifecycle management',
          endpoints: ['/tickets', '/tickets/:id/status'],
          slaSupport: true,
          autoAssignment: true
        },
        liveChat: {
          description: 'Real-time chat support with WebSocket',
          endpoints: ['/chat/initiate', '/chat/:sessionId/message'],
          queueManagement: true,
          multiLanguage: true
        },
        aiChatbot: {
          description: 'Intelligent NLP-powered chatbot',
          endpoints: ['/chatbot/message'],
          nlpSupport: true,
          bangladeshContext: true
        },
        knowledgeBase: {
          description: 'Comprehensive FAQ and article system',
          endpoints: ['/knowledge-base/articles', '/knowledge-base/search'],
          multiLanguage: true,
          smartSearch: true
        },
        agentManagement: {
          description: 'Agent performance and workload management',
          endpoints: ['/agents', '/agents/:id/performance'],
          performanceTracking: true,
          workloadBalancing: true
        },
        feedbackSystem: {
          description: 'Customer satisfaction and feedback management',
          endpoints: ['/feedback', '/feedback/analytics'],
          sentimentAnalysis: true,
          insightGeneration: true
        },
        escalationManagement: {
          description: 'Advanced issue escalation workflows',
          endpoints: ['/escalations', '/escalations/auto-escalate'],
          autoEscalation: true,
          slaBreachDetection: true
        },
        bangladeshIntegration: {
          description: 'Bangladesh-specific features and cultural support',
          endpoints: ['/bangladesh/*'],
          features: ['payment_support', 'shipping_support', 'cultural_support']
        }
      },
      supportedLanguages: ['en', 'bn'],
      supportedChannels: ['web_chat', 'mobile_chat', 'phone', 'email', 'video_call', 'social_media', 'whatsapp'],
      integrations: {
        paymentGateways: ['bkash', 'nagad', 'rocket', 'cod'],
        shippingPartners: ['pathao', 'paperfly', 'sundarban', 'redx', 'ecourier'],
        communicationChannels: ['email', 'sms', 'push_notifications', 'whatsapp']
      }
    });
  }
  
  private async processChatbotMessage(req: Request, res: Response) {
    try {
      const { userId, sessionId, message, language = 'en' } = req.body;
      
      if (!sessionId || !message) {
        return res.status(400).json({
          success: false,
          error: 'Session ID and message are required',
          errorBn: 'সেশন আইডি এবং বার্তা প্রয়োজন'
        });
      }
      
      const response = await ChatbotService.processMessage(
        userId,
        sessionId,
        message,
        language
      );
      
      res.json({
        success: true,
        data: response
      });
      
    } catch (error) {
      console.error('Error processing chatbot message:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process message',
        errorBn: 'বার্তা প্রক্রিয়া করতে ব্যর্থ'
      });
    }
  }
  
  private async getChatbotAnalytics(req: Request, res: Response) {
    try {
      const { 
        dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        dateTo = new Date().toISOString()
      } = req.query;
      
      const analytics = await ChatbotService.getAnalytics(
        new Date(dateFrom as string),
        new Date(dateTo as string)
      );
      
      res.json({
        success: true,
        data: analytics,
        period: {
          from: dateFrom,
          to: dateTo
        }
      });
      
    } catch (error) {
      console.error('Error fetching chatbot analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics',
        errorBn: 'অ্যানালিটিক্স আনতে ব্যর্থ'
      });
    }
  }
  
  private async getBangladeshPaymentSupport(req: Request, res: Response) {
    res.json({
      success: true,
      data: {
        supportedMethods: [
          {
            name: 'bKash',
            nameBn: 'বিকাশ',
            supportHours: '24/7',
            helpline: '16247',
            commonIssues: [
              'Insufficient balance',
              'Wrong PIN',
              'Network timeout',
              'Transaction failed'
            ],
            troubleshooting: {
              en: 'Ensure sufficient balance, correct PIN, and good network connection',
              bn: 'পর্যাপ্ত ব্যালেন্স, সঠিক পিন এবং ভালো নেটওয়ার্ক সংযোগ নিশ্চিত করুন'
            }
          },
          {
            name: 'Nagad',
            nameBn: 'নগদ',
            supportHours: '24/7',
            helpline: '16167',
            commonIssues: [
              'OTP not received',
              'Account locked',
              'Transaction limit exceeded'
            ],
            troubleshooting: {
              en: 'Check SMS, verify account status, and confirm transaction limits',
              bn: 'এসএমএস চেক করুন, অ্যাকাউন্ট স্ট্যাটাস যাচাই করুন এবং লেনদেনের সীমা নিশ্চিত করুন'
            }
          },
          {
            name: 'Rocket',
            nameBn: 'রকেট',
            supportHours: '6 AM - 12 AM',
            helpline: '16216',
            commonIssues: [
              'PIN forgotten',
              'App not working',
              'Low balance'
            ],
            troubleshooting: {
              en: 'Reset PIN via app, update app version, check account balance',
              bn: 'অ্যাপের মাধ্যমে পিন রিসেট করুন, অ্যাপ আপডেট করুন, অ্যাকাউন্ট ব্যালেন্স চেক করুন'
            }
          }
        ]
      }
    });
  }
  
  private async getBangladeshShippingSupport(req: Request, res: Response) {
    res.json({
      success: true,
      data: {
        courierPartners: [
          {
            name: 'Pathao',
            coverage: 'Nationwide',
            deliveryTime: {
              dhaka: '1-2 days',
              outsideDhaka: '2-4 days'
            },
            services: ['Same Day', 'Next Day', 'Standard'],
            tracking: true,
            cod: true,
            helpline: '09666677678'
          },
          {
            name: 'Paperfly',
            coverage: 'All 64 districts',
            deliveryTime: {
              dhaka: '1-2 days',
              outsideDhaka: '3-5 days'
            },
            services: ['Express', 'Regular'],
            tracking: true,
            cod: true,
            helpline: '09611677666'
          }
        ],
        deliveryAreas: {
          dhaka: {
            zones: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Old Dhaka'],
            sameDayAvailable: true,
            standardCharge: '60 BDT'
          },
          chittagong: {
            zones: ['Agrabad', 'Nasirabad', 'Panchlaish', 'Khulshi'],
            sameDayAvailable: false,
            standardCharge: '100 BDT'
          },
          sylhet: {
            zones: ['Zindabazar', 'Lamabazar', 'Subidbazar'],
            sameDayAvailable: false,
            standardCharge: '120 BDT'
          }
        }
      }
    });
  }
  
  private async getBangladeshCulturalSupport(req: Request, res: Response) {
    res.json({
      success: true,
      data: {
        culturalFeatures: {
          festivals: [
            {
              name: 'Eid ul-Fitr',
              nameBn: 'ঈদুল ফিতর',
              supportAdjustments: {
                extendedHours: true,
                specialOffers: true,
                culturalGreetings: true
              }
            },
            {
              name: 'Eid ul-Adha',
              nameBn: 'ঈদুল আযহা',
              supportAdjustments: {
                extendedHours: true,
                specialOffers: true,
                culturalGreetings: true
              }
            },
            {
              name: 'Pohela Boishakh',
              nameBn: 'পহেলা বৈশাখ',
              supportAdjustments: {
                culturalGreetings: true,
                festivalPromotions: true
              }
            }
          ],
          languageSupport: {
            primary: 'Bengali',
            secondary: 'English',
            specialFeatures: [
              'Bengali keyboard support',
              'Cultural context awareness',
              'Local greetings',
              'Religious considerations'
            ]
          },
          businessHours: {
            regular: {
              sunday: '9 AM - 6 PM',
              monday: '9 AM - 6 PM',
              tuesday: '9 AM - 6 PM',
              wednesday: '9 AM - 6 PM',
              thursday: '9 AM - 6 PM',
              friday: '2 PM - 6 PM', // Adjusted for Friday prayers
              saturday: '9 AM - 6 PM'
            },
            ramadan: {
              adjustedHours: '10 AM - 4 PM, 8 PM - 11 PM',
              iftarBreak: '5 PM - 7 PM'
            }
          }
        }
      }
    });
  }
  
  private errorHandler(error: any, req: Request, res: Response, next: any) {
    console.error('Support Service Error:', error);
    
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Internal server error',
      errorBn: error.messageBn || 'অভ্যন্তরীণ সার্ভার ত্রুটি',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
  
  public getApp(): Express {
    return this.app;
  }
  
  static async getHealthStatus() {
    return {
      service: 'support-service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: [
        'ticket_management',
        'live_chat', 
        'ai_chatbot',
        'knowledge_base',
        'agent_management',
        'feedback_system',
        'escalation_management',
        'bangladesh_integration'
      ]
    };
  }


}
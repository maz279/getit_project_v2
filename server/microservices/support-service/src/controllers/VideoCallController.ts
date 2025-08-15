/**
 * Video Call Controller - Amazon.com/Shopee.sg Level
 * Complete video calling management for customer support with Bangladesh optimization
 */

import { Request, Response } from 'express';
import WebRTCIntegration, { VideoSession } from '../integrations/WebRTCIntegration';

export class VideoCallController {
  private webrtcService: WebRTCIntegration;
  
  constructor() {
    this.webrtcService = new WebRTCIntegration();
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    this.webrtcService.on('sessionCreated', (session: VideoSession) => {
      console.log(`Video session created: ${session.sessionId}`);
    });
    
    this.webrtcService.on('sessionEnded', (session: VideoSession) => {
      console.log(`Video session ended: ${session.sessionId}`);
    });
  }
  
  /**
   * Create a new video call session
   */
  async createVideoSession(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, agentId, ticketId, recordingEnabled } = req.body;
      
      // Validation
      if (!customerId || !agentId) {
        res.status(400).json({
          success: false,
          error: 'Customer ID and Agent ID are required'
        });
        return;
      }
      
      const session = await this.webrtcService.createVideoSession({
        customerId,
        agentId,
        ticketId,
        recordingEnabled: recordingEnabled || false
      });
      
      res.status(201).json({
        success: true,
        message: 'Video session created successfully',
        session: {
          sessionId: session.sessionId,
          status: session.status,
          participants: session.participants.length,
          recordingEnabled: session.recordingEnabled,
          startTime: session.startTime
        }
      });
    } catch (error) {
      console.error('Create video session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create video session'
      });
    }
  }
  
  /**
   * Join an existing video session
   */
  async joinVideoSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { userId, userType, socketId } = req.body;
      
      if (!userId || !userType || !socketId) {
        res.status(400).json({
          success: false,
          error: 'User ID, user type, and socket ID are required'
        });
        return;
      }
      
      const joined = await this.webrtcService.joinVideoSession(sessionId, {
        userId,
        userType,
        socketId
      });
      
      if (joined) {
        const session = this.webrtcService.getActiveSessions()
          .find(s => s.sessionId === sessionId);
        
        res.status(200).json({
          success: true,
          message: 'Successfully joined video session',
          session: {
            sessionId: session?.sessionId,
            status: session?.status,
            participants: session?.participants.length,
            recordingEnabled: session?.recordingEnabled
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to join video session'
        });
      }
    } catch (error) {
      console.error('Join video session error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to join video session'
      });
    }
  }
  
  /**
   * Handle WebRTC signaling (offer/answer)
   */
  async handleWebRTCSignaling(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { sdp, type, candidate } = req.body;
      
      if (!sdp || !type) {
        res.status(400).json({
          success: false,
          error: 'SDP and type are required'
        });
        return;
      }
      
      const response = await this.webrtcService.handleWebRTCOffer(sessionId, {
        sessionId,
        sdp,
        type,
        candidate
      });
      
      res.status(200).json({
        success: true,
        message: 'WebRTC signaling handled successfully',
        response: response
      });
    } catch (error) {
      console.error('WebRTC signaling error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle WebRTC signaling'
      });
    }
  }
  
  /**
   * Handle ICE candidate exchange
   */
  async handleICECandidate(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { candidate } = req.body;
      
      if (!candidate) {
        res.status(400).json({
          success: false,
          error: 'ICE candidate is required'
        });
        return;
      }
      
      await this.webrtcService.handleICECandidate(sessionId, candidate);
      
      res.status(200).json({
        success: true,
        message: 'ICE candidate handled successfully'
      });
    } catch (error) {
      console.error('ICE candidate error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to handle ICE candidate'
      });
    }
  }
  
  /**
   * Toggle screen sharing
   */
  async toggleScreenSharing(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { userId, enabled } = req.body;
      
      if (!userId || enabled === undefined) {
        res.status(400).json({
          success: false,
          error: 'User ID and enabled status are required'
        });
        return;
      }
      
      await this.webrtcService.toggleScreenSharing(sessionId, userId, enabled);
      
      res.status(200).json({
        success: true,
        message: `Screen sharing ${enabled ? 'enabled' : 'disabled'} successfully`
      });
    } catch (error) {
      console.error('Toggle screen sharing error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle screen sharing'
      });
    }
  }
  
  /**
   * Start recording
   */
  async startRecording(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const recordingUrl = await this.webrtcService.startRecording(sessionId);
      
      res.status(200).json({
        success: true,
        message: 'Recording started successfully',
        recordingUrl
      });
    } catch (error) {
      console.error('Start recording error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start recording'
      });
    }
  }
  
  /**
   * Stop recording
   */
  async stopRecording(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const recordingUrl = await this.webrtcService.stopRecording(sessionId);
      
      res.status(200).json({
        success: true,
        message: 'Recording stopped successfully',
        recordingUrl
      });
    } catch (error) {
      console.error('Stop recording error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stop recording'
      });
    }
  }
  
  /**
   * End video session
   */
  async endVideoSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      await this.webrtcService.endVideoSession(sessionId);
      
      res.status(200).json({
        success: true,
        message: 'Video session ended successfully'
      });
    } catch (error) {
      console.error('End video session error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to end video session'
      });
    }
  }
  
  /**
   * Get session statistics
   */
  async getSessionStats(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      
      const stats = await this.webrtcService.getSessionStats(sessionId);
      
      res.status(200).json({
        success: true,
        message: 'Session statistics retrieved successfully',
        stats
      });
    } catch (error) {
      console.error('Get session stats error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get session statistics'
      });
    }
  }
  
  /**
   * Get all active sessions
   */
  async getActiveSessions(req: Request, res: Response): Promise<void> {
    try {
      const sessions = this.webrtcService.getActiveSessions();
      
      const sessionSummaries = sessions.map(session => ({
        sessionId: session.sessionId,
        status: session.status,
        participantCount: session.participants.length,
        duration: Date.now() - session.startTime.getTime(),
        recordingEnabled: session.recordingEnabled,
        screenSharingEnabled: session.screenSharingEnabled
      }));
      
      res.status(200).json({
        success: true,
        message: 'Active sessions retrieved successfully',
        sessions: sessionSummaries,
        total: sessionSummaries.length
      });
    } catch (error) {
      console.error('Get active sessions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get active sessions'
      });
    }
  }
  
  /**
   * Update connection quality
   */
  async updateConnectionQuality(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { bandwidth } = req.body;
      
      if (!bandwidth) {
        res.status(400).json({
          success: false,
          error: 'Bandwidth information is required'
        });
        return;
      }
      
      await this.webrtcService.updateSessionQuality(sessionId, bandwidth);
      
      res.status(200).json({
        success: true,
        message: 'Connection quality updated successfully'
      });
    } catch (error) {
      console.error('Update connection quality error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update connection quality'
      });
    }
  }
  
  /**
   * Bangladesh-specific features
   */
  async getBangladeshOptimizations(req: Request, res: Response): Promise<void> {
    try {
      const optimizations = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'turn:turn.getit.com.bd:3478' }
        ],
        qualitySettings: {
          '2G': { video: false, audio: true, bitrate: 32000 },
          '3G': { video: 'low', audio: true, bitrate: 128000 },
          '4G': { video: 'medium', audio: true, bitrate: 512000 },
          'WiFi': { video: 'high', audio: true, bitrate: 1024000 }
        },
        bangladeshFeatures: {
          bengaliInterface: true,
          festivalAwareScheduling: true,
          mobileOptimized: true,
          lowBandwidthMode: true
        }
      };
      
      res.status(200).json({
        success: true,
        message: 'Bangladesh optimizations retrieved successfully',
        optimizations
      });
    } catch (error) {
      console.error('Get Bangladesh optimizations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get Bangladesh optimizations'
      });
    }
  }
}

export default VideoCallController;
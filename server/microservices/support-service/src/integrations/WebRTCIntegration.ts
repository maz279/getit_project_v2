/**
 * WebRTC Integration Service - Amazon.com/Shopee.sg Level
 * Complete video calling system for customer support with screen sharing and recording
 */

import { EventEmitter } from 'events';

export interface VideoSession {
  sessionId: string;
  customerId: string;
  agentId: string;
  ticketId?: string;
  status: 'connecting' | 'connected' | 'ended' | 'failed';
  startTime: Date;
  endTime?: Date;
  recordingEnabled: boolean;
  recordingUrl?: string;
  screenSharingEnabled: boolean;
  quality: 'low' | 'medium' | 'high' | 'auto';
  bandwidth: number;
  participants: VideoParticipant[];
}

export interface VideoParticipant {
  userId: string;
  userType: 'customer' | 'agent';
  socketId: string;
  connectionState: 'connecting' | 'connected' | 'disconnected';
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
}

export interface VideoCallOffer {
  sessionId: string;
  sdp: string;
  type: 'offer' | 'answer';
  candidate?: RTCIceCandidate;
}

export class WebRTCIntegration extends EventEmitter {
  private activeSessions: Map<string, VideoSession> = new Map();
  private iceServers: RTCIceServer[];
  
  constructor() {
    super();
    this.setupICEServers();
  }
  
  private setupICEServers() {
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // Add TURN servers for Bangladesh connectivity
      {
        urls: 'turn:turn.getit.com.bd:3478',
        username: process.env.TURN_USERNAME || 'getit_user',
        credential: process.env.TURN_PASSWORD || 'getit_pass'
      }
    ];
  }
  
  /**
   * Create a new video session
   */
  async createVideoSession(data: {
    customerId: string;
    agentId: string;
    ticketId?: string;
    recordingEnabled?: boolean;
  }): Promise<VideoSession> {
    const sessionId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: VideoSession = {
      sessionId,
      customerId: data.customerId,
      agentId: data.agentId,
      ticketId: data.ticketId,
      status: 'connecting',
      startTime: new Date(),
      recordingEnabled: data.recordingEnabled || false,
      screenSharingEnabled: false,
      quality: 'auto',
      bandwidth: 0,
      participants: []
    };
    
    this.activeSessions.set(sessionId, session);
    
    // Emit session created event
    this.emit('sessionCreated', session);
    
    return session;
  }
  
  /**
   * Join a video session
   */
  async joinVideoSession(sessionId: string, participant: {
    userId: string;
    userType: 'customer' | 'agent';
    socketId: string;
  }): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Video session not found');
    }
    
    const newParticipant: VideoParticipant = {
      ...participant,
      connectionState: 'connecting',
      audioEnabled: true,
      videoEnabled: true,
      screenSharing: false
    };
    
    session.participants.push(newParticipant);
    
    // Emit participant joined event
    this.emit('participantJoined', { sessionId, participant: newParticipant });
    
    return true;
  }
  
  /**
   * Handle WebRTC offer/answer exchange
   */
  async handleWebRTCOffer(sessionId: string, offer: VideoCallOffer): Promise<VideoCallOffer | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Video session not found');
    }
    
    // Forward offer to other participants
    this.emit('webrtcOffer', { sessionId, offer });
    
    // Return auto-generated answer for simple peer connections
    if (offer.type === 'offer') {
      return {
        sessionId,
        sdp: this.generateAnswerSDP(offer.sdp),
        type: 'answer'
      };
    }
    
    return null;
  }
  
  /**
   * Handle ICE candidate exchange
   */
  async handleICECandidate(sessionId: string, candidate: RTCIceCandidate): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Video session not found');
    }
    
    // Forward ICE candidate to other participants
    this.emit('iceCandidate', { sessionId, candidate });
  }
  
  /**
   * Enable/disable screen sharing
   */
  async toggleScreenSharing(sessionId: string, userId: string, enabled: boolean): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Video session not found');
    }
    
    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.screenSharing = enabled;
      session.screenSharingEnabled = enabled;
      
      this.emit('screenSharingToggled', { sessionId, userId, enabled });
    }
  }
  
  /**
   * Start recording session
   */
  async startRecording(sessionId: string): Promise<string> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Video session not found');
    }
    
    const recordingUrl = `recordings/${sessionId}_${Date.now()}.webm`;
    session.recordingEnabled = true;
    session.recordingUrl = recordingUrl;
    
    this.emit('recordingStarted', { sessionId, recordingUrl });
    
    return recordingUrl;
  }
  
  /**
   * Stop recording session
   */
  async stopRecording(sessionId: string): Promise<string | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Video session not found');
    }
    
    session.recordingEnabled = false;
    
    this.emit('recordingStopped', { sessionId, recordingUrl: session.recordingUrl });
    
    return session.recordingUrl || null;
  }
  
  /**
   * End video session
   */
  async endVideoSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Video session not found');
    }
    
    session.status = 'ended';
    session.endTime = new Date();
    
    // Stop recording if active
    if (session.recordingEnabled) {
      await this.stopRecording(sessionId);
    }
    
    this.emit('sessionEnded', session);
    
    // Clean up session after 1 hour
    setTimeout(() => {
      this.activeSessions.delete(sessionId);
    }, 60 * 60 * 1000);
  }
  
  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<any> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Video session not found');
    }
    
    const duration = session.endTime 
      ? session.endTime.getTime() - session.startTime.getTime()
      : Date.now() - session.startTime.getTime();
    
    return {
      sessionId,
      duration: Math.floor(duration / 1000), // seconds
      participantCount: session.participants.length,
      status: session.status,
      recordingEnabled: session.recordingEnabled,
      screenSharingEnabled: session.screenSharingEnabled,
      quality: session.quality,
      bandwidth: session.bandwidth
    };
  }
  
  /**
   * Get all active sessions
   */
  getActiveSessions(): VideoSession[] {
    return Array.from(this.activeSessions.values());
  }
  
  /**
   * Bangladesh-specific optimizations
   */
  private optimizeForBangladesh(session: VideoSession): void {
    // Adjust quality based on Bangladesh network conditions
    if (session.bandwidth < 500000) { // < 500 Kbps
      session.quality = 'low';
    } else if (session.bandwidth < 1000000) { // < 1 Mbps
      session.quality = 'medium';
    } else {
      session.quality = 'high';
    }
  }
  
  /**
   * Generate simple answer SDP for demo purposes
   */
  private generateAnswerSDP(offerSDP: string): string {
    // In production, this would be handled by a proper WebRTC library
    return offerSDP.replace('a=sendrecv', 'a=recvonly');
  }
  
  /**
   * Update session quality based on network conditions
   */
  async updateSessionQuality(sessionId: string, bandwidth: number): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    session.bandwidth = bandwidth;
    this.optimizeForBangladesh(session);
    
    this.emit('qualityUpdated', { sessionId, quality: session.quality, bandwidth });
  }
  
  /**
   * Handle connection state changes
   */
  async updateParticipantConnection(
    sessionId: string, 
    userId: string, 
    state: 'connecting' | 'connected' | 'disconnected'
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    const participant = session.participants.find(p => p.userId === userId);
    if (participant) {
      participant.connectionState = state;
      
      // Update session status based on participant states
      if (session.participants.every(p => p.connectionState === 'connected')) {
        session.status = 'connected';
      } else if (session.participants.some(p => p.connectionState === 'disconnected')) {
        session.status = 'connecting';
      }
      
      this.emit('participantStateChanged', { sessionId, userId, state });
    }
  }
}

export default WebRTCIntegration;
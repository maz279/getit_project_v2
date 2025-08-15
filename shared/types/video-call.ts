/**
 * Video Call Types - Amazon.com/Shopee.sg Level
 * Complete type definitions for video calling system
 */

export interface VideoCallSession {
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

export interface WebRTCOffer {
  sessionId: string;
  sdp: string;
  type: 'offer' | 'answer';
  candidate?: RTCIceCandidate;
}

export interface VideoCallStats {
  sessionId: string;
  duration: number; // seconds
  participantCount: number;
  status: string;
  recordingEnabled: boolean;
  screenSharingEnabled: boolean;
  quality: string;
  bandwidth: number;
}

export interface BangladeshVideoOptimizations {
  iceServers: RTCIceServer[];
  qualitySettings: {
    [key: string]: {
      video: boolean | string;
      audio: boolean;
      bitrate: number;
    };
  };
  bangladeshFeatures: {
    bengaliInterface: boolean;
    festivalAwareScheduling: boolean;
    mobileOptimized: boolean;
    lowBandwidthMode: boolean;
  };
}

export interface CreateVideoSessionRequest {
  customerId: string;
  agentId: string;
  ticketId?: string;
  recordingEnabled?: boolean;
}

export interface JoinVideoSessionRequest {
  userId: string;
  userType: 'customer' | 'agent';
  socketId: string;
}

export interface ToggleScreenShareRequest {
  userId: string;
  enabled: boolean;
}

export interface UpdateQualityRequest {
  bandwidth: number;
}

export type VideoCallApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};
/**
 * Video Call API Service - Amazon.com/Shopee.sg Level
 * Complete API integration for video calling system
 */

const BASE_URL = '/api/v1/support/video-calls';

class VideoCallApiService {
  /**
   * Create a new video call session
   */
  async createVideoSession(data) {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create video session error:', error);
      throw error;
    }
  }

  /**
   * Join an existing video session
   */
  async joinVideoSession(sessionId, participantData) {
    try {
      const response = await fetch(`${BASE_URL}/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participantData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Join video session error:', error);
      throw error;
    }
  }

  /**
   * Handle WebRTC signaling
   */
  async sendWebRTCSignaling(sessionId, signalingData) {
    try {
      const response = await fetch(`${BASE_URL}/${sessionId}/signaling`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signalingData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('WebRTC signaling error:', error);
      throw error;
    }
  }

  /**
   * Send ICE candidate
   */
  async sendICECandidate(sessionId, candidate) {
    try {
      const response = await fetch(`${BASE_URL}/${sessionId}/ice-candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidate }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ICE candidate error:', error);
      throw error;
    }
  }

  /**
   * Toggle screen sharing
   */
  async toggleScreenSharing(sessionId, userId, enabled) {
    try {
      const response = await fetch(`${BASE_URL}/${sessionId}/screen-share`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, enabled }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Toggle screen sharing error:', error);
      throw error;
    }
  }

  /**
   * Start recording
   */
  async startRecording(sessionId) {
    try {
      const response = await fetch(`${BASE_URL}/${sessionId}/recording/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Start recording error:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  async stopRecording(sessionId) {
    try {
      const response = await fetch(`${BASE_URL}/${sessionId}/recording/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Stop recording error:', error);
      throw error;
    }
  }

  /**
   * End video session
   */
  async endVideoSession(sessionId) {
    try {
      const response = await fetch(`${BASE_URL}/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('End video session error:', error);
      throw error;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId) {
    try {
      const response = await fetch(`${BASE_URL}/${sessionId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get session stats error:', error);
      throw error;
    }
  }

  /**
   * Get all active sessions
   */
  async getActiveSessions() {
    try {
      const response = await fetch(`${BASE_URL}/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get active sessions error:', error);
      throw error;
    }
  }

  /**
   * Update connection quality
   */
  async updateConnectionQuality(sessionId, bandwidth) {
    try {
      const response = await fetch(`${BASE_URL}/${sessionId}/quality`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bandwidth }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update connection quality error:', error);
      throw error;
    }
  }

  /**
   * Get Bangladesh-specific optimizations
   */
  async getBangladeshOptimizations() {
    try {
      const response = await fetch(`${BASE_URL}/bangladesh-optimizations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get Bangladesh optimizations error:', error);
      throw error;
    }
  }

  /**
   * Check WebRTC browser support
   */
  checkWebRTCSupport() {
    const hasUserMedia = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    const hasRTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    const hasGetDisplayMedia = navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
    
    return {
      supported: hasUserMedia && hasRTCPeerConnection,
      features: {
        userMedia: hasUserMedia,
        peerConnection: hasRTCPeerConnection,
        screenShare: hasGetDisplayMedia,
      },
      recommendations: {
        browser: hasUserMedia && hasRTCPeerConnection ? 'supported' : 'Please use Chrome, Firefox, or Safari',
        https: location.protocol === 'https:' ? 'supported' : 'HTTPS required for video calling',
      }
    };
  }

  /**
   * Get network quality information for Bangladesh optimization
   */
  getNetworkQuality() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType, // 'slow-2g', '2g', '3g', '4g'
        downlink: connection.downlink, // Mbps
        rtt: connection.rtt, // ms
        saveData: connection.saveData, // boolean
      };
    }
    
    return {
      effectiveType: '4g', // Default assumption
      downlink: 1, // Default 1 Mbps
      rtt: 100, // Default 100ms
      saveData: false,
    };
  }
}

// Export singleton instance
const videoCallApiService = new VideoCallApiService();
export default videoCallApiService;
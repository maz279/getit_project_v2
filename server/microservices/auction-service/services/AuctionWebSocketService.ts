/**
 * AuctionWebSocketService.ts
 * Basic WebSocket service to prevent import errors
 */

export default class AuctionWebSocketService {
  constructor(httpServer?: any) {
    console.log('[AuctionWebSocketService] Initialized');
  }

  getServiceStats() {
    return {
      connectedUsers: 0,
      activeAuctions: 0,
      totalViewers: 0,
      totalBidders: 0
    };
  }

  cleanup(): void {
    console.log('[AuctionWebSocketService] Cleaned up');
  }
}
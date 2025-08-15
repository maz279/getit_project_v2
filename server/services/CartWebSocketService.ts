/**
 * Cart WebSocket Service - Amazon.com/Shopee.sg Level Real-time Cart Experience
 * Critical missing component for live cart synchronization
 */
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { cartRedisService } from './CartRedisService';

interface CartUpdate {
  type: 'CART_UPDATED' | 'ITEM_ADDED' | 'ITEM_REMOVED' | 'ITEM_QUANTITY_CHANGED' | 'CART_CLEARED' | 'INVENTORY_UPDATED' | 'PRICE_UPDATED';
  cartId: string;
  userId?: string;
  guestId?: string;
  data: any;
  timestamp: Date;
}

interface WebSocketClient {
  ws: WebSocket;
  userId?: string;
  guestId?: string;
  cartId?: string;
  deviceInfo?: any;
  lastPing: Date;
}

interface InventoryUpdate {
  productId: string;
  availableStock: number;
  isOutOfStock: boolean;
}

interface PriceUpdate {
  productId: string;
  newPrice: number;
  oldPrice: number;
  discountPercentage?: number;
}

export class CartWebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private userToClients: Map<string, Set<string>> = new Map();
  private cartToClients: Map<string, Set<string>> = new Map();
  private pingInterval: NodeJS.Timeout;

  constructor() {
    this.wss = new WebSocketServer({ 
      port: parseInt(process.env.CART_WS_PORT || '8080'),
      path: '/cart-ws'
    });

    this.setupWebSocketServer();
    this.startPingInterval();
    
    console.log('✅ Cart WebSocket service started on port', process.env.CART_WS_PORT || '8080');
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      const clientId = this.generateClientId();
      
      const client: WebSocketClient = {
        ws,
        lastPing: new Date()
      };
      
      this.clients.set(clientId, client);
      
      ws.on('message', (message: string) => {
        this.handleMessage(clientId, message);
      });
      
      ws.on('close', () => {
        this.handleClientDisconnect(clientId);
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket error for client', clientId, ':', error);
        this.handleClientDisconnect(clientId);
      });

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'CONNECTION_ESTABLISHED',
        clientId,
        timestamp: new Date()
      });
    });
  }

  private handleMessage(clientId: string, message: string): void {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(clientId);
      
      if (!client) return;

      switch (data.type) {
        case 'REGISTER_CLIENT':
          this.registerClient(clientId, data.userId, data.guestId, data.cartId, data.deviceInfo);
          break;
          
        case 'PING':
          client.lastPing = new Date();
          this.sendToClient(clientId, { type: 'PONG', timestamp: new Date() });
          break;
          
        case 'JOIN_CART':
          this.joinCart(clientId, data.cartId);
          break;
          
        case 'LEAVE_CART':
          this.leaveCart(clientId, data.cartId);
          break;
          
        case 'REQUEST_CART_SYNC':
          this.syncCartForClient(clientId);
          break;
          
        default:
          console.warn('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  private registerClient(clientId: string, userId?: string, guestId?: string, cartId?: string, deviceInfo?: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.userId = userId;
    client.guestId = guestId;
    client.cartId = cartId;
    client.deviceInfo = deviceInfo;

    // Map user to client
    if (userId) {
      if (!this.userToClients.has(userId)) {
        this.userToClients.set(userId, new Set());
      }
      this.userToClients.get(userId)!.add(clientId);
    }

    // Map cart to client
    if (cartId) {
      if (!this.cartToClients.has(cartId)) {
        this.cartToClients.set(cartId, new Set());
      }
      this.cartToClients.get(cartId)!.add(clientId);
    }

    this.sendToClient(clientId, {
      type: 'REGISTRATION_CONFIRMED',
      userId,
      guestId,
      cartId,
      timestamp: new Date()
    });

    console.log(`Client ${clientId} registered for ${userId ? `user ${userId}` : `guest ${guestId}`}, cart: ${cartId}`);
  }

  private joinCart(clientId: string, cartId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!this.cartToClients.has(cartId)) {
      this.cartToClients.set(cartId, new Set());
    }
    
    this.cartToClients.get(cartId)!.add(clientId);
    client.cartId = cartId;

    this.sendToClient(clientId, {
      type: 'CART_JOINED',
      cartId,
      timestamp: new Date()
    });
  }

  private leaveCart(clientId: string, cartId: string): void {
    const cartClients = this.cartToClients.get(cartId);
    if (cartClients) {
      cartClients.delete(clientId);
      if (cartClients.size === 0) {
        this.cartToClients.delete(cartId);
      }
    }

    this.sendToClient(clientId, {
      type: 'CART_LEFT',
      cartId,
      timestamp: new Date()
    });
  }

  private async syncCartForClient(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client || !client.cartId) return;

    try {
      const cart = await cartRedisService.getCart(client.cartId);
      if (cart) {
        this.sendToClient(clientId, {
          type: 'CART_SYNC',
          cartData: cart,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error syncing cart for client:', error);
    }
  }

  private handleClientDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from user mapping
    if (client.userId) {
      const userClients = this.userToClients.get(client.userId);
      if (userClients) {
        userClients.delete(clientId);
        if (userClients.size === 0) {
          this.userToClients.delete(client.userId);
        }
      }
    }

    // Remove from cart mapping
    if (client.cartId) {
      const cartClients = this.cartToClients.get(client.cartId);
      if (cartClients) {
        cartClients.delete(clientId);
        if (cartClients.size === 0) {
          this.cartToClients.delete(client.cartId);
        }
      }
    }

    this.clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  }

  private sendToClient(clientId: string, data: any): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending message to client:', error);
        this.handleClientDisconnect(clientId);
      }
    }
  }

  private generateClientId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = new Date();
      const timeout = 30000; // 30 seconds timeout

      for (const [clientId, client] of this.clients.entries()) {
        if (now.getTime() - client.lastPing.getTime() > timeout) {
          console.log(`Client ${clientId} timed out, disconnecting`);
          client.ws.terminate();
          this.handleClientDisconnect(clientId);
        } else {
          // Send ping
          this.sendToClient(clientId, { type: 'PING', timestamp: now });
        }
      }
    }, 15000); // Check every 15 seconds
  }

  /**
   * Public methods for broadcasting cart updates
   */

  /**
   * Broadcast cart update to all clients watching this cart
   */
  async broadcastCartUpdate(update: CartUpdate): Promise<void> {
    const cartClients = this.cartToClients.get(update.cartId);
    if (!cartClients) return;

    for (const clientId of cartClients) {
      this.sendToClient(clientId, {
        type: 'CART_UPDATE',
        update,
        timestamp: new Date()
      });
    }

    // Also send to all user's devices if userId is provided
    if (update.userId) {
      const userClients = this.userToClients.get(update.userId);
      if (userClients) {
        for (const clientId of userClients) {
          if (!cartClients.has(clientId)) { // Avoid duplicate sends
            this.sendToClient(clientId, {
              type: 'CART_UPDATE',
              update,
              timestamp: new Date()
            });
          }
        }
      }
    }
  }

  /**
   * Broadcast inventory update to relevant carts
   */
  async broadcastInventoryUpdate(productId: string, inventoryUpdate: InventoryUpdate): Promise<void> {
    // Find all carts that contain this product
    const affectedCarts = new Set<string>();
    
    for (const [cartId, clients] of this.cartToClients.entries()) {
      try {
        const cart = await cartRedisService.getCart(cartId);
        if (cart && cart.items.some(item => item.productId === productId)) {
          affectedCarts.add(cartId);
        }
      } catch (error) {
        console.error('Error checking cart for inventory update:', error);
      }
    }

    // Broadcast to affected carts
    for (const cartId of affectedCarts) {
      const cartClients = this.cartToClients.get(cartId);
      if (cartClients) {
        for (const clientId of cartClients) {
          this.sendToClient(clientId, {
            type: 'INVENTORY_UPDATE',
            productId,
            inventoryUpdate,
            timestamp: new Date()
          });
        }
      }
    }
  }

  /**
   * Broadcast price update to relevant carts
   */
  async broadcastPriceUpdate(productId: string, priceUpdate: PriceUpdate): Promise<void> {
    // Find all carts that contain this product
    const affectedCarts = new Set<string>();
    
    for (const [cartId, clients] of this.cartToClients.entries()) {
      try {
        const cart = await cartRedisService.getCart(cartId);
        if (cart && cart.items.some(item => item.productId === productId)) {
          affectedCarts.add(cartId);
        }
      } catch (error) {
        console.error('Error checking cart for price update:', error);
      }
    }

    // Broadcast to affected carts
    for (const cartId of affectedCarts) {
      const cartClients = this.cartToClients.get(cartId);
      if (cartClients) {
        for (const clientId of cartClients) {
          this.sendToClient(clientId, {
            type: 'PRICE_UPDATE',
            productId,
            priceUpdate,
            timestamp: new Date()
          });
        }
      }
    }
  }

  /**
   * Send notification to specific user across all devices
   */
  async sendUserNotification(userId: string, notification: any): Promise<void> {
    const userClients = this.userToClients.get(userId);
    if (!userClients) return;

    for (const clientId of userClients) {
      this.sendToClient(clientId, {
        type: 'USER_NOTIFICATION',
        notification,
        timestamp: new Date()
      });
    }
  }

  /**
   * Get connection statistics
   */
  getStatistics(): any {
    return {
      totalConnections: this.clients.size,
      uniqueUsers: this.userToClients.size,
      activeCarts: this.cartToClients.size,
      timestamp: new Date()
    };
  }

  /**
   * Close WebSocket server
   */
  close(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.wss.close(() => {
      console.log('Cart WebSocket server closed');
    });
  }

  /**
   * Health check
   */
  healthCheck(): any {
    return {
      status: 'healthy',
      connections: this.clients.size,
      uptime: process.uptime(),
      timestamp: new Date()
    };
  }
}

export const cartWebSocketService = new CartWebSocketService();
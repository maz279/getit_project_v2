/**
 * Event Streaming Service - Amazon.com/Shopee.sg-Level Event Infrastructure
 * Handles real-time event processing for order management
 */

import { EventEmitter } from 'events';
import { RedisService } from '../../../services/RedisService';
import { LoggingService } from '../../../services/LoggingService';

export interface OrderEvent {
  id: string;
  type: string;
  orderId: string;
  userId?: number;
  vendorId?: string;
  data: any;
  timestamp: Date;
  correlationId?: string;
  source: string;
  version: string;
}

export class EventStreamingService extends EventEmitter {
  private redisService: RedisService;
  private loggingService: LoggingService;
  private streamKey: string = 'order-events';
  private consumerGroup: string = 'order-processors';

  constructor() {
    super();
    this.redisService = new RedisService();
    this.loggingService = new LoggingService();
    this.setupEventHandlers();
  }

  /**
   * Publish order event to stream
   */
  async publishEvent(event: Omit<OrderEvent, 'id' | 'timestamp'>): Promise<string> {
    try {
      const eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fullEvent: OrderEvent = {
        id: eventId,
        timestamp: new Date(),
        ...event
      };

      // Add to Redis stream
      await this.redisService.xadd(
        this.streamKey,
        '*',
        'event', JSON.stringify(fullEvent)
      );

      // Emit local event
      this.emit('order-event', fullEvent);

      this.loggingService.info('Order event published', {
        eventId,
        type: event.type,
        orderId: event.orderId
      });

      return eventId;
    } catch (error) {
      this.loggingService.error('Failed to publish event', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Subscribe to event stream
   */
  async subscribeToEvents(consumerName: string, callback: (event: OrderEvent) => Promise<void>): Promise<void> {
    try {
      // Create consumer group if not exists
      try {
        await this.redisService.xgroup(
          'CREATE',
          this.streamKey,
          this.consumerGroup,
          '$',
          'MKSTREAM'
        );
      } catch (error) {
        // Group already exists
      }

      // Start consuming events
      while (true) {
        const messages = await this.redisService.xreadgroup(
          'GROUP',
          this.consumerGroup,
          consumerName,
          'COUNT',
          '10',
          'BLOCK',
          '1000',
          'STREAMS',
          this.streamKey,
          '>'
        );

        if (messages && messages.length > 0) {
          for (const [stream, streamMessages] of messages) {
            for (const [id, fields] of streamMessages) {
              try {
                const eventData = JSON.parse(fields[1]);
                await callback(eventData);
                
                // Acknowledge message
                await this.redisService.xack(this.streamKey, this.consumerGroup, id);
              } catch (error) {
                this.loggingService.error('Error processing event', { 
                  error: (error as Error).message,
                  messageId: id
                });
              }
            }
          }
        }
      }
    } catch (error) {
      this.loggingService.error('Failed to subscribe to events', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('order-event', async (event: OrderEvent) => {
      try {
        // Route events to appropriate processors
        switch (event.type) {
          case 'ORDER_CREATED':
            await this.handleOrderCreated(event);
            break;
          case 'ORDER_PAYMENT_PROCESSED':
            await this.handlePaymentProcessed(event);
            break;
          case 'ORDER_INVENTORY_ALLOCATED':
            await this.handleInventoryAllocated(event);
            break;
          case 'ORDER_SHIPPED':
            await this.handleOrderShipped(event);
            break;
          case 'ORDER_DELIVERED':
            await this.handleOrderDelivered(event);
            break;
          case 'ORDER_CANCELLED':
            await this.handleOrderCancelled(event);
            break;
          default:
            this.loggingService.warn('Unknown event type', { type: event.type });
        }
      } catch (error) {
        this.loggingService.error('Error handling event', { 
          error: (error as Error).message,
          eventId: event.id
        });
      }
    });
  }

  /**
   * Handle order created event
   */
  private async handleOrderCreated(event: OrderEvent): Promise<void> {
    this.loggingService.info('Processing order created event', { orderId: event.orderId });
    
    // Trigger downstream processes
    await this.publishEvent({
      type: 'ORDER_VALIDATION_REQUESTED',
      orderId: event.orderId,
      userId: event.userId,
      data: event.data,
      source: 'order-service',
      version: '1.0',
      correlationId: event.correlationId
    });
  }

  /**
   * Handle payment processed event
   */
  private async handlePaymentProcessed(event: OrderEvent): Promise<void> {
    this.loggingService.info('Processing payment processed event', { orderId: event.orderId });
    
    // Trigger inventory allocation
    await this.publishEvent({
      type: 'INVENTORY_ALLOCATION_REQUESTED',
      orderId: event.orderId,
      data: event.data,
      source: 'order-service',
      version: '1.0',
      correlationId: event.correlationId
    });
  }

  /**
   * Handle inventory allocated event
   */
  private async handleInventoryAllocated(event: OrderEvent): Promise<void> {
    this.loggingService.info('Processing inventory allocated event', { orderId: event.orderId });
    
    // Trigger fulfillment
    await this.publishEvent({
      type: 'FULFILLMENT_REQUESTED',
      orderId: event.orderId,
      data: event.data,
      source: 'order-service',
      version: '1.0',
      correlationId: event.correlationId
    });
  }

  /**
   * Handle order shipped event
   */
  private async handleOrderShipped(event: OrderEvent): Promise<void> {
    this.loggingService.info('Processing order shipped event', { orderId: event.orderId });
    
    // Trigger customer notification
    await this.publishEvent({
      type: 'CUSTOMER_NOTIFICATION_REQUESTED',
      orderId: event.orderId,
      data: {
        ...event.data,
        notificationType: 'ORDER_SHIPPED'
      },
      source: 'order-service',
      version: '1.0',
      correlationId: event.correlationId
    });
  }

  /**
   * Handle order delivered event
   */
  private async handleOrderDelivered(event: OrderEvent): Promise<void> {
    this.loggingService.info('Processing order delivered event', { orderId: event.orderId });
    
    // Trigger completion workflow
    await this.publishEvent({
      type: 'ORDER_COMPLETION_REQUESTED',
      orderId: event.orderId,
      data: event.data,
      source: 'order-service',
      version: '1.0',
      correlationId: event.correlationId
    });
  }

  /**
   * Handle order cancelled event
   */
  private async handleOrderCancelled(event: OrderEvent): Promise<void> {
    this.loggingService.info('Processing order cancelled event', { orderId: event.orderId });
    
    // Trigger cancellation workflow
    await this.publishEvent({
      type: 'ORDER_CANCELLATION_REQUESTED',
      orderId: event.orderId,
      data: event.data,
      source: 'order-service',
      version: '1.0',
      correlationId: event.correlationId
    });
  }

  /**
   * Get event stream statistics
   */
  async getStreamStats(): Promise<any> {
    try {
      const info = await this.redisService.xinfo('STREAM', this.streamKey);
      const groups = await this.redisService.xinfo('GROUPS', this.streamKey);
      
      return {
        streamLength: info.length,
        firstEntryId: info['first-entry'] ? info['first-entry'][0] : null,
        lastEntryId: info['last-entry'] ? info['last-entry'][0] : null,
        consumerGroups: groups.map((group: any) => ({
          name: group.name,
          consumers: group.consumers,
          pending: group.pending
        }))
      };
    } catch (error) {
      this.loggingService.error('Failed to get stream stats', { error: (error as Error).message });
      return null;
    }
  }
}
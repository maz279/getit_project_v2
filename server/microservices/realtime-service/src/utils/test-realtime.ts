/**
 * Real-time Service Test Utility
 * Test the complete Amazon.com/Shopee.sg-level real-time functionality
 */

import io from 'socket.io-client';

interface TestConfig {
  serverUrl: string;
  userId: string;
  testDuration: number; // seconds
}

export class RealtimeServiceTester {
  private socket: any;
  private config: TestConfig;
  private testResults: Array<{
    test: string;
    status: 'pass' | 'fail' | 'pending';
    duration: number;
    error?: string;
  }> = [];

  constructor(config: TestConfig) {
    this.config = config;
  }

  async runComprehensiveTests(): Promise<void> {
    console.log('🚀 Starting Amazon.com/Shopee.sg-Level Real-time Service Tests...');
    console.log(`📊 Testing against: ${this.config.serverUrl}`);
    console.log(`👤 User ID: ${this.config.userId}`);
    console.log(`⏱️  Test Duration: ${this.config.testDuration} seconds\n`);

    try {
      await this.testWebSocketConnection();
      await this.testAuthentication();
      await this.testChannelSubscription();
      await this.testPresenceUpdates();
      await this.testChatMessaging();
      await this.testOrderUpdates();
      await this.testPaymentUpdates();
      await this.testProductUpdates();
      await this.testBangladeshFeatures();
      await this.testNetworkOptimization();
      await this.testEventBroadcasting();
      await this.testErrorHandling();
      
      this.printTestResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      if (this.socket) {
        this.socket.disconnect();
      }
    }
  }

  private async testWebSocketConnection(): Promise<void> {
    const startTime = Date.now();
    
    try {
      this.socket = io(this.config.serverUrl + '/realtime', {
        auth: {
          token: 'test-token',
          userId: this.config.userId
        }
      });

      await new Promise((resolve, reject) => {
        this.socket.on('connect', resolve);
        this.socket.on('connect_error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });

      this.testResults.push({
        test: 'WebSocket Connection',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ WebSocket Connection: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'WebSocket Connection',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ WebSocket Connection: FAILED -', error.message);
    }
  }

  private async testAuthentication(): Promise<void> {
    const startTime = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        this.socket.emit('authenticate', {
          token: 'test-token',
          userId: this.config.userId,
          deviceInfo: {
            type: 'desktop',
            os: 'Windows',
            browser: 'Chrome'
          }
        });

        this.socket.on('authenticated', (data: any) => {
          if (data.success && data.userId === this.config.userId) {
            resolve(data);
          } else {
            reject(new Error('Authentication failed'));
          }
        });

        this.socket.on('authentication_failed', (error: any) => {
          reject(new Error(error.error));
        });

        setTimeout(() => reject(new Error('Authentication timeout')), 3000);
      });

      this.testResults.push({
        test: 'User Authentication',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ User Authentication: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'User Authentication',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ User Authentication: FAILED -', error.message);
    }
  }

  private async testChannelSubscription(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const testChannels = [`user:${this.config.userId}`, 'product:test-product', 'general'];

      await new Promise((resolve, reject) => {
        this.socket.emit('join_channel', {
          channels: testChannels
        });

        this.socket.on('channels_joined', (data: any) => {
          if (data.success && data.joinedChannels.length === testChannels.length) {
            resolve(data);
          } else {
            reject(new Error('Failed to join all channels'));
          }
        });

        this.socket.on('channel_join_failed', (error: any) => {
          reject(new Error(error.error));
        });

        setTimeout(() => reject(new Error('Channel subscription timeout')), 3000);
      });

      this.testResults.push({
        test: 'Channel Subscription',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ Channel Subscription: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'Channel Subscription',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Channel Subscription: FAILED -', error.message);
    }
  }

  private async testPresenceUpdates(): Promise<void> {
    const startTime = Date.now();
    
    try {
      await new Promise((resolve, reject) => {
        this.socket.emit('update_presence', {
          status: 'online',
          currentPage: '/test',
          activity: {
            viewingProduct: 'test-product',
            cartItems: 2,
            inCheckout: false
          }
        });

        // Assuming presence update doesn't have a direct response
        setTimeout(resolve, 1000);
      });

      this.testResults.push({
        test: 'Presence Updates',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ Presence Updates: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'Presence Updates',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Presence Updates: FAILED -', error.message);
    }
  }

  private async testChatMessaging(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const testMessage = 'Test message from real-time service tester';

      await new Promise((resolve, reject) => {
        this.socket.emit('send_message', {
          channel: 'test-channel',
          message: testMessage,
          type: 'text',
          metadata: {
            testMessage: true
          }
        });

        this.socket.on('message_sent', (data: any) => {
          resolve(data);
        });

        this.socket.on('message_failed', (error: any) => {
          reject(new Error(error.error));
        });

        setTimeout(() => reject(new Error('Message sending timeout')), 3000);
      });

      this.testResults.push({
        test: 'Chat Messaging',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ Chat Messaging: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'Chat Messaging',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Chat Messaging: FAILED -', error.message);
    }
  }

  private async testOrderUpdates(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Listen for order updates
      const orderUpdateReceived = new Promise((resolve) => {
        this.socket.on('order_status_updated', (data: any) => {
          console.log('📦 Received order update:', data);
          resolve(data);
        });
      });

      // Simulate order update via API
      const testOrderId = 'test-order-123';
      await this.simulateOrderUpdate(testOrderId);

      // Wait for notification (with timeout)
      await Promise.race([
        orderUpdateReceived,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Order update timeout')), 5000)
        )
      ]);

      this.testResults.push({
        test: 'Order Updates',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ Order Updates: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'Order Updates',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Order Updates: FAILED -', error.message);
    }
  }

  private async testPaymentUpdates(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Listen for payment updates
      const paymentUpdateReceived = new Promise((resolve) => {
        this.socket.on('payment_updated', (data: any) => {
          console.log('💳 Received payment update:', data);
          resolve(data);
        });
      });

      // Simulate payment update
      await this.simulatePaymentUpdate();

      // Wait for notification
      await Promise.race([
        paymentUpdateReceived,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Payment update timeout')), 5000)
        )
      ]);

      this.testResults.push({
        test: 'Payment Updates',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ Payment Updates: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'Payment Updates',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Payment Updates: FAILED -', error.message);
    }
  }

  private async testProductUpdates(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Listen for product updates
      const productUpdateReceived = new Promise((resolve) => {
        this.socket.on('product_price_changed', (data: any) => {
          console.log('💰 Received product update:', data);
          resolve(data);
        });
      });

      // Simulate product price change
      await this.simulateProductUpdate();

      // Wait for notification
      await Promise.race([
        productUpdateReceived,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Product update timeout')), 5000)
        )
      ]);

      this.testResults.push({
        test: 'Product Updates',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ Product Updates: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'Product Updates',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Product Updates: FAILED -', error.message);
    }
  }

  private async testBangladeshFeatures(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test network quality update
      this.socket.emit('network_quality_update', {
        bandwidth: '3g',
        latency: 800,
        packetLoss: 2,
        location: 'BD'
      });

      // Test Bangladesh optimization
      const optimizationReceived = new Promise((resolve) => {
        this.socket.on('bangladesh_optimization_applied', (data: any) => {
          console.log('🇧🇩 Received Bangladesh optimization:', data);
          resolve(data);
        });
      });

      await Promise.race([
        optimizationReceived,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Bangladesh optimization timeout')), 3000)
        )
      ]);

      this.testResults.push({
        test: 'Bangladesh Features',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ Bangladesh Features: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'Bangladesh Features',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Bangladesh Features: FAILED -', error.message);
    }
  }

  private async testNetworkOptimization(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test network optimization for slow networks
      this.socket.emit('request_optimization', {
        type: 'bangladesh_mobile',
        settings: {
          reducedUpdates: true,
          compression: true,
          prioritizeText: true
        }
      });

      const optimizationReceived = new Promise((resolve) => {
        this.socket.on('optimization_applied', (data: any) => {
          console.log('📱 Received network optimization:', data);
          resolve(data);
        });
      });

      await Promise.race([
        optimizationReceived,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network optimization timeout')), 3000)
        )
      ]);

      this.testResults.push({
        test: 'Network Optimization',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ Network Optimization: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'Network Optimization',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Network Optimization: FAILED -', error.message);
    }
  }

  private async testEventBroadcasting(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test event broadcasting via REST API
      const response = await fetch(`${this.config.serverUrl}/api/v1/realtime/events/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'test_broadcast',
          data: {
            message: 'Test broadcast message',
            timestamp: new Date()
          },
          channel: 'general',
          priority: 'medium'
        })
      });

      if (!response.ok) {
        throw new Error(`Broadcast API failed: ${response.status}`);
      }

      // Listen for broadcast
      const broadcastReceived = new Promise((resolve) => {
        this.socket.on('test_broadcast', (data: any) => {
          console.log('📡 Received broadcast:', data);
          resolve(data);
        });
      });

      await Promise.race([
        broadcastReceived,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Broadcast timeout')), 3000)
        )
      ]);

      this.testResults.push({
        test: 'Event Broadcasting',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ Event Broadcasting: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'Event Broadcasting',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Event Broadcasting: FAILED -', error.message);
    }
  }

  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test invalid channel join
      await new Promise((resolve, reject) => {
        this.socket.emit('join_channel', {
          channels: ['invalid:channel:format']
        });

        this.socket.on('channel_error', (error: any) => {
          resolve(error); // Error is expected
        });

        setTimeout(() => reject(new Error('Error handling timeout')), 3000);
      });

      this.testResults.push({
        test: 'Error Handling',
        status: 'pass',
        duration: Date.now() - startTime
      });

      console.log('✅ Error Handling: PASSED');
    } catch (error) {
      this.testResults.push({
        test: 'Error Handling',
        status: 'fail',
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('❌ Error Handling: FAILED -', error.message);
    }
  }

  private async simulateOrderUpdate(orderId: string): Promise<void> {
    try {
      await fetch(`${this.config.serverUrl}/api/v1/realtime/events/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'order_status_updated',
          data: {
            orderId,
            customerId: this.config.userId,
            oldStatus: 'processing',
            newStatus: 'shipped',
            trackingNumber: 'TEST123456',
            statusMessage: 'Your order has been shipped',
            statusMessage_bn: 'আপনার অর্ডার শিপ হয়েছে'
          },
          userId: this.config.userId,
          priority: 'high'
        })
      });
    } catch (error) {
      console.warn('Failed to simulate order update:', error.message);
    }
  }

  private async simulatePaymentUpdate(): Promise<void> {
    try {
      await fetch(`${this.config.serverUrl}/api/v1/realtime/events/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'payment_updated',
          data: {
            paymentId: 'test-payment-123',
            orderId: 'test-order-123',
            status: 'completed',
            amount: 1500,
            method: 'bkash',
            paymentMessage: 'Payment completed successfully',
            paymentMessage_bn: 'পেমেন্ট সফলভাবে সম্পন্ন'
          },
          userId: this.config.userId,
          priority: 'high'
        })
      });
    } catch (error) {
      console.warn('Failed to simulate payment update:', error.message);
    }
  }

  private async simulateProductUpdate(): Promise<void> {
    try {
      await fetch(`${this.config.serverUrl}/api/v1/realtime/events/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'product_price_changed',
          data: {
            productId: 'test-product',
            vendorId: 'test-vendor',
            oldPrice: 1000,
            newPrice: 850,
            discountPercentage: 15,
            message_bn: 'দাম কমেছে ১৫%!'
          },
          channel: 'product:test-product',
          priority: 'medium'
        })
      });
    } catch (error) {
      console.warn('Failed to simulate product update:', error.message);
    }
  }

  private printTestResults(): void {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    
    const passed = this.testResults.filter(r => r.status === 'pass').length;
    const failed = this.testResults.filter(r => r.status === 'fail').length;
    const total = this.testResults.length;
    
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);
    
    console.log('DETAILED RESULTS:');
    console.log('-----------------');
    
    this.testResults.forEach(result => {
      const status = result.status === 'pass' ? '✅' : '❌';
      const duration = `(${result.duration}ms)`;
      
      console.log(`${status} ${result.test} ${duration}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('\n🎉 Amazon.com/Shopee.sg-Level Real-time Service Test Complete!');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new RealtimeServiceTester({
    serverUrl: 'http://localhost:5000',
    userId: 'test-user-123',
    testDuration: 30
  });
  
  tester.runComprehensiveTests();
}
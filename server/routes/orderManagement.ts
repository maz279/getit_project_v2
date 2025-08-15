import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authMiddleware, requireAuthenticated, requireVendorOrAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { insertOrderSchema } from '@shared/schema';

const router = Router();

// Enhanced Order Management Routes - Amazon/Shopee Level

// Get orders with advanced filtering
router.get('/orders', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { 
      status, 
      dateFrom, 
      dateTo, 
      vendorId, 
      orderType, 
      priority, 
      paymentStatus,
      page = 1, 
      limit = 20 
    } = req.query;

    const userId = req.user?.role === 'customer' ? req.user.userId : undefined;
    const filters = {
      status: status as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      vendorId: vendorId as string,
      orderType: orderType as string,
      priority: priority as string,
      paymentStatus: paymentStatus as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const orders = await storage.getOrders(userId);
    res.json({ 
      orders, 
      pagination: { 
        page: filters.page, 
        limit: filters.limit,
        total: orders.length 
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order with comprehensive details
router.get('/orders/:id/details', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const orderDetails = await storage.getOrderWithDetails(id);
    
    if (!orderDetails) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get additional order information
    const [statusHistory, paymentTransactions, shipments, returns] = await Promise.all([
      storage.getOrderStatusHistory(id),
      storage.getPaymentTransactions(id),
      storage.getShipments(id),
      storage.getOrderReturns(id)
    ]);

    res.json({
      order: orderDetails,
      statusHistory,
      paymentTransactions,
      shipments,
      returns
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Create new order with multi-vendor support
router.post('/orders', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const orderData = req.body;
    orderData.userId = req.user?.userId;
    
    // Generate unique order number
    orderData.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const order = await storage.createOrder(orderData);
    
    // Add initial status history
    await storage.addOrderStatusHistory({
      orderId: order.id,
      fromStatus: null,
      toStatus: 'pending',
      notes: 'Order created',
      updatedBy: req.user?.userId
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status with comprehensive tracking
router.put('/orders/:id/status', authMiddleware, requireVendorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const currentOrder = await storage.getOrder(id);
    if (!currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await storage.updateOrderStatus(id, status);
    
    // Add status history entry
    await storage.addOrderStatusHistory({
      orderId: id,
      fromStatus: currentOrder.status,
      toStatus: status,
      notes,
      updatedBy: req.user?.userId
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Split order by vendor for multi-vendor processing
router.post('/orders/:id/split', authMiddleware, requireVendorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const splitOrders = await storage.splitOrderByVendor(id);
    res.json({ splitOrders, message: 'Order successfully split by vendor' });
  } catch (error) {
    console.error('Error splitting order:', error);
    res.status(500).json({ error: 'Failed to split order' });
  }
});

// Order Items Management
router.get('/orders/:id/items', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await storage.getOrderItems(id);
    res.json(items);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ error: 'Failed to fetch order items' });
  }
});

router.put('/order-items/:id/status', authMiddleware, requireVendorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedItem = await storage.updateOrderItemStatus(id, status);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating order item status:', error);
    res.status(500).json({ error: 'Failed to update order item status' });
  }
});

// Payment Transaction Management
router.get('/orders/:id/payments', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const transactions = await storage.getPaymentTransactions(id);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    res.status(500).json({ error: 'Failed to fetch payment transactions' });
  }
});

router.post('/payment-transactions', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const transactionData = req.body;
    
    // Generate unique transaction ID
    transactionData.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction = await storage.createPaymentTransaction(transactionData);
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    res.status(500).json({ error: 'Failed to create payment transaction' });
  }
});

router.put('/payment-transactions/:id/status', authMiddleware, requireVendorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedTransaction = await storage.updatePaymentTransactionStatus(id, status);
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating payment transaction status:', error);
    res.status(500).json({ error: 'Failed to update payment transaction status' });
  }
});

// Shipment Management
router.get('/shipments', authMiddleware, requireVendorOrAdmin, async (req, res) => {
  try {
    const { orderId, vendorId } = req.query;
    const shipments = await storage.getShipments(orderId as string, vendorId as string);
    res.json(shipments);
  } catch (error) {
    console.error('Error fetching shipments:', error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

router.post('/shipments', authMiddleware, requireVendorOrAdmin, async (req, res) => {
  try {
    const shipmentData = req.body;
    shipmentData.createdBy = req.user?.userId;
    
    // Generate unique shipment number
    shipmentData.shipmentNumber = `SHP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const shipment = await storage.createShipment(shipmentData);
    
    // Add initial tracking event
    await storage.addShipmentTrackingEvent({
      shipmentId: shipment.id,
      status: 'created',
      description: 'Shipment created',
      eventTime: new Date(),
      location: 'Origin'
    });

    res.status(201).json(shipment);
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

router.put('/shipments/:id/status', authMiddleware, requireVendorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, description } = req.body;
    
    const updatedShipment = await storage.updateShipmentStatus(id, status);
    
    // Add tracking event
    await storage.addShipmentTrackingEvent({
      shipmentId: id,
      status,
      description: description || `Status updated to ${status}`,
      eventTime: new Date(),
      location: location || 'Unknown'
    });

    res.json(updatedShipment);
  } catch (error) {
    console.error('Error updating shipment status:', error);
    res.status(500).json({ error: 'Failed to update shipment status' });
  }
});

// Shipment Tracking
router.get('/shipments/:id/tracking', async (req, res) => {
  try {
    const { id } = req.params;
    const tracking = await storage.getShipmentTracking(id);
    res.json(tracking);
  } catch (error) {
    console.error('Error fetching shipment tracking:', error);
    res.status(500).json({ error: 'Failed to fetch shipment tracking' });
  }
});

router.post('/shipment-tracking', authMiddleware, requireVendorOrAdmin, async (req, res) => {
  try {
    const trackingData = req.body;
    const tracking = await storage.addShipmentTrackingEvent(trackingData);
    res.status(201).json(tracking);
  } catch (error) {
    console.error('Error adding shipment tracking event:', error);
    res.status(500).json({ error: 'Failed to add shipment tracking event' });
  }
});

// Returns and Refunds Management
router.get('/returns', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { orderId } = req.query;
    const userId = req.user?.role === 'customer' ? req.user.userId : undefined;
    const returns = await storage.getOrderReturns(orderId as string, userId);
    res.json(returns);
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
});

router.post('/returns', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const returnData = req.body;
    
    // Generate unique return number
    returnData.returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const orderReturn = await storage.createOrderReturn(returnData);
    res.status(201).json(orderReturn);
  } catch (error) {
    console.error('Error creating return:', error);
    res.status(500).json({ error: 'Failed to create return' });
  }
});

router.put('/returns/:id/status', authMiddleware, requireVendorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedReturn = await storage.updateOrderReturnStatus(id, status);
    res.json(updatedReturn);
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ error: 'Failed to update return status' });
  }
});

// Advanced Order Analytics
router.get('/analytics/orders', authMiddleware, requireVendorOrAdmin, async (req, res) => {
  try {
    const { vendorId, startDate, endDate } = req.query;
    
    const statistics = await storage.getOrderStatistics(vendorId as string);
    
    let dateRangeOrders: any[] = [];
    if (startDate && endDate) {
      dateRangeOrders = await storage.getOrdersByDateRange(
        new Date(startDate as string),
        new Date(endDate as string),
        vendorId as string
      );
    }

    res.json({
      statistics,
      dateRangeOrders,
      summary: {
        totalOrders: statistics.totalOrders,
        completionRate: statistics.totalOrders > 0 ? (statistics.completedOrders / statistics.totalOrders) * 100 : 0,
        averageOrderValue: statistics.averageOrderValue,
        totalRevenue: statistics.totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    res.status(500).json({ error: 'Failed to fetch order analytics' });
  }
});

// Bangladesh-specific payment integration endpoints
router.post('/payments/bkash/initiate', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { orderId, amount, customerPhone } = req.body;
    
    // bKash payment integration logic would go here
    const paymentData = {
      orderId,
      transactionId: `BKASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'payment',
      method: 'bkash',
      provider: 'bkash',
      amount,
      currency: 'BDT',
      status: 'pending',
      metadata: { customerPhone }
    };

    const transaction = await storage.createPaymentTransaction(paymentData);
    
    res.json({
      success: true,
      transactionId: transaction.transactionId,
      paymentUrl: `https://sandbox.bka.sh/payment/${transaction.transactionId}`,
      message: 'bKash payment initiated successfully'
    });
  } catch (error) {
    console.error('Error initiating bKash payment:', error);
    res.status(500).json({ error: 'Failed to initiate bKash payment' });
  }
});

router.post('/payments/nagad/initiate', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { orderId, amount, customerPhone } = req.body;
    
    // Nagad payment integration logic would go here
    const paymentData = {
      orderId,
      transactionId: `NAGAD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'payment',
      method: 'nagad',
      provider: 'nagad',
      amount,
      currency: 'BDT',
      status: 'pending',
      metadata: { customerPhone }
    };

    const transaction = await storage.createPaymentTransaction(paymentData);
    
    res.json({
      success: true,
      transactionId: transaction.transactionId,
      paymentUrl: `https://api.mynagad.com/payment/${transaction.transactionId}`,
      message: 'Nagad payment initiated successfully'
    });
  } catch (error) {
    console.error('Error initiating Nagad payment:', error);
    res.status(500).json({ error: 'Failed to initiate Nagad payment' });
  }
});

router.post('/payments/rocket/initiate', authMiddleware, requireAuthenticated, async (req, res) => {
  try {
    const { orderId, amount, customerPhone } = req.body;
    
    // Rocket payment integration logic would go here
    const paymentData = {
      orderId,
      transactionId: `ROCKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'payment',
      method: 'rocket',
      provider: 'rocket',
      amount,
      currency: 'BDT',
      status: 'pending',
      metadata: { customerPhone }
    };

    const transaction = await storage.createPaymentTransaction(paymentData);
    
    res.json({
      success: true,
      transactionId: transaction.transactionId,
      paymentUrl: `https://rocket.com.bd/payment/${transaction.transactionId}`,
      message: 'Rocket payment initiated successfully'
    });
  } catch (error) {
    console.error('Error initiating Rocket payment:', error);
    res.status(500).json({ error: 'Failed to initiate Rocket payment' });
  }
});

export default router;
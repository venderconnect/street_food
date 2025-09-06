const Order = require('../models/GroupOrder');
const { sendPushNotification } = require('../utils/pushNotification');
const { io } = require('../sockets');

const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const updateOrderStatus = async (orderId, status, location = null) => {
  const order = await Order.findById(orderId)
    .populate('supplier')
    .populate('participants.user', 'pushSubscription');

  if (!order) {
    throw new Error('Order not found');
  }

  order.status = status;
  if (location) {
    order.deliveryLocation = location;
  }

  order.statusHistory.push({
    status,
    timestamp: new Date(),
    location
  });

  await order.save();

  // Emit real-time update
  io.to(`order:${orderId}`).emit('orderStatusUpdate', {
    orderId,
    status,
    location,
    timestamp: new Date()
  });

  // Send push notifications to all participants
  const notificationPayload = {
    title: 'Order Status Update',
    body: `Your order #${orderId} is now ${status}`,
    data: {
      orderId,
      status,
      url: `/orders/${orderId}`
    }
  };

  const notifications = order.participants
    .filter(p => p.user.pushSubscription)
    .map(p => sendPushNotification(p.user.pushSubscription, notificationPayload));

  await Promise.allSettled(notifications);

  return order;
};

const getOrderTimeline = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  return order.statusHistory;
};

const estimateDeliveryTime = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order || !order.statusHistory.length) {
    throw new Error('Order not found or no status history');
  }

  const averagePreparationTime = 20; // minutes
  const averageDeliveryTime = 30; // minutes

  const currentStatus = order.status;
  let estimatedTime = new Date();

  switch (currentStatus) {
    case ORDER_STATUSES.PENDING:
      estimatedTime.setMinutes(estimatedTime.getMinutes() + averagePreparationTime + averageDeliveryTime);
      break;
    case ORDER_STATUSES.CONFIRMED:
      estimatedTime.setMinutes(estimatedTime.getMinutes() + averagePreparationTime + averageDeliveryTime);
      break;
    case ORDER_STATUSES.PREPARING:
      estimatedTime.setMinutes(estimatedTime.getMinutes() + averagePreparationTime);
      break;
    case ORDER_STATUSES.READY:
      estimatedTime.setMinutes(estimatedTime.getMinutes() + averageDeliveryTime);
      break;
    default:
      return null;
  }

  return estimatedTime;
};

module.exports = {
  ORDER_STATUSES,
  updateOrderStatus,
  getOrderTimeline,
  estimateDeliveryTime
};

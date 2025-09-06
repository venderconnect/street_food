const Order = require('../models/GroupOrder');
const Product = require('../models/Product');
const { redis } = require('../utils/cache');

const getVendorAnalytics = async (vendorId, timeframe = '7d') => {
  const cacheKey = `analytics:vendor:${vendorId}:${timeframe}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const dateFilter = getDateFilter(timeframe);
  
  const [
    orderStats,
    revenue,
    popularProducts,
    customerRetention
  ] = await Promise.all([
    getOrderStats(vendorId, dateFilter),
    getRevenueStats(vendorId, dateFilter),
    getPopularProducts(vendorId, dateFilter),
    getCustomerRetention(vendorId, dateFilter)
  ]);

  const analytics = {
    orderStats,
    revenue,
    popularProducts,
    customerRetention,
    timeframe,
    generatedAt: new Date()
  };

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(analytics));

  return analytics;
};

const getDateFilter = (timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case '24h':
      return { $gte: new Date(now - 24 * 60 * 60 * 1000) };
    case '7d':
      return { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
    case '30d':
      return { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
    case '90d':
      return { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) };
    default:
      return { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
  }
};

const getOrderStats = async (vendorId, dateFilter) => {
  const orders = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        createdAt: dateFilter
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  return orders.reduce((acc, curr) => {
    acc[curr._id] = {
      count: curr.count,
      avgOrderValue: curr.avgOrderValue
    };
    return acc;
  }, {});
};

const getRevenueStats = async (vendorId, dateFilter) => {
  const revenue = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        status: 'delivered',
        createdAt: dateFilter
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  return revenue;
};

const getPopularProducts = async (vendorId, dateFilter) => {
  const products = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        createdAt: dateFilter
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalOrdered: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        name: '$product.name',
        totalOrdered: 1,
        revenue: 1,
        averageRating: '$product.averageRating'
      }
    },
    { $sort: { totalOrdered: -1 } },
    { $limit: 10 }
  ]);

  return products;
};

const getCustomerRetention = async (vendorId, dateFilter) => {
  const customers = await Order.aggregate([
    {
      $match: {
        vendor: vendorId,
        createdAt: dateFilter
      }
    },
    {
      $group: {
        _id: '$customer',
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        lastOrder: { $max: '$createdAt' }
      }
    },
    {
      $bucket: {
        groupBy: '$orderCount',
        boundaries: [1, 2, 3, 5, 10, 20],
        default: '20+',
        output: {
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalSpent' },
          avgSpentPerCustomer: { $avg: '$totalSpent' }
        }
      }
    }
  ]);

  return customers;
};

module.exports = {
  getVendorAnalytics
};

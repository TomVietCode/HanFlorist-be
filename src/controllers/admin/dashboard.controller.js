const Order = require("../../models/order.model");
const Product = require("../../models/products.model");
const User = require("../../models/user.model");
const Category = require("../../models/category.model");

/**
 * Get overview statistics for admin dashboard
 * Includes total revenue, orders, products, users
 */
module.exports.getOverview = async (req, res) => {
  try {
    // Get counts for key metrics
    const [totalRevenue, totalOrders, totalProducts, totalUsers, recentOrders] = await Promise.all([
      // Total revenue from all completed orders
      Order.aggregate([
        { $match: { status: { $in: ['delivered'] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      
      // Total order count
      Order.countDocuments(),
      
      // Total active products
      Product.countDocuments({ status: "active" }),
      
      // Total active users
      User.countDocuments({ status: "active", role: "client" }),
      
      // Recent orders (limited to 5)
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name")
        .select("orderCode totalAmount status paymentStatus paymentMethod createdAt")
    ]);

    // Calculate metrics by status
    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const paymentStatusCounts = await Order.aggregate([
      { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.status(200).json({
      data: {
        revenue,
        orderCount: totalOrders,
        productCount: totalProducts,
        userCount: totalUsers,
        recentOrders,
        orderStatusCounts: orderStatusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        paymentStatusCounts: paymentStatusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/**
 * Get revenue statistics with time-based filters
 */
module.exports.getRevenue = async (req, res) => {
  try {
    const { period = 'week', startDate, endDate } = req.query;
    
    const matchStage = { status: 'delivered' };
    
    // Set time filters based on period
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default time ranges
      const now = new Date();
      
      if (period === 'week') {
        // Last 7 days
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        matchStage.createdAt = { $gte: weekAgo };
      } else if (period === 'month') {
        // Last 30 days
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);
        matchStage.createdAt = { $gte: monthAgo };
      } else if (period === 'year') {
        // Last 365 days
        const yearAgo = new Date(now);
        yearAgo.setDate(now.getDate() - 365);
        matchStage.createdAt = { $gte: yearAgo };
      }
    }
    
    let groupByFormat;
    
    // Set group by format based on period
    if (period === 'week' || period === 'custom' && (!startDate || !endDate)) {
      // Group by day
      groupByFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    } else if (period === 'month') {
      // Group by day
      groupByFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    } else if (period === 'year') {
      // Group by month
      groupByFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    }
    
    // Aggregate revenue data
    const revenueData = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupByFormat,
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get total revenue for the period
    const totalRevenue = await Order.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);
    
    // Get revenue by payment method
    const revenueByPaymentMethod = await Order.aggregate([
      { $match: matchStage },
      { $group: { _id: "$paymentMethod", total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      data: {
        revenueByDate: revenueData,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        orderCount: totalRevenue.length > 0 ? totalRevenue[0].count : 0,
        revenueByPaymentMethod: revenueByPaymentMethod.reduce((acc, item) => {
          acc[item._id] = { total: item.total, count: item.count };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/**
 * Get order statistics for admin dashboard
 */
module.exports.getOrderStats = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    // Set time range based on period
    const timeRange = {};
    const now = new Date();
    
    if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      timeRange.createdAt = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 30);
      timeRange.createdAt = { $gte: monthAgo };
    } else if (period === 'year') {
      const yearAgo = new Date(now);
      yearAgo.setDate(now.getDate() - 365);
      timeRange.createdAt = { $gte: yearAgo };
    }
    
    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: timeRange },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Orders by payment method
    const ordersByPaymentMethod = await Order.aggregate([
      { $match: timeRange },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
    ]);
    
    // Orders by payment status
    const ordersByPaymentStatus = await Order.aggregate([
      { $match: timeRange },
      { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
    ]);
    
    // Orders by day/time
    let groupByFormat;
    
    if (period === 'week') {
      // Group by day
      groupByFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    } else if (period === 'month') {
      // Group by day
      groupByFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    } else if (period === 'year') {
      // Group by month
      groupByFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    }
    
    const ordersByDate = await Order.aggregate([
      { $match: timeRange },
      { $group: { _id: groupByFormat, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      data: {
        ordersByStatus: ordersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        ordersByPaymentMethod: ordersByPaymentMethod.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        ordersByPaymentStatus: ordersByPaymentStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        ordersByDate
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/**
 * Get product statistics for admin dashboard
 */
module.exports.getProductStats = async (req, res) => {
  try {
    // Products by category
    const productsByCategory = await Product.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } }
    ]);
    
    // Populate category names
    const categories = await Category.find({
      _id: { $in: productsByCategory.map(p => p._id) }
    });
    
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat._id] = cat.title;
      return acc;
    }, {});
    
    // Top selling products (requires Order collection with product references)
    const topSellingProducts = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped'] } } },
      { $unwind: "$items" },
      { 
        $group: { 
          _id: "$items.productId", 
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subTotal" }
        } 
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);
    
    // Get product details for the top selling products
    const productIds = topSellingProducts.map(p => p._id);
    const products = await Product.find({ _id: { $in: productIds } })
      .select("title thumbnail price stock");
    
    const productMap = products.reduce((acc, prod) => {
      acc[prod._id] = prod;
      return acc;
    }, {});
    
    // Low stock products
    const lowStockProducts = await Product.find({ 
      status: "active",
      stock: { $lt: 10 }
    })
    .sort({ stock: 1 })
    .limit(10)
    .select("title thumbnail price stock");
    
    // Products by status
    const productsByStatus = await Product.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      data: {
        productsByCategory: productsByCategory.map(item => ({
          category: categoryMap[item._id] || 'Unknown',
          categoryId: item._id,
          count: item.count
        })),
        topSellingProducts: topSellingProducts.map(item => ({
          product: productMap[item._id],
          totalSold: item.totalSold,
          revenue: item.revenue
        })),
        lowStockProducts,
        productsByStatus: productsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/**
 * Get user statistics for admin dashboard
 */
module.exports.getUserStats = async (req, res) => {
  try {
    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    
    // Users by status
    const usersByStatus = await User.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Users by registration date (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const usersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Top customers by order value
    const topCustomers = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped'] } } },
      { 
        $group: { 
          _id: "$userId", 
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        } 
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);
    
    // Get customer details
    const customerIds = topCustomers.map(c => c._id).filter(id => id !== null);
    const customers = await User.find({ _id: { $in: customerIds } })
      .select("name email avatar");
    
    const customerMap = customers.reduce((acc, cust) => {
      acc[cust._id] = cust;
      return acc;
    }, {});
    
    res.status(200).json({
      data: {
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        usersByStatus: usersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        usersByMonth,
        topCustomers: topCustomers
          .filter(item => item._id !== null) 
          .map(item => ({
            user: customerMap[item._id],
            totalSpent: item.totalSpent,
            orderCount: item.orderCount
          }))
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/**
 * Simple health-check endpoint to verify the dashboard API is working
 */
module.exports.healthCheck = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Dashboard API is working properly",
      timestamp: new Date(),
      apiVersion: "1.0.0"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 
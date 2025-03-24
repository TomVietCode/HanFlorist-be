const Cart = require("../../models/cart.model");
const Product = require("../../models/products.model");
const Order = require("../../models/order.model");
const { generateRandomNumber } = require("../../helpers/generateRandom.helper");
const { processVNPayPayment, verifyVNPayResponse } = require("../../helpers/vnPayService");

// [POST] /v1/orders
module.exports.createOrderAPI = async (req, res) => {
  try {
    const userId = res.locals.user?.sub || null;
    const {
      cart: cartFromBody,
      shippingInfo,
      paymentMethod,
      recipientType,
      deliveryDate,
      deliveryMethod,
    } = req.body; 

    let cartItems, totalAmount;
    if (userId) {
      const cart = await Cart.findOne({ userId }).populate("products.productId", "title price stock discountPercentage");
      if (!cart || !cart.products.length) {
        throw new Error("Cart is empty or not found");
      }
      cartItems = cart.products.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        subtotal: item.subTotal,
      }));
      totalAmount = cart.totalAmount;
    } else {
      if (!cartFromBody || !cartFromBody.length) {
        throw new Error("Cart is required when user is not logged in");
      }
      cartItems = cartFromBody;
      totalAmount = cartFromBody.reduce((sum, item) => sum + item.subtotal, 0);
    }

    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = products.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
    }, {});

    for (const item of cartItems) {
      const product = productMap[item.productId.toString()];
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for product ${product.title} (ID: ${item.productId})`);
      }
      const calculatedSubtotal = product.price * item.quantity * (1 - (product.discountPercentage || 0) / 100);
      
      if (Math.abs(calculatedSubtotal - item.subtotal) > 0.01) {
        throw new Error(`Subtotal mismatch for product ${product.title}`);
      }
    }

    const orderCode = generateRandomNumber(6);
    const order = new Order({
      userId,
      orderCode,
      totalAmount,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      shippingInfo,
      paymentMethod,
      recipientType,
      deliveryDate: new Date(deliveryDate),
      deliveryMethod,
    });

    const bulkOps = cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOps);

    await order.save();
    if (userId) {
      await Cart.deleteOne({ userId });
    }

    if (paymentMethod === "VNPay") {
      const { paymentUrl, qrCode } = await processVNPayPayment(order);
      return res.status(200).json({
        data: {
          orderId: order._id,
          paymentUrl, // URL để debug hoặc fallback
          qrCode,     // Mã QR dạng base64
        },
      });
    }
    res.status(201).json({
      data: order._id,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

// [GET] /v1/orders/vnpay-return
module.exports.handleVNPayReturn = async (req, res) => {
  const vnp_Params = { ...req.query };

  if (!verifyVNPayResponse(vnp_Params)) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const order = await Order.findOne({ orderCode: vnp_Params.vnp_TxnRef });
  if (vnp_Params.vnp_ResponseCode === "00") {
    order.paymentStatus = "paid";
    await order.save();
    res.redirect("http://localhost:3000/order-success?orderId=" + order._id);
  } else {
    order.paymentStatus = "failed";
    await order.save();
    res.redirect("http://localhost:3000/order-failed?orderId=" + order._id);
  }
};
// [GET] /v1/orders/:orderId
module.exports.getAPI = async (req, res) => {
  try {
    // Lấy orderId từ params
    const { orderId } = req.params;
    const userId = res.locals.user?.sub;

    let query = { _id: orderId };

    if (userId) query.userId = userId;

    const order = await Order.findOne(query)
      .populate("items.productId", "title price discountPercentage thumbnail") 
      .lean();

    if (!order) {
      throw new Error("Order not found or you don't have permission to view this order");
    }
    res.status(200).json({
      data: { order },
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

// [GET] /v1/orders
module.exports.listAPI = async (req, res) => {
  try {    
    const userId = res.locals.user?.sub;

    if (!userId) {
      throw new Error("Authentication required to view orders");
    } 

    const orders = await Order.find({ userId })
      .populate("items.productId", "title price discountPercentage thumbnail") 
      .sort({ createdAt: -1 })

    // Trả về danh sách đơn hàng và thông tin phân trang
    res.status(200).json({
      data: orders
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}


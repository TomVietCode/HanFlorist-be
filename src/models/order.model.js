const mongoose = require("mongoose")

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  orderCode: {
    type: String,
    unique: true,
    required: [true, "Order code is required"],
  },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
    required: true,
  },
  totalAmount: {
    type: Number,
    min: [0, "Total amount must be greater than or equal to 0"],
    required: [true, "Total amount is required"],
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, min: [1, "Quantity must be at least 1"], required: true },
      subtotal: { type: Number, required: true, },
    },
  ],
  shippingInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "VNPay"], 
    required: [true, "Payment method is required"],
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
    required: true,
  },
  paymentDetails: {
    vnpayTransactionId: { type: String }, // Mã giao dịch từ VNPay 
    vnpayResponseCode: { type: String }, // Mã phản hồi từ VNPay
    paidAt: { type: Date },
  },
  recipientType: {
    type: String,
    enum: ["self", "other"],
    default: "self",
    required: [true, "Recipient type is required"],
  },
  deliveryDate: {
    type: Date,
    required: [true, "Delivery date is required"],
  },
  deliveryMethod: {
    type: String,
    enum: ["pickup", "delivery"],
    default: "delivery",
    required: [true, "Delivery method is required"],
  },
  message: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true })

const Order = mongoose.model("Order", OrderSchema, "orders")

module.exports = Order
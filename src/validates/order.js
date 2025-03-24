const { z } = require("zod");

// Schema cho shippingInfo
const shippingInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
});

// Schema cho recipientInfo (khi recipientType là "other")
const recipientInfoSchema = z.object({
  name: z.string().min(1, "Recipient name is required"),
  phone: z.string().min(1, "Recipient phone is required"),
});

// Schema cho pickupStore (khi deliveryMethod là "pickup")
const pickupStoreSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"), // Giả sử storeId là string (ObjectId)
  storeName: z.string().min(1, "Store name is required"),
});

// Schema chính cho request body của [POST] /v1/orders
const createOrderSchema = z.object({
  shippingInfo: shippingInfoSchema,
  paymentMethod: z.enum(["COD", "VNPay"], {
    required_error: "Payment method is required",
    invalid_type_error: "Payment method must be one of: COD, VNPay",
  }),
  recipientType: z.enum(["self", "other"], {
    required_error: "Recipient type is required",
    invalid_type_error: "Recipient type must be one of: self, other",
  }),
  recipientInfo: recipientInfoSchema.optional().refine(
    (data) => {
      if (recipientType === "other" && !data) return false;
      return true;
    },
    { message: "Recipient info is required when recipientType is 'other'" }
  ),
  deliveryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Delivery date must be a valid date",
  }),
  deliveryMethod: z.enum(["pickup", "delivery"], {
    required_error: "Delivery method is required",
    invalid_type_error: "Delivery method must be one of: pickup, delivery",
  }),
  pickupStore: pickupStoreSchema.optional().refine(
    (data) => {
      if (deliveryMethod === "pickup" && !data) return false;
      return true;
    },
    { message: "Pickup store is required when deliveryMethod is 'pickup'" }
  ),
});

// Middleware để validate request body
const validateCreateOrder = (req, res, next) => {
  try {
    createOrderSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      error: error.errors.map((err) => err.message).join(", "),
    });
  }
};

module.exports = { createOrderSchema, validateCreateOrder };
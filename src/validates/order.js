const { z } = require("zod");

// Schema cho shippingInfo
const shippingInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
});

const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  subTotal: z.number().min(0, "Subtotal must be non-negative"),
});

const createOrderSchema = z.object({
  cart: z.array(cartItemSchema).optional(),
  shippingInfo: shippingInfoSchema,
  paymentMethod: z.enum(["COD", "VNPay"], {
    required_error: "Payment method is required",
    invalid_type_error: "Payment method must be one of: COD, VNPay",
  }),
  recipientType: z.enum(["self", "other"], {
    required_error: "Recipient type is required",
    invalid_type_error: "Recipient type must be one of: self, other",
  }),
  deliveryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Delivery date must be a valid date",
  }),
  deliveryMethod: z.enum(["pickup", "delivery"], {
    required_error: "Delivery method is required",
    invalid_type_error: "Delivery method must be one of: pickup, delivery",
  }),
});

// Middleware để validate request body
const validateCreateOrder = (req, res, next) => {
  try {
    createOrderSchema.parse(req.body);

    if (!res.locals.user && (!req.body.cart || req.body.cart.length === 0)) {
      throw new Error("Cart is required when user is not logged in");
    }
    
    next();
  } catch (error) {
    res.status(400).json({
      error: error.errors.map((err) => err.message).join(", "),
    });
  }
};

module.exports = validateCreateOrder
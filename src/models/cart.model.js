const mongoose = require("mongoose")

const cartSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    products: [
      {
        _id: false,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantity: Number,
        subTotal: {
          type: Number,
          min: [0, "Total amount must be greater than or equal to 0"]
        } //price * quantity * (1 - discountPercentage/100)
      },
    ],
    totalAmount: {
      type: Number,
      min: [0, "Total amount must be greater than or equal to 0"]
    },
    expireAt: {
      type: Date,
      expires: 0
    },
  }, { timestamps: true }
)

const Cart = mongoose.model("Cart", cartSchema, "carts")

module.exports = Cart

const mongoose = require("mongoose")

const cartSchema = mongoose.Schema(
  {
    user_id: String,
    products: [
      {
        product_id: String,
        quantity: Number,
      },
    ],
    expireAt: {
      type: Date,
      expires: 0
    },
  },
)

const Cart = mongoose.model("Cart", cartSchema, "carts")

module.exports = Cart

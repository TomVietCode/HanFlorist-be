const Cart = require("../models/cart.model");
const Product = require("../models/products.model");

const createCartMdl = async (req, res, next) => {
  try {
    const userId = res.locals.user?.sub;
    const { cart } = req.body; // Giỏ hàng từ localStorage (nếu có)

    if (!userId) {
      return next()
    } 
    const existingCart = await Cart.findOne({ userId })
    if(existingCart) {
      return next()
    }
   

    let cartData = {
      userId,
      products: [],
      totalAmount: 0,
    };
    
    // Nếu có giỏ hàng từ localStorage
    if (cart && Array.isArray(cart) && cart.length > 0) {
      const productIds = cart.map((item) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      const productMap = products.reduce((map, product) => {
        map[product._id.toString()] = product;
        return map;
      }, {});

      cartData.products = cart.map((item) => {
        const product = productMap[item.productId];
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
        cartData.totalAmount += calculatedSubtotal;
        return {
          productId: item.productId,
          quantity: item.quantity,
          subtotal: item.subtotal,
        };
      });
    }
    const newCart = new Cart(cartData);
    await newCart.save();
    res.locals.cart = newCart;
    next();
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = { createCartMdl };
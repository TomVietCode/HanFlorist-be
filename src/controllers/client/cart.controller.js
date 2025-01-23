const Cart = require("../../models/cart.model");
const Product = require("../../models/products.model");

// [GET] /v1/cart
module.exports.index = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;

    const cart = await Cart.findOne({ _id: cartId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found!" });
    }

    // Nếu giỏ hàng trống
    if (cart.products.length === 0) {
      return res.status(200).json({
        message: "Cart is empty!",
        data: { products: [], totalPrice: 0 },
      });
    }

    let cartTotalPrice = 0;
    for (const product of cart.products) {
      const productInfo = await Product.findOne({
        _id: product.product_id,
      }).select("thumbnail title price discountPercentage slug");

      if (!productInfo) {
        return res.status(404).json({ message: "Product not found!" });
      }

      const discountedPrice = Math.round(
        (1 - productInfo.discountPercentage / 100) * productInfo.price
      );
      product.totalPrice = discountedPrice * product.quantity;
      cartTotalPrice += product.totalPrice;
      productInfo.discountedPrice = discountedPrice.toLocaleString();
      product.productInfo = productInfo;
    }

    cart.totalPrice = cartTotalPrice;

    res.status(200).json({
      message: "Cart retrieved successfully!",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// [POST] /v1/cart/add/:productId
module.exports.addPost = async (req, res) => {
  try {
    const productId = req.params.productId;
    const cartId = req.cookies.cartId;
    const quantity = parseInt(req.body.quantity);

    // Kiểm tra quantity hợp lệ
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity!" });
    }

    const cart = await Cart.findOne({ _id: cartId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found!" });
    }

    const productInCart = cart.products.find(
      (item) => item.product_id === productId
    );

    if (productInCart) {
      const newQuantity = productInCart.quantity + quantity;

      await Cart.updateOne(
        {
          _id: cartId,
          "products.product_id": productId,
        },
        {
          $set: { "products.$.quantity": newQuantity },
        }
      );
    } else {
      const objectProduct = {
        product_id: productId,
        quantity: quantity,
      };

      await Cart.updateOne(
        {
          _id: cartId,
        },
        {
          $push: { products: objectProduct },
        }
      );
    }

    res.status(200).json({
      message: "Product added to cart successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// [DELETE] /v1/cart/delete/:productId
module.exports.delete = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;

    const cart = await Cart.findOne({ _id: cartId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found!" });
    }

    await Cart.updateOne(
      {
        _id: cartId,
      },
      {
        $pull: { products: { product_id: productId } },
      }
    );

    res.status(200).json({
      message: "Product removed from cart successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// [PUT] /v1/cart/update/:productId/:newQuantity
module.exports.update = async (req, res) => {
  try {
    const cartId = req.cookies.cartId;
    const productId = req.params.productId;
    const newQuantity = parseInt(req.params.newQuantity);

    // Kiểm tra newQuantity hợp lệ
    if (isNaN(newQuantity) || newQuantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity!" });
    }

    const cart = await Cart.findOne({ _id: cartId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found!" });
    }

    await Cart.updateOne(
      {
        _id: cartId,
        "products.product_id": productId,
      },
      {
        $set: { "products.$.quantity": newQuantity },
      }
    );

    res.status(200).json({
      message: "Cart updated successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
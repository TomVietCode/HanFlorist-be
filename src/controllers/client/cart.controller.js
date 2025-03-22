const Cart = require("../../models/cart.model");
const Product = require("../../models/products.model");

// [POST] /v1/carts/
module.exports.addProductToCartAPI = async (req, res) => {
  try {
    let { productId, quantity } = req.body;
    const userId = res.locals.user.sub  
    quantity = parseInt(quantity)
  
    // Kiểm tra quantity hợp lệ
    if (isNaN(quantity) || quantity <= 0) {
      throw new Error("Invalid quantity!")
    }
    const product = await Product.findById(productId)
    if(!product) throw new Error("Product not found")
    if(quantity > product.stock) throw new Error("Product stock not enough")
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      const subTotal = product.price * quantity * (1 - product.discountPercentage / 100)
      cart = new Cart({
        userId,
        products: [ { productId, quantity, subTotal } ],
      })
    }

    const existingItem = cart.products.find(item => item.productId.toString() === productId.toString())
    if(existingItem) {
      existingItem.quantity += quantity
      if(existingItem.quantity > product.stock) throw new Error("Product stock not enough")

      existingItem.subTotal = product.price * existingItem.quantity * (1 - product.discountPercentage / 100)
    } else {
      const subTotal = product.price * quantity * (1 - product.discountPercentage / 100);
      cart.products.push({ productId, quantity, subTotal });
    }

    cart.totalAmount = cart.products.reduce((sum, item) => sum + item.subTotal, 0);
    console.log(cart)
    await cart.save()

    res.status(200).json({
      data: true,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// [GET] /v1/carts
module.exports.getCartAPI = async (req, res) => {
  try {
    const userId = res.locals.user.sub

    const cart = await Cart.findOne({ userId }).populate({
      path: "products.productId",
      select: "title price discountPercentage thumbnail stock",
    })
    if (!cart) {
      return res.status(404).json({ message: "Cart not found!" });
    }

    res.status(200).json({
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// [PATCH] /v1/carts/
module.exports.updateProductQuantitiesAPI = async (req, res) => {
  try {
    const userId = res.locals.user.sub;
    const updates = req.body; // [{ productId, quantity }, ...]

    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error("Invalid updates: must provide an array of { productId, quantity }");
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Lấy thông tin sản phẩm từ database
    const productIds = updates.map((update) => update.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = products.reduce((map, product) => {
      map[product._id.toString()] = product;
      return map;
    }, {});

    // Cập nhật số lượng cho từng sản phẩm trong giỏ
    for (const update of updates) {
      const { productId, quantity } = update;

      const parsedQuantity = parseInt(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        throw new Error(`Invalid quantity for product ${productId}`);
      }

      const product = productMap[productId.toString()];
      if (!product || product.status === "inactive" || product.status === "deleted") {
        throw new Error(`Product not found: ${productId}`);
      }

      if (parsedQuantity > product.stock) {
        throw new Error(`Not enough stock for product ${product.title} (ID: ${productId})`);
      }

      // Tìm item trong giỏ hàng
      const item = cart.products.find(
        (p) => p.productId.toString() === productId.toString()
      );
      if (!item) {
        throw new Error(`Product ${productId} not found in cart`);
      }

      item.quantity = parsedQuantity;
      item.subTotal = product.price * item.quantity * (1 - product.discountPercentage / 100);
    }

    cart.totalAmount = cart.products.reduce((sum, item) => sum + item.subTotal, 0);

    await cart.save();

    res.status(200).json({
      data: true,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// [DELETE] /v1/carts/
module.exports.removeProductFromCartAPI = async (req, res) => {
  try {
    const userId = res.locals.user.sub;
    const { productId } = req.body; 

    if (!productId) {
      throw new Error("Product ID is required");
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Tìm sản phẩm trong giỏ hàng
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );
    if (productIndex === -1) {
      throw new Error(`Product ${productId} not found in cart`);
    }

    // Xóa sản phẩm khỏi mảng products
    cart.products.splice(productIndex, 1);

    cart.totalAmount = cart.products.reduce((sum, item) => sum + item.subTotal, 0);

    await cart.save();

    res.status(200).json({
      data: true,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};


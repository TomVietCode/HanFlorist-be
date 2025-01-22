const Product = require("../../models/products.model");

// [GET] /v1/home
module.exports.index = async (req, res) => {
  try {
    const productsFeature = await Product.find({
      featured: "1", 
      status: "active",
      deleted: false,
    })
      .limit(6) 
      .sort({ position: "desc" }); 

    for (let product of productsFeature) {
      product.priceNew = Math.round(
        (1 - product.discountPercentage / 100) * product.price
      ).toLocaleString();
    }

    const productsNew = await Product.find({
      status: "active",
      deleted: false,
    })
      .limit(8) 
      .sort({ position: "desc" }); 

    for (const product of productsNew) {
      product.priceNew = Math.round(
        (1 - product.discountPercentage / 100) * product.price
      ).toLocaleString();
    }

    res.status(200).json({
      message: "Home page data retrieved successfully!",
      data: {
        productsFeature: productsFeature,
        productsNew: productsNew,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error",
      error: error.message,
    });
  }
};

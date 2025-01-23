const Product = require("../../models/products.model");

// [GET] /v1/home
module.exports.index = async (req, res) => {
  try {
    const productsFeature = await Product.find({
      featured: "1", 
      status: "active",
    })
      .limit(9) 
      .sort({ createdAt: "desc" }); 

    const productsNew = await Product.find({
      status: "active",
    })
      .limit(7) 
      .sort({ position: "desc" }); 

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

    });
  }
};

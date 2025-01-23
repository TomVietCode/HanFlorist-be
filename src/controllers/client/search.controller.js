const Product = require("../../models/products.model");

// [GET] /v1/search
module.exports.index = async (req, res) => {
  try {
    const keyword = req.query.keyword;

    if (!keyword) {
      return res.status(400).json({
        message: "Keyword is required!",
      });
    }
    const regex = new RegExp(keyword, "i");
    const products = await Product.find({
      title: regex,
      deleted: false,
      status: "active",
    });

    const newProducts = products.map((item) => {
      const priceNew = (
        (item.price * (100 - item.discountPercentage)) /
        100
      ).toFixed(0);
      return {
        ...item.toObject(), 
        priceNew: priceNew,
      };
    });

   
    res.status(200).json({
      message: "Search results retrieved successfully!",
      data: {
        keyword: keyword,
        products: newProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
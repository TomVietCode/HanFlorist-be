const Product = require("../../models/products.model");
const Category = require("../../models/product.category");

// [GET] /v1/products/
module.exports.index = async (req, res) => {
  try {
    const products = await Product.find({
      status: "active",
      deleted: false,
    }).sort({ position: "desc" });

    const newProducts = products.map((item) => {
      item.priceNew = Math.round(
        (1 - item.discountPercentage / 100) * item.price
      ).toLocaleString();
      return item;
    });

    res.status(200).json({
      message: "Product list retrieved successfully!",
      data: newProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// [GET] /v1/products/detail/:slug
module.exports.detail = async (req, res) => {
  const find = {
    slug: req.params.slug,
    deleted: false,
    status: "active",
  };

  try {
    const product = await Product.findOne(find);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    product.priceNew = Math.round(
      (1 - product.discountPercentage / 100) * product.price
    ).toLocaleString();

    const relatedProduct = await Product.find({
      _id: { $ne: product.id },
      categoryId: product.categoryId,
      deleted: false,
      status: "active",
    }).limit(4);

    let newProducts = [];
    if (relatedProduct.length > 0) {
      newProducts = relatedProduct.map((item) => {
        item.priceNew = Math.round(
          (1 - item.discountPercentage / 100) * item.price
        ).toLocaleString();
        return item;
      });
    }

    res.status(200).json({
      message: "Product details retrieved successfully!",
      data: {
        product: product,
        relatedProduct: newProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// [GET] /v1/products/:slugCategory
module.exports.slugCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slugCategory,
      status: "active",
      deleted: false,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }

    const getSubCategory = async (parent_id) => {
      let allSub = [];
      const listSub = await Category.find({
        parent_id: parent_id,
        status: "active",
        deleted: false,
      });
      allSub = [...listSub];

      for (const sub of listSub) {
        const child = await getSubCategory(sub.id);
        allSub = allSub.concat(child);
      }
      return allSub;
    };

    const listSubCategory = await getSubCategory(category.id);
    const listSubCategoryId = listSubCategory.map((item) => item.id);

    const products = await Product.find({
      categoryId: { $in: [category.id, ...listSubCategoryId] },
      status: "active",
      deleted: false,
    });

    res.status(200).json({
      message: "Product list by category retrieved successfully!",
      data: {
        category: category.title,
        products: products,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

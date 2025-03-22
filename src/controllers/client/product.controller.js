const Product = require("../../models/products.model")
const Category = require("../../models/category.model")

// [GET] /v1/products/
module.exports.listAPI = async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 20
    } = req.query

    const filter = { status: "active" }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(filter)
      .sort({ [sortBy]: order })
      .limit(parseInt(limit))
      .select("title price discountPercentage thumbnail stock createdAt slug")
      .skip((page - 1) * limit)

    res.status(200).json({
      data: products,
      paging: { page: page, limit: limit },
      filter: req.query,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [GET] /v1/products/:slug
module.exports.getAPI = async (req, res) => {
  const find = {
    slug: req.params.slug,
    status: "active",
  }

  try {
    const product = await Product.findOne(find).select("-createdBy -updatedBy -updatedAt")
    if (!product) {
      return res.status(404).json({ message: "Product not found!" })
    }

    res.status(200).json({
      data: product
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// [GET] /v1/products/:slugCategory
module.exports.listProductCategoryAPI = async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 20
    } = req.query

    const category = await Category.findOne({
      slug: req.params.slugCategory,
      status: "active",
    })

    if (!category) {
      return res.status(404).json({ message: "Category not found!" })
    }

    const getSubCategories = async (parentId) => {
      const subCategories = await Category.find({ parentId, status: "active" }).lean();
      let allSubCategoryIds = [parentId];
      for (const subCat of subCategories) {
        const subIds = await getSubCategories(subCat._id);
        allSubCategoryIds = allSubCategoryIds.concat(subIds);
      }
      return allSubCategoryIds;
    };

    const categoryIds = await getSubCategories(category._id);
    console.log(categoryIds)
    // Xây dựng điều kiện lọc
    const filter = { categoryId: { $in: categoryIds } };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(filter)
      .select("title price discountPercentage thumbnail stock createdAt slug categoryId")
      .sort({ [sortBy]: order })
      .limit(parseInt(limit))
      .skip((page - 1) * limit)


    res.status(200).json({
      data: products,
      paging: { page: page, limit: limit },
      filter: req.query,
    })  
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

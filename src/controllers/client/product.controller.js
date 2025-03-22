const Product = require("../../models/products.model")
const Category = require("../../models/category.model")

// [GET] /v1/products/
module.exports.index = async (req, res) => {
  try {
    const sortBy = req.query.sortBy || "newest"

    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity

    let sortCriteria = {}
    switch (sortBy) {
      case "newest":
        sortCriteria = { createdAt: -1 }
        break
      case "oldest":
        sortCriteria = { createdAt: 1 }
        break
      case "priceAsc":
        sortCriteria = { price: 1 }
        break
      case "priceDesc":
        sortCriteria = { price: -1 }
        break
      default:
        sortCriteria = { createdAt: -1 }
    }

    const priceFilter = {}
    if (req.query.minPrice) priceFilter.$gte = minPrice
    if (req.query.maxPrice) priceFilter.$lte = maxPrice

    const products = await Product.find({
      status: "active",
      price: priceFilter,
    }).sort(sortCriteria)

    res.status(200).json({
      message: "Products retrieved successfully!",
      data: products,
    })
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    })
  }
}

// [GET] /v1/products/:slug
module.exports.detail = async (req, res) => {
  const find = {
    slug: req.params.slug,
    status: "active",
  }

  try {
    const product = await Product.findOne(find)
    if (!product) {
      return res.status(404).json({ message: "Product not found!" })
    }

    res.status(200).json({
      message: "Product details retrieved successfully!",
      data: {
        product: product,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    })
  }
}

// [GET] /v1/products/:slugCategory
module.exports.slugCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slugCategory,
      status: "active",
    })

    if (!category) {
      return res.status(404).json({ message: "Category not found!" })
    }

    const sortBy = req.query.sortBy || "newest"

    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : Infinity

    let sortCriteria = {}
    switch (sortBy) {
      case "newest":
        sortCriteria = { createdAt: -1 }
        break
      case "oldest":
        sortCriteria = { createdAt: 1 }
        break
      case "priceAsc":
        sortCriteria = { price: 1 }
        break
      case "priceDesc":
        sortCriteria = { price: -1 }
        break
      default:
        sortCriteria = { createdAt: -1 }
    }

    const priceFilter = {}
    if (req.query.minPrice) priceFilter.$gte = minPrice
    if (req.query.maxPrice) priceFilter.$lte = maxPrice

    const getSubCategory = async (parent_id) => {
      let allSub = []
      const listSub = await Category.find({
        parent_id: parent_id,
        status: "active",
      })
      allSub = [...listSub]

      for (const sub of listSub) {
        const child = await getSubCategory(sub.id)
        allSub = allSub.concat(child)
      }
      return allSub
    }

    const listSubCategory = await getSubCategory(category.id)
    const listSubCategoryId = listSubCategory.map((item) => item.id)

    const products = await Product.find({
      categoryId: { $in: [category.id, ...listSubCategoryId] },
      status: "active",
      price: priceFilter,
    }).sort(sortCriteria)

    res.status(200).json({
      message: "Product list by category retrieved successfully!",
      data: {
        category: category.title,
        products: products,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    })
  }
}

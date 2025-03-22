const Product = require("../../models/products.model")
const User = require("../../models/user.model")

//[GET] /admin/products
module.exports.listApi = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      sortKey = "createdAt",
      sortValue = "desc",
    } = req.query

    let find = {
      status: { $ne: "deleted" },
    }

    if (status) {
      find.status = status
    }
    //Search
    if (search) {
      const regex = new RegExp(search, "i")
      find.title = regex
    }

    const products = await Product.find(find)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ [sortKey]: sortValue })
      .populate([
        { path: "categoryId", select: "title" },
        { path: "createdBy", select: "name" },
        { path: "updatedBy", select: "name" },
      ])

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

//[POST] /admin/products
module.exports.createApi = async (req, res) => {
  try {
    req.body.createdBy = res.locals.user.sub
    req.body.updatedBy = res.locals.user.sub

    const product = new Product(req.body)
    await product.save()

    res.status(201).json({
      data: product.id,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

//[GET] /admin/products/:id
module.exports.getApi = async (req, res) => {
  const { id } = req.params
  try {
    const product = await Product.findOne({
      _id: id,
      status: { $ne: "deleted" },
    }).populate([
      { path: "categoryId", select: "title" },
      { path: "createdBy", select: "name" },
      { path: "updatedBy", select: "name" },
    ])
    res.status(200).json({
      data: product,
    })
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        message: "Product not found (Invalid Id)",
      })
    }
    res.status(400).json({
      message: error.message,
    })
  }
}

//[PATCH] /admin/products/:id
module.exports.updateApi = async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  try {
    req.body.updatedBy = res.locals.user.sub

    const product = await Product.findById(id)

    if (product.status === "deleted" && status !== "active") {
      throw new Error("Product not found!")
    }
    await Product.updateOne(
      {
        _id: id,
      },
      req.body,
      { runValidators: true }
    )
    res.status(200).json({
      data: true,
    })
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        message: "Product not found (Invalid Id)",
      })
    }
    res.status(400).json({
      message: error.message,
    })
  }
}

//[DELETE] /admin/products/:id
module.exports.deleteApi = async (req, res) => {
  const { id } = req.params
  const { isHard = false } = req.body
  try {
    if (!isHard) {
      await Product.updateOne(
        {
          _id: id,
          status: { $ne: "deleted" },
        },
        { status: "deleted", updatedBy: res.locals.user.sub }
      )
    } else {
      await Product.deleteOne({ _id: id })
    }

    res.status(200).json({
      data: true,
    })
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        message: "Product not found (Invalid Id)",
      })
    }
    res.status(500).json({
      message: error.message,
    })
  }
}

//[PATCH] /admin/products/:id
module.exports.updateManyApi = async (req, res) => {
  try {
    const { ids, updates } = req.body

    await Product.updateMany({ _id: { $in: ids }, status: { $ne: "deleted" } }, { $set: updates })

    res.status(200).json({ data: true })
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        message: "Invalid Ids",
      })
    }
    res.status(400).json({
      message: error.message,
    })
  }
}

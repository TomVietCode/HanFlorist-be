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

    let find = {}

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

    // Tập hợp tất cả ID của createdBy và updatedBy
    const userIds = [
      ...new Set(
        products.flatMap((product) => [product.createdBy, product.updatedBy].filter(Boolean))
      ),
    ]

    const users = await User.find({ _id: { $in: userIds } })

    // Tạo map để dễ tra cứu user theo ID
    const userMap = {}
    users.forEach((user) => {
      userMap[user.id] = user.name
    })

    // Thêm thông tin người tạo và cập nhật vào từng sản phẩm
    const newProducts = products.map((product) => ({
      ...product._doc, // Dữ liệu gốc của sản phẩm
      creatorName: userMap[product.createdBy] || "",
      updaterName: userMap[product.updatedBy] || "",
    }))

    res.status(200).json({
      data: newProducts,
      paging: { page: page, limit: limit },
      filter: req.query,
    })
  } catch (error) {
    res.status(500).json({
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
    })

    res.status(200).json({
      data: product,
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
module.exports.updateApi = async (req, res) => {
  const { id } = req.params
  try {
    req.body.updatedBy = res.locals.user.sub
    await Product.updateOne(
      {
        _id: id,
        status: { $ne: "deleted" },
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
    res.status(500).json({
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

    await Product.updateMany(
      { _id: { $in: ids }, status: { $ne: "deleted" } },
      { $set: updates }
    );

    res.status(200).json({ data: true });
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        message: "Invalid Ids",
      })
    }
    res.status(500).json({
      message: error.message,
    })
  }
}
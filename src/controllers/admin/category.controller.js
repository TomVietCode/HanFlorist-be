const Category = require("../../models/category.model")
const Product = require("../../models/products.model")
const User = require("../../models/user.model")
const buildTree = require("../../helpers/buildTree")
//[GET] /admin/categories
module.exports.listApi = async (req, res) => {
  try {
    const {
      status,
      search,
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

    const categories = await Category.find(find).sort({ [sortKey]: sortValue })

    // Tập hợp tất cả ID của createdBy và updatedBy
    const userIds = [
      ...new Set(
        categories.flatMap((category) => [category.createdBy, category.updatedBy].filter(Boolean))
      ),
    ]

    const users = await User.find({ _id: { $in: userIds } })

    // Tạo map để dễ tra cứu user theo ID
    const userMap = {}
    users.forEach((user) => {
      userMap[user.id] = user.name
    })

    // Thêm thông tin người tạo và cập nhật vào từng danh mục
    const newCategories = categories.map((category) => ({
      ...category._doc, // Dữ liệu gốc của danh mục
      creatorName: userMap[category.createdBy] || "",
      updaterName: userMap[category.updatedBy] || "",
    }))

    const categoriesTree = buildTree(newCategories)

    res.status(200).json({
      data: categoriesTree,
    })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

//[POST] /admin/categories
module.exports.createApi = async (req, res) => {
  try {
    req.body.createdBy = res.locals.user.sub
    req.body.updatedBy = res.locals.user.sub

    const category = new Category(req.body)
    await category.save()

    res.status(201).json({
      data: category.id,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

//[GET] /admin/categories/:id
module.exports.getApi = async (req, res) => {
  const { id } = req.params
  try {
    const category = await Category.findOne({
      _id: id,
      status: { $ne: "deleted" },
    })

    res.status(200).json({
      data: category
    })
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        message: "Category not found (Invalid Id)",
      })
    }
    res.status(500).json({
      message: error.message,
    })
  }
}

//[PATCH] /admin/categories/:id
module.exports.updateApi = async (req, res) => {
  const { id } = req.params
  try {
    req.body.updatedBy = res.locals.user.sub
    await Category.updateOne(
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
        message: "Category not found (Invalid Id)",
      })
    }
    res.status(500).json({
      message: error.message,
    })
  }
}

//[DELETE] /admin/categories/:id
module.exports.deleteApi = async (req, res) => {
  const { id } = req.params
  const { isHard = false } = req.body
  try {
    if (!isHard) {
      await Category.updateOne(
        {
          _id: id,
          status: { $ne: "deleted" },
        },
        { status: "deleted", updatedBy: res.locals.user.sub }
      )
    } else {
      await Category.deleteOne({ _id: id })
    }

    res.status(200).json({
      data: true,
    })
  } catch (error) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        message: "Category not found (Invalid Id)",
      })
    }
    res.status(500).json({
      message: error.message,
    })
  }
}

//[PATCH] /admin/categories/:id
module.exports.updateManyApi = async (req, res) => {
  try {
    const { ids, updates } = req.body

    await Category.updateMany(
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
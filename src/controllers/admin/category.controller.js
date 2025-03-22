const Category = require("../../models/category.model")
const Product = require("../../models/products.model");
const buildTree = require("../../helpers/buildTree")
const { default: mongoose } = require("mongoose")

//[GET] /admin/categories
module.exports.listApi = async (req, res) => {
  try {
    const {
      status,
      search,
      sortKey = "createdAt",
      sortValue = "desc",
    } = req.query;

    // Điều kiện lọc
    let find = {};
    if (status) find.status = status
    if (search) {
      const regex = new RegExp(search, "i");
      find.title = regex;
    }
    
    const categories = await Category.find(find)
      .populate("createdBy", "_id name") 
      .populate("updatedBy", "_id name")
      .sort({ [sortKey]: sortValue === "desc" ? -1 : 1 })
      .lean();

    // Tính tổng sản phẩm cho từng danh mục
    const categoryIds = categories.map(cat => cat._id);
    const productCounts = await Product.aggregate([
      { $match: { categoryId: { $in: categoryIds }, status: "active" } },
      { $group: { _id: "$categoryId", totalProducts: { $sum: 1 } } },
    ]);

    const productCountMap = new Map(productCounts.map(item => [item._id.toString(), item.totalProducts]));

    // Thêm totalProducts vào từng danh mục và tính tổng cho danh mục cha
    const addProductCount = (category) => {
      let total = productCountMap.get(category._id.toString()) || 0; 
      if (category.children && category.children.length > 0) {
        category.children.forEach(child => {
          total += addProductCount(child); 
        });
      }
      category.totalProducts = total;
      return total;
    };

    const categoriesTree = buildTree(categories);

    categoriesTree.forEach(category => addProductCount(category));

    res.status(200).json({
      data: categoriesTree,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

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
    const categories = await Category.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      // lấy danh sách sản phẩm
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "categoryId",
          as: "products",
        },
      },
      //đếm danh mục con
      {
        $lookup: {
          from: "categories", 
          localField: "_id",
          foreignField: "parentId",
          as: "subcategories",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creatorInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "updatedBy",
          foreignField: "_id",
          as: "updaterInfo",
        },
      },
      {
        $project: {
          title: 1,
          parentId: 1,
          description: 1,
          status: 1,
          slug: 1,
          createdAt: 1,
          updatedAt: 1,
          products: 1, // Danh sách sản phẩm
          totalSubcategories: { $size: "$subcategories" }, // Tổng số danh mục con
          createdBy: {
            $cond: {
              if: { $gt: [{ $size: "$creatorInfo" }, 0] },
              then: {
                id: "$createdBy",
                name: { $arrayElemAt: ["$creatorInfo.name", 0] },
              },
              else: null,
            },
          },
          updatedBy: {
            $cond: {
              if: { $gt: [{ $size: "$updaterInfo" }, 0] },
              then: {
                id: "$updatedBy",
                name: { $arrayElemAt: ["$updaterInfo.name", 0] },
              },
              else: null,
            },
          },
        },
      },
    ]);

    const category = categories[0]

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
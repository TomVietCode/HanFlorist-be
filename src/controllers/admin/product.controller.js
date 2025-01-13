const Product = require("../../models/products.model")
const User = require("../../models/user.model")

//[GET] /admin/products
module.exports.list = async (req, res) => {
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
      deleted: false,
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
  
    // Tập hợp tất cả ID của createdBy và updatedBy
    const userIds = [
      ...new Set(
        products.flatMap((product) => [product.createdBy, product.updatedBy].filter(Boolean))
      ),
    ];
  
    const users = await User.find({ _id: { $in: userIds } });
  
    // Tạo map để dễ tra cứu user theo ID
    const userMap = {};
    users.forEach((user) => {
      userMap[user.id] = user.name;
    });
  
    // Thêm thông tin người tạo và cập nhật vào từng sản phẩm
    const newProducts = products.map((product) => ({
      ...product._doc, // Dữ liệu gốc của sản phẩm
      creatorName: userMap[product.createdBy] || "",
      updaterName: userMap[product.updatedBy] || "",
    }));
  
    res.status(200).json({
      data: newProducts, 
      paging: { page: page, limit: limit }, 
      filter: req.query
    })
  }catch(error) {
    res.status(500).json({
      message: "Lỗi khi gửi yêu cầu, vui lòng thử lại sau",
      error: error.message,
    });
  }
}

//[POST] /admin/products
module.exports.create = async (req, res) => {
  try {
    req.body.createdBy = req.user.decoded.sub
    req.body.updatedBy = req.user.decoded.sub

    const product = new Product(req.body)
    await product.save()

    res.status(200).json({
      data: product.id
    })
  } catch (error) {
    res.status(400).json({
      message: error.message
    })
  }
}

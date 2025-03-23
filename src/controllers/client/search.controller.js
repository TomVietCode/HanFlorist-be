const Product = require("../../models/products.model");
const Category = require("../../models/category.model");

module.exports.searchAPI = async (req, res) => {
  try {
    const {
      keyword,
      minPrice, 
      maxPrice, 
      categorySlug, 
      sortBy = "relevance", //relevance, title, price, createdAt
      order = "desc", 
      page = 1, 
      limit = 20, 
    } = req.query;

    const filter = {};

    if (keyword) {
      filter.$text = { $search: keyword }; 
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Kiểm tra giá trị hợp lệ
    if (minPrice && isNaN(parseFloat(minPrice))) {
      throw new Error("minPrice must be a valid number");
    }
    if (maxPrice && isNaN(parseFloat(maxPrice))) {
      throw new Error("maxPrice must be a valid number");
    }
    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
      throw new Error("minPrice must be less than or equal to maxPrice");
    }

    // Lọc theo danh mục 
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (!category) {
        throw new Error("Category not found");
      }
      const getSubCategories = async (parentId) => {
        const subCategories = await Category.find({ parentId }).lean();
        let allSubCategoryIds = [parentId];
        for (const subCat of subCategories) {
          const subIds = await getSubCategories(subCat._id);
          allSubCategoryIds = allSubCategoryIds.concat(subIds);
        }
        return allSubCategoryIds;
      };
      const categoryIds = await getSubCategories(category._id);
      filter.categoryId = { $in: categoryIds };
    }

    // Xây dựng điều kiện sắp xếp
    const sortOptions = ["relevance", "title", "price", "createdAt"];
    const orderOptions = ["asc", "desc"];
    const sortField = sortOptions.includes(sortBy) ? sortBy : "relevance";
    let sort = {};
    if (sortField === "relevance" && keyword) {
      sort = { score: { $meta: "textScore" } }; // Sắp xếp theo độ liên quan khi tìm kiếm
    } else {
      const sortOrder = orderOptions.includes(order) ? (order === "asc" ? 1 : -1) : -1;
      sort = { [sortField]: sortOrder };
    }

    // Tính toán phân trang
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || pageNum < 1) {
      throw new Error("Page must be a positive integer");
    }
    if (isNaN(limitNum) || limitNum < 1) {
      throw new Error("Limit must be a positive integer");
    }
    const skip = (pageNum - 1) * limitNum;
   
    // Truy vấn danh sách sản phẩm
    const products = await Product.find(filter)
      .select("title price discountPercentage thumbnail stock createdAt categoryId")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();
    // Đếm tổng số sản phẩm
    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      data: products,
      paging: { page: pageNum, limit: limitNum, totalPages: Math.ceil(totalProducts / limitNum) },
      filter: req.query,
      totalProducts
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
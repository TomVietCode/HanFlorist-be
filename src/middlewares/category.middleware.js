const Category = require("../models/category.model");
const buildTree = require("../helpers/buildTree")

module.exports.getCategoryTree = async (req, res, next) => {
  const categories = await Category.find({
    status: "active",
  }).lean()
  
  const categoriesTree = buildTree(categories);

  res.locals.categoriesTree = categoriesTree

  res.status(200).json(categoriesTree);
  next()
}

const mongoose = require("mongoose")
const slug = require("mongoose-slug-updater")
mongoose.plugin(slug)

const productCategorySchema = new mongoose.Schema({
  title: String,
  parent_id: {
    type: String, 
    default: ""
  },
  description: String,
  position: Number,
  status: String,
  slug: {
    type: String,
    slug: "title",
    unique: true
  },
  createdBy: String,
  updatedBy: String,
  deleted: {
    type: Boolean,
    default: false
  },
}, { timestamps: true})

const ProductCategory = mongoose.model("ProductCategory", productCategorySchema, "product-category")

module.exports = ProductCategory
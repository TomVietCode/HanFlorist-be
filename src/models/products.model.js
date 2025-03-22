const mongoose = require("mongoose")
const slug = require("mongoose-slug-updater")
mongoose.plugin(slug)

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    featured: {
      type: Boolean,
      default: false,
    },
    description: String,
    price: {
      type: Number,
      min: [0, "Price must me higher than 0"],
      required: true
    },
    discountPercentage: {
      type: Number,
      min: [0, "Discount value must me higher than 0"],
      max: [100, "Discount value must me lower than 100"]
    },
    stock: {
      type: Number,
      min: [0, "Stock quantity must me higher than 0"],
      required: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "deleted"],
        message: '{VALUE} is not supported'
      },
      default: "active",
      required: true
    },
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
)

productSchema.index({ title: 1 })

const Product = mongoose.model("Product", productSchema, "products")

module.exports = Product

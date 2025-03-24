const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'], 
    trim: true, 
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || mongoose.Types.ObjectId.isValid(v);
      },
      message: props => `${props.value} is not a valid parentId!`,
    },
  },
  description: String,
  thumbnail: String,
  status: {
    type: String,
    enum: ['active', 'inactive', "deleted"], 
    default: "active", 
  },
  slug: {
    type: String,
    slug: "title",
    unique: true, 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Create Category model
const Category = mongoose.model("Category", categorySchema, "categories");

module.exports = Category;

const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    username: String,
    password: String,
    phone: String,
    avatar: String,
    address: String,
    role: String,
    status: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model("User", userSchema, "users")

module.exports = User


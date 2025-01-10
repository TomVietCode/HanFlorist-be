const mongoose = require("mongoose")

const accountSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    username: String,
    password: String,
    salt: String,
    phone: String,
    avatar: String,
    role_id: String,
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

const Account = mongoose.model("Account", accountSchema, "accounts")

module.exports = Account

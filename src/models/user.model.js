const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must have at least 3 characters"],
      maxlength: [20, "Username must have at most 20 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must have at least 6 characters"],
    },
    phone: String,
    avatar: String,
    address: String,
    role: {
      type: String,
      required: true,
      enum: ["admin", "client"],
      default: "user",
    },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "banned", "deleted"],
        message: "{VALUE} is not supported", 
      },
      default: "active",
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model("User", userSchema, "users")

module.exports = User

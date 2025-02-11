const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    googleId: {
      type: String, unique: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [6, "Password must have at least 6 characters"],
    },
    phone: String,
    avatar: String,
    address: String,
    role: {
      type: String,
      required: true,
      enum: ["admin", "client"],
      default: "client",
    },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: false },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "banned", "deleted"],
        message: "{VALUE} is not supported", 
      },
      default: "active",
    },
    provider: { type: String, enum: ["local", "google"], default: "local" }
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model("User", userSchema, "users")

module.exports = User

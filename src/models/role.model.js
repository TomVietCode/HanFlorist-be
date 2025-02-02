const mongoose = require("mongoose");

const roleSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Role title is required"],
      unique: true,
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    permissions: {
      type: [String], 
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "deleted"],
        message: "{VALUE} is not supported", 
      },
      default: "active",
    },
  },
  {
    timestamps: true, 
  }
);

const Role = mongoose.model("Role", roleSchema, "roles");

module.exports = Role;

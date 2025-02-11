const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      required: true,
      expires: 300, 
    },
  },
  { timestamps: true }
);

const Otp = mongoose.model("Otp", otpSchema, "otps");

module.exports = Otp;
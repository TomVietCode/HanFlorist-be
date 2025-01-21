const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../helpers/jwt");
const ForgotPassword = require("../../models/forgot-password.model");
const generateHelper = require("../../helpers/generateRandom.helper");
const sendEmailHelper = require("../../helpers/sendMail.helper");

// [POST] /v1/users/register
module.exports.register = async (req, res) => {
  const { name, email, username, password, phone } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or username is already in use!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      phone,
      role: "client",
      status: "active",
      deleted: false,
    });

    await newUser.save();

    const payload = {
      sub: newUser._id,
      role: newUser.role,
    };
    const token = generateToken(payload);

    res.status(201).json({
      success: true,
      message: "Registration successful!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// [POST] /v1/users/login
module.exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    username: username,
    role: "client",
    status: "active",
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  const ismatch = await bcrypt.compare(password, user.password);

  if (!ismatch) {
    return res.status(400).json({
      message: "Invalid password",
    });
  }

  const payload = {
    sub: user.id,
    role: user.role,
  };
  const jwtToken = generateToken(payload);
  res.json({
    data: jwtToken,
  });
};

// [POST] /v1/users/logout
module.exports.logout = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// [POST] /v1/users/forgot-password
module.exports.forgotPasswordPost = async (req, res) => {
  const { email } = req.body;

  try {
    const existEmail = await User.findOne({ email });
    if (!existEmail) {
      return res.status(404).json({
        success: false,
        message: "Email does not exist!",
      });
    }

    const otp = generateHelper.generateRandomNumber(6);
    
    const objectForgotPassword = new ForgotPassword({
      email,
      otp,
      expireAt: Date.now() + 5 * 60 * 1000,
    });

    await objectForgotPassword.save();

    const subject = "[HANFLORIST] OTP Verification Code";
    const html = `
      <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">HANFLORIST</a>
            </div>
            <p style="font-size:1.1em">Hello ${existEmail.fullName},</p>
            <p>Below is your OTP for password reset. Please do not share it with anyone. The OTP is valid for 5 minutes!</p>
            <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">
                ${otp}</h2>
            <p style="font-size:0.9em;">Best regards,<br />HANFLORIST</p>
            <hr style="border:none;border-top:1px solid #eee" />
        </div>
      </div>`;

    await sendEmailHelper.sendEmail(email, subject, html);

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your email!",
      email,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports.otpPasswordPost = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const existOTP = await ForgotPassword.findOne({ email, otp });
    if (!existOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP!",
      });
    }

    if (existOTP.expireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired!",
      });
    }

    const user = await User.findOne({ email });
    const token = generateHelper.generateRandomString(20);

    user.tokenUser = token;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully!",
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// [PATCH] /v1/users/reset-password
module.exports.resetPasswordPatch = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({ tokenUser: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token!",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.tokenUser = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

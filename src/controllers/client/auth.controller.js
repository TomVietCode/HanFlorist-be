const User = require("../../models/user.model")
const bcrypt = require("bcrypt")
const { generateToken } = require("../../helpers/jwt")
const Otp = require("../../models/otp.model")
const generateHelper = require("../../helpers/generateRandom.helper")
const sendEmailHelper = require("../../helpers/sendMail.helper")

// [POST] /auth/signup
module.exports.signup = async (req, res) => {
  const { name, email, username, password } = req.body

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] })
    if (existingUser) throw new Error("Email or username is existed")

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      role: "client",
    })
    await newUser.save()

    const payload = {
      sub: newUser._id,
      role: newUser.role,
    }
    const token = generateToken(payload)

    res.status(201).json({
      data: token,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [POST] /auth/login
module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({
      username: username,
      role: "client",
      status: "active",
    })
    if (!user) throw new Error("Invalid username")

    const ismatch = await bcrypt.compare(password, user.password)
    if (!ismatch) throw new Error("Invalid password")

    const jwtToken = generateToken({
      sub: user._id,
      role: user.role,
    })

    res.status(200).json({
      data: jwtToken,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [POST] /auth/forgot-password
module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) throw new Error("Invalid email")

    const otpString = generateHelper.generateRandomNumber(6)

    const otp = new Otp({
      email,
      otp: otpString,
      expireAt: Date.now() + 5 * 60 * 1000,
    })
    await otp.save()

    const subject = `${otpString} là mã xác thực OTP của bạn`
    const html = `
      <div style="font-family: Helvetica,Arial,sans-serif;max-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.5em;color: #00466a;text-decoration:none;font-weight:600">HANFLORIST</a>
            </div>
            <p style="font-size:18px">Xin chào ${user.name},</p>
            <p style="font-size:18px">Dưới đây là mã xác thực OTP của quý khách. Tuyệt đối KHÔNG chia sẻ mã OTP này với bất kỳ ai. Mã OTP sẽ hết hiệu lực sau 5 phút</p>
            <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;font-size:1.6rem">
                ${otpString}</h2>
            <p style="font-size:18px;">Trân trọng,<br />HANFLORIST</p>
            <hr style="border:none;border-top:1px solid #eee" />
        </div>
      </div>`

    await sendEmailHelper.sendEmail(email, subject, html)

    return res.status(200).json({
      data: true,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [POST] /auth/otp-password
module.exports.otpPassword = async (req, res) => {
  const { email, otp } = req.body

  try {
    const existOTP = await Otp.findOne({ email, otp, expireAt: { $gt: Date.now() } })
    if (!existOTP) throw new Error("Invalid OTP")

    const user = await User.findOne({ email })
    
    const token = generateToken({ sub: user._id, role: user.role })

    res.status(200).json({
      data: token
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [PATCH] /auth/reset-password
module.exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body

  try {
    const id = res.locals.user.sub
    const user = await User.findById(id)
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await User.findByIdAndUpdate(id, { password: hashedPassword })

    res.status(200).json({
      data: true
    })

  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

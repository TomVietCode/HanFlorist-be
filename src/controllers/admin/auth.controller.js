const bcrypt = require("bcrypt")
const User = require("../../models/user.model")
const { generateToken } = require("../../helpers/jwt")

module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({
        message: "Thiếu tài khoản hoặc mật khẩu",
      })
      return
    }

    const user = await User.findOne({
      username: username,
      deleted: false,
      status: "active",
    })

    if (!user) {
      res.status(404).json({
        message: "Không tồn tại tài khoản",
      })
      return
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (isPasswordMatch) {
      res.status(404).json({
        message: "Sai mật khẩu",
      })
      return
    }

    const payload = {
      sub: user.id,
      role: user.role,
    }

    const accessToken = generateToken(payload)

    res.status(200).json({
      data: accessToken,
    })
  } catch (error) {
    console.error(error.message)
    res.status(400).json({
      message: error.message,
    })
  }
}

const bcrypt = require("bcrypt")
const User = require("../../models/user.model")
const { generateToken } = require("../../helpers/jwt")

module.exports.login = async (req, res) => {
  try {
    const { username = "", password = "" } = req.body

    const user = await User.findOne({
      username: username,
      status: "active",
      role: "admin"
    })

    if (!user) {
      res.status(404).json({
        message: "User not found",
      })
      return
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (isPasswordMatch) {
      res.status(400).json({
        message: "Invalid username or password",
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


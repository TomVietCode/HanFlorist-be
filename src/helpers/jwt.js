const jwt = require("jsonwebtoken")

const secretKey = process.env.JWT_SECRET_KEY

module.exports.generateToken = (payload) => {
  return jwt.sign(payload, secretKey, { expiresIn: "7d" })
}

module.exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey)
    return { valid: true, decoded }
  } catch (error) {
    return {
      valid: false,
      error: error.name,
      message: error.message,
    }
  }
}

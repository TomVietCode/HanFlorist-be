const { verifyToken } = require("../helpers/jwt")

const requireAuth = (req, res, next) => {
  // Lấy token từ header Authorization
  const token = req.headers.authorization.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      message: 'Yêu cầu gửi kèm JWT token',
    });
  }

  try {
    const payload = verifyToken(token)

    req.user = payload;

    next();
  } catch (error) {
    return res.status(403).json({
      message: 'Token không hợp lệ hoặc hết hạn',
    });
  }
};

module.exports = requireAuth;

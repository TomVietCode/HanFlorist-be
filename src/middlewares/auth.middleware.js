const { verifyToken } = require("../helpers/jwt");

const requireAuth = (page) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'JWT token is required',
      });
    }

    try {
      const payload = verifyToken(token);

      if(payload.valid == false) {
        return res.status(403).json({
          message: 'Invalid or expired token',
        });
      }

      if (page === 'admin' && payload.decoded.role !== 'admin') {
        return res.status(403).json({
          message: 'You do not have permission to access the admin page',
        });
      }

      res.locals.user = payload.decoded;

      next();
    } catch (error) {
      return res.status(403).json({
        message: 'Invalid or expired token',
      });
    }
  };
};

module.exports = requireAuth;

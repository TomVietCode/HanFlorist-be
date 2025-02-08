const User = require("../models/user.model")

const checkRole = (permissions = []) => {
  return async (req, res, next) => {
    try {
      const userId = res.locals.user.sub
      const user = await User.findById(userId).select("roleId").populate("roleId", "permissions")
      const userPermissions = user.roleId.permissions || []

      const hasPermission = permissions.some((perm) => userPermissions.includes(perm))

      if (!hasPermission) {
        return res.status(403).json({ message: `Forbidden`, detail: `Need ${permissions} permissions` })
      }
      next()
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" })
    }
  }
}

module.exports = checkRole

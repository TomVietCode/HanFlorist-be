const User = require("../../models/user.model");

// [GET] /v1/users/profile
module.exports.profile = async (req, res) => {
  try {
    const userId = res.locals.user.sub; 

    const user = await User.findById(userId).select("-password"); 

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    res.status(200).json({
      message: "User profile retrieved successfully!",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


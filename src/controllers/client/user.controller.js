const User = require("../../models/user.model");

// [GET] /v1/users/profile
module.exports.profile = async (req, res) => {
  try {
    const userId = res.locals.user.sub; 

    const user = await User.findById(userId).select("-password -roleId"); 

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

//[PATCH] /v1/users/
module.exports.updateAPI = async (req, res) => {
  try {
    const userId = res.locals.user.sub;

    const user = await User.findById(userId);
    if (!user || user.status === "banned" || user.status === "deleted") {
      throw new Error("User not found or account is restricted");
    }
    
    const restrictedFields = ["role", "roleId", "status", "email", "googleId"];
    const requestFields = Object.keys(req.body);
    const hasRestrictedFields = requestFields.some((field) => restrictedFields.includes(field));

    if (hasRestrictedFields) {
      throw new Error("Forbidden");
    }

    await User.updateOne({ _id: userId }, req.body);

    res.status(200).json({
      data: true,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
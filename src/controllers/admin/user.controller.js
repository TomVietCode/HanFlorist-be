const User = require("../../models/user.model")
const bcrypt = require("bcrypt")

// [GET] /admin/users
module.exports.listApi = async (req, res) => {
  try {
    const { role = "admin", page = 1, limit = 10 } = req.query

    if (role === "admin") {
      const admins = await User.find({ role: "admin" })
        .select("-password")
        .populate("roleId", "title")
        .limit(limit)
        .skip((page - 1) * limit)
        .lean()
      return res.status(200).json({
        data: admins,
        paging: {
          page: page,
          limits: limit,
        },
      })
    }

    if (role === "client") {
      const clients = await User.find({ role: "client" })
        .select("-password")
        .limit(limit)
        .skip((page - 1) * limit)
      return res.status(200).json({
        data: clients,
        paging: {
          page: page,
          limits: limit,
        },
      })
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
}

// [GET] /admin/users/profile
module.exports.profileApi = async (req, res) => {
  try {
    const id = res.locals.user.sub
    const data = await User.findById(id).select("-password")
    res.status(200).json({ data })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [PATCH] /admin/users/profile
module.exports.updateProfileApi = async (req, res) => {
  try {
    const id = res.locals.user.sub

    await User.findByIdAndUpdate(id, req.body)
    res.status(200).json({ data: true })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [GET] /admin/users/:id
module.exports.getApi = async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findById(id).lean()
    
    if(!user || user.status === "deleted") {
      throw new Error("User not found")
    }

    const { password, ...props } = user

    res.status(200).json({
      data: props,
    })
  } catch (error) {
    res.status(400).json({
      data: false,
      message: error.message,
    })
  }
}

// [POST] /admin/users
module.exports.createApi = async (req, res) => {
  try {
    const { password } = req.body
    req.body.password = await bcrypt.hash(password, 10)

    const newUser = new User(req.body)
    await newUser.save()

    res.status(201).json({
      data: newUser._id,
    })

  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [PATCH] /admin/users/:id
module.exports.updateApi = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

    if(!user || user.status === "deleted") throw new Error("User not found")

    await User.updateOne({ _id: id }, req.body, { new: true })

    res.status(200).json({
      data: true,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [DELETE] /admin/users/:id
module.exports.deleteApi = async (req, res) => {
  try {
    const { id } = req.params
    const { isHard = false } = req.body
    const user = await User.findById(id)

    if(!user || user.status === "deleted") throw new Error("User not found")

    if(isHard) {
      await User.findByIdAndDelete(id)
    }else {
      await User.updateOne({ _id: id }, { status: "deleted" })
    }

    res.status(200).json({
      data: true,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

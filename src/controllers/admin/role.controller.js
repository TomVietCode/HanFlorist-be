const Role = require("../../models/role.model")
const User = require("../../models/user.model")

// [GET] /admin/roles
module.exports.listApi = async (req, res) => {
  try {
    records = await Role.find({status: { $ne: "deleted" }}).lean()

    for (let role of records) {
      const countUser = await User.countDocuments({ roleId: role._id })
      role.totalUser = countUser
    }
    
    res.status(200).json({
      data: records,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [POST] /admin/roles/
module.exports.createApi = async (req, res) => {
  try {
    const record = new Role(req.body)
    await record.save()

    res.status(200).json({
      data: record._id,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [PATCH] /admin/roles/:id
module.exports.updateApi = async (req, res) => {
  const id = req.params.id

  try {
    await Role.updateOne({ _id: id }, req.body)
    res.status(200).json({
      data: true,
    })
  } catch (error) {
    res.status(400).json({
      data: false,
      message: error.message,
    })
  }
}

// [DELETE] /admin/roles/:id
module.exports.deleteApi = async (req, res) => {
  try {
    const id = req.params.id
    const { isHard = false } = req.body
    const role = await Role.findOne({ _id: id })
    if (!role ) throw new Error("Data not found")
    
    if(isHard) {
      await Role.deleteOne({ _id: id })
    } else {
      await Role.findByIdAndUpdate(id, { status: "deleted" })
    }
    res.status(200).json({
      data: true,
    })
  } catch (error) {
    res.status(400).json({
      data: false,
      message: error.message,
    })
  }
}

// [GET] /admin/roles/permissions
module.exports.getPermissionApi = async (req, res) => {
  try {
    const data = await Role.find({ status: { $ne: "deleted" } })

    res.status(200).json({
      data: data,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message,
    })
  }
}

// [PATCH] /admin/roles/permissions
module.exports.updatePermissionApi = async (req, res) => {
  try {
    const datas = req.body
    console.log(datas)
    const updatePromises = datas.map(async (role) => {
      return Role.findByIdAndUpdate(role.id, { permissions: role.permissions }, { new: true });
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      data: true,
    })
  } catch (error) {
    res.status(400).json({
      data: false,
      message: error.message,
    })
  }
}

const Order = require("../../models/order.model")

// [GET] /admin/orders/
module.exports.listAPI = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      search,
      page = 1,
      limit = 10,
      sortKey = "createdAt",
      sortValue = "desc",
    } = req.query
  
    const filter = {}
    if(status) filter.status = status
    if (paymentStatus) filter.paymentStatus = paymentStatus
    if(search) filter.orderCode = new RegExp(search, "i")
  
    const orders = await Order.find(filter).select("-items -paymentDetails -message -shippingInfo")
    .populate("userId", "name")
    .populate("createdBy", "name")
    .populate("updatedBy", "name")
    .sort({ [sortKey]: sortValue === "desc" ? -1 : 1})
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
  
  
    res.status(200).json({
      data: orders,
      paging: { page: page, limit: limit },
      filter,
    })
  } catch (error) {
    res.status(400).json({
      message: error.message
    })
  }
}

// [GET] /admin/orders/:id
module.exports.getAPI = async (req, res) => {
  const { id } = req.params

  try {
    const order = await Order.findById(id)
      .populate("userId", "name")
      .populate("items.productId", "-_id title thumbnail price discountPercentage")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")

    if(!order) throw new Error("Order not found")

    res.status(200).json({
      data: order
    })
  } catch (error) {
    res.status(400).json({
      messsage: error.message
    })
  }
}

// [PATCH] /admin/orders/:id
module.exports.updateAPI = async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  try {
    if(!status || !validStatuses.includes(status)) throw new Error("Invalid status value")
    const adminId = res.locals.user.sub
    const order = await Order.findByIdAndUpdate(
      id,
      { status, updatedBy: adminId },
      { new: true },
      { runValidators: true }
    )
    if(!order) throw new Error("Order not found")

    res.status(200).json({
      data: true
    })
  } catch (error) {
    res.status(400).json({
      message: error.message
    })
  }
}
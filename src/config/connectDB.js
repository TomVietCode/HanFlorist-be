const mongoose = require("mongoose")
module.exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log("Connect to database succeed!")
  } catch (error) {
    console.error(error)
    console.log("Connect to database failed!")
  }
}
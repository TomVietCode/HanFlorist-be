const upload = require("../config/multer-config")

const uploadCloud = (field) => {
  return (req, res, next) => {
    upload.single(field)(req, res, (err) => {
      if (err) {
        console.error("Upload error:", err)
        return res.status(500).json({ message: "Error uploading image", error: err.message })
      }

      if (req.file && req.file.path) {
        req.body[field] = req.file.path
      }
      next()
    })
  }
}

module.exports = uploadCloud

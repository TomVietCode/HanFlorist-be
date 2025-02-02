const upload = require("../config/multer-config")

const uploadCloud = (req, res, next) => {
  upload.single("thumbnail")(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err)
      return res.status(500).json({ message: "Error uploading image", error: err.message })
    }

    if (req.file && req.file.path) {
      req.body.thumbnail = req.file.path
    }
    next()
  })
}

module.exports = uploadCloud

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hanflorist",         
    allowed_formats: ["jpg", "jpeg", "png", "svg"], 
  },
});

const upload = multer({ storage });

module.exports = upload;

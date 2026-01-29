const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isImage = file.mimetype.startsWith("image/");

    return {
      folder: "devgram/channels",
      resource_type: isImage ? "image" : "raw", // 🔥 FIX
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const uploadChannelFile = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = uploadChannelFile;
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME2,
  api_key: process.env.CLOUDINARY_API_KEY2,
  api_secret: process.env.CLOUDINARY_API_SECRET2,
});

module.exports = cloudinary;
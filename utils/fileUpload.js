const cloudinary = require("cloudinary").v2
const {CloudinaryStorage} =  require("multer-storage-cloudinary")


// cloudinary configuration
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_Name,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_KEY_SECRET
})


// cloudinary storage initialization
const fileUploadSetting = new CloudinaryStorage({
    cloudinary: cloudinary,
   allowedFormats:["png", "jpg", "jpeg"],
   params: {
    folder:"SkillGapImages",
    format:"jpg",
    transformation:[{width:500, height: 500, crop:"limit"}]
   }
})


module.exports = fileUploadSetting
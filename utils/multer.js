const multer = require("multer");
const fs = require("fs");

function uploadimage(dest) {

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  return multer.diskStorage({
    destination: function (req,file,cb){
      cb(null, dest) //return cb(null, "./uploads/category")
    },
    filename: function (req, file, cb){
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
}

module.exports = { uploadimage };

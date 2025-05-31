const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wecare",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, and DOC files are allowed.'));
    }
  }
});

const optionalSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, function (err) {
      if (err && err.message === "Unexpected end of form") {
        req.file = null; // allow to proceed without file
        return next();
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  cloudinary,
  upload,
  optionalSingle,
};

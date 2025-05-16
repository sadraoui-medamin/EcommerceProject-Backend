import multer from "multer";

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
      
const upload = multer({
storage,
limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
fileFilter,
}).any(); // Allow any number of files

export default upload;
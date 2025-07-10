// middleware/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = './uploads';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Ensure this export is correct
export const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 }, // The 'name' must match what you send from the frontend/Postman
  { name: 'video', maxCount: 1 },
  { name: 'qrCode', maxCount: 1 },
]);

export default upload; // This export is less critical if you only use uploadFields
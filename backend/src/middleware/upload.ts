import multer from 'multer';
import { AppError } from '../utils/errors';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png']);

const storage = multer.memoryStorage();

export const imageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new AppError('Only JPG and PNG files are allowed.', 400));
      return;
    }
    cb(null, true);
  }
});

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary from env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — we'll pipe the buffer directly to Cloudinary
const storage = multer.memoryStorage();

// Only accept image files, max 5 MB
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});

/**
 * Uploads the file buffer from req.file to Cloudinary.
 * Attaches the secure URL to req.photoUrl on success.
 * Skips silently if no file is attached (photo is optional).
 */
export function uploadToCloudinary(req, res, next) {
  if (!req.file) {
    req.photoUrl = null;
    return next();
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'society-tracker/complaints',
      resource_type: 'image',
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
    },
    (error, result) => {
      if (error) {
        return res.status(500).json({ error: 'Photo upload failed', detail: error.message });
      }
      req.photoUrl = result.secure_url;
      next();
    }
  );

  // Pipe the in-memory buffer into the Cloudinary upload stream
  const readable = new Readable();
  readable.push(req.file.buffer);
  readable.push(null);
  readable.pipe(uploadStream);
}

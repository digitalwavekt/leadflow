const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) return cb(new Error('Video files only'), false);
    cb(null, true);
  },
});

router.post('/video', protect, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video uploaded.' });
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder: 'leadflow/videos' },
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Upload failed.' });
        res.json({ videoUrl: result.secure_url });
      }
    );
    stream.end(req.file.buffer);
  } catch { res.status(500).json({ error: 'Upload error.' }); }
});

module.exports = router;

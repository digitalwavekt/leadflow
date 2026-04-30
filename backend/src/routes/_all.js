// ── routes/payments.js ────────────────────────────────────────────────────────
const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { createOrder, verifyPayment, refundLead, getCreditPacks } = require('../controllers/paymentController');

const paymentRouter = express.Router();
paymentRouter.get('/packs', getCreditPacks);
paymentRouter.post('/create-order', protect, restrictTo('designer'), createOrder);
paymentRouter.post('/verify', protect, restrictTo('designer'), verifyPayment);
paymentRouter.post('/refund', protect, restrictTo('admin'), refundLead);

// ── routes/users.js ───────────────────────────────────────────────────────────
const userRouter = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Lead = require('../models/Lead');

userRouter.get('/credits', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('credits name email');
    res.json({ credits: user.credits, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch credits.' });
  }
});

userRouter.get('/transactions', protect, async (req, res) => {
  try {
    const txns = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('leadId', 'service location');
    res.json({ transactions: txns });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

userRouter.get('/purchased-leads', protect, restrictTo('designer'), async (req, res) => {
  try {
    const leads = await Lead.find({ purchasedBy: req.user._id })
      .sort({ purchasedAt: -1 });
    res.json({ leads });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchased leads.' });
  }
});

userRouter.patch('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'city', 'specializations', 'minBudget', 'preferredLocations', 'bio'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ message: 'Profile updated.', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ── routes/admin.js ───────────────────────────────────────────────────────────
const adminRouter = express.Router();
const { protect: _protect, restrictTo: _restrictTo } = require('../middleware/auth');
const adminCtrl = require('../controllers/adminController');

adminRouter.use(_protect, _restrictTo('admin'));
adminRouter.get('/dashboard', adminCtrl.getDashboard);
adminRouter.get('/leads', adminCtrl.getAllLeads);
adminRouter.patch('/leads/:id/verify', adminCtrl.verifyLead);
adminRouter.patch('/leads/:id/reject', adminCtrl.rejectLead);
adminRouter.get('/users', adminCtrl.getUsers);
adminRouter.patch('/users/:id/toggle-active', adminCtrl.toggleUserActive);

// ── routes/upload.js ──────────────────────────────────────────────────────────
const uploadRouter = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect: authProtect } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed'), false);
    }
    cb(null, true);
  },
});

uploadRouter.post('/video', authProtect, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file uploaded.' });

    // Upload to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'video', folder: 'leadflow/videos', quality: 'auto' },
      (error, result) => {
        if (error) return res.status(500).json({ error: 'Upload failed.' });
        res.json({ videoUrl: result.secure_url, publicId: result.public_id });
      }
    );

    stream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: 'Upload error.' });
  }
});

module.exports = { paymentRouter, userRouter, adminRouter, uploadRouter };

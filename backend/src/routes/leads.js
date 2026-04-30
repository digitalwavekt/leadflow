const express = require('express');
const { body } = require('express-validator');
const {
  createLead, getLeads, lockLead, unlockLead, purchaseLead, getLeadById,
} = require('../controllers/leadController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public — verified leads feed (designers must be logged in)
router.get('/', protect, restrictTo('designer', 'admin'), getLeads);

// Client submits a lead
router.post(
  '/create',
  protect,
  restrictTo('client', 'admin'),
  [
    body('service').notEmpty().withMessage('Service type required'),
    body('budget').isNumeric().withMessage('Budget must be a number'),
    body('location').trim().notEmpty().withMessage('Location required'),
    body('description').isLength({ min: 20 }).withMessage('Description too short (min 20 chars)'),
  ],
  createLead
);

// Designer locks a lead
router.post('/lock', protect, restrictTo('designer'), lockLead);

// Designer unlocks a lead
router.post('/unlock', protect, restrictTo('designer', 'admin'), unlockLead);

// Designer purchases a lead
router.post('/purchase', protect, restrictTo('designer'), purchaseLead);

// Get single lead (full details only if purchased)
router.get('/:id', protect, getLeadById);

module.exports = router;

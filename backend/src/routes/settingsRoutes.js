const express = require('express');
const {
    getSettings,
    updateSettings,
} = require('../controllers/settingsController');

const authMiddleware = require('../middleware/auth');

const router = express.Router();

const protect =
    authMiddleware.protect ||
    authMiddleware.auth ||
    authMiddleware.authenticate ||
    authMiddleware.default ||
    authMiddleware;

const adminOnly =
    authMiddleware.adminOnly ||
    authMiddleware.requireAdmin ||
    authMiddleware.isAdmin ||
    authMiddleware.admin;

if (!protect) {
    throw new Error('Auth middleware not found in middleware/auth.js');
}

if (!adminOnly) {
    console.warn('Admin middleware not found. Settings route will use auth only.');
}

router.get('/', protect, adminOnly || ((req, res, next) => next()), getSettings);

router.patch(
    '/',
    protect,
    adminOnly || ((req, res, next) => next()),
    updateSettings
);

module.exports = router;
const express = require('express');
const router = express.Router();

const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// =========================
// PUBLIC AUTH ROUTES
// =========================

// Create account
router.post('/register', auth.register);

// Login
router.post('/login', auth.login);

// =========================
// AUTHENTICATED ROUTES
// =========================

// Logout
router.post('/logout', authenticate, auth.logout);

// Current logged-in user
router.get('/me', authenticate, auth.me);

module.exports = router;
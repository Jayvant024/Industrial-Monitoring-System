const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.get('/me', authenticate, auth.me);

module.exports = router;

const express = require('express');
const router = express.Router();
const { generateInterview } = require('../controllers/interviewController');
const { authenticate } = require('../middleware/auth');

// aiLimiter is applied at server.js level for this route
router.post('/generate', authenticate, generateInterview);

module.exports = router;

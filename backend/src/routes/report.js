const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getReport, generateReport, getAllReports } = require('../controllers/reportController');

const router = express.Router();

router.use(authenticate);

router.post('/generate', generateReport);
router.get('/all', getAllReports);
router.get('/:id', getReport);

module.exports = router;

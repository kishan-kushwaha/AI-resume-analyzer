const express = require('express');
const { authenticate } = require('../middleware/auth');
const { analyseResumeById, getAnalysis } = require('../controllers/analysisController');

const router = express.Router();

router.use(authenticate);

router.post('/resume/:resumeId', analyseResumeById);
router.get('/:analysisId', getAnalysis);

module.exports = router;

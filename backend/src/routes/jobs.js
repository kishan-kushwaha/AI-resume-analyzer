const express = require('express');
const { authenticate } = require('../middleware/auth');
const { matchJob, getAllMatches, getMatch } = require('../controllers/jobController');

const router = express.Router();

router.use(authenticate);

router.post('/match', matchJob);
router.get('/matches', getAllMatches);
router.get('/match/:matchId', getMatch);

module.exports = router;

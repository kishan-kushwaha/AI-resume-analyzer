const express = require('express');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadResume, getAllResumes, getResume, deleteResume, serveResumeFile } = require('../controllers/resumeController');

const router = express.Router();

router.use(authenticate);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/all', getAllResumes);
router.get('/file/:id', serveResumeFile);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);

module.exports = router;

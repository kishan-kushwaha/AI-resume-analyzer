const path = require('path');
const fs = require('fs');
const { query } = require('../db/neon');
const { extractTextFromFile } = require('../services/pdfService');

// POST /api/resume/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;

    // Extract text
    let rawText;
    try {
      rawText = await extractTextFromFile(filePath, mimetype);
    } catch (extractError) {
      // Clean up file on error
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(422).json({ error: extractError.message });
    }

    if (!rawText || rawText.length < 50) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(422).json({ error: 'Could not extract text from file. Please ensure it is not a scanned image PDF.' });
    }

    // Save to DB
    const fileUrl = `/uploads/${filename}`;
    const result = await query(
      `INSERT INTO resumes (user_id, filename, original_name, file_url, raw_text, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, original_name, file_url, file_size, created_at`,
      [req.user.id, filename, originalname, fileUrl, rawText, size, mimetype]
    );

    const resume = result.rows[0];

    res.status(201).json({
      message: 'Resume uploaded and parsed successfully!',
      resume: {
        ...resume,
        textLength: rawText.length,
        preview: rawText.substring(0, 200) + '...',
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
};

// GET /api/resume/all
const getAllResumes = async (req, res) => {
  try {
    const result = await query(
      `SELECT r.id, r.original_name, r.file_url, r.file_size, r.created_at,
              ra.ats_score, ra.resume_score, ra.id as analysis_id
       FROM resumes r
       LEFT JOIN resume_analysis ra ON ra.resume_id = r.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({ resumes: result.rows });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Failed to fetch resumes.' });
  }
};

// GET /api/resume/:id
const getResume = async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, ra.ats_score, ra.resume_score, ra.matched_skills, ra.missing_skills,
              ra.suggestions, ra.improved_bullets, ra.overall_feedback, ra.id as analysis_id
       FROM resumes r
       LEFT JOIN resume_analysis ra ON ra.resume_id = r.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    res.json({ resume: result.rows[0] });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to fetch resume.' });
  }
};

// DELETE /api/resume/:id
const deleteResume = async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM resumes WHERE id = $1 AND user_id = $2 RETURNING filename',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../../uploads', result.rows[0].filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Resume deleted successfully.' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume.' });
  }
};

// GET /api/resume/file/:id — serve actual file for preview
const serveResumeFile = async (req, res) => {
  try {
    const result = await query(
      'SELECT filename, original_name, mime_type FROM resumes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Resume not found.' });

    const { filename, original_name, mime_type } = result.rows[0];
    const filePath = path.join(__dirname, '../../uploads', filename);

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk.' });

    res.setHeader('Content-Type', mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${original_name}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ error: 'Failed to serve file.' });
  }
};

module.exports = { uploadResume, getAllResumes, getResume, deleteResume, serveResumeFile };

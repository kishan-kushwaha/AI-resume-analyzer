const { query } = require('../db/neon');
const { analyseResume } = require('../services/aiService');

// POST /api/analysis/resume/:resumeId
const analyseResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Get resume (ensure ownership)
    const resumeResult = await query(
      'SELECT id, raw_text, original_name FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, req.user.id]
    );

    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    const resume = resumeResult.rows[0];

    // Check if analysis already exists
    const existingAnalysis = await query(
      'SELECT * FROM resume_analysis WHERE resume_id = $1 ORDER BY created_at DESC LIMIT 1',
      [resumeId]
    );

    // If recent analysis exists (< 1 hour), return it
    if (existingAnalysis.rows.length > 0) {
      const analysisAge = Date.now() - new Date(existingAnalysis.rows[0].created_at).getTime();
      if (analysisAge < 60 * 60 * 1000) {
        return res.json({
          message: 'Analysis retrieved from cache.',
          analysis: existingAnalysis.rows[0],
          cached: true,
        });
      }
    }

    // Run AI analysis
    const aiResult = await analyseResume(resume.raw_text);

    // Save to DB
    const result = await query(
      `INSERT INTO resume_analysis 
       (resume_id, ats_score, resume_score, matched_skills, missing_skills, suggestions, improved_bullets, strengths, weaknesses, overall_feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        resumeId,
        aiResult.atsScore || 0,
        aiResult.resumeScore || 0,
        aiResult.matchedSkills || [],
        aiResult.missingSkills || [],
        aiResult.suggestions || [],
        JSON.stringify(aiResult.improvedBullets || []),
        aiResult.strengths || [],
        aiResult.weaknesses || [],
        aiResult.overallFeedback || '',
      ]
    );

    res.json({
      message: 'Resume analysed successfully!',
      analysis: result.rows[0],
      cached: false,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed.' });
  }
};

// GET /api/analysis/:analysisId
const getAnalysis = async (req, res) => {
  try {
    const result = await query(
      `SELECT ra.*, r.original_name, r.file_url
       FROM resume_analysis ra
       JOIN resumes r ON r.id = ra.resume_id
       WHERE ra.id = $1 AND r.user_id = $2`,
      [req.params.analysisId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analysis not found.' });
    }

    res.json({ analysis: result.rows[0] });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis.' });
  }
};

module.exports = { analyseResumeById, getAnalysis };

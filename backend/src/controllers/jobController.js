const { query } = require('../db/neon');
const { matchResumeWithJD } = require('../services/aiService');

// POST /api/jobs/match
const matchJob = async (req, res) => {
  try {
    const { resumeId, jobDescription, jobTitle, company } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ error: 'Resume ID and job description are required.' });
    }

    if (jobDescription.trim().length < 50) {
      return res.status(400).json({ error: 'Job description is too short. Please paste the full JD.' });
    }

    // Get resume (ensure ownership)
    const resumeResult = await query(
      'SELECT id, raw_text, original_name FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, req.user.id]
    );

    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    const resume = resumeResult.rows[0];

    // Save JD first
    const jdResult = await query(
      'INSERT INTO job_descriptions (user_id, title, company, raw_jd_text) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.user.id, jobTitle || 'Not specified', company || 'Not specified', jobDescription]
    );

    const jdId = jdResult.rows[0].id;

    // Run AI matching
    const aiResult = await matchResumeWithJD(resume.raw_text, jobDescription, jobTitle, company);

    // Save match result
    const matchResult = await query(
      `INSERT INTO job_matches 
       (resume_id, jd_id, user_id, match_percentage, matched_keywords, missing_keywords, cover_letter, match_summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        resumeId,
        jdId,
        req.user.id,
        aiResult.matchPercentage || 0,
        aiResult.matchedKeywords || [],
        aiResult.missingKeywords || [],
        aiResult.coverLetter || '',
        aiResult.matchSummary || '',
      ]
    );

    res.json({
      message: 'Job match analysis complete!',
      match: {
        ...matchResult.rows[0],
        tailoringTips: aiResult.tailoringTips || [],
        strengthsForRole: aiResult.strengthsForRole || [],
        gapsForRole: aiResult.gapsForRole || [],
        jobTitle: jobTitle || 'Not specified',
        company: company || 'Not specified',
        resumeName: resume.original_name,
      },
    });
  } catch (error) {
    console.error('Job match error:', error);
    res.status(500).json({ error: error.message || 'Job matching failed.' });
  }
};

// GET /api/jobs/matches
const getAllMatches = async (req, res) => {
  try {
    const result = await query(
      `SELECT jm.id, jm.match_percentage, jm.created_at,
              jd.title as job_title, jd.company,
              r.original_name as resume_name
       FROM job_matches jm
       JOIN job_descriptions jd ON jd.id = jm.jd_id
       JOIN resumes r ON r.id = jm.resume_id
       WHERE jm.user_id = $1
       ORDER BY jm.created_at DESC`,
      [req.user.id]
    );

    res.json({ matches: result.rows });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to fetch matches.' });
  }
};

// GET /api/jobs/match/:matchId
const getMatch = async (req, res) => {
  try {
    const result = await query(
      `SELECT jm.*, jd.title as job_title, jd.company, jd.raw_jd_text,
              r.original_name as resume_name
       FROM job_matches jm
       JOIN job_descriptions jd ON jd.id = jm.jd_id
       JOIN resumes r ON r.id = jm.resume_id
       WHERE jm.id = $1 AND jm.user_id = $2`,
      [req.params.matchId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Match not found.' });
    }

    res.json({ match: result.rows[0] });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ error: 'Failed to fetch match.' });
  }
};

module.exports = { matchJob, getAllMatches, getMatch };

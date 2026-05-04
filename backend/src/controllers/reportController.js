const { query } = require('../db/neon');

// GET /api/report/:id
const getReport = async (req, res) => {
  try {
    const result = await query(
      `SELECT rep.*, 
              r.original_name as resume_name, r.file_url,
              ra.ats_score, ra.resume_score, ra.matched_skills, ra.missing_skills,
              ra.suggestions, ra.improved_bullets, ra.overall_feedback,
              jm.match_percentage, jm.matched_keywords, jm.missing_keywords,
              jm.cover_letter, jm.match_summary,
              jd.title as job_title, jd.company
       FROM reports rep
       JOIN resumes r ON r.id = rep.resume_id
       LEFT JOIN resume_analysis ra ON ra.id = rep.analysis_id
       LEFT JOIN job_matches jm ON jm.id = rep.match_id
       LEFT JOIN job_descriptions jd ON jd.id = jm.jd_id
       WHERE rep.id = $1 AND rep.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    res.json({ report: result.rows[0] });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report.' });
  }
};

// POST /api/report/generate
const generateReport = async (req, res) => {
  try {
    const { resumeId, matchId, analysisId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ error: 'Resume ID is required.' });
    }

    // Verify resume ownership
    const resumeCheck = await query(
      'SELECT id FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, req.user.id]
    );

    if (resumeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found.' });
    }

    // Get full report data
    const reportData = {};

    if (analysisId) {
      const analysisResult = await query('SELECT * FROM resume_analysis WHERE id = $1', [analysisId]);
      if (analysisResult.rows.length > 0) {
        reportData.analysis = analysisResult.rows[0];
      }
    }

    if (matchId) {
      const matchResult = await query(
        `SELECT jm.*, jd.title as job_title, jd.company 
         FROM job_matches jm 
         JOIN job_descriptions jd ON jd.id = jm.jd_id 
         WHERE jm.id = $1`,
        [matchId]
      );
      if (matchResult.rows.length > 0) {
        reportData.match = matchResult.rows[0];
      }
    }

    // Save report
    const result = await query(
      `INSERT INTO reports (user_id, resume_id, match_id, analysis_id, report_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [req.user.id, resumeId, matchId || null, analysisId || null, JSON.stringify(reportData)]
    );

    res.status(201).json({
      message: 'Report generated successfully!',
      reportId: result.rows[0].id,
      createdAt: result.rows[0].created_at,
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report.' });
  }
};

// GET /api/report/all
const getAllReports = async (req, res) => {
  try {
    const result = await query(
      `SELECT rep.id, rep.created_at,
              r.original_name as resume_name,
              jd.title as job_title, jd.company,
              ra.ats_score, ra.resume_score,
              jm.match_percentage
       FROM reports rep
       JOIN resumes r ON r.id = rep.resume_id
       LEFT JOIN job_matches jm ON jm.id = rep.match_id
       LEFT JOIN job_descriptions jd ON jd.id = jm.jd_id
       LEFT JOIN resume_analysis ra ON ra.id = rep.analysis_id
       WHERE rep.user_id = $1
       ORDER BY rep.created_at DESC`,
      [req.user.id]
    );

    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
};

module.exports = { getReport, generateReport, getAllReports };

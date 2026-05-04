const { query } = require('../db/neon');
const { generateInterviewQA } = require('../services/aiService');

const generateInterview = async (req, res) => {
  const userId = req.user.id;
  const { resumeId, jobDescription = '', jobTitle = '' } = req.body;

  if (!resumeId) return res.status(400).json({ error: 'resumeId is required' });

  try {
    const resumeResult = await query(
      'SELECT id, raw_text, original_name FROM resumes WHERE id = $1 AND user_id = $2',
      [resumeId, userId]
    );
    if (resumeResult.rows.length === 0)
      return res.status(404).json({ error: 'Resume not found' });

    const resume = resumeResult.rows[0];
    const qaData = await generateInterviewQA(resume.raw_text, jobDescription, jobTitle);

    res.json({
      success: true,
      resumeName: resume.original_name,
      jobTitle: jobTitle || 'General',
      questions: qaData.questions,
    });
  } catch (error) {
    console.error('Interview generation error:', error);
    res.status(500).json({ error: error.message || 'Interview generation failed.' });
  }
};

module.exports = { generateInterview };

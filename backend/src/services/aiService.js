const axios = require('axios');

// Groq API — 100% Free, No Credit Card, Ultra Fast
// Free tier: 14,400 requests/day, Llama 3.1 70B model
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant'; // Fast + Free

const callGroq = async (prompt) => {
  const response = await axios.post(
    GROQ_URL,
    {
      model: GROQ_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert ATS system and professional resume reviewer. Always respond with valid JSON only, no markdown, no explanation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 4096,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );
  return response.data.choices[0].message.content;
};

/**
 * Analyse resume only (no JD)
 */
const analyseResume = async (resumeText) => {
  const prompt = `Analyse the following resume and return a detailed JSON analysis.

RESUME:
"""
${resumeText.substring(0, 8000)}
"""

Return ONLY valid JSON with this exact structure (no markdown, no text before or after):
{
  "atsScore": <integer 0-100, ATS compatibility>,
  "resumeScore": <integer 0-100, overall quality>,
  "matchedSkills": ["skill1", "skill2", "skill3"],
  "missingSkills": ["skill1", "skill2", "skill3"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
  "improvedBullets": [
    { "original": "original bullet text from resume", "improved": "rewritten with strong action verb, metrics, impact" },
    { "original": "second original bullet", "improved": "second improved bullet" },
    { "original": "third original bullet", "improved": "third improved bullet" }
  ],
  "overallFeedback": "2-3 sentence overall assessment of the resume"
}`;

  try {
    const text = await callGroq(prompt);
    return parseJsonResponse(text);
  } catch (error) {
    console.error('Groq analyse error:', error?.response?.data || error?.message);
    const msg = error?.response?.data?.error?.message || error?.message || 'Unknown error';
    throw new Error(`AI analysis failed: ${msg}`);
  }
};

/**
 * Match resume against job description
 */
const matchResumeWithJD = async (resumeText, jobDescription, jobTitle = '', company = '') => {
  const prompt = `Analyse how well this resume matches the job description.

JOB TITLE: ${jobTitle || 'Not specified'}
COMPANY: ${company || 'Not specified'}

JOB DESCRIPTION:
"""
${jobDescription.substring(0, 3000)}
"""

RESUME:
"""
${resumeText.substring(0, 3000)}
"""

Return ONLY valid JSON (no markdown, no text before or after):
{
  "matchPercentage": <integer 0-100>,
  "matchedKeywords": ["keyword1", "keyword2", "keyword3"],
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "matchSummary": "2-3 sentence summary of how well the resume matches",
  "coverLetter": "Professional 3-paragraph cover letter for this specific role. Start directly with 'Dear Hiring Manager,' and use [Your Name] and [Date] placeholders.",
  "tailoringTips": ["tip1", "tip2", "tip3", "tip4"],
  "strengthsForRole": ["strength1", "strength2", "strength3"],
  "gapsForRole": ["gap1", "gap2"]
}`;

  try {
    const text = await callGroq(prompt);
    return parseJsonResponse(text);
  } catch (error) {
    console.error('Groq match error:', error?.response?.data || error?.message);
    const msg = error?.response?.data?.error?.message || error?.message || 'Unknown error';
    throw new Error(`AI job matching failed: ${msg}`);
  }
};

/**
 * Parse and clean JSON from AI response
 */
const parseJsonResponse = (text) => {
  try {
    let cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('JSON parse error. Raw response:', text.substring(0, 300));
    throw new Error('Failed to parse AI response. Please try again.');
  }
};

/**
 * Generate interview Q&A based on resume + optional JD
 */
const generateInterviewQA = async (resumeText, jobDescription = '', jobTitle = '') => {
  const prompt = `You are an expert technical interviewer. Based on the resume and job description below, generate 70 highly relevant interview questions with ideal answers.

JOB TITLE: ${jobTitle || 'General'}

${jobDescription ? `JOB DESCRIPTION:\n"""\n${jobDescription.substring(0, 2000)}\n"""` : ''}

RESUME:
"""
${resumeText.substring(0, 4000)}
"""

Return ONLY valid JSON (no markdown, no text outside JSON):
{
  "questions": [
    {
      "id": 1,
      "category": "Technical|Behavioral|Situational|HR",
      "difficulty": "Easy|Medium|Hard",
      "question": "question text here",
      "idealAnswer": "concise answer here (1-2 sentences max)",
      "tip": "short tip"
    }
  ]
}

Include a mix: 30 Technical, 20 Behavioral, 10 Situational, 10 HR questions.`;

  try {
    const text = await callGroq(prompt);
    return parseJsonResponse(text);
  } catch (error) {
    console.error('Groq interview error:', error?.response?.data || error?.message);
    const msg = error?.response?.data?.error?.message || error?.message || 'Unknown error';
    throw new Error(`Interview generation failed: ${msg}`);
  }
};

module.exports = { analyseResume, matchResumeWithJD, generateInterviewQA };

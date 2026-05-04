require('dotenv').config();
const axios = require('axios');

async function listModels() {
  try {
    const res = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );
    console.log('\n✅ Available models with your API key:\n');
    res.data.models.forEach(m => {
      console.log(`  → ${m.name}  (${m.supportedGenerationMethods?.join(', ')})`);
    });
  } catch (err) {
    console.error('❌ Error:', err?.response?.data || err.message);
  }
}

listModels();

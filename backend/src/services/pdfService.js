const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

/**
 * Extract text from uploaded PDF or DOCX file
 */
const extractTextFromFile = async (filePath, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return cleanText(data.text);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return cleanText(result.value);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
};

/**
 * Clean extracted text - remove extra whitespace, special chars
 */
const cleanText = (text) => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .trim();
};

module.exports = { extractTextFromFile };

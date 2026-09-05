import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenAI, Type } from '@google/genai';
import config from '../config/index.js';

let aiClient = null;
if (config.GOOGLE_GENAI_API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: config.GOOGLE_GENAI_API_KEY });
}

/**
 * Extracts text from PDF or DOCX buffers.
 * @param {Buffer} buffer - The raw file buffer
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<string>} The extracted text
 */
export const extractText = async (buffer, mimeType) => {
  if (mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text || '';
  }
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }
  return '';
};

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    contact: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
      },
    },
    derivedTargetTitle: { type: Type.STRING },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          company: { type: Type.STRING },
          employmentType: { type: Type.STRING },
          startDate: { type: Type.STRING, description: "ISO 8601 Date string (e.g., 2020-01-01) or null" },
          endDate: { type: Type.STRING, description: "ISO 8601 Date string or null" },
          description: { type: Type.STRING },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          startDate: { type: Type.STRING, description: "ISO 8601 Date string or null" },
          endDate: { type: Type.STRING, description: "ISO 8601 Date string or null" },
        },
      },
    },
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
};

/**
 * Uses Gemini 2.5 Flash to parse resume text or raw PDF buffer into structured JSON.
 * @param {string} extractedText - The text extracted locally.
 * @param {Buffer} buffer - The raw file buffer (used if text is insufficient).
 * @param {string} mimeType - The MIME type of the file.
 * @returns {Promise<Object>} The parsed JSON object.
 */
export const parseResumeToJSON = async (extractedText, buffer, mimeType) => {
  if (!aiClient) {
    throw new Error('Google GenAI client is not initialized.');
  }

  const instructions = `
You are a highly accurate resume parsing AI.
Extract all relevant information and format it strictly matching the provided JSON schema.
- derivedTargetTitle: Determine ONE concise, canonical job title based ONLY on the candidate's most recent relevant role and their strongest listed skills. Use "Entry-Level Professional" ONLY if neither exists.
- For dates, use standard ISO 8601 format (YYYY-MM-DD). If a day or month is missing, estimate (e.g. 2023-01-01). If "Present", omit endDate.
- Omit keys or leave as empty arrays/null if information is not found.
  `;

  let parts = [];

  // Fallback Logic: If extracted text is very small (likely an image-based scanned PDF),
  // we pass the raw PDF inline to Gemini to use its native OCR.
  if (extractedText.length < 50 && mimeType === 'application/pdf') {
    parts.push({
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: 'application/pdf',
      },
    });
    parts.push({ text: instructions });
  } else {
    parts.push({
      text: `${instructions}\n\nResume Text:\n${extractedText}`,
    });
  }

  const response = await aiClient.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [{ role: 'user', parts }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: RESUME_SCHEMA,
    },
  });

  if (!response.text) {
    throw new Error('No text generated from Gemini.');
  }

  try {
    return JSON.parse(response.text);
  } catch (err) {
    throw new Error('Failed to parse Gemini output as JSON.');
  }
};

export default {
  extractText,
  parseResumeToJSON,
};

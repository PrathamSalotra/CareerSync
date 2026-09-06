import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import config from '../config/index.js';
import { AppError } from '../utils/errors.js';

let aiClient = null;
if (config.GOOGLE_GENAI_API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: config.GOOGLE_GENAI_API_KEY });
}

let pineconeClient = null;
let pineconeIndex = null;
if (config.PINECONE_API_KEY) {
  pineconeClient = new Pinecone({ apiKey: config.PINECONE_API_KEY });
  pineconeIndex = pineconeClient.index(config.PINECONE_INDEX || 'careersync-v1');
}

/**
 * Embeds a single piece of text using Google GenAI.
 */
const embedText = async (text) => {
  if (!aiClient) throw new AppError(500, 'SERVER_ERROR', 'Google GenAI is not configured');
  
  try {
    const response = await aiClient.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: { outputDimensionality: 768 }
    });
    return response.embeddings[0].values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new AppError(503, 'AI_ANALYSIS_UNAVAILABLE', `Failed to generate embeddings: ${error.message}`);
  }
};

/**
 * Embeds the query and multiple jobs in parallel.
 * Rate limiting may apply depending on GenAI tier, but for up to 50 jobs it is usually fine.
 */
const embedBatch = async (texts) => {
  if (!aiClient) throw new AppError(500, 'SERVER_ERROR', 'Google GenAI is not configured');
  
  try {
    // Truncate to avoid payload size limits while maintaining high semantic value
    const safeTexts = texts.map(t => t.substring(0, 1500));
    
    // The GoogleGenAI SDK supports batch embedding natively and completes in ~2s
    const response = await aiClient.models.embedContent({
      model: 'gemini-embedding-001',
      contents: safeTexts,
      config: { outputDimensionality: 768 }
    });
    
    return response.embeddings.map(e => e.values);
  } catch (error) {
    console.error('Error generating batch embeddings:', error);
    throw new AppError(503, 'AI_ANALYSIS_UNAVAILABLE', `Batch embed failed: ${error.message}`);
  }
};

/**
 * Calculates cosine similarity locally between two vectors (for title comparison)
 */
export const calculateCosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Ranks jobs against a resume using Pinecone.
 *
 * @param {Object} resumeParsed - The parsed JSON of the resume
 * @param {string} query - The search query provided by the user (or derived)
 * @param {Array} jobs - Normalized jobs from Adzuna
 * @param {string} searchId - The reservation ID, used for the Pinecone namespace
 * @returns {Promise<Array>} Ranked and filtered jobs
 */
export const rankJobs = async (resumeParsed, query, jobs, searchId) => {
  if (!pineconeIndex) throw new AppError(500, 'SERVER_ERROR', 'Pinecone is not configured');
  if (!jobs || jobs.length === 0) return [];

  const namespaceId = `search_${searchId}`;
  
  // 1. Prepare texts for embedding
  const resumeText = JSON.stringify(resumeParsed);
  
  // Embed query separately so we can compute titleCosine later locally
  const queryText = query || resumeParsed.derivedTargetTitle || 'Job Search';
  
  // Build job texts (title + description + location)
  const jobTexts = jobs.map(j => `${j.title} | ${j.company} | ${j.location}\n${j.description}`);

  try {
    // 2. Generate embeddings
    // We do this in 3 calls: resume, query, and jobs batch
    const resumeEmbedding = await embedText(resumeText);
    const queryEmbedding = await embedText(queryText);
    const jobEmbeddings = await embedBatch(jobTexts);
    const jobTitleEmbeddings = await embedBatch(jobs.map(j => j.title));

    // 3. Upsert Jobs to Pinecone
    const vectorsToUpsert = jobs.map((job, index) => ({
      id: job.jobId,
      values: jobEmbeddings[index],
    }));

    await pineconeIndex.namespace(namespaceId).upsert(vectorsToUpsert);

    // 4. Query Pinecone with Resume Embedding
    // Give Pinecone a tiny delay to ensure consistency (eventual consistency model)
    await new Promise(resolve => setTimeout(resolve, 500));

    const queryResponse = await pineconeIndex.namespace(namespaceId).query({
      vector: resumeEmbedding,
      topK: 10,
      includeValues: false,
    });

    // 5. Map scores back to Job objects, applying >= 0.55 threshold
    const rankedJobs = [];
    const threshold = 0.55;

    for (const match of queryResponse.matches) {
      if (match.score >= threshold) {
        const originalJobIndex = jobs.findIndex(j => j.jobId === match.id);
        if (originalJobIndex !== -1) {
          const originalJob = jobs[originalJobIndex];
          
          // Calculate title cosine similarity locally using the embedded query and job title
          const titleCosine = calculateCosineSimilarity(queryEmbedding, jobTitleEmbeddings[originalJobIndex]);
          
          rankedJobs.push({
            ...originalJob,
            resumeCosine: match.score,
            titleCosine: titleCosine,
          });
        }
      }
    }

    // They are already sorted by Pinecone descending, but just in case:
    rankedJobs.sort((a, b) => b.resumeCosine - a.resumeCosine);

    return rankedJobs;

  } finally {
    // CRITICAL: Always delete the temporary namespace
    try {
      await pineconeIndex.namespace(namespaceId).deleteAll();
    } catch (cleanupError) {
      console.error(`Failed to delete Pinecone namespace ${namespaceId}:`, cleanupError);
      // We log but do not throw, as we don't want to fail the request if cleanup fails
    }
  }
};

export default {
  embedText,
  embedBatch,
  rankJobs,
  calculateCosineSimilarity
};

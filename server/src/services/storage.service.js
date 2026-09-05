import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config/index.js';

let s3Client = null;

if (config.R2_ACCOUNT_ID && config.R2_ACCESS_KEY_ID && config.R2_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: config.R2_ENDPOINT,
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Uploads a resume file buffer to Cloudflare R2
 * @param {string} userId - The ID of the user uploading the file
 * @param {string} resumeId - The generated MongoDB ObjectId for the resume
 * @param {string} filename - The sanitized original filename
 * @param {Buffer} buffer - The raw file buffer from multer
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<string>} The object key under which the file was stored
 */
export const uploadResumeToR2 = async (userId, resumeId, filename, buffer, mimeType) => {
  const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const objectKey = `resumes/${userId}/${resumeId}/${safeFilename}`;

  if (!s3Client) {
    console.warn(`[Mock Storage] Would upload to R2 key: ${objectKey}`);
    return objectKey;
  }

  const command = new PutObjectCommand({
    Bucket: config.R2_BUCKET,
    Key: objectKey,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);
  return objectKey;
};

/**
 * Gets a presigned URL to download a resume file
 * @param {string} objectKey - The R2 object key
 * @returns {Promise<string>} A presigned URL valid for 15 minutes
 */
export const getResumeDownloadUrl = async (objectKey) => {
  if (!s3Client) {
    return `https://mock-storage.local/${objectKey}`;
  }

  const command = new GetObjectCommand({
    Bucket: config.R2_BUCKET,
    Key: objectKey,
  });

  // URL valid for 15 minutes
  return getSignedUrl(s3Client, command, { expiresIn: 900 });
};

/**
 * Deletes a resume file from Cloudflare R2
 * @param {string} objectKey - The R2 object key to delete
 * @returns {Promise<void>}
 */
export const deleteResumeFromR2 = async (objectKey) => {
  if (!s3Client) {
    console.warn(`[Mock Storage] Would delete from R2 key: ${objectKey}`);
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: config.R2_BUCKET,
    Key: objectKey,
  });

  await s3Client.send(command);
};

export default {
  uploadResumeToR2,
  getResumeDownloadUrl,
  deleteResumeFromR2,
};

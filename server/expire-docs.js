import mongoose from 'mongoose';
import config from './src/config/index.js';
import { Resume, SearchHistory } from './src/models/index.js';

async function expireAll() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Set all resumes to expire yesterday
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const resumeUpdate = await Resume.updateMany({}, { $set: { expiresAt: yesterday } });
    console.log(`Updated ${resumeUpdate.modifiedCount} resumes to be expired.`);

    const historyUpdate = await SearchHistory.updateMany({}, { $set: { expiresAt: yesterday } });
    console.log(`Updated ${historyUpdate.modifiedCount} search histories to be expired.`);

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

expireAll();

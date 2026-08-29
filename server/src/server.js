import mongoose from 'mongoose';
import config from './config/index.js';
import app from './app.js';

const PORT = config.PORT || 5000;

async function startServer() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB Atlas.');

    app.listen(PORT, () => {
      console.log(`CareerSync Express server running on port ${PORT} [${config.NODE_ENV}]`);
    });
  } catch (err) {
    console.error('Fatal: Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

startServer();

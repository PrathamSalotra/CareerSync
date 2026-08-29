import config from './config/index.js';
import app from './app.js';

const PORT = config.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CareerSync Express server running on port ${PORT} [${config.NODE_ENV}]`);
});

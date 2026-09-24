import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { User, Resume, SearchHistory, SearchReservation } from '../models/index.js';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const TEST_EMAIL = 'phase15test@example.com';
const TEST_PASSWORD = 'Password123!';

const makeCookieString = (cookies) => {
  return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
};

const parseCookies = (response) => {
  const raw = response.headers.raw()['set-cookie'] || [];
  const parsed = {};
  raw.forEach(cookieStr => {
    const parts = cookieStr.split(';');
    const [nameVal] = parts;
    const [name, ...valParts] = nameVal.split('=');
    parsed[name.trim()] = valParts.join('=');
  });
  return parsed;
};

const runTests = async () => {
  console.log('--- STARTING PHASE 15 SEARCH HISTORY TESTS ---');
  
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  console.log('\n==================================================');
  console.log('1. PREPARE TEST USER');
  console.log('==================================================');

  // Cleanup past test data
  const existingUser = await User.findOne({ email: TEST_EMAIL });
  if (existingUser) {
    await SearchReservation.deleteMany({ userId: existingUser._id });
    await SearchHistory.deleteMany({ userId: existingUser._id });
    await Resume.deleteMany({ userId: existingUser._id });
    await User.deleteMany({ email: TEST_EMAIL });
  }

  // Create base user
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Phase 15 Test', email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  
  const userCookies = parseCookies(signupRes);
  const cookieHeader = makeCookieString(userCookies);
  const csrfToken = userCookies['cs_csrf'];
  
  const authHeaders = {
    'Cookie': cookieHeader,
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  };

  console.log('\n==================================================');
  console.log('2. JOB-ONLY SEARCH PERSISTENCE');
  console.log('==================================================');

  const jobSearchRes = await fetch(`${BASE_URL}/api/search`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ query: 'Software Engineer', country: 'us', workArrangement: 'remote' })
  });

  if (jobSearchRes.status !== 200) {
    const text = await jobSearchRes.text();
    console.error(`FAILED: Expected 200. Got ${jobSearchRes.status}`, text);
    process.exit(1);
  }

  const userRecord = await User.findOne({ email: TEST_EMAIL });
  let history = await SearchHistory.find({ userId: userRecord._id }).sort({ searchedAt: -1 }).lean();
  
  if (history.length !== 1) {
    console.error(`FAILED: Expected 1 history record, found ${history.length}`);
    process.exit(1);
  }

  if (history[0].searchMode !== 'job-only' || history[0].query !== 'Software Engineer' || !Array.isArray(history[0].results)) {
    console.error('FAILED: Invalid job-only history record content', history[0]);
    process.exit(1);
  }
  
  console.log('✅ Job-only search persisted successfully.');

  console.log('\n==================================================');
  console.log('3. GET /api/search/history');
  console.log('==================================================');

  const historyListRes = await fetch(`${BASE_URL}/api/search/history`, {
    headers: { 'Cookie': cookieHeader }
  });

  const historyListJson = await historyListRes.json();
  if (!Array.isArray(historyListJson) || historyListJson.length !== 1) {
    console.error('FAILED: /api/search/history returned invalid response', historyListJson);
    process.exit(1);
  }

  // Check projection (should not have results)
  if (historyListJson[0].results) {
    console.error('FAILED: /api/search/history should not include results array');
    process.exit(1);
  }

  console.log('✅ /api/search/history returned correctly with projection.');

  console.log('\n==================================================');
  console.log('4. GET /api/search/:id');
  console.log('==================================================');

  const searchId = history[0]._id.toString();
  const getSearchRes = await fetch(`${BASE_URL}/api/search/${searchId}`, {
    headers: { 'Cookie': cookieHeader }
  });

  const getSearchJson = await getSearchRes.json();
  if (getSearchJson._id !== searchId || !Array.isArray(getSearchJson.results)) {
    console.error('FAILED: /api/search/:id returned invalid response', getSearchJson);
    process.exit(1);
  }

  console.log('✅ /api/search/:id returned correctly with full results.');

  console.log('\n==================================================');
  console.log('5. DELETE /api/search/:id');
  console.log('==================================================');

  const delRes = await fetch(`${BASE_URL}/api/search/${searchId}`, {
    method: 'DELETE',
    headers: authHeaders
  });

  if (delRes.status !== 204) {
    const text = await delRes.text();
    console.error(`FAILED: Expected 204. Got ${delRes.status}`, text);
    process.exit(1);
  }

  const finalCheck = await SearchHistory.countDocuments({ userId: userRecord._id });
  if (finalCheck !== 0) {
    console.error('FAILED: Record was not deleted from DB.');
    process.exit(1);
  }

  console.log('✅ DELETE /api/search/:id worked successfully.');

  console.log('\n--- ALL PHASE 15 TESTS PASSED ---');
  await mongoose.disconnect();
};

runTests().catch(async (e) => {
  console.error('Test execution failed:', e);
  await mongoose.disconnect();
  process.exit(1);
});

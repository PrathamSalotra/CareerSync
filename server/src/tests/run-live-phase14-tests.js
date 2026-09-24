import mongoose from 'mongoose';
import config from '../config/index.js';
import { User, SearchReservation, Resume, LearningResource } from '../models/index.js';

const BASE_URL = `http://127.0.0.1:5005`;
const TEST_EMAIL = 'phase14-test@beta-test.com';
const TEST_PASSWORD = 'Password123!';

const parseCookies = (res) => {
  const raw = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  if (!raw || raw.length === 0) return {};
  return raw.reduce((acc, cookieStr) => {
    const parts = cookieStr.split(';')[0].split('=');
    acc[parts[0]] = parts[1];
    return acc;
  }, {});
};

const makeCookieString = (cookies) => {
  return Object.entries(cookies)
    .filter(([k, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
};

async function runTests() {
  console.log('--- STARTING PHASE 14 AI ANALYSIS TESTS ---');
  await mongoose.connect(config.MONGODB_URI);
  console.log('Connected to MongoDB Atlas.');

  console.log('\n==================================================');
  console.log('1. VERIFY SEED DATA');
  console.log('==================================================');

  const lrCount = await LearningResource.countDocuments();
  if (lrCount !== 25) {
    console.error(`1 FAILED: Expected exactly 25 LearningResources. Found ${lrCount}.`);
    process.exit(1);
  }
  console.log('✅ Exactly 25 LearningResources exist in DB.');

  console.log('\n==================================================');
  console.log('2. INTEGRATION TEST: AI FIT & GAP ANALYSIS');
  console.log('==================================================');

  // Cleanup past test data
  const existingUser = await User.findOne({ email: TEST_EMAIL });
  if (existingUser) {
    await SearchReservation.deleteMany({ userId: existingUser._id });
    await Resume.deleteMany({ userId: existingUser._id });
    await User.deleteMany({ email: TEST_EMAIL });
  }

  // Create base user
  const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Phase 14 Test', email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  
  const userCookies = parseCookies(signupRes);
  const cookieHeader = makeCookieString(userCookies);
  const csrfToken = userCookies['cs_csrf'];
  
  const userRecord = await User.findOne({ email: TEST_EMAIL });

  const authHeaders = {
    'Cookie': cookieHeader,
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  };

  // Mock a parsed resume in DB
  const mockResume = await Resume.create({
    userId: userRecord._id,
    rawFileObjectKey: 'mock/path',
    originalFilename: 'test.pdf',
    mimeType: 'application/pdf',
    uploadedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    parsed: {
      contact: { name: 'Test User' },
      derivedTargetTitle: 'Full Stack Developer',
      skills: ['Node.js', 'React', 'MongoDB', 'AWS'],
      experience: [
        {
          title: 'Software Engineer',
          company: 'TestCorp',
          startDate: '2020-01-01',
          endDate: '2023-01-01',
          description: 'Built full stack web applications using Node.js and React.'
        }
      ],
      education: [
        { degree: 'Bachelor of Science in Computer Science' }
      ]
    }
  });

  const res = await fetch(`${BASE_URL}/api/search`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      resumeId: mockResume._id,
      country: 'us'
    }),
  });

  if (res.status !== 200) {
    console.error(`2 FAILED: Expected 200. Got ${res.status}`, await res.text());
    process.exit(1);
  }

  const json = await res.json();
  
  if (!json.jobs || !Array.isArray(json.jobs) || json.jobs.length === 0) {
    console.error('2 FAILED: Did not return any ranked jobs.', json);
    process.exit(1);
  }

  const topJob = json.jobs[0];
  
  if (!topJob.fitExplanation || !Array.isArray(topJob.skillGaps)) {
    console.error('2 FAILED: Top job is missing AI analysis data.', topJob);
    process.exit(1);
  }

  console.log(`✅ Successfully generated AI gap analysis!`);
  console.log(`   Top Match: ${topJob.title}`);
  console.log(`   Fit Explanation: ${topJob.fitExplanation.substring(0, 80)}...`);
  console.log(`   Evidence Found: ${topJob.evidence?.length || 0}`);
  console.log(`   Skill Gaps Found: ${topJob.skillGaps?.length || 0}`);
  console.log(`   Experience Gaps Found: ${topJob.experienceGaps?.length || 0}`);
  
  if (topJob.skillGaps.length > 0 && topJob.skillGaps[0].resourceUrl) {
    console.log(`   Example recommended resource: ${topJob.skillGaps[0].resourceUrl}`);
  }

  // Clean up
  await SearchReservation.deleteMany({ userId: userRecord._id });
  await Resume.deleteMany({ userId: userRecord._id });
  await User.deleteMany({ email: TEST_EMAIL });

  console.log('\n==================================================');
  console.log('🎉 ALL PHASE 14 TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================');

  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});

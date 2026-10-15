import { makeNeonTesting } from 'neon-testing/vitest';

const apiKey = process.env.NEON_API_KEY;
const projectId = process.env.NEON_PROJECT_ID;

if (!apiKey || !projectId) {
  throw new Error('Server E2E tests require NEON_API_KEY and NEON_PROJECT_ID in server/.env.');
}

makeNeonTesting({
  apiKey,
  projectId,
  parentBranchId: process.env.NEON_PARENT_BRANCH_ID || undefined,
  databaseName: process.env.NEON_DATABASE_NAME || undefined,
  schemaOnly: true,
  deleteBranch: true,
  expiresIn: 600,
})();

import 'dotenv/config';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['neon-testing/setup', './test/neon-testing.setup.ts'],
    fileParallelism: false,
    testTimeout: 25000,
    hookTimeout: 60000,
  },
});

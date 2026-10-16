import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { validate } from './env.validation.js';

describe('environment validation', () => {
  const requiredValues = {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://localhost:5432/ggm_test',
    DIRECT_URL: 'postgresql://localhost:5432/ggm_test',
    JWT_SECRET: 'test-secret',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    CORS_ORIGIN: 'http://localhost:3000',
    SUPER_ADMIN_SEED_EMAIL: 'admin@example.test',
    SUPER_ADMIN_SEED_PASSWORD: 'test-password',
    REVALIDATE_SECRET: 'test-revalidation-secret',
    WEB_REVALIDATE_URL: 'http://localhost:3000/api/revalidate',
    IMAGE_ALLOWED_HOSTS: 'images.example.test',
  };

  it('defaults the API listener to port 5000', () => {
    expect(validate(requiredValues).PORT).toBe(5000);
  });
});

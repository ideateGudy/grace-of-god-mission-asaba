import { PrismaPg } from '@prisma/adapter-pg';

export function createPostgresAdapter(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) return undefined;

  const connectionString = `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}connection_limit=5&connect_timeout=15`;
  return new PrismaPg({ connectionString });
}

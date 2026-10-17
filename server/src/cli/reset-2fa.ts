import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createPostgresAdapter } from '../prisma/postgres-adapter.js';

async function main() {
  const prisma = new PrismaClient({ adapter: createPostgresAdapter() });
  const targetEmail = process.argv[2]?.trim();

  try {
    const user = targetEmail
      ? await prisma.adminUser.findUnique({ where: { email: targetEmail } })
      : await prisma.adminUser.findFirst({ where: { role: 'SUPER_ADMIN' } });

    if (!user) {
      console.error(targetEmail ? `No admin user found with email: ${targetEmail}` : 'No SUPER_ADMIN found in database.');
      process.exit(1);
    }

    if (!user.twoFactorEnabled) {
      console.log(`\nNotice: Two-factor authentication (2FA) is already DISABLED for ${user.email}.\n`);
      return;
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        tokenVersion: user.tokenVersion + 1,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorName: 'SYSTEM CLI',
        action: 'cli.reset_2fa',
        entity: 'AdminUser',
        entityId: user.id,
        meta: {
          email: user.email,
          reason: 'Emergency 2FA recovery via CLI',
        },
      },
    });

    console.log('\n======================================================');
    console.log(`SUCCESS: Two-factor authentication (2FA) disabled for: ${user.email}`);
    console.log('Active sessions have been invalidated.');
    console.log('The user can now log in using their password only.');
    console.log('======================================================\n');
  } catch (error) {
    console.error('Failed to reset 2FA:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error('Unexpected failure during 2FA reset:', error);
  process.exitCode = 1;
});

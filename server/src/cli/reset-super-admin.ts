import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { createPostgresAdapter } from '../prisma/postgres-adapter.js';

async function main() {
  const prisma = new PrismaClient({ adapter: createPostgresAdapter() });
  
  try {
    const superAdmin = await prisma.adminUser.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (!superAdmin) {
      console.error('No SUPER_ADMIN found in the database. Cannot reset.');
      process.exit(1);
    }

    const tempPassword = crypto.randomBytes(16).toString('base64').slice(0, 20);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await prisma.adminUser.update({
      where: { id: superAdmin.id },
      data: {
        passwordHash,
        mustChangePassword: true,
        tokenVersion: superAdmin.tokenVersion + 1,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: superAdmin.id,
        actorName: 'SYSTEM CLI',
        action: 'cli.reset_super_admin',
        entity: 'AdminUser',
        entityId: superAdmin.id,
      },
    });

    console.log('\n======================================================');
    console.log('SUCCESS: Super Admin password has been reset.');
    console.log(`Email: ${superAdmin.email}`);
    console.log(`New Temporary Password: ${tempPassword}`);
    console.log('Please login immediately and change this password.');
    console.log('======================================================\n');
  } catch (error) {
    console.error('Failed to reset SUPER_ADMIN password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error('Unexpected reset failure:', error);
  process.exitCode = 1;
});

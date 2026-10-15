import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createPostgresAdapter } from '../src/prisma/postgres-adapter.js';

const prisma = new PrismaClient({ adapter: createPostgresAdapter() });

async function main() {
  const superAdminEmail = process.env.SUPER_ADMIN_SEED_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_SEED_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    console.warn('SUPER_ADMIN_SEED_EMAIL or SUPER_ADMIN_SEED_PASSWORD not set. Skipping SUPER_ADMIN seed.');
  } else {
    const existingSuperAdmin = await prisma.adminUser.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (!existingSuperAdmin) {
      const passwordHash = await bcrypt.hash(superAdminPassword, 12);
      await prisma.adminUser.create({
        data: {
          email: superAdminEmail,
          name: 'Super Admin',
          passwordHash,
          role: 'SUPER_ADMIN',
          mustChangePassword: true,
          isActive: true,
        },
      });
      console.log(`Created SUPER_ADMIN with email: ${superAdminEmail}`);
    } else {
      console.log('SUPER_ADMIN already exists. Skipping creation.');
    }
  }

  const existingHero = await prisma.hero.findFirst();
  if (!existingHero) {
    await prisma.hero.create({
      data: {
        name: 'Sanctuary Welcome',
        mode: 'SINGLE',
        autoplay: false,
        intervalSeconds: 7,
        published: true,
        slides: {
          create: [
            {
              sortOrder: 0,
              layout: 'FULL_BLEED',
              align: 'CENTER',
              title: 'A Sanctuary of Grace, Truth, and Loving Community',
              subtitle: 'Connecting lives to the heart of Jesus Christ in Asaba, Delta State. Join us for spirit-filled worship, Bible-grounded teaching, and a family that walks with you in faith.',
              primaryLabel: 'Plan your visit',
              primaryUrl: '/visit',
              secondaryLabel: 'Watch latest sermons',
              secondaryUrl: '/sermons',
              bgType: 'COLOR',
              bgColor: '#141633',
              textTone: 'LIGHT',
              overlay: 40,
              imageDecorative: true,
            },
          ],
        },
      },
    });
    console.log('Created official default hero: Sanctuary Welcome');
  }

  if (process.argv.includes('--sample')) {
    console.log('Seeding SAMPLE data...');

    // Seed Sample Sermon
    await prisma.sermon.upsert({
      where: { slug: 'sample-sermon' },
      update: {},
      create: {
        slug: 'sample-sermon',
        title: '[SAMPLE] The Power of Faith',
        preacher: 'Pastor John Doe',
        preachedAt: new Date(),
        published: true,
      },
    });

    // Seed Sample Event
    await prisma.event.upsert({
      where: { slug: 'sample-event' },
      update: {},
      create: {
        slug: 'sample-event',
        title: '[SAMPLE] Annual Convention',
        startsAt: new Date(),
        venue: 'Main Auditorium',
        published: true,
      },
    });

    // Seed Sample Announcement
    await prisma.announcement.create({
      data: {
        title: '[SAMPLE] Youth Meeting',
        body: 'Join us for the youth meeting this Saturday.',
        published: true,
        pinned: true,
      },
    });

    // Seed Sample Gallery Image
    await prisma.galleryImage.create({
      data: {
        imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        caption: '[SAMPLE] Worship Night',
        published: true,
      },
    });

    // Seed Sample Hero
    const hero = await prisma.hero.create({
      data: {
        name: '[SAMPLE] Default Hero',
        mode: 'SINGLE',
        published: false,
        slides: {
          create: [
            {
              sortOrder: 0,
              layout: 'FULL_BLEED',
              title: '[SAMPLE] Welcome to Grace of God Mission',
              bgType: 'COLOR',
              bgColor: '#141633',
              textTone: 'LIGHT',
            },
          ],
        },
      },
    });

    console.log('SAMPLE data seeded.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

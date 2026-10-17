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

    // Seed Official Daily Grace Devotion for 2026-10-17 (Today)
    const devotionToday = new Date('2026-10-17T00:00:00.000Z');
    await prisma.devotion.upsert({
      where: { date: devotionToday },
      update: {
        series: 'DAILY GRACE',
        title: 'WALKING IN SUPERNATURAL PEACE',
        textRef: 'PHILIPPIANS 4:6-9',
        scriptureRef: 'ISAIAH 26:3',
        scriptureText: 'THOU WILT KEEP HIM IN PERFECT PEACE, WHOSE MIND IS STAYED ON THEE: BECAUSE HE TRUSTETH IN THEE.',
        content: `In a world characterized by anxiety, hurry, and endless uncertainty, peace is one of the greatest treasures a believer can possess. The peace of God is not the absence of trouble; it is the presence of God in the midst of any storm. When life's pressures mount, the natural human reaction is to worry and attempt to control outcomes in our own human strength. Yet Scripture invites us into a higher posture: fixing our gaze entirely on the Lord Jesus Christ.

Fix Your Thoughts Upon God. Isaiah 26:3 reveals that perfect peace is the direct fruit of a mind that is stayed on God. Whatever consumes your thoughts will eventually dictate your emotions and decisions. If you meditate on the challenges, fear will multiply. But when you anchor your heart on the character, promises, and sovereignty of God, divine calmness floods your soul. Take deliberate moments today to replace anxious thoughts with the truth of God's Word.

Cast Every Care Through Prayer. The Apostle Paul writing from prison gave the divine remedy for anxiety: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus" (Philippians 4:6-7). Thanksgiving is the secret weapon of faith. When you thank God before the breakthrough appears, you declare that your Father is already in control.

Guard Your Sanctuary and Fellowship. Spiritual peace is nurtured in an environment of worship and godly community. Walk with believers who speak faith, not despair. Keep the worship of Jesus playing in your home and car. As you step out today, refuse to entertain fear. You are carried by the everlasting arms of the Almighty God.`,
        prayer: 'Father, I anchor my mind on You today. Keep my heart in Your supernatural peace, and let every trace of anxiety flee in the mighty Name of Jesus, Amen.',
        bibleIn365Days: 'Psalms 1-3\nProverbs 25:15–28\nHebrews 6',
        actionPoint: 'REFUSE TO ENTERTAIN ANXIETY TODAY; CAST EVERY BURDEN ON GOD IN THANKSGIVING.',
        published: true,
      },
      create: {
        date: devotionToday,
        series: 'DAILY GRACE',
        title: 'WALKING IN SUPERNATURAL PEACE',
        textRef: 'PHILIPPIANS 4:6-9',
        scriptureRef: 'ISAIAH 26:3',
        scriptureText: 'THOU WILT KEEP HIM IN PERFECT PEACE, WHOSE MIND IS STAYED ON THEE: BECAUSE HE TRUSTETH IN THEE.',
        content: `In a world characterized by anxiety, hurry, and endless uncertainty, peace is one of the greatest treasures a believer can possess. The peace of God is not the absence of trouble; it is the presence of God in the midst of any storm. When life's pressures mount, the natural human reaction is to worry and attempt to control outcomes in our own human strength. Yet Scripture invites us into a higher posture: fixing our gaze entirely on the Lord Jesus Christ.

Fix Your Thoughts Upon God. Isaiah 26:3 reveals that perfect peace is the direct fruit of a mind that is stayed on God. Whatever consumes your thoughts will eventually dictate your emotions and decisions. If you meditate on the challenges, fear will multiply. But when you anchor your heart on the character, promises, and sovereignty of God, divine calmness floods your soul. Take deliberate moments today to replace anxious thoughts with the truth of God's Word.

Cast Every Care Through Prayer. The Apostle Paul writing from prison gave the divine remedy for anxiety: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus" (Philippians 4:6-7). Thanksgiving is the secret weapon of faith. When you thank God before the breakthrough appears, you declare that your Father is already in control.

Guard Your Sanctuary and Fellowship. Spiritual peace is nurtured in an environment of worship and godly community. Walk with believers who speak faith, not despair. Keep the worship of Jesus playing in your home and car. As you step out today, refuse to entertain fear. You are carried by the everlasting arms of the Almighty God.`,
        prayer: 'Father, I anchor my mind on You today. Keep my heart in Your supernatural peace, and let every trace of anxiety flee in the mighty Name of Jesus, Amen.',
        bibleIn365Days: 'Psalms 1-3\nProverbs 25:15–28\nHebrews 6',
        actionPoint: 'REFUSE TO ENTERTAIN ANXIETY TODAY; CAST EVERY BURDEN ON GOD IN THANKSGIVING.',
        published: true,
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

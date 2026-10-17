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

    // Seed Official Daily Grace Devotion
    const devotionDate = new Date('2026-10-16T00:00:00.000Z');
    await prisma.devotion.upsert({
      where: { date: devotionDate },
      update: {
        series: 'DAILY GRACE',
        title: 'LET GOD TRANSFORM YOUR LIFE',
        textRef: 'EPHESIANS 4:22-24',
        scriptureRef: '2 CORINTHIANS 5:17',
        scriptureText: 'THEREFORE IF ANY MAN BE IN CHRIST, HE IS A NEW CREATURE: OLD THINGS ARE PASSED AWAY; BEHOLD, ALL THINGS ARE BECOME NEW',
        content: `Do you feel like something is missing from your life, even though on the outside it looks successful? Despite all of our accomplishments and victories in this world, we still cannot find true happiness. As a Christian, you know that true transformation can only be found by seeking God’s will for your life and allowing him to work through you. Fortunately, tapping into God’s power does not have to be complicated; there are simple steps anyone can take today to allow God to begin transforming their life.

Make Prayer a Priority. As a Christian, you know that prayer is a powerful tool. It allows you to connect with God on a deep level and seek guidance, peace, and strength. 1 Thessalonians 5:17 instructs followers of Jesus to “Pray without ceasing,” but you can often get so caught up in your busy life that you forget to make prayer a priority. That is why it is important to take time each day to speak to God and listen for his guidance. Find a time that works for you and stick to it. Create a quiet space where you can pray without distractions. Remember, prayer is a two-way conversation, so take time to listen to God’s response as well. By making prayer a priority, you can strengthen your relationship with God and let him transform you.

Another way you can let God transform your life is by reading the Bible and understanding what it says about how you should live. The Bible is not only a book of wisdom and guidance, but it also reminds us of God’s love and faithfulness toward those who believe. By getting into the Word of God, you can grow spiritually and develop a deeper relationship with him. It may be challenging at times to understand the language or the context, but you can always seek guidance from trusted Pastors, Christian friends, or even online resources. Take the time to read your Bible and let its truth transform you from the inside out.

One of the most important things you can do to strengthen your faith is to spend time in fellowship with other believers. Regularly attending church services, joining a small group Bible study, or getting involved in a ministry are all great ways to connect with other Christians and deepen your understanding of God’s Word. It can be easy to get caught up in your busy life and neglect this aspect of your faith, but making time for fellowship is crucial for your spiritual growth. Hebrews 10:25 says, “not neglecting to meet together, as is the habit of some, but encouraging one another, and all the more as you see the Day drawing near.” Not only does Christian fellowship provide opportunities for you to learn and be encouraged by others, but it also allows you to serve and support your brothers and sisters in Christ. Make it a priority to invest in your relationships with other believers and see how God transforms you through your connectedness.`,
        prayer: "Dear Lord, complete the work of transformation you started in my life, in Jesus' Name, Amen.",
        bibleIn365Days: "Job 42\nProverbs 25:1–14\nHebrews 5",
        actionPoint: 'MAKE PRAYER YOUR PRIORITY AS A BELIEVER.',
        published: true,
      },
      create: {
        date: devotionDate,
        series: 'DAILY GRACE',
        title: 'LET GOD TRANSFORM YOUR LIFE',
        textRef: 'EPHESIANS 4:22-24',
        scriptureRef: '2 CORINTHIANS 5:17',
        scriptureText: 'THEREFORE IF ANY MAN BE IN CHRIST, HE IS A NEW CREATURE: OLD THINGS ARE PASSED AWAY; BEHOLD, ALL THINGS ARE BECOME NEW',
        content: `Do you feel like something is missing from your life, even though on the outside it looks successful? Despite all of our accomplishments and victories in this world, we still cannot find true happiness. As a Christian, you know that true transformation can only be found by seeking God’s will for your life and allowing him to work through you. Fortunately, tapping into God’s power does not have to be complicated; there are simple steps anyone can take today to allow God to begin transforming their life.

Make Prayer a Priority. As a Christian, you know that prayer is a powerful tool. It allows you to connect with God on a deep level and seek guidance, peace, and strength. 1 Thessalonians 5:17 instructs followers of Jesus to “Pray without ceasing,” but you can often get so caught up in your busy life that you forget to make prayer a priority. That is why it is important to take time each day to speak to God and listen for his guidance. Find a time that works for you and stick to it. Create a quiet space where you can pray without distractions. Remember, prayer is a two-way conversation, so take time to listen to God’s response as well. By making prayer a priority, you can strengthen your relationship with God and let him transform you.

Another way you can let God transform your life is by reading the Bible and understanding what it says about how you should live. The Bible is not only a book of wisdom and guidance, but it also reminds us of God’s love and faithfulness toward those who believe. By getting into the Word of God, you can grow spiritually and develop a deeper relationship with him. It may be challenging at times to understand the language or the context, but you can always seek guidance from trusted Pastors, Christian friends, or even online resources. Take the time to read your Bible and let its truth transform you from the inside out.

One of the most important things you can do to strengthen your faith is to spend time in fellowship with other believers. Regularly attending church services, joining a small group Bible study, or getting involved in a ministry are all great ways to connect with other Christians and deepen your understanding of God’s Word. It can be easy to get caught up in your busy life and neglect this aspect of your faith, but making time for fellowship is crucial for your spiritual growth. Hebrews 10:25 says, “not neglecting to meet together, as is the habit of some, but encouraging one another, and all the more as you see the Day drawing near.” Not only does Christian fellowship provide opportunities for you to learn and be encouraged by others, but it also allows you to serve and support your brothers and sisters in Christ. Make it a priority to invest in your relationships with other believers and see how God transforms you through your connectedness.`,
        prayer: "Dear Lord, complete the work of transformation you started in my life, in Jesus' Name, Amen.",
        bibleIn365Days: "Job 42\nProverbs 25:1–14\nHebrews 5",
        actionPoint: 'MAKE PRAYER YOUR PRIORITY AS A BELIEVER.',
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

import { describe, it, expect } from 'vitest';
import { parseRawDevotion, extractDate } from '../../client/lib/devotion/devotion-parser.js';

describe('Smart Devotion Parser', () => {
  const sampleText = `DAILY GRACE, FRIDAY, OCTOBER 16, 2026. 

LET GOD TRANSFORM YOUR LIFE

TEXT: EPHESIANS 4:22-24

VERSE OF THE DAY: _"THEREFORE IF ANY MAN BE IN CHRIST, HE IS A NEW CREATURE: OLD THINGS ARE PASSED AWAY; BEHOLD, ALL THINGS ARE BECOME NEW"- 2 CORINTHIANS 5:17_

Do you feel like something is missing from your life, even though on the outside it looks successful? Despite all of our accomplishments and victories in this world, we still cannot find true happiness. As a Christian, you know that true transformation can only be found by seeking God’s will for your life and allowing him to work through you. Fortunately, tapping into God’s power does not have to be complicated; there are simple steps anyone can take today to allow God to begin transforming their life.

Make Prayer a Priority. As a Christian, you know that prayer is a powerful tool. It allows you to connect with God on a deep level and seek guidance, peace, and strength. 1 Thessalonians 5:17 instructs followers of Jesus to “Pray without ceasing,” but you can often get so caught up in your busy life that you forget to make prayer a priority. That is why it is important to take time each day to speak to God and listen for his guidance. Find a time that works for you and stick to it. Create a quiet space where you can pray without distractions. Remember, prayer is a two-way conversation, so take time to listen to God’s response as well. By making prayer a priority, you can strengthen your relationship with God and let him transform you.

Another way you can let God transform your life is by reading the Bible and understanding what it says about how you should live. The Bible is not only a book of wisdom and guidance, but it also reminds us of God’s love and faithfulness toward those who believe. By getting into the Word of God, you can grow spiritually and develop a deeper relationship with him. It may be challenging at times to understand the language or the context, but you can always seek guidance from trusted Pastors, Christian friends, or even online resources. Take the time to read your Bible and let its truth transform you from the inside out.

One of the most important things you can do to strengthen your faith is to spend time in fellowship with other believers. Regularly attending church services, joining a small group Bible study, or getting involved in a ministry are all great ways to connect with other Christians and deepen your understanding of God’s Word. It can be easy to get caught up in your busy life and neglect this aspect of your faith, but making time for fellowship is crucial for your spiritual growth. Hebrews 10:25 says, “not neglecting to meet together, as is the habit of some, but encouraging one another, and all the more as you see the Day drawing near.” Not only does Christian fellowship provide opportunities for you to learn and be encouraged by others, but it also allows you to serve and support your brothers and sisters in Christ. Make it a priority to invest in your relationships with other believers and see how God transforms you through your connectedness.

PRAYER: Dear Lord, complete the work of transformation you started in my life, in Jesus' Name, Amen.

BIBLE IN 365 DAYS:
Job 42
Proverbs 25:1–14
Hebrews 5

ACTION POINT: 
MAKE PRAYER YOUR PRIORITY AS A BELIEVER.`;

  it('correctly parses the official Daily Grace sample format', () => {
    const result = parseRawDevotion(sampleText);

    expect(result.date).toBe('2026-10-16');
    expect(result.series).toBe('DAILY GRACE');
    expect(result.title).toBe('LET GOD TRANSFORM YOUR LIFE');
    expect(result.textRef).toBe('EPHESIANS 4:22-24');
    expect(result.scriptureRef).toBe('2 CORINTHIANS 5:17');
    expect(result.scriptureText).toBe(
      'THEREFORE IF ANY MAN BE IN CHRIST, HE IS A NEW CREATURE: OLD THINGS ARE PASSED AWAY; BEHOLD, ALL THINGS ARE BECOME NEW'
    );
    expect(result.prayer).toBe(
      "Dear Lord, complete the work of transformation you started in my life, in Jesus' Name, Amen."
    );
    expect(result.bibleIn365Days).toBe('Job 42\nProverbs 25:1–14\nHebrews 5');
    expect(result.actionPoint).toBe('MAKE PRAYER YOUR PRIORITY AS A BELIEVER.');
    expect(result.paragraphCount).toBe(4);
    expect(result.isValid).toBe(true);
    expect(result.missingRequired).toHaveLength(0);
  });

  it('handles variations in date structure and ordinal numbers', () => {
    expect(extractDate('DAILY GRACE - FRIDAY 16TH OCTOBER, 2026').date).toBe('2026-10-16');
    expect(extractDate('OCTOBER 16, 2026').date).toBe('2026-10-16');
    expect(extractDate('16/10/2026').date).toBe('2026-10-16');
    expect(extractDate('2026-10-16').date).toBe('2026-10-16');
    expect(extractDate('14TH FEBUARY 2027').date).toBe('2027-02-14');
  });

  it('handles verse reference at start of verse block', () => {
    const text = `OCTOBER 17, 2026
TOPIC: THE LORD IS MY SHEPHERD
VERSE OF THE DAY: PSALM 23:1 - The Lord is my shepherd; I shall not want.

God provides for all of our spiritual and physical needs when we rest in His pastures.`;

    const result = parseRawDevotion(text);
    expect(result.date).toBe('2026-10-17');
    expect(result.title).toBe('THE LORD IS MY SHEPHERD');
    expect(result.scriptureRef).toBe('PSALM 23:1');
    expect(result.scriptureText).toBe('The Lord is my shepherd; I shall not want.');
    expect(result.isValid).toBe(true);
  });

  it('handles missing optional fields gracefully', () => {
    const minimal = `2026-10-18
TITLE: SIMPLE DEVOTION
VERSE: JOHN 3:16 - For God so loved the world that he gave his only begotten Son.

A brief message of faith and redemption.`;

    const result = parseRawDevotion(minimal);
    expect(result.date).toBe('2026-10-18');
    expect(result.title).toBe('SIMPLE DEVOTION');
    expect(result.scriptureRef).toBe('JOHN 3:16');
    expect(result.scriptureText).toBe('For God so loved the world that he gave his only begotten Son.');
    expect(result.prayer).toBeUndefined();
    expect(result.bibleIn365Days).toBeUndefined();
    expect(result.actionPoint).toBeUndefined();
    expect(result.isValid).toBe(true);
  });
});

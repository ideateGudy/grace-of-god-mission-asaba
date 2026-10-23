export type BibleTranslation =
  | "KJV"
  | "NKJV"
  | "ESV"
  | "AMP"
  | "NIV"
  | "MSG"
  | "BSB";

export interface BibleVerse {
  book: string;
  bookNum: number;
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  translation: BibleTranslation;
}

export interface ScriptureLookupResult {
  reference: string;
  book: string;
  chapter: number;
  verse: number;
  endVerse?: number;
  text: string;
  translation: BibleTranslation;
  source: "cache" | "bolls" | "bible-api" | "helloao" | "vault";
}

export interface BibleBookMeta {
  name: string;
  number: number;
  id: string; // 3-letter USFM code
  chapters: number;
  abbreviations: string[];
}

export const BIBLE_BOOKS: BibleBookMeta[] = [
  { name: "Genesis", number: 1, id: "GEN", chapters: 50, abbreviations: ["gen", "ge", "gn"] },
  { name: "Exodus", number: 2, id: "EXO", chapters: 40, abbreviations: ["exo", "ex", "exod"] },
  { name: "Leviticus", number: 3, id: "LEV", chapters: 27, abbreviations: ["lev", "le", "lv"] },
  { name: "Numbers", number: 4, id: "NUM", chapters: 36, abbreviations: ["num", "nu", "nm", "nb"] },
  { name: "Deuteronomy", number: 5, id: "DEU", chapters: 34, abbreviations: ["deu", "dt", "deut"] },
  { name: "Joshua", number: 6, id: "JOS", chapters: 24, abbreviations: ["jos", "josh"] },
  { name: "Judges", number: 7, id: "JDG", chapters: 21, abbreviations: ["jdg", "judg", "jg"] },
  { name: "Ruth", number: 8, id: "RUT", chapters: 4, abbreviations: ["rut", "rth", "ru"] },
  { name: "1 Samuel", number: 9, id: "1SA", chapters: 31, abbreviations: ["1sa", "1sam", "1 s", "1 sam", "1samuel"] },
  { name: "2 Samuel", number: 10, id: "2SA", chapters: 24, abbreviations: ["2sa", "2sam", "2 s", "2 sam", "2samuel"] },
  { name: "1 Kings", number: 11, id: "1KI", chapters: 22, abbreviations: ["1ki", "1kgs", "1 k", "1 kgs", "1kings"] },
  { name: "2 Kings", number: 12, id: "2KI", chapters: 25, abbreviations: ["2ki", "2kgs", "2 k", "2 kgs", "2kings"] },
  { name: "1 Chronicles", number: 13, id: "1CH", chapters: 29, abbreviations: ["1ch", "1chron", "1 ch", "1 chr", "1chronicles"] },
  { name: "2 Chronicles", number: 14, id: "2CH", chapters: 36, abbreviations: ["2ch", "2chron", "2 ch", "2 chr", "2chronicles"] },
  { name: "Ezra", number: 15, id: "EZR", chapters: 10, abbreviations: ["ezr", "ezra"] },
  { name: "Nehemiah", number: 16, id: "NEH", chapters: 13, abbreviations: ["neh", "ne"] },
  { name: "Esther", number: 17, id: "EST", chapters: 10, abbreviations: ["est", "esth", "es"] },
  { name: "Job", number: 18, id: "JOB", chapters: 42, abbreviations: ["job", "jb"] },
  { name: "Psalms", number: 19, id: "PSA", chapters: 150, abbreviations: ["psa", "ps", "psalm", "psalms"] },
  { name: "Proverbs", number: 20, id: "PRO", chapters: 31, abbreviations: ["pro", "pr", "prov", "proverbs"] },
  { name: "Ecclesiastes", number: 21, id: "ECC", chapters: 12, abbreviations: ["ecc", "ec", "eccl"] },
  { name: "Song of Solomon", number: 22, id: "SNG", chapters: 8, abbreviations: ["sng", "sos", "song", "cant"] },
  { name: "Isaiah", number: 23, id: "ISA", chapters: 66, abbreviations: ["isa", "is", "isaiah"] },
  { name: "Jeremiah", number: 24, id: "JER", chapters: 52, abbreviations: ["jer", "je", "jr"] },
  { name: "Lamentations", number: 25, id: "LAM", chapters: 5, abbreviations: ["lam", "la"] },
  { name: "Ezekiel", number: 26, id: "EZK", chapters: 48, abbreviations: ["ezk", "eze", "ezek"] },
  { name: "Daniel", number: 27, id: "DAN", chapters: 12, abbreviations: ["dan", "da", "dn"] },
  { name: "Hosea", number: 28, id: "HOS", chapters: 14, abbreviations: ["hos", "ho"] },
  { name: "Joel", number: 29, id: "JOL", chapters: 3, abbreviations: ["jol", "joe", "jl"] },
  { name: "Amos", number: 30, id: "AMO", chapters: 9, abbreviations: ["amo", "am"] },
  { name: "Obadiah", number: 31, id: "OBA", chapters: 1, abbreviations: ["oba", "ob"] },
  { name: "Jonah", number: 32, id: "JON", chapters: 4, abbreviations: ["jon", "jnh"] },
  { name: "Micah", number: 33, id: "MIC", chapters: 7, abbreviations: ["mic", "mc"] },
  { name: "Nahum", number: 34, id: "NAM", chapters: 3, abbreviations: ["nam", "nah"] },
  { name: "Habakkuk", number: 35, id: "HAB", chapters: 3, abbreviations: ["hab", "hb"] },
  { name: "Zephaniah", number: 36, id: "ZEP", chapters: 3, abbreviations: ["zep", "zp"] },
  { name: "Haggai", number: 37, id: "HAG", chapters: 2, abbreviations: ["hag", "hg"] },
  { name: "Zechariah", number: 38, id: "ZEC", chapters: 14, abbreviations: ["zec", "zc"] },
  { name: "Malachi", number: 39, id: "MAL", chapters: 4, abbreviations: ["mal", "ml"] },
  // New Testament
  { name: "Matthew", number: 40, id: "MAT", chapters: 28, abbreviations: ["mat", "matt", "mt"] },
  { name: "Mark", number: 41, id: "MRK", chapters: 16, abbreviations: ["mrk", "mark", "mk"] },
  { name: "Luke", number: 42, id: "LUK", chapters: 24, abbreviations: ["luk", "luke", "lk"] },
  { name: "John", number: 43, id: "JHN", chapters: 21, abbreviations: ["jhn", "john", "jn"] },
  { name: "Acts", number: 44, id: "ACT", chapters: 28, abbreviations: ["act", "acts", "ac"] },
  { name: "Romans", number: 45, id: "ROM", chapters: 16, abbreviations: ["rom", "ro", "rm"] },
  { name: "1 Corinthians", number: 46, id: "1CO", chapters: 16, abbreviations: ["1co", "1cor", "1 cor", "1 corinthians", "1corinthians"] },
  { name: "2 Corinthians", number: 47, id: "2CO", chapters: 13, abbreviations: ["2co", "2cor", "2 cor", "2 corinthians", "2corinthians"] },
  { name: "Galatians", number: 48, id: "GAL", chapters: 6, abbreviations: ["gal", "ga"] },
  { name: "Ephesians", number: 49, id: "EPH", chapters: 6, abbreviations: ["eph", "ep"] },
  { name: "Philippians", number: 50, id: "PHP", chapters: 4, abbreviations: ["php", "phil", "philippians"] },
  { name: "Colossians", number: 51, id: "COL", chapters: 4, abbreviations: ["col", "cl"] },
  { name: "1 Thessalonians", number: 52, id: "1TH", chapters: 5, abbreviations: ["1th", "1thess", "1 thess", "1thessalonians"] },
  { name: "2 Thessalonians", number: 53, id: "2TH", chapters: 3, abbreviations: ["2th", "2thess", "2 thess", "2thessalonians"] },
  { name: "1 Timothy", number: 54, id: "1TI", chapters: 6, abbreviations: ["1ti", "1tim", "1 tim", "1timothy"] },
  { name: "2 Timothy", number: 55, id: "2TI", chapters: 4, abbreviations: ["2ti", "2tim", "2 tim", "2timothy"] },
  { name: "Titus", number: 56, id: "TIT", chapters: 3, abbreviations: ["tit", "ti"] },
  { name: "Philemon", number: 57, id: "PHM", chapters: 1, abbreviations: ["phm", "philem"] },
  { name: "Hebrews", number: 58, id: "HEB", chapters: 13, abbreviations: ["heb", "he"] },
  { name: "James", number: 59, id: "JAS", chapters: 5, abbreviations: ["jas", "jm", "james"] },
  { name: "1 Peter", number: 60, id: "1PE", chapters: 5, abbreviations: ["1pe", "1pet", "1 pet", "1peter"] },
  { name: "2 Peter", number: 61, id: "2PE", chapters: 3, abbreviations: ["2pe", "2pet", "2 pet", "2peter"] },
  { name: "1 John", number: 62, id: "1JN", chapters: 5, abbreviations: ["1jn", "1john", "1 jn", "1 jhn"] },
  { name: "2 John", number: 63, id: "2JN", chapters: 1, abbreviations: ["2jn", "2john", "2 jn"] },
  { name: "3 John", number: 64, id: "3JN", chapters: 1, abbreviations: ["3jn", "3john", "3 jn"] },
  { name: "Jude", number: 65, id: "JUD", chapters: 1, abbreviations: ["jud", "jude"] },
  { name: "Revelation", number: 66, id: "REV", chapters: 22, abbreviations: ["rev", "revelation", "re"] },
];

export const NIGERIAN_TRANSLATIONS: { id: BibleTranslation; name: string; tag: string }[] = [
  { id: "KJV", name: "King James Version", tag: "Most Popular in Nigeria" },
  { id: "NKJV", name: "New King James Version", tag: "Contemporary Majesty" },
  { id: "AMP", name: "Amplified Bible", tag: "Deep Spiritual Insight" },
  { id: "ESV", name: "English Standard Version", tag: "Word-for-Word Literal" },
  { id: "NIV", name: "New International Version", tag: "Clear & Accessible" },
  { id: "MSG", name: "The Message", tag: "Expressive Paraphrase" },
  { id: "BSB", name: "Berean Standard Bible", tag: "Modern Open Access" },
];

/**
 * Curated Sanctuary Offline Scripture Vault:
 * Pre-bundled scripture staples guaranteed to render even with 0% internet connectivity.
 */
export const SANCTUARY_OFFLINE_VAULT: Record<string, Partial<Record<BibleTranslation, string>>> = {
  "ISA 60:1": {
    KJV: "Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.",
    NKJV: "Arise, shine; For your light has come! And the glory of the LORD is risen upon you.",
    AMP: "Arise [from spiritual depression to a new life], shine [be radiant with the glory and brilliance of the LORD]; for your light has come, and the glory and brilliance of the LORD has risen upon you.",
    ESV: "Arise, shine, for your light has come, and the glory of the LORD has risen upon you.",
    NIV: "Arise, shine, for your light has come, and the glory of the LORD rises upon you.",
    MSG: "Get up, God's Church! Wake up! Your sunrise has arrived! The glory of God is streaming from you.",
    BSB: "Arise, shine, for your light has come, and the glory of the LORD shines upon you.",
  },
  "PSA 23:1": {
    KJV: "The LORD is my shepherd; I shall not want.",
    NKJV: "The LORD is my shepherd; I shall not want.",
    AMP: "The LORD is my Shepherd [to feed, to guide and to shield me]; I shall not want.",
    ESV: "The LORD is my shepherd; I shall not want.",
    NIV: "The LORD is my shepherd, I lack nothing.",
    MSG: "GOD, my shepherd! I don't need a thing.",
    BSB: "The LORD is my shepherd; I shall not want.",
  },
  "PHP 4:19": {
    KJV: "But my God shall supply all your need according to his riches in glory by Christ Jesus.",
    NKJV: "And my God shall supply all your need according to His riches in glory by Christ Jesus.",
    AMP: "And my God will liberally supply (fill until full) your every need according to His riches in glory in Christ Jesus.",
    ESV: "And my God will supply every need of yours according to his riches in glory in Christ Jesus.",
    NIV: "And my God will meet all your needs according to the riches of his glory in Christ Jesus.",
    MSG: "You can be sure that God will take care of everything you need, his generosity exceeding even yours in the glory that pours from Jesus.",
    BSB: "And my God will meet all your needs according to the riches of His glory in Christ Jesus.",
  },
  "ROM 8:28": {
    KJV: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    NKJV: "And we know that all things work together for good to those who love God, to those who are the called according to His purpose.",
    AMP: "And we know [with great confidence] that God [who is deeply concerned about us] causes all things to work together [as a plan] for good for those who love God, to those who are called according to His plan and purpose.",
    ESV: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
    NIV: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    MSG: "That's why we can be so sure that every detail in our lives of love for God is worked into something good.",
    BSB: "And we know that God works all things together for the good of those who love Him, who are called according to His purpose.",
  },
  "JER 29:11": {
    KJV: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
    NKJV: "'For I know the thoughts that I think toward you,' says the LORD, 'thoughts of peace and not of evil, to give you a future and a hope.'",
    AMP: "'For I know the plans and thoughts that I have for you,' says the LORD, 'plans for peace and well-being and not for disaster, to give you a future and a hope.'",
    ESV: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.",
    NIV: "'For I know the plans I have for you,' declares the LORD, 'plans to prosper you and not to harm you, plans to give you hope and a future.'",
    MSG: "'I know what I'm doing. I have it all planned out—plans to take care of you, not abandon you, plans to give you the future you hope for.'",
    BSB: "'For I know the plans I have for you,' declares the LORD, 'plans to prosper you and not to harm you, to give you a future and a hope.'",
  },
  "PRO 3:5": {
    KJV: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
    NKJV: "Trust in the LORD with all your heart, And lean not on your own understanding;",
    AMP: "Trust in and rely confidently on the LORD with all your heart And do not rely on your own insight or understanding.",
    ESV: "Trust in the LORD with all your heart, and do not lean on your own understanding.",
    NIV: "Trust in the LORD with all your heart and lean not on your own understanding;",
    MSG: "Trust GOD from the bottom of your heart; don't try to figure out everything on your own.",
    BSB: "Trust in the LORD with all your heart, and lean not on your own understanding;",
  },
  "2CO 9:7": {
    KJV: "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.",
    NKJV: "So let each one give as he purposes in his heart, not grudgingly or of necessity; for God loves a cheerful giver.",
    AMP: "Let each one give [thoughtfully and with purpose] just as he has decided in his heart, not grudgingly or under compulsion, for God loves a cheerful giver [and delights in the one whose heart is in his gift].",
    ESV: "Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver.",
    NIV: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.",
    MSG: "Let each one give what they have decided in their heart to give—not grudgingly or under compulsion, for God loves a cheerful giver.",
    BSB: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.",
  },
  "MAL 3:10": {
    KJV: "Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.",
    NKJV: "Bring all the tithes into the storehouse, That there may be food in My house, And try Me now in this, Says the LORD of hosts, If I will not open for you the windows of heaven And pour out for you such blessing That there will not be room enough to receive it.",
    AMP: "Bring all the tithes (the tenth) into the storehouse, so that there may be food in My house, and test Me now in this, says the LORD of hosts, if I will not open for you the windows of heaven and pour out for you [so great] a blessing until there is no more room to receive it.",
    ESV: "Bring the full tithe into the storehouse, that there may be food in my house. And thereby put me to the test, says the LORD of hosts, if I will not open the windows of heaven for you and pour down for you a blessing until there is no more need.",
    NIV: "Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this, says the LORD Almighty, and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it.",
    MSG: "Bring your full tithe to the Temple treasury so there will be plenty of food in my house. Put me to the test and see if I don't open up heaven itself to you and pour out blessings beyond your wildest dreams.",
    BSB: "Bring all the tithes into the storehouse so there may be food in My house. Test Me now in this, says the LORD of Hosts, if I will not throw open the floodgates of heaven and pour down blessings beyond your measure.",
  },
  "JHN 3:16": {
    KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    NKJV: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.",
    AMP: "For God so [greatly] loved and dearly prized the world, that He [even] gave His [One and] only begotten Son, so that whoever believes and trusts in Him [as Savior] shall not perish, but have eternal life.",
    ESV: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
    NIV: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    MSG: "This is how much God loved the world: He gave his Son, his one and only Son. And this is why: so that no one need be destroyed; by believing in him, anyone can have a whole and lasting life.",
    BSB: "For God so loved the world that He gave His one and only Son, that everyone who believes in Him shall not perish but have eternal life.",
  },
  "PSA 91:1": {
    KJV: "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.",
    NKJV: "He who dwells in the secret place of the Most High Shall abide under the shadow of the Almighty.",
    AMP: "He who dwells in the shelter of the Most High Will remain secure and rest in the shadow of the Almighty [whose power no enemy can withstand].",
    ESV: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty.",
    NIV: "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty.",
    MSG: "You who sit down in the High God's presence, spend the night in Shaddai's shadow.",
    BSB: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty.",
  },
  "2CO 5:17": {
    KJV: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
    NKJV: "Therefore, if anyone is in Christ, he is a new creation; old things have passed away; behold, all things have become new.",
    AMP: "Therefore if anyone is in Christ [that is, grafted in, joined to Him by faith in Him as Savior], he is a new creature [reborn and renewed by the Holy Spirit]; the old things [the previous moral and spiritual condition] have passed away. Behold, new things have come [because spiritual awakening brings a new life].",
    ESV: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.",
    NIV: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!",
    MSG: "Now we look at anyone and see someone inside a new life! The old life is gone; a new life burgeons! Look at it!",
    BSB: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come!",
  },
};

const BIBLE_CACHE_STORAGE_KEY = "ggm_bible_scripture_cache_v4";

/**
 * In-memory map cache for 0ms lookup latency
 */
const memoryCache = new Map<string, string>();

function getCacheKey(translation: BibleTranslation, bookId: string, chapter: number, verse: number): string {
  return `${translation}_${bookId}_${chapter}_${verse}`.toUpperCase();
}

/**
 * Restore persistent local storage cache into memory
 */
function initStorageCache(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(BIBLE_CACHE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string>;
      for (const [k, v] of Object.entries(parsed)) {
        memoryCache.set(k, v);
      }
    }
  } catch {}
}

function persistToStorage(key: string, text: string): void {
  memoryCache.set(key, text);
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(BIBLE_CACHE_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    existing[key] = text;
    // Cap cache at 300 entries to prevent quota limits
    const entries = Object.entries(existing);
    if (entries.length > 300) {
      const trimmed = Object.fromEntries(entries.slice(entries.length - 250));
      localStorage.setItem(BIBLE_CACHE_STORAGE_KEY, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(BIBLE_CACHE_STORAGE_KEY, JSON.stringify(existing));
    }
  } catch {}
}

/**
 * Parse natural text references like "John 3:16", "Jn 3:16", "2 Cor 9:7", "Rom 8:28"
 */
export function parseScriptureQuery(query: string): {
  bookMeta: BibleBookMeta | null;
  chapter: number;
  verse: number;
  endVerse?: number;
} | null {
  const trimmed = query.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;

  // Match e.g. "1 Corinthians 13:4-8" or "John 3:16" or "Psalm 23"
  const regex = /^((?:[1-3]\s+)?[A-Za-z]+)\s*(\d+)(?:\s*:\s*(\d+)(?:\s*-\s*(\d+))?)?$/i;
  const match = trimmed.match(regex);

  if (!match) {
    // Check if query is just book and chapter, e.g. "Psalm 23"
    const bookOnlyRegex = /^((?:[1-3]\s+)?[A-Za-z]+)\s*(\d+)$/i;
    const bookOnlyMatch = trimmed.match(bookOnlyRegex);
    if (!bookOnlyMatch) return null;

    const bookStr = bookOnlyMatch[1].trim().toLowerCase();
    const chapterNum = parseInt(bookOnlyMatch[2], 10);
    const foundBook = findBook(bookStr);
    if (!foundBook) return null;

    return {
      bookMeta: foundBook,
      chapter: chapterNum,
      verse: 1,
    };
  }

  const bookPart = match[1].trim().toLowerCase();
  const chapter = parseInt(match[2], 10);
  const verse = match[3] ? parseInt(match[3], 10) : 1;
  const endVerse = match[4] ? parseInt(match[4], 10) : undefined;

  const foundBook = findBook(bookPart);
  if (!foundBook) return null;

  return {
    bookMeta: foundBook,
    chapter,
    verse,
    endVerse,
  };
}

export function findBook(input: string): BibleBookMeta | null {
  const cleaned = input.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const b of BIBLE_BOOKS) {
    const normName = b.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normName === cleaned) return b;
    if (b.id.toLowerCase() === cleaned) return b;

    for (const abbr of b.abbreviations) {
      if (abbr.replace(/[^a-z0-9]/g, "") === cleaned) return b;
    }
  }

  // Prefix match (e.g. "phil" for Philippians, "rom" for Romans)
  for (const b of BIBLE_BOOKS) {
    const normName = b.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normName.startsWith(cleaned) && cleaned.length >= 3) return b;
  }

  return null;
}

/**
 * Multi-Tier Scripture Resolver:
 * Tier 0: Memory & LocalStorage Cache (Instant 0ms)
 * Tier 1: bolls.life/api (KJV, NKJV, ESV, AMP, NIV, MSG)
 * Tier 2: bible-api.com (KJV fallback)
 * Tier 3: bible.helloao.org (BSB, KJV)
 * Tier 4: Sanctuary Offline Scripture Vault (Guaranteed offline staple verses)
 */
export async function fetchScriptureVerse(
  translation: BibleTranslation,
  book: string,
  chapter: number,
  verse: number
): Promise<ScriptureLookupResult> {
  initStorageCache();

  const foundBook = findBook(book) || BIBLE_BOOKS[0];
  const cacheKey = getCacheKey(translation, foundBook.id, chapter, verse);
  const vaultKey = `${foundBook.id} ${chapter}:${verse}`.toUpperCase();

  // 1. Check Memory/Storage Cache
  const cachedText = memoryCache.get(cacheKey);
  if (cachedText) {
    return {
      reference: `${foundBook.name} ${chapter}:${verse}`,
      book: foundBook.name,
      chapter,
      verse,
      text: cachedText,
      translation,
      source: "cache",
    };
  }

  // 2. Tier 1: bible-api.com (World-renowned, pure unformatted prose without Strong's or footnote tags - used for KJV)
  if (translation === "KJV") {
    try {
      const cleanRef = encodeURIComponent(`${foundBook.name} ${chapter}:${verse}`);
      const url = `https://bible-api.com/${cleanRef}?translation=kjv`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data?.text) {
          const cleanText = cleanVerseText(data.text, foundBook.name, verse);
          if (cleanText && !isNoticeOrErrorText(cleanText)) {
            persistToStorage(cacheKey, cleanText);
            return {
              reference: `${foundBook.name} ${chapter}:${verse}`,
              book: foundBook.name,
              chapter,
              verse,
              text: cleanText,
              translation,
              source: "bible-api",
            };
          }
        }
      }
    } catch {}
  }

  // 3. Tier 2: bolls.life API (Supports NKJV, ESV, AMP, MSG, BSB, KJV fallback)
  try {
    const bollsTrans = translation === "BSB" ? "BSB" : translation;
    const url = `https://bolls.life/get-text/${bollsTrans}/${foundBook.number}/${chapter}/`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const found = data.find((item: { verse: number; text: string }) => item.verse === verse);
        if (found?.text) {
          const cleanText = cleanVerseText(found.text, foundBook.name, verse);
          if (cleanText && !isNoticeOrErrorText(cleanText)) {
            persistToStorage(cacheKey, cleanText);
            return {
              reference: `${foundBook.name} ${chapter}:${verse}`,
              book: foundBook.name,
              chapter,
              verse,
              text: cleanText,
              translation,
              source: "bolls",
            };
          }
        }
      }
    }
  } catch {}

  // 4. Tier 3: bible-api.com general fallback
  try {
    const cleanRef = encodeURIComponent(`${foundBook.name} ${chapter}:${verse}`);
    const url = `https://bible-api.com/${cleanRef}?translation=kjv`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.text) {
        const cleanText = cleanVerseText(data.text, foundBook.name, verse);
        if (cleanText && !isNoticeOrErrorText(cleanText)) {
          persistToStorage(cacheKey, cleanText);
          return {
            reference: `${foundBook.name} ${chapter}:${verse}`,
            book: foundBook.name,
            chapter,
            verse,
            text: cleanText,
            translation,
            source: "bible-api",
          };
        }
      }
    }
  } catch {}

  // 4. Tier 3: bible.helloao.org (Clean BSB, KJV fallback)
  try {
    const helloaoTrans = translation === "BSB" ? "BSB" : "KJV";
    const url = `https://bible.helloao.org/api/${helloaoTrans}/${foundBook.id}/${chapter}.json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const content = data?.chapter?.content;
      if (Array.isArray(content)) {
        const verseObj = content.find((c: { type: string; number?: number }) => c.type === "verse" && c.number === verse);
        if (verseObj && Array.isArray(verseObj.content)) {
          const joinedText = verseObj.content
            .map((chunk: any) => (typeof chunk === "string" ? chunk : chunk?.text || ""))
            .join("")
            .trim();

          const cleanText = cleanVerseText(joinedText, foundBook.name, verse);
          if (cleanText && !isNoticeOrErrorText(cleanText)) {
            persistToStorage(cacheKey, cleanText);
            return {
              reference: `${foundBook.name} ${chapter}:${verse}`,
              book: foundBook.name,
              chapter,
              verse,
              text: cleanText,
              translation,
              source: "helloao",
            };
          }
        }
      }
    }
  } catch {}

  // 5. Tier 4: Sanctuary Offline Scripture Vault
  const vaultEntry = SANCTUARY_OFFLINE_VAULT[vaultKey];
  if (vaultEntry) {
    const vaultText = vaultEntry[translation] || vaultEntry.KJV || vaultEntry.NKJV;
    if (vaultText) {
      persistToStorage(cacheKey, vaultText);
      return {
        reference: `${foundBook.name} ${chapter}:${verse}`,
        book: foundBook.name,
        chapter,
        verse,
        text: vaultText,
        translation,
        source: "vault",
      };
    }
  }

  // Fallback fallback if verse is outside offline vault and all 3 remote APIs failed
  const placeholderText = `"${foundBook.name} ${chapter}:${verse}" — [Network Offline. Connect to Wi-Fi to load un-cached scriptures, or select from pre-cached church passages.]`;
  return {
    reference: `${foundBook.name} ${chapter}:${verse}`,
    book: foundBook.name,
    chapter,
    verse,
    text: placeholderText,
    translation,
    source: "vault",
  };
}

/**
 * Thoroughly sanitizes and cleans raw or stored Bible text:
 * - Strips Strong's concordance tags & inner numbers e.g. <S>1063</S>, <S>4210</S>
 * - Strips Strong's numbers concatenated directly with letters e.g. "For1063" -> "For", "world2889," -> "world,"
 * - Strips standalone manuscript/footnote numbers e.g. [1], {12}
 * - Strips Psalm superscriptions / title prefixes (e.g. "A Psalm of David.", "To the chief Musician...", "A Song of degrees...")
 * - Strips all HTML formatting tags like <i>, <b>, <br>
 * - Normalizes quotes and excess whitespace
 */
export function cleanVerseText(raw: string, bookName?: string, verseNum?: number): string {
  if (!raw) return "";
  let text = raw
    // 1. Remove <sup>...</sup> and <sub>...</sub> tags ALONG WITH their inner footnote text (e.g. <sup>green: Heb. pastures of tender grass</sup>)
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, "")
    .replace(/<sub\b[^>]*>[\s\S]*?<\/sub>/gi, "")
    // 2. Remove Strong's concordance tags and their inner numbers (<S>1063</S> or <S> 4210 </S>)
    .replace(/<S\b[^>]*>[\s\S]*?<\/S>/gi, "")
    // 3. Remove any remaining <S...> tags if malformed
    .replace(/<\/?S[^>]*>/gi, "")
    // 4. Remove all other HTML tags (<br>, <i>, <b>, <p>, etc.)
    .replace(/<[^>]+>/g, "")
    // 5. Remove digits attached directly to word characters (e.g. For1063 -> For, loved25 -> loved, world2889, -> world,)
    .replace(/(?<=[a-zA-Z])\d+/g, "")
    // 6. Remove standalone digits that might be leftover Strong's numbers or footnote markers
    .replace(/(?<![a-zA-Z0-9])\d{2,5}(?![a-zA-Z0-9])/g, "")
    // 7. Remove bracketed or braced footnote/reference numbers e.g. [1], [12], {3}
    .replace(/\[\d+\]/g, "")
    .replace(/\{\d+\}/g, "")
    // 8. Clean up HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    // 9. Collapse multiple whitespaces into a single space
    .replace(/\s+/g, " ")
    .trim();

  // 9. Remove Psalm superscriptions / chapter header prefixes that APIs attach to verse 1
  const isPsalm = !bookName || /psalm/i.test(bookName);
  if (isPsalm && (!verseNum || verseNum === 1)) {
    text = text
      .replace(
        /^(?:(?:To the (?:chief Musician|Overseer)[^.]*\.)|(?:A Psalm of [^.]*\.)|(?:A Song of [^.]*\.)|(?:A Song and Psalm of [^.]*\.)|(?:A Prayer of [^.]*\.)|(?:A David psalm)|(?:Maschil of [^.]*\.)|(?:Michtam of [^.]*\.))\s*/gi,
        ""
      )
      .replace(
        /^(?:(?:To the (?:chief Musician|Overseer)[^.]*\.)|(?:A Psalm of [^.]*\.)|(?:A Song of [^.]*\.)|(?:A Song and Psalm of [^.]*\.)|(?:A Prayer of [^.]*\.)|(?:A David psalm)|(?:Maschil of [^.]*\.)|(?:Michtam of [^.]*\.))\s*/gi,
        ""
      )
      .trim();
  }

  return text;
}

/**
 * Checks if the API returned a protest/notice text instead of scripture (e.g. Biblica NIV copyright notice)
 */
export function isNoticeOrErrorText(text: string): boolean {
  if (!text) return true;
  return /Biblica, Inc\.|copyright notice|has prohibited me|financial profit|prohibited from using/i.test(text);
}

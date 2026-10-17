/**
 * Smart Devotion Parser
 * Extracts structured fields from unstructured raw devotional announcements,
 * accounting for variations in formatting, markdown, punctuation, and labels.
 */

export interface ParsedDevotion {
  date?: string;          // ISO format: YYYY-MM-DD
  series: string;         // e.g. "DAILY GRACE"
  title: string;          // e.g. "LET GOD TRANSFORM YOUR LIFE"
  textRef?: string;       // Scripture Reading / TEXT e.g. "EPHESIANS 4:22-24"
  scriptureRef: string;   // Verse reference e.g. "2 CORINTHIANS 5:17"
  scriptureText: string;  // Verse body text
  content: string;        // Full devotional message paragraphs
  prayer?: string;        // Closing prayer
  bibleIn365Days?: string;// 1-Year Bible reading plan (multi-line)
  actionPoint?: string;   // Practical action point
  
  detectionStatus: {
    date: boolean;
    series: boolean;
    title: boolean;
    textRef: boolean;
    scriptureRef: boolean;
    scriptureText: boolean;
    content: boolean;
    prayer: boolean;
    bibleIn365Days: boolean;
    actionPoint: boolean;
  };
  isValid: boolean;
  missingRequired: string[];
  warnings: string[];
  wordCount: number;
  paragraphCount: number;
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1, janaury: 1,
  feb: 2, february: 2, febuary: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9, septmber: 9,
  oct: 10, october: 10, octomber: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const BIBLE_REF_REGEX =
  /(?:(?:[1-3]|I{1,3})\s*)?[A-Za-z]+(?:\s+(?:of\s+)?[A-Za-z]+)?\s+\d+:\d+(?:[–\-]\d+)?/i;

function cleanMarkdown(str: string): string {
  if (!str) return "";
  return str
    .replace(/^[_*~"`“”'«»]+|[_*~"`“”'«»]+$/g, "")
    .replace(/^[-–—]\s*/, "")
    .replace(/\s*[-–—]$/, "")
    .trim();
}

function normalizeQuotes(str: string): string {
  if (!str) return "";
  return str
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

/**
 * Extracts and normalizes calendar dates into YYYY-MM-DD
 */
export function extractDate(text: string): { date?: string; matchedText?: string } {
  // Pattern 1: Natural date like "FRIDAY, OCTOBER 16, 2026" or "October 16th 2026"
  const monthNames = Object.keys(MONTH_MAP).join("|");
  const monthDayYear = new RegExp(
    `\\b(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})\\b`,
    "i"
  );
  const match1 = text.match(monthDayYear);
  if (match1) {
    const month = MONTH_MAP[match1[1].toLowerCase()];
    const day = parseInt(match1[2], 10);
    const year = parseInt(match1[3], 10);
    if (month && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
      const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return { date: iso, matchedText: match1[0] };
    }
  }

  // Pattern 2: Day Month Year like "16TH OCTOBER, 2026" or "16 October 2026"
  const dayMonthYear = new RegExp(
    `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${monthNames}),?\\s*(\\d{4})\\b`,
    "i"
  );
  const match2 = text.match(dayMonthYear);
  if (match2) {
    const day = parseInt(match2[1], 10);
    const month = MONTH_MAP[match2[2].toLowerCase()];
    const year = parseInt(match2[3], 10);
    if (month && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
      const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return { date: iso, matchedText: match2[0] };
    }
  }

  // Pattern 3: ISO YYYY-MM-DD
  const isoMatch = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return {
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        matchedText: isoMatch[0],
      };
    }
  }

  // Pattern 4: DD/MM/YYYY or DD-MM-YYYY or MM/DD/YYYY
  const slashMatch = text.match(/\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/);
  if (slashMatch) {
    const num1 = parseInt(slashMatch[1], 10);
    const num2 = parseInt(slashMatch[2], 10);
    const year = parseInt(slashMatch[3], 10);

    let day = num1;
    let month = num2;

    // Disambiguate day vs month
    if (num1 > 12 && num2 <= 12) {
      day = num1;
      month = num2;
    } else if (num2 > 12 && num1 <= 12) {
      day = num2;
      month = num1;
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
      return {
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        matchedText: slashMatch[0],
      };
    }
  }

  return {};
}

/**
 * Parses raw devotion text into structured fields.
 */
export function parseRawDevotion(rawText: string): ParsedDevotion {
  const result: ParsedDevotion = {
    series: "DAILY GRACE",
    title: "",
    scriptureRef: "",
    scriptureText: "",
    content: "",
    detectionStatus: {
      date: false,
      series: false,
      title: false,
      textRef: false,
      scriptureRef: false,
      scriptureText: false,
      content: false,
      prayer: false,
      bibleIn365Days: false,
      actionPoint: false,
    },
    isValid: false,
    missingRequired: [],
    warnings: [],
    wordCount: 0,
    paragraphCount: 0,
  };

  if (!rawText || !rawText.trim()) {
    result.missingRequired = [
      "Scheduled Date",
      "Devotion Title",
      "Verse Reference",
      "Verse Text",
      "Reflection Content",
    ];
    return result;
  }

  const normalizedInput = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = normalizedInput.split("\n");

  // Section Headers regex patterns
  const patterns = {
    textRef: /^\s*(?:TEXT|BIBLE\s+TEXT|SCRIPTURE\s+TEXT|SCRIPTURE\s+READING|PASSAGE|READING|TXT)\s*[:\-–—]\s*(.*)$/i,
    verse: /^\s*(?:VERSE\s+OF\s+THE\s+DAY|MEMORY\s+VERSE|KEY\s+VERSE|GOLDEN\s+VERSE|TODAY(?:'S)?\s+VERSE|SCRIPTURE\s+VERSE|FOCUS\s+VERSE|VERSE)\s*[:\-–—]?\s*(.*)$/i,
    prayer: /^\s*(?:PRAYER|PRAYER\s+POINT|PRAYER\s+POINTS|CLOSING\s+PRAYER|PRAY|TODAY(?:'S)?\s+PRAYER)\s*[:\-–—]?\s*(.*)$/i,
    bible365: /^\s*(?:BIBLE\s+IN\s+365\s+DAYS|BIBLE\s+IN\s+ONE\s+YEAR|ONE\s+YEAR\s+BIBLE(?:\s+READING)?|365\s+DAYS(?:\s+BIBLE\s+READING)?|BIBLE\s+IN\s+1\s+YEAR|DAILY\s+BIBLE\s+READING|365\s+DAYS)\s*[:\-–—]?\s*(.*)$/i,
    actionPoint: /^\s*(?:ACTION\s+POINT|ACTION\s+POINTS|ACTION\s+STEP|ACTION\s+STEPS|TODAY(?:'S)?\s+ACTION|MEMORY\s+POINT|PRACTICAL\s+POINT|REFLECTION\s+&\s+ACTION|TAKEAWAY)\s*[:\-–—]?\s*(.*)$/i,
    topicPrefix: /^\s*(?:TOPIC|THEME|TITLE)\s*[:\-–—]\s*(.*)$/i,
    seriesName: /(?:DAILY\s+GRACE(?:\s+DEVOTIONAL)?)/i,
  };

  // Find line indices where major sections start
  let textRefLineIdx = -1;
  let verseLineIdx = -1;
  let prayerLineIdx = -1;
  let bible365LineIdx = -1;
  let actionPointLineIdx = -1;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    if (textRefLineIdx === -1 && patterns.textRef.test(line)) {
      textRefLineIdx = i;
    } else if (verseLineIdx === -1 && patterns.verse.test(line)) {
      verseLineIdx = i;
    } else if (prayerLineIdx === -1 && patterns.prayer.test(line)) {
      prayerLineIdx = i;
    } else if (bible365LineIdx === -1 && patterns.bible365.test(line)) {
      bible365LineIdx = i;
    } else if (actionPointLineIdx === -1 && patterns.actionPoint.test(line)) {
      actionPointLineIdx = i;
    }
  }

  // 1. DATE & SERIES
  // Scan the first 5 lines for date and series name
  for (let i = 0; i < Math.min(5, rawLines.length); i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    if (!result.date) {
      const extracted = extractDate(line);
      if (extracted.date) {
        result.date = extracted.date;
        result.detectionStatus.date = true;
      }
    }

    if (patterns.seriesName.test(line)) {
      const match = line.match(patterns.seriesName);
      if (match) {
        result.series = match[0].toUpperCase();
        result.detectionStatus.series = true;
      }
    }
  }

  // 2. TEXT REF (Scripture Reading)
  if (textRefLineIdx !== -1) {
    const match = rawLines[textRefLineIdx].match(patterns.textRef);
    if (match && match[1]?.trim()) {
      result.textRef = cleanMarkdown(match[1].trim());
      result.detectionStatus.textRef = !!result.textRef;
    }
  }

  // 3. TITLE
  // The title typically sits between the date line and the TEXT or VERSE section.
  const upperLimit =
    textRefLineIdx !== -1
      ? textRefLineIdx
      : verseLineIdx !== -1
      ? verseLineIdx
      : Math.min(6, rawLines.length);

  for (let i = 0; i < upperLimit; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    // Check for explicit TOPIC: or THEME: label
    const topicMatch = line.match(patterns.topicPrefix);
    if (topicMatch && topicMatch[1]?.trim()) {
      result.title = cleanMarkdown(topicMatch[1].trim());
      result.detectionStatus.title = true;
      break;
    }

    // Skip the line if it was strictly the date/series header
    const hasDate = extractDate(line).date;
    const isSeriesOnly = /^DAILY\s+GRACE(?:\s+DEVOTIONAL)?[.,\s-]*$/i.test(line);
    if (hasDate || isSeriesOnly) continue;

    // A standalone title line
    if (!result.title && line.length >= 3) {
      result.title = cleanMarkdown(line);
      result.detectionStatus.title = true;
      break;
    }
  }

  // 4. VERSE OF THE DAY (scriptureRef & scriptureText)
  if (verseLineIdx !== -1) {
    const verseLines: string[] = [];
    const firstLineMatch = rawLines[verseLineIdx].match(patterns.verse);
    if (firstLineMatch && firstLineMatch[1]?.trim()) {
      verseLines.push(firstLineMatch[1].trim());
    }

    // Capture continuation lines until a blank line or start of next section
    for (let i = verseLineIdx + 1; i < rawLines.length; i++) {
      const l = rawLines[i].trim();
      if (!l) break; // blank line ends the verse block
      if (
        patterns.prayer.test(l) ||
        patterns.bible365.test(l) ||
        patterns.actionPoint.test(l) ||
        patterns.textRef.test(l)
      ) {
        break;
      }
      verseLines.push(l);
    }

    const fullVerseBlock = verseLines.join(" ").trim();
    if (fullVerseBlock) {
      // Check for reference in the block
      const refMatch = fullVerseBlock.match(BIBLE_REF_REGEX);
      if (refMatch) {
        result.scriptureRef = cleanMarkdown(refMatch[0].trim());
        result.detectionStatus.scriptureRef = true;

        // The text is the rest of the block minus the reference
        let cleanedText = fullVerseBlock.replace(refMatch[0], "").trim();
        // Clean leading/trailing quotes, dashes, underscores, parentheses
        cleanedText = cleanedText
          .replace(/^[_\s*"`“”'«»\-–—()]+|[_\s*"`“”'«»\-–—()]+$/g, "")
          .trim();
        cleanedText = normalizeQuotes(cleanedText);

        result.scriptureText = cleanedText;
        result.detectionStatus.scriptureText = !!cleanedText;
      } else {
        // Fallback: entire block as text, leave ref for manual entry
        result.scriptureText = cleanMarkdown(normalizeQuotes(fullVerseBlock));
        result.detectionStatus.scriptureText = !!result.scriptureText;
        result.warnings.push("Could not automatically separate scripture reference from verse text.");
      }
    }
  }

  // 5. CLOSING SECTIONS (Prayer, Bible in 365 Days, Action Point)
  // Identify the earliest closing section index
  const closingIndices = [prayerLineIdx, bible365LineIdx, actionPointLineIdx].filter(
    (idx) => idx !== -1
  );
  const firstClosingIdx =
    closingIndices.length > 0 ? Math.min(...closingIndices) : rawLines.length;

  // Helper to collect section lines
  const collectSectionContent = (
    startIdx: number,
    nextIndices: number[],
    pattern: RegExp
  ): string => {
    if (startIdx === -1) return "";
    const lines: string[] = [];
    const firstLineMatch = rawLines[startIdx].match(pattern);
    if (firstLineMatch && firstLineMatch[1]?.trim()) {
      lines.push(firstLineMatch[1].trim());
    }

    const nextSectionIdx = Math.min(
      ...nextIndices.filter((idx) => idx > startIdx),
      rawLines.length
    );

    for (let i = startIdx + 1; i < nextSectionIdx; i++) {
      const line = rawLines[i].trim();
      if (line) lines.push(line);
    }

    return lines.join("\n").trim();
  };

  const allIndices = [prayerLineIdx, bible365LineIdx, actionPointLineIdx];

  if (prayerLineIdx !== -1) {
    const prayerText = collectSectionContent(prayerLineIdx, allIndices, patterns.prayer);
    if (prayerText) {
      result.prayer = cleanMarkdown(prayerText.replace(/\n+/g, " "));
      result.detectionStatus.prayer = true;
    }
  }

  if (bible365LineIdx !== -1) {
    const b365Text = collectSectionContent(bible365LineIdx, allIndices, patterns.bible365);
    if (b365Text) {
      // Split into clean lines
      const cleanB365Lines = b365Text
        .split("\n")
        .map((l) => cleanMarkdown(l))
        .filter((l) => l.length > 0);
      result.bibleIn365Days = cleanB365Lines.join("\n");
      result.detectionStatus.bibleIn365Days = !!result.bibleIn365Days;
    }
  }

  if (actionPointLineIdx !== -1) {
    const apText = collectSectionContent(actionPointLineIdx, allIndices, patterns.actionPoint);
    if (apText) {
      result.actionPoint = cleanMarkdown(apText.replace(/\n+/g, " "));
      result.detectionStatus.actionPoint = true;
    }
  }

  // 6. DEVOTIONAL CONTENT (Body reflection paragraphs)
  // Everything between the end of Verse of the Day and firstClosingIdx
  let contentStartIdx = -1;
  if (verseLineIdx !== -1) {
    // Find where verse block ended
    for (let i = verseLineIdx + 1; i < firstClosingIdx; i++) {
      const l = rawLines[i].trim();
      if (!l) {
        // First non-empty line after blank is content start
        for (let j = i + 1; j < firstClosingIdx; j++) {
          if (rawLines[j].trim()) {
            contentStartIdx = j;
            break;
          }
        }
        break;
      }
    }
  }

  if (contentStartIdx === -1 && verseLineIdx !== -1) {
    contentStartIdx = verseLineIdx + 1;
  }

  if (contentStartIdx !== -1 && contentStartIdx < firstClosingIdx) {
    const contentLines: string[] = [];
    for (let i = contentStartIdx; i < firstClosingIdx; i++) {
      contentLines.push(rawLines[i]);
    }

    const rawContent = contentLines.join("\n").trim();
    // Normalize paragraphs: collapse 3+ newlines to 2, trim each line
    const cleanedParagraphs = rawContent
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter((p) => p.length > 0);

    result.content = cleanedParagraphs.join("\n\n");
    result.detectionStatus.content = result.content.length > 0;
    result.paragraphCount = cleanedParagraphs.length;
    result.wordCount = result.content ? result.content.split(/\s+/).length : 0;
  }

  // 7. VALIDATION
  const requiredChecks = [
    { name: "Scheduled Date", valid: !!result.date },
    { name: "Devotion Title", valid: !!result.title && result.title.length >= 2 },
    { name: "Verse Reference", valid: !!result.scriptureRef },
    { name: "Verse Text", valid: !!result.scriptureText },
    { name: "Reflection Content", valid: !!result.content && result.content.length >= 10 },
  ];

  result.missingRequired = requiredChecks
    .filter((c) => !c.valid)
    .map((c) => c.name);

  result.isValid = result.missingRequired.length === 0;

  return result;
}

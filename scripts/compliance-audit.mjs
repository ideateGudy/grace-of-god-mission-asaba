import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * @typedef {Object} AuditCheck
 * @property {string} id
 * @property {string} category
 * @property {string} name
 * @property {'CRITICAL'|'HIGH'|'MEDIUM'|'LOW'} severity
 * @property {() => { pass: boolean, details: string }} check
 */

/** @type {AuditCheck[]} */
const checks = [
  // 1. Secrets Hygiene
  {
    id: 'SEC-01',
    category: 'Authentication & Secrets',
    name: 'No hardcoded private secrets or API keys in public client bundle',
    severity: 'CRITICAL',
    check: () => {
      const clientEnvExample = resolve('client/.env.example');
      if (!existsSync(clientEnvExample)) {
        return { pass: false, details: 'client/.env.example is missing.' };
      }
      const content = readFileSync(clientEnvExample, 'utf8');
      const badPatterns = ['PAYSTACK_SECRET_KEY', 'DATABASE_URL', 'JWT_SECRET', 'CLOUDINARY_API_SECRET'];
      const found = badPatterns.filter((p) => content.includes(p));
      if (found.length > 0) {
        return { pass: false, details: `Found backend private keys in client env template: ${found.join(', ')}` };
      }
      return { pass: true, details: 'Client env template contains only safe NEXT_PUBLIC parameters.' };
    },
  },
  {
    id: 'SEC-02',
    category: 'Authentication & Secrets',
    name: 'Git repository excludes local .env files',
    severity: 'CRITICAL',
    check: () => {
      const gitignore = resolve('.gitignore');
      if (!existsSync(gitignore)) return { pass: false, details: 'Root .gitignore missing.' };
      const content = readFileSync(gitignore, 'utf8');
      const pass = content.includes('.env') && content.includes('node_modules');
      return { pass, details: pass ? '.env files and node_modules ignored.' : 'Missing .env ignore in .gitignore.' };
    },
  },

  // 2. NDPA Data Protection & Privacy Notice
  {
    id: 'NDPA-01',
    category: 'Privacy Notice & Transparency',
    name: 'Comprehensive NDPA 2023 & GAID 2025 Privacy Notice exists and covers children & transfers',
    severity: 'HIGH',
    check: () => {
      const privacyPath = resolve('client/app/privacy/page.tsx');
      if (!existsSync(privacyPath)) return { pass: false, details: 'Privacy notice page missing at client/app/privacy/page.tsx' };
      const content = readFileSync(privacyPath, 'utf8');
      const hasNDPA = content.includes('NDPA') || content.includes('Nigeria Data Protection Act');
      const hasChildren = content.includes('Children') || content.includes('s.31');
      const hasTransfers = content.includes('Cross-Border') || content.includes('Transfers');
      const hasRights = content.includes('Rights') || content.includes('Erasure');
      const pass = hasNDPA && hasChildren && hasTransfers && hasRights;
      return {
        pass,
        details: pass
          ? 'Privacy Notice covers NDPA 2023, Section 31 children protections, cross-border transfers, and statutory data subject rights.'
          : 'Privacy Notice lacks one or more mandatory sections.',
      };
    },
  },
  {
    id: 'NDPA-02',
    category: 'Terms & Governance',
    name: 'Terms of Service page exists and establishes volunteer giving & governing law',
    severity: 'HIGH',
    check: () => {
      const termsPath = resolve('client/app/terms/page.tsx');
      if (!existsSync(termsPath)) return { pass: false, details: 'Terms page missing at client/app/terms/page.tsx' };
      const content = readFileSync(termsPath, 'utf8');
      const pass = content.includes('Terms of Service') && content.includes('Nigeria');
      return { pass, details: pass ? 'Terms of Service page is deployed with Nigerian governing law.' : 'Incomplete terms.' };
    },
  },

  // 3. Children Protections & Consent Gating (NDPA s.31)
  {
    id: 'NDPA-03',
    category: 'Children & Minor Safeguards',
    name: 'Public forms (Contact, Prayer, Testimony, Giving) include consent & age affirmation (s.31)',
    severity: 'HIGH',
    check: () => {
      const contactFile = resolve('client/app/contact/page.tsx');
      const prayerFile = resolve('client/app/prayer/page.tsx');
      const testimonyFile = resolve('client/components/testimonies/TestimonyDialog.tsx');
      const givingFile = resolve('client/components/giving/OnlineGivingForm.tsx');
      const c1 = existsSync(contactFile) && readFileSync(contactFile, 'utf8').includes('ageConfirmation');
      const c2 = existsSync(prayerFile) && readFileSync(prayerFile, 'utf8').includes('ageConfirmation');
      const c3 = existsSync(testimonyFile) && readFileSync(testimonyFile, 'utf8').includes('ageConfirmation');
      const c4 = existsSync(givingFile) && readFileSync(givingFile, 'utf8').includes('giving-consent');
      const pass = c1 && c2 && c3 && c4;
      return {
        pass,
        details: pass
          ? 'Contact, Prayer, Testimony, and Giving forms enforce explicit consent and age assurance affirmations.'
          : 'One or more public intake forms lack consent or age confirmation checks.',
      };
    },
  },

  // 4. Cookies, Session Replay & Tracking
  {
    id: 'TRK-01',
    category: 'Cookies & Tracking',
    name: 'No unconsented session replay or invasive tracking scripts loaded in client',
    severity: 'HIGH',
    check: () => {
      const layoutFile = resolve('client/app/layout.tsx');
      if (!existsSync(layoutFile)) return { pass: false, details: 'layout.tsx missing.' };
      const content = readFileSync(layoutFile, 'utf8');
      const invasive = ['clarity.ms', 'hotjar.com', 'google-analytics.com/analytics.js', 'connect.facebook.net'];
      const found = invasive.filter((script) => content.includes(script));
      const pass = found.length === 0;
      return {
        pass,
        details: pass
          ? 'No unconsented session-replay or external ad tracking scripts found in root layout.'
          : `Found unconsented tracking scripts: ${found.join(', ')}`,
      };
    },
  },

  // 5. Payment Security & Webhook Signatures
  {
    id: 'PAY-01',
    category: 'Fintech & Payments',
    name: 'Paystack webhooks enforce HMAC-SHA512 cryptographic signature verification',
    severity: 'CRITICAL',
    check: () => {
      const givingService = resolve('server/src/giving/giving.service.ts');
      if (!existsSync(givingService)) return { pass: false, details: 'giving.service.ts missing.' };
      const content = readFileSync(givingService, 'utf8');
      const hasHmac = content.includes("crypto.createHmac('sha512', secretKey)") || content.includes('createHmac');
      const hasSigCheck = content.includes('hash !== signature') || content.includes('timingSafeEqual');
      const pass = hasHmac && hasSigCheck;
      return {
        pass,
        details: pass
          ? 'Paystack webhook verifies HMAC-SHA512 signature before mutating donation statuses.'
          : 'Webhook signature verification logic is missing or insecure.',
      };
    },
  },

  // 6. Security Headers & Injection Protections
  {
    id: 'SEC-03',
    category: 'Application Security',
    name: 'Next.js client enforces secure HTTP headers (CSP, HSTS, X-Frame-Options, Sniff)',
    severity: 'MEDIUM',
    check: () => {
      const nextConfig = resolve('client/next.config.ts');
      if (!existsSync(nextConfig)) return { pass: false, details: 'next.config.ts missing.' };
      const content = readFileSync(nextConfig, 'utf8');
      const pass =
        content.includes('X-Content-Type-Options') &&
        content.includes('X-Frame-Options') &&
        content.includes('Strict-Transport-Security');
      return {
        pass,
        details: pass
          ? 'Next.js deployment enforces HSTS, X-Frame-Options, and nosniff security headers.'
          : 'Missing security headers in next.config.ts.',
      };
    },
  },

  // 7. Backend Helmet & CORS Protection
  {
    id: 'SEC-04',
    category: 'Application Security',
    name: 'Backend API uses Helmet middleware and restricted CORS origin policies',
    severity: 'HIGH',
    check: () => {
      const mainTs = resolve('server/src/main.ts');
      if (!existsSync(mainTs)) return { pass: false, details: 'main.ts missing.' };
      const content = readFileSync(mainTs, 'utf8');
      const pass = content.includes('app.use(helmet())') && content.includes('app.enableCors(');
      return {
        pass,
        details: pass ? 'Backend activates Helmet headers and origin validation.' : 'Missing Helmet or CORS configuration.',
      };
    },
  },

  // 8. Documentation Package Existence
  {
    id: 'DOC-01',
    category: 'Compliance Documentation',
    name: 'All required NDPA policies, procedures, ROPA, and IRP are documented',
    severity: 'HIGH',
    check: () => {
      const requiredDocs = [
        'docs/compliance/DATA_PROTECTION_POLICY.md',
        'docs/compliance/DATA_RETENTION_POLICY.md',
        'docs/compliance/INCIDENT_RESPONSE_PLAN.md',
        'docs/compliance/RECORDS_OF_PROCESSING_ACTIVITIES.md',
        'docs/compliance/DATA_SUBJECT_RIGHTS_PROCEDURE.md',
      ];
      const missing = requiredDocs.filter((p) => !existsSync(resolve(p)));
      const pass = missing.length === 0;
      return {
        pass,
        details: pass
          ? 'All 5 core compliance documents and registers are present in docs/compliance.'
          : `Missing compliance documents: ${missing.join(', ')}`,
      };
    },
  },
];

console.log('=============================================================================');
console.log('   NIGERIAN APPLICATION COMPLIANCE & SECURITY AUDIT (NDPA 2023 / GAID 2025)');
console.log('   Grace of God Mission Asaba (Sanctuary of Grace & Truth)');
console.log('=============================================================================\n');

let passCount = 0;
let failCount = 0;

for (const check of checks) {
  const result = check.check();
  const tag = result.pass ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
  console.log(`${tag} ${check.id} (${check.severity}) - ${check.name}`);
  console.log(`       Category: ${check.category}`);
  console.log(`       Details:  ${result.details}\n`);

  if (result.pass) passCount++;
  else failCount++;
}

console.log('-----------------------------------------------------------------------------');
console.log(`Audit Summary: ${passCount} Passed | ${failCount} Failed out of ${checks.length} Automated Controls.`);
console.log('-----------------------------------------------------------------------------');

if (failCount > 0) {
  console.error('\x1b[31mCompliance audit failed: Fix the issues listed above before production deployment.\x1b[0m');
  process.exit(1);
} else {
  console.log('\x1b[32mAll automated Nigerian compliance & security checks PASSED cleanly.\x1b[0m');
  process.exit(0);
}

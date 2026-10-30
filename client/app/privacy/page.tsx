import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageLayout } from "@/components/shared/PublicPageLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { siteConfig } from "@/config/site";
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, FileText, Lock, Globe, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Notice & Data Protection | Grace of God Mission Asaba",
  description:
    "Official NDPA 2023 & GAID 2025 compliant privacy policy and data protection declaration for Grace of God Mission Asaba.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "30 October 2026";

  return (
    <PublicPageLayout
      title="Privacy Notice & Data Protection"
      description="How Grace of God Mission Asaba collects, protects, uses, and respects personal data in full alignment with the Nigeria Data Protection Act (NDPA) 2023 and GAID 2025."
      eyebrow="Data Protection & Privacy · NDPA 2023 Compliant"
    >
      <div className="max-w-4xl mx-auto space-y-10">
        <GlassCard surface="strong" padding="lg" className="border border-border shadow-xl space-y-8">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-6 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">Data Controller: Grace of God Mission Asaba</p>
              <p>Physical Location: 33 Arthur Richard Street, Akwuebulu (Cable Point), Asaba, Delta State, Nigeria</p>
            </div>
            <div className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 font-semibold text-primary">
              Last Updated: {lastUpdated}
            </div>
          </div>

          {/* 1. Core Commitment */}
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span>1. Our Commitment to Your Privacy</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Grace of God Mission Asaba (&quot;the Church&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to honoring and protecting the privacy of members, visitors, donors, and inquirers who interact with our ministry through this website and digital platforms. This Privacy Notice describes our practices under the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and the <strong>General Application and Implementation Directive (GAID) 2025</strong> issued by the Nigeria Data Protection Commission (NDPC).
            </p>
          </section>

          {/* 2. Personal Data We Collect */}
          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold text-foreground">
              2. Personal Data We Collect &amp; Processing Activities
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We apply strict <em>data minimisation</em> principles (NDPA s.24(1)(c)). We only collect information that is strictly necessary for pastoral care, ministry communication, transaction fulfillment, and community connection:
            </p>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Contact Inquiries</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Data:</strong> Full Name, Email Address, Phone Number, and Message text.<br />
                  <strong>Purpose:</strong> To reply to inquiries, provide information on service schedules, and provide pastoral assistance.<br />
                  <strong>Lawful Basis:</strong> Consent (NDPA s.25(1)(a)) and Legitimate Ministry Interest (s.25(1)(f)).
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-primary" />
                  <span>Prayer Petitions &amp; Wall</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Data:</strong> Prayer petition text; Name, Email, and Phone number are strictly optional.<br />
                  <strong>Purpose:</strong> Pastoral intercession. Requests shared to the Community Prayer Wall are <em>completely anonymised</em>.<br />
                  <strong>Lawful Basis:</strong> Explicit Consent (NDPA s.25 &amp; s.30).
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Praise Reports &amp; Testimonies</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Data:</strong> Title, Testimony story, Author Name, optional Phone/Email.<br />
                  <strong>Purpose:</strong> Community encouragement and thanksgiving. Donors can select &quot;Keep Anonymous&quot;.<br />
                  <strong>Lawful Basis:</strong> Explicit Consent (NDPA s.25).
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Giving &amp; Project Stewardship</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Data:</strong> Donor Name, Donor Email, Donor Phone (optional), Amount, Transaction Reference.<br />
                  <strong>Payment Processing:</strong> Card numbers, bank logins, and BVN/PIN credentials are processed <em>exclusively</em> by <strong>Paystack Payments Limited</strong> (CBN-licensed PCI-DSS Level 1 Processor). The Church never sees or stores card numbers or bank credentials.<br />
                  <strong>Lawful Basis:</strong> Contractual &amp; Ministry Stewardship Fulfillment (NDPA s.25(1)(b)).
                </p>
              </div>
            </div>
          </section>

          {/* 3. Children's Privacy (NDPA s.31) */}
          <section className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gold" />
              <span>3. Children&apos;s Privacy Protection (NDPA s.31)</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Under Section 31 of the Nigeria Data Protection Act 2023, a child is defined as any individual under the age of 18.
            </p>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5 leading-relaxed">
              <li>Our website does not intentionally solicit, collect, or store personal data from individuals under 18 years of age without verified parental or legal guardian consent.</li>
              <li>Public forms (testimony submissions, online contact, and prayer petitions) require confirmation that the submitter is 18 years or older, or submitting with the guidance and consent of a parent or guardian.</li>
              <li>If we discover that personal data of a minor has been collected without verified parental authorization, we will immediately take steps to permanently delete the information from our servers.</li>
            </ul>
          </section>

          {/* 4. Cookies and Web Analytics */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              4. Cookies, Tracking &amp; Analytics
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We respect your digital sovereignty. In compliance with the NDPA and GAID 2025 guidelines:
            </p>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-5 leading-relaxed">
              <li><strong>Strictly Necessary Cookies:</strong> We only set essential HTTP session cookies for authorized administrative portal logins (using secure, HTTP-only, SameSite attributes).</li>
              <li><strong>Zero Behavioral Tracking:</strong> We do <em>not</em> run invasive session replay tools (such as Hotjar or Microsoft Clarity) that record your screen, mouse movements, or keystrokes.</li>
              <li><strong>No Third-Party Ad Pixels:</strong> We do not deploy Meta/Facebook advertising pixels or Google Tag Manager marketing trackers on this website.</li>
              <li><strong>Self-Contained Fonts &amp; Assets:</strong> Typography and styling are bundled to prevent unwarranted telemetry leaks to international third parties.</li>
            </ul>
          </section>

          {/* 5. International Data Transfers (NDPA s.41-43) */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              5. Third-Party Service Processors &amp; Cross-Border Transfers
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When third-party technology infrastructure is required to deliver church broadcasts and secure services, transfers are executed under strict contractual safeguards (Data Processing Agreements) pursuant to NDPA Sections 41–43:
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• <strong>Paystack Payments Limited (Nigeria):</strong> Secure payment gateway operations for freewill offerings and projects.</p>
              <p>• <strong>Vercel Inc. &amp; Render Services:</strong> Global edge content delivery network and encrypted application runtime.</p>
              <p>• <strong>Cloudinary:</strong> Media CDN for event flyers and church image galleries.</p>
              <p>• <strong>YouTube / Google Video:</strong> Embedded video broadcast streams using Privacy-Enhanced Mode (<code>youtube-nocookie.com</code>).</p>
            </div>
          </section>

          {/* 6. Data Retention Schedule (NDPA s.24) */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              6. Data Retention Schedule
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do not retain personal information indefinitely:
            </p>
            <div className="rounded-xl border border-border/80 overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/50 border-b border-border/80 text-foreground font-semibold">
                  <tr>
                    <th className="p-3">Data Category</th>
                    <th className="p-3">Retention Period</th>
                    <th className="p-3">Post-Retention Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-muted-foreground">
                  <tr>
                    <td className="p-3 font-medium text-foreground">Contact Inquiries</td>
                    <td className="p-3">6 months after resolution</td>
                    <td className="p-3">Permanent deletion</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Prayer Requests</td>
                    <td className="p-3">90 days after prayer period</td>
                    <td className="p-3">Permanent deletion or de-identification</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Financial &amp; Giving Records</td>
                    <td className="p-3">6 years (Nigerian tax &amp; financial compliance)</td>
                    <td className="p-3">Secure archival in accordance with financial regulations</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Security Audit Logs</td>
                    <td className="p-3">12 months</td>
                    <td className="p-3">Automated log purge</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. Your Statutory Rights (NDPA s.34-40) */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              7. Your Rights Under Nigerian Law
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Under Part VI of the NDPA 2023, you possess the following statutory rights regarding your personal information:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-5 leading-relaxed">
              <li><strong>Right to be Informed:</strong> Transparent notice regarding what data is collected and why.</li>
              <li><strong>Right of Access:</strong> Request a copy of the personal information we hold concerning you.</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate, misleading, or incomplete data.</li>
              <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request permanent deletion of your data when retention is no longer justified.</li>
              <li><strong>Right to Restrict or Object:</strong> Object to processing on legitimate grounds or withdraw consent at any time without detriment.</li>
            </ul>
          </section>

          {/* 8. Exercising Rights & DPO Contact */}
          <section className="space-y-3 border-t border-border/80 pt-6">
            <h2 className="font-display text-xl font-bold text-foreground">
              8. Contact Our Data Protection Team &amp; Regulatory Escalation
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To exercise any of your data protection rights, make an inquiry, or report a suspected privacy concern, please contact our administrative office:
            </p>
            <div className="rounded-xl border border-border bg-card p-4 space-y-1.5 text-xs text-muted-foreground">
              <p><strong>Church Administration &amp; Data Protection Officer:</strong> Grace of God Mission Asaba</p>
              <p><strong>Email:</strong> <a href="mailto:info@ggmasaba.org" className="text-primary underline">info@ggmasaba.org</a> / <a href="mailto:privacy@ggmasaba.org" className="text-primary underline">privacy@ggmasaba.org</a></p>
              <p><strong>Phone:</strong> <a href="tel:+2349075602319" className="text-primary underline">+234 907 560 2319</a></p>
              <p><strong>Postal Address:</strong> No. 33 Arthur Richard Street, Akwuebulu (Cable Point), Asaba, Delta State, Nigeria</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-2">
              If you believe your rights under the Nigeria Data Protection Act have not been satisfactorily addressed, you have the right to lodge a complaint with the <strong>Nigeria Data Protection Commission (NDPC)</strong> at <a href="https://ndpc.gov.ng" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">ndpc.gov.ng</a>.
            </p>
          </section>
        </GlassCard>
      </div>
    </PublicPageLayout>
  );
}

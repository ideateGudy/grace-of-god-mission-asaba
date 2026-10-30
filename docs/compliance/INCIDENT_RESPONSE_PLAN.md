# DATA BREACH & INCIDENT RESPONSE PLAN
## Grace of God Mission Asaba

**Document ID:** GGM-SEC-IRP-003  
**Effective Date:** 30 October 2026  
**Governing Standard:** NDPA 2023 s.40, Cybercrimes Act 2015/2024, GAID 2025

---

### 1. OBJECTIVE
This Incident Response Plan (IRP) defines the required steps when a suspected or confirmed security breach, data leak, unauthorized access, or loss of personal data occurs within any system operated by Grace of God Mission Asaba.

---

### 2. INCIDENT CLASSIFICATION

| Level | Severity | Description | Examples | Escalation |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | **Critical** | Large-scale unauthorized data exposure, admin credential compromise, database leak, financial webhook tampering. | Public dump of database, admin account takeover with full permissions, Paystack secret compromise. | Immediate emergency meeting; notify NDPC within **72 hours**; notify affected users without delay. |
| **P2** | **High** | Restricted personal data accessed or altered without authorization; isolated account compromise. | Unauthorized viewing of unmoderated prayer or contact requests; single admin account compromised. | Contain within 2 hours; forensic review; assess notification criteria within 24 hours. |
| **P3** | **Medium** | Service disruption, brute force attempts detected, rate limiting violations. | DDoS attempt mitigated, blocked SQL injection attempts. | Technical lead containment; patch and monitor. |
| **P4** | **Low** | Benign policy violation, low-risk false alarm, isolated spam submission. | Spam bot submission caught by honeypot. | Routine log and review. |

---

### 3. THE 5-STEP RESPONSE LIFECYCLE

#### Phase 1: Identification & Escalation
- Any staff member, developer, or user detecting suspicious activity must immediately notify the Incident Response Lead at `privacy@ggmasaba.org` or `info@ggmasaba.org`.
- Technical alerts: Monitor server error logs, sudden surges in 401/403 responses, or unusual administrative logins.

#### Phase 2: Containment & Isolation (Within 2 Hours)
- **Credential Revocation:** Immediately rotate compromised JWT secrets, API tokens, Paystack keys, or Cloudinary credentials.
- **Session Termination:** Invalidate all active administrative sessions by incrementing `tokenVersion` in the `AdminUser` table.
- **Service Isolation:** If necessary, temporarily put affected endpoints into maintenance mode.
- **Evidence Preservation:** Take server log snapshots before restarting or modifying systems.

#### Phase 3: Investigation & Risk Assessment
- Determine:
  1. What personal data was accessed or exfiltrated?
  2. How many data subjects are impacted?
  3. Are financial credentials involved? (Note: Payment cards are handled offsite by Paystack, reducing cardholder exposure risk).
  4. Is there a likely risk to the rights, freedoms, reputation, or safety of the data subjects?

#### Phase 4: Statutory Notification (Within 72 Hours)
- **Notification to NDPC (NDPA s.40(2)):**  
  Where the breach is likely to result in a risk to the rights and freedoms of individuals, the Church **must notify the Nigeria Data Protection Commission within 72 hours** of becoming aware.
  - *Email:* `info@ndpc.gov.ng` / `complaints@ndpc.gov.ng`
  - *Content:* Nature of breach, categories of data, estimated number of individuals, likely consequences, measures taken or proposed to mitigate harm, contact details of the DPO.
- **Notification to Data Subjects (NDPA s.40(3)):**  
  Where the breach presents a **high risk**, communicate the breach in plain, clear language directly to affected individuals without undue delay. Include recommended protective steps (e.g., password reset).

#### Phase 5: Recovery, Remediation & Post-Incident Review
- Deploy code-level or configuration patches to prevent recurrence.
- Add regression tests to automated CI pipeline.
- Conduct a post-mortem review within 7 days and document findings in the internal Incident Register.

---

### 4. EMERGENCY CONTACT DIRECTORY

- **Incident Response Lead / DPO:** Church Administration Lead
- **Technical Lead / Senior Developer:** Lead Systems Engineer
- **Lead Pastor / Pastoral Oversight:** Head Pastor, Asaba Division
- **Payment Gateway Partner Support:** Paystack Merchant Security (`support@paystack.com`)
- **Regulator:** Nigeria Data Protection Commission (NDPC), Abuja (`https://ndpc.gov.ng`)

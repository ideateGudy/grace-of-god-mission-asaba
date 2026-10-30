# DATA RETENTION & DISPOSAL SCHEDULE
## Grace of God Mission Asaba

**Document ID:** GGM-DPO-SCH-002  
**Effective Date:** 30 October 2026  
**Governing Standard:** NDPA 2023 s.24(1)(d), GAID 2025

---

### 1. Retention Principles
Personal data is retained only for the duration necessary to fulfill the specific purposes for which it was gathered, unless a longer statutory retention period is mandated by Nigerian law.

### 2. Retention Schedule Matrix

| Data Category | Business & Ministry Purpose | Lawful Basis | Storage Location | Retention Period | Destruction / Anonymisation Procedure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Contact Inquiries** | Follow up on visitor requests, service schedule info | Consent (s.25(1)(a)) / Legitimate Interest | PostgreSQL Database (`ContactMessage`) | **6 months** after resolution | Hard delete from database via automated cleanup job or administrative review |
| **Prayer Petitions** | Pastoral intercession by prayer warriors | Explicit Consent (s.25(1)(a) & s.30) | PostgreSQL Database (`PrayerRequest`) | **90 days** from date of submission | Permanent deletion or de-identification |
| **Prayer Wall Public Items** | Encouragement on community prayer wall | Explicit Consent (s.25(1)(a)) | PostgreSQL Database (`PrayerRequest`) | Active on wall while relevant; max **180 days** | Retained with donor name/phone/email set to null (fully anonymous) |
| **Praise Reports / Testimonies** | Public celebration of God's faithfulness | Explicit Consent (s.25(1)(a)) | PostgreSQL Database (`Testimony`) | Indefinite until author requests removal or after **2 years** inactivity | Upon retraction request: immediate deletion or permanent pseudonymisation |
| **Donations & Financial Records** | Issuing receipts, accounting, audit, tax | Legal Obligation / Contract (s.25(1)(b)) | PostgreSQL Database (`Contribution`) | **6 years** | Cryptographically secure archival pursuant to Nigerian financial & tax requirements |
| **Admin User Accounts** | Portal administration, content management | Contract / Employment | PostgreSQL Database (`AdminUser`) | Active tenure + **30 days** post departure | Account deactivated immediately; credentials revoked, tokenVersion bumped |
| **Security Audit Logs** | Forensic security tracking, accountability | Legal Obligation / Cybersecurity | PostgreSQL Database (`AuditLog`) | **12 months** | Automated deletion of records older than 365 days |
| **Media Uploads (Images/Flyers)** | Gallery display, sermon flyers | Consent / Legitimate Interest | Cloudinary CDN | Maintained while relevant to active site content | Periodic purge of orphaned or superseded media assets |

---

### 3. Deletion and Disposal Procedures
1. **Electronic Database Records:** Executed via Prisma ORM cascade deletion or secure SQL wipe.
2. **Server Logs:** Automated rotation with 14-day local log expiration and 12-month consolidated audit retention.
3. **Backup Sanitization:** Database backups adhere to a 30-day snapshot rotation. Deleted records naturally cycle out of incremental backups within 30 days.

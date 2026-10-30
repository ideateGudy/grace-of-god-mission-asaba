# RECORD OF PROCESSING ACTIVITIES (ROPA)
## Grace of God Mission Asaba

**Document ID:** GGM-DPO-ROPA-004  
**Governing Standard:** Nigeria Data Protection Act (NDPA) 2023 s.24(1)(f), GAID 2025  
**Data Controller:** Grace of God Mission Asaba  
**Address:** 33 Arthur Richard Street, Akwuebulu (Cable Point), Asaba, Delta State, Nigeria  
**Contact:** `info@ggmasaba.org` · `privacy@ggmasaba.org` · `+234 907 560 2319`

---

### Record Summary

| ID | Processing Activity | Purpose | Data Categories | Data Subjects | Lawful Basis | Storage Location & System | Retention | Recipients & Processors | Security Safeguards |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PA-01** | **Contact Inquiries** | Follow up on visitor requests, service schedule questions | Name, Email, Phone, Inquiry message, IP address | General public, visitors | Consent (s.25(1)(a)) & Legitimate Interest | PostgreSQL (`ContactMessage`) | 6 months post resolution | Church Administration Office | TLS 1.3 in transit, bcrypt hashed passwords, role-based access control (RBAC), honeypot antispam |
| **PA-02** | **Prayer Petitions** | Pastoral intercession by prayer warriors | Petition text, optional Name, optional Email/Phone | Church members, inquirers | Explicit Consent (s.25(1)(a) & s.30) | PostgreSQL (`PrayerRequest`) | 90 days | Designated pastoral intercessors | Strict role-based isolation (`PRAYER_INBOX`); public prayer wall completely strips names and contact details |
| **PA-03** | **Praise Reports / Testimonies** | Encouragement and edification of church congregation | Testimony title & content, Author Name, optional Phone/Email | Church members, testifiers | Explicit Consent (s.25(1)(a)) | PostgreSQL (`Testimony`) | Active while relevant (up to 2 years) | Congregation & public website visitors | Editorial review prior to publication; anonymous publishing option supported |
| **PA-04** | **Online Giving & Tithes** | Voluntary donation processing, receipt generation, project support | Donor Name, Email, Phone, Amount (Kobo), Paystack Ref | Donors, church partners | Contract / Ministry Stewardship (s.25(1)(b)) | PostgreSQL (`Contribution`) | 6 years (financial compliance) | Church Finance Committee, Paystack Payments Ltd | HMAC-SHA512 webhook signature verification; zero local storage of debit card credentials |
| **PA-05** | **Admin Portal Management** | Content management, live streaming, event moderation | Full Name, Email, Password Hash, Role, Permissions, 2FA Secret | Staff, pastors, media administrators | Employment / Ministry Appointment | PostgreSQL (`AdminUser`) | Active service + 30 days | System Administrators, Super Admins | Bcrypt (12 rounds) hashing, JWT authentication (HttpOnly SameSite cookies), TOTP 2FA, session invalidation via `tokenVersion` |
| **PA-06** | **Security Auditing** | Forensic tracking, incident investigation, access monitoring | Admin User ID, User Name, Action performed, Target entity, IP/meta | Administrative users | Legal Obligation & Security | PostgreSQL (`AuditLog`) | 12 months | System Administrators, Audit Committee | Tamper-resistant append-only audit log, redaction of sensitive credentials and cookies in HTTP logs |

---

### Cross-Border Data Transfer Register (NDPA s.41–43)

| Processor / Vendor | Service Provided | Transfer Destination | Data Transferred | Transfer Safeguard Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **Paystack Payments Ltd** | Payment Processing | Nigeria | Donor Email, Name, Amount | Nigerian licensed entity (CBN-licensed); Domestic processing |
| **Vercel Inc.** | Frontend Hosting & Edge CDN | Global Edge Nodes / USA | IP address, HTTP headers | Standard Contractual Clauses (SCCs), Enterprise DPA, Privacy Shield |
| **Render Services** | Backend Container Runtime | Frankfurt (EU) / Oregon (USA) | Application database traffic | Standard Contractual Clauses (SCCs), Encrypted database in transit |
| **Cloudinary Inc.** | Media Asset CDN | USA / Global CDN | Uploaded flyers & photographs | Standard Contractual Clauses (SCCs), strict permission-signed uploads |
| **YouTube (Google LLC)** | Broadcast Streaming | Global | Visitor IP, device headers (via embed) | Privacy-Enhanced Mode (`youtube-nocookie.com`), explicit informed notice |

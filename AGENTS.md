# ZivoHR — Architectural Blueprint & Security Standards

## Overview
ZivoHR is a high-integrity Payroll and HR Management system tailored for the Zimbabwean market. It utilizes a multi-tenant architecture where each Company is an isolated tenant.

## The Skyscraper Roadmap (Sprint-by-Sprint)

### Sprint 1: Foundations & Multi-tenancy [COMPLETED]
- **Floor 1: Core Identity** – [100%] Supabase Auth + user_profiles. *Status: Hardened with email verification flows.*
- **Floor 2: Company Tenancy** – [100%] Multi-tenant isolation. *Status: Wizard-based workspace setup with seed data.*
- **Onboarding Walkthrough** – [100%] Guided experience. *Status: Success Checklist (GettingStarted) integrated into dashboard.*

### Sprint 2: The HR Core [COMPLETED]
- **Floor 3: Employee Management** – [100%] Profiles & Hierarchies. *Status: Enhanced profiles with Contract End Dates & Functional Hierarchy visuals.*
- **Floor 4: Leave & Attendance** – [100%] Accruals & Logs. *Status: Custom employee accrual rates integrated perfectly. Expiry alerts live on Dashboard. Attendance deferred by request.*

### Sprint 3: The Engine [COMPLETED]
- **Floor 5: Payroll Engine** – [100%] ZIMRA/NSSA + Custom Deductions. *Status: Hardened with Maker-Checker (Reject/Clone/Edit workflows), 50% Deduction Cap, and central ZiG conversion rates.*
- **Floor 6: Document Vault** – [100%] Two-Way Storage. *Status: Multi-party uploads enabled with role-based access and hardened zip downloads.*
- **Compliance Shield**: [100%] - Contract Expiry Radar & Statutory validation active.

### Sprint 4: Performance & Operational Excellence [COMPLETED]
- **Floor 7: Performance Hub** – [100%] Appraisals & 360 Reviews. *Status: Multi-party feedback, IDP Roadmaps, and PDF exports hardened.*
- **Floor 8: The Treasury (Bank Exports)** – [100%] CABS & Generic Bank Export Engine. *Status: Dynamic mapper, split USD/ZiG disbursements, and Cash Schedules live.*
- **Floor 9: Asset & IT Shield** – [100%] Hardware tracking & Lifecycle. *Status: Bulk CSV Importer, Maintenance Logs, and Invoice Vault active.*
- **Floor 10: Recruitment & Onboarding** – [100%] Applicant tracking & job portal. *Status: Public careers portal, custom application fields, and automated onboarding tasks (NDA/Laptop/Banking) fully active.*

### Sprint 5: Final Polish & UX Excellence [IN PROGRESS]
- **Floor 11: The Dark Dimension** – [100%] Dark mode consistency. *Status: All cards and dashboards updated with adaptive theme-aware styling.*
- **Floor 12: Mobile Optimization** – [100%] Responsive precision. *Status: Fully adaptive layout from 320px to 4k with touch-optimized targets.*
- **Floor 13: Integrated Documentation** – [100%] Help Center. *Status: Self-service documentation and Zimbabwean Labor Case Library accessible from within the app.*
- **Floor 14: Internationalization & Localization** – [100%] Multi-language support. *Status: English, Shona, Ndebele, Chinese, and Afrikaans integration live with sidebar selector.*
- **Compliance Radar**: [100%] Real-time expiry alerts integrated on main Dashboard.

## Security Standards
- **Zero-Trust RLS**: Every table must have RLS enabled. No blanket reads.
- **Identity Integrity**: `authorId` or `ownerId` must match `request.auth.uid`.
- **Payroll Integrity**: Maker-Checker mandatory—users cannot approve their own payroll runs. HR must approve before employees can view payslips.
- **Leaked Document Shield**: Employees can only access their individual payslips AFTER a payroll run is marked as 'Paid'.
- **System immutability**: Sensitive fields (like total salary in past payroll runs) must be protected from direct client updates once finalized.
- **Anonymous Feedback**: Performance feedback must support `is_anonymous` flags to protect peer reviewers.

## Implementation Rules
- Always use the `performanceService` for any logic related to appraisals.
- PDF generation must follow the "Professional HR Standard" (Clear headers, legal disclaimers, ZivoHR branding).
- All new components must be placed in `src/components` and use Tailwind CSS for styling.
- **Theme Awareness**: All components must support both Light and Dark modes using the `useTheme` context and `dark:` tailwind prefixes.
- **Visual Visuals**: Prefer `FeatureVisual` components (SVG + Motion) over static images for marketing and empty states.
- **Logo Integrity**: Use the centralized `Logo` component for branding. Never replace it with text-only placeholders in high-visibility areas.
- **Motion standard**: Use `motion/react` for entry animations (fade-in-up) and interactive hover states to ensure a "premium" feel.

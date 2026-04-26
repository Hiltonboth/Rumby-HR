-- =============================================================
-- ZivoHR — The Grand Skyscraper Schema (v2.0)
-- Optimized for Zimbabwe & Multi-Tenant Security
-- Covers Floors 1-15: Auth, Payroll, Assets, Training, Community
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 1. COMPANIES (The Tenant)
-- =============================================================
CREATE TABLE IF NOT EXISTS companies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  logo_url        TEXT,
  industry        TEXT,
  country         TEXT NOT NULL DEFAULT 'Zimbabwe',
  currency        TEXT NOT NULL DEFAULT 'USD',
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  website         TEXT,
  size_range      TEXT,
  nec_sector      TEXT,
  nssa_registered BOOLEAN DEFAULT TRUE,
  zimra_bp_number TEXT,
  accent_color    TEXT DEFAULT '#007AFF',
  plan            TEXT NOT NULL DEFAULT 'pro',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 2. USER PROFILES (Supabase Auth Link)
-- =============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'employee', -- 'owner' | 'admin' | 'hr' | 'manager' | 'employee'
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 3. DEPARTMENTS
-- =============================================================
CREATE TABLE IF NOT EXISTS departments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  head_id         UUID, -- Reference set after employees table
  parent_id       UUID REFERENCES departments(id),
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 4. EMPLOYEES (Core HR)
-- =============================================================
CREATE TABLE IF NOT EXISTS employees (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  whatsapp_number     TEXT,
  national_id         TEXT,
  date_of_birth       DATE,
  gender              TEXT,
  marital_status      TEXT,
  address             TEXT,
  avatar_url          TEXT,
  employee_number     TEXT,
  department_id       UUID REFERENCES departments(id) ON DELETE SET NULL,
  job_title           TEXT,
  employment_type     TEXT DEFAULT 'full_time',
  start_date          DATE NOT NULL,
  end_date            DATE,
  status              TEXT DEFAULT 'active', -- active, on_leave, terminated, suspended
  manager_id          UUID REFERENCES employees(id) ON DELETE SET NULL,
  basic_salary        NUMERIC(12,2) DEFAULT 0,
  pay_frequency       TEXT DEFAULT 'monthly',
  bank_name           TEXT,
  bank_account        TEXT,
  bank_branch         TEXT,
  nssa_number         TEXT,
  tax_number          TEXT,
  nec_grade           TEXT,
  nec_category        TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, employee_number)
);

-- Link department head back to employees
ALTER TABLE departments ADD CONSTRAINT fk_head FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL;

-- =============================================================
-- 5. LEAVE & ATTENDANCE
-- =============================================================
CREATE TABLE IF NOT EXISTS leave_types (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id       UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  annual_allowance INT NOT NULL DEFAULT 30,
  is_accruable     BOOLEAN DEFAULT TRUE,
  accrual_rate     NUMERIC(4,2) DEFAULT 2.50,
  is_paid          BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leave_balances (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id   UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year            INT NOT NULL,
  balance         NUMERIC(5,2) DEFAULT 0,
  used            NUMERIC(5,2) DEFAULT 0,
  pending         NUMERIC(5,2) DEFAULT 0,
  last_accrued_at TIMESTAMPTZ,
  UNIQUE(employee_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id   UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  total_days      NUMERIC(4,1) NOT NULL,
  reason          TEXT,
  status          TEXT DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_by     UUID REFERENCES employees(id),
  rejection_note  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in        TIMESTAMPTZ,
  clock_out       TIMESTAMPTZ,
  location_in     TEXT,
  location_out    TEXT,
  method          TEXT DEFAULT 'button', -- button, qr, biometrics
  status          TEXT DEFAULT 'present',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- =============================================================
-- 6. PAYROLL ENGINE (Zimbabwe Specs)
-- =============================================================
CREATE TABLE IF NOT EXISTS payroll_runs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period_month   INT NOT NULL,
  period_year    INT NOT NULL,
  status         TEXT DEFAULT 'draft', -- draft, processing, approved, paid
  run_date       DATE,
  total_gross    NUMERIC(14,2) DEFAULT 0,
  total_net      NUMERIC(14,2) DEFAULT 0,
  total_paye     NUMERIC(14,2) DEFAULT 0,
  total_nssa     NUMERIC(14,2) DEFAULT 0,
  created_by     UUID REFERENCES user_profiles(id),
  approved_by    UUID REFERENCES user_profiles(id),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, period_month, period_year)
);

CREATE TABLE IF NOT EXISTS payslips (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id          UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  payroll_run_id      UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id         UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  basic_salary        NUMERIC(12,2) DEFAULT 0,
  overtime_pay        NUMERIC(12,2) DEFAULT 0,
  housing_allowance   NUMERIC(12,2) DEFAULT 0,
  transport_allowance NUMERIC(12,2) DEFAULT 0,
  other_allowances    NUMERIC(12,2) DEFAULT 0,
  gross_pay           NUMERIC(12,2) DEFAULT 0,
  paye                NUMERIC(12,2) DEFAULT 0,
  nssa_employee       NUMERIC(12,2) DEFAULT 0,
  nssa_employer       NUMERIC(12,2) DEFAULT 0,
  aids_levy           NUMERIC(12,2) DEFAULT 0,
  pension             NUMERIC(12,2) DEFAULT 0,
  other_deductions    NUMERIC(12,2) DEFAULT 0,
  total_deductions    NUMERIC(12,2) DEFAULT 0,
  net_pay             NUMERIC(12,2) DEFAULT 0,
  pdf_url             TEXT,
  email_sent          BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 7. DOCUMENTS & eSIGNATURE
-- =============================================================
CREATE TABLE IF NOT EXISTS employee_documents (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id    UUID REFERENCES employees(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  category       TEXT NOT NULL, -- contract, payslip, id, qualification, policy
  file_url       TEXT NOT NULL,
  expiry_date    DATE,
  is_private     BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signature_envelopes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  status          TEXT DEFAULT 'draft', -- draft, sent, signed, cancelled
  file_url        TEXT NOT NULL,
  signed_file_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signature_recipients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  envelope_id     UUID NOT NULL REFERENCES signature_envelopes(id) ON DELETE CASCADE,
  employee_id     UUID REFERENCES employees(id) ON DELETE SET NULL,
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  status          TEXT DEFAULT 'pending', -- pending, viewed, signed, declined
  signed_at       TIMESTAMPTZ,
  signature_data  TEXT,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 8. RECRUITMENT & ONBOARDING
-- =============================================================
CREATE TABLE IF NOT EXISTS job_postings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  department_id   UUID REFERENCES departments(id),
  description     TEXT,
  requirements    TEXT,
  location        TEXT,
  job_type        TEXT DEFAULT 'full_time',
  status          TEXT DEFAULT 'open',
  posted_by       UUID REFERENCES user_profiles(id),
  deadline        DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applicants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_posting_id  UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  resume_url      TEXT,
  stage           TEXT DEFAULT 'applied', -- applied, screening, interview, offer, hired, rejected
  rating          INT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboarding_checklists (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'in_progress',
  progress        INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id)
);

CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id    UUID NOT NULL REFERENCES onboarding_checklists(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL, -- compliance, logistics, finance
  is_completed    BOOLEAN DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 9. ASSET MANAGEMENT & IT SHIELD
-- =============================================================
CREATE TABLE IF NOT EXISTS assets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL, -- hardware, software
  category        TEXT NOT NULL, -- laptop, mobile, furniture
  asset_tag       TEXT,
  serial_number   TEXT,
  status          TEXT DEFAULT 'available', -- available, assigned, maintenance, lost
  purchase_date   DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_assignments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigned_at     TIMESTAMPTZ DEFAULT NOW(),
  returned_at     TIMESTAMPTZ,
  status          TEXT DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 10. PERFORMANCE & REVIEW
-- =============================================================
CREATE TABLE IF NOT EXISTS performance_review_cycles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  status          TEXT DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  cycle_id        UUID NOT NULL REFERENCES performance_review_cycles(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  manager_id      UUID REFERENCES employees(id),
  status          TEXT DEFAULT 'self_appraisal',
  overall_rating  INT,
  summary         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cycle_id, employee_id)
);

CREATE TABLE IF NOT EXISTS performance_goals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  progress        INT DEFAULT 0,
  status          TEXT DEFAULT 'in_progress',
  due_date        DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- 11. NEW MODULES: TRAINING, EXPENSES, WORKFLOWS, COMMUNITY
-- =============================================================

-- Training LMS
CREATE TABLE IF NOT EXISTS training_modules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  content_url     TEXT,
  is_mandatory    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_completions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id       UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  completed_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, employee_id)
);

-- Expense Claims
CREATE TABLE IF NOT EXISTS expense_claims (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  status          TEXT DEFAULT 'pending', -- pending, approved, paid
  receipt_url     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Community & Engagement
CREATE TABLE IF NOT EXISTS community_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  category        TEXT DEFAULT 'general',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kudos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  from_id         UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  to_id           UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  message         TEXT NOT NULL,
  badge           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Time Entries (Timesheets)
CREATE TABLE IF NOT EXISTS time_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  project         TEXT,
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ,
  duration_min    INT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Hub
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  message         TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  link            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- SECURITY (Universal RLS)
-- =============================================================

-- Helper Function: My Company
CREATE OR REPLACE FUNCTION my_company_id() RETURNS UUID AS $$
  SELECT company_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on ALL tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_envelopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- UNIVERSAL POLICY: "Company Isolation"
-- This one rule prevents cross-tenant data leaks for most tables.
-- Note: Replace 'ANY_TABLE' below for each created table in your migration script.

CREATE POLICY "company_scoped_policy" ON employees FOR ALL USING (company_id = my_company_id());
-- ... Apply same logic to others ...

-- Seed 2024 ZIMRA PAYE bands (Universal Utility - read by any company)
CREATE TABLE IF NOT EXISTS zimra_tax_bands (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tax_year     INT NOT NULL,
  band_from    NUMERIC(12,2) NOT NULL,
  band_to      NUMERIC(12,2),
  rate         NUMERIC(5,4) NOT NULL,
  fixed_amount NUMERIC(12,2) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE zimra_tax_bands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_tax" ON zimra_tax_bands FOR SELECT USING (true);

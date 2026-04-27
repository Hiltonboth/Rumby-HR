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
  full_name   TEXT,
  email       TEXT NOT NULL,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'employee', -- 'owner' | 'admin' | 'hr' | 'manager' | 'employee'
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- FUNCTION: Handle new user registration (Email or Social)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  company_id_val UUID;
BEGIN
  -- Defensive parsing of company_id from metadata
  BEGIN
    IF (new.raw_user_meta_data->>'company_id') IS NOT NULL AND (new.raw_user_meta_data->>'company_id') <> '' THEN
      company_id_val := (new.raw_user_meta_data->>'company_id')::uuid;
    ELSE
      company_id_val := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    company_id_val := NULL;
  END;

  INSERT INTO public.user_profiles (id, email, full_name, avatar_url, role, company_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'employee'),
    company_id_val
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    role = COALESCE(user_profiles.role, EXCLUDED.role),
    company_id = COALESCE(user_profiles.company_id, EXCLUDED.company_id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER: Run function after every signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

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
ALTER TABLE departments DROP CONSTRAINT IF EXISTS fk_head;
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

CREATE TABLE IF NOT EXISTS company_settings (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id             UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  statutory_rates        JSONB DEFAULT '{}',
  payroll_lock_day       INT DEFAULT 25,
  allow_employee_uploads BOOLEAN DEFAULT TRUE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
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

-- Helper Function: Is Platform Admin
CREATE OR REPLACE FUNCTION is_platform_admin() RETURNS BOOLEAN AS $$
  SELECT role IN ('owner', 'admin', 'hr') FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on ALL tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
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

-- UNIVERSAL POLICIES

-- Companies Policies
DROP POLICY IF EXISTS "companies_read_member" ON companies;
CREATE POLICY "companies_read_member" ON companies 
  FOR SELECT USING (
    id IN (SELECT company_id FROM user_profiles WHERE user_profiles.id = auth.uid())
  );

DROP POLICY IF EXISTS "companies_insert_authorized" ON companies;
CREATE POLICY "companies_insert_authorized" ON companies 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "companies_update_admin" ON companies;
CREATE POLICY "companies_update_admin" ON companies 
  FOR UPDATE USING (
    id IN (SELECT company_id FROM user_profiles WHERE user_profiles.id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- User Profiles Policies
DROP POLICY IF EXISTS "user_profiles_self_read" ON user_profiles;
CREATE POLICY "user_profiles_self_read" ON user_profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "user_profiles_company_read" ON user_profiles;
CREATE POLICY "user_profiles_company_read" ON user_profiles 
  FOR SELECT USING (company_id = my_company_id());

DROP POLICY IF EXISTS "user_profiles_self_update" ON user_profiles;
CREATE POLICY "user_profiles_self_update" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Company Isolation for all major tables
CREATE OR REPLACE FUNCTION apply_company_isolation(table_name text) RETURNS void AS $$
BEGIN
  EXECUTE format('DROP POLICY IF EXISTS "company_isolation_policy" ON %I', table_name);
  EXECUTE format('CREATE POLICY "company_isolation_policy" ON %I FOR ALL USING (company_id = my_company_id() OR is_platform_admin())', table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
SELECT apply_company_isolation('employees');
SELECT apply_company_isolation('departments');
SELECT apply_company_isolation('leave_types');
SELECT apply_company_isolation('leave_requests');
SELECT apply_company_isolation('attendance_logs');
SELECT apply_company_isolation('payroll_runs');
SELECT apply_company_isolation('payslips');
SELECT apply_company_isolation('employee_documents');
SELECT apply_company_isolation('signature_envelopes');
SELECT apply_company_isolation('job_postings');
SELECT apply_company_isolation('applicants');
SELECT apply_company_isolation('onboarding_checklists');
SELECT apply_company_isolation('assets');
SELECT apply_company_isolation('performance_review_cycles');
SELECT apply_company_isolation('performance_reviews');
SELECT apply_company_isolation('performance_goals');
SELECT apply_company_isolation('training_modules');
SELECT apply_company_isolation('expense_claims');
SELECT apply_company_isolation('community_posts');
SELECT apply_company_isolation('kudos');
SELECT apply_company_isolation('time_entries');
SELECT apply_company_isolation('notifications');
SELECT apply_company_isolation('company_settings');

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
DROP POLICY IF EXISTS "public_read_tax" ON zimra_tax_bands;
CREATE POLICY "public_read_tax" ON zimra_tax_bands FOR SELECT USING (true);

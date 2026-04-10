export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated' | 'Onboarding';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  location?: string;
  startDate?: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: EmployeeStatus;
  salary?: number;
  skills?: string[];
  bio?: string;
  tenantId: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  accentColor: string;
  plan: 'Pro' | 'Enterprise';
  employeeCount: number;
  status: 'Active' | 'Pending' | 'Past Due';
  ownerUid: string;
}

export interface UserProfile {
  uid: string;
  tenantId: string;
  role: 'admin' | 'employee' | 'platform_owner';
  email: string;
}

export interface Task {
  id: string;
  title: string;
  user: string;
  type: 'Time Off' | 'Contract' | 'Review' | 'Onboarding';
  dueDate: string;
  status: 'Pending' | 'Completed';
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  status: 'Applied' | 'Screening' | 'Interviewing' | 'Offer Sent' | 'Hired';
  score: number;
  skills?: string[];
  experience?: string;
}

export interface PayrollStatutory {
  nssaNumber?: string;
  necGrade?: string;
  taxStatus?: string;
  pensionMember?: boolean;
  medicalAidMember?: boolean;
}

export interface BankDetails {
  bankName: string;
  branch: string;
  accountNumber: string;
  mobileMoney?: string;
}

export interface PayrollProfile {
  employeeId: string;
  employeeNumber: string;
  payGrade: string;
  statutory: PayrollStatutory;
  bankDetails: BankDetails;
  dateEngaged: string;
  payFrequency: 'Monthly' | 'Fortnightly' | 'Weekly';
  salaryStructure: {
    basicSalary: number;
    fixedAllowances: { type: string; amount: number }[];
    fixedDeductions: { type: string; amount: number }[];
  };
  ytd: {
    gross: number;
    paye: number;
    nssa: number;
    net: number;
  };
}

export interface PayrollRun {
  id: string;
  period: string; // e.g. "April 2026"
  status: 'Draft' | 'Processing' | 'Approved' | 'Paid';
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employerCost: number;
  employeeCount: number;
  processedAt?: string;
}

export interface StatutoryRates {
  nssaEmployeeRate: number; // 4.5
  nssaEmployerRate: number; // 4.5
  nssaCap: number; // 700
  aidsLevyRate: number; // 3 (of PAYE)
  zimdefRate: number; // 1
  sazRate: number; // 0.5
  wcifRate: number; // 0.5
  necLevy: {
    type: 'Fixed' | 'Percentage';
    value: number;
  };
}

export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated' | 'Onboarding';

export interface Employee {
  id: string;
  companyId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  name?: string; // Derived
  email: string;
  phone?: string;
  whatsappNumber?: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  address?: string;
  avatar?: string;
  employeeNumber?: string;
  departmentId?: string;
  department?: string; // Quick-text/Legacy
  jobTitle?: string;
  role?: string; // UI alias for jobTitle
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'probation';
  startDate: string;
  endDate?: string;
  contractEndDate?: string;
  leaveAccrualRate?: number; // Days per month
  status: 'active' | 'on_leave' | 'terminated' | 'onboarding';
  managerId?: string;
  managerName?: string; // Joined
  basicSalary?: number;
  payFrequency?: 'monthly' | 'weekly' | 'fortnightly';
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
  nssaNumber?: string;
  taxNumber?: string;
  necGrade?: string;
  necCategory?: string;
  onboardingComplete?: boolean;
}

export interface Department {
  id: string;
  companyId: string;
  name: string;
  headId?: string;
  headName?: string; // Joined
  parentId?: string;
  createdAt: string;
}

export interface EmployeeDocument {
  id: string;
  companyId: string;
  employeeId: string;
  uploadedById?: string;
  title: string;
  category: 'contractual' | 'identity' | 'qualification' | 'other';
  fileUrl: string;
  expiryDate?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  accentColor: string;
  plan: 'free' | 'pro' | 'enterprise';
  industry?: string;
  country: string;
  currency: string;
  status?: string;
}

export interface UserProfile {
  uid: string;
  companyId?: string;
  role: 'owner' | 'admin' | 'hr' | 'manager' | 'employee' | 'platform_owner';
  email: string;
  fullName: string;
  avatarUrl?: string;
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
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  jobId?: string;
  status: 'Applied' | 'Shortlisted' | 'Initial Interview' | 'Reference Check' | 'Medical' | 'Final Offer' | 'Hired' | 'Rejected';
  score: number;
  skills?: string[];
  experience?: string;
  resumeUrl?: string;
  aiScore?: number;
  notes?: string;
  customFields?: Record<string, any>;
  onboardingId?: string;
  appliedAt: string;
  aiAnalysis?: string;
  matchAnalysis?: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendation: string;
  };
}

export interface OnboardingTask {
  id: string;
  companyId: string;
  employeeId: string;
  title: string;
  description?: string;
  type: 'sign_nda' | 'equip_laptop' | 'bank_details' | 'other';
  status: 'pending' | 'completed';
  requiredAt?: string;
  completedAt?: string;
}

export interface JobPosting {
  id: string;
  companyId: string;
  title: string;
  department?: string;
  description?: string;
  requirements?: string;
  location?: string;
  jobType: 'full_time' | 'part_time' | 'contract' | 'remote';
  status: 'open' | 'closed' | 'draft';
  isExternal: boolean; // Accessible on public portal
  customFieldsConfig?: {
    name: string;
    type: 'text' | 'number' | 'file';
    required: boolean;
  }[];
  deadline?: string;
  createdAt: string;
  applicantsCount?: number;
}

export interface DocumentEnvelope {
  id: string;
  companyId: string;
  applicantId?: string;
  title: string;
  status: 'draft' | 'sent' | 'completed' | 'cancelled';
  fileUrl: string;
  signedFileUrl?: string;
  createdAt: string;
  updatedAt: string;
  recipients?: DocumentRecipient[];
}

export interface DocumentRecipient {
  id: string;
  envelopeId: string;
  email: string;
  fullName: string;
  signingOrder: number;
  status: 'pending' | 'sent' | 'viewed' | 'signed' | 'declined';
  signedAt?: string;
  signatureData?: string;
  ipAddress?: string;
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
  companyId: string;
  period: string; // e.g. "April 2026"
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid';
  requestedById?: string;
  requestedByName?: string;
  approvedById?: string;
  approvedByName?: string;
  rejectionReason?: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employerCost: number;
  employeeCount: number;
  processedAt?: string;
}

export interface Payslip {
  id: string;
  payrollRunId: string;
  employeeId: string;
  basicSalary: number;
  allowances: { type: string; amount: number }[];
  deductions: { type: string; amount: number }[];
  tax: number;
  nssa: number;
  aidsLevy: number;
  netPay: number;
  createdAt: string;
}

export interface CompanySettings {
  id: string;
  companyId: string;
  statutoryRates: StatutoryRates;
  payrollLockDay: number;
  allowEmployeeUploads: boolean;
  bankDetails?: BankDetails; // Company's own disbursement account
  updatedAt: string;
}

export interface BankExportTemplate {
  id: string;
  companyId: string;
  name: string; // e.g. "CABS Bulk Transfer"
  bankName: string;
  fileFormat: 'CSV' | 'Excel' | 'TXT';
  mapping: {
    columnName: string;
    sourceField: 'employeeName' | 'accountNumber' | 'netPay' | 'branchCode' | 'bankCode' | 'currency' | 'employeeNumber' | 'narration' | 'fixedValue' | 'filler';
    fixedValue?: string;
    padding?: {
      length: number;
      char: string;
      direction: 'left' | 'right';
    };
  }[];
  delimiter?: string;
  hasHeader: boolean;
  createdAt: string;
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
  zigRate: number; // Conversion rate to Zimbabwe Gold (ZiG)
}

export interface PerformanceReviewCycle {
  id: string;
  companyId: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed';
}

export interface PerformanceReview {
  id: string;
  companyId: string;
  cycleId: string;
  employeeId: string;
  managerId?: string;
  status: 'self_appraisal' | 'manager_review' | 'completed';
  overallRating?: number;
  selfRating?: number;
  managerRating?: number;
  summary?: string;
  strengths?: string;
  areasForGrowth?: string;
  createdAt: string;
  updatedAt: string;
  employee?: Employee;
  manager?: Employee;
  cycle?: PerformanceReviewCycle;
  feedback?: PerformanceFeedback[];
}

export interface PerformanceGoal {
  id: string;
  companyId: string;
  employeeId: string;
  title: string;
  description?: string;
  kpiTarget?: string;
  progress: number;
  status: 'in_progress' | 'achieved' | 'overdue' | 'cancelled';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceFeedback {
  id: string;
  reviewId: string;
  providerId: string;
  isAnonymous: boolean;
  content: string;
  rating?: number;
  createdAt: string;
  provider?: Employee;
}

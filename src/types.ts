export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated' | 'Onboarding';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  location?: string;
  startDate?: string;
  email: string;
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
}

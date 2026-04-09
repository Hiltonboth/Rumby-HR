import { Employee, Company, Task, Candidate } from './types';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Kofi Mensah',
    role: 'Head of Marketing',
    department: 'Marketing',
    location: 'Accra, Ghana',
    startDate: '2021-03-15',
    email: 'kofi.m@rumby.hr',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&h=400&fit=crop',
    status: 'Active',
    salary: 145000,
    skills: ['Brand Strategy', 'Growth', 'Leadership'],
    bio: 'Passionate marketing leader with 10+ years of experience in the African tech ecosystem.',
    tenantId: 'c1',
  },
  {
    id: '2',
    name: 'Zanele Dlamini',
    role: 'Senior Engineer',
    department: 'Engineering',
    location: 'Johannesburg, SA',
    startDate: '2022-01-10',
    email: 'zanele.d@rumby.hr',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
    status: 'Active',
    salary: 160000,
    skills: ['React', 'Node.js', 'AWS'],
    bio: 'Full-stack developer focused on building scalable solutions for emerging markets.',
    tenantId: 'c1',
  },
  {
    id: '3',
    name: 'Tunde Balogun',
    role: 'Product Designer',
    department: 'Design',
    location: 'Lagos, Nigeria',
    startDate: '2023-05-22',
    email: 'tunde.b@rumby.hr',
    avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop',
    status: 'Active',
    salary: 120000,
    skills: ['UI/UX', 'Figma', 'Prototyping'],
    bio: 'Visual designer with a love for minimalist interfaces and cultural storytelling.',
    tenantId: 'c1',
  },
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'c1',
    name: "Rumby's",
    logo: 'R',
    accentColor: '#007AFF',
    plan: 'Enterprise',
    employeeCount: 124,
    status: 'Active',
    ownerUid: 'owner1',
  },
  {
    id: 'c2',
    name: 'Stellar Tech',
    logo: 'S',
    accentColor: '#5856D6',
    plan: 'Pro',
    employeeCount: 45,
    status: 'Active',
    ownerUid: 'owner2',
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Approve Time Off',
    user: 'Sarah Johnson',
    type: 'Time Off',
    dueDate: '2024-04-10',
    status: 'Pending',
  },
  {
    id: 't2',
    title: 'E-Sign Contract',
    user: 'Mike Brown',
    type: 'Contract',
    dueDate: '2024-04-08',
    status: 'Pending',
  },
  {
    id: 't3',
    title: 'Performance Review',
    user: 'Chloe Davis',
    type: 'Review',
    dueDate: '2024-04-15',
    status: 'Pending',
  },
];

export const MOCK_CANDIDATES: Candidate[] = [
  { 
    id: 'can1', 
    name: 'Alex Rivera', 
    role: 'Frontend Lead', 
    status: 'Interviewing', 
    score: 92,
    skills: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
    experience: '8 years of experience in frontend development, leading teams at scale.'
  },
  { 
    id: 'can2', 
    name: 'Jordan Smith', 
    role: 'HR Manager', 
    status: 'Offer Sent', 
    score: 88,
    skills: ['Employee Relations', 'Payroll', 'Recruitment', 'Labour Law'],
    experience: '6 years in HR management, specializing in compliance and culture.'
  },
  { 
    id: 'can3', 
    name: 'Taylor Wong', 
    role: 'Sales Exec', 
    status: 'Screening', 
    score: 75,
    skills: ['B2B Sales', 'CRM', 'Negotiation'],
    experience: '4 years in enterprise sales with a track record of exceeding quotas.'
  },
  { 
    id: 'can4', 
    name: 'Sam Jones', 
    role: 'DevOps', 
    status: 'Applied', 
    score: 82,
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    experience: '5 years in cloud infrastructure and automation.'
  },
];

export const MOCK_PAYROLL_PROFILES: any[] = [
  {
    employeeId: '1',
    employeeNumber: 'EMP001',
    payGrade: 'D1',
    statutory: {
      nssaNumber: '12345678A',
      necGrade: 'Grade 12',
      taxStatus: 'P1',
      pensionMember: true,
      medicalAidMember: true,
    },
    bankDetails: {
      bankName: 'CABS',
      branch: 'First Street',
      accountNumber: '1001234567',
    },
    dateEngaged: '2021-03-15',
    payFrequency: 'Monthly',
    salaryStructure: {
      basicSalary: 2500,
      fixedAllowances: [
        { type: 'Housing', amount: 500 },
        { type: 'Transport', amount: 200 }
      ],
      fixedDeductions: [
        { type: 'Medical Aid', amount: 150 },
        { type: 'Pension', amount: 100 }
      ]
    },
    ytd: {
      gross: 7500,
      paye: 1200,
      nssa: 315,
      net: 5800
    }
  },
  {
    employeeId: '2',
    employeeNumber: 'EMP002',
    payGrade: 'C4',
    statutory: {
      nssaNumber: '87654321B',
      necGrade: 'Grade 10',
      taxStatus: 'P1',
      pensionMember: true,
      medicalAidMember: false,
    },
    bankDetails: {
      bankName: 'Stanbic',
      branch: 'Samora Machel',
      accountNumber: '9087654321',
    },
    dateEngaged: '2022-01-10',
    payFrequency: 'Monthly',
    salaryStructure: {
      basicSalary: 1800,
      fixedAllowances: [
        { type: 'Housing', amount: 300 }
      ],
      fixedDeductions: [
        { type: 'Union Fees', amount: 20 }
      ]
    },
    ytd: {
      gross: 5400,
      paye: 800,
      nssa: 243,
      net: 4200
    }
  }
];

export const DEFAULT_STATUTORY_RATES: any = {
  nssaEmployeeRate: 4.5,
  nssaEmployerRate: 4.5,
  nssaCap: 700,
  aidsLevyRate: 3,
  zimdefRate: 1,
  sazRate: 0.5,
  wcifRate: 0.5,
  necLevy: {
    type: 'Fixed',
    value: 5.43
  }
};

export const MOCK_PAYROLL_RUNS: any[] = [
  {
    id: 'PR-2024-03',
    period: 'March 2024',
    status: 'Paid',
    totalGross: 45000,
    totalDeductions: 12000,
    totalNet: 33000,
    employerCost: 48500,
    employeeCount: 12,
    processedAt: '2024-03-28'
  },
  {
    id: 'PR-2024-04',
    period: 'April 2024',
    status: 'Draft',
    totalGross: 46200,
    totalDeductions: 12500,
    totalNet: 33700,
    employerCost: 49800,
    employeeCount: 12
  }
];


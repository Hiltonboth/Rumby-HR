import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { 
  DollarSign, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  FileText,
  X,
  Printer,
  MessageCircle,
  Users,
  Settings,
  ShieldCheck,
  TrendingUp,
  Plus,
  Send,
  Building2,
  CreditCard,
  Briefcase,
  History,
  FileBarChart,
  Lock,
  Unlock,
  AlertTriangle,
  Mail,
  Smartphone,
  Eye,
  Sparkles,
  Info,
  Trash2,
  Upload,
  Loader2,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';
import { generatePayslipPDF } from '../lib/pdfUtils';
import { MOCK_EMPLOYEES, MOCK_PAYROLL_PROFILES, DEFAULT_STATUTORY_RATES, MOCK_PAYROLL_RUNS } from '../constants';
import { Employee, PayrollProfile, StatutoryRates, PayrollRun, UserProfile } from '../types';
import { payrollService } from '../services/payrollService';
import { settingsService } from '../services/settingsService';
import { supabase } from '../lib/supabase';

// --- Utility Functions ---

const calculatePAYE = (taxableIncome: number, bands: any[]) => {
  if (!bands || bands.length === 0) {
    // Fallback to hardcoded bands if none provided
    const defaultBands = [
      { limit: 300, rate: 0 },
      { limit: 700, rate: 0.20 },
      { limit: 3000, rate: 0.25 },
      { limit: 7000, rate: 0.30 },
      { limit: 10000, rate: 0.35 },
      { limit: Infinity, rate: 0.40 }
    ];
    bands = defaultBands;
  }

  let tax = 0;
  let remaining = taxableIncome;
  let previousLimit = 0;

  // Adapt bands if they come from DB (lower_limit, upper_limit, rate)
  const sortedBands = [...bands].sort((a, b) => (a.lower_limit || a.limit) - (b.lower_limit || b.limit));

  for (const band of sortedBands) {
    const limit = band.upper_limit || band.limit || Infinity;
    const lower = band.lower_limit || previousLimit;
    const rate = band.tax_rate !== undefined ? band.tax_rate : band.rate;

    const taxableInBand = Math.min(remaining, limit - lower);
    if (taxableInBand <= 0) break;
    tax += taxableInBand * rate;
    remaining -= taxableInBand;
    previousLimit = limit;
  }

  return tax;
};

const calculatePayrollForEmployee = (profile: PayrollProfile, rates: StatutoryRates, bands: any[], customAdjs: { type: 'deduction' | 'allowance', label: string, amount: number }[] = []) => {
  const basic = profile.salaryStructure.basicSalary;
  const allowances = profile.salaryStructure.fixedAllowances.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Apply custom allowances
  const customAllowances = customAdjs.filter(a => a.type === 'allowance').reduce((acc, curr) => acc + curr.amount, 0);
  const gross = basic + allowances + customAllowances;

  // NSSA Calculation
  const nssaInsurable = Math.min(gross, rates.nssaCap);
  const nssaEmployee = nssaInsurable * (rates.nssaEmployeeRate / 100);
  const nssaEmployer = nssaInsurable * (rates.nssaEmployerRate / 100);

  // PAYE Calculation
  const taxableIncome = gross - nssaEmployee; // NSSA is tax deductible
  const paye = calculatePAYE(taxableIncome, bands);
  const aidsLevy = paye * (rates.aidsLevyRate / 100);

  // NEC Levy
  const necLevy = rates.necLevy.type === 'Fixed' 
    ? rates.necLevy.value 
    : gross * (rates.necLevy.value / 100);

  // Other Deductions
  const otherDeductions = profile.salaryStructure.fixedDeductions.reduce((acc, curr) => acc + curr.amount, 0);
  const customDeductions = customAdjs.filter(a => a.type === 'deduction').reduce((acc, curr) => acc + curr.amount, 0);

  const totalDeductions = nssaEmployee + paye + aidsLevy + necLevy + otherDeductions + customDeductions;
  
  // 50% Deduction Check
  const isOverLimit = totalDeductions > (gross * 0.5);
  const deductionLimitWarning = isOverLimit ? `Total deductions exceed 50% of Gross (${formatCurrency(gross * 0.5)})` : null;

  const netPay = gross - totalDeductions;

  // ZiG Equivalents (Converted from USD/Base)
  const zigRate = rates.zigRate || 13.5; // Fallback if not set
  const netPayZiG = netPay * zigRate;
  const payeZiG = paye * zigRate;
  const nssaZiG = nssaEmployee * zigRate;

  // Employer Contributions
  const zimdef = gross * (rates.zimdefRate / 100);
  const saz = gross * (rates.sazRate / 100);
  const wcif = gross * (rates.wcifRate / 100);
  const totalEmployerCost = gross + nssaEmployer + zimdef + saz + wcif;

  return {
    gross,
    nssaEmployee,
    nssaEmployer,
    paye,
    aidsLevy,
    necLevy,
    otherDeductions: otherDeductions + customDeductions,
    totalDeductions,
    netPay,
    netPayZiG,
    payeZiG,
    nssaZiG,
    zigRateUsed: zigRate,
    zimdef,
    saz,
    wcif,
    totalEmployerCost,
    customAdjs,
    deductionLimitWarning,
    isOverLimit
  };
};

// --- Sub-components ---

const DashboardView = ({ stats, compliance, alerts, isDark }: any) => (
  <div className="space-y-8">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat: any) => (
        <div key={stat.label} className={cn(
          "border rounded-3xl p-6 shadow-sm transition-colors",
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
        )}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
          <div className="flex items-end justify-between">
            <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-space-gray")}>{stat.value}</h3>
            <div className={cn(
              "flex items-center gap-1 text-xs font-bold",
              stat.trend === 'up' ? "text-green-500" : "text-red-500"
            )}>
              {stat.change}
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Compliance Dashboard */}
      <div className="lg:col-span-2 space-y-6">
        <div className={cn(
          "border rounded-3xl p-8 shadow-sm transition-colors",
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
        )}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                isDark ? "bg-green-500/10 text-green-500" : "bg-green-50 text-green-600"
              )}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-space-gray")}>Compliance Dashboard</h3>
            </div>
            <span className={cn(
              "text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest transition-colors",
              isDark ? "text-green-400 bg-green-500/10" : "text-green-500 bg-green-50"
            )}>All Clear</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {compliance.map((item: any) => (
              <div key={item.label} className={cn(
                "space-y-2 p-4 rounded-2xl border transition-colors",
                isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/30 border-black/[0.02]"
              )}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                <p className={cn("text-lg font-bold", isDark ? "text-white" : "text-space-gray")}>{formatCurrency(item.value)}</p>
                <p className="text-[10px] text-gray-500">Due: {item.dueDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={cn(
          "border rounded-3xl overflow-hidden shadow-sm transition-colors",
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
        )}>
          <div className={cn("p-6 border-b flex items-center justify-between transition-colors", isDark ? "border-white/5" : "border-black/[0.05]")}>
            <h3 className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>Recent Payroll Activity</h3>
            <button 
              onClick={() => alert('Navigating to full activity log...')}
              className="text-accent text-sm font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className={cn("divide-y", isDark ? "divide-white/5" : "divide-black/[0.05]")}>
            {MOCK_PAYROLL_RUNS.map((run) => (
              <div key={run.id} className={cn(
                "p-6 flex items-center justify-between transition-all cursor-pointer group",
                isDark ? "hover:bg-white/5" : "hover:bg-apple-gray/20"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    run.status === 'Paid' 
                      ? (isDark ? "bg-green-500/10 text-green-500" : "bg-green-50 text-green-600")
                      : (isDark ? "bg-orange-500/10 text-orange-500" : "bg-orange-50 text-orange-600")
                  )}>
                    {run.status === 'Paid' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>{run.period}</p>
                    <p className="text-xs text-gray-400">{run.employeeCount} Employees • {run.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>{formatCurrency(run.totalNet)}</p>
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      run.status === 'Paid' ? "text-green-500" : "text-orange-500"
                    )}>{run.status}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div className="space-y-6">
        <div className={cn(
          "border rounded-3xl p-6 shadow-sm space-y-6 transition-colors",
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
        )}>
          <h3 className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>Smart Alerts</h3>
          <div className="space-y-4">
            {alerts.map((alert: any, i: number) => (
              <div key={i} className={cn(
                "p-4 rounded-2xl border flex gap-3 transition-colors",
                alert.type === 'error' 
                  ? (isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-100 text-red-700")
                  : (isDark ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : "bg-orange-50 border-orange-100 text-orange-700")
              )}>
                {alert.type === 'error' ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <div>
                  <p className="text-sm font-bold">{alert.title}</p>
                  <p className="text-xs opacity-80 mt-1">{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-accent rounded-3xl p-8 text-white space-y-4 relative overflow-hidden shadow-xl shadow-accent/20">
          <div className="relative z-10">
            <h4 className="text-lg font-bold">Need Help?</h4>
            <p className="text-sm text-white/80">Our HR experts are available to help you with ZIMRA and NSSA compliance.</p>
            <button 
              onClick={() => alert('Connecting to a Zimbabwean payroll expert...')}
              className="mt-4 bg-white text-accent px-6 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg"
            >
              Talk to Expert
            </button>
          </div>
          <Sparkles className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
        </div>
      </div>
    </div>
  </div>
);

const EmployeePayrollView = ({ employees, profiles, onSelect, isDark }: any) => (
  <div className={cn(
    "border rounded-3xl overflow-hidden shadow-sm transition-colors",
    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
  )}>
    <div className={cn("p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors", isDark ? "border-white/5" : "border-black/[0.05]")}>
      <h3 className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>Employee Payroll Profiles</h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search employees..."
          className={cn(
            "pl-10 pr-4 py-2 border-none rounded-xl text-sm outline-none w-full sm:w-64 transition-colors",
            isDark ? "bg-white/5 text-white placeholder:text-gray-500" : "bg-apple-gray/50 text-space-gray"
          )}
        />
      </div>
    </div>

    {/* Desktop Table View */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={cn("border-b transition-colors", isDark ? "border-white/5 bg-white/5" : "border-black/[0.05] bg-apple-gray/30")}>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID / NSSA</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pay Grade</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Basic Salary</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className={cn("divide-y transition-colors", isDark ? "divide-white/5" : "divide-black/[0.05]")}>
          {profiles.map((profile: PayrollProfile) => {
            const emp = employees.find((e: Employee) => e.id === profile.employeeId);
            return (
              <tr key={profile.employeeId} className={cn("transition-colors group", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray/20")}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {emp?.firstName[0]}
                    </div>
                    <div>
                      <p className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>{emp?.firstName} {emp?.lastName}</p>
                      <p className="text-xs text-gray-500">{emp?.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-space-gray")}>{profile.employeeNumber}</p>
                  <p className="text-[10px] text-gray-400">{profile.statutory.nssaNumber || 'No NSSA'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-bold transition-colors",
                    isDark ? "bg-white/10 text-slate-400" : "bg-apple-gray text-gray-600"
                  )}>{profile.payGrade}</span>
                </td>
                <td className="px-6 py-4">
                  <p className={cn("text-sm font-bold", isDark ? "text-white" : "text-space-gray")}>{formatCurrency(profile.salaryStructure.basicSalary)}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onSelect(profile)}
                    className="p-2 hover:bg-accent/10 rounded-xl text-accent transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Mobile Card View */}
    <div className={cn("md:hidden divide-y transition-colors", isDark ? "divide-white/5" : "divide-black/[0.05]")}>
      {profiles.map((profile: PayrollProfile) => {
        const emp = employees.find((e: Employee) => e.id === profile.employeeId);
        return (
          <div key={profile.employeeId} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                  {emp?.firstName[0]}
                </div>
                <div>
                  <p className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>{emp?.firstName} {emp?.lastName}</p>
                  <p className="text-xs text-gray-500">{emp?.role}</p>
                </div>
              </div>
              <button 
                onClick={() => onSelect(profile)}
                className="p-3 bg-accent/10 rounded-2xl text-accent"
              >
                <Eye className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className={cn(
                "p-3 rounded-xl border transition-colors",
                isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/30 border-black/[0.02]"
              )}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID / NSSA</p>
                <p className={cn("text-xs font-bold", isDark ? "text-slate-300" : "text-space-gray")}>{profile.employeeNumber}</p>
                <p className="text-[10px] text-gray-400">{profile.statutory.nssaNumber || 'No NSSA'}</p>
              </div>
              <div className={cn(
                "p-3 rounded-xl border transition-colors",
                isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/30 border-black/[0.02]"
              )}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Basic Salary</p>
                <p className={cn("text-xs font-bold", isDark ? "text-white" : "text-space-gray")}>{formatCurrency(profile.salaryStructure.basicSalary)}</p>
                <span className={cn(
                  "inline-block mt-1 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase transition-colors",
                  isDark ? "bg-white/10 text-slate-500" : "bg-apple-gray text-gray-500"
                )}>{profile.payGrade}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const SalaryStructureView = ({ rates, onUpdateRates, isDark }: any) => {
  const [activeSubTab, setActiveSubTab] = useState('Earnings');
  const [earnings, setEarnings] = useState([
    { id: '1', name: 'Basic Salary', type: 'Fixed', taxable: true, pensionable: true },
    { id: '2', name: 'Housing Allowance', type: 'Fixed', taxable: true, pensionable: false },
    { id: '3', name: 'Transport Allowance', type: 'Fixed', taxable: false, pensionable: false },
    { id: '4', name: 'Fuel Allowance', type: 'Variable', taxable: true, pensionable: false },
    { id: '5', name: 'Overtime', type: 'Variable', taxable: true, pensionable: false },
    { id: '6', name: 'Bonus', type: 'Variable', taxable: true, pensionable: false },
  ]);
  const [showEarningModal, setShowEarningModal] = useState(false);
  const [editingEarning, setEditingEarning] = useState<any>(null);
  const [deductions, setDeductions] = useState([
    { id: 'd1', name: 'PAYE', type: 'Formula', statutory: true, value: 'Tax Table' },
    { id: 'd2', name: 'AIDS Levy', type: 'Percentage', statutory: true, value: '3% of PAYE' },
    { id: 'd3', name: 'NSSA Employee', type: 'Percentage', statutory: true, value: '4.5%' },
    { id: 'd4', name: 'NEC Levy', type: 'Fixed', statutory: true, value: '$5.43' },
    { id: 'd5', name: 'Medical Aid', type: 'Fixed', statutory: false, value: 'Variable' },
    { id: 'd6', name: 'Pension (Private)', type: 'Percentage', statutory: false, value: '5%' },
    { id: 'd7', name: 'Union Fees', type: 'Fixed', statutory: false, value: '$10.00' },
    { id: 'd8', name: 'Loan Repayment', type: 'Fixed', statutory: false, value: 'Variable' },
  ]);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<any>(null);
  const [optionalContributions, setOptionalContributions] = useState([
    { id: 'c1', name: 'Pension (Employer Match)', type: 'Percentage', value: 5, base: 'Basic Salary' },
    { id: 'c2', name: 'Medical Aid (Employer Part)', type: 'Fixed', value: 50, base: 'per Employee' },
  ]);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [editingContribution, setEditingContribution] = useState<any>(null);
  const [isUpdatingTax, setIsUpdatingTax] = useState(false);

  const handleSaveEarning = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const earningData = {
      id: editingEarning?.id || Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as 'Fixed' | 'Variable',
      taxable: formData.get('taxable') === 'on',
      pensionable: formData.get('pensionable') === 'on',
    };

    if (editingEarning) {
      setEarnings(earnings.map(item => item.id === editingEarning.id ? earningData : item));
    } else {
      setEarnings([...earnings, earningData]);
    }
    setShowEarningModal(false);
    setEditingEarning(null);
  };

  const handleDeleteEarning = (id: string) => {
    if (confirm('Are you sure you want to delete this earning item?')) {
      setEarnings(earnings.filter(item => item.id !== id));
    }
  };

  const handleSaveDeduction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const deductionData = {
      id: editingDeduction?.id || Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      statutory: formData.get('statutory') === 'on',
      value: formData.get('value') as string,
    };

    if (editingDeduction) {
      setDeductions(deductions.map(item => item.id === editingDeduction.id ? deductionData : item));
    } else {
      setDeductions([...deductions, deductionData]);
    }
    setShowDeductionModal(false);
    setEditingDeduction(null);
  };

  const handleDeleteDeduction = (id: string) => {
    if (confirm('Are you sure you want to delete this deduction item?')) {
      setDeductions(deductions.filter(item => item.id !== id));
    }
  };

  const handleSaveContribution = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const contributionData = {
      id: editingContribution?.id || Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      value: parseFloat(formData.get('value') as string),
      base: formData.get('base') as string,
    };

    if (editingContribution) {
      setOptionalContributions(optionalContributions.map(item => item.id === editingContribution.id ? contributionData : item));
    } else {
      setOptionalContributions([...optionalContributions, contributionData]);
    }
    setShowContributionModal(false);
    setEditingContribution(null);
  };

  const handleDeleteContribution = (id: string) => {
    if (confirm('Are you sure you want to delete this contribution item?')) {
      setOptionalContributions(optionalContributions.filter(item => item.id !== id));
    }
  };

  const handleUpdateTaxTables = () => {
    setIsUpdatingTax(true);
    setTimeout(() => {
      setIsUpdatingTax(false);
      alert('ZIMRA Tax Tables updated successfully to the latest 2024/2025 schedules.');
    }, 2000);
  };

  return (
    <div className={cn(
      "border rounded-[2.5rem] overflow-hidden shadow-sm transition-colors",
      isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
    )}>
      <div className={cn("p-8 border-b transition-colors", isDark ? "border-white/5 bg-white/5" : "border-black/[0.05] bg-apple-gray/10")}>
        <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-space-gray")}>Salary Structure Setup</h3>
        <p className="text-sm text-gray-500 mt-1">Define how earnings and deductions are calculated across your organization.</p>
      </div>
      
      <div className={cn("flex border-b px-4 md:px-8 overflow-x-auto no-scrollbar transition-colors", isDark ? "border-white/5 bg-slate-900" : "border-black/[0.05] bg-apple-gray/5")}>
        {['Earnings', 'Deductions', 'Employer Contributions', 'Tax Settings', 'NEC Settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={cn(
              "px-4 md:px-6 py-4 text-[10px] md:text-sm font-bold transition-all relative whitespace-nowrap uppercase tracking-widest md:normal-case md:tracking-normal",
              activeSubTab === tab 
                ? "text-accent" 
                : (isDark ? "text-slate-500 hover:text-white" : "text-gray-400 hover:text-space-gray")
            )}
          >
            {tab}
            {activeSubTab === tab && (
              <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 md:p-8">
        {activeSubTab === 'Tax Settings' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className={cn("text-xs font-bold uppercase tracking-widest border-b pb-2", isDark ? "text-slate-500 border-white/5" : "text-gray-400 border-black/[0.05]")}>ZIMRA PAYE Bands (Monthly USD)</h4>
                <div className="space-y-4">
                  {[
                    { range: '0 - 300', rate: '0%' },
                    { range: '301 - 700', rate: '20%' },
                    { range: '701 - 3,000', rate: '25%' },
                    { range: '3,001 - 7,000', rate: '30%' },
                    { range: '7,001 - 10,000', rate: '35%' },
                    { range: 'Above 10,000', rate: '40%' },
                  ].map((band, i) => (
                    <div key={i} className={cn("flex items-center justify-between p-3 rounded-xl transition-colors", isDark ? "bg-white/5" : "bg-apple-gray/30")}>
                      <span className={cn("text-sm font-medium", isDark ? "text-slate-400" : "text-gray-600")}>{band.range}</span>
                      <span className={cn("text-sm font-bold", isDark ? "text-white" : "text-space-gray")}>{band.rate}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleUpdateTaxTables}
                  disabled={isUpdatingTax}
                  className={cn(
                    "btn-secondary w-full py-3 text-xs flex items-center justify-center gap-2",
                    isDark ? "bg-white/5 border-white/5 text-white hover:bg-white/10" : "bg-apple-gray text-space-gray",
                    isUpdatingTax && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isUpdatingTax ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Tax Tables"
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <h4 className={cn("text-xs font-bold uppercase tracking-widest border-b pb-2", isDark ? "text-slate-500 border-white/5" : "text-gray-400 border-black/[0.05]")}>Statutory Rates & Dates</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-bold uppercase", isDark ? "text-slate-500" : "text-gray-400")}>AIDS Levy Rate (%)</label>
                    <input 
                      type="number" 
                      value={rates.aidsLevyRate}
                      onChange={(e) => onUpdateRates({ aidsLevyRate: parseFloat(e.target.value) })}
                      className={cn(
                        "w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                        isDark ? "bg-white/5 text-white" : "bg-apple-gray text-space-gray"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-bold uppercase", isDark ? "text-slate-500" : "text-gray-400")}>Effective Date</label>
                    <input 
                      type="date" 
                      defaultValue="2024-01-01"
                      className={cn(
                        "w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                        isDark ? "bg-white/5 text-white [color-scheme:dark]" : "bg-apple-gray text-space-gray"
                      )}
                    />
                  </div>
                </div>
                <div className={cn(
                  "p-4 rounded-2xl border flex gap-3 transition-colors",
                  isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-100"
                )}>
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className={cn("text-xs", isDark ? "text-blue-400" : "text-blue-700")}>These settings ensure compliance with ZIMRA regulations. Changes will be logged for audit purposes.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'NEC Settings' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className={cn("text-xs font-bold uppercase tracking-widest border-b pb-2", isDark ? "text-slate-500 border-white/5" : "text-gray-400 border-black/[0.05]")}>NEC Sector Configuration</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-bold uppercase", isDark ? "text-slate-500" : "text-gray-400")}>Sector / Industry</label>
                    <select className={cn(
                      "w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                      isDark ? "bg-white/5 text-white" : "bg-apple-gray text-space-gray"
                    )}>
                      <option>Commercial Sectors</option>
                      <option>Mining Industry</option>
                      <option>Agricultural Industry</option>
                      <option>Construction Industry</option>
                      <option>Engineering Industry</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={cn("text-[10px] font-bold uppercase", isDark ? "text-slate-500" : "text-gray-400")}>Levy Type</label>
                      <select 
                        value={rates.necLevy.type}
                        onChange={(e) => onUpdateRates({ necLevy: { ...rates.necLevy, type: e.target.value } })}
                        className={cn(
                          "w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                          isDark ? "bg-white/5 text-white" : "bg-apple-gray text-space-gray"
                        )}
                      >
                        <option value="Fixed">Fixed Amount</option>
                        <option value="Percentage">Percentage</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-[10px] font-bold uppercase", isDark ? "text-slate-500" : "text-gray-400")}>Value</label>
                      <input 
                        type="number" 
                        value={rates.necLevy.value}
                        onChange={(e) => onUpdateRates({ necLevy: { ...rates.necLevy, value: parseFloat(e.target.value) } })}
                        className={cn(
                          "w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                          isDark ? "bg-white/5 text-white" : "bg-apple-gray text-space-gray"
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-bold uppercase", isDark ? "text-slate-500" : "text-gray-400")}>Applicability</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
                        <span className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-600")}>All Employees</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
                        <span className={cn("text-sm", isDark ? "text-slate-400" : "text-gray-600")}>Grade Based</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className={cn("text-xs font-bold uppercase tracking-widest border-b pb-2", isDark ? "text-slate-500 border-white/5" : "text-gray-400 border-black/[0.05]")}>NSSA & Other Statutory</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-bold uppercase", isDark ? "text-slate-500" : "text-gray-400")}>NSSA Employee %</label>
                    <input 
                      type="number" 
                      value={rates.nssaEmployeeRate}
                      onChange={(e) => onUpdateRates({ nssaEmployeeRate: parseFloat(e.target.value) })}
                      className={cn(
                        "w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                        isDark ? "bg-white/5 text-white" : "bg-apple-gray text-space-gray"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={cn("text-[10px] font-bold uppercase", isDark ? "text-slate-500" : "text-gray-400")}>NSSA Employer %</label>
                    <input 
                      type="number" 
                      value={rates.nssaEmployerRate}
                      onChange={(e) => onUpdateRates({ nssaEmployerRate: parseFloat(e.target.value) })}
                      className={cn(
                        "w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                        isDark ? "bg-white/5 text-white" : "bg-apple-gray text-space-gray"
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={cn("text-[10px] font-bold uppercase", isDark ? "text-slate-500" : "text-gray-400")}>NSSA Earnings Cap (USD)</label>
                  <input 
                    type="number" 
                    value={rates.nssaCap}
                    onChange={(e) => onUpdateRates({ nssaCap: parseFloat(e.target.value) })}
                    className={cn(
                      "w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                      isDark ? "bg-white/5 text-white" : "bg-apple-gray text-space-gray"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'Deductions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-slate-500" : "text-gray-400")}>Defined Deduction Items</h4>
              <button 
                onClick={() => {
                  setEditingDeduction(null);
                  setShowDeductionModal(true);
                }}
                className={cn(
                  "py-2 px-4 flex items-center gap-2 text-xs font-bold rounded-xl transition-colors",
                  isDark ? "bg-white/5 text-white border border-white/5 hover:bg-white/10" : "bg-apple-gray text-space-gray hover:bg-apple-gray/50"
                )}
              >
                <Plus className="w-4 h-4" />
                Add Deduction
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deductions.map(item => (
                <div key={item.id} className={cn(
                  "p-4 rounded-2xl border transition-colors flex items-center justify-between",
                  isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/30 border-black/[0.03]"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      item.statutory 
                        ? (isDark ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-600")
                        : (isDark ? "bg-blue-500/10 text-blue-500" : "bg-blue-50 text-blue-600")
                    )}>
                      {item.statutory ? <ShieldCheck className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.statutory ? 'Statutory' : 'Optional'} • {item.type} ({item.value})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingDeduction(item);
                        setShowDeductionModal(true);
                      }}
                      className={cn("p-2 transition-colors rounded-lg", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray")}
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                    {!item.statutory && (
                      <button 
                        onClick={() => handleDeleteDeduction(item.id)}
                        className={cn("p-2 rounded-lg text-gray-400 hover:text-red-500 transition-colors", isDark ? "hover:bg-red-500/10" : "hover:bg-red-50")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'Employer Contributions' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className={cn("text-xs font-bold uppercase tracking-widest border-b pb-2", isDark ? "text-slate-500 border-white/5" : "text-gray-400 border-black/[0.05]")}>Statutory Contributions (Employer)</h4>
                <div className="space-y-4">
                  {[
                    { name: 'NSSA Employer', rate: '4.5%', base: 'Gross (Capped)' },
                    { name: 'ZIMDEF', rate: '1.0%', base: 'Gross' },
                    { name: 'SAZ Levy', rate: '0.05%', base: 'Gross' },
                    { name: 'WCIF', rate: '1.2%', base: 'Gross' },
                  ].map((item, i) => (
                    <div key={i} className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-colors",
                      isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/30 border-black/[0.03]"
                    )}>
                      <div>
                        <p className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>{item.name}</p>
                        <p className="text-[10px] text-gray-500">Based on {item.base}</p>
                      </div>
                      <span className="text-sm font-black text-accent">{item.rate}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className={cn("text-xs font-bold uppercase tracking-widest border-b pb-2", isDark ? "text-slate-500 border-white/5" : "text-gray-400 border-black/[0.05]")}>Optional Contributions</h4>
                <div className="space-y-4">
                  {optionalContributions.map((item) => (
                    <div key={item.id} className={cn(
                      "p-4 rounded-2xl border flex items-center justify-between transition-colors",
                      isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/30 border-black/[0.03]"
                    )}>
                      <div>
                        <p className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>{item.name}</p>
                        <p className="text-[10px] text-gray-500">{item.type} • {item.base}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {item.type === 'Fixed' && <span className="text-sm font-bold text-gray-400">$</span>}
                          <input 
                            type="number" 
                            value={item.value} 
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setOptionalContributions(optionalContributions.map(c => c.id === item.id ? { ...c, value: val } : c));
                            }}
                            className={cn(
                              "w-20 border rounded-lg px-2 py-1 text-sm font-bold text-right outline-none transition-colors",
                              isDark ? "bg-white/5 border-white/5 text-white" : "bg-white border-black/[0.05] text-space-gray"
                            )} 
                          />
                          {item.type === 'Percentage' && <span className="text-sm font-bold text-gray-400">%</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              setEditingContribution(item);
                              setShowContributionModal(true);
                            }}
                            className={cn("p-2 transition-colors rounded-lg", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray")}
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                          </button>
                          <button 
                            onClick={() => handleDeleteContribution(item.id)}
                            className={cn("p-2 rounded-lg text-gray-400 hover:text-red-500 transition-colors", isDark ? "hover:bg-red-500/10" : "hover:bg-red-50")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setEditingContribution(null);
                    setShowContributionModal(true);
                  }}
                  className={cn(
                    "w-full py-3 text-xs flex items-center justify-center gap-2 font-bold rounded-xl transition-colors",
                    isDark ? "bg-white/5 text-white border border-white/5 hover:bg-white/10" : "bg-apple-gray text-space-gray hover:bg-apple-gray/50"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add Contribution Item
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'Earnings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-slate-500" : "text-gray-400")}>Defined Earning Items</h4>
              <button 
                onClick={() => {
                  setEditingEarning(null);
                  setShowEarningModal(true);
                }}
                className={cn(
                  "py-2 px-4 flex items-center gap-2 text-xs font-bold rounded-xl transition-colors",
                  isDark ? "bg-white/5 text-white border border-white/5 hover:bg-white/10" : "bg-apple-gray text-space-gray hover:bg-apple-gray/50"
                )}
              >
                <Plus className="w-4 h-4" />
                Add Earning
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnings.map(item => (
                <div key={item.id} className={cn(
                  "p-4 rounded-2xl border transition-colors flex items-center justify-between",
                  isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/30 border-black/[0.03]"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      item.taxable 
                        ? (isDark ? "bg-green-500/10 text-green-500" : "bg-green-50 text-green-600")
                        : (isDark ? "bg-orange-500/10 text-orange-500" : "bg-orange-50 text-orange-600")
                    )}>
                      {item.taxable ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.type} • {item.taxable ? 'Taxable' : 'Tax-Free'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingEarning(item);
                        setShowEarningModal(true);
                      }}
                      className={cn("p-2 transition-colors rounded-lg", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray")}
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                    {item.name !== 'Basic Salary' && (
                      <button 
                        onClick={() => handleDeleteEarning(item.id)}
                        className={cn("p-2 rounded-lg text-gray-400 hover:text-red-500 transition-colors", isDark ? "hover:bg-red-500/10" : "hover:bg-red-50")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Earning Modal */}
        <AnimatePresence>
          {showEarningModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] flex items-end sm:items-center justify-center p-0 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 sm:p-8 border-b border-black/[0.05] flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-space-gray">
                    {editingEarning ? 'Edit Earning Item' : 'Add New Earning Item'}
                  </h3>
                  <button onClick={() => setShowEarningModal(false)} className="p-2 hover:bg-apple-gray rounded-full">
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  </button>
                </div>
                <div className="overflow-y-auto">
                  <form onSubmit={handleSaveEarning} className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Earning Name</label>
                      <input 
                        name="name"
                        required
                        defaultValue={editingEarning?.name}
                        placeholder="e.g. Performance Bonus"
                        className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                        <select 
                          name="type"
                          defaultValue={editingEarning?.type || 'Fixed'}
                          className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                        >
                          <option value="Fixed">Fixed</option>
                          <option value="Variable">Variable</option>
                        </select>
                      </div>
                      <div className="space-y-4 pt-2 sm:pt-6">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              name="taxable"
                              defaultChecked={editingEarning ? editingEarning.taxable : true}
                              className="sr-only peer" 
                            />
                            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                          </div>
                          <span className="text-sm font-bold text-space-gray group-hover:text-accent transition-colors">Taxable</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <input 
                              type="checkbox" 
                              name="pensionable"
                              defaultChecked={editingEarning ? editingEarning.pensionable : true}
                              className="sr-only peer" 
                            />
                            <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                          </div>
                          <span className="text-sm font-bold text-space-gray group-hover:text-accent transition-colors">Pensionable</span>
                        </label>
                      </div>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      <button 
                        type="button"
                        onClick={() => setShowEarningModal(false)}
                        className="w-full sm:flex-1 py-3 bg-apple-gray text-space-gray rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="w-full sm:flex-1 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20"
                      >
                        {editingEarning ? 'Save Changes' : 'Add Earning'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Deduction Modal */}
        <AnimatePresence>
          {showDeductionModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] flex items-end sm:items-center justify-center p-0 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 sm:p-8 border-b border-black/[0.05] flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-space-gray">
                    {editingDeduction ? 'Edit Deduction Item' : 'Add New Deduction Item'}
                  </h3>
                  <button onClick={() => setShowDeductionModal(false)} className="p-2 hover:bg-apple-gray rounded-full">
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  </button>
                </div>
                <div className="overflow-y-auto">
                  <form onSubmit={handleSaveDeduction} className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Deduction Name</label>
                      <input 
                        name="name"
                        required
                        defaultValue={editingDeduction?.name}
                        placeholder="e.g. Health Insurance"
                        className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                        <select 
                          name="type"
                          defaultValue={editingDeduction?.type || 'Fixed'}
                          className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                        >
                          <option value="Fixed Amount">Fixed Amount</option>
                          <option value="Percentage">Percentage</option>
                          <option value="Formula">Formula</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Value / Rate</label>
                        <input 
                          name="value"
                          required
                          defaultValue={editingDeduction?.value}
                          placeholder="e.g. 5% or $50"
                          className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            name="statutory"
                            defaultChecked={editingDeduction?.statutory}
                            className="sr-only peer" 
                          />
                          <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </div>
                        <span className="text-sm font-bold text-space-gray group-hover:text-accent transition-colors">Statutory Deduction</span>
                      </label>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      <button 
                        type="button"
                        onClick={() => setShowDeductionModal(false)}
                        className="w-full sm:flex-1 py-3 bg-apple-gray text-space-gray rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="w-full sm:flex-1 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20"
                      >
                        {editingDeduction ? 'Save Changes' : 'Add Deduction'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Contribution Modal */}
        <AnimatePresence>
          {showContributionModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] flex items-end sm:items-center justify-center p-0 sm:p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 sm:p-8 border-b border-black/[0.05] flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-bold text-space-gray">
                    {editingContribution ? 'Edit Contribution Item' : 'Add New Contribution Item'}
                  </h3>
                  <button onClick={() => setShowContributionModal(false)} className="p-2 hover:bg-apple-gray rounded-full">
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                  </button>
                </div>
                <div className="overflow-y-auto">
                  <form onSubmit={handleSaveContribution} className="p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Contribution Name</label>
                      <input 
                        name="name"
                        required
                        defaultValue={editingContribution?.name}
                        placeholder="e.g. Group Life Assurance"
                        className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                        <select 
                          name="type"
                          defaultValue={editingContribution?.type || 'Fixed'}
                          className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                        >
                          <option value="Fixed">Fixed Amount</option>
                          <option value="Percentage">Percentage</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Value / Rate</label>
                        <input 
                          name="value"
                          type="number"
                          step="0.01"
                          required
                          defaultValue={editingContribution?.value}
                          placeholder="e.g. 5 or 50"
                          className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Calculation Base</label>
                      <input 
                        name="base"
                        required
                        defaultValue={editingContribution?.base}
                        placeholder="e.g. Basic Salary or per Employee"
                        className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      <button 
                        type="button"
                        onClick={() => setShowContributionModal(false)}
                        className="w-full sm:flex-1 py-3 bg-apple-gray text-space-gray rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="w-full sm:flex-1 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20"
                      >
                        {editingContribution ? 'Save Changes' : 'Add Contribution'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PayrollRunView = ({ runs, onStartRun, onDownloadReport, onCloneRun, onApproveRun, onRejectRun, userRole, isDark }: any) => {
  const canApprove = ['owner', 'admin'].includes(userRole);

  return (
    <div className="space-y-8">
      <div className={cn(
        "bg-white border rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05] bg-gradient-to-br from-accent/5 to-transparent"
      )}>
        <div className="space-y-2">
          <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-space-gray")}>Payroll Engine</h3>
          <p className="text-gray-500">Select a period to start processing salaries for your team.</p>
        </div>
        <button 
          onClick={onStartRun}
          className="w-full md:w-auto btn-primary px-8 py-4 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
        >
          <DollarSign className="w-5 h-5" />
          Start New Payrun
        </button>
      </div>

      <div className={cn(
        "border rounded-[2.5rem] overflow-hidden shadow-sm transition-colors",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
      )}>
        <div className={cn("p-8 border-b transition-colors", isDark ? "border-white/5 bg-white/5" : "border-black/[0.05]")}>
          <h3 className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>Payrun History</h3>
        </div>
        <div className={cn("divide-y transition-colors", isDark ? "divide-white/5" : "divide-black/[0.05]")}>
          {runs.map((run: any) => (
            <div key={run.id} className={cn(
              "p-8 flex flex-col md:flex-row md:items-center justify-between transition-colors gap-6 relative group",
              isDark ? "hover:bg-white/5" : "hover:bg-apple-gray/20"
            )}>
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                  run.status === 'Paid' ? (isDark ? "bg-green-500/10 text-green-500" : "bg-green-50 text-green-600") : 
                  run.status === 'Rejected' ? (isDark ? "bg-red-500/10 text-red-500" : "bg-red-50 text-red-600") :
                  run.status === 'Submitted' ? (isDark ? "bg-blue-500/10 text-blue-500" : "bg-blue-50 text-blue-600") :
                  (isDark ? "bg-orange-500/10 text-orange-500" : "bg-orange-50 text-orange-600")
                )}>
                  {run.status === 'Paid' ? <CheckCircle2 className="w-7 h-7" /> : 
                   run.status === 'Rejected' ? <X className="w-7 h-7" /> :
                   run.status === 'Submitted' ? <Send className="w-6 h-6" /> :
                   <Clock className="w-7 h-7" />}
                </div>
                <div>
                  <h4 className={cn("text-lg font-bold", isDark ? "text-white" : "text-space-gray")}>{run.period}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{run.id.slice(0, 8)}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-xs text-gray-500">{run.employeeCount} Employees</span>
                  </div>
                  {run.status === 'Rejected' && run.rejectionReason && (
                    <div className={cn(
                      "mt-2 p-3 rounded-xl border flex items-start gap-2 max-w-sm transition-colors",
                      isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100"
                    )}>
                       <AlertTriangle className="w-3.5 h-3.5 text-red-600 mt-0.5 flex-shrink-0" />
                       <p className={cn("text-[10px] font-medium", isDark ? "text-red-400" : "text-red-700")}>REJECTED: {run.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Payroll</p>
                  <p className={cn("font-bold", isDark ? "text-slate-400" : "text-space-gray")}>{formatCurrency(run.totalGross)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Payroll</p>
                  <p className={cn("font-bold text-accent")}>{formatCurrency(run.totalNet)}</p>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    run.status === 'Paid' ? "text-green-500" : 
                    run.status === 'Rejected' ? "text-red-500" :
                    run.status === 'Submitted' ? "text-blue-500" :
                    "text-orange-500"
                  )}>{run.status}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {run.status === 'Submitted' && canApprove && (
                  <div className="flex items-center gap-2 mr-4">
                     <button 
                      onClick={() => onRejectRun(run)}
                      className={cn(
                        "p-3 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold",
                        isDark ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"
                      )}
                     >
                       Reject
                     </button>
                     <button 
                      onClick={() => onApproveRun(run)}
                      className={cn(
                        "p-3 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold",
                        isDark ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-green-50 text-green-600 hover:bg-green-100"
                      )}
                     >
                       Approve & Pay
                     </button>
                  </div>
                )}
                {run.status === 'Rejected' && (
                  <button 
                    onClick={() => onCloneRun(run)}
                    className="p-3 bg-accent text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-xs font-bold mr-4"
                  >
                    <Plus className="w-4 h-4" />
                    Clone & Edit
                  </button>
                )}
                <button 
                  onClick={() => onDownloadReport(`Payroll_Report_${run.period.replace(' ', '_')}`)}
                  className={cn("p-3 rounded-xl transition-colors group-hover:text-accent", isDark ? "text-slate-500 hover:bg-white/5" : "text-gray-400 hover:bg-apple-gray")}
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => alert('Opening more options...')}
                  className={cn("p-3 rounded-xl transition-colors", isDark ? "text-slate-500 hover:bg-white/5" : "text-gray-400 hover:bg-apple-gray")}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PayslipTemplate = ({ data, rates, taxBands, isDark }: any) => {
  const { gross, paye, nssaEmployee, aidsLevy, necLevy, otherDeductions, totalDeductions, netPay, nssaEmployer, zimdef, saz, wcif } = calculatePayrollForEmployee(data, rates, taxBands);

  return (
    <div className={cn(
      "p-8 md:p-12 space-y-10 font-sans max-w-4xl mx-auto shadow-2xl rounded-[2.5rem] border transition-colors",
      isDark ? "bg-slate-900 border-white/5 text-white" : "bg-white border-black/[0.05] text-space-gray"
    )}>
      {/* Header */}
      <div className={cn(
        "flex flex-col md:flex-row justify-between gap-8 border-b pb-10 transition-colors",
        isDark ? "border-white/5" : "border-black/[0.05]"
      )}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white font-bold text-2xl">Z</div>
            <div>
              <h2 className={cn("text-2xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-space-gray")}>ZivoHR</h2>
              <p className={cn("text-xs transition-colors", isDark ? "text-slate-500" : "text-gray-500")}>123 Samora Machel Ave, Harare</p>
            </div>
          </div>
          <div className="pt-4">
            <p className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Pay Period</p>
            <p className={cn("text-lg font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>April 2026</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
          <div>
            <p className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Employee Name</p>
            <p className={cn("font-bold transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>{data.name || 'Alex Rivera'}</p>
          </div>
          <div>
            <p className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Employee No.</p>
            <p className={cn("font-bold transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>{data.employeeNumber}</p>
          </div>
          <div>
            <p className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>NSSA Number</p>
            <p className={cn("font-bold transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>{data.statutory.nssaNumber}</p>
          </div>
          <div>
            <p className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>NEC Grade</p>
            <p className={cn("font-bold transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>{data.statutory.necGrade}</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={cn("border-b-2 transition-colors", isDark ? "border-white/5" : "border-black/[0.05]")}>
              <th className={cn("py-4 text-xs font-bold uppercase tracking-widest transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Description</th>
              <th className={cn("py-4 text-xs font-bold uppercase tracking-widest text-right transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Current (USD)</th>
              <th className={cn("py-4 text-xs font-bold uppercase tracking-widest text-right transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>YTD (USD)</th>
            </tr>
          </thead>
          <tbody className={cn("divide-y transition-colors", isDark ? "divide-white/5" : "divide-black/[0.03]")}>
            {/* Earnings */}
            <tr>
              <td className={cn("py-4 font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>Basic Salary</td>
              <td className="py-4 text-right font-bold">{formatCurrency(data.salaryStructure.basicSalary)}</td>
              <td className={cn("py-4 text-right transition-colors", isDark ? "text-slate-500" : "text-gray-500")}>{formatCurrency(data.ytd.gross + data.salaryStructure.basicSalary)}</td>
            </tr>
            {data.salaryStructure.fixedAllowances.map((allow: any) => (
              <tr key={allow.type}>
                <td className={cn("py-4 transition-colors", isDark ? "text-slate-400" : "text-gray-600")}>{allow.type} Allowance</td>
                <td className="py-4 text-right font-medium">{formatCurrency(allow.amount)}</td>
                <td className={cn("py-4 text-right transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>-</td>
              </tr>
            ))}
            <tr className={cn("transition-colors", isDark ? "bg-white/5" : "bg-apple-gray/30")}>
              <td className={cn("py-4 px-4 font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>Total Earnings (Gross)</td>
              <td className="py-4 px-4 text-right font-black">{formatCurrency(gross)}</td>
              <td className={cn("py-4 px-4 text-right font-bold transition-colors", isDark ? "text-slate-500" : "text-gray-500")}>{formatCurrency(data.ytd.gross + gross)}</td>
            </tr>

            {/* Deductions */}
            <tr>
              <td className="py-4 text-red-500 font-medium">PAYE (ZIMRA)</td>
              <td className="py-4 text-right text-red-500 font-bold">({formatCurrency(paye)})</td>
              <td className={cn("py-4 text-right transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>{formatCurrency(data.ytd.paye + paye)}</td>
            </tr>
            <tr>
              <td className="py-4 text-red-500 font-medium">AIDS Levy (3% of PAYE)</td>
              <td className="py-4 text-right text-red-500 font-bold">({formatCurrency(aidsLevy)})</td>
              <td className={cn("py-4 text-right transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>-</td>
            </tr>
            <tr>
              <td className="py-4 text-red-500 font-medium">NSSA (Employee 4.5%)</td>
              <td className="py-4 text-right text-red-500 font-bold">({formatCurrency(nssaEmployee)})</td>
              <td className={cn("py-4 text-right transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>{formatCurrency(data.ytd.nssa + nssaEmployee)}</td>
            </tr>
            <tr>
              <td className="py-4 text-red-500 font-medium">NEC Levy</td>
              <td className="py-4 text-right text-red-500 font-bold">({formatCurrency(necLevy)})</td>
              <td className={cn("py-4 text-right transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>-</td>
            </tr>
            {data.salaryStructure.fixedDeductions.map((ded: any) => (
              <tr key={ded.type}>
                <td className="py-4 text-red-500 font-medium">{ded.type}</td>
                <td className="py-4 text-right text-red-500 font-bold">({formatCurrency(ded.amount)})</td>
                <td className={cn("py-4 text-right transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>-</td>
              </tr>
            ))}
            <tr className={cn("transition-colors", isDark ? "bg-red-500/10" : "bg-red-50/50")}>
              <td className={cn("py-4 px-4 font-bold transition-colors", isDark ? "text-red-400" : "text-red-600")}>Total Deductions</td>
              <td className={cn("py-4 px-4 text-right font-black transition-colors", isDark ? "text-red-400" : "text-red-600")}>({formatCurrency(totalDeductions)})</td>
              <td className={cn("py-4 px-4 text-right font-bold transition-colors", isDark ? "text-red-500/40" : "text-red-400")}>-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net Pay Box */}
      <div className="bg-accent p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-accent/20">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Net Take-Home Pay</p>
          <div className="flex flex-col">
            <h3 className="text-4xl font-black">{formatCurrency(netPay)}</h3>
            {rates.zigRate > 1 && (
              <p className="text-sm font-bold opacity-90 mt-1">
                ≈ {(netPay * rates.zigRate).toLocaleString()} ZiG 
                <span className="text-[10px] ml-2 opacity-70">(@ {rates.zigRate})</span>
              </p>
            )}
          </div>
        </div>
        <div className="text-center md:text-right space-y-1">
          <p className="text-sm font-bold">Bank: {data.bankDetails.bankName}</p>
          <p className="text-xs opacity-80">Acc: {data.bankDetails.accountNumber}</p>
        </div>
      </div>

      {/* Employer Contributions */}
      <div className={cn("p-8 rounded-3xl space-y-4 transition-colors", isDark ? "bg-white/5" : "bg-apple-gray/30")}>
        <h4 className={cn("text-xs font-bold uppercase tracking-widest transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Employer Contributions (Not deducted from Net Pay)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className={cn("text-[10px] uppercase transition-colors", isDark ? "text-slate-500" : "text-gray-500")}>NSSA (4.5%)</p>
            <p className="font-bold text-sm">{formatCurrency(nssaEmployer)}</p>
          </div>
          <div>
            <p className={cn("text-[10px] uppercase transition-colors", isDark ? "text-slate-500" : "text-gray-500")}>ZIMDEF (1%)</p>
            <p className={cn("font-bold text-sm transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>{formatCurrency(zimdef)}</p>
          </div>
          <div>
            <p className={cn("text-[10px] uppercase transition-colors", isDark ? "text-slate-500" : "text-gray-500")}>SAZ Levy (0.5%)</p>
            <p className={cn("font-bold text-sm transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>{formatCurrency(saz)}</p>
          </div>
          <div>
            <p className={cn("text-[10px] uppercase transition-colors", isDark ? "text-slate-500" : "text-gray-500")}>WCIF (0.5%)</p>
            <p className={cn("font-bold text-sm transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>{formatCurrency(wcif)}</p>
          </div>
        </div>
      </div>

      <div className={cn("text-center pt-10 border-t transition-colors", isDark ? "border-white/5" : "border-black/[0.05]")}>
        <p className={cn("text-xs italic transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>This is a system-generated payslip and does not require a signature.</p>
        <p className={cn("text-[10px] mt-2 transition-colors", isDark ? "text-slate-600" : "text-gray-300")}>Generated by ZivoHR on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function Payroll({ userProfile }: { userProfile: UserProfile | null }) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('Overview');
  const [rates, setRates] = useState<StatutoryRates>(DEFAULT_STATUTORY_RATES);
  const [taxBands, setTaxBands] = useState<any[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(MOCK_PAYROLL_RUNS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initPayroll() {
      if (!userProfile?.companyId) return;
      
      try {
        setLoading(true);
        const [bands, runs, empList] = await Promise.all([
          payrollService.getTaxBands(),
          payrollService.getPayrollRuns(userProfile.companyId),
          payrollService.getPayrollProfiles(userProfile.companyId)
        ]);
        
        setTaxBands(bands);
        
        if (empList && empList.length > 0) {
          const mappedEmployees = empList.map(e => ({
            id: e.id,
            companyId: e.company_id,
            firstName: e.first_name,
            lastName: e.last_name,
            email: e.email,
            role: e.role,
            department: e.department,
            status: e.status,
            employeeId: e.employee_id,
            startDate: e.start_date,
            avatarUrl: e.avatar_url,
            baseSalary: e.base_salary
          }));
          setEmployees(mappedEmployees);

          const mappedProfiles = mappedEmployees.map(e => ({
            employeeId: e.id,
            employeeNumber: e.employeeId,
            payGrade: 'Grade 1',
            paymentMethod: 'Bank Transfer' as any,
            bankDetails: {
              bankName: 'CABS',
              accountNumber: '1234567890',
              branchCode: '001'
            },
            salaryStructure: {
              basicSalary: e.baseSalary || 0,
              fixedAllowances: [],
              fixedDeductions: []
            },
            statutory: {
              nssaNumber: '',
              necGrade: 'Grade 1',
              taxCode: 'P1'
            }
          }));
          setProfiles(mappedProfiles);
        }

        if (runs && runs.length > 0) {
          const mappedRuns = runs.map(r => ({
            id: r.id,
            period: r.period,
            status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
            totalGross: r.total_gross || 0,
            totalNet: r.total_net || 0,
            employeeCount: r.employee_count || 0,
            processedAt: r.processed_at,
            requestedById: r.requested_by_id,
            requestedByName: r.requested_by_name,
            approvedById: r.approved_by_id,
            approvedByName: r.approved_by_name,
            rejectionReason: r.rejection_reason
          }));
          setPayrollRuns(mappedRuns);
        }

        // Fetch central settings
        const settings = await settingsService.getSettings(userProfile.companyId);
        if (settings) {
          setRates(settings.statutoryRates);
        }
      } catch (error) {
        console.error("Error initializing payroll:", error);
      } finally {
        setLoading(false);
      }
    }

    initPayroll();
  }, [userProfile?.companyId]);
  const [profiles, setProfiles] = useState<PayrollProfile[]>(MOCK_PAYROLL_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<PayrollProfile | null>(null);
  const [showRunPayroll, setShowRunPayroll] = useState(false);
  const [payrollStep, setPayrollStep] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState('April 2026');
  const [lockDate, setLockDate] = useState('2026-04-25');
  const [customAdjustments, setCustomAdjustments] = useState<Record<string, { type: 'deduction' | 'allowance', label: string, amount: number }[]>>({});

  const handleAddAdjustment = (employeeId: string) => {
    const label = prompt("Enter adjustment label (e.g., Advance Repayment, Canteen, Bonus):");
    if (!label) return;
    const amountStr = prompt("Enter amount (USD):");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return;
    const type = prompt("Is this a Deduction or Allowance? (Enter 'd' for Deduction, 'a' for Allowance)")?.toLowerCase() === 'a' ? 'allowance' : 'deduction';

    setCustomAdjustments(prev => ({
      ...prev,
      [employeeId]: [...(prev[employeeId] || []), { type, label, amount }]
    }));
  };

  const handleCloneRun = (run: PayrollRun) => {
    setSelectedPeriod(run.period);
    // In a real app, we would fetch the specific adjustments for this run
    setShowRunPayroll(true);
    setPayrollStep(1);
    alert(`Cloning run ${run.id} for ${run.period}. You can now make adjustments and resubmit.`);
  };

  const handleApproveRun = async (run: PayrollRun) => {
    if (!userProfile?.companyId) return;
    const confirm = window.confirm(`Are you sure you want to approve and pay the payroll for ${run.period}? This will finalize all net payments.`);
    if (!confirm) return;

    try {
      await payrollService.updatePayrollRunStatus(run.id, 'paid', userProfile.uid, userProfile.fullName);
      setPayrollRuns(prev => prev.map(r => r.id === run.id ? { ...r, status: 'Paid', approvedById: userProfile.uid, approvedByName: userProfile.fullName } : r))
      alert('Payroll approved and payments finalized!');
    } catch (err) {
      console.error(err);
      alert('Failed to approve payroll.');
    }
  };

  const handleRejectRun = async (run: PayrollRun) => {
    const reason = prompt("Enter the reason for rejection:");
    if (!reason) return;

    try {
      await payrollService.updatePayrollRunStatus(run.id, 'rejected', userProfile?.uid, userProfile?.fullName, reason);
      setPayrollRuns(prev => prev.map(r => r.id === run.id ? { ...r, status: 'Rejected', rejectionReason: reason } : r));
      alert('Payroll run has been rejected.');
    } catch (err) {
      console.error(err);
      alert('Failed to reject payroll.');
    }
  };

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [variableInputs, setVariableInputs] = useState<Record<string, any>>({});
  const [isSavingVariable, setIsSavingVariable] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const handleUpdateVariableInput = (employeeId: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setVariableInputs(prev => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || { overtime: 0, bonus: 0, incentives: 0, commission: 0 }),
        [field]: numValue
      }
    }));
  };

  const calculateTotalVariable = (employeeId: string) => {
    const inputs = variableInputs[employeeId] || { overtime: 0, bonus: 0, incentives: 0, commission: 0 };
    return inputs.overtime + inputs.bonus + inputs.incentives + inputs.commission;
  };

  const handleSaveVariableInputs = () => {
    setIsSavingVariable(true);
    setTimeout(() => {
      setIsSavingVariable(false);
      alert('All variable inputs saved successfully and synced with payroll engine.');
    }, 1500);
  };

  const handleBulkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingVariable(true);
    setTimeout(() => {
      setIsSavingVariable(false);
      setShowBulkUpload(false);
      alert('Bulk upload successful! 12 records updated from Excel template.');
    }, 2000);
  };
  const [lockedPeriods, setLockedPeriods] = useState<string[]>(['March 2026', 'February 2026']);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [reportReady, setReportReady] = useState<string | null>(null);

  const handleGenerateReport = (reportName: string) => {
    setGeneratingReport(reportName);
    setTimeout(() => {
      setGeneratingReport(null);
      setReportReady(reportName);
    }, 2000);
  };

  const stats = useMemo(() => [
    { label: 'Gross Payroll', value: '$46,200', change: '+4.2%', trend: 'up' },
    { label: 'Net Payroll', value: '$33,700', change: '+3.8%', trend: 'up' },
    { label: 'Statutory Total', value: '$12,500', change: '+5.1%', trend: 'up' },
    { label: 'Employer Cost', value: '$49,800', change: '+4.5%', trend: 'up' },
  ], []);

  const compliance = useMemo(() => [
    { label: 'ZIMRA (PAYE)', value: 8450, dueDate: 'May 10' },
    { label: 'NSSA (POBS)', value: 2100, dueDate: 'May 10' },
    { label: 'ZIMDEF', value: 462, dueDate: 'May 10' },
    { label: 'NEC Levy', value: 125, dueDate: 'May 10' },
    { label: 'SAZ Levy', value: 231, dueDate: 'May 10' },
    { label: 'WCIF', value: 231, dueDate: 'May 10' },
  ], []);

  const alerts = useMemo(() => [
    { type: 'error', title: 'Missing NSSA Numbers', desc: '3 employees are missing NSSA numbers. This will block statutory reporting.' },
    { type: 'warning', title: 'NSSA Cap Reached', desc: '5 employees have reached the USD $700 NSSA cap this month.' },
    { type: 'warning', title: 'Unapproved Overtime', desc: '12 hours of overtime for the Engineering team are pending approval.' },
  ], []);

  const menuItems = [
    { id: 'Overview', icon: TrendingUp },
    { id: 'Employees', icon: Users },
    { id: 'Salary Structures', icon: Building2 },
    { id: 'Variable Inputs', icon: Plus },
    { id: 'Payroll Runs', icon: DollarSign },
    { id: 'Payslips', icon: FileText },
    { id: 'Statutory Reports', icon: FileBarChart },
    { id: 'Settings', icon: Settings },
  ];

  return (
    <div className={cn("space-y-8 pb-20 transition-colors", isDark ? "text-slate-300" : "text-gray-600")}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={cn("text-4xl font-bold tracking-tight transition-colors", isDark ? "text-white" : "text-space-gray")}>Payroll & Compliance</h1>
          <p className="text-gray-500 mt-1">Zimbabwean-focused payroll engine with automated statutory handling.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-4 py-2 rounded-xl border flex items-center gap-2 transition-colors",
            isDark ? "bg-green-500/10 border-green-500/20" : "bg-green-50 border-green-100"
          )}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-green-500" : "text-green-600")}>System Compliant</span>
          </div>
          <button 
            onClick={() => alert('Opening Notifications...')}
            className={cn(
              "p-3 border rounded-xl shadow-sm transition-all",
              isDark ? "bg-slate-900 border-slate-800 hover:bg-white/5" : "bg-white border-black/[0.05] hover:bg-apple-gray"
            )}
          >
            <Bell className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={cn(
        "flex overflow-x-auto no-scrollbar border rounded-[2rem] p-1.5 shadow-sm transition-colors",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
      )}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-bold transition-all whitespace-nowrap",
              activeTab === item.id 
                ? "bg-accent text-white shadow-lg shadow-accent/20" 
                : (isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-space-gray hover:bg-apple-gray/50")
            )}
          >
            <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-white" : "text-gray-400")} />
            {item.id}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'Overview' && <DashboardView stats={stats} compliance={compliance} alerts={alerts} isDark={isDark} />}
        {activeTab === 'Employees' && <EmployeePayrollView employees={employees} profiles={profiles} onSelect={setSelectedProfile} isDark={isDark} />}
        {activeTab === 'Salary Structures' && <SalaryStructureView rates={rates} onUpdateRates={(newRates: any) => setRates({...rates, ...newRates})} isDark={isDark} />}
        {activeTab === 'Payroll Runs' && <PayrollRunView runs={payrollRuns} onStartRun={() => setShowRunPayroll(true)} onDownloadReport={handleGenerateReport} onCloneRun={handleCloneRun} onApproveRun={handleApproveRun} onRejectRun={handleRejectRun} userRole={userProfile?.role} isDark={isDark} />}
        
        {activeTab === 'Variable Inputs' && (
          <div className="space-y-8">
            <div className={cn(
              "border rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors",
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
            )}>
              <div>
                <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-space-gray")}>Monthly Variable Inputs</h3>
                <p className="text-gray-500 mt-1">Input overtime, bonuses, and special incentives for the current period.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleGenerateReport('Variable_Input_Template')}
                  className={cn(
                    "flex-1 md:flex-none py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors",
                    isDark ? "bg-white/5 text-white border border-white/5 hover:bg-white/10" : "bg-apple-gray text-space-gray hover:bg-apple-gray/50 text-xs"
                  )}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download Template</span>
                  <span className="sm:hidden">Template</span>
                </button>
                <button 
                  onClick={() => setShowBulkUpload(true)}
                  className="flex-1 md:flex-none btn-primary px-6 py-3 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Bulk Upload (Excel)</span>
                  <span className="sm:hidden">Upload</span>
                </button>
              </div>
            </div>

            <div className={cn(
              "border rounded-[2.5rem] overflow-hidden shadow-sm transition-colors",
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
            )}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className={cn("border-b transition-colors", isDark ? "border-white/5 bg-white/5" : "border-black/[0.05] bg-apple-gray/30")}>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overtime (USD)</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bonus (USD)</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incentives</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commission</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Total Variable</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y transition-colors", isDark ? "divide-white/5" : "divide-black/[0.05]")}>
                    {profiles.map((profile) => {
                      const emp = MOCK_EMPLOYEES.find(e => e.id === profile.employeeId);
                      const inputs = variableInputs[profile.employeeId] || { overtime: 0, bonus: 0, incentives: 0, commission: 0 };
                      return (
                        <tr key={profile.employeeId} className={cn("transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray/20")}>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                                isDark ? "bg-accent/20 text-accent" : "bg-accent/10 text-accent"
                              )}>
                                {emp?.firstName[0]}
                              </div>
                              <span className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>{emp?.firstName} {emp?.lastName}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <input 
                              type="number" 
                              value={inputs.overtime} 
                              onChange={(e) => handleUpdateVariableInput(profile.employeeId, 'overtime', e.target.value)}
                              className={cn(
                                "w-20 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                                isDark ? "bg-white/5 border-white/5 text-white" : "bg-apple-gray/50 border-black/[0.05]"
                              )} 
                            />
                          </td>
                          <td className="px-8 py-6">
                            <input 
                              type="number" 
                              value={inputs.bonus} 
                              onChange={(e) => handleUpdateVariableInput(profile.employeeId, 'bonus', e.target.value)}
                              className={cn(
                                "w-24 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                                isDark ? "bg-white/5 border-white/5 text-white" : "bg-apple-gray/50 border-black/[0.05]"
                              )} 
                            />
                          </td>
                          <td className="px-8 py-6">
                            <input 
                              type="number" 
                              value={inputs.incentives} 
                              onChange={(e) => handleUpdateVariableInput(profile.employeeId, 'incentives', e.target.value)}
                              className={cn(
                                "w-24 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                                isDark ? "bg-white/5 border-white/5 text-white" : "bg-apple-gray/50 border-black/[0.05]"
                              )} 
                            />
                          </td>
                          <td className="px-8 py-6">
                            <input 
                              type="number" 
                              value={inputs.commission} 
                              onChange={(e) => handleUpdateVariableInput(profile.employeeId, 'commission', e.target.value)}
                              className={cn(
                                "w-24 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                                isDark ? "bg-white/5 border-white/5 text-white" : "bg-apple-gray/50 border-black/[0.05]"
                              )} 
                            />
                          </td>
                          <td className="px-8 py-6 text-right font-bold text-accent">
                            {formatCurrency(calculateTotalVariable(profile.employeeId))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className={cn("p-8 border-t flex justify-end transition-colors", isDark ? "border-white/5 bg-white/5" : "border-black/[0.05]")}>
                <button 
                  onClick={handleSaveVariableInputs}
                  disabled={isSavingVariable}
                  className={cn(
                    "btn-primary px-8 py-3 flex items-center gap-2 shadow-lg shadow-accent/20 transition-all active:scale-95",
                    isSavingVariable && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSavingVariable ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save All Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Statutory Reports' && (
          <div className="space-y-8">
            <div className={cn(
              "border rounded-[2.5rem] p-6 md:p-8 shadow-sm transition-colors",
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
            )}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-space-gray")}>Remittance Reports</h3>
                  <p className="text-gray-500 mt-1">Generate submission-ready schedules for ZIMRA, NSSA, and NEC.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => alert('Opening Period Filter...')}
                    className={cn(
                      "w-full md:w-auto py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm",
                      isDark ? "bg-white/5 text-white border border-white/5 hover:bg-white/10" : "bg-apple-gray text-space-gray hover:bg-apple-gray/50 text-xs"
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    Filter Period
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'ZIMRA P2 (PAYE)', icon: Building2, desc: 'Monthly PAYE and AIDS Levy remittance schedule.', color: 'text-blue-600', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' },
                { name: 'NSSA P4 Schedule', icon: ShieldCheck, desc: 'Employee and Employer POBS contributions.', color: 'text-green-600', bg: isDark ? 'bg-green-500/10' : 'bg-green-50' },
                { name: 'NEC Sector Report', icon: Briefcase, desc: 'NEC levies and grade-based contributions.', color: 'text-purple-600', bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50' },
                { name: 'ZIMDEF Schedule', icon: TrendingUp, desc: '1% Employer training levy summary.', color: 'text-orange-600', bg: isDark ? 'bg-orange-500/10' : 'bg-orange-50' },
                { name: 'WCIF Assessment', icon: AlertCircle, desc: 'Workers Compensation Insurance Fund report.', color: 'text-red-600', bg: isDark ? 'bg-red-500/10' : 'bg-red-50' },
                { name: 'Bank Transfer File', icon: CreditCard, desc: 'Bulk payment file for bank integration.', color: 'text-slate-500', bg: isDark ? 'bg-white/5' : 'bg-gray-50' },
              ].map((report) => (
                <div key={report.name} className={cn(
                  "border rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all group",
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
                )}>
                  <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors", report.bg)}>
                    <report.icon className={cn("w-6 h-6 md:w-7 md:h-7 transition-colors", isDark ? "text-white" : report.color)} />
                  </div>
                  <h4 className={cn("text-lg font-bold mb-2 transition-colors", isDark ? "text-white" : "text-space-gray")}>{report.name}</h4>
                  <p className="text-sm text-gray-500 mb-6 md:mb-8 leading-relaxed">{report.desc}</p>
                  <button 
                    onClick={() => handleGenerateReport(report.name)}
                    className={cn(
                      "w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                      isDark ? "bg-white/5 text-slate-300 hover:bg-accent hover:text-white" : "bg-apple-gray text-space-gray group-hover:bg-accent group-hover:text-white"
                    )}
                  >
                    <Download className="w-4 h-4" />
                    Generate Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Placeholder for other tabs */}
        {activeTab === 'Payslips' && (
          <div className="space-y-8">
            <div className={cn(
              "border rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors",
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
            )}>
              <div>
                <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-space-gray")}>Employee Payslips</h3>
                <p className="text-gray-500 mt-1">View and distribute payslips for the current period.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleGenerateReport('Bulk Payslips')}
                  className={cn(
                    "flex-1 md:flex-none py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm",
                    isDark ? "bg-white/5 text-white border border-white/5 hover:bg-white/10" : "bg-apple-gray text-space-gray hover:bg-apple-gray/50 text-xs"
                  )}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Bulk Download</span>
                  <span className="sm:hidden">Bulk</span>
                </button>
                <button 
                  onClick={() => alert('Sending all payslips via email...')}
                  className="flex-1 md:flex-none btn-primary px-6 py-3 flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Email All</span>
                  <span className="sm:hidden">Email</span>
                </button>
              </div>
            </div>

            <div className={cn(
              "border rounded-[2.5rem] overflow-hidden shadow-sm transition-colors",
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
            )}>
              <div className={cn("p-6 border-b transition-colors", isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/30 border-black/[0.05]")}>
                <div className="flex items-center gap-4">
                  <label className={cn("text-xs font-bold uppercase", isDark ? "text-slate-500" : "text-gray-400")}>Period:</label>
                  <select 
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className={cn(
                      "border-none rounded-xl px-4 py-2 text-sm font-bold shadow-sm outline-none transition-colors",
                      isDark ? "bg-slate-800 text-white" : "bg-white text-space-gray"
                    )}
                  >
                    {[...new Set(payrollRuns.map(r => r.period))].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={cn("border-b transition-colors", isDark ? "border-white/5 bg-white/5" : "border-black/[0.05] bg-apple-gray/30")}>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Period</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Pay</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y transition-colors", isDark ? "divide-white/5" : "divide-black/[0.05]")}>
                    {profiles.map((profile) => {
                      const emp = employees.find(e => e.id === profile.employeeId);
                      const calc = calculatePayrollForEmployee(profile, rates, taxBands);
                      const run = payrollRuns.find(r => r.period === selectedPeriod);
                      
                      const isEmployee = userProfile?.role === 'employee';
                      const isOwnPayslip = emp?.id === userProfile?.uid;
                      const isApproved = run?.status === 'Paid';

                      if (isEmployee && (!isOwnPayslip || !isApproved)) return null;

                      return (
                        <tr key={profile.employeeId} className={cn("transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray/20")}>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors",
                                isDark ? "bg-accent/20 text-accent" : "bg-accent/10 text-accent"
                              )}>
                                {emp?.firstName[0]}
                              </div>
                              <div>
                                <p className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>{emp?.firstName} {emp?.lastName}</p>
                                <p className="text-[10px] text-gray-400">{profile.employeeNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-medium text-gray-500">{selectedPeriod}</span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                               <div className={cn(
                                 "w-2 h-2 rounded-full",
                                 run?.status === 'Paid' ? "bg-green-500" : 
                                 run?.status === 'Rejected' ? "bg-red-500" :
                                 "bg-orange-500"
                               )} />
                               <span className={cn("text-xs font-bold transition-colors", isDark ? "text-slate-300" : "text-space-gray")}>{run?.status || 'Draft'}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={cn("text-sm font-bold transition-colors", isDark ? "text-slate-300" : "text-space-gray")}>{formatCurrency(calc.netPay)}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-end gap-2 text-gray-400">
                              {(!isEmployee || isApproved) && (
                                <>
                                  <button 
                                    onClick={() => setSelectedProfile({...profile, period: selectedPeriod})}
                                    className={cn("p-3 rounded-xl transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray")}
                                    title="View Template"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </button>
                                  <button 
                                    onClick={() => emp && generatePayslipPDF(emp, profile, calc, selectedPeriod)}
                                    className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-accent/20 hover:text-accent" : "hover:bg-accent/10 hover:text-accent")}
                                    title="Download PDF"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {!isEmployee && (
                                <>
                                  <button 
                                    onClick={() => alert(`Emailing payslip to ${emp?.email}...`)}
                                    className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-blue-500/20 hover:text-blue-400" : "hover:bg-blue-50 hover:text-blue-600")}
                                    title="Send via Email"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const phone = "263772000000"; // Mock phone
                                      const message = `Hello ${emp?.firstName}, your payslip for ${selectedPeriod} is ready. Net Pay: ${formatCurrency(calc.netPay)}`;
                                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-green-500/20 hover:text-green-400" : "hover:bg-green-50 hover:text-green-600")}
                                    title="Send via WhatsApp"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className={cn("md:hidden divide-y transition-colors", isDark ? "divide-white/5" : "divide-black/[0.05]")}>
                {profiles.map((profile) => {
                  const emp = employees.find(e => e.id === profile.employeeId);
                  const calc = calculatePayrollForEmployee(profile, rates, taxBands);
                  const run = payrollRuns.find(r => r.period === selectedPeriod);
                  
                  const isEmployee = userProfile?.role === 'employee';
                  const isOwnPayslip = emp?.id === userProfile?.uid;
                  const isApproved = run?.status === 'Paid';

                  if (isEmployee && (!isOwnPayslip || !isApproved)) return null;

                  return (
                    <div key={profile.employeeId} className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors",
                            isDark ? "bg-accent/20 text-accent" : "bg-accent/10 text-accent"
                          )}>
                            {emp?.firstName?.[0] || 'E'}
                          </div>
                          <div>
                            <p className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>{emp?.firstName} {emp?.lastName}</p>
                            <p className={cn("text-[10px] transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>{profile.employeeNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn("text-sm font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>{formatCurrency(calc.netPay)}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                             <div className={cn(
                               "w-1.5 h-1.5 rounded-full",
                               run?.status === 'Paid' ? "bg-green-500" : 
                               run?.status === 'Rejected' ? "bg-red-500" :
                               "bg-orange-500"
                             )} />
                             <p className={cn("text-[9px] font-bold uppercase transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>{run?.status || 'Draft'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(!isEmployee || isApproved) && (
                          <>
                            <button 
                              onClick={() => setSelectedProfile({...profile, period: selectedPeriod})}
                              className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm", isDark ? "bg-slate-800 text-slate-400" : "bg-apple-gray text-gray-400")}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => emp && generatePayslipPDF(emp, profile, calc, selectedPeriod)}
                              className={cn("flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm", isDark ? "bg-slate-800 text-white" : "bg-apple-gray text-space-gray")}
                            >
                              <Download className="w-4 h-4" />
                              PDF
                            </button>
                          </>
                        )}
                        {!isEmployee && (
                          <>
                            <button 
                              onClick={() => alert(`Emailing payslip to ${emp?.email}...`)}
                              className={cn("flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm", isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600")}
                            >
                              <Mail className="w-4 h-4" />
                              Email
                            </button>
                            <button 
                              onClick={() => {
                                const phone = "263772000000"; // Mock phone
                                const message = `Hello ${emp?.firstName}, your payslip for ${selectedPeriod} is ready. Net Pay: ${formatCurrency(calc.netPay)}`;
                                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                              }}
                              className={cn("flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm", isDark ? "bg-green-500/20 text-green-400" : "bg-green-50 text-green-600")}
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                              WA
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className={cn(
            "border rounded-[2.5rem] p-10 md:p-20 text-center space-y-4 transition-colors shadow-sm",
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
          )}>
            <div className={cn(
              "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto transition-colors",
              isDark ? "bg-white/5 text-slate-700" : "bg-apple-gray text-gray-300"
            )}>
              <Lock className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div>
              <h3 className={cn("text-xl font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>Settings Module</h3>
              <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">This module is being optimized for the latest ZIMRA tax tables and NEC sector requirements. Check back soon!</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Employee Profile Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "w-full max-w-6xl rounded-t-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors",
                isDark ? "bg-slate-900" : "bg-white"
              )}
            >
              {/* Modal Header */}
              <div className={cn(
                "p-6 md:p-8 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors",
                isDark ? "bg-slate-800/50 border-white/5" : "bg-gradient-to-r from-apple-gray/50 to-white border-black/[0.05]"
              )}>
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-accent rounded-2xl md:rounded-[1.25rem] flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-accent/20">
                    {(() => {
                      const emp = MOCK_EMPLOYEES.find(e => e.id === selectedProfile.employeeId);
                      return emp ? emp.firstName[0] : '';
                    })()}
                  </div>
                  <div>
                    <h3 className={cn("text-xl md:text-2xl font-black tracking-tight transition-colors", isDark ? "text-white" : "text-space-gray")}>
                      {(() => {
                        const emp = MOCK_EMPLOYEES.find(e => e.id === selectedProfile.employeeId);
                        return emp ? `${emp.firstName} ${emp.lastName}` : '';
                      })()}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded-md">
                        {selectedProfile.employeeNumber}
                      </span>
                      <span className={cn("hidden sm:block w-1 h-1 rounded-full transition-colors", isDark ? "bg-slate-700" : "bg-gray-300")} />
                      <p className="hidden sm:block text-sm font-medium text-gray-500">Payroll Profile</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button 
                    onClick={() => setShowEditProfile(true)}
                    className={cn(
                      "flex-1 sm:flex-none px-4 md:px-6 py-2.5 text-xs md:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all",
                      isDark ? "bg-white/5 text-white border border-white/5 hover:bg-white/10" : "bg-apple-gray text-space-gray border border-black/[0.05] hover:bg-apple-gray/80"
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => setSelectedProfile(null)} 
                    className={cn("p-2.5 md:p-3 rounded-2xl transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray")}
                  >
                    <X className={cn("w-5 h-5 md:w-6 md:h-6 transition-colors", isDark ? "text-slate-500" : "text-gray-400")} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                  {/* Left Column: Details (7/12) */}
                  <div className="lg:col-span-7 space-y-8 md:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                      <div className="space-y-6">
                        <div className={cn("flex items-center gap-3 border-b pb-3 transition-colors", isDark ? "border-white/5" : "border-black/[0.05]")}>
                          <ShieldCheck className="w-5 h-5 text-accent" />
                          <h4 className={cn("text-sm font-bold uppercase tracking-widest transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>Statutory Details</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:gap-5">
                          <div className={cn("p-4 rounded-2xl border transition-colors", isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/20 border-black/[0.02]")}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">NSSA Number</p>
                            <p className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>{selectedProfile.statutory.nssaNumber}</p>
                          </div>
                          <div className={cn("p-4 rounded-2xl border transition-colors", isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/20 border-black/[0.02]")}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">NEC Grade</p>
                            <p className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>{selectedProfile.statutory.necGrade}</p>
                          </div>
                          <div className={cn("p-4 rounded-2xl border transition-colors", isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/20 border-black/[0.02]")}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tax Status</p>
                            <p className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>{selectedProfile.statutory.taxStatus}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className={cn("flex items-center gap-3 border-b pb-3 transition-colors", isDark ? "border-white/5" : "border-black/[0.05]")}>
                          <CreditCard className="w-5 h-5 text-accent" />
                          <h4 className={cn("text-sm font-bold uppercase tracking-widest transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>Payment Details</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:gap-5">
                          <div className={cn("p-4 rounded-2xl border transition-colors", isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/20 border-black/[0.02]")}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bank Name</p>
                            <p className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>{selectedProfile.bankDetails.bankName}</p>
                          </div>
                          <div className={cn("p-4 rounded-2xl border transition-colors", isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/20 border-black/[0.02]")}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Account Number</p>
                            <p className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>{selectedProfile.bankDetails.accountNumber}</p>
                          </div>
                          <div className={cn("p-4 rounded-2xl border transition-colors", isDark ? "bg-white/5 border-white/5" : "bg-apple-gray/20 border-black/[0.02]")}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Branch</p>
                            <p className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>{selectedProfile.bankDetails.branch}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className={cn("flex items-center gap-3 border-b pb-3 transition-colors", isDark ? "border-white/5" : "border-black/[0.05]")}>
                        <DollarSign className="w-5 h-5 text-accent" />
                        <h4 className={cn("text-sm font-bold uppercase tracking-widest transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>Salary Structure</h4>
                      </div>
                      <div className={cn(
                        "rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border transition-colors",
                        isDark ? "bg-white/5 border-white/5 shadow-inner" : "bg-gradient-to-br from-accent/5 to-apple-gray/20 border-accent/10"
                      )}>
                        <div className="flex justify-between items-center mb-6 md:mb-8">
                          <div>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly Basic Salary</p>
                            <h5 className={cn("text-2xl md:text-3xl font-black transition-colors", isDark ? "text-white" : "text-space-gray")}>{formatCurrency(selectedProfile.salaryStructure.basicSalary)}</h5>
                          </div>
                          <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm transition-colors", isDark ? "bg-white/10" : "bg-white")}>
                            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <p className={cn("text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-2 transition-colors", isDark ? "border-white/5" : "border-black/[0.05]")}>Monthly Allowances</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {selectedProfile.salaryStructure.fixedAllowances.map(allow => (
                              <div key={allow.type} className={cn(
                                "flex justify-between items-center p-3 md:p-4 rounded-xl md:rounded-2xl border transition-colors",
                                isDark ? "bg-white/5 border-white/5" : "bg-white/50 border-white"
                              )}>
                                <span className={cn("text-xs md:text-sm font-bold transition-colors", isDark ? "text-slate-400" : "text-gray-600")}>{allow.type}</span>
                                <span className={cn("text-sm md:text-base font-black transition-colors", isDark ? "text-white" : "text-space-gray")}>{formatCurrency(allow.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Payslip Preview & Actions (5/12) */}
                  <div className="lg:col-span-5 space-y-6 md:space-y-8">
                    <div className={cn("flex items-center gap-3 border-b pb-3 transition-colors", isDark ? "border-white/5" : "border-black/[0.05]")}>
                      <FileText className="w-5 h-5 text-accent" />
                      <h4 className={cn("text-sm font-bold uppercase tracking-widest transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>Payslip Preview</h4>
                    </div>
                    
                    <div className="relative group overflow-hidden rounded-[2rem] sm:rounded-[3rem] shadow-lg">
                      <div className="scale-[0.55] origin-top -mb-[28rem] sm:-mb-[20rem] rounded-[3rem] overflow-hidden border border-black/[0.05] transition-transform group-hover:scale-[0.58]">
                        <PayslipTemplate data={selectedProfile} rates={rates} taxBands={taxBands} isDark={isDark} />
                      </div>
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none transition-opacity",
                        isDark ? "from-slate-900 opacity-60" : "from-white"
                      )} />
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:gap-4 pt-4 md:pt-6">
                      <button 
                        onClick={() => {
                          const emp = employees.find(e => e.id === selectedProfile.employeeId);
                          handleGenerateReport(`Payslip_${emp ? `${emp.firstName}_${emp.lastName}` : 'Employee'}`);
                        }}
                        className="w-full btn-primary py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Download className="w-5 h-5 md:w-6 md:h-6" />
                        Download PDF
                      </button>
                      
                      <button 
                        onClick={() => {
                          const emp = employees.find(e => e.id === selectedProfile.employeeId);
                          const calc = calculatePayrollForEmployee(selectedProfile, rates, taxBands);
                          const phone = "263772240081"; // In real app, use emp.phone
                          const message = `Hi ${emp?.firstName}! Your payslip for ${selectedPeriod} is ready. Net Pay: ${formatCurrency(calc.netPay)}. Download it here: [Link]`;
                          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="w-full bg-[#25D366] text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-xl shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Send via WhatsApp
                      </button>
                      
                      <button 
                        onClick={() => {
                          const emp = employees.find(e => e.id === selectedProfile.employeeId);
                          alert(`Payslip for ${selectedPeriod} has been sent to ${emp?.email} successfully!`);
                        }}
                        className={cn(
                          "w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg transition-all shadow-sm",
                          isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-apple-gray text-space-gray hover:bg-apple-gray/80"
                        )}
                      >
                        <Mail className="w-5 h-5 md:w-6 md:h-6" />
                        Send via Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && selectedProfile && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "w-full max-w-2xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors",
                isDark ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className={cn(
                "p-6 md:p-8 border-b flex items-center justify-between transition-colors",
                isDark ? "bg-slate-800/50 border-white/5" : "bg-apple-gray/10 border-black/[0.05]"
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn("text-lg md:text-xl font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>Edit Payroll Profile</h3>
                    <p className="text-[10px] md:text-xs text-gray-500">
                      {(() => {
                        const emp = employees.find(e => e.id === selectedProfile.employeeId);
                        return emp ? `${emp.firstName} ${emp.lastName}` : '';
                      })()}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowEditProfile(false)} className={cn("p-2 rounded-full transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray")}>
                  <X className={cn("w-5 h-5 transition-colors", isDark ? "text-slate-500" : "text-gray-400")} />
                </button>
              </div>
              <div className="overflow-y-auto">
                <form className="p-6 md:p-8 space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  setShowEditProfile(false);
                  alert('Profile updated successfully!');
                }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className={cn("text-xs font-bold uppercase transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>NSSA Number</label>
                      <input 
                        defaultValue={selectedProfile.statutory.nssaNumber}
                        className={cn(
                          "w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                          isDark ? "bg-white/5 border border-white/5 text-white" : "bg-apple-gray/50 border border-black/[0.05]"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-xs font-bold uppercase transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>NEC Grade</label>
                      <input 
                        defaultValue={selectedProfile.statutory.necGrade}
                        className={cn(
                          "w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                          isDark ? "bg-white/5 border border-white/5 text-white" : "bg-apple-gray/50 border border-black/[0.05]"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-xs font-bold uppercase transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Bank Name</label>
                      <input 
                        defaultValue={selectedProfile.bankDetails.bankName}
                        className={cn(
                          "w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                          isDark ? "bg-white/5 border border-white/5 text-white" : "bg-apple-gray/50 border border-black/[0.05]"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={cn("text-xs font-bold uppercase transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Account Number</label>
                      <input 
                        defaultValue={selectedProfile.bankDetails.accountNumber}
                        className={cn(
                          "w-full rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                          isDark ? "bg-white/5 border border-white/5 text-white" : "bg-apple-gray/50 border border-black/[0.05]"
                        )}
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowEditProfile(false)}
                      className={cn(
                        "w-full sm:flex-1 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-colors",
                        isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-apple-gray text-space-gray hover:bg-apple-gray/80"
                      )}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="w-full sm:flex-1 py-3 md:py-4 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 text-sm md:text-base hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Run Payroll Wizard */}
      <AnimatePresence>
        {showRunPayroll && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[400] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "w-full max-w-2xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors",
                isDark ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className={cn(
                "p-6 md:p-8 border-b flex items-center justify-between transition-colors",
                isDark ? "bg-slate-800/50 border-white/5" : "bg-apple-gray/10 border-black/[0.05]"
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn("text-lg md:text-xl font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>Run Payroll Engine</h3>
                    <p className="text-[10px] md:text-xs text-gray-500">Step {payrollStep} of 3</p>
                  </div>
                </div>
                <button onClick={() => { setShowRunPayroll(false); setPayrollStep(1); }} className={cn("p-2 rounded-full transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray")}>
                  <X className={cn("w-5 h-5 transition-colors", isDark ? "text-slate-500" : "text-gray-400")} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8">
                {payrollStep === 1 && (
                  <div className="space-y-6">
                    <h4 className={cn("font-bold text-sm md:text-base transition-colors", isDark ? "text-white" : "text-space-gray")}>1. Select Pay Period & Lock Date</h4>
                    <div className="space-y-4">
                      <div>
                        <label className={cn("text-[10px] font-bold uppercase tracking-widest mb-2 block transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Pay Period</label>
                        <select 
                          value={selectedPeriod}
                          onChange={(e) => setSelectedPeriod(e.target.value)}
                          className={cn(
                            "w-full border rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all appearance-none",
                            isDark ? "bg-white/5 border-white/5 text-white" : "bg-apple-gray/30 border-black/[0.05] text-space-gray"
                          )}
                        >
                          {['April 2026', 'March 2026', 'February 2026', 'January 2026'].map(p => (
                            <option key={p} value={p}>{p} {lockedPeriods.includes(p) ? '(Locked)' : ''}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className={cn("text-[10px] font-bold uppercase tracking-widest mb-2 block transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Lock Date</label>
                        <div className="relative">
                          <Calendar className={cn("absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", isDark ? "text-slate-500" : "text-gray-400")} />
                          <input 
                            type="date" 
                            value={lockDate}
                            onChange={(e) => setLockDate(e.target.value)}
                            className={cn(
                              "w-full border rounded-2xl pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all",
                              isDark ? "bg-white/5 border-white/5 text-white" : "bg-apple-gray/30 border-black/[0.05] text-space-gray"
                            )}
                          />
                        </div>
                      </div>

                      <div className={cn(
                        "p-6 rounded-3xl border transition-colors",
                        isDark ? "bg-accent/5 border-accent/10" : "bg-accent/[0.03] border-accent/10"
                      )}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                             <TrendingUp className="w-4 h-4 text-accent" />
                             <label className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isDark ? "text-slate-200" : "text-space-gray")}>ZiG Exchange Rate (1 USD = ?)</label>
                          </div>
                          <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md">Live Rate Setting</span>
                        </div>
                        <input 
                          type="number"
                          step="0.01"
                          value={rates.zigRate || 13.5}
                          onChange={(e) => setRates(prev => ({ ...prev, zigRate: parseFloat(e.target.value) }))}
                          className={cn(
                            "w-full border rounded-2xl px-6 py-4 text-xl font-black outline-none focus:ring-2 focus:ring-accent/20 transition-all",
                            isDark ? "bg-white/5 border-white/5 text-white" : "bg-white border-black/[0.05] text-space-gray"
                          )}
                          placeholder="e.g. 13.50"
                        />
                        <p className={cn("text-[10px] mt-3 font-medium transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Used for calculating ZIMRA (PAYE) and NSSA equivalents for local reporting.</p>
                      </div>

                      {lockedPeriods.includes(selectedPeriod) && (
                        <div className={cn("p-4 border rounded-2xl flex gap-3 transition-colors", isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100")}>
                          <Lock className="w-5 h-5 text-red-600 flex-shrink-0" />
                          <p className={cn("text-xs transition-colors", isDark ? "text-red-400" : "text-red-700")}>This period is already locked and cannot be re-processed. Please select a different period.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {payrollStep === 2 && (
                  <div className="space-y-6">
                    <h4 className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>2. Smart Review & Exceptions</h4>
                    <div className="space-y-4">
                      <div className={cn("p-4 border rounded-2xl flex gap-3 transition-colors", isDark ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-100")}>
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <div>
                          <p className={cn("text-xs font-bold transition-colors", isDark ? "text-orange-400" : "text-orange-800")}>NSSA Cap Alert</p>
                          <p className={cn("text-[10px] mt-0.5 transition-colors", isDark ? "text-orange-900/40" : "text-orange-700")}>5 employees have reached the NSSA cap. The system will automatically apply the USD $700 limit for {selectedPeriod}.</p>
                        </div>
                      </div>
                      <div className={cn("p-4 border rounded-2xl flex gap-3 transition-colors", isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100")}>
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                          <p className={cn("text-xs font-bold transition-colors", isDark ? "text-red-400" : "text-red-800")}>Unapproved Overtime</p>
                          <p className={cn("text-[10px] mt-0.5 transition-colors", isDark ? "text-red-900/40" : "text-red-700")}>12 hours of overtime for the Engineering team are pending approval. These will be excluded unless approved.</p>
                        </div>
                      </div>
                      <div className={cn("p-4 border rounded-2xl flex gap-3 transition-colors", isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-100")}>
                        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className={cn("text-xs font-bold transition-colors", isDark ? "text-blue-400" : "text-blue-800")}>Payroll Variance</p>
                          <p className={cn("text-[10px] mt-0.5 transition-colors", isDark ? "text-blue-900/40" : "text-blue-700")}>Payroll is 4.2% higher than last month due to new hires in Engineering.</p>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <h5 className={cn("text-xs font-bold uppercase tracking-widest mb-3 transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Employee Preview</h5>
                        <div className={cn("divide-y border rounded-2xl overflow-hidden max-h-[200px] overflow-y-auto transition-colors", isDark ? "divide-white/5 border-white/5" : "divide-black/[0.05] border-black/[0.05]")}>
                          {profiles.map(p => {
                            const emp = employees.find(e => e.id === p.employeeId);
                            const adjs = customAdjustments[p.employeeId] || [];
                            const calc = calculatePayrollForEmployee(p, rates, taxBands, adjs);
                            return (
                              <div key={p.employeeId} className={cn("p-4 border-b last:border-0 transition-colors", isDark ? "bg-slate-800/50 hover:bg-slate-800 border-white/5" : "bg-white hover:bg-apple-gray/10 border-black/[0.05]")}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-colors", isDark ? "bg-accent/20 text-accent" : "bg-accent/10 text-accent")}>
                                      {emp?.firstName[0]}
                                    </div>
                                    <span className={cn("text-sm font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>{emp?.firstName} {emp?.lastName}</span>
                                  </div>
                                  <button 
                                    onClick={() => handleAddAdjustment(p.employeeId)}
                                    className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" /> Add Adjustment
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-wrap gap-2">
                                    {adjs.map((adj, i) => (
                                      <span key={i} className={cn(
                                        "px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-tight",
                                        adj.type === 'allowance' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                      )}>
                                        {adj.label}: {adj.type === 'allowance' ? '+' : '-'}{formatCurrency(adj.amount)}
                                      </span>
                                    ))}
                                    {adjs.length === 0 && <span className={cn("text-[9px] transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Regular payroll - No changes.</span>}
                                  </div>
                                  <div className="text-right">
                                    <p className={cn("text-sm font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>{formatCurrency(calc.netPay)}</p>
                                    <p className={cn("text-[10px] transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Net Pay</p>
                                    <p className="text-[8px] font-bold text-accent uppercase tracking-tighter">≈ ZiG {calc.netPayZiG.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                  </div>
                                </div>
                                {calc.isOverLimit && (
                                  <div className={cn("mt-2 p-2 border rounded-xl flex items-center gap-2 transition-colors", isDark ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100")}>
                                    <AlertCircle className="w-3 h-3 text-red-600" />
                                    <p className={cn("text-[9px] font-bold uppercase tracking-tighter transition-colors", isDark ? "text-red-400" : "text-red-700")}>
                                      CRITICAL: {calc.deductionLimitWarning}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {payrollStep === 3 && (
                  <div className="space-y-8 text-center py-10">
                    <div className={cn("w-24 h-24 rounded-full flex items-center justify-center text-green-600 mx-auto transition-colors", isDark ? "bg-green-500/10" : "bg-green-50")}>
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div>
                      <h4 className={cn("text-2xl font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>Ready to Finalize</h4>
                      <p className={cn("mt-2 transition-colors", isDark ? "text-slate-400" : "text-gray-500")}>Payroll for <span className="font-bold text-accent">{selectedPeriod}</span></p>
                      <p className={cn("text-sm mt-1 transition-colors", isDark ? "text-slate-500" : "text-gray-500")}>Total Net Remittance: <span className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>$33,700.00</span></p>
                    </div>
                    <div className={cn("p-6 rounded-3xl text-left space-y-4 transition-colors", isDark ? "bg-white/5 border border-white/5" : "bg-apple-gray/30 border border-black/[0.05]")}>
                      <div className="flex justify-between text-sm">
                        <span className={cn("transition-colors", isDark ? "text-slate-400" : "text-gray-500")}>Total Gross</span>
                        <span className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>$46,200.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={cn("transition-colors", isDark ? "text-slate-400" : "text-gray-500")}>Total Statutory (Remittable)</span>
                        <div className="text-right">
                          <p className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>$12,500.00</p>
                          <p className="text-[9px] font-bold text-accent uppercase tracking-widest">≈ ZiG {(12500 * (rates.zigRate || 13.5)).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className={cn("flex justify-between text-sm pt-3 border-t transition-colors", isDark ? "border-white/5" : "border-black/[0.05]")}>
                        <span className={cn("font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>Total Employer Cost</span>
                        <span className="font-black text-accent">$49,800.00</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={cn("p-6 md:p-8 border-t flex flex-col sm:flex-row gap-4 transition-colors", isDark ? "border-white/5 bg-slate-800/30" : "border-black/[0.05] bg-apple-gray/5")}>
                {payrollStep > 1 && (
                  <button onClick={() => setPayrollStep(prev => prev - 1)} className={cn("w-full sm:flex-1 py-4 rounded-xl font-bold transition-colors", isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-apple-gray text-space-gray hover:bg-apple-gray/80 shadow-sm")}>Back</button>
                )}
                <button 
                  onClick={async () => {
                    if (payrollStep < 3) setPayrollStep(prev => prev + 1);
                    else {
                      if (!userProfile?.companyId) return;
                      
                      const isHR = userProfile.role === 'hr';
                      const isChecker = ['owner', 'admin'].includes(userProfile.role);

                      try {
                        // Calculate totals for the run including adjustments
                        let totalGross = 0;
                        let totalNet = 0;
                        
                        const payslipData = profiles.map(p => {
                          const adjs = customAdjustments[p.employeeId] || [];
                          const calc = calculatePayrollForEmployee(p, rates, taxBands, adjs);
                          totalGross += calc.gross;
                          totalNet += calc.netPay;
                          
                          return {
                            employee_id: p.employeeId,
                            gross_salary: calc.gross,
                            net_salary: calc.netPay,
                            tax_amount: calc.paye,
                            pension_amount: calc.nssaEmployee,
                            other_deductions: calc.otherDeductions + calc.necLevy + calc.aidsLevy,
                            is_published: isChecker ? true : false // Only publish payslips if approved
                          };
                        });

                        const newRun: any = {
                          company_id: userProfile.companyId,
                          period: selectedPeriod,
                          total_gross: totalGross,
                          total_net: totalNet,
                          employee_count: profiles.length,
                        };

                        if (isHR) {
                          newRun.status = 'Submitted';
                          newRun.requested_by_id = userProfile.uid;
                          newRun.requested_by_name = userProfile.fullName;
                          const savedRun = await payrollService.createPayrollRun(newRun);
                          // We don't save payslips yet for submitted runs, or we save them as draft
                          alert(`Payroll for ${selectedPeriod} has been submitted for approval.`);
                        } else if (isChecker) {
                          newRun.status = 'Paid';
                          newRun.approved_by_id = userProfile.uid;
                          newRun.approved_by_name = userProfile.fullName;
                          newRun.processed_at = new Date().toISOString();
                          const savedRun = await payrollService.createPayrollRun(newRun);
                          await payrollService.finalizePayrollRun(savedRun.id, payslipData);
                          alert(`Payroll for ${selectedPeriod} has been approved and processed!`);
                        }

                        // Refresh runs (this is a simple way, better would be to re-fetch)
                        const runs = await payrollService.getPayrollRuns(userProfile.companyId);
                        setPayrollRuns(runs.map(r => ({
                          id: r.id,
                          period: r.period,
                          status: r.status,
                          totalGross: r.total_gross,
                          totalNet: r.total_net,
                          employeeCount: r.employee_count,
                          processedAt: r.processed_at
                        })));

                        if (!isHR) setLockedPeriods(prev => [...prev, selectedPeriod]);
                        setShowRunPayroll(false);
                        setPayrollStep(1);
                        setCustomAdjustments({});
                      } catch (err) {
                        console.error(err);
                        alert("Logic Error: Maker-Checker validation failed. Check permissions.");
                      }
                    }
                  }}
                  disabled={payrollStep === 1 && lockedPeriods.includes(selectedPeriod)}
                  className="w-full sm:flex-1 btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-accent/20"
                >
                  {payrollStep === 3 
                    ? (userProfile?.role === 'hr' ? 'Submit for Approval' : 'Approve & Lock Payroll') 
                    : 'Continue'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Upload Modal */}
      <AnimatePresence>
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[500] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "w-full max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors",
                isDark ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className={cn(
                "p-6 sm:p-8 border-b flex items-center justify-between transition-colors",
                isDark ? "bg-slate-800/50 border-white/5" : "bg-apple-gray/10 border-black/[0.05]"
              )}>
                <h3 className={cn("text-lg sm:text-xl font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>Bulk Upload Variable Inputs</h3>
                <button onClick={() => setShowBulkUpload(false)} className={cn("p-2 rounded-full transition-colors", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray")}>
                  <X className={cn("w-5 h-5 sm:w-6 sm:h-6 transition-colors", isDark ? "text-slate-500" : "text-gray-400")} />
                </button>
              </div>
              <div className="overflow-y-auto">
                <form onSubmit={handleBulkUpload} className="p-6 sm:p-8 space-y-6">
                  <div className={cn(
                    "p-8 sm:p-12 border-2 border-dashed rounded-[2rem] text-center space-y-4 transition-all cursor-pointer group",
                    isDark ? "bg-white/5 border-white/5 hover:border-accent/50" : "bg-apple-gray/20 border-black/[0.05] hover:border-accent/50"
                  )}>
                    <div className={cn(
                      "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto transition-colors",
                      isDark ? "bg-white/5 group-hover:bg-accent/10" : "bg-apple-gray group-hover:bg-accent/10"
                    )}>
                      <Upload className={cn("w-6 h-6 sm:w-8 sm:h-8 transition-colors", isDark ? "text-slate-500 group-hover:text-accent" : "text-gray-400 group-hover:text-accent")} />
                    </div>
                    <div>
                      <p className={cn("font-bold text-sm sm:text-base transition-colors", isDark ? "text-white" : "text-space-gray")}>Click to upload or drag and drop</p>
                      <p className={cn("text-[10px] sm:text-xs transition-colors", isDark ? "text-slate-500" : "text-gray-400")}>Excel or CSV files only (Max 10MB)</p>
                    </div>
                    <input type="file" className="hidden" accept=".xlsx,.xls,.csv" />
                  </div>
                  
                  <div className={cn("p-4 rounded-2xl border flex gap-3 transition-colors", isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-100")}>
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className={cn("text-[10px] sm:text-xs leading-relaxed transition-colors", isDark ? "text-blue-400" : "text-blue-700")}>
                      Please use the official template to ensure data mapping is correct. 
                      <button 
                        type="button"
                        onClick={() => handleGenerateReport('Variable_Input_Template')}
                        className="ml-1 font-bold underline"
                      >
                        Download Template
                      </button>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowBulkUpload(false)}
                      className={cn(
                        "w-full sm:flex-1 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-colors",
                        isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-apple-gray text-space-gray hover:bg-apple-gray/80"
                      )}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="w-full sm:flex-1 py-3 sm:py-4 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Start Upload
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Generation Modal */}
      <AnimatePresence>
        {generatingReport && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[500] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "p-8 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-center space-y-6 max-w-md w-full transition-colors",
                isDark ? "bg-slate-900" : "bg-white"
              )}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h3 className={cn("text-lg sm:text-xl font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>Generating {generatingReport}</h3>
                <p className={cn("text-xs sm:text-sm mt-2 transition-colors", isDark ? "text-slate-500" : "text-gray-500")}>Compiling payroll data and formatting for statutory submission...</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Ready Modal */}
      <AnimatePresence>
        {reportReady && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[500] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-center space-y-8 max-w-md w-full transition-colors",
                isDark ? "bg-slate-900 border border-white/5" : "bg-white"
              )}
            >
              <div className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-green-600 mx-auto transition-colors",
                isDark ? "bg-green-500/10" : "bg-green-50"
              )}>
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h3 className={cn("text-xl sm:text-2xl font-bold transition-colors", isDark ? "text-white" : "text-space-gray")}>Report Ready!</h3>
                <p className={cn("text-xs sm:text-sm mt-2 transition-colors", isDark ? "text-slate-500" : "text-gray-500")}>The {reportReady} has been generated successfully and is ready for download.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setReportReady(null)}
                  className={cn(
                    "w-full sm:flex-1 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-colors",
                    isDark ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-apple-gray text-space-gray hover:bg-apple-gray/80"
                  )}
                >
                  Close
                </button>
                <button className="w-full sm:flex-1 btn-primary py-3 sm:py-4 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-accent/20">
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Helper Components ---

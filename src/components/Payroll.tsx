import React, { useState, useMemo } from 'react';
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
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';
import { MOCK_EMPLOYEES, MOCK_PAYROLL_PROFILES, DEFAULT_STATUTORY_RATES, MOCK_PAYROLL_RUNS } from '../constants';
import { Employee, PayrollProfile, StatutoryRates, PayrollRun } from '../types';

// --- Utility Functions ---

const calculatePAYE = (taxableIncome: number) => {
  // Simplified Zimbabwean USD Monthly Tax Bands (Illustrative)
  const bands = [
    { limit: 300, rate: 0 },
    { limit: 700, rate: 0.20 },
    { limit: 3000, rate: 0.25 },
    { limit: 7000, rate: 0.30 },
    { limit: 10000, rate: 0.35 },
    { limit: Infinity, rate: 0.40 }
  ];

  let tax = 0;
  let remaining = taxableIncome;
  let previousLimit = 0;

  for (const band of bands) {
    const taxableInBand = Math.min(remaining, band.limit - previousLimit);
    if (taxableInBand <= 0) break;
    tax += taxableInBand * band.rate;
    remaining -= taxableInBand;
    previousLimit = band.limit;
  }

  return tax;
};

const calculatePayrollForEmployee = (profile: PayrollProfile, rates: StatutoryRates) => {
  const basic = profile.salaryStructure.basicSalary;
  const allowances = profile.salaryStructure.fixedAllowances.reduce((acc, curr) => acc + curr.amount, 0);
  const gross = basic + allowances;

  // NSSA Calculation
  const nssaInsurable = Math.min(gross, rates.nssaCap);
  const nssaEmployee = nssaInsurable * (rates.nssaEmployeeRate / 100);
  const nssaEmployer = nssaInsurable * (rates.nssaEmployerRate / 100);

  // PAYE Calculation
  const taxableIncome = gross - nssaEmployee; // NSSA is tax deductible
  const paye = calculatePAYE(taxableIncome);
  const aidsLevy = paye * (rates.aidsLevyRate / 100);

  // NEC Levy
  const necLevy = rates.necLevy.type === 'Fixed' 
    ? rates.necLevy.value 
    : gross * (rates.necLevy.value / 100);

  // Other Deductions
  const otherDeductions = profile.salaryStructure.fixedDeductions.reduce((acc, curr) => acc + curr.amount, 0);

  const totalDeductions = nssaEmployee + paye + aidsLevy + necLevy + otherDeductions;
  const netPay = gross - totalDeductions;

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
    otherDeductions,
    totalDeductions,
    netPay,
    zimdef,
    saz,
    wcif,
    totalEmployerCost
  };
};

// --- Sub-components ---

const DashboardView = ({ stats, compliance, alerts }: any) => (
  <div className="space-y-8">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat: any) => (
        <div key={stat.label} className="bg-white border border-black/[0.05] rounded-3xl p-6 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-space-gray">{stat.value}</h3>
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
        <div className="bg-white border border-black/[0.05] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-space-gray">Compliance Dashboard</h3>
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">All Clear</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {compliance.map((item: any) => (
              <div key={item.label} className="space-y-2 p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.02]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-lg font-bold text-space-gray">{formatCurrency(item.value)}</p>
                <p className="text-[10px] text-gray-500">Due: {item.dueDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-black/[0.05] rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-black/[0.05] flex items-center justify-between">
            <h3 className="font-bold text-space-gray">Recent Payroll Activity</h3>
            <button 
              onClick={() => alert('Navigating to full activity log...')}
              className="text-accent text-sm font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-black/[0.05]">
            {MOCK_PAYROLL_RUNS.map((run) => (
              <div key={run.id} className="p-6 flex items-center justify-between hover:bg-apple-gray/20 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    run.status === 'Paid' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                  )}>
                    {run.status === 'Paid' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-space-gray">{run.period}</p>
                    <p className="text-xs text-gray-500">{run.employeeCount} Employees • {run.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-space-gray">{formatCurrency(run.totalNet)}</p>
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
        <div className="bg-white border border-black/[0.05] rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-space-gray">Smart Alerts</h3>
          <div className="space-y-4">
            {alerts.map((alert: any, i: number) => (
              <div key={i} className={cn(
                "p-4 rounded-2xl border flex gap-3",
                alert.type === 'error' ? "bg-red-50 border-red-100 text-red-700" : "bg-orange-50 border-orange-100 text-orange-700"
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

        <div className="bg-accent rounded-3xl p-8 text-white space-y-4 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-lg font-bold">Need Help?</h4>
            <p className="text-sm text-white/80">Our HR experts are available to help you with ZIMRA and NSSA compliance.</p>
            <button 
              onClick={() => alert('Connecting to a Zimbabwean payroll expert...')}
              className="mt-4 bg-white text-accent px-6 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all"
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

const EmployeePayrollView = ({ employees, profiles, onSelect }: any) => (
  <div className="bg-white border border-black/[0.05] rounded-3xl overflow-hidden shadow-sm">
    <div className="p-6 border-b border-black/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h3 className="font-bold text-space-gray">Employee Payroll Profiles</h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search employees..."
          className="pl-10 pr-4 py-2 bg-apple-gray/50 border-none rounded-xl text-sm outline-none w-full sm:w-64"
        />
      </div>
    </div>

    {/* Desktop Table View */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-black/[0.05] bg-apple-gray/30">
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID / NSSA</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pay Grade</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Basic Salary</th>
            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.05]">
          {profiles.map((profile: PayrollProfile) => {
            const emp = employees.find((e: Employee) => e.id === profile.employeeId);
            return (
              <tr key={profile.employeeId} className="hover:bg-apple-gray/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {emp?.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-space-gray">{emp?.name}</p>
                      <p className="text-xs text-gray-500">{emp?.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-space-gray">{profile.employeeNumber}</p>
                  <p className="text-[10px] text-gray-400">{profile.statutory.nssaNumber || 'No NSSA'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-apple-gray rounded-lg text-[10px] font-bold text-gray-600">{profile.payGrade}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-space-gray">{formatCurrency(profile.salaryStructure.basicSalary)}</p>
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
    <div className="md:hidden divide-y divide-black/[0.05]">
      {profiles.map((profile: PayrollProfile) => {
        const emp = employees.find((e: Employee) => e.id === profile.employeeId);
        return (
          <div key={profile.employeeId} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                  {emp?.name[0]}
                </div>
                <div>
                  <p className="font-bold text-space-gray">{emp?.name}</p>
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
              <div className="bg-apple-gray/30 p-3 rounded-xl border border-black/[0.02]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID / NSSA</p>
                <p className="text-xs font-bold text-space-gray">{profile.employeeNumber}</p>
                <p className="text-[10px] text-gray-400">{profile.statutory.nssaNumber || 'No NSSA'}</p>
              </div>
              <div className="bg-apple-gray/30 p-3 rounded-xl border border-black/[0.02]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Basic Salary</p>
                <p className="text-xs font-bold text-space-gray">{formatCurrency(profile.salaryStructure.basicSalary)}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-apple-gray rounded-md text-[8px] font-bold text-gray-500 uppercase">{profile.payGrade}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const SalaryStructureView = ({ rates, onUpdateRates }: any) => {
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
    <div className="bg-white border border-black/[0.05] rounded-[2.5rem] overflow-hidden shadow-sm">
      <div className="p-8 border-b border-black/[0.05] bg-apple-gray/10">
        <h3 className="text-2xl font-bold text-space-gray">Salary Structure Setup</h3>
        <p className="text-sm text-gray-500 mt-1">Define how earnings and deductions are calculated across your organization.</p>
      </div>
      
      <div className="flex border-b border-black/[0.05] px-4 md:px-8 bg-apple-gray/5 overflow-x-auto no-scrollbar">
        {['Earnings', 'Deductions', 'Employer Contributions', 'Tax Settings', 'NEC Settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={cn(
              "px-4 md:px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap",
              activeSubTab === tab ? "text-accent" : "text-gray-400 hover:text-space-gray"
            )}
          >
            {tab}
            {activeSubTab === tab && (
              <motion.div layoutId="subtab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="p-8">
        {activeSubTab === 'Tax Settings' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05] pb-2">ZIMRA PAYE Bands (Monthly USD)</h4>
                <div className="space-y-4">
                  {[
                    { range: '0 - 300', rate: '0%' },
                    { range: '301 - 700', rate: '20%' },
                    { range: '701 - 3,000', rate: '25%' },
                    { range: '3,001 - 7,000', rate: '30%' },
                    { range: '7,001 - 10,000', rate: '35%' },
                    { range: 'Above 10,000', rate: '40%' },
                  ].map((band, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-apple-gray/30 rounded-xl">
                      <span className="text-sm font-medium text-gray-600">{band.range}</span>
                      <span className="text-sm font-bold text-space-gray">{band.rate}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleUpdateTaxTables}
                  disabled={isUpdatingTax}
                  className={cn(
                    "btn-secondary w-full py-3 text-xs flex items-center justify-center gap-2",
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
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05] pb-2">Statutory Rates & Dates</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">AIDS Levy Rate (%)</label>
                    <input 
                      type="number" 
                      value={rates.aidsLevyRate}
                      onChange={(e) => onUpdateRates({ aidsLevyRate: parseFloat(e.target.value) })}
                      className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Effective Date</label>
                    <input 
                      type="date" 
                      defaultValue="2024-01-01"
                      className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-blue-700">These settings ensure compliance with ZIMRA regulations. Changes will be logged for audit purposes.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'NEC Settings' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05] pb-2">NEC Sector Configuration</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Sector / Industry</label>
                    <select className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20">
                      <option>Commercial Sectors</option>
                      <option>Mining Industry</option>
                      <option>Agricultural Industry</option>
                      <option>Construction Industry</option>
                      <option>Engineering Industry</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Levy Type</label>
                      <select 
                        value={rates.necLevy.type}
                        onChange={(e) => onUpdateRates({ necLevy: { ...rates.necLevy, type: e.target.value } })}
                        className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                      >
                        <option value="Fixed">Fixed Amount</option>
                        <option value="Percentage">Percentage</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Value</label>
                      <input 
                        type="number" 
                        value={rates.necLevy.value}
                        onChange={(e) => onUpdateRates({ necLevy: { ...rates.necLevy, value: parseFloat(e.target.value) } })}
                        className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Applicability</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
                        <span className="text-sm text-gray-600">All Employees</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
                        <span className="text-sm text-gray-600">Grade Based</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05] pb-2">NSSA & Other Statutory</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">NSSA Employee %</label>
                    <input 
                      type="number" 
                      value={rates.nssaEmployeeRate}
                      onChange={(e) => onUpdateRates({ nssaEmployeeRate: parseFloat(e.target.value) })}
                      className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">NSSA Employer %</label>
                    <input 
                      type="number" 
                      value={rates.nssaEmployerRate}
                      onChange={(e) => onUpdateRates({ nssaEmployerRate: parseFloat(e.target.value) })}
                      className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">NSSA Earnings Cap (USD)</label>
                  <input 
                    type="number" 
                    value={rates.nssaCap}
                    onChange={(e) => onUpdateRates({ nssaCap: parseFloat(e.target.value) })}
                    className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'Deductions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Defined Deduction Items</h4>
              <button 
                onClick={() => {
                  setEditingDeduction(null);
                  setShowDeductionModal(true);
                }}
                className="btn-secondary py-2 px-4 flex items-center gap-2 text-xs"
              >
                <Plus className="w-4 h-4" />
                Add Deduction
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deductions.map(item => (
                <div key={item.id} className="p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.03] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      item.statutory ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {item.statutory ? <ShieldCheck className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-space-gray">{item.name}</p>
                      <p className="text-[10px] text-gray-500">{item.statutory ? 'Statutory' : 'Optional'} • {item.type} ({item.value})</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingDeduction(item);
                        setShowDeductionModal(true);
                      }}
                      className="p-2 hover:bg-apple-gray rounded-lg"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                    {!item.statutory && (
                      <button 
                        onClick={() => handleDeleteDeduction(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
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
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05] pb-2">Statutory Contributions (Employer)</h4>
                <div className="space-y-4">
                  {[
                    { name: 'NSSA Employer', rate: '4.5%', base: 'Gross (Capped)' },
                    { name: 'ZIMDEF', rate: '1.0%', base: 'Gross' },
                    { name: 'SAZ Levy', rate: '0.05%', base: 'Gross' },
                    { name: 'WCIF', rate: '1.2%', base: 'Gross' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.03]">
                      <div>
                        <p className="font-bold text-space-gray">{item.name}</p>
                        <p className="text-[10px] text-gray-500">Based on {item.base}</p>
                      </div>
                      <span className="text-sm font-black text-accent">{item.rate}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05] pb-2">Optional Contributions</h4>
                <div className="space-y-4">
                  {optionalContributions.map((item) => (
                    <div key={item.id} className="p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.03] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-space-gray">{item.name}</p>
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
                            className="w-20 bg-white border border-black/[0.05] rounded-lg px-2 py-1 text-sm font-bold text-right" 
                          />
                          {item.type === 'Percentage' && <span className="text-sm font-bold text-gray-400">%</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              setEditingContribution(item);
                              setShowContributionModal(true);
                            }}
                            className="p-2 hover:bg-apple-gray rounded-lg"
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                          </button>
                          <button 
                            onClick={() => handleDeleteContribution(item.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
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
                  className="btn-secondary w-full py-3 text-xs flex items-center justify-center gap-2"
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
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Defined Earnings Items</h4>
              <button 
                onClick={() => {
                  setEditingEarning(null);
                  setShowEarningModal(true);
                }}
                className="btn-secondary py-2 px-4 flex items-center gap-2 text-xs"
              >
                <Plus className="w-4 h-4" />
                Add Earning
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earnings.map(item => (
                <div key={item.id} className="p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.03] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-space-gray">{item.name}</p>
                    <p className="text-[10px] text-gray-500">{item.type} • {item.taxable ? 'Taxable' : 'Non-taxable'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingEarning(item);
                        setShowEarningModal(true);
                      }}
                      className="p-2 hover:bg-apple-gray rounded-lg"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => handleDeleteEarning(item.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

const PayrollRunView = ({ runs, onStartRun, onDownloadReport }: any) => (
  <div className="space-y-8">
    <div className="bg-white border border-black/[0.05] rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-accent/5 to-transparent">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-space-gray">Payroll Engine</h3>
        <p className="text-gray-500">Select a period to start processing salaries for your team.</p>
      </div>
      <button 
        onClick={onStartRun}
        className="w-full md:w-auto btn-primary px-8 py-4 flex items-center justify-center gap-2"
      >
        <DollarSign className="w-5 h-5" />
        Start New Payrun
      </button>
    </div>

    <div className="bg-white border border-black/[0.05] rounded-[2.5rem] overflow-hidden shadow-sm">
      <div className="p-8 border-b border-black/[0.05]">
        <h3 className="font-bold text-space-gray">Payrun History</h3>
      </div>
      <div className="divide-y divide-black/[0.05]">
        {runs.map((run: PayrollRun) => (
          <div key={run.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-apple-gray/20 transition-colors gap-6">
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                run.status === 'Paid' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
              )}>
                {run.status === 'Paid' ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
              </div>
              <div>
                <h4 className="text-lg font-bold text-space-gray">{run.period}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">{run.id}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span className="text-xs text-gray-500">{run.employeeCount} Employees</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gross Payroll</p>
                <p className="font-bold text-space-gray">{formatCurrency(run.totalGross)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Payroll</p>
                <p className="font-bold text-space-gray">{formatCurrency(run.totalNet)}</p>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest",
                  run.status === 'Paid' ? "text-green-500" : "text-orange-500"
                )}>{run.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onDownloadReport(`Payroll_Report_${run.period.replace(' ', '_')}`)}
                className="p-3 hover:bg-apple-gray rounded-xl text-gray-400 transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => alert('Opening more options...')}
                className="p-3 hover:bg-apple-gray rounded-xl text-gray-400 transition-colors"
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

const PayslipTemplate = ({ data, rates }: any) => {
  const { gross, paye, nssaEmployee, aidsLevy, necLevy, otherDeductions, totalDeductions, netPay, nssaEmployer, zimdef, saz, wcif } = calculatePayrollForEmployee(data, rates);

  return (
    <div className="bg-white p-8 md:p-12 space-y-10 font-sans text-space-gray max-w-4xl mx-auto shadow-2xl rounded-[2.5rem] border border-black/[0.05]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-8 border-b border-black/[0.05] pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white font-bold text-2xl">R</div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Rumby's HR</h2>
              <p className="text-xs text-gray-500">123 Samora Machel Ave, Harare</p>
            </div>
          </div>
          <div className="pt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pay Period</p>
            <p className="text-lg font-bold">April 2026</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee Name</p>
            <p className="font-bold">{data.name || 'Alex Rivera'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee No.</p>
            <p className="font-bold">{data.employeeNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NSSA Number</p>
            <p className="font-bold">{data.statutory.nssaNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NEC Grade</p>
            <p className="font-bold">{data.statutory.necGrade}</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black/[0.05]">
              <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
              <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Current (USD)</th>
              <th className="py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">YTD (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {/* Earnings */}
            <tr>
              <td className="py-4 font-bold text-space-gray">Basic Salary</td>
              <td className="py-4 text-right font-bold">{formatCurrency(data.salaryStructure.basicSalary)}</td>
              <td className="py-4 text-right text-gray-500">{formatCurrency(data.ytd.gross + data.salaryStructure.basicSalary)}</td>
            </tr>
            {data.salaryStructure.fixedAllowances.map((allow: any) => (
              <tr key={allow.type}>
                <td className="py-4 text-gray-600">{allow.type} Allowance</td>
                <td className="py-4 text-right font-medium">{formatCurrency(allow.amount)}</td>
                <td className="py-4 text-right text-gray-400">-</td>
              </tr>
            ))}
            <tr className="bg-apple-gray/30">
              <td className="py-4 px-4 font-bold text-space-gray">Total Earnings (Gross)</td>
              <td className="py-4 px-4 text-right font-black">{formatCurrency(gross)}</td>
              <td className="py-4 px-4 text-right font-bold text-gray-500">{formatCurrency(data.ytd.gross + gross)}</td>
            </tr>

            {/* Deductions */}
            <tr>
              <td className="py-4 text-red-500 font-medium">PAYE (ZIMRA)</td>
              <td className="py-4 text-right text-red-500 font-bold">({formatCurrency(paye)})</td>
              <td className="py-4 text-right text-gray-400">{formatCurrency(data.ytd.paye + paye)}</td>
            </tr>
            <tr>
              <td className="py-4 text-red-500 font-medium">AIDS Levy (3% of PAYE)</td>
              <td className="py-4 text-right text-red-500 font-bold">({formatCurrency(aidsLevy)})</td>
              <td className="py-4 text-right text-gray-400">-</td>
            </tr>
            <tr>
              <td className="py-4 text-red-500 font-medium">NSSA (Employee 4.5%)</td>
              <td className="py-4 text-right text-red-500 font-bold">({formatCurrency(nssaEmployee)})</td>
              <td className="py-4 text-right text-gray-400">{formatCurrency(data.ytd.nssa + nssaEmployee)}</td>
            </tr>
            <tr>
              <td className="py-4 text-red-500 font-medium">NEC Levy</td>
              <td className="py-4 text-right text-red-500 font-bold">({formatCurrency(necLevy)})</td>
              <td className="py-4 text-right text-gray-400">-</td>
            </tr>
            {data.salaryStructure.fixedDeductions.map((ded: any) => (
              <tr key={ded.type}>
                <td className="py-4 text-red-500 font-medium">{ded.type}</td>
                <td className="py-4 text-right text-red-500 font-bold">({formatCurrency(ded.amount)})</td>
                <td className="py-4 text-right text-gray-400">-</td>
              </tr>
            ))}
            <tr className="bg-red-50/50">
              <td className="py-4 px-4 font-bold text-red-600">Total Deductions</td>
              <td className="py-4 px-4 text-right font-black text-red-600">({formatCurrency(totalDeductions)})</td>
              <td className="py-4 px-4 text-right font-bold text-red-400">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net Pay Box */}
      <div className="bg-accent p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Net Take-Home Pay</p>
          <h3 className="text-4xl font-black">{formatCurrency(netPay)}</h3>
        </div>
        <div className="text-center md:text-right space-y-1">
          <p className="text-sm font-bold">Bank: {data.bankDetails.bankName}</p>
          <p className="text-xs opacity-80">Acc: {data.bankDetails.accountNumber}</p>
        </div>
      </div>

      {/* Employer Contributions */}
      <div className="p-8 bg-apple-gray/30 rounded-3xl space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Employer Contributions (Not deducted from Net Pay)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] text-gray-500 uppercase">NSSA (4.5%)</p>
            <p className="font-bold text-sm">{formatCurrency(nssaEmployer)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">ZIMDEF (1%)</p>
            <p className="font-bold text-sm">{formatCurrency(zimdef)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">SAZ Levy (0.5%)</p>
            <p className="font-bold text-sm">{formatCurrency(saz)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase">WCIF (0.5%)</p>
            <p className="font-bold text-sm">{formatCurrency(wcif)}</p>
          </div>
        </div>
      </div>

      <div className="text-center pt-10 border-t border-black/[0.05]">
        <p className="text-xs text-gray-400 italic">This is a system-generated payslip and does not require a signature.</p>
        <p className="text-[10px] text-gray-300 mt-2">Generated by Rumby HR on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

// --- Main Component ---

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [rates, setRates] = useState<StatutoryRates>(DEFAULT_STATUTORY_RATES);
  const [profiles, setProfiles] = useState<PayrollProfile[]>(MOCK_PAYROLL_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<PayrollProfile | null>(null);
  const [showRunPayroll, setShowRunPayroll] = useState(false);
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
  const [payrollStep, setPayrollStep] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState('April 2026');
  const [lockDate, setLockDate] = useState(new Date().toISOString().split('T')[0]);
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
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-space-gray">Payroll & Compliance</h1>
          <p className="text-gray-500 mt-1">Zimbabwean-focused payroll engine with automated statutory handling.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">System Compliant</span>
          </div>
          <button 
            onClick={() => alert('Opening Notifications...')}
            className="p-3 bg-white border border-black/[0.05] rounded-xl shadow-sm hover:bg-apple-gray transition-all"
          >
            <Bell className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar bg-white border border-black/[0.05] rounded-[2rem] p-1.5 shadow-sm">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-sm font-bold transition-all whitespace-nowrap",
              activeTab === item.id 
                ? "bg-accent text-white shadow-lg shadow-accent/20" 
                : "text-gray-500 hover:text-space-gray hover:bg-apple-gray/50"
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
        {activeTab === 'Overview' && <DashboardView stats={stats} compliance={compliance} alerts={alerts} />}
        {activeTab === 'Employees' && <EmployeePayrollView employees={MOCK_EMPLOYEES} profiles={profiles} onSelect={setSelectedProfile} />}
        {activeTab === 'Salary Structures' && <SalaryStructureView rates={rates} onUpdateRates={(newRates: any) => setRates({...rates, ...newRates})} />}
        {activeTab === 'Payroll Runs' && <PayrollRunView runs={MOCK_PAYROLL_RUNS} onStartRun={() => setShowRunPayroll(true)} onDownloadReport={handleGenerateReport} />}
        
        {activeTab === 'Variable Inputs' && (
          <div className="space-y-8">
            <div className="bg-white border border-black/[0.05] rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-space-gray">Monthly Variable Inputs</h3>
                <p className="text-gray-500 mt-1">Input overtime, bonuses, and special incentives for the current period.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleGenerateReport('Variable_Input_Template')}
                  className="flex-1 md:flex-none btn-secondary px-6 py-3 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download Template</span>
                  <span className="sm:hidden">Template</span>
                </button>
                <button 
                  onClick={() => setShowBulkUpload(true)}
                  className="flex-1 md:flex-none btn-primary px-6 py-3 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Bulk Upload (Excel)</span>
                  <span className="sm:hidden">Upload</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-black/[0.05] rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-black/[0.05] bg-apple-gray/30">
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overtime (USD)</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bonus (USD)</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incentives</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commission</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Total Variable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05]">
                    {profiles.map((profile) => {
                      const emp = MOCK_EMPLOYEES.find(e => e.id === profile.employeeId);
                      const inputs = variableInputs[profile.employeeId] || { overtime: 0, bonus: 0, incentives: 0, commission: 0 };
                      return (
                        <tr key={profile.employeeId} className="hover:bg-apple-gray/20 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                                {emp?.name[0]}
                              </div>
                              <span className="font-bold text-space-gray">{emp?.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <input 
                              type="number" 
                              value={inputs.overtime} 
                              onChange={(e) => handleUpdateVariableInput(profile.employeeId, 'overtime', e.target.value)}
                              className="w-20 bg-apple-gray/50 border border-black/[0.05] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20" 
                            />
                          </td>
                          <td className="px-8 py-6">
                            <input 
                              type="number" 
                              value={inputs.bonus} 
                              onChange={(e) => handleUpdateVariableInput(profile.employeeId, 'bonus', e.target.value)}
                              className="w-24 bg-apple-gray/50 border border-black/[0.05] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20" 
                            />
                          </td>
                          <td className="px-8 py-6">
                            <input 
                              type="number" 
                              value={inputs.incentives} 
                              onChange={(e) => handleUpdateVariableInput(profile.employeeId, 'incentives', e.target.value)}
                              className="w-24 bg-apple-gray/50 border border-black/[0.05] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20" 
                            />
                          </td>
                          <td className="px-8 py-6">
                            <input 
                              type="number" 
                              value={inputs.commission} 
                              onChange={(e) => handleUpdateVariableInput(profile.employeeId, 'commission', e.target.value)}
                              className="w-24 bg-apple-gray/50 border border-black/[0.05] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20" 
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
              <div className="p-8 border-t border-black/[0.05] flex justify-end">
                <button 
                  onClick={handleSaveVariableInputs}
                  disabled={isSavingVariable}
                  className={cn(
                    "btn-primary px-8 py-3 flex items-center gap-2",
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
            <div className="bg-white border border-black/[0.05] rounded-[2.5rem] p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-space-gray">Remittance Reports</h3>
                  <p className="text-gray-500 mt-1">Generate submission-ready schedules for ZIMRA, NSSA, and NEC.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => alert('Opening Period Filter...')}
                    className="w-full md:w-auto btn-secondary px-6 py-3 flex items-center justify-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filter Period
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'ZIMRA P2 (PAYE)', icon: Building2, desc: 'Monthly PAYE and AIDS Levy remittance schedule.', color: 'text-blue-600', bg: 'bg-blue-50' },
                { name: 'NSSA P4 Schedule', icon: ShieldCheck, desc: 'Employee and Employer POBS contributions.', color: 'text-green-600', bg: 'bg-green-50' },
                { name: 'NEC Sector Report', icon: Briefcase, desc: 'NEC levies and grade-based contributions.', color: 'text-purple-600', bg: 'bg-purple-50' },
                { name: 'ZIMDEF Schedule', icon: TrendingUp, desc: '1% Employer training levy summary.', color: 'text-orange-600', bg: 'bg-orange-50' },
                { name: 'WCIF Assessment', icon: AlertCircle, desc: 'Workers Compensation Insurance Fund report.', color: 'text-red-600', bg: 'bg-red-50' },
                { name: 'Bank Transfer File', icon: CreditCard, desc: 'Bulk payment file for bank integration.', color: 'text-gray-600', bg: 'bg-gray-50' },
              ].map((report) => (
                <div key={report.name} className="bg-white border border-black/[0.05] rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all group">
                  <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-6", report.bg)}>
                    <report.icon className={cn("w-6 h-6 md:w-7 md:h-7", report.color)} />
                  </div>
                  <h4 className="text-lg font-bold text-space-gray mb-2">{report.name}</h4>
                  <p className="text-sm text-gray-500 mb-6 md:mb-8 leading-relaxed">{report.desc}</p>
                  <button 
                    onClick={() => handleGenerateReport(report.name)}
                    className="w-full py-3 bg-apple-gray text-space-gray rounded-xl text-sm font-bold group-hover:bg-accent group-hover:text-white transition-all flex items-center justify-center gap-2"
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
            <div className="bg-white border border-black/[0.05] rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-space-gray">Employee Payslips</h3>
                <p className="text-gray-500 mt-1">View and distribute payslips for the current period.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleGenerateReport('Bulk Payslips')}
                  className="flex-1 md:flex-none btn-secondary px-6 py-3 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Bulk Download</span>
                  <span className="sm:hidden">Bulk</span>
                </button>
                <button 
                  onClick={() => alert('Sending all payslips via email...')}
                  className="flex-1 md:flex-none btn-primary px-6 py-3 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Email All</span>
                  <span className="sm:hidden">Email</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-black/[0.05] rounded-[2.5rem] overflow-hidden shadow-sm">
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.05] bg-apple-gray/30">
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Period</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Pay</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05]">
                    {profiles.map((profile) => {
                      const emp = MOCK_EMPLOYEES.find(e => e.id === profile.employeeId);
                      const calc = calculatePayrollForEmployee(profile, rates);
                      return (
                        <tr key={profile.employeeId} className="hover:bg-apple-gray/20 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                                {emp?.name[0]}
                              </div>
                              <div>
                                <p className="font-bold text-space-gray">{emp?.name}</p>
                                <p className="text-[10px] text-gray-400">{profile.employeeNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-medium text-gray-500">{selectedPeriod}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-bold text-space-gray">{formatCurrency(calc.netPay)}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleGenerateReport(`Payslip_${emp?.name.replace(' ', '_')}`)}
                                className="p-2 hover:bg-accent/10 text-gray-400 hover:text-accent rounded-lg transition-colors"
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => alert(`Emailing payslip to ${emp?.email}...`)}
                                className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                                title="Send via Email"
                              >
                                <Mail className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  const phone = "263772000000"; // Mock phone
                                  const message = `Hello ${emp?.name}, your payslip for ${selectedPeriod} is ready. Net Pay: ${formatCurrency(calc.netPay)}`;
                                  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                                }}
                                className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                                title="Send via WhatsApp"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-black/[0.05]">
                {profiles.map((profile) => {
                  const emp = MOCK_EMPLOYEES.find(e => e.id === profile.employeeId);
                  const calc = calculatePayrollForEmployee(profile, rates);
                  return (
                    <div key={profile.employeeId} className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                            {emp?.name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-space-gray">{emp?.name}</p>
                            <p className="text-[10px] text-gray-400">{profile.employeeNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-space-gray">{formatCurrency(calc.netPay)}</p>
                          <p className="text-[10px] text-gray-400">{selectedPeriod}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleGenerateReport(`Payslip_${emp?.name.replace(' ', '_')}`)}
                          className="flex-1 py-3 bg-apple-gray text-space-gray rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                        <button 
                          onClick={() => alert(`Emailing payslip to ${emp?.email}...`)}
                          className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </button>
                        <button 
                          onClick={() => {
                            const phone = "263772000000"; // Mock phone
                            const message = `Hello ${emp?.name}, your payslip for ${selectedPeriod} is ready. Net Pay: ${formatCurrency(calc.netPay)}`;
                            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          className="flex-1 py-3 bg-green-50 text-green-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WA
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="bg-white border border-black/[0.05] rounded-[2.5rem] p-10 md:p-20 text-center space-y-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-apple-gray rounded-full flex items-center justify-center text-gray-300 mx-auto">
              <Lock className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-space-gray">Settings Module</h3>
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
              className="bg-white w-full max-w-6xl rounded-t-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-apple-gray/50 to-white gap-4">
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-accent rounded-2xl md:rounded-[1.25rem] flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-lg shadow-accent/20">
                    {MOCK_EMPLOYEES.find(e => e.id === selectedProfile.employeeId)?.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-space-gray tracking-tight">
                      {MOCK_EMPLOYEES.find(e => e.id === selectedProfile.employeeId)?.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded-md">
                        {selectedProfile.employeeNumber}
                      </span>
                      <span className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full" />
                      <p className="hidden sm:block text-sm font-medium text-gray-500">Payroll Profile</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button 
                    onClick={() => setShowEditProfile(true)}
                    className="flex-1 sm:flex-none btn-secondary px-4 md:px-6 py-2.5 text-xs md:text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => setSelectedProfile(null)} 
                    className="p-2.5 md:p-3 hover:bg-apple-gray rounded-2xl transition-colors"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                  {/* Left Column: Details (7/12) */}
                  <div className="lg:col-span-7 space-y-8 md:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-black/[0.05] pb-3">
                          <ShieldCheck className="w-5 h-5 text-accent" />
                          <h4 className="text-sm font-bold text-space-gray uppercase tracking-widest">Statutory Details</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:gap-5">
                          <div className="bg-apple-gray/20 p-4 rounded-2xl border border-black/[0.02]">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">NSSA Number</p>
                            <p className="font-bold text-space-gray">{selectedProfile.statutory.nssaNumber}</p>
                          </div>
                          <div className="bg-apple-gray/20 p-4 rounded-2xl border border-black/[0.02]">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">NEC Grade</p>
                            <p className="font-bold text-space-gray">{selectedProfile.statutory.necGrade}</p>
                          </div>
                          <div className="bg-apple-gray/20 p-4 rounded-2xl border border-black/[0.02]">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tax Status</p>
                            <p className="font-bold text-space-gray">{selectedProfile.statutory.taxStatus}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-black/[0.05] pb-3">
                          <CreditCard className="w-5 h-5 text-accent" />
                          <h4 className="text-sm font-bold text-space-gray uppercase tracking-widest">Payment Details</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:gap-5">
                          <div className="bg-apple-gray/20 p-4 rounded-2xl border border-black/[0.02]">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bank Name</p>
                            <p className="font-bold text-space-gray">{selectedProfile.bankDetails.bankName}</p>
                          </div>
                          <div className="bg-apple-gray/20 p-4 rounded-2xl border border-black/[0.02]">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Account Number</p>
                            <p className="font-bold text-space-gray">{selectedProfile.bankDetails.accountNumber}</p>
                          </div>
                          <div className="bg-apple-gray/20 p-4 rounded-2xl border border-black/[0.02]">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Branch</p>
                            <p className="font-bold text-space-gray">{selectedProfile.bankDetails.branch}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-black/[0.05] pb-3">
                        <DollarSign className="w-5 h-5 text-accent" />
                        <h4 className="text-sm font-bold text-space-gray uppercase tracking-widest">Salary Structure</h4>
                      </div>
                      <div className="bg-gradient-to-br from-accent/5 to-apple-gray/20 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-accent/10">
                        <div className="flex justify-between items-center mb-6 md:mb-8">
                          <div>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly Basic Salary</p>
                            <h5 className="text-2xl md:text-3xl font-black text-space-gray">{formatCurrency(selectedProfile.salaryStructure.basicSalary)}</h5>
                          </div>
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm">
                            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05] pb-2">Monthly Allowances</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {selectedProfile.salaryStructure.fixedAllowances.map(allow => (
                              <div key={allow.type} className="flex justify-between items-center bg-white/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white">
                                <span className="text-xs md:text-sm font-bold text-gray-600">{allow.type}</span>
                                <span className="text-sm md:text-base font-black text-space-gray">{formatCurrency(allow.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Payslip Preview & Actions (5/12) */}
                  <div className="lg:col-span-5 space-y-6 md:space-y-8">
                    <div className="flex items-center gap-3 border-b border-black/[0.05] pb-3">
                      <FileText className="w-5 h-5 text-accent" />
                      <h4 className="text-sm font-bold text-space-gray uppercase tracking-widest">Payslip Preview</h4>
                    </div>
                    
                    <div className="relative group overflow-hidden rounded-[2rem] sm:rounded-[3rem]">
                      <div className="scale-[0.55] origin-top -mb-[28rem] sm:-mb-[20rem] rounded-[3rem] overflow-hidden shadow-2xl border border-black/[0.05] transition-transform group-hover:scale-[0.58]">
                        <PayslipTemplate data={selectedProfile} rates={rates} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent pointer-events-none" />
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:gap-4 pt-4 md:pt-6">
                      <button 
                        onClick={() => handleGenerateReport(`Payslip_${MOCK_EMPLOYEES.find(e => e.id === selectedProfile.employeeId)?.name.replace(' ', '_')}`)}
                        className="w-full btn-primary py-3 md:py-4 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Download className="w-5 h-5 md:w-6 md:h-6" />
                        Download PDF
                      </button>
                      
                      <button 
                        onClick={() => {
                          const emp = MOCK_EMPLOYEES.find(e => e.id === selectedProfile.employeeId);
                          const calc = calculatePayrollForEmployee(selectedProfile, rates);
                          const phone = "263772240081"; // In real app, use emp.phone
                          const message = `Hi ${emp?.name}! Your payslip for ${selectedPeriod} is ready. Net Pay: ${formatCurrency(calc.netPay)}. Download it here: [Link]`;
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
                          const emp = MOCK_EMPLOYEES.find(e => e.id === selectedProfile.employeeId);
                          alert(`Payslip for ${selectedPeriod} has been sent to ${emp?.email} successfully!`);
                        }}
                        className="w-full bg-apple-gray text-space-gray py-3 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg hover:bg-apple-gray/80 transition-all"
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
              className="bg-white w-full max-w-2xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">Edit Payroll Profile</h3>
                    <p className="text-[10px] md:text-xs text-gray-500">{MOCK_EMPLOYEES.find(e => e.id === selectedProfile.employeeId)?.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowEditProfile(false)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
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
                      <label className="text-xs font-bold text-gray-400 uppercase">NSSA Number</label>
                      <input 
                        defaultValue={selectedProfile.statutory.nssaNumber}
                        className="w-full bg-apple-gray/50 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">NEC Grade</label>
                      <input 
                        defaultValue={selectedProfile.statutory.necGrade}
                        className="w-full bg-apple-gray/50 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Bank Name</label>
                      <input 
                        defaultValue={selectedProfile.bankDetails.bankName}
                        className="w-full bg-apple-gray/50 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Account Number</label>
                      <input 
                        defaultValue={selectedProfile.bankDetails.accountNumber}
                        className="w-full bg-apple-gray/50 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <button 
                      type="button"
                      onClick={() => setShowEditProfile(false)}
                      className="w-full sm:flex-1 py-3 md:py-4 bg-apple-gray text-space-gray rounded-xl font-bold text-sm md:text-base"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="w-full sm:flex-1 py-3 md:py-4 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 text-sm md:text-base"
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
              className="bg-white w-full max-w-2xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">Run Payroll Engine</h3>
                    <p className="text-[10px] md:text-xs text-gray-500">Step {payrollStep} of 3</p>
                  </div>
                </div>
                <button onClick={() => { setShowRunPayroll(false); setPayrollStep(1); }} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 md:space-y-8">
                {payrollStep === 1 && (
                  <div className="space-y-6">
                    <h4 className="font-bold text-space-gray text-sm md:text-base">1. Select Pay Period & Lock Date</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pay Period</label>
                        <select 
                          value={selectedPeriod}
                          onChange={(e) => setSelectedPeriod(e.target.value)}
                          className="w-full bg-apple-gray/30 border border-black/[0.05] rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all appearance-none"
                        >
                          {['April 2026', 'March 2026', 'February 2026', 'January 2026'].map(p => (
                            <option key={p} value={p}>{p} {lockedPeriods.includes(p) ? '(Locked)' : ''}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Lock Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="date" 
                            value={lockDate}
                            onChange={(e) => setLockDate(e.target.value)}
                            className="w-full bg-apple-gray/30 border border-black/[0.05] rounded-2xl pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                          />
                        </div>
                      </div>

                      {lockedPeriods.includes(selectedPeriod) && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
                          <Lock className="w-5 h-5 text-red-600 flex-shrink-0" />
                          <p className="text-xs text-red-700">This period is already locked and cannot be re-processed. Please select a different period.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {payrollStep === 2 && (
                  <div className="space-y-6">
                    <h4 className="font-bold text-space-gray">2. Smart Review & Exceptions</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-orange-800">NSSA Cap Alert</p>
                          <p className="text-[10px] text-orange-700 mt-0.5">5 employees have reached the NSSA cap. The system will automatically apply the USD $700 limit for {selectedPeriod}.</p>
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-red-800">Unapproved Overtime</p>
                          <p className="text-[10px] text-red-700 mt-0.5">12 hours of overtime for the Engineering team are pending approval. These will be excluded unless approved.</p>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-blue-800">Payroll Variance</p>
                          <p className="text-[10px] text-blue-700 mt-0.5">Payroll is 4.2% higher than last month due to new hires in Engineering.</p>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Employee Preview</h5>
                        <div className="divide-y divide-black/[0.05] border border-black/[0.05] rounded-2xl overflow-hidden max-h-[200px] overflow-y-auto">
                          {profiles.map(p => {
                            const emp = MOCK_EMPLOYEES.find(e => e.id === p.employeeId);
                            const calc = calculatePayrollForEmployee(p, rates);
                            return (
                              <div key={p.employeeId} className="p-4 flex items-center justify-between bg-white hover:bg-apple-gray/10 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-[10px] font-bold">
                                    {emp?.name[0]}
                                  </div>
                                  <span className="text-sm font-bold text-space-gray">{emp?.name}</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-space-gray">{formatCurrency(calc.netPay)}</p>
                                  <p className="text-[10px] text-gray-400">Net Pay</p>
                                </div>
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
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-space-gray">Ready to Finalize</h4>
                      <p className="text-gray-500 mt-2">Payroll for <span className="font-bold text-accent">{selectedPeriod}</span></p>
                      <p className="text-sm text-gray-500 mt-1">Total Net Remittance: <span className="font-bold text-space-gray">$33,700.00</span></p>
                    </div>
                    <div className="p-6 bg-apple-gray/30 rounded-3xl text-left space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Gross</span>
                        <span className="font-bold">$46,200.00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Statutory (Remittable)</span>
                        <span className="font-bold">$12,500.00</span>
                      </div>
                      <div className="flex justify-between text-sm pt-3 border-t border-black/[0.05]">
                        <span className="font-bold text-space-gray">Total Employer Cost</span>
                        <span className="font-black text-accent">$49,800.00</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 border-t border-black/[0.05] flex flex-col sm:flex-row gap-4">
                {payrollStep > 1 && (
                  <button onClick={() => setPayrollStep(prev => prev - 1)} className="w-full sm:flex-1 btn-secondary py-4">Back</button>
                )}
                <button 
                  onClick={() => {
                    if (payrollStep < 3) setPayrollStep(prev => prev + 1);
                    else {
                      setLockedPeriods(prev => [...prev, selectedPeriod]);
                      setShowRunPayroll(false);
                      setPayrollStep(1);
                      alert(`Payroll for ${selectedPeriod} has been processed and locked successfully! Lock date set for: ${lockDate}`);
                    }
                  }}
                  disabled={payrollStep === 1 && lockedPeriods.includes(selectedPeriod)}
                  className="w-full sm:flex-1 btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {payrollStep === 3 ? 'Approve & Lock Payroll' : 'Continue'}
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
              className="bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 sm:p-8 border-b border-black/[0.05] flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-space-gray">Bulk Upload Variable Inputs</h3>
                <button onClick={() => setShowBulkUpload(false)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </button>
              </div>
              <div className="overflow-y-auto">
                <form onSubmit={handleBulkUpload} className="p-6 sm:p-8 space-y-6">
                  <div className="p-8 sm:p-12 border-2 border-dashed border-black/[0.05] rounded-[2rem] text-center space-y-4 hover:border-accent/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-apple-gray rounded-full flex items-center justify-center mx-auto group-hover:bg-accent/10 transition-colors">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 group-hover:text-accent transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-space-gray text-sm sm:text-base">Click to upload or drag and drop</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">Excel or CSV files only (Max 10MB)</p>
                    </div>
                    <input type="file" className="hidden" accept=".xlsx,.xls,.csv" />
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-[10px] sm:text-xs text-blue-700 leading-relaxed">
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
                      className="w-full sm:flex-1 py-3 sm:py-4 bg-apple-gray text-space-gray rounded-xl font-bold text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="w-full sm:flex-1 py-3 sm:py-4 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 text-sm sm:text-base"
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
              className="bg-white p-8 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-center space-y-6 max-w-md w-full"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-space-gray">Generating {generatingReport}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Compiling payroll data and formatting for statutory submission...</p>
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
              className="bg-white p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-center space-y-8 max-w-md w-full"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-space-gray">Report Ready!</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">The {reportReady} has been generated successfully and is ready for download.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setReportReady(null)}
                  className="w-full sm:flex-1 btn-secondary py-3 sm:py-4 text-sm sm:text-base"
                >
                  Close
                </button>
                <button className="w-full sm:flex-1 btn-primary py-3 sm:py-4 flex items-center justify-center gap-2 text-sm sm:text-base">
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
const Bell = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

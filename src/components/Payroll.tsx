import React, { useState } from 'react';
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
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatCurrency } from '../lib/utils';
import { MOCK_EMPLOYEES } from '../constants';
import { Employee } from '../types';

interface PayslipData {
  employee: Employee;
  period: string;
  baseSalary: number;
  nssa: number;
  paye: number;
  zimdef: number;
  aidsLevy: number;
  netPay: number;
}

interface DeductionRates {
  nssa: number;
  zimdef: number;
  aidsLevy: number;
  payeThreshold: number;
}

export default function Payroll() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [payslip, setPayslip] = useState<PayslipData | null>(null);
  const [editingSalary, setEditingSalary] = useState<{ id: string, value: string } | null>(null);
  const [rates, setRates] = useState<DeductionRates>(() => {
    const saved = localStorage.getItem('payroll_rates');
    return saved ? JSON.parse(saved) : {
      nssa: 4.5,
      zimdef: 1,
      aidsLevy: 3,
      payeThreshold: 300
    };
  });
  const [isSaving, setIsSaving] = useState(false);

  const saveSettings = () => {
    setIsSaving(true);
    localStorage.setItem('payroll_rates', JSON.stringify(rates));
    setTimeout(() => {
      setIsSaving(false);
      alert("Payroll settings saved successfully!");
    }, 800);
  };

  const stats = [
    { label: 'Total Payroll (Monthly)', value: '$35,400', change: '+12.5%', trend: 'up' },
    { label: 'Employees Paid', value: '124', change: '+4', trend: 'up' },
    { label: 'Tax Liabilities', value: '$6,200', change: '-2.1%', trend: 'down' },
    { label: 'Next Pay Date', value: 'Apr 15', change: 'In 8 days', trend: 'neutral' },
  ];

  const recentPayruns = [
    { id: 'PR-001', date: 'Mar 31, 2024', amount: '$212,500', status: 'Completed', employees: 124 },
    { id: 'PR-002', date: 'Mar 15, 2024', amount: '$210,200', status: 'Completed', employees: 122 },
    { id: 'PR-003', date: 'Feb 28, 2024', amount: '$208,900', status: 'Completed', employees: 121 },
  ];

  const calculatePayslip = (employee: Employee) => {
    setIsGenerating(true);
    const monthlyBase = employee.salary / 12;
    
    // Simple Zimbabwean tax logic
    const nssa = monthlyBase * (rates.nssa / 100);
    const zimdef = monthlyBase * (rates.zimdef / 100);
    
    // PAYE (Simplified for demo)
    const taxableIncome = monthlyBase - nssa;
    let paye = 0;
    if (taxableIncome > rates.payeThreshold) {
      paye = (taxableIncome - rates.payeThreshold) * 0.25;
    }
    
    const aidsLevy = paye * (rates.aidsLevy / 100);
    const net = monthlyBase - (nssa + zimdef + paye + aidsLevy);

    setTimeout(() => {
      setPayslip({
        employee,
        period: 'March 2024',
        baseSalary: monthlyBase,
        nssa,
        paye,
        zimdef,
        aidsLevy,
        netPay: net
      });
      setIsGenerating(false);
    }, 1000);
  };

  const handleSalaryUpdate = (id: string, newValue: string) => {
    const numValue = parseFloat(newValue.replace(/[^0-9.]/g, ''));
    if (!isNaN(numValue)) {
      setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, salary: numValue } : emp));
    }
    setEditingSalary(null);
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-space-gray">Payroll Management</h1>
          <p className="text-gray-500 mt-1">Manage salaries, taxes, and compliance in one place.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Reports
          </button>
          <button className="btn-primary flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Run Payroll
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-black/[0.05] rounded-3xl p-6 shadow-sm space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-space-gray">{stat.value}</h3>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold",
                stat.trend === 'up' ? "text-green-500" : stat.trend === 'down' ? "text-red-500" : "text-gray-400"
              )}>
                {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                {stat.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-black/[0.05] rounded-2xl p-1 flex overflow-x-auto no-scrollbar max-w-fit">
        {['Overview', 'Employees', 'Payruns', 'Settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "py-2.5 px-6 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeTab === tab 
                ? "bg-accent text-white shadow-md shadow-accent/20" 
                : "text-gray-500 hover:text-space-gray hover:bg-apple-gray/50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'Overview' && (
            <div className="bg-white border border-black/[0.05] rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-black/[0.05] flex items-center justify-between">
                <h3 className="font-bold text-space-gray">Recent Payruns</h3>
                <button className="text-accent text-sm font-bold hover:underline">View All</button>
              </div>
              <div className="divide-y divide-black/[0.05]">
                {recentPayruns.map((run) => (
                  <div key={run.id} className="p-6 flex items-center justify-between hover:bg-apple-gray/20 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-space-gray">{run.date}</p>
                        <p className="text-xs text-gray-500">{run.employees} Employees • {run.id}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div>
                        <p className="font-bold text-space-gray">{run.amount}</p>
                        <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{run.status}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="bg-white border border-black/[0.05] rounded-3xl p-8 shadow-sm space-y-8">
              <div>
                <h3 className="text-xl font-bold text-space-gray">Payroll Settings</h3>
                <p className="text-sm text-gray-500">Customize deduction rates based on your sector's NEC requirements.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">NSSA Rate (%)</label>
                  <input 
                    type="number" 
                    value={rates.nssa}
                    onChange={(e) => setRates({ ...rates, nssa: parseFloat(e.target.value) })}
                    className="w-full bg-apple-gray border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">ZIMDEF Rate (%)</label>
                  <input 
                    type="number" 
                    value={rates.zimdef}
                    onChange={(e) => setRates({ ...rates, zimdef: parseFloat(e.target.value) })}
                    className="w-full bg-apple-gray border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">AIDS Levy (%)</label>
                  <input 
                    type="number" 
                    value={rates.aidsLevy}
                    onChange={(e) => setRates({ ...rates, aidsLevy: parseFloat(e.target.value) })}
                    className="w-full bg-apple-gray border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">PAYE Threshold ($)</label>
                  <input 
                    type="number" 
                    value={rates.payeThreshold}
                    onChange={(e) => setRates({ ...rates, payeThreshold: parseFloat(e.target.value) })}
                    className="w-full bg-apple-gray border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </div>
              
              <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10 flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-accent" />
                <p className="text-sm text-accent/80 font-medium">
                  Changes to these rates will apply to all future payslips generated. Ensure they match your current NEC handbook.
                </p>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="btn-primary px-10 py-4 flex items-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Payroll Settings'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Upcoming Deadlines */}
          <div className="bg-white border border-black/[0.05] rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-space-gray">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {[
                { label: 'Tax Filing Q1', date: 'Apr 15', type: 'Tax' },
                { label: 'Payrun Approval', date: 'Apr 12', type: 'Payroll' },
                { label: 'Benefit Enrollment', date: 'Apr 20', type: 'Benefits' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-apple-gray flex items-center justify-center text-gray-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-space-gray">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.date} • {item.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payroll Alerts */}
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold">Attention Needed</h3>
            </div>
            <p className="text-sm text-orange-700/80 leading-relaxed">
              3 employees have missing bank details. Please update them before the next payrun on Apr 15.
            </p>
            <button className="w-full py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors">
              Fix Now
            </button>
          </div>
        </div>
      </div>

      {/* Payslip Modal */}
      <AnimatePresence>
        {(isGenerating || payslip) && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full sm:max-w-2xl h-full sm:h-auto sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col sm:max-h-[90vh]"
            >
              {isGenerating ? (
                <div className="p-20 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  <p className="font-bold text-space-gray">Calculating taxes and generating payslip...</p>
                </div>
              ) : payslip && (
                <>
                  <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white font-bold text-xl">R</div>
                      <div>
                        <h2 className="text-xl font-bold text-space-gray">Employee Payslip</h2>
                        <p className="text-xs text-gray-500 font-medium">Period: {payslip.period}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPayslip(null)}
                      className="p-2 hover:bg-black/5 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Employee Info */}
                    <div className="grid grid-cols-2 gap-8 p-6 bg-apple-gray/20 rounded-3xl">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</p>
                        <p className="font-bold text-space-gray">{payslip.employee.name}</p>
                        <p className="text-xs text-gray-500">{payslip.employee.role}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee ID</p>
                        <p className="font-bold text-space-gray">EMP-{payslip.employee.id.slice(0, 6).toUpperCase()}</p>
                      </div>
                    </div>

                    {/* Earnings & Deductions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05] pb-2">Earnings</h4>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Base Salary</span>
                          <span className="font-bold text-space-gray">{formatCurrency(payslip.baseSalary)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-black/[0.05]">
                          <span className="font-bold text-space-gray">Gross Pay</span>
                          <span className="font-bold text-space-gray">{formatCurrency(payslip.baseSalary)}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05] pb-2">Deductions (Compliance)</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">NSSA ({rates.nssa}%)</span>
                            <span className="font-bold text-red-500">-{formatCurrency(payslip.nssa)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">PAYE</span>
                            <span className="font-bold text-red-500">-{formatCurrency(payslip.paye)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">ZIMDEF ({rates.zimdef}%)</span>
                            <span className="font-bold text-red-500">-{formatCurrency(payslip.zimdef)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">AIDS Levy ({rates.aidsLevy}%)</span>
                            <span className="font-bold text-red-500">-{formatCurrency(payslip.aidsLevy)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-black/[0.05]">
                          <span className="font-bold text-space-gray">Total Deductions</span>
                          <span className="font-bold text-red-500">-{formatCurrency(payslip.nssa + payslip.paye + payslip.zimdef + payslip.aidsLevy)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Net Pay */}
                    <div className="p-8 bg-accent/5 border border-accent/10 rounded-3xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Net Take-Home Pay</p>
                        <h3 className="text-3xl font-bold text-accent">{formatCurrency(payslip.netPay)}</h3>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <p>Paid via Direct Deposit</p>
                        <p>Account ending in ****4567</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 border-t border-black/[0.05] grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button className="btn-secondary flex items-center justify-center gap-2 text-xs">
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    <button className="btn-secondary flex items-center justify-center gap-2 text-xs">
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button 
                      onClick={() => window.open(`https://wa.me/263772240081?text=Hi!%20Here%20is%20your%20payslip%20for%20${payslip.period}.`, '_blank')}
                      className="btn-primary bg-[#25D366] border-none flex items-center justify-center gap-2 text-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button className="btn-primary flex items-center justify-center gap-2 text-xs">
                      <FileText className="w-4 h-4" />
                      Email
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

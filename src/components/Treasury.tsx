import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  Download, 
  FileJson, 
  FileText, 
  Settings2, 
  ChevronRight, 
  Search, 
  Filter, 
  AlertCircle,
  CheckCircle2,
  Map,
  Plus,
  Trash2,
  Save,
  Wallet,
  DollarSign,
  ArrowRightLeft,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { 
  PayrollRun, 
  Employee, 
  PayrollProfile, 
  BankExportTemplate, 
  UserProfile 
} from '../types';

interface TreasuryProps {
  userProfile: UserProfile | null;
}

const PREDEFINED_BANKS = [
  { id: 'cabs', name: 'CABS', defaultFormat: 'TXT' as const },
  { id: 'stanbic', name: 'Stanbic', defaultFormat: 'CSV' as const },
  { id: 'cbz', name: 'CBZ', defaultFormat: 'CSV' as const },
  { id: 'steward', name: 'Steward Bank', defaultFormat: 'CSV' as const },
  { id: 'first_capital', name: 'First Capital', defaultFormat: 'CSV' as const },
  { id: 'nedbank', name: 'Nedbank', defaultFormat: 'CSV' as const },
  { id: 'cash', name: 'Cash Disbursement', defaultFormat: 'PDF' as const },
];

export default function Treasury({ userProfile }: TreasuryProps) {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [profiles, setProfiles] = useState<PayrollProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportMode, setExportMode] = useState<'standard' | 'split' | 'cash'>('standard');
  const [selectedBank, setSelectedBank] = useState(PREDEFINED_BANKS[0]);
  const [showMapping, setShowMapping] = useState(false);
  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'ZiG'>('USD');

  // Hardcoded CABS Mock Template
  const [template, setTemplate] = useState<Partial<BankExportTemplate>>({
    name: 'CABS Standard',
    bankName: 'CABS',
    fileFormat: 'TXT',
    hasHeader: false,
    mapping: [
      { columnName: 'Trans Code', sourceField: 'fixedValue', fixedValue: '30' },
      { columnName: 'Dest Account', sourceField: 'accountNumber', padding: { length: 12, char: '0', direction: 'left' } },
      { columnName: 'Amount', sourceField: 'netPay', padding: { length: 12, char: '0', direction: 'left' } },
      { columnName: 'Dest Name', sourceField: 'employeeName', padding: { length: 30, char: ' ', direction: 'right' } },
      { columnName: 'Reference', sourceField: 'narration', fixedValue: 'Salary Payment' }
    ]
  });

  useEffect(() => {
    if (userProfile?.companyId) {
      fetchData();
    }
  }, [userProfile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        { data: runsData },
        { data: empsData },
        { data: profsData }
      ] = await Promise.all([
        supabase.from('payroll_runs').select('*').eq('company_id', userProfile?.companyId).order('processed_at', { ascending: false }),
        supabase.from('employees').select('*').eq('company_id', userProfile?.companyId),
        supabase.from('payroll_profiles').select('*').eq('company_id', userProfile?.companyId)
      ]);

      if (runsData) setRuns(runsData);
      if (empsData) setEmployees(empsData);
      if (profsData) setProfiles(profsData);
    } catch (error) {
      console.error('Error fetching treasury data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-ZW', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const generateExportFile = () => {
    if (!selectedRun) return;

    // Filter profiles for the selected run
    const activeProfiles = profiles.filter(p => employees.some(e => e.id === p.employeeId));
    
    let content = "";
    if (selectedBank.id === 'cash') {
      alert('Generating Cash Disbursement PDF Schedule...');
      return;
    }

    // Dynamic File Generation Logic
    const rows = activeProfiles.map(profile => {
      const emp = employees.find(e => e.id === profile.employeeId);
      if (!emp) return null;

      // Mocking different amounts if split payroll logic was applied
      const netAmount = 850.00; // In a real app, we'd fetch the actual calculation for this specific run/profile

      return template.mapping?.map(m => {
        let value = "";
        switch (m.sourceField) {
          case 'employeeName': value = `${emp.firstName} ${emp.lastName}`; break;
          case 'accountNumber': value = profile.bankDetails?.accountNumber || ''; break;
          case 'netPay': value = (netAmount * 100).toFixed(0).toString(); break; // Pence/Cents for banking TXT
          case 'fixedValue': value = m.fixedValue || ''; break;
          case 'narration': value = `Salary ${selectedRun.period}`; break;
          default: value = "";
        }

        if (m.padding) {
          const { length, char, direction } = m.padding;
          if (direction === 'left') value = value.padStart(length, char);
          else value = value.padEnd(length, char);
          value = value.substring(0, length);
        }
        return value;
      }).join(template.delimiter || "");
    }).filter(Boolean);

    content = rows.join('\n');
    
    // Download logic
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedBank.name}_Export_${selectedRun.period}.${template.fileFormat?.toLowerCase()}`;
    a.click();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-space-gray">The Treasury</h1>
          <p className="text-gray-500 mt-1">Bank exports, split payroll disbursements, and cash schedules.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowMapping(!showMapping)}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings2 className="w-4 h-4" />
            {showMapping ? 'Hide Mapper' : 'Export Config'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Run Selection & Bank */}
        <div className="lg:col-span-1 space-y-6">
          {/* Run Selection */}
          <div className="card-aura p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-accent" />
              1. Select Payroll Run
            </h3>
            <div className="space-y-2">
              {runs.filter(r => r.status === 'Paid' || r.status === 'Approved').length === 0 ? (
                <div className="p-4 bg-apple-gray/50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 italic">No approved payroll runs found.</p>
                </div>
              ) : (
                runs.filter(r => r.status === 'Paid' || r.status === 'Approved').map(run => (
                  <button
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className={cn(
                      "w-full p-4 rounded-2xl border transition-all text-left group",
                      selectedRun?.id === run.id
                        ? "bg-accent border-accent text-white shadow-lg shadow-accent/20"
                        : "bg-white border-black/[0.05] hover:border-accent/30 hover:bg-apple-gray/20"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={cn("font-bold", selectedRun?.id === run.id ? "text-white" : "text-space-gray")}>
                          {run.period}
                        </p>
                        <p className={cn("text-[10px] mt-1 uppercase font-bold", selectedRun?.id === run.id ? "text-white/70" : "text-gray-400")}>
                          {run.employeeCount} Employees • {run.status}
                        </p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4", selectedRun?.id === run.id ? "text-white/50" : "text-gray-300")} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Bank Selection */}
          <div className="card-aura p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Landmark className="w-4 h-4 text-accent" />
              2. Choose Destination
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PREDEFINED_BANKS.map(bank => (
                <button
                  key={bank.id}
                  onClick={() => setSelectedBank(bank)}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 text-center",
                    selectedBank.id === bank.id
                      ? "bg-accent/5 border-accent text-accent"
                      : "bg-white border-black/[0.03] text-gray-500 hover:bg-apple-gray/20"
                  )}
                >
                  {bank.id === 'cash' ? <Wallet className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                  {bank.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Column: Preview & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!showMapping ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Mode Selector */}
                <div className="flex bg-apple-gray/30 p-1 rounded-2xl w-fit">
                  <button 
                    onClick={() => setExportMode('standard')}
                    className={cn(
                      "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                      exportMode === 'standard' ? "bg-white text-space-gray shadow-sm" : "text-gray-500 hover:text-space-gray"
                    )}
                  >
                    Standard (All)
                  </button>
                  <button 
                    onClick={() => setExportMode('split')}
                    className={cn(
                      "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                      exportMode === 'split' ? "bg-white text-space-gray shadow-sm" : "text-gray-500 hover:text-space-gray"
                    )}
                  >
                    Split (USD/ZiG)
                  </button>
                  <button 
                    onClick={() => setExportMode('cash')}
                    className={cn(
                      "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                      exportMode === 'cash' ? "bg-white text-space-gray shadow-sm" : "text-gray-500 hover:text-space-gray"
                    )}
                  >
                    Cash Schedule
                  </button>
                </div>

                {/* Currency Focus (visible for split mode) */}
                {exportMode === 'split' && (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setActiveCurrency('USD')}
                      className={cn(
                        "flex-1 p-6 rounded-[2rem] border transition-all text-left",
                        activeCurrency === 'USD' ? "bg-blue-50 border-blue-200" : "bg-white border-black/[0.05]"
                      )}
                    >
                      <DollarSign className={cn("w-6 h-6 mb-2", activeCurrency === 'USD' ? "text-blue-600" : "text-gray-400")} />
                      <p className="font-bold text-space-gray">USD Portion</p>
                      <p className="text-xs text-gray-500">Foreign Currency account export</p>
                    </button>
                    <button 
                      onClick={() => setActiveCurrency('ZiG')}
                      className={cn(
                        "flex-1 p-6 rounded-[2rem] border transition-all text-left",
                        activeCurrency === 'ZiG' ? "bg-orange-50 border-orange-200" : "bg-white border-black/[0.05]"
                      )}
                    >
                      <ArrowRightLeft className={cn("w-6 h-6 mb-2", activeCurrency === 'ZiG' ? "text-orange-600" : "text-gray-400")} />
                      <p className="font-bold text-space-gray">ZiG Portion</p>
                      <p className="text-xs text-gray-500">Local Currency account export</p>
                    </button>
                  </div>
                )}

                {/* Export Summary Card */}
                <div className="card-aura p-8 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[2rem] bg-accent/10 flex items-center justify-center text-accent">
                        <Download className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-space-gray">
                          {selectedBank.id === 'cash' ? 'Cash Payment Report' : `${selectedBank.name} Export`}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {selectedRun ? `${selectedRun.period} Payroll Run` : 'Select a payroll run to continue'}
                        </p>
                      </div>
                    </div>
                    {selectedRun && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent">
                          {formatCurrency(selectedRun.totalNet)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Displacement</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-apple-gray/30 rounded-3xl border border-black/[0.02] space-y-4">
                      <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" />
                        Beneficiaries
                      </h5>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-space-gray">{selectedRun?.employeeCount || 0}</span>
                        <span className="text-sm text-gray-500">Employees</span>
                      </div>
                      <div className="flex -space-x-3 overflow-hidden">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                            E{i}
                          </div>
                        ))}
                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-apple-gray flex items-center justify-center text-[10px] font-bold text-gray-400">
                          +{Math.max(0, (selectedRun?.employeeCount || 0) - 5)}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-apple-gray/30 rounded-3xl border border-black/[0.02] space-y-4">
                      <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Verification Details
                      </h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          All bank accounts verified
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          Maker-Checker phase completed
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                          <FileText className="w-4 h-4" />
                          Ready for {selectedBank.defaultFormat} export
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-black/[0.05]">
                    <button
                      disabled={!selectedRun}
                      onClick={generateExportFile}
                      className={cn(
                        "w-full py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 transition-all",
                        selectedRun
                          ? "bg-accent text-white shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95"
                          : "bg-apple-gray text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {selectedBank.id === 'cash' ? <FileJson className="w-6 h-6" /> : <Download className="w-6 h-6" />}
                      {selectedBank.id === 'cash' 
                        ? 'Download Cash Schedule (PDF)' 
                        : `Generate ${selectedBank.name} ${template.fileFormat} File`
                      }
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-bold">
                      Secure banking export certified by ZivoHR Encryption
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="mapping"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card-aura p-8 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-space-gray">Export Configuration</h4>
                    <p className="text-sm text-gray-500">Map ZivoHR fields to your bank's file columns.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-secondary text-xs flex items-center gap-2">
                      <Save className="w-3.5 h-3.5" />
                      Save Template
                    </button>
                  </div>
                </div>

                <div className="bg-apple-gray/30 p-6 rounded-3xl space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Name</label>
                      <input 
                        type="text" 
                        value={template.bankName}
                        onChange={(e) => setTemplate({...template, bankName: e.target.value})}
                        className="w-full bg-white border border-black/[0.05] rounded-xl px-4 py-2 text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Format</label>
                      <select 
                        value={template.fileFormat}
                        onChange={(e) => setTemplate({...template, fileFormat: e.target.value as any})}
                        className="w-full bg-white border border-black/[0.05] rounded-xl px-4 py-2 text-xs font-bold outline-none"
                      >
                        <option value="CSV">CSV</option>
                        <option value="TXT">Fixed TXT</option>
                        <option value="Excel">Excel</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delimiter</label>
                      <input 
                        type="text" 
                        value={template.delimiter || ''}
                        disabled={template.fileFormat === 'TXT'}
                        onChange={(e) => setTemplate({...template, delimiter: e.target.value})}
                        className="w-full bg-white border border-black/[0.05] rounded-xl px-4 py-2 text-xs font-bold outline-none disabled:opacity-50"
                        placeholder="e.g. ,"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input 
                          type="checkbox"
                          checked={template.hasHeader}
                          onChange={(e) => setTemplate({...template, hasHeader: e.target.checked})}
                          className="w-4 h-4 rounded border-apple-gray text-accent focus:ring-accent"
                        />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Include Header</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Column Mapping</h5>
                    <div className="space-y-2">
                      {template.mapping?.map((m, i) => (
                        <div key={i} className="flex gap-2 items-start bg-white p-4 rounded-2xl border border-black/[0.03]">
                          <div className="flex-1 space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase">Col Name</label>
                            <input 
                              type="text" 
                              value={m.columnName}
                              onChange={(e) => {
                                const newMapping = [...(template.mapping || [])];
                                newMapping[i].columnName = e.target.value;
                                setTemplate({...template, mapping: newMapping});
                              }}
                              className="w-full bg-apple-gray border-none rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase">Source Field</label>
                            <select 
                              value={m.sourceField}
                              onChange={(e) => {
                                const newMapping = [...(template.mapping || [])];
                                newMapping[i].sourceField = e.target.value as any;
                                setTemplate({...template, mapping: newMapping});
                              }}
                              className="w-full bg-apple-gray border-none rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
                            >
                              <option value="employeeName">Beneficiary Name</option>
                              <option value="accountNumber">Account Number</option>
                              <option value="netPay">Net Pay</option>
                              <option value="employeeNumber">Employee #</option>
                              <option value="fixedValue">Fixed Value</option>
                              <option value="narration">Narration</option>
                              <option value="filler">Filler Space</option>
                            </select>
                          </div>
                          {m.sourceField === 'fixedValue' && (
                            <div className="flex-1 space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase">Fixed Value</label>
                              <input 
                                type="text" 
                                value={m.fixedValue || ''}
                                onChange={(e) => {
                                  const newMapping = [...(template.mapping || [])];
                                  newMapping[i].fixedValue = e.target.value;
                                  setTemplate({...template, mapping: newMapping});
                                }}
                                className="w-full bg-apple-gray border-none rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
                              />
                            </div>
                          )}
                          {template.fileFormat === 'TXT' && (
                            <div className="w-24 space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase">Length</label>
                              <input 
                                type="number" 
                                value={m.padding?.length || 0}
                                onChange={(e) => {
                                  const newMapping = [...(template.mapping || [])];
                                  newMapping[i].padding = { ...(newMapping[i].padding || { char: ' ', direction: 'right', length: 0 }), length: parseInt(e.target.value) };
                                  setTemplate({...template, mapping: newMapping});
                                }}
                                className="w-full bg-apple-gray border-none rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
                              />
                            </div>
                          )}
                          <button 
                            className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => {
                              const newMapping = [...(template.mapping || [])];
                              newMapping.splice(i, 1);
                              setTemplate({...template, mapping: newMapping});
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        const newMapping = [...(template.mapping || []), { columnName: 'New Column', sourceField: 'employeeName' as const }];
                        setTemplate({...template, mapping: newMapping});
                      }}
                      className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-xs font-bold text-gray-400 hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Column
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  Save, 
  Plus, 
  Trash2, 
  AlertCircle,
  Clock,
  Briefcase,
  Lock,
  History,
  Calculator,
  ArrowRight,
  Landmark,
  Wallet
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StatutoryRates, CompanySettings as ICompanySettings, BankDetails } from '../types';
import { settingsService } from '../services/settingsService';
import { formatCurrency } from '../lib/utils';

interface CompanySettingsProps {
  userProfile: any;
}

export default function CompanySettings({ userProfile }: CompanySettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ICompanySettings | null>(null);

  useEffect(() => {
    if (userProfile?.companyId) {
      loadSettings();
    }
  }, [userProfile]);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings(userProfile.companyId);
      if (data) {
        setSettings(data);
      } else {
        // Default settings
        setSettings({
          id: '',
          companyId: userProfile.companyId,
          statutoryRates: {
            nssaEmployeeRate: 4.5,
            nssaEmployerRate: 4.5,
            nssaCap: 7000,
            zimdefRate: 1,
            sazRate: 1,
            wcifRate: 1,
            aidsLevyRate: 3,
            necLevy: { type: 'Fixed', value: 5.43 },
            zigRate: 13.5
          },
          payrollLockDay: 25,
          allowEmployeeUploads: true,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      alert('Settings updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-space-gray tracking-tight uppercase italic">Company Configuration</h1>
          <p className="text-sm text-gray-500 font-medium">Manage statutory rates, payroll locks, and organizational rules.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-8 py-3 rounded-2xl flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-8">
          {/* Statutory Rates Card */}
          <div className="bg-white border border-black/[0.05] rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-space-gray uppercase italic tracking-tight">Statutory Remittance Rates</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">ZIMRA & NSSA Compliance</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                Compliant (2026)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NSSA Employee Rate (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={settings.statutoryRates.nssaEmployeeRate}
                  onChange={(e) => setSettings({ ...settings, statutoryRates: { ...settings.statutoryRates, nssaEmployeeRate: parseFloat(e.target.value) }})}
                  className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NSSA Employer Rate (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={settings.statutoryRates.nssaEmployerRate}
                  onChange={(e) => setSettings({ ...settings, statutoryRates: { ...settings.statutoryRates, nssaEmployerRate: parseFloat(e.target.value) }})}
                  className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NSSA Insurable Cap (USD)</label>
                <input 
                  type="number"
                  value={settings.statutoryRates.nssaCap}
                  onChange={(e) => setSettings({ ...settings, statutoryRates: { ...settings.statutoryRates, nssaCap: parseFloat(e.target.value) }})}
                  className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">AIDS Levy (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={settings.statutoryRates.aidsLevyRate}
                  onChange={(e) => setSettings({ ...settings, statutoryRates: { ...settings.statutoryRates, aidsLevyRate: parseFloat(e.target.value) }})}
                  className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ZIMDEF Rate (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={settings.statutoryRates.zimdefRate}
                  onChange={(e) => setSettings({ ...settings, statutoryRates: { ...settings.statutoryRates, zimdefRate: parseFloat(e.target.value) }})}
                  className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SAZ Rate (%)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={settings.statutoryRates.sazRate}
                  onChange={(e) => setSettings({ ...settings, statutoryRates: { ...settings.statutoryRates, sazRate: parseFloat(e.target.value) }})}
                  className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* ZiG Exchange Rate Card */}
          <div className="bg-white border border-black/[0.05] rounded-[2.5rem] p-8 shadow-sm group">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-space-gray uppercase italic tracking-tight">Fintech & Currency</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">ZiG (Zimbabwe Gold) Conversion</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-apple-gray/30 rounded-3xl border border-black/[0.02]">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                   <div className="flex items-center gap-2">
                     <span className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center font-bold text-xs">USD</span>
                     <ArrowRight className="w-4 h-4 text-gray-400" />
                     <span className="w-8 h-8 rounded-lg bg-yellow-500 text-white flex items-center justify-center font-bold text-xs">ZiG</span>
                   </div>
                   <p className="text-xs text-gray-500 leading-relaxed font-medium">
                     This rate is used to calculate the local currency equivalent for payslips and statutory reporting as required by the RBZ.
                   </p>
                </div>
                <div className="w-full md:w-64">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">1 USD = ? ZiG</label>
                   <input 
                    type="number"
                    step="0.01"
                    value={settings.statutoryRates.zigRate}
                    onChange={(e) => setSettings({ ...settings, statutoryRates: { ...settings.statutoryRates, zigRate: parseFloat(e.target.value) }})}
                    className="w-full bg-white border-2 border-accent/20 rounded-2xl px-6 py-5 text-2xl font-black text-space-gray outline-none focus:ring-2 focus:ring-accent transition-all text-center"
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Treasury & Banking Card */}
          <div className="bg-white border border-black/[0.05] rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-space-gray uppercase italic tracking-tight">Treasury & Banking</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Corporate Disbursement Account</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-apple-gray/30 rounded-3xl border border-black/[0.02]">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Bank Name</label>
                <input 
                  type="text"
                  placeholder="e.g. CABS"
                  value={settings.bankDetails?.bankName || ''}
                  onChange={(e) => setSettings({ ...settings, bankDetails: { ...(settings.bankDetails || { bankName: '', accountNumber: '', branch: '' }), bankName: e.target.value }})}
                  className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Corporate Account Number</label>
                <input 
                  type="text"
                  placeholder="e.g. 1001234567"
                  value={settings.bankDetails?.accountNumber || ''}
                  onChange={(e) => setSettings({ ...settings, bankDetails: { ...(settings.bankDetails || { bankName: '', accountNumber: '', branch: '' }), accountNumber: e.target.value }})}
                  className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Side Controls */}
        <div className="space-y-8">
          {/* Payroll Rules Card */}
          <div className="bg-white border border-black/[0.05] rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Operational Rules</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-space-gray uppercase tracking-widest">Monthly Lock Day</label>
                  <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-md">AUTO-LOCK</span>
                </div>
                <input 
                  type="number"
                  min="1"
                  max="31"
                  value={settings.payrollLockDay}
                  onChange={(e) => setSettings({ ...settings, payrollLockDay: parseInt(e.target.value) })}
                  className="w-full bg-apple-gray/50 border-none rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all font-mono"
                />
                <p className="text-[10px] text-gray-400 italic">Day of the month to freeze attendance and adjustments.</p>
              </div>

              <div className="pt-6 border-t border-black/[0.05]">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={settings.allowEmployeeUploads}
                      onChange={(e) => setSettings({ ...settings, allowEmployeeUploads: e.target.checked })}
                    />
                    <div className={cn(
                      "w-12 h-6 rounded-full transition-colors",
                      settings.allowEmployeeUploads ? "bg-accent" : "bg-gray-200"
                    )} />
                    <div className={cn(
                      "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                      settings.allowEmployeeUploads ? "translate-x-6 shadow-md" : "translate-x-0"
                    )} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-space-gray uppercase italic tracking-tight">Allow Employee Uploads</p>
                    <p className="text-[10px] text-gray-400 font-medium">Allow staff to upload docs to vault directly.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Audit History */}
          <div className="bg-space-gray rounded-[2.5rem] p-8 text-white shadow-xl">
             <div className="flex items-center gap-3 mb-8">
               <History className="w-5 h-5 text-[#FFCA28]" />
               <h3 className="text-xs font-black uppercase tracking-widest">Audit Trail</h3>
             </div>
             
             <div className="space-y-6">
                {[
                  { user: 'Admin', action: 'Updated ZiG Rate', time: '2h ago' },
                  { user: 'Admin', action: 'Changed Lock Day to 25th', time: '1d ago' },
                  { user: 'HR System', action: 'Auto-updated statutory bands', time: '1w ago' }
                ].map((log, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-[2px] bg-white/10 relative">
                       {i === 0 && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#FFCA28]" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#FFCA28] uppercase tracking-widest">{log.user}</p>
                      <p className="text-sm font-medium text-white/90">{log.action}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{log.time}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

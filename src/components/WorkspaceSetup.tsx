import React, { useState } from 'react';
import { Building2, ArrowRight, Sparkles, ShieldCheck, Globe, Coins, Loader2, CheckCircle2, ChevronRight, ChevronLeft, Briefcase, Users2, Scale, AlertCircle, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface WorkspaceSetupProps {
  userProfile: UserProfile;
  onComplete: (companyId: string) => void;
}

const NEC_SECTORS = [
  'Commercial', 'Banking', 'Mining', 'Agriculture', 'Engineering', 'Transport', 'Catering', 'Clothing', 'Construction'
];

const SIZE_RANGES = [
  '1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '500+ employees'
];

export default function WorkspaceSetup({ userProfile, onComplete }: WorkspaceSetupProps) {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Technology',
    size_range: '1-10 employees',
    country: 'Zimbabwe',
    currency: 'USD',
    nec_sector: 'Commercial',
    zimra_bp_number: '',
    phone: '',
  });
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateWorkspace = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Create Company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: formData.name,
          industry: formData.industry,
          size_range: formData.size_range,
          country: formData.country,
          currency: formData.currency,
          nec_sector: formData.nec_sector,
          zimra_bp_number: formData.zimra_bp_number,
          phone: formData.phone,
          accent_color: '#007AFF',
          plan: 'pro'
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // 2. Update User Profile (using upsert to handle new users)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userProfile.uid,
          role: 'owner',
          company_id: companyData.id,
          full_name: userProfile.fullName || userProfile.email.split('@')[0],
          email: userProfile.email
        });

      if (profileError) throw profileError;

      // 3. Initialize default data using the seed RPC
      const { error: seedError } = await supabase.rpc('seed_company_data', { 
        target_company_id: companyData.id 
      });

      if (seedError) console.error("Error seeding company data:", seedError);

      onComplete(companyData.id);
    } catch (err: any) {
      console.error('Workspace Setup Error:', err);
      setError(err.message || 'Failed to create workspace. Please try again.');
      setIsLoading(false);
    }
  };

  const handleJoinWorkspace = async () => {
    if (!joinCode) {
      setError('Please enter a company ID or invite code');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, you'd verify an invite code. For now, we use company UUID directly
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', joinCode)
        .single();

      if (companyError) throw new Error('Invalid company code. Please check with your HR admin.');

      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          company_id: company.id,
          role: 'employee' // Default to employee when joining
        })
        .eq('id', userProfile.uid);

      if (profileError) throw profileError;

      onComplete(company.id);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.name) {
      setError('Please enter your company name');
      return;
    }
    setError(null);
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-white md:bg-[#FBFBFD] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-3xl">
        {/* Mode Selector */}
        {step === 1 && (
          <div className="mb-12 flex justify-center">
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex gap-1">
              <button
                onClick={() => setMode('create')}
                className={cn(
                  "px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
                  mode === 'create' ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Create Company
              </button>
              <button
                onClick={() => setMode('join')}
                className={cn(
                  "px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
                  mode === 'join' ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Join Company
              </button>
            </div>
          </div>
        )}

        {mode === 'create' ? (
          <>
            {/* Progress Stepper */}
            <div className="mb-12 flex items-center justify-center gap-4">
              {[1, 2, 3].map((num) => (
                <React.Fragment key={num}>
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                      step >= num ? 'bg-accent text-white scale-110 shadow-lg shadow-accent/20' : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {step > num ? <CheckCircle2 className="w-6 h-6" /> : num}
                  </div>
                  {num < 3 && (
                    <div className={`h-1.5 w-16 rounded-full transition-all duration-500 ${step > num ? 'bg-accent' : 'bg-slate-100'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 italic">Company Identity</h1>
                    <p className="text-slate-600 max-w-md mx-auto font-medium">Tell us about the business you're building with ZivoHR.</p>
                  </div>

                  <div className="card-aura p-10 bg-white border border-slate-200 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-1">Legal Entity Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Zivo Solutions P/L"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-slate-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-1">Industry</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <select 
                            value={formData.industry}
                            onChange={(e) => setFormData({...formData, industry: e.target.value})}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer"
                          >
                            <option>Technology</option>
                            <option>Retail</option>
                            <option>Manufacturing</option>
                            <option>Financial Services</option>
                            <option>Mining</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-1">Company Size</label>
                        <div className="relative">
                          <Users2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <select 
                            value={formData.size_range}
                            onChange={(e) => setFormData({...formData, size_range: e.target.value})}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer"
                          >
                            {SIZE_RANGES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-3xl space-y-4 flex flex-col justify-center border border-slate-100">
                      <div className="p-3 bg-white w-fit rounded-xl shadow-sm border border-slate-100"><Sparkles className="w-6 h-6 text-accent" /></div>
                      <h3 className="font-bold text-slate-900">Why this matters?</h3>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        Industry and size help us tailor your compliance settings and NEC sector defaults. Zivo learns from your business type to automate your HR workload.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={nextStep}
                      className="btn-primary py-4 px-12 rounded-2xl flex items-center gap-2 font-black italic shadow-xl shadow-accent/20 group text-lg"
                    >
                      Continue
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 italic">HR & Compliance</h1>
                    <p className="text-slate-600 max-w-md mx-auto font-medium">Configure your regulatory and financial defaults for Payroll.</p>
                  </div>

                  <div className="card-aura p-10 bg-white border border-slate-200 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-1">NEC Sector (Zimbabwe)</label>
                        <div className="relative">
                          <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <select 
                            value={formData.nec_sector}
                            onChange={(e) => setFormData({...formData, nec_sector: e.target.value})}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer"
                          >
                            {NEC_SECTORS.map(s => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-1">Country</label>
                          <select 
                            value={formData.country}
                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                            className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer"
                          >
                            <option>Zimbabwe</option>
                            <option>South Africa</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-1">Currency</label>
                          <select 
                            value={formData.currency}
                            onChange={(e) => setFormData({...formData, currency: e.target.value})}
                            className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer"
                          >
                            <option>USD</option>
                            <option>ZiG</option>
                            <option>ZAR</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-1">ZIMRA BP Number (Optional)</label>
                        <input 
                          type="text" 
                          value={formData.zimra_bp_number}
                          onChange={(e) => setFormData({...formData, zimra_bp_number: e.target.value})}
                          placeholder="e.g. 200123456"
                          className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50 p-8 rounded-3xl space-y-4 border border-amber-100 flex flex-col justify-center">
                      <div className="p-3 bg-white w-fit rounded-xl shadow-sm border border-amber-100"><ShieldCheck className="w-6 h-6 text-amber-600" /></div>
                      <h3 className="font-bold text-slate-900">Zivo Regulatory Shield</h3>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        We've pre-configured ZIMRA tax bands and NSSA rules for Zimbabwe-based companies. Selecting your NEC sector ensures minimum wage compliance is handled automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between gap-4">
                    <button 
                      onClick={prevStep}
                      className="btn-secondary py-4 px-10 rounded-2xl flex items-center gap-2 font-black italic group border-2 border-slate-200"
                    >
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      Back
                    </button>
                    <button 
                      onClick={nextStep}
                      className="btn-primary py-4 px-12 rounded-2xl flex items-center gap-2 font-black italic shadow-xl shadow-accent/20 group text-lg"
                    >
                      Almost there
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 italic">Confirm Launch</h1>
                    <p className="text-slate-600 max-w-md mx-auto font-medium">Review your settings and initialize your ZivoHR workspace.</p>
                  </div>

                  <div className="card-aura p-10 bg-white border border-slate-200 shadow-xl space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      <div className="space-y-4">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Workspace Details</h3>
                        <div className="space-y-2">
                          <p className="text-2xl font-black text-slate-900 italic uppercase">{formData.name}</p>
                          <p className="text-sm font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-lg w-fit">{formData.industry} • {formData.size_range}</p>
                        </div>
                      </div>
                      <div className="pt-8 md:pt-0 md:pl-8 space-y-4">
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Compliance Profile</h3>
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-slate-900">NEC Sector: {formData.nec_sector}</p>
                          <p className="text-sm font-bold text-slate-600 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg w-fit">{formData.country} ({formData.currency})</p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-5 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="p-6 bg-accent/5 rounded-2xl border-2 border-accent/10 flex items-start gap-4">
                      <div className="p-2.5 bg-accent rounded-xl text-white shadow-lg shadow-accent/20"><Sparkles className="w-6 h-6" /></div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-accent">Auto-Generation Enabled</h4>
                        <p className="text-sm text-accent/80 font-medium">Launching will automatically seed your holiday calendars, leave types, and tax configurations based on Zimbabwean laws.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <button 
                      onClick={prevStep}
                      disabled={isLoading}
                      className="btn-secondary py-4 px-10 rounded-2xl flex items-center justify-center gap-2 font-black italic border-2 border-slate-200 order-2 md:order-1"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Review Settings
                    </button>
                    <button 
                      onClick={handleCreateWorkspace}
                      disabled={isLoading}
                      className="flex-1 btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 text-xl font-black italic shadow-2xl shadow-accent/30 group order-1 md:order-2"
                    >
                      {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                        <>
                          Launch ZivoHR
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            key="join"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 italic">Join a Company</h1>
              <p className="text-slate-600 max-w-md mx-auto font-medium">Enter your company ID or invite code to connect with your team.</p>
            </div>

            <div className="card-aura p-10 bg-white border border-slate-200 shadow-xl space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-1">Company Code / ID</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    className="w-full pl-12 pr-4 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-base font-bold text-slate-900 outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {error && (
                <div className="p-5 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  {error}
                </div>
              )}

              <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                <div className="p-2.5 bg-indigo-500 rounded-xl text-white"><Briefcase className="w-6 h-6" /></div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-indigo-900 text-left">Where to find this?</h4>
                  <p className="text-sm text-indigo-700/70 font-medium text-left leading-relaxed">Ask your HR administrator for the workspace ID. It's usually found in the company settings or your onboarding email.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleJoinWorkspace}
              disabled={isLoading}
              className="w-full btn-primary py-6 rounded-2xl flex items-center justify-center gap-3 text-xl font-black italic shadow-2xl shadow-accent/30 group"
            >
              {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : (
                <>
                  Connect to Company
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </button>
          </motion.div>
        )}

        <p className="text-center mt-12 text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          ZivoHR Professional • Security Standards compliant
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Send, 
  CheckCircle2, 
  Target,
  Users,
  ShieldCheck,
  Building2,
  FileText,
  Loader2,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { recruitmentService } from '../services/recruitmentService';
import { JobPosting, Company } from '../types';
import { supabase } from '../lib/supabase';

interface JobPortalProps {
  companyId: string;
}

export default function JobPortal({ companyId }: JobPortalProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form Stats
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resumeUrl: '',
    customFields: {} as Record<string, any>
  });

  useEffect(() => {
    async function loadPortal() {
      try {
        setLoading(true);
        // 1. Fetch Company Info
        const { data: compData, error: compErr } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();
        
        if (compErr) throw compErr;
        setCompany(compData as any);

        // 2. Fetch Job Postings (Only External & Open)
        const allJobs = await recruitmentService.getJobPostings(companyId);
        setJobs(allJobs.filter(j => j.status === 'open' && j.isExternal));
      } catch (err: any) {
        console.error("Portal Error:", err);
        setError("This careers page is currently unavailable.");
      } finally {
        setLoading(false);
      }
    }
    loadPortal();
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      setIsSubmitting(true);
      await recruitmentService.submitApplication(companyId, selectedJob.id, formData);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedJob(null);
        setFormData({ name: '', email: '', phone: '', resumeUrl: '', customFields: {} });
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Opening Careers Portal...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black italic text-space-gray tracking-tight uppercase">Portal Not Found</h1>
          <p className="text-gray-500 max-w-xs mx-auto font-medium">The company you are looking for does not have an active career portal or the ID is incorrect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] selection:bg-accent/10">
      {/* Fancy Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-xl border-b border-black/[0.03] z-50 px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg shadow-accent/20"
              style={{ backgroundColor: company.accentColor || '#007AFF' }}
            >
              {company.logoUrl ? (
                <img src={company.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                company.name.charAt(0)
              )}
            </div>
            <div>
              <p className="font-black italic text-xl tracking-tighter text-space-gray uppercase">{company.name}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Careers Hub</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#jobs" className="text-sm font-black text-space-gray uppercase tracking-widest hover:text-accent transition-colors">Open Roles</a>
            <a href="#about" className="text-sm font-black text-space-gray uppercase tracking-widest hover:text-accent transition-colors">Our Culture</a>
            <button className="btn-primary py-3 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20">Apply Fast</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-8">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-accent/5 px-6 py-2 rounded-full border border-accent/10"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Join the Future at {company.name}</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black italic text-space-gray tracking-tighter leading-[0.9] uppercase"
          >
            Craft Your <span className="text-accent">Legacy</span> <br className="hidden md:block" /> with Us.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            We're building the infrastructure of tomorrow in {company.industry || 'Zimbabwe'}. Be part of a mission-driven team where high-performance is the standard.
          </motion.p>
        </div>
      </section>

      {/* Jobs Grid */}
      <section id="jobs" className="py-24 px-8 bg-white border-y border-black/[0.02]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex items-end justify-between">
            <div className="space-y-4">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Current Vacancies</h2>
              <p className="text-4xl font-black italic tracking-tighter text-space-gray uppercase">Join the Squad</p>
            </div>
            <div className="bg-apple-gray p-2 rounded-2xl flex gap-2">
              <span className="px-6 py-2 bg-white rounded-xl text-xs font-bold shadow-sm">All Roles ({jobs.length})</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
              <motion.div 
                key={job.id}
                whileHover={{ y: -10 }}
                className="bg-white border border-black/[0.05] p-10 rounded-[3rem] shadow-sm hover:shadow-2xl hover:shadow-accent/5 transition-all group cursor-pointer relative overflow-hidden"
                onClick={() => setSelectedJob(job)}
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Briefcase className="w-32 h-32 rotate-12" />
                </div>
                
                <div className="gap-6 flex flex-col justify-between h-full relative z-10">
                  <div className="space-y-4">
                    <span className="px-4 py-1 bg-accent/5 text-accent text-[8px] font-black uppercase tracking-widest rounded-full border border-accent/10">
                      {job.jobType.replace('_', ' ')}
                    </span>
                    <h3 className="text-2xl font-black italic text-space-gray tracking-tight uppercase leading-tight group-hover:text-accent transition-colors">{job.title}</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{job.department}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                         <MapPin className="w-3.5 h-3.5" />
                         {job.location || 'Harare'}
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Clock className="w-3.5 h-3.5" />
                         Full Time
                      </div>
                    </div>
                    <button className="w-full py-5 bg-apple-gray text-space-gray group-hover:bg-accent group-hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      View Position <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-24 bg-apple-gray/30 rounded-[3rem] border border-dashed border-gray-200">
               <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No active vacancies right now. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Application Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-space-gray/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]"
            >
              {/* Left Sidebar - Job Info */}
              <div className="md:w-2/5 p-12 bg-accent text-white flex flex-col justify-between overflow-y-auto">
                <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-white/10 rounded-full w-fit transition-colors md:hidden mb-8">
                  <X className="w-6 h-6" />
                </button>
                <div className="space-y-10">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Career Opportunity</span>
                    <h2 className="text-5xl font-black italic tracking-tighter leading-[0.9] uppercase">{selectedJob.title}</h2>
                    <div className="flex gap-4 pt-4">
                      <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10">
                        {selectedJob.location || 'Harare'}
                      </div>
                      <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10">
                        {selectedJob.jobType.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">The Mission</h4>
                       <p className="text-sm font-medium leading-relaxed opacity-90">{selectedJob.description || "You will be responsible for building world-class solutions at ZivoHR."}</p>
                    </div>
                    {selectedJob.requirements && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Requirements</h4>
                        <p className="text-sm font-medium leading-relaxed opacity-90 whitespace-pre-line">{selectedJob.requirements}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-12 border-t border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Global Integrity</p>
                    <p className="text-[10px] opacity-60 font-medium">Verified by ZivoHR Security</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Application Form */}
              <div className="flex-1 p-12 overflow-y-auto bg-white relative">
                <button onClick={() => setSelectedJob(null)} className="absolute top-12 right-12 p-2 hover:bg-apple-gray rounded-full transition-colors hidden md:block">
                  <X className="w-6 h-6 text-gray-300" />
                </button>

                {submitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                     <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2.5rem] flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-12 h-12" />
                     </div>
                     <h3 className="text-3xl font-black italic text-space-gray uppercase tracking-tighter">Mission Accepted!</h3>
                     <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Our recruitment team will review your CV shortly.</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Step 1 of 1</h3>
                      <p className="text-3xl font-black italic tracking-tighter text-space-gray uppercase">Submit Your Profile</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. Tendai Moyo"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="input-aura w-full py-4 text-sm font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                          <input 
                            required
                            type="email" 
                            placeholder="tmoyo@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="input-aura w-full py-4 text-sm font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                          <input 
                            required
                            type="tel" 
                            placeholder="+263 7..."
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="input-aura w-full py-4 text-sm font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">LinkedIn / Portfolio URL</label>
                          <input 
                            type="url" 
                            placeholder="https://..."
                            value={formData.resumeUrl}
                            onChange={(e) => setFormData({...formData, resumeUrl: e.target.value})}
                            className="input-aura w-full py-4 text-sm font-bold"
                          />
                        </div>
                      </div>

                      {/* Custom Fields */}
                      {selectedJob.customFieldsConfig && selectedJob.customFieldsConfig.length > 0 && (
                        <div className="space-y-6 pt-6 border-t border-black/[0.05]">
                           <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Additional Information</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {selectedJob.customFieldsConfig.map((field, idx) => (
                                <div key={idx} className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{field.name} {field.required && '*'}</label>
                                  <input 
                                    required={field.required}
                                    type={field.type === 'number' ? 'number' : 'text'} 
                                    placeholder={field.name}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      customFields: { ...formData.customFields, [field.name]: e.target.value }
                                    })}
                                    className="input-aura w-full py-4 text-sm font-bold"
                                  />
                                </div>
                              ))}
                           </div>
                        </div>
                      )}

                      <div className="pt-10 flex flex-col items-center gap-6">
                        <button 
                          disabled={isSubmitting}
                          type="submit"
                          className="w-full py-6 bg-accent text-white rounded-3xl text-xs font-black uppercase italic tracking-widest shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>Confirm Application <Send className="w-4 h-4" /></>
                          )}
                        </button>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center px-12">
                          By clicking "Confirm Application", you agree to our recruitment policy and allow {company.name} to process your data.
                        </p>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-12 border-t border-black/[0.03] px-8 text-center bg-white">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">Powered by ZivoHR</p>
        <div className="flex items-center justify-center gap-8 opacity-40 grayscale">
           <Target className="w-6 h-6 border-2 border-black rounded-full p-0.5" />
           <Target className="w-6 h-6 border-2 border-black rounded-full p-0.5" />
           <Target className="w-6 h-6 border-2 border-black rounded-full p-0.5" />
        </div>
      </footer>
    </div>
  );
}

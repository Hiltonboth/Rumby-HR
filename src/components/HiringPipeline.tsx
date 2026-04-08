import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Star, 
  Briefcase, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PenTool,
  ArrowLeft,
  Users as UsersIcon,
  Sparkles,
  X,
  AlertCircle,
  Eye,
  Loader2
} from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import SignaturePad from './SignaturePad';
import { GoogleGenAI } from '@google/genai';

const stages = ['Applied', 'Screening', 'Interviewing', 'Offer Sent', 'Hired'];

interface JobOpening {
  id: string;
  role: string;
  department: string;
  applicants: number;
  status: 'Open' | 'Closed';
  postedDate: string;
}

const MOCK_JOBS: JobOpening[] = [
  { id: '1', role: 'Senior Software Engineer', department: 'Engineering', applicants: 12, status: 'Open', postedDate: '2024-03-15' },
  { id: '2', role: 'Product Manager', department: 'Product', applicants: 8, status: 'Open', postedDate: '2024-03-18' },
  { id: '3', role: 'UX Designer', department: 'Design', applicants: 5, status: 'Closed', postedDate: '2024-03-10' },
];

export default function HiringPipeline() {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [activeTab, setActiveTab] = useState<'candidates' | 'jobs'>('candidates');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showBulkSignModal, setShowBulkSignModal] = useState(false);
  const [signingCandidate, setSigningCandidate] = useState<any | null>(null);
  const [showMatchModal, setShowMatchModal] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [candidates, setCandidates] = useState(MOCK_CANDIDATES.map(c => ({
    ...c,
    contractStatus: 'none' as 'none' | 'sent' | 'signed' | 'rejected',
    matchAnalysis: null as any
  })));

  const generateMatchAnalysis = async (candidate: any) => {
    if (candidate.matchAnalysis) {
      setShowMatchModal(candidate);
      return;
    }

    setIsAnalyzing(true);
    setShowMatchModal({ ...candidate, isLoading: true });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const prompt = `
        Analyze the match between this candidate and the job requirements.
        Candidate: ${candidate.name}
        Role: ${candidate.role}
        Skills: ${candidate.skills}
        Experience: ${candidate.experience}
        
        Job Requirements: Senior Software Engineer with expertise in React, TypeScript, Node.js, and cloud infrastructure.
        
        Provide a detailed analysis in JSON format:
        {
          "score": "0-5",
          "strengths": ["strength 1", "strength 2", ...],
          "weaknesses": ["weakness 1", "weakness 2", ...],
          "recommendation": "detailed recommendation mimicking Indeed/Glassdoor style"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || '';
      const cleanText = text.replace(/```json|```/g, '').trim();
      const analysis = JSON.parse(cleanText);

      const updatedCandidate = { ...candidate, matchAnalysis: analysis, score: analysis.score };
      
      setCandidates(prev => prev.map(c => c.id === candidate.id ? updatedCandidate : c));
      setShowMatchModal(updatedCandidate);
    } catch (error) {
      console.error("Error generating match analysis:", error);
      setShowMatchModal({
        ...candidate,
        matchAnalysis: {
          score: candidate.score,
          strengths: ['Relevant experience', 'Strong technical skills'],
          weaknesses: ['Could not generate detailed AI analysis'],
          recommendation: 'Manual review recommended.'
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendContract = (candidateId: string) => {
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? { ...c, contractStatus: 'sent', status: 'Offer Sent' } : c
    ));
  };

  const handleSignContract = (signature: string) => {
    if (signingCandidate) {
      setCandidates(prev => prev.map(c => 
        c.id === signingCandidate.id ? { ...c, contractStatus: 'signed', status: 'Hired' } : c
      ));
      setSigningCandidate(null);
    }
  };

  const handleBulkSign = (signature: string) => {
    setCandidates(prev => prev.map(c => 
      c.contractStatus === 'sent' ? { ...c, contractStatus: 'signed', status: 'Hired' } : c
    ));
    setShowBulkSignModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-space-gray">Recruitment</h1>
          <p className="text-gray-500 mt-1">Track and manage your hiring pipeline from application to hire.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-black/[0.05] rounded-xl p-1 flex">
            <button 
              onClick={() => setActiveTab('candidates')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'candidates' ? "bg-accent text-white shadow-sm" : "text-gray-400 hover:text-space-gray"
              )}
            >
              Candidates
            </button>
            <button 
              onClick={() => setActiveTab('jobs')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'jobs' ? "bg-accent text-white shadow-sm" : "text-gray-400 hover:text-space-gray"
              )}
            >
              Job Openings
            </button>
          </div>
          {activeTab === 'candidates' && (
            <div className="bg-white border border-black/[0.05] rounded-xl p-1 flex">
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-accent text-white shadow-sm" : "text-gray-400 hover:text-space-gray"
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'kanban' ? "bg-accent text-white shadow-sm" : "text-gray-400 hover:text-space-gray"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}
          <button 
            onClick={() => setShowPostJobModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Post Vacancy
          </button>
        </div>
      </div>

      {activeTab === 'candidates' ? (
        <>
          {/* Search Bar & Bulk Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search candidates by name or role..."
                className="w-full bg-white border border-black/[0.05] rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => {
                const sentCount = candidates.filter(c => c.contractStatus === 'sent').length;
                if (sentCount > 0) setShowBulkSignModal(true);
                else alert("No pending contracts to sign.");
              }}
              className="btn-secondary flex items-center gap-2 text-accent border-accent/20"
            >
              <PenTool className="w-4 h-4" />
              Bulk Sign Contracts
            </button>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-white border border-black/[0.05] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-apple-gray/30 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-black/[0.05]">
                      <th className="px-6 py-4 font-bold">Candidate</th>
                      <th className="px-6 py-4 font-bold">Applied For</th>
                      <th className="px-6 py-4 font-bold text-center">AI Match Score</th>
                      <th className="px-6 py-4 font-bold">Contract Status</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05]">
                    {candidates.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((candidate) => (
                      <tr key={candidate.id} className="group hover:bg-apple-gray/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                              {candidate.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-space-gray">{candidate.name}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {candidate.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-space-gray">{candidate.role}</p>
                          <p className="text-xs text-gray-500">Engineering Dept</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1 text-sm font-bold text-orange-500">
                              <Star className="w-4 h-4 fill-current" />
                              {candidate.score}
                            </div>
                            <div className="w-20 h-1 bg-apple-gray rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500" style={{ width: `${parseFloat(candidate.score) * 20}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {candidate.contractStatus === 'none' && <span className="text-xs text-gray-400 font-medium italic">No action taken</span>}
                            {candidate.contractStatus === 'sent' && (
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Offer Sent
                              </span>
                            )}
                            {candidate.contractStatus === 'signed' && (
                              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Signed
                              </span>
                            )}
                            {candidate.contractStatus === 'rejected' && (
                              <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Rejected
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {candidate.contractStatus === 'none' && (
                              <button 
                                onClick={() => handleSendContract(candidate.id)}
                                className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent/90 transition-all flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Send Contract
                              </button>
                            )}
                            {candidate.contractStatus === 'sent' && (
                              <button 
                                onClick={() => setSigningCandidate(candidate)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all flex items-center gap-1.5"
                              >
                                <PenTool className="w-3.5 h-3.5" />
                                Sign Now
                              </button>
                            )}
                            <button 
                              onClick={() => generateMatchAnalysis(candidate)}
                              disabled={isAnalyzing}
                              className="p-2 text-gray-300 hover:text-accent transition-colors disabled:opacity-50"
                              title="View AI Match Analysis"
                            >
                              {isAnalyzing && showMatchModal?.id === candidate.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4" />
                              )}
                            </button>
                            <button className="p-2 text-gray-300 hover:text-space-gray transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-8 px-8 no-scrollbar">
              {stages.map((stage) => (
                <div key={stage} className="flex-shrink-0 w-80 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-space-gray uppercase tracking-widest">{stage}</h3>
                      <span className="px-2 py-0.5 bg-apple-gray text-gray-500 text-[10px] font-bold rounded-full">
                        {candidates.filter(c => c.status === stage).length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 min-h-[500px] p-2 bg-apple-gray/30 rounded-2xl border border-black/[0.02]">
                    {candidates.filter(c => c.status === stage).map((candidate) => (
                      <div key={candidate.id} className="bg-white border border-black/[0.05] p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                            {candidate.name.charAt(0)}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                              <Star className="w-3 h-3 fill-current" />
                              {candidate.score}
                            </div>
                            {candidate.contractStatus !== 'none' && (
                              <span className={cn(
                                "text-[8px] font-black uppercase tracking-widest",
                                candidate.contractStatus === 'sent' ? "text-blue-500" :
                                candidate.contractStatus === 'signed' ? "text-green-600" : "text-red-500"
                              )}>
                                {candidate.contractStatus}
                              </span>
                            )}
                          </div>
                        </div>
                        <h4 className="font-bold text-space-gray">{candidate.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{candidate.role}</p>
                        <div className="mt-4 pt-4 border-t border-black/[0.03] flex items-center justify-between">
                          <div className="flex gap-2">
                            <button className="p-1.5 hover:bg-apple-gray rounded-lg text-gray-400 transition-colors">
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 hover:bg-apple-gray rounded-lg text-gray-400 transition-colors">
                              <Phone className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button className="text-gray-400 hover:text-space-gray">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          {selectedJob ? (
            <div className="space-y-6">
              <button 
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-accent font-bold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Job Openings
              </button>
              
              <div className="bg-white border border-black/[0.05] rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Briefcase className="w-10 h-10" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-bold text-space-gray">{selectedJob.role}</h2>
                  <p className="text-lg text-gray-500 font-medium">{selectedJob.department} • {selectedJob.applicants} Applicants</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Posted on {new Date(selectedJob.postedDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="w-4 h-4" />
                      {selectedJob.applicants} Total Applications
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="btn-secondary">Edit Job</button>
                  <button className="btn-primary bg-red-500 border-none">Close Job</button>
                </div>
              </div>

              <div className="bg-white border border-black/[0.05] rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                  <h3 className="font-bold text-space-gray">Ranked Applicants (AI Pre-screened)</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    Powered by Rumby AI
                  </div>
                </div>
                <div className="divide-y divide-black/[0.05]">
                  {candidates.filter(c => c.role === selectedJob.role || selectedJob.role === 'Senior Software Engineer').sort((a, b) => parseFloat(b.score) - parseFloat(a.score)).map((candidate) => (
                    <div key={candidate.id} className="p-6 flex items-center justify-between hover:bg-apple-gray/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/5 flex items-center justify-center text-accent font-bold text-lg">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-space-gray">{candidate.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold">
                              <Star className="w-3 h-3 fill-current" />
                              {candidate.score} Match
                            </div>
                            <span className="text-xs text-gray-400">Applied 2 days ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-apple-gray rounded-xl transition-all">View CV</button>
                        <button 
                          onClick={() => handleSendContract(candidate.id)}
                          className="px-4 py-2 text-sm font-bold bg-accent text-white rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-all"
                        >
                          Send Offer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_JOBS.map((job) => (
                <div 
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="bg-white border border-black/[0.05] p-6 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
                      <Briefcase className="w-7 h-7" />
                    </div>
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
                      job.status === 'Open' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      {job.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-space-gray mb-1">{job.role}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6">{job.department}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-black/[0.03]">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Applicants</p>
                      <p className="text-lg font-bold text-space-gray">{job.applicants}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Posted</p>
                      <p className="text-lg font-bold text-space-gray">{new Date(job.postedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setShowPostJobModal(true)}
                className="border-2 border-dashed border-black/[0.05] p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-accent/30 hover:text-accent transition-all group"
              >
                <div className="w-14 h-14 bg-apple-gray rounded-2xl flex items-center justify-center group-hover:bg-accent/10 transition-all">
                  <Plus className="w-7 h-7" />
                </div>
                <span className="font-bold">Post New Vacancy</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bulk Sign Modal */}
      <AnimatePresence>
        {showBulkSignModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Bulk Sign Contracts</h3>
                    <p className="text-xs text-gray-500">Signing {candidates.filter(c => c.contractStatus === 'sent').length} pending contracts</p>
                  </div>
                </div>
                <button onClick={() => setShowBulkSignModal(false)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selected Candidates</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {candidates.filter(c => c.contractStatus === 'sent').map(c => (
                      <div key={c.id} className="p-3 bg-apple-gray/30 rounded-xl border border-black/[0.03] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                          {c.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-space-gray truncate">{c.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{c.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your E-Signature</h4>
                    <span className="text-[10px] text-accent font-bold bg-accent/5 px-2 py-0.5 rounded-full">Secure & Legally Binding</span>
                  </div>
                  <SignaturePad onSave={handleBulkSign} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Single Sign Modal */}
      <AnimatePresence>
        {signingCandidate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Sign Contract</h3>
                    <p className="text-xs text-gray-500">For {signingCandidate.name} - {signingCandidate.role}</p>
                  </div>
                </div>
                <button onClick={() => setSigningCandidate(null)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="p-6 bg-apple-gray/30 rounded-2xl border border-black/[0.03] flex items-start gap-4">
                  <FileText className="w-8 h-8 text-accent flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-space-gray">Employment Agreement</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      By signing below, you authorize the issuance of the employment contract for {signingCandidate.name}. This signature will be appended to the official document as the employer's representative.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Draw your signature</h4>
                  <SignaturePad onSave={handleSignContract} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Match Analysis Modal */}
      <AnimatePresence>
        {showMatchModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">AI Match Analysis</h3>
                    <p className="text-xs text-gray-500">Candidate: {showMatchModal.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowMatchModal(null)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-8">
                {showMatchModal.isLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    <p className="text-gray-500 font-medium">AI is analyzing candidate profile...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            className="text-apple-gray"
                            strokeDasharray="100, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            className="text-orange-500"
                            strokeDasharray={`${parseFloat(showMatchModal.score) * 20}, 100`}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-space-gray">{showMatchModal.score}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Match Score</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-green-600 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {showMatchModal.matchAnalysis?.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Weaknesses/Gaps
                        </h4>
                        <ul className="space-y-2">
                          {showMatchModal.matchAnalysis?.weaknesses.map((w: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-6 bg-apple-gray/30 rounded-2xl border border-black/[0.03]">
                      <h4 className="text-xs font-bold text-space-gray uppercase tracking-widest mb-2">Overall Recommendation</h4>
                      <p className="text-sm text-gray-600 leading-relaxed italic">
                        "{showMatchModal.matchAnalysis?.recommendation}"
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="p-8 border-t border-black/[0.05] flex justify-end">
                <button onClick={() => setShowMatchModal(null)} className="btn-primary px-8 py-3">Close Analysis</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostJobModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[250] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <Plus className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Post New Vacancy</h3>
                </div>
                <button onClick={() => setShowPostJobModal(false)} className="p-2 hover:bg-apple-gray rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Job Title</label>
                    <input type="text" placeholder="e.g. Senior Software Engineer" className="w-full bg-apple-gray/30 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Department</label>
                    <select className="w-full bg-apple-gray/30 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20">
                      <option>Engineering</option>
                      <option>Product</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Job Description</label>
                  <textarea rows={4} placeholder="Describe the role, responsibilities, and requirements..." className="w-full bg-apple-gray/30 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 resize-none" />
                </div>
                <div className="p-6 bg-accent/5 rounded-2xl border border-accent/10 flex items-center gap-4">
                  <Sparkles className="w-6 h-6 text-accent" />
                  <p className="text-xs text-accent/80 font-medium">
                    Rumby AI will automatically pre-screen and rank applicants based on your job description and requirements.
                  </p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowPostJobModal(false)} className="flex-1 btn-secondary py-4">Cancel</button>
                  <button onClick={() => { setShowPostJobModal(false); alert("Job vacancy posted successfully!"); }} className="flex-1 btn-primary py-4">Post Vacancy</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Loader2,
  Upload,
  Info,
  UserPlus
} from 'lucide-react';
import { MOCK_CANDIDATES } from '../constants';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import SignaturePad from './SignaturePad';
import { GoogleGenAI, Type } from '@google/genai';
import { UserProfile, Candidate, JobPosting, DocumentEnvelope, DocumentRecipient } from '../types';
import { recruitmentService } from '../services/recruitmentService';
import { documentService } from '../services/documentService';
import { employeeService } from '../services/employeeService';
import { jsPDF } from 'jspdf';

import { useTheme } from './ThemeContext';

const stages = ['Applied', 'Shortlisted', 'Initial Interview', 'Reference Check', 'Medical', 'Final Offer', 'Hired'];

interface HiringPipelineProps {
  userProfile?: UserProfile | null;
}

export default function HiringPipeline({ userProfile }: HiringPipelineProps) {
  const { isDark } = useTheme();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [activeTab, setActiveTab] = useState<'candidates' | 'jobs'>('candidates');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
    requirements: '',
    isExternal: true,
    customFields: [] as { name: string; type: 'text' | 'number' | 'file'; required: boolean }[]
  });
  const [showBulkSignModal, setShowBulkSignModal] = useState(false);
  const [signingCandidate, setSigningCandidate] = useState<Candidate | null>(null);
  const [showMatchModal, setShowMatchModal] = useState<Candidate | null>(null);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState<Candidate | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [loading, setLoading] = useState(true);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);

  // Multi-party signing state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitingCandidate, setInvitingCandidate] = useState<Candidate | null>(null);
  const [recipients, setRecipients] = useState<{ email: string; name: string }[]>([
    { email: '', name: '' }
  ]);

  useEffect(() => {
    async function loadData() {
      if (!userProfile?.companyId) return;
      try {
        setLoading(true);
        const [appList, jobList] = await Promise.all([
          recruitmentService.getApplicants(userProfile.companyId),
          recruitmentService.getJobPostings(userProfile.companyId)
        ]);
        setCandidates(appList.length > 0 ? appList : MOCK_CANDIDATES.map(c => ({
          ...c,
          companyId: userProfile?.companyId || '',
          email: '',
          score: typeof c.score === 'number' ? c.score : parseFloat(c.score)
        } as any)));
        setJobs(jobList);
      } catch (err) {
        console.error("Error loading recruitment data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userProfile?.companyId]);

  const generateMatchAnalysis = async (candidate: Candidate) => {
    if (candidate.aiAnalysis) {
      setShowMatchModal(candidate);
      return;
    }

    setIsAnalyzing(true);
    setShowMatchModal({ ...candidate, isLoading: true } as any);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const prompt = `
        Analyze the match between this candidate and the job requirements.
        Candidate: ${candidate.name}
        Role: ${candidate.role}
        Skills: ${candidate.skills?.join(', ') || 'Not specified'}
        Experience: ${candidate.experience || 'Not specified'}
        
        Job Requirements: Senior Software Engineer with expertise in React, TypeScript, Node.js, and cloud infrastructure.
        
        Provide a detailed analysis.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Match score from 0.0 to 5.0" },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendation: { type: Type.STRING }
            },
            required: ["score", "strengths", "weaknesses", "recommendation"]
          }
        }
      });

      const analysis = JSON.parse(response.text.trim());

      const updatedCandidate = { 
        ...candidate, 
        aiAnalysis: analysis, 
        aiScore: analysis.score,
        score: analysis.score 
      };
      
      // Persist to Supabase if candidate exists in DB
      if (candidate.id.length > 10) { // Simple check for UUID vs mock ID
        await recruitmentService.updateApplicant(candidate.id, {
          ai_score: analysis.score,
          ai_analysis: analysis
        });
      }

      setCandidates(prev => prev.map(c => c.id === candidate.id ? updatedCandidate : c));
      setShowMatchModal(updatedCandidate);
    } catch (error) {
      console.error("Error generating match analysis:", error);
      const fallback = {
        score: candidate.score || 3.5,
        strengths: ['Relevant experience', 'Strong technical skills'],
        weaknesses: ['AI analysis unavailable'],
        recommendation: 'Manual review recommended.'
      };
      setShowMatchModal({
        ...candidate,
        aiAnalysis: fallback
      } as any);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateCoverLetter = async (candidate: any) => {
    setIsGeneratingCoverLetter(true);
    setShowCoverLetterModal({ ...candidate, isLoading: true });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      const prompt = `
        Generate a professional cover letter for this candidate applying for the role of ${candidate.role}.
        Candidate: ${candidate.name}
        Skills: ${candidate.skills?.join(', ') || 'Not specified'}
        Experience: ${candidate.experience || 'Not specified'}
        
        Job Description: Senior Software Engineer with expertise in React, TypeScript, Node.js, and cloud infrastructure.
        
        The cover letter should be professional, concise, and highlight how the candidate's skills match the job requirements. 
        Tailor it to the Zimbabwean context if applicable.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const coverLetter = response.text || "Could not generate cover letter.";
      setShowCoverLetterModal({ ...candidate, content: coverLetter, isLoading: false });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      setShowCoverLetterModal({ ...candidate, content: "Error generating cover letter. Please try again.", isLoading: false });
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleStartSigningFlow = (candidate: Candidate) => {
    setInvitingCandidate(candidate);
    setRecipients([
      { email: candidate.email || '', name: candidate.name || '' },
      { email: userProfile?.email || '', name: userProfile?.fullName || '' }
    ]);
    setShowInviteModal(true);
  };

  const handleInviteSigners = async () => {
    if (!invitingCandidate || !userProfile?.companyId) return;
    
    try {
      setIsAnalyzing(true);
      
      // 1. Generate a dummy draft contract PDF
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("OFFER OF EMPLOYMENT", 105, 40, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Candidate: ${invitingCandidate.name}`, 20, 60);
      doc.text(`Role: Senior Software Engineer`, 20, 70);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
      doc.text("Lorum ipsum dolor sit amet, consectetur adipiscing elit. ...", 20, 100);
      
      const pdfBlob = doc.output('blob');
      
      // 2. Upload to Supabase Storage
      const fileUrl = await documentService.uploadDocument(
        userProfile.companyId, 
        `Offer_${invitingCandidate.name.replace(' ', '_')}.pdf`,
        pdfBlob
      );

      // 3. Create Envelope and Recipients
      await documentService.createEnvelope(
        {
          companyId: userProfile.companyId,
          applicantId: invitingCandidate.id,
          title: `Offer Letter - ${invitingCandidate.name}`,
          fileUrl: fileUrl
        },
        recipients.map((r, i) => ({
          email: r.email,
          fullName: r.name,
          signingOrder: i + 1
        }))
      );

      // 4. Update Candidate status
      if (invitingCandidate.id.length > 10) {
        await recruitmentService.updateApplicant(invitingCandidate.id, { stage: 'offer_sent' });
      }

      setCandidates(prev => prev.map(c => 
        c.id === invitingCandidate.id ? { ...c, status: 'Offer Sent' } : c
      ));

      setShowInviteModal(false);
      setInvitingCandidate(null);
      alert("Signing invitation sent to all parties!");
    } catch (err) {
      console.error(err);
      alert("Failed to send invites.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startReviewForEmployee = async (employeeId: string, cycleId: string) => {
    // Legacy mapping logic or triggered on hire
  };

  const handleHireCandidate = async (candidate: Candidate) => {
    if (!userProfile?.companyId) return;
    try {
      setLoading(true);
      // 1. Move UI state
      setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: 'Hired' } : c));
      
      // 2. Create Employee Profile (Status: Onboarding)
      await recruitmentService.updateApplicant(candidate.id, { stage: 'Hired' });
      await employeeService.createEmployeeFromApplicant(userProfile.companyId, candidate);
      
      alert(`${candidate.name} has been hired! They are now in the Onboarding pipeline.`);
    } catch (err) {
      console.error(err);
      alert("Failed to convert candidate to employee.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (!userProfile?.companyId) return;

    try {
      setLoading(true);
      const savedJob = await recruitmentService.createJobPosting({
        ...newJobForm,
        companyId: userProfile.companyId,
        status: 'open',
        jobType: 'full_time',
        customFieldsConfig: newJobForm.customFields
      } as any);

      setJobs(prev => [savedJob as any, ...prev]);
      setShowPostJobModal(false);
      setNewJobForm({
        title: '',
        department: '',
        location: '',
        description: '',
        requirements: '',
        isExternal: true,
        customFields: []
      });
      alert("Job vacancy posted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async (signature: string) => {
    if (signingCandidate && userProfile?.companyId) {
      try {
        await recruitmentService.updateApplicant(signingCandidate.id, { stage: 'hired' });
        await employeeService.createEmployeeFromApplicant(userProfile.companyId, signingCandidate);
        
        setCandidates(prev => prev.map(c => 
          c.id === signingCandidate.id ? { ...c, status: 'Hired' } : c
        ));
        setSigningCandidate(null);
        alert("Document signed! Candidate has been moved to Employee Directory.");
      } catch (err) {
        console.error(err);
        alert("Signed, but failed to create employee record.");
      }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-space-gray">Recruitment</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500">Track and manage your hiring pipeline.</p>
            {userProfile?.companyId && (
              <>
                <span className="text-gray-300">•</span>
                <a 
                  href={`/careers/${userProfile.companyId}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-black text-accent uppercase tracking-widest hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Public Careers Portal
                </a>
                <span className="text-gray-300">•</span>
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/careers/${userProfile.companyId}`;
                    navigator.clipboard.writeText(url);
                    alert("Careers URL copied to clipboard!");
                  }}
                  className="flex items-center gap-1.5 text-xs font-black text-space-gray uppercase tracking-widest hover:text-accent transition-colors"
                >
                  <PenTool className="w-3 h-3" />
                  Share Link
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className={cn("border rounded-xl p-1 flex w-full sm:w-auto", isDark ? "bg-slate-900 border-white/5" : "bg-white border-black/[0.05]")}>
            <button 
              onClick={() => setActiveTab('candidates')}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'candidates' 
                  ? "bg-accent text-white shadow-sm" 
                  : (isDark ? "text-slate-500 hover:text-slate-200" : "text-gray-400 hover:text-space-gray")
              )}
            >
              Candidates
            </button>
            <button 
              onClick={() => setActiveTab('jobs')}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'jobs' 
                  ? "bg-accent text-white shadow-sm" 
                  : (isDark ? "text-slate-500 hover:text-slate-200" : "text-gray-400 hover:text-space-gray")
              )}
            >
              Job Openings
            </button>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {activeTab === 'candidates' && (
              <div className={cn("border rounded-xl p-1 flex", isDark ? "bg-slate-900 border-white/5" : "bg-white border-black/[0.05]")}>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'list' ? "bg-accent text-white shadow-sm" : (isDark ? "text-slate-500 hover:text-slate-200" : "text-gray-400 hover:text-space-gray")
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('kanban')}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === 'kanban' ? "bg-accent text-white shadow-sm" : (isDark ? "text-slate-500 hover:text-slate-200" : "text-gray-400 hover:text-space-gray")
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            )}
            <button 
              onClick={() => setShowPostJobModal(true)}
              className="flex-1 sm:flex-none btn-primary flex items-center justify-center gap-2 py-3 px-6"
            >
              <Plus className="w-4 h-4" />
              Post Vacancy
            </button>
          </div>
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
                className="w-full bg-white border border-black/[0.05] rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-sm"
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
              className="btn-secondary flex items-center justify-center gap-2 text-accent border-accent/20 py-3 px-6"
            >
              <PenTool className="w-4 h-4" />
              Bulk Sign Contracts
            </button>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-white border border-black/[0.05] rounded-2xl overflow-hidden shadow-sm">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
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
                            {candidate.status !== 'Hired' && (
                              <button 
                                onClick={() => handleStartSigningFlow(candidate)}
                                className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent/90 transition-all flex items-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Send Contract
                              </button>
                            )}
                            {candidate.status === 'Offer Sent' && (
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
                              title="Check Job Match"
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

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-black/[0.05]">
                {candidates.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((candidate) => (
                  <div key={candidate.id} className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                          {candidate.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-space-gray text-sm">{candidate.name}</p>
                          <p className="text-[10px] text-gray-500">{candidate.role}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                          <Star className="w-3 h-3 fill-current" />
                          {candidate.score}
                        </div>
                        <div className="w-16 h-1 bg-apple-gray rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500" style={{ width: `${parseFloat(candidate.score) * 20}%` }} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {candidate.status === 'Offer Sent' && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            Sent
                          </span>
                        )}
                        {candidate.status === 'Hired' && (
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Signed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {candidate.status !== 'Hired' && (
                          <button 
                            onClick={() => handleStartSigningFlow(candidate)}
                            className="p-2 bg-accent text-white rounded-lg shadow-sm"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        {candidate.status === 'Offer Sent' && (
                          <button 
                            onClick={() => setSigningCandidate(candidate)}
                            className="p-2 bg-green-600 text-white rounded-lg shadow-sm"
                          >
                            <PenTool className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => generateMatchAnalysis(candidate)}
                          className="p-2 bg-apple-gray text-gray-500 rounded-lg hover:text-accent transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-apple-gray text-gray-500 rounded-lg">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                    <button 
                      onClick={() => {
                        const nextStage = stages[stages.indexOf(candidate.status) + 1];
                        if (nextStage === 'Hired') {
                          handleHireCandidate(candidate);
                        } else if (nextStage) {
                          recruitmentService.updateApplicant(candidate.id, { stage: nextStage });
                          setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: nextStage as any } : c));
                        }
                      }}
                      className="p-1 px-2 border border-black/[0.05] rounded-lg hover:bg-accent hover:text-white transition-all group-hover:scale-110"
                      title="Promote to Next Stage"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
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
                  <h2 className="text-3xl font-bold text-space-gray">{selectedJob.title}</h2>
                  <p className="text-lg text-gray-500 font-medium">{selectedJob.department} • {selectedJob.applicantsCount} Applicants</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Posted on {new Date(selectedJob.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="w-4 h-4" />
                      {selectedJob.applicantsCount} Total Applications
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
                    Powered by ZivoHR AI
                  </div>
                </div>
                <div className="divide-y divide-black/[0.05]">
                  {candidates.filter(c => c.role === selectedJob.id || selectedJob.title === 'Senior Software Engineer').sort((a, b) => (b.aiScore || b.score) - (a.aiScore || a.score)).map((candidate) => (
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
                              {candidate.aiScore || candidate.score} Match
                            </div>
                            <span className="text-xs text-gray-400">Applied 2 days ago</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {candidate.resumeUrl && (
                          <a 
                            href={candidate.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-apple-gray rounded-xl transition-all"
                          >
                            View CV
                          </a>
                        )}
                        <button 
                          onClick={() => handleStartSigningFlow(candidate)}
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
              {jobs.map((job) => (
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
                  <h3 className="text-xl font-bold text-space-gray mb-1">{job.title}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6">{job.department}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-black/[0.03]">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Applicants</p>
                      <p className="text-lg font-black text-space-gray">{job.applicantsCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Posted</p>
                      <p className="text-lg font-black text-space-gray">{new Date(job.createdAt).toLocaleDateString()}</p>
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">Bulk Sign Contracts</h3>
                    <p className="text-[10px] md:text-xs text-gray-500">Signing {candidates.filter(c => c.contractStatus === 'sent').length} pending contracts</p>
                  </div>
                </div>
                <button onClick={() => setShowBulkSignModal(false)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Selected Candidates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <h4 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Your E-Signature</h4>
                    <span className="text-[8px] md:text-[10px] text-accent font-bold bg-accent/5 px-2 py-0.5 rounded-full">Secure & Legally Binding</span>
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">Sign Contract</h3>
                    <p className="text-[10px] md:text-xs text-gray-500">For {signingCandidate.name} - {signingCandidate.role}</p>
                  </div>
                </div>
                <button onClick={() => setSigningCandidate(null)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                <div className="p-4 md:p-6 bg-apple-gray/30 rounded-2xl border border-black/[0.03] flex items-start gap-3 md:gap-4">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-accent flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-space-gray">Employment Agreement</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1 leading-relaxed">
                      By signing below, you authorize the issuance of the employment contract for {signingCandidate.name}. This signature will be appended to the official document as the employer's representative.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Draw your signature</h4>
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">AI Match Analysis</h3>
                    <p className="text-[10px] md:text-xs text-gray-500">Candidate: {showMatchModal.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowMatchModal(null)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6 md:space-y-8 overflow-y-auto">
                {showMatchModal.isLoading ? (
                  <div className="py-12 md:py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-accent animate-spin" />
                    <p className="text-sm md:text-base text-gray-500 font-medium">AI is analyzing candidate profile...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="relative w-24 h-24 md:w-32 md:h-32">
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
                          <span className="text-2xl md:text-3xl font-black text-space-gray">{showMatchModal.score}</span>
                          <span className="text-[6px] md:text-[8px] font-bold text-gray-400 uppercase tracking-widest">Match Score</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-3 md:space-y-4">
                        <h4 className="text-[10px] md:text-xs font-bold text-green-600 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1.5 md:space-y-2">
                          {showMatchModal.matchAnalysis?.strengths.map((s: string, i: number) => (
                            <li key={i} className="text-xs md:text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        <h4 className="text-[10px] md:text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                          <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          Weaknesses/Gaps
                        </h4>
                        <ul className="space-y-1.5 md:space-y-2">
                          {showMatchModal.matchAnalysis?.weaknesses.map((w: string, i: number) => (
                            <li key={i} className="text-xs md:text-sm text-gray-600 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 md:p-6 bg-apple-gray/30 rounded-2xl border border-black/[0.03]">
                      <h4 className="text-[10px] md:text-xs font-bold text-space-gray uppercase tracking-widest mb-2">Overall Recommendation</h4>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed italic">
                        "{showMatchModal.matchAnalysis?.recommendation}"
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 md:p-8 border-t border-black/[0.05] flex flex-col sm:flex-row justify-end gap-3">
                <button 
                  onClick={() => {
                    setShowMatchModal(null);
                    generateCoverLetter(showMatchModal);
                  }} 
                  className="w-full sm:flex-1 btn-secondary px-6 py-2.5 md:py-3 flex items-center justify-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Generate Cover Letter
                </button>
                <button onClick={() => setShowMatchModal(null)} className="w-full sm:flex-1 btn-primary px-8 py-2.5 md:py-3 text-sm">Close Analysis</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cover Letter Modal */}
      <AnimatePresence>
        {showCoverLetterModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">AI Generated Cover Letter</h3>
                    <p className="text-[10px] md:text-xs text-gray-500">For {showCoverLetterModal.name} - {showCoverLetterModal.role}</p>
                  </div>
                </div>
                <button onClick={() => setShowCoverLetterModal(null)} className="p-2 hover:bg-apple-gray rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-apple-gray/5">
                {showCoverLetterModal.isLoading ? (
                  <div className="py-12 md:py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-accent animate-spin" />
                    <p className="text-sm md:text-base text-gray-500 font-medium">ZivoHR AI is drafting the cover letter...</p>
                  </div>
                ) : (
                  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-black/[0.03] whitespace-pre-wrap font-serif text-gray-700 text-sm md:text-base leading-relaxed">
                    {showCoverLetterModal.content}
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8 border-t border-black/[0.05] flex flex-col sm:flex-row justify-end gap-3 bg-white">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(showCoverLetterModal.content);
                    alert("Cover letter copied to clipboard!");
                  }} 
                  className="w-full sm:flex-1 btn-secondary px-6 py-2.5 md:py-3 flex items-center justify-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Copy to Clipboard
                </button>
                <button onClick={() => setShowCoverLetterModal(null)} className="w-full sm:flex-1 btn-primary px-8 py-2.5 md:py-3 text-sm">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showPostJobModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[250] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-t-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-accent/20">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black italic text-space-gray uppercase tracking-tight">Post New Vacancy</h3>
                </div>
                <button onClick={() => setShowPostJobModal(false)} className="p-2 hover:bg-apple-gray rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="p-10 space-y-10 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Job Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Senior Software Engineer" 
                      value={newJobForm.title}
                      onChange={(e) => setNewJobForm({...newJobForm, title: e.target.value})}
                      className="input-aura w-full py-4" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                    <input 
                      type="text" 
                      placeholder="Engineering" 
                      value={newJobForm.department}
                      onChange={(e) => setNewJobForm({...newJobForm, department: e.target.value})}
                      className="input-aura w-full py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20" 
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-apple-gray/30 rounded-3xl border border-black/[0.02]">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                          <Eye className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-bold text-space-gray">Job Portal Visibility</p>
                          <p className="text-xs text-gray-500">Should this role appear on the public careers page?</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setNewJobForm({ ...newJobForm, isExternal: !newJobForm.isExternal })}
                      className={cn(
                        "relative inline-flex h-6 w-12 items-center rounded-full transition-colors",
                        newJobForm.isExternal ? "bg-accent" : "bg-gray-200"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        newJobForm.isExternal ? "translate-x-7" : "translate-x-1"
                      )} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Job Description</label>
                    <textarea 
                      rows={4} 
                      placeholder="Describe the mission and responsibilities..." 
                      value={newJobForm.description}
                      onChange={(e) => setNewJobForm({...newJobForm, description: e.target.value})}
                      className="input-aura w-full py-4 resize-none" 
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate Application Fields</h4>
                       <button 
                        onClick={() => setNewJobForm({ ...newJobForm, customFields: [...newJobForm.customFields, { name: '', type: 'text', required: true }] })}
                        className="text-[10px] font-black text-accent uppercase flex items-center gap-1"
                       >
                         <Plus className="w-3 h-3" /> Add Field
                       </button>
                    </div>
                    <div className="space-y-4">
                       {newJobForm.customFields.map((field, idx) => (
                         <div key={idx} className="flex gap-4 p-5 bg-apple-gray/20 rounded-3xl border border-black/[0.03]">
                            <input 
                              placeholder="Field Name (e.g. Expected Salary)"
                              value={field.name}
                              onChange={(e) => {
                                const newFields = [...newJobForm.customFields];
                                newFields[idx].name = e.target.value;
                                setNewJobForm({ ...newJobForm, customFields: newFields });
                              }}
                              className="flex-[2] bg-white border-none rounded-xl px-4 py-2 text-xs font-bold"
                            />
                            <select 
                              value={field.type}
                              onChange={(e) => {
                                const newFields = [...newJobForm.customFields];
                                newFields[idx].type = e.target.value as any;
                                setNewJobForm({ ...newJobForm, customFields: newFields });
                              }}
                              className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-xs font-bold"
                            >
                               <option value="text">Text</option>
                               <option value="number">Number</option>
                               <option value="file">File</option>
                            </select>
                            <button 
                              onClick={() => {
                                const newFields = [...newJobForm.customFields];
                                newFields.splice(idx, 1);
                                setNewJobForm({ ...newJobForm, customFields: newFields });
                              }}
                              className="p-2 text-red-400"
                            >
                               <XCircle className="w-4 h-4" />
                            </button>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-black/[0.03]">
                  <button onClick={() => setShowPostJobModal(false)} className="w-full sm:flex-1 py-5 bg-apple-gray text-space-gray rounded-3xl text-xs font-black uppercase transition-all">Cancel Draft</button>
                  <button 
                    onClick={handlePostJob}
                    className="w-full sm:flex-1 py-5 bg-accent text-white rounded-3xl text-xs font-black uppercase italic tracking-widest shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all"
                  >
                    Post Position Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Signers Modal */}
      <AnimatePresence>
        {showInviteModal && invitingCandidate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-accent/10 rounded-xl text-accent">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-space-gray">Invite for Signing</h2>
                    <p className="text-xs text-gray-500">Add recipients for {invitingCandidate.name}'s offer</p>
                  </div>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-apple-gray rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {recipients.map((recipient, index) => (
                    <div key={index} className="flex flex-col gap-3 p-4 bg-apple-gray/20 rounded-2xl border border-black/[0.03]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                          <input 
                            type="text"
                            value={recipient.name}
                            onChange={(e) => {
                              const newRecipients = [...recipients];
                              newRecipients[index].name = e.target.value;
                              setRecipients(newRecipients);
                            }}
                            className="w-full bg-white border border-black/[0.05] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                          <input 
                            type="email"
                            value={recipient.email}
                            onChange={(e) => {
                              const newRecipients = [...recipients];
                              newRecipients[index].email = e.target.value;
                              setRecipients(newRecipients);
                            }}
                            className="w-full bg-white border border-black/[0.05] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      {recipients.length > 1 && (
                        <button 
                          onClick={() => setRecipients(recipients.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-600 text-xs font-bold flex items-center gap-1 w-fit px-1"
                        >
                          <X className="w-3 h-3" />
                          Remove Recipient
                        </button>
                      )}
                    </div>
                  ))}

                  <button 
                    onClick={() => setRecipients([...recipients, { email: '', name: '' }])}
                    className="w-full py-3 border-2 border-dashed border-black/[0.05] rounded-2xl text-gray-400 text-sm font-bold hover:border-accent/40 hover:text-accent transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Signer
                  </button>
                </div>

                <div className="flex flex-col items-center gap-4 py-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 px-6">
                  <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-orange-800 text-center leading-relaxed">
                    Recipients will receive an email invitation to view and sign the document. 
                    A <strong>sealed PDF</strong> with a certificate of completion will be generated once all parties have signed.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-apple-gray/30 flex gap-3">
                <button 
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-black/[0.05] text-sm font-bold text-gray-600 hover:bg-white transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleInviteSigners}
                  disabled={isAnalyzing || recipients.some(r => !r.email || !r.name)}
                  className="flex-1 px-6 py-3 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Invitations
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

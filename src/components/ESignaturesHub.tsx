import React, { useState, useEffect } from 'react';
import { 
  PenTool, 
  Plus, 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ArrowLeft,
  Upload,
  User,
  Users,
  Mail,
  MoreVertical,
  Download,
  AlertCircle,
  Loader2,
  BookOpen,
  Trash2,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { DocumentEnvelope, UserProfile, Employee } from '../types';
import { documentService } from '../services/documentService';
import { employeeService } from '../services/employeeService';

interface ESignaturesHubProps {
  userProfile: UserProfile | null;
}

export default function ESignaturesHub({ userProfile }: ESignaturesHubProps) {
  const [envelopes, setEnvelopes] = useState<DocumentEnvelope[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'templates'>('dashboard');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [requestTitle, setRequestTitle] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [recipients, setRecipients] = useState<{ name: string; email: string; order: number }[]>([
    { name: '', email: '', order: 1 }
  ]);

  useEffect(() => {
    async function loadData() {
      if (!userProfile?.companyId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [envData, tempData, empData] = await Promise.all([
          documentService.getEnvelopes(userProfile.companyId),
          documentService.getTemplates(userProfile.companyId),
          employeeService.getEmployees(userProfile.companyId)
        ]);
        setEnvelopes(envData);
        setTemplates(tempData);
        setEmployees(empData);
      } catch (error) {
        console.error("Error loading signatures:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userProfile]);

  const handleAddRecipient = () => {
    setRecipients([...recipients, { name: '', email: '', order: recipients.length + 1 }]);
  };

  const handleUpdateRecipient = (index: number, field: string, value: string) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const handleSelectEmployee = (index: number, employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      handleUpdateRecipient(index, 'name', emp.name || `${emp.firstName} ${emp.lastName}`);
      handleUpdateRecipient(index, 'email', emp.email);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.companyId) return;

    try {
      setIsSubmitting(true);
      let fileUrl = '';

      if (selectedTemplateId) {
        const template = templates.find(t => t.id === selectedTemplateId);
        fileUrl = template.file_url;
      } else if (uploadFile) {
        fileUrl = await documentService.uploadDocument(userProfile.companyId, uploadFile.name, uploadFile);
      } else {
        alert("Please select a template or upload a file.");
        return;
      }

      await documentService.createEnvelope(
        {
          companyId: userProfile.companyId,
          title: requestTitle,
          fileUrl: fileUrl
        },
        recipients.map(r => ({
          fullName: r.name,
          email: r.email,
          signingOrder: r.order
        }))
      );

      const refreshed = await documentService.getEnvelopes(userProfile.companyId);
      setEnvelopes(refreshed);
      setShowNewRequest(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Failed to send signature request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRequestTitle('');
    setSelectedTemplateId('');
    setUploadFile(null);
    setRecipients([{ name: '', email: '', order: 1 }]);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-space-gray tracking-tight">e-Signatures</h1>
          <p className="text-gray-500 mt-1">Manage corporate documents and signatures in one place.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setView(view === 'dashboard' ? 'templates' : 'dashboard')}
            className="btn-secondary py-3 px-6 text-sm font-bold flex items-center gap-2"
          >
            {view === 'dashboard' ? <BookOpen className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            {view === 'dashboard' ? 'Template Library' : 'Return to Hub'}
          </button>
          <button 
            onClick={() => setShowNewRequest(true)}
            className="btn-primary py-3 px-6 text-sm font-bold shadow-lg shadow-accent/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>
      </div>

      {view === 'dashboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-black/[0.05] rounded-[2rem] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <h3 className="font-bold text-space-gray">Recent Requests</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search docs..." className="pl-9 pr-4 py-2 bg-white border border-black/[0.05] rounded-xl text-xs outline-none focus:ring-1 focus:ring-accent" />
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-black/[0.05]">
                {envelopes.length === 0 ? (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-apple-gray rounded-full flex items-center justify-center mx-auto text-gray-300">
                      <PenTool className="w-8 h-8" />
                    </div>
                    <p className="text-gray-500 font-medium">No signature requests found.</p>
                  </div>
                ) : (
                  envelopes.map((env) => (
                    <div key={env.id} className="p-6 flex items-center justify-between hover:bg-apple-gray/20 transition-colors group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all",
                          env.status === 'completed' ? "bg-green-50 text-green-600" : "bg-accent/5 text-accent"
                        )}>
                          {env.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-space-gray truncate">{env.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                             <span className={cn(
                               "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                               env.status === 'completed' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                             )}>
                               {env.status}
                             </span>
                             <span className="text-[10px] text-gray-400">• Sent {new Date(env.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                         <div className="flex -space-x-2">
                           {env.recipients?.slice(0, 3).map((r, i) => (
                             <div key={i} className={cn(
                               "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-black/[0.05]",
                               r.status === 'signed' ? "bg-green-500" : "bg-gray-400"
                             )}>
                               {r.fullName.charAt(0)}
                             </div>
                           ))}
                         </div>
                         <button className="p-2 text-gray-300 hover:text-accent transition-colors">
                           <ChevronRight className="w-5 h-5" />
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Stats & Templates Quick Access */}
          <div className="space-y-6">
            <div className="bg-white border border-black/[0.05] rounded-[2rem] p-8 shadow-sm">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Status Overview</h3>
               <div className="space-y-4">
                 <StatItem label="Pending Signatures" value={envelopes.filter(e => e.status !== 'completed').length.toString()} color="text-accent" />
                 <StatItem label="Completed Docs" value={envelopes.filter(e => e.status === 'completed').length.toString()} color="text-green-500" />
                 <StatItem label="Active Templates" value={templates.length.toString()} color="text-purple-500" />
               </div>
            </div>

            <div className="bg-accent rounded-[2rem] p-8 text-white shadow-xl shadow-accent/30 flex flex-col items-center justify-center space-y-4">
              <Upload className="w-10 h-10 opacity-60" />
              <div className="text-center">
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest">New template?</p>
                <button onClick={() => setView('templates')} className="mt-2 text-sm font-bold hover:underline">Manage Template Library →</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Templates View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((temp) => (
            <div key={temp.id} className="bg-white border border-black/[0.05] rounded-[2rem] p-6 hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-space-gray text-lg">{temp.title}</h4>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{temp.description}</p>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/[0.03]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last used 2d ago</span>
                <div className="flex gap-2">
                   <button className="p-2 text-gray-400 hover:text-accent transition-colors"><Download className="w-4 h-4" /></button>
                   <button 
                    onClick={() => {
                        setSelectedTemplateId(temp.id);
                        setRequestTitle(temp.title);
                        setShowNewRequest(true);
                    }}
                    className="p-2 text-gray-400 hover:text-accent transition-colors border border-black/[0.05] rounded-xl hover:bg-accent/5"
                   >
                     <Send className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={() => alert("Template creation coming soon! Use manual upload for now.")}
            className="border-2 border-dashed border-black/[0.05] rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-accent hover:border-accent/40 hover:bg-accent/5 transition-all group"
          >
            <div className="p-4 rounded-full bg-apple-gray group-hover:bg-accent/10 transition-all">
              <Plus className="w-8 h-8" />
            </div>
            <p className="font-bold">Add New Template</p>
          </button>
        </div>
      )}

      {/* New Request Modal */}
      <AnimatePresence>
        {showNewRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div>
                  <h2 className="text-2xl font-bold text-space-gray">New Signature Request</h2>
                  <p className="text-sm text-gray-500">Send documents for digital signing instantly.</p>
                </div>
                <button onClick={() => setShowNewRequest(false)} className="p-2 hover:bg-white rounded-full">
                  <ArrowLeft className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Step 1: Document */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    1. Select Document
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Document Title</label>
                       <input 
                        required
                        value={requestTitle}
                        onChange={(e) => setRequestTitle(e.target.value)}
                        className="w-full bg-apple-gray border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-accent"
                        placeholder="e.g. 2026 Salary Adjustment"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Use Template</label>
                       <select 
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full bg-apple-gray border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-accent"
                       >
                         <option value="">Manual Upload Only</option>
                         {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                       </select>
                    </div>
                  </div>
                  
                  {!selectedTemplateId && (
                    <div className="mt-4">
                       <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-black/[0.05] rounded-3xl cursor-pointer hover:bg-apple-gray/20 transition-all border-accent/20">
                          <Upload className="w-8 h-8 text-accent mb-2" />
                          <p className="text-sm font-bold text-space-gray">{uploadFile ? uploadFile.name : 'Click to upload PDF'}</p>
                          <input type="file" className="hidden" accept=".pdf" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                       </label>
                    </div>
                  )}
                </div>

                {/* Step 2: Recipients */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Users className="w-4 h-4" />
                       2. Add Recipients
                     </h3>
                     <button type="button" onClick={handleAddRecipient} className="text-accent text-xs font-bold hover:underline">+ Add Person</button>
                   </div>

                   <div className="space-y-4">
                     {recipients.map((r, i) => (
                       <div key={i} className="p-6 bg-apple-gray/20 rounded-3xl border border-black/[0.03] space-y-4 relative group">
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Full Name</label>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                  required
                                  value={r.name}
                                  onChange={(e) => handleUpdateRecipient(i, 'name', e.target.value)}
                                  className="w-full bg-white border-none rounded-xl pl-11 pr-4 py-3 text-sm font-bold shadow-sm"
                                  placeholder="John Doe"
                                />
                              </div>
                            </div>
                            <div className="flex-1 space-y-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Email Address</label>
                              <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                  required
                                  type="email"
                                  value={r.email}
                                  onChange={(e) => handleUpdateRecipient(i, 'email', e.target.value)}
                                  className="w-full bg-white border-none rounded-xl pl-11 pr-4 py-3 text-sm font-bold shadow-sm"
                                  placeholder="john@example.com"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs">
                             <div className="px-3 py-2 bg-white rounded-xl shadow-sm text-gray-400 font-bold border border-black/[0.03]">Signer #{r.order}</div>
                             <select 
                               onChange={(e) => handleSelectEmployee(i, e.target.value)}
                               className="px-3 py-2 bg-accent/5 text-accent rounded-xl border border-accent/20 font-bold text-[10px] outline-none"
                             >
                                <option value="">Or Select Current Employee</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                             </select>
                             {recipients.length > 1 && (
                               <button 
                                 type="button" 
                                 onClick={() => setRecipients(recipients.filter((_, idx) => idx !== i))}
                                 className="ml-auto p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="pt-4">
                   <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full btn-primary py-5 text-lg font-black tracking-tight shadow-xl shadow-accent/30 flex items-center justify-center gap-3"
                   >
                     {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                     Send Signing Invitation
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className={cn("font-black", color)}>{value}</span>
    </div>
  );
}

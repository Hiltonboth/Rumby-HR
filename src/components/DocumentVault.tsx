import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Shield, 
  ShieldOff, 
  Trash2, 
  Download, 
  Clock, 
  AlertCircle, 
  Plus, 
  Upload, 
  Folder, 
  File as FileIcon,
  Search,
  Filter,
  Loader2,
  Lock,
  Eye,
  CheckCircle2,
  Calendar,
  X,
  Send,
  Zap,
  Tag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from '../lib/utils';
import { UserProfile, Employee } from '../types';
import { employeeDocumentService } from '../services/employeeDocumentService';
import { employeeService } from '../services/employeeService';

interface DocumentVaultProps {
  userProfile: UserProfile | null;
  targetEmployeeId?: string; // Optional: view specific employee or full company vault
}

export default function DocumentVault({ userProfile, targetEmployeeId }: DocumentVaultProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'files' | 'requests' | 'expiring'>('files');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(targetEmployeeId || '');
  const [expiryThreshold, setExpiryThreshold] = useState(60);

  useEffect(() => {
    async function init() {
      if (!userProfile?.companyId) return;
      try {
        setLoading(true);
        if (userProfile.role === 'hr') {
           const emps = await employeeService.getEmployees(userProfile.companyId);
           setEmployees(emps);
        }
        await loadData();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [userProfile, selectedEmployeeId, expiryThreshold, activeTab]);

  const loadData = async () => {
    if (!userProfile?.companyId) return;
    try {
      if (activeTab === 'files') {
         if (selectedEmployeeId) {
            const docs = await employeeDocumentService.getEmployeeDocuments(selectedEmployeeId, userProfile.role === 'hr');
            setDocuments(docs);
         } else if (userProfile.role === 'hr') {
            // Full vault view logic could go here
         }
      } else if (activeTab === 'requests' && selectedEmployeeId) {
         const reqs = await employeeDocumentService.getDocumentRequests(selectedEmployeeId);
         setRequests(reqs);
      } else if (activeTab === 'expiring') {
         const expiring = await employeeDocumentService.getExpiringDocuments(userProfile.companyId, expiryThreshold);
         setDocuments(expiring);
      }
    } catch (error) {
       console.error(error);
    }
  };

  const handleDownloadAll = async () => {
    if (documents.length === 0) return;
    
    setLoading(true);
    try {
      const zip = new JSZip();
      
      const filePromises = documents.map(async (doc) => {
        try {
          if (!doc.file_url) return;
          const response = await fetch(doc.file_url, { mode: 'cors' });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();
          const extension = doc.file_url.split('.').pop()?.split('?')[0] || 'pdf';
          const fileName = `${doc.title.replace(/[/\\?%*:|"<>] /g, '-')}.${extension}`;
          zip.file(fileName, blob);
        } catch (fetchErr) {
          console.error(`Failed to fetch ${doc.title}:`, fetchErr);
        }
      });

      await Promise.all(filePromises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${selectedEmployeeId ? 'employee' : 'company'}_documents_vault.zip`);
    } catch (error) {
      console.error("error zipping files:", error);
      alert("Failed to create ZIP archive.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg">
                 <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-black text-space-gray tracking-tight italic uppercase">Document Vault</h1>
           </div>
           <p className="text-gray-500 font-bold ml-1">Secure, encrypted record management for {userProfile?.companyId}.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="btn-primary px-8 py-3 rounded-2xl text-[10px] font-black italic uppercase flex items-center gap-2"
          >
             <Upload className="w-4 h-4" /> Upload Vault Record
          </button>
           {userProfile?.role === 'hr' && (
              <>
                <button 
                  onClick={() => setShowRequestModal(true)}
                  className="bg-orange-50 text-orange-600 border border-orange-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center gap-2"
                >
                   <ArrowRight className="w-4 h-4" /> Request File
                </button>
              </>
           )}
        </div>
      </div>

      {/* Selector & Tabs */}
      <div className="bg-white border border-black/[0.05] p-2 rounded-[2rem] flex flex-col md:flex-row gap-4">
         <div className="flex-1 flex p-1 bg-apple-gray/30 rounded-2xl">
            <TabButton active={activeTab === 'files'} onClick={() => setActiveTab('files')} label="All Documents" icon={Folder} />
            <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} label="Pending Requests" icon={Clock} />
            <TabButton active={activeTab === 'expiring'} onClick={() => setActiveTab('expiring')} label="Expiry Radar" icon={Zap} />
         </div>
         
         <div className="md:w-64">
           {userProfile?.role === 'hr' ? (
              <select 
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-space-gray outline-none focus:ring-2 focus:ring-accent"
              >
                 <option value="">Select Employee...</option>
                 {employees.map(emp => (
                   <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                 ))}
              </select>
           ) : (
             <div className="w-full bg-apple-gray/30 border-none rounded-2xl px-6 py-4 text-xs font-bold text-gray-400">
                Viewing Personal Vault
             </div>
           )}
         </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Left Side: Category Filters or Info */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-black/[0.05] p-8 rounded-[2rem] shadow-sm">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Expiry Radar Threshold</h3>
               <div className="space-y-3">
                  {[30, 60, 90].map(days => (
                    <button 
                      key={days}
                      onClick={() => setExpiryThreshold(days)}
                      className={cn(
                        "w-full py-4 px-6 rounded-2xl text-xs font-bold flex items-center justify-between transition-all",
                        expiryThreshold === days ? "bg-accent text-white shadow-xl shadow-accent/20" : "bg-apple-gray/50 text-gray-500 hover:bg-apple-gray"
                      )}
                    >
                       {days} Days Notice
                       {expiryThreshold === days && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  ))}
               </div>
            </div>

            <div className="bg-apple-gray/30 p-8 rounded-[3rem] border border-black/[0.02]">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                     <Lock className="w-4 h-4 text-accent" />
                  </div>
                  <h4 className="font-bold text-space-gray italic">Security Audit</h4>
               </div>
               <p className="text-[10px] font-medium text-gray-500 leading-relaxed uppercase tracking-wider">
                  All documents are stored on encrypted Supabase buckets with SSL/TLS transit protection.
               </p>
               <button 
                  onClick={handleDownloadAll}
                  className="w-full mt-6 py-4 bg-white border border-black/[0.05] rounded-2xl text-[10px] font-black uppercase tracking-widest text-accent hover:shadow-lg transition-all"
               >
                  Download Full Folder (ZIP)
               </button>
            </div>
         </div>

         {/* Right Side: Document List */}
         <div className="lg:col-span-3">
            {loading ? (
              <div className="h-64 flex items-center justify-center"><Loader2 className="w-10 h-10 text-accent animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                 {activeTab === 'files' && documents.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} onRefresh={loadData} />
                 ))}
                 
                 {activeTab === 'requests' && requests.map((req) => (
                    <RequestCard key={req.id} req={req} />
                 ))}

                 {activeTab === 'expiring' && documents.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} onRefresh={loadData} highlightExpiry={true} />
                 ))}

                 {((activeTab === 'files' && documents.length === 0) || (activeTab === 'requests' && requests.length === 0)) && (
                   <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-black/10">
                      <Folder className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-bold italic tracking-tight">No records found matching your selection.</p>
                   </div>
                 )}
              </div>
            )}
         </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} employeeId={selectedEmployeeId || userProfile?.uid} companyId={userProfile?.companyId || ''} currentUserId={userProfile?.uid} onComplete={loadData} />}
        {showRequestModal && <RequestModal onClose={() => setShowRequestModal(false)} employeeId={selectedEmployeeId} companyId={userProfile?.companyId || ''} onComplete={loadData} />}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-bold transition-all",
        active ? "bg-white text-accent shadow-sm" : "text-gray-500 hover:text-accent"
      )}
    >
      <Icon className="w-4 h-4" /> {active && label}
    </button>
  );
}

function DocumentCard({ doc, onRefresh, highlightExpiry }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white border border-black/[0.05] p-6 rounded-[2rem] flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all group",
        highlightExpiry && "border-orange-200 bg-orange-50/20 shadow-orange-100"
      )}
    >
       <div className="flex items-center gap-5">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
            highlightExpiry ? "bg-orange-100 text-orange-600" : "bg-apple-gray text-gray-400"
          )}>
             <FileIcon className="w-6 h-6" />
          </div>
          <div>
             <div className="flex items-center gap-2">
                <h4 className="font-bold text-space-gray tracking-tight">{doc.title}</h4>
                {doc.is_private ? (
                  <span className="text-[10px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" /> PRIVATE
                  </span>
                ) : (
                  <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" /> PUBLIC
                  </span>
                )}
             </div>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                <Tag className="w-3 h-3" /> {doc.category} 
                {doc.expiry_date && (
                   <span className={cn(
                     "ml-2 flex items-center gap-1",
                     highlightExpiry ? "text-orange-600 font-black" : "text-gray-400"
                   )}>
                      <Calendar className="w-3 h-3" /> Expires: {doc.expiry_date}
                   </span>
                )}
             </p>
          </div>
       </div>

       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={async () => {
              try {
                await employeeDocumentService.toggleDocumentPrivacy(doc.id, !doc.is_private);
                onRefresh();
              } catch (err) {
                console.error(err);
              }
            }}
            className="p-3 bg-apple-gray hover:bg-accent hover:text-white rounded-xl transition-all"
            title={doc.is_private ? "Make Public" : "Make Private"}
          >
             {doc.is_private ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>
          <a 
            href={doc.file_url} 
            target="_blank" 
            rel="noreferrer"
            className="p-3 bg-apple-gray hover:bg-accent hover:text-white rounded-xl transition-all"
          >
             <Download className="w-4 h-4" />
          </a>
          <button 
            onClick={async () => {
              if (confirm("Delete this record permanently?")) {
                await employeeDocumentService.deleteDocument(doc.id);
                onRefresh();
              }
            }}
            className="p-3 bg-apple-gray hover:bg-red-500 hover:text-white rounded-xl transition-all"
          >
             <Trash2 className="w-4 h-4" />
          </button>
       </div>
    </motion.div>
  );
}

function RequestCard({ req }: any) {
  return (
    <div className="bg-white border border-black/[0.05] border-l-4 border-l-orange-400 p-6 rounded-2xl flex items-center justify-between">
       <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
             <AlertCircle className="w-5 h-5" />
          </div>
          <div>
             <h4 className="font-bold text-space-gray">{req.requested_title}</h4>
             <p className="text-xs text-gray-500">Target Category: {req.category} • Due: {req.due_date || 'N/A'}</p>
          </div>
       </div>
       <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{req.status}</span>
          <button className="p-3 bg-apple-gray rounded-xl hover:text-red-500"><X className="w-4 h-4" /></button>
       </div>
    </div>
  );
}

function UploadModal({ onClose, employeeId, companyId, onComplete, currentUserId }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
     title: '',
     category: 'identity',
     isPrivate: false,
     expiryDate: '',
     file: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file || !form.title) return;
    try {
      setLoading(true);
      await employeeDocumentService.uploadDocument({
        companyId,
        employeeId,
        uploadedById: currentUserId,
        title: form.title,
        category: form.category,
        file: form.file,
        isPrivate: form.isPrivate,
        expiryDate: form.expiryDate
      });
      onComplete();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden shadow-black/20">
          <div className="p-10 border-b border-black/[0.05] bg-apple-gray/10">
             <h3 className="text-xl font-black italic tracking-tight uppercase">Deposit Vault Record</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-10 space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Title</label>
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-sm font-bold" />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                   <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-4 py-4 text-xs font-bold ring-0 outline-none appearance-none">
                      <option value="identity">Identity / ID</option>
                      <option value="contractual">Contractual</option>
                      <option value="qualification">Academic / Certificate</option>
                      <option value="medical">Medical</option>
                      <option value="disciplinary">Disciplinary</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiry Date</label>
                   <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-4 py-4 text-xs font-bold" />
                </div>
             </div>

             <div className="flex items-center justify-between p-6 bg-apple-gray/30 rounded-2xl">
                <div className="flex items-center gap-3">
                   <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer", form.isPrivate ? "bg-accent border-accent text-white" : "border-gray-300")} onClick={() => setForm({...form, isPrivate: !form.isPrivate})}>
                      {form.isPrivate && <CheckCircle2 className="w-4 h-4" />}
                   </div>
                   <span className="text-xs font-bold text-space-gray">Private Record (HR Only)</span>
                </div>
                <Lock className="w-4 h-4 text-gray-400" />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">File Attachment</label>
                <div className="relative h-32 border-2 border-dashed border-black/10 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-accent hover:text-accent transition-all">
                   <input required type="file" onChange={e => setForm({...form, file: e.target.files?.[0] || null})} className="absolute inset-0 opacity-0 cursor-pointer" />
                   <Upload className="w-6 h-6 mb-2" />
                   <p className="text-[10px] font-black italic tracking-widest">{form.file ? form.file.name : 'CLICK OR DRAG'}</p>
                </div>
             </div>

             <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-space-gray transition-colors">Cancel</button>
                <button disabled={loading} type="submit" className="flex-[2] py-4 bg-accent text-white rounded-2xl text-xs font-black uppercase tracking-widest italic shadow-xl shadow-accent/40 flex items-center justify-center gap-2">
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                   Archive to Vault
                </button>
             </div>
          </form>
       </motion.div>
    </div>
  );
}

function RequestModal({ onClose, employeeId, companyId, onComplete }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
     title: '',
     category: 'qualification',
     dueDate: '',
     notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await employeeDocumentService.createDocumentRequest({
        companyId,
        employeeId,
        title: form.title,
        category: form.category,
        dueDate: form.dueDate,
        notes: form.notes
      });
      onComplete();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden shadow-black/20">
          <div className="p-10 border-b border-black/[0.05] bg-orange-50/20">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                   <Send className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black italic tracking-tight uppercase text-orange-800">Push Document Request</h3>
             </div>
          </div>
          <form onSubmit={handleSubmit} className="p-10 space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Requested</label>
                <input required placeholder="e.g. Latest Driver's License Copy" type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-sm font-bold" />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliance Field</label>
                   <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-4 py-4 text-xs font-bold ring-0 outline-none appearance-none">
                      <option value="identity">Government ID</option>
                      <option value="qualification">Academic / Skills</option>
                      <option value="medical">Medical / Health</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submission Deadline</label>
                   <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-4 py-4 text-xs font-bold" />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">HR Notes for Employee</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-sm font-bold min-h-[100px]" placeholder="Explain why this document is required..." />
             </div>

             <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-space-gray transition-colors">Abort</button>
                <button disabled={loading} type="submit" className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest italic shadow-xl shadow-orange-500/40 flex items-center justify-center gap-2">
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                   Push to Employee
                </button>
             </div>
          </form>
       </motion.div>
    </div>
  );
}

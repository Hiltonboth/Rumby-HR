import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Plus, 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  X, 
  PenTool,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import SignaturePad from './SignaturePad';

interface Signer {
  email: string;
  status: 'Pending' | 'Signed';
}

interface EDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: 'Draft' | 'Pending' | 'Completed';
  signers: Signer[];
  content?: string;
}

const MOCK_DOCS: EDoc[] = [
  {
    id: 'doc1',
    name: 'Employment_Contract_Rivera.pdf',
    type: 'PDF',
    size: '1.2 MB',
    uploadedAt: '2024-04-05',
    status: 'Completed',
    signers: [
      { email: 'alex.rivera@example.com', status: 'Signed' },
      { email: 'hr@rumby.hr', status: 'Signed' }
    ]
  },
  {
    id: 'doc2',
    name: 'NDA_Stellar_Tech.pdf',
    type: 'PDF',
    size: '840 KB',
    uploadedAt: '2024-04-07',
    status: 'Pending',
    signers: [
      { email: 'j.smith@stellar.tech', status: 'Pending' },
      { email: 'legal@rumby.hr', status: 'Signed' }
    ]
  },
  {
    id: 'doc3',
    name: 'Offer_Letter_Sam_Jones.pdf',
    type: 'PDF',
    size: '450 KB',
    uploadedAt: '2024-04-08',
    status: 'Draft',
    signers: []
  }
];

export default function ESignature() {
  const [docs, setDocs] = useState<EDoc[]>(MOCK_DOCS);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState<EDoc | null>(null);
  const [showRequestModal, setShowRequestModal] = useState<EDoc | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Draft' | 'Pending' | 'Completed'>('All');

  const [newDocName, setNewDocName] = useState('');
  const [newSignerEmail, setNewSignerEmail] = useState('');
  const [requestSigners, setRequestSigners] = useState<string[]>([]);

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || doc.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleUpload = () => {
    if (!newDocName) return;
    const newDoc: EDoc = {
      id: `doc${Date.now()}`,
      name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
      type: 'PDF',
      size: '0 KB',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'Draft',
      signers: []
    };
    setDocs([newDoc, ...docs]);
    setNewDocName('');
    setShowUploadModal(false);
  };

  const handleSign = (signature: string) => {
    if (!showSignModal) return;
    setDocs(prev => prev.map(doc => 
      doc.id === showSignModal.id 
        ? { ...doc, status: doc.signers.length > 0 ? 'Pending' : 'Completed' } 
        : doc
    ));
    setShowSignModal(null);
  };

  const handleAddSigner = () => {
    if (!newSignerEmail || !newSignerEmail.includes('@')) return;
    setRequestSigners([...requestSigners, newSignerEmail]);
    setNewSignerEmail('');
  };

  const handleSendRequest = () => {
    if (!showRequestModal) return;
    setDocs(prev => prev.map(doc => 
      doc.id === showRequestModal.id 
        ? { 
            ...doc, 
            status: 'Pending', 
            signers: requestSigners.map(email => ({ email, status: 'Pending' })) 
          } 
        : doc
    ));
    setShowRequestModal(null);
    setRequestSigners([]);
  };

  const handleDelete = (id: string) => {
    setDocs(docs.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight text-space-gray">E-Signatures</h2>
          <p className="text-gray-500">Securely sign documents and request signatures from others.</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn-primary px-6 py-4 flex items-center gap-2 self-start"
        >
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Documents', value: docs.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Completed', value: docs.filter(d => d.status === 'Completed').length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Pending', value: docs.filter(d => d.status === 'Pending').length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Drafts', value: docs.filter(d => d.status === 'Draft').length, icon: PenTool, color: 'text-gray-500', bg: 'bg-gray-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-black/[0.03] shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-space-gray">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-black/[0.05] rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>
        <div className="flex bg-apple-gray p-1 rounded-2xl border border-black/[0.03]">
          {['All', 'Draft', 'Pending', 'Completed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                activeFilter === filter 
                  ? "bg-white text-space-gray shadow-sm" 
                  : "text-gray-500 hover:text-space-gray"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-[2.5rem] border border-black/[0.03] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.03] bg-apple-gray/30">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Document Name</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Signers</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="group hover:bg-apple-gray/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent/5 rounded-xl flex items-center justify-center text-accent">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-space-gray group-hover:text-accent transition-colors">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.size} • Uploaded {doc.uploadedAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      doc.status === 'Completed' ? "bg-green-100 text-green-600" :
                      doc.status === 'Pending' ? "bg-orange-100 text-orange-600" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex -space-x-2">
                      {doc.signers.length > 0 ? (
                        doc.signers.map((signer, i) => (
                          <div 
                            key={i} 
                            title={`${signer.email} (${signer.status})`}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white",
                              signer.status === 'Signed' ? "bg-green-500" : "bg-gray-300"
                            )}
                          >
                            {signer.email.charAt(0).toUpperCase()}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">No signers added</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {doc.status === 'Draft' && (
                        <>
                          <button 
                            onClick={() => setShowSignModal(doc)}
                            className="p-2 hover:bg-accent/10 rounded-xl text-accent transition-colors"
                            title="Sign Now"
                          >
                            <PenTool className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowRequestModal(doc)}
                            className="p-2 hover:bg-blue-500/10 rounded-xl text-blue-500 transition-colors"
                            title="Request Signatures"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="p-2 hover:bg-apple-gray rounded-xl text-gray-400 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 hover:bg-red-50 rounded-xl text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-apple-gray rounded-full flex items-center justify-center text-gray-300">
                        <FileText className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-space-gray">No documents found</p>
                        <p className="text-sm text-gray-500">Upload a document to get started with e-signatures.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between">
                <h3 className="text-xl font-bold">Upload Document</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-black/[0.05] rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 bg-apple-gray/20">
                    <Upload className="w-10 h-10 text-accent" />
                    <div className="text-center">
                      <p className="font-bold text-space-gray">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, DOCX up to 10MB</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Document Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Employment_Agreement.pdf"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="w-full bg-apple-gray border-none rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleUpload}
                  className="w-full btn-primary py-4 rounded-2xl"
                >
                  Confirm Upload
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sign Modal */}
      <AnimatePresence>
        {showSignModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Sign Document</h3>
                    <p className="text-xs text-gray-500">{showSignModal.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowSignModal(null)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="p-6 bg-apple-gray/30 rounded-2xl border border-black/[0.03] flex items-start gap-4">
                  <FileText className="w-8 h-8 text-accent flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-space-gray">Legal Acknowledgment</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      By signing this document, you acknowledge that you have read and understood the contents. This electronic signature is legally binding and carries the same weight as a handwritten signature.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your E-Signature</h4>
                  <SignaturePad onSave={handleSign} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Request Signature Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between">
                <h3 className="text-xl font-bold">Request Signatures</h3>
                <button onClick={() => setShowRequestModal(null)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Add Recipient Email</label>
                    <div className="flex gap-2">
                      <input 
                        type="email"
                        placeholder="colleague@example.com"
                        value={newSignerEmail}
                        onChange={(e) => setNewSignerEmail(e.target.value)}
                        className="flex-1 bg-apple-gray border-none rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                      />
                      <button 
                        onClick={handleAddSigner}
                        className="p-4 bg-accent text-white rounded-2xl hover:bg-accent/90 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Signers List</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                      {requestSigners.map((email, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-apple-gray/50 rounded-xl border border-black/[0.03]">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-space-gray">{email}</span>
                          </div>
                          <button 
                            onClick={() => setRequestSigners(requestSigners.filter((_, idx) => idx !== i))}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {requestSigners.length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-4">No signers added yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSendRequest}
                  disabled={requestSigners.length === 0}
                  className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  Send Signature Requests
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

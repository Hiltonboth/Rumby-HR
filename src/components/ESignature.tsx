import React, { useState, useRef, useEffect } from 'react';
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
  UserPlus,
  ShieldCheck,
  History,
  FileCheck,
  Stamp,
  ArrowLeft,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from './ThemeContext';
import SignaturePad from './SignaturePad';
import jsPDF from 'jspdf';

interface Field {
  id: string;
  type: 'signature' | 'date' | 'name' | 'text' | 'number' | 'dob' | 'email' | 'initials' | 'checkbox' | 'radio' | 'dropdown';
  label: string;
  x: number;
  y: number;
  signerEmail: string;
  value?: string;
}

interface Signer {
  email: string;
  name?: string;
  status: 'Pending' | 'Signed' | 'Viewed';
  role: 'Signer' | 'Approver';
  signedAt?: string;
}

interface AuditEntry {
  action: string;
  user: string;
  timestamp: string;
  ip?: string;
}

interface EDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  status: 'Draft' | 'Pending' | 'Completed';
  signers: Signer[];
  fields: Field[];
  content?: string;
  signature?: string;
  auditTrail: AuditEntry[];
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
      { email: 'alex.rivera@example.com', status: 'Signed', signedAt: '2024-04-05 14:20', role: 'Signer' },
      { email: 'hr@rumby.hr', status: 'Signed', signedAt: '2024-04-05 15:45', role: 'Signer' }
    ],
    content: 'This employment contract is between ZivoHR and Alex Rivera...',
    fields: [],
    auditTrail: [
      { action: 'Document Created', user: 'System', timestamp: '2024-04-05 09:00' },
      { action: 'Signature Requested', user: 'Staff', timestamp: '2024-04-05 09:05' },
      { action: 'Signed', user: 'Alex Rivera', timestamp: '2024-04-05 14:20' },
      { action: 'Signed', user: 'Staff', timestamp: '2024-04-05 15:45' }
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
      { email: 'j.smith@stellar.tech', status: 'Pending', role: 'Signer' },
      { email: 'legal@rumby.hr', status: 'Signed', signedAt: '2024-04-07 11:30', role: 'Signer' }
    ],
    content: 'Non-Disclosure Agreement between ZivoHR and Stellar Tech...',
    fields: [],
    auditTrail: [
      { action: 'Document Created', user: 'System', timestamp: '2024-04-07 10:00' },
      { action: 'Signed', user: 'Legal Dept', timestamp: '2024-04-07 11:30' }
    ]
  }
];

export default function ESignature() {
  const { userProfile } = useAuth();
  const { isDark } = useTheme();
  const [docs, setDocs] = useState<EDoc[]>(() => {
    const saved = localStorage.getItem('rumby_docs');
    return saved ? JSON.parse(saved) : MOCK_DOCS;
  });

  useEffect(() => {
    localStorage.setItem('rumby_docs', JSON.stringify(docs));
  }, [docs]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<EDoc | null>(null);
  const [showSignModal, setShowSignModal] = useState<EDoc | null>(null);
  const [editorDoc, setEditorDoc] = useState<EDoc | null>(null);
  const [editorStep, setEditorStep] = useState<1 | 2 | 3>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Draft' | 'Pending' | 'Completed'>('All');

  const [newDocName, setNewDocName] = useState('');
  const [newSignerEmail, setNewSignerEmail] = useState('');
  const [newSignerName, setNewSignerName] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorCanvasRef = useRef<HTMLDivElement>(null);

  const fieldTypes = [
    { type: 'signature', label: 'Signature', icon: PenTool },
    { type: 'name', label: 'Name', icon: PenTool },
    { type: 'date', label: 'Date', icon: Clock },
    { type: 'text', label: 'Text', icon: FileText },
    { type: 'number', label: 'Number', icon: FileText },
    { type: 'dob', label: 'DOB', icon: Clock },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'initials', label: 'Initials', icon: PenTool },
    { type: 'checkbox', label: 'Checkbox', icon: CheckCircle2 },
    { type: 'radio', label: 'Radio', icon: CheckCircle2 },
    { type: 'dropdown', label: 'Dropdown', icon: History },
  ];

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || doc.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDocName(file.name);
    }
  };

  const handleUpload = () => {
    if (!newDocName) return;
    const newDoc: EDoc = {
      id: `doc${Date.now()}`,
      name: newDocName,
      type: newDocName.split('.').pop()?.toUpperCase() || 'PDF',
      size: '156 KB',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'Draft',
      signers: [],
      fields: [],
      content: 'This is a sample document content for ' + newDocName + '. It contains standard legal clauses and terms of agreement.',
      auditTrail: [
        { action: 'Document Uploaded', user: userProfile?.fullName || 'User', timestamp: new Date().toLocaleString() }
      ]
    };
    setDocs([newDoc, ...docs]);
    setNewDocName('');
    setShowUploadModal(false);
    setEditorDoc(newDoc);
    setEditorStep(1);
  };

  const handleAddField = (type: any, label: string) => {
    if (!editorDoc || editorDoc.signers.length === 0) {
      alert("Please add at least one recipient first.");
      return;
    }
    const newField: Field = {
      id: `field-${Date.now()}`,
      type,
      label,
      x: 50,
      y: 50,
      signerEmail: editorDoc.signers[0].email
    };
    setEditorDoc({ ...editorDoc, fields: [...editorDoc.fields, newField] });
  };

  const updateFieldPosition = (id: string, x: number, y: number) => {
    if (!editorDoc) return;
    setEditorDoc({
      ...editorDoc,
      fields: editorDoc.fields.map(f => f.id === id ? { ...f, x, y } : f)
    });
  };

  const handleSaveEditor = () => {
    if (!editorDoc) return;
    const updatedDoc: EDoc = {
      ...editorDoc,
      status: 'Pending',
      auditTrail: [
        ...editorDoc.auditTrail,
        { action: 'Fields Configured & Sent', user: userProfile?.fullName || 'User', timestamp: new Date().toLocaleString() }
      ]
    };
    setDocs(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    setEditorDoc(null);
  };

  const handleSign = (signature: string) => {
    if (!showSignModal) return;
    const timestamp = new Date().toLocaleString();
    setDocs(prev => prev.map(doc => 
      doc.id === showSignModal.id 
        ? { 
            ...doc, 
            status: 'Completed',
            signature,
            fields: doc.fields.map(f => ({ ...f, value: fieldValues[f.id] || f.value })),
            auditTrail: [
              ...doc.auditTrail,
              { action: 'Document Signed', user: userProfile?.fullName || 'User', timestamp }
            ]
          } 
        : doc
    ));
    setShowSignModal(null);
    setFieldValues({});
  };

  const handleDownload = (doc: EDoc) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFillColor(245, 247, 250);
    pdf.rect(0, 0, 210, 40, 'F');
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ZivoHR', 20, 25);
    
    pdf.setFontSize(12);
    pdf.text('Document Content:', 20, 40);
    const splitContent = pdf.splitTextToSize(doc.content || 'No content available', 170);
    pdf.text(splitContent, 20, 50);

    // Render Fields
    if (doc.fields && doc.fields.length > 0) {
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Placed Fields & Signatures', 20, 20);
      
      doc.fields.forEach((field, index) => {
        const yPos = 40 + (index * 25);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(15, 23, 42);
        pdf.text(`${field.label}:`, 20, yPos);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        pdf.text(`(Assigned to: ${field.signerEmail})`, 20, yPos + 5);
        
        if (field.type === 'signature' && doc.signature) {
          pdf.addImage(doc.signature, 'PNG', 80, yPos - 10, 40, 20);
        } else {
          pdf.rect(80, yPos - 5, 60, 10);
          pdf.setFontSize(8);
          pdf.text('Pending Input', 85, yPos + 2);
        }
      });
    }

    // Audit Trail Page
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('Audit Trail', 20, 20);
    pdf.setFontSize(10);
    doc.auditTrail.forEach((entry, i) => {
      pdf.text(`${entry.timestamp} - ${entry.user}: ${entry.action}`, 20, 40 + (i * 10));
    });

    pdf.save(`${doc.name.replace('.pdf', '')}_signed.pdf`);
  };

  const handleDelete = (id: string) => {
    setDocs(docs.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-space-gray">E-Signatures</h2>
          <p className="text-gray-500 text-sm md:text-base">Securely sign documents and request signatures from others.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="btn-primary px-6 py-3 md:py-4 flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <Upload className="w-5 h-5" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Quick Upload Section */}
      <div className="bg-accent/5 border border-accent/10 rounded-[2.5rem] p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-space-gray">Upload New Document</h3>
            <p className="text-gray-500">Quickly upload a PDF or DOCX file to start the e-signature process.</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary px-6 py-3 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Select File
              </button>
              {newDocName && (
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-black/[0.05] shadow-sm">
                  <FileText className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold text-space-gray truncate max-w-[150px]">{newDocName}</span>
                  <button onClick={() => setNewDocName('')} className="p-1 hover:bg-red-50 text-red-400 rounded-lg">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleUpload}
              disabled={!newDocName}
              className="btn-primary px-10 py-4 shadow-xl shadow-accent/20 disabled:opacity-50 disabled:shadow-none"
            >
              Confirm & Start Building
            </button>
          </div>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total', value: docs.length, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Completed', value: docs.filter(d => d.status === 'Completed').length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Pending', value: docs.filter(d => d.status === 'Pending').length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Drafts', value: docs.filter(d => d.status === 'Draft').length, icon: PenTool, color: 'text-gray-500', bg: 'bg-gray-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-3xl border border-black/[0.03] shadow-sm">
            <div className="flex items-center gap-3 md:gap-4">
              <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center flex-shrink-0", stat.bg)}>
                <stat.icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl md:text-2xl font-bold text-space-gray">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-black/[0.05] rounded-2xl pl-12 pr-4 py-3 md:py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-sm"
          />
        </div>
        <div className="flex bg-apple-gray/50 p-1 rounded-2xl border border-black/[0.03] overflow-x-auto no-scrollbar">
          {['All', 'Draft', 'Pending', 'Completed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={cn(
                "px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-sm font-bold transition-all whitespace-nowrap uppercase tracking-widest md:normal-case md:tracking-normal",
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
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                    <div 
                      className="flex items-center gap-4 cursor-pointer group"
                      onClick={() => setViewingDoc(doc)}
                    >
                      <div className="w-10 h-10 bg-accent/5 rounded-xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all">
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
                        <span className="text-xs text-gray-400 italic">No signers</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setViewingDoc(doc)}
                        className="p-2 hover:bg-apple-gray rounded-xl text-gray-400 transition-colors"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {doc.status === 'Draft' && (
                        <>
                          <button 
                            onClick={() => {
                              setEditorDoc(doc);
                              setEditorStep(2);
                            }}
                            className="p-2 hover:bg-accent/10 rounded-xl text-accent transition-colors"
                            title="Edit Fields"
                          >
                            <PenTool className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="p-2 hover:bg-apple-gray rounded-xl text-gray-400 transition-colors"
                      >
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
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-black/[0.05]">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="p-4 space-y-4">
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setViewingDoc(doc)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/5 rounded-xl flex items-center justify-center text-accent">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-space-gray text-sm">{doc.name}</p>
                    <p className="text-[10px] text-gray-400">{doc.size} • {doc.uploadedAt}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest",
                  doc.status === 'Completed' ? "bg-green-100 text-green-600" :
                  doc.status === 'Pending' ? "bg-orange-100 text-orange-600" :
                  "bg-gray-100 text-gray-600"
                )}>
                  {doc.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex -space-x-2">
                  {doc.signers.map((signer, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white",
                        signer.status === 'Signed' ? "bg-green-500" : "bg-gray-300"
                      )}
                    >
                      {signer.email.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === 'Draft' && (
                    <>
                      <button 
                        onClick={() => setShowSignModal(doc)}
                        className="p-2 bg-accent/10 text-accent rounded-lg"
                      >
                        <PenTool className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                         setEditorDoc(doc);
                         setEditorStep(1);
                       }}
                        className="p-2 bg-blue-50 text-blue-500 rounded-lg"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button className="p-2 bg-apple-gray text-gray-400 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 bg-red-50 text-red-400 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredDocs.length === 0 && (
          <div className="px-8 py-20 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-apple-gray rounded-full flex items-center justify-center text-gray-300">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-bold text-space-gray">No documents found</p>
                <p className="text-sm text-gray-500">Upload a document to get started.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex items-center justify-between">
                <h3 className="text-xl font-bold">Upload Document</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div className="space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-black/[0.05] rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center space-y-4 bg-apple-gray/20 hover:bg-apple-gray/30 transition-all cursor-pointer group"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileSelect}
                      accept=".pdf,.docx"
                    />
                    <Upload className="w-8 h-8 md:w-10 md:h-10 text-accent group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <p className="font-bold text-space-gray text-sm md:text-base">Click to upload or drag and drop</p>
                      <p className="text-[10px] md:text-xs text-gray-500">PDF, DOCX up to 10MB</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Document Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Employment_Agreement.pdf"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      className="w-full bg-apple-gray border-none rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleUpload}
                  disabled={!newDocName}
                  className="w-full btn-primary py-3 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base disabled:opacity-50"
                >
                  Confirm Upload
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Document Modal */}
      <AnimatePresence>
        {viewingDoc && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-space-gray">{viewingDoc.name}</h3>
                    <p className="text-xs text-gray-500">Status: {viewingDoc.status} • {viewingDoc.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDownload(viewingDoc)}
                    className="p-3 hover:bg-white rounded-xl text-gray-500 transition-all shadow-sm"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setViewingDoc(null)} 
                    className="p-3 hover:bg-white rounded-xl text-gray-500 transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Document Content Area */}
                <div className="flex-1 bg-apple-gray/30 p-4 md:p-10 overflow-y-auto">
                  <div className="bg-white max-w-3xl mx-auto shadow-xl rounded-2xl min-h-[1000px] p-10 md:p-20 relative">
                    {/* Document Header */}
                    <div className="flex justify-between items-start mb-12">
                      <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white font-bold text-2xl">R</div>
                      <div className="text-right">
                        <h4 className="text-2xl font-bold text-space-gray uppercase tracking-tighter">Agreement</h4>
                        <p className="text-xs text-gray-400">Ref: {viewingDoc.id}</p>
                      </div>
                    </div>

                    {/* Document Body */}
                    <div className="space-y-8 text-space-gray leading-relaxed">
                      <p className="font-bold text-lg">Subject: {viewingDoc.name.replace('.pdf', '')}</p>
                      <p className="text-sm">
                        This document serves as a formal agreement between ZivoHR and the undersigned parties. 
                        The terms and conditions outlined herein are binding and effective as of the date of final signature.
                      </p>
                      <div className="space-y-4">
                        <h5 className="font-bold text-sm uppercase tracking-widest text-gray-400">1. Terms of Service</h5>
                        <p className="text-sm">
                          The recipient agrees to the standard terms of service provided by ZivoHR. 
                          This includes but is not limited to data privacy, operational standards, and compliance with local Zimbabwean labor laws.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <h5 className="font-bold text-sm uppercase tracking-widest text-gray-400">2. Confidentiality</h5>
                        <p className="text-sm">
                          All parties agree to maintain strict confidentiality regarding the contents of this agreement 
                          and any proprietary information shared during the course of the engagement.
                        </p>
                      </div>
                      <div className="pt-20 relative min-h-[400px]">
                        {/* Render Placed Fields */}
                        {viewingDoc.fields?.map((field) => (
                          <div
                            key={field.id}
                            style={{ 
                              left: `${field.x}%`, 
                              top: `${field.y}%`,
                              position: 'absolute'
                            }}
                          >
                            <div className="bg-accent/5 border border-accent/20 rounded px-2 py-1 flex flex-col min-w-[100px] shadow-sm">
                              <span className="text-[6px] font-black text-accent uppercase leading-none mb-0.5">{field.label}</span>
                              {field.type === 'signature' && viewingDoc.signature ? (
                                <img src={viewingDoc.signature} alt="Signature" className="h-8 object-contain" />
                              ) : (
                                <span className="text-[10px] text-gray-600 font-medium">
                                  {field.value || 'Pending...'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}

                        {viewingDoc.signature && (
                          <div className="absolute bottom-10 right-10">
                            <div className="w-20 h-20 border-2 border-accent rounded-full flex items-center justify-center rotate-12 bg-white/80 backdrop-blur-sm shadow-lg">
                              <div className="text-[10px] font-black text-accent text-center leading-tight">
                                VERIFIED<br/>RUMBY HR<br/>SEAL
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar - Details & Audit Trail */}
                <div className="w-full md:w-80 border-l border-black/[0.05] bg-white overflow-y-auto p-6 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Document Details</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Owner</span>
                        <span className="font-bold text-space-gray">{userProfile?.fullName || 'User'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Uploaded</span>
                        <span className="font-bold text-space-gray">{viewingDoc.uploadedAt}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Security</span>
                        <span className="font-bold text-green-500 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          AES-256
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Audit Trail</h4>
                    <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-black/[0.05]">
                      {viewingDoc.auditTrail.map((entry, i) => (
                        <div key={i} className="relative pl-8 group">
                          <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-white border-2 border-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                          </div>
                          <div className="bg-apple-gray/30 p-3 rounded-2xl border border-black/[0.02] group-hover:bg-apple-gray/50 transition-colors">
                            <p className="text-xs font-bold text-space-gray">{entry.action}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] text-gray-500 font-medium">{entry.user}</p>
                              <span className="text-[10px] text-gray-300">•</span>
                              <p className="text-[10px] text-gray-400">{entry.timestamp}</p>
                            </div>
                            {entry.ip && (
                              <p className="text-[8px] text-gray-300 mt-1 font-mono uppercase tracking-widest">IP: {entry.ip}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {viewingDoc.status === 'Draft' && (
                    <button 
                      onClick={() => {
                        setShowSignModal(viewingDoc);
                        setViewingDoc(null);
                      }}
                      className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2"
                    >
                      <PenTool className="w-5 h-5" />
                      Sign Document
                    </button>
                  )}
                </div>
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
              className="bg-white w-full max-w-2xl rounded-2xl md:rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <PenTool className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">Sign Document</h3>
                    <p className="text-xs text-gray-500">{showSignModal.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowSignModal(null)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6">
                <div className="p-4 md:p-6 bg-apple-gray/30 rounded-2xl border border-black/[0.03] flex items-start gap-3 md:gap-4">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-accent flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-space-gray">Legal Acknowledgment</h4>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1 leading-relaxed">
                      By signing this document, you acknowledge that you have read and understood the contents. This electronic signature is legally binding and carries the same weight as a handwritten signature.
                    </p>
                  </div>
                </div>
                
                {showSignModal.fields && showSignModal.fields.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Required Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {showSignModal.fields.filter(f => f.type !== 'signature').map((field) => (
                        <div key={field.id} className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{field.label}</label>
                          <input 
                            type={field.type === 'dob' || field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            value={fieldValues[field.id] || ''}
                            onChange={(e) => setFieldValues({ ...fieldValues, [field.id]: e.target.value })}
                            className="w-full bg-apple-gray/50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <h4 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">Your E-Signature</h4>
                  <SignaturePad onSave={handleSign} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Editor (Documenso Style) */}
      <AnimatePresence>
        {editorDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[500] flex flex-col overflow-hidden"
          >
            {/* Editor Header */}
            <div className="h-16 border-b border-black/[0.05] flex items-center justify-between px-6 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
                  <Stamp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-space-gray flex items-center gap-2">
                    {editorDoc.name}
                    <span className="px-2 py-0.5 bg-apple-gray text-[10px] rounded-full text-gray-500 uppercase tracking-widest">
                      {editorDoc.status}
                    </span>
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setEditorDoc(null)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-apple-gray rounded-xl transition-all"
                >
                  Save & Exit
                </button>
                <button 
                  onClick={handleSaveEditor}
                  className="btn-primary px-6 py-2 rounded-xl text-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Document
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
              {/* Left Sidebar - Steps & Quick Actions */}
              <div className={cn(
                "w-64 border-r border-black/[0.05] flex flex-col bg-apple-gray/10 absolute md:relative inset-y-0 left-0 z-[510] transition-transform md:translate-x-0",
                // Add a state for mobile sidebar if needed, for now let's just make it responsive
                "translate-x-[-100%] md:translate-x-0" 
              )}>
                <div className="p-6 space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Document Editor</p>
                    <div className="space-y-1">
                      {[
                        { step: 1, label: 'Document & Recipients', icon: UserPlus },
                        { step: 2, label: 'Add Fields', icon: PenTool },
                        { step: 3, label: 'Preview', icon: Eye },
                      ].map((s) => (
                        <button
                          key={s.step}
                          onClick={() => setEditorStep(s.step as any)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                            editorStep === s.step 
                              ? "bg-white text-accent shadow-sm" 
                              : "text-gray-500 hover:bg-apple-gray"
                          )}
                        >
                          <s.icon className="w-4 h-4" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Quick Actions</p>
                    <div className="space-y-1">
                      {[
                        { label: 'Document Settings', icon: History },
                        { label: 'Duplicate Document', icon: Plus },
                        { label: 'Save as Template', icon: FileCheck },
                        { label: 'Download PDF', icon: Download },
                        { label: 'Delete Document', icon: Trash2 },
                      ].map((action) => (
                        <button
                          key={action.label}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-apple-gray transition-all"
                        >
                          <action.icon className="w-4 h-4" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto p-6">
                  <button 
                    onClick={() => setEditorDoc(null)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-apple-gray transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Return to documents
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 bg-apple-gray/30 overflow-y-auto p-8 flex flex-col items-center">
                {editorStep === 1 && (
                  <div className="w-full max-w-2xl space-y-8">
                    <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-space-gray">Documents</h4>
                        <button className="text-accent text-sm font-bold flex items-center gap-1">
                          <Plus className="w-4 h-4" />
                          Add document
                        </button>
                      </div>
                      <div className="p-4 border-2 border-dashed border-black/[0.05] rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-accent" />
                          <span className="text-sm font-bold">{editorDoc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-apple-gray rounded-lg text-gray-400"><PenTool className="w-4 h-4" /></button>
                          <button className="p-2 hover:bg-apple-gray rounded-lg text-gray-400"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-black/[0.05] p-8 shadow-sm space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-space-gray">Recipients</h4>
                        <div className="flex gap-2">
                          <button className="btn-secondary px-4 py-2 rounded-xl text-xs">Add Myself</button>
                          <button className="btn-secondary px-4 py-2 rounded-xl text-xs flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                            Add Signer
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Email</label>
                            <input 
                              type="email" 
                              placeholder="Email address"
                              value={newSignerEmail}
                              onChange={(e) => setNewSignerEmail(e.target.value)}
                              className="w-full bg-apple-gray/50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Name</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Recipient name"
                                value={newSignerName}
                                onChange={(e) => setNewSignerName(e.target.value)}
                                className="flex-1 bg-apple-gray/50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                              />
                              <button 
                                onClick={() => {
                                  if (!newSignerEmail) return;
                                  setEditorDoc({
                                    ...editorDoc,
                                    signers: [...editorDoc.signers, { email: newSignerEmail, name: newSignerName, status: 'Pending', role: 'Signer' }]
                                  });
                                  setNewSignerEmail('');
                                  setNewSignerName('');
                                }}
                                className="p-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {editorDoc.signers.map((signer, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-apple-gray/30 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-accent font-bold text-xs">
                                  {signer.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-space-gray">{signer.name || signer.email}</p>
                                  <p className="text-[10px] text-gray-500">{signer.email}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => setEditorDoc({ ...editorDoc, signers: editorDoc.signers.filter((_, idx) => idx !== i) })}
                                className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button 
                        onClick={() => setEditorStep(2)}
                        disabled={editorDoc.signers.length === 0}
                        className="btn-primary px-8 py-3 rounded-2xl disabled:opacity-50"
                      >
                        Add Fields
                      </button>
                    </div>
                  </div>
                )}

                {editorStep === 2 && (
                  <div className="w-full flex gap-8 h-full">
                    <div className="flex-1 flex flex-col items-center overflow-y-auto">
                      <div 
                        ref={editorCanvasRef}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fieldType = e.dataTransfer.getData('fieldType');
                          const fieldLabel = e.dataTransfer.getData('fieldLabel');
                          if (!fieldType) return;
                          
                          const rect = editorCanvasRef.current?.getBoundingClientRect();
                          if (rect) {
                            const x = ((e.clientX - rect.left) / rect.width) * 100;
                            const y = ((e.clientY - rect.top) / rect.height) * 100;
                            
                            const newField: Field = {
                              id: `field-${Date.now()}`,
                              type: fieldType as any,
                              label: fieldLabel,
                              x: Math.max(0, Math.min(100, x)),
                              y: Math.max(0, Math.min(100, y)),
                              signerEmail: editorDoc.signers[0].email
                            };
                            setEditorDoc({ ...editorDoc, fields: [...editorDoc.fields, newField] });
                          }
                        }}
                        className="bg-white w-full max-w-[800px] aspect-[1/1.414] shadow-2xl rounded-sm relative overflow-hidden p-12 md:p-20 mb-10"
                      >
                        {/* Document Content Simulation */}
                        <div className="space-y-8 opacity-20 pointer-events-none select-none">
                          <div className="flex justify-between items-start">
                            <div className="w-16 h-16 bg-accent rounded-2xl" />
                            <div className="text-right space-y-2">
                              <div className="h-6 w-32 bg-gray-200 rounded ml-auto" />
                              <div className="h-4 w-24 bg-gray-100 rounded ml-auto" />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="h-8 w-3/4 bg-gray-200 rounded" />
                            <div className="h-4 w-full bg-gray-100 rounded" />
                            <div className="h-4 w-full bg-gray-100 rounded" />
                            <div className="h-4 w-2/3 bg-gray-100 rounded" />
                          </div>
                          <div className="pt-20 grid grid-cols-2 gap-20">
                            <div className="border-t-2 border-gray-100 pt-4 space-y-2">
                              <div className="h-4 w-32 bg-gray-100 rounded" />
                              <div className="h-3 w-24 bg-gray-50 rounded" />
                            </div>
                            <div className="border-t-2 border-gray-100 pt-4 space-y-2">
                              <div className="h-4 w-32 bg-gray-100 rounded" />
                              <div className="h-3 w-24 bg-gray-50 rounded" />
                            </div>
                          </div>
                        </div>

                        {/* Placed Fields */}
                        {editorDoc.fields.map((field) => (
                          <motion.div
                            key={field.id}
                            drag
                            dragMomentum={false}
                            onDragEnd={(_, info) => {
                              const rect = editorCanvasRef.current?.getBoundingClientRect();
                              if (rect) {
                                const x = ((info.point.x - rect.left) / rect.width) * 100;
                                const y = ((info.point.y - rect.top) / rect.height) * 100;
                                updateFieldPosition(field.id, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
                              }
                            }}
                            style={{ 
                              left: `${field.x}%`, 
                              top: `${field.y}%`,
                              position: 'absolute'
                            }}
                            className="group cursor-move"
                          >
                            <div className="bg-accent/10 border-2 border-accent rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg backdrop-blur-sm min-w-[120px]">
                              <GripVertical className="w-3 h-3 text-accent opacity-50" />
                              <div className="flex-1">
                                <p className="text-[8px] font-black text-accent uppercase leading-none mb-1">{field.label}</p>
                                <p className="text-[6px] text-accent/60 truncate max-w-[80px]">{field.signerEmail}</p>
                              </div>
                              <button 
                                onClick={() => setEditorDoc({ ...editorDoc, fields: editorDoc.fields.filter(f => f.id !== field.id) })}
                                className="p-1 hover:bg-accent/20 rounded text-accent opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Right Sidebar - Field Selection */}
                    <div className="w-full md:w-72 bg-white border-l border-black/[0.05] p-6 space-y-8 overflow-y-auto">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Selected Recipient</p>
                        <select 
                          className="w-full bg-apple-gray/50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                          onChange={(e) => {
                            // Logic to change active recipient for new fields
                          }}
                        >
                          {editorDoc.signers.map(s => (
                            <option key={s.email} value={s.email}>{s.name || s.email}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Add Fields</p>
                        <div className="grid grid-cols-2 gap-3">
                          {fieldTypes.map((field) => (
                            <div
                              key={field.type}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('fieldType', field.type);
                                e.dataTransfer.setData('fieldLabel', field.label);
                              }}
                              onClick={() => handleAddField(field.type, field.label)}
                              className="flex flex-col items-center justify-center p-4 bg-apple-gray/30 border border-black/[0.03] rounded-2xl hover:border-accent hover:text-accent transition-all cursor-grab active:cursor-grabbing group"
                            >
                              <field.icon className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{field.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-8">
                        <button 
                          onClick={() => setEditorStep(3)}
                          className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2"
                        >
                          Preview
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {editorStep === 3 && (
                  <div className="w-full max-w-4xl space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-black/[0.05] p-12 shadow-sm space-y-12">
                      <div className="flex justify-between items-start">
                        <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white font-bold text-2xl">R</div>
                        <div className="text-right">
                          <h4 className="text-2xl font-bold text-space-gray uppercase tracking-tighter">Preview Agreement</h4>
                          <p className="text-xs text-gray-400">Ref: {editorDoc.id}</p>
                        </div>
                      </div>

                      <div className="space-y-8 text-space-gray leading-relaxed">
                        <p className="font-bold text-lg">Subject: {editorDoc.name}</p>
                        <p className="text-sm">
                          Please review the document and the placed fields below. Once sent, recipients will be notified to sign.
                        </p>
                        
                        <div className="p-8 bg-apple-gray/30 rounded-3xl border border-black/[0.03] space-y-4">
                          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recipients & Roles</h5>
                          <div className="space-y-3">
                            {editorDoc.signers.map((s, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-accent font-bold text-xs shadow-sm">
                                    {s.email.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-bold">{s.name || s.email}</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.role}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-8 bg-accent/5 rounded-3xl border border-accent/10 space-y-4">
                          <h5 className="text-xs font-bold text-accent uppercase tracking-widest">Placed Fields ({editorDoc.fields.length})</h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {editorDoc.fields.map((f, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <div className="w-2 h-2 bg-accent rounded-full" />
                                <span className="font-bold">{f.label}</span>
                                <span className="text-gray-400">for {f.signerEmail.split('@')[0]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setEditorStep(2)}
                        className="flex-1 btn-secondary py-4 rounded-2xl"
                      >
                        Back to Fields
                      </button>
                      <button 
                        onClick={handleSaveEditor}
                        className="flex-1 btn-primary py-4 rounded-2xl flex items-center justify-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Send Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

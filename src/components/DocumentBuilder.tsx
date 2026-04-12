import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  UserPlus, 
  Type, 
  Calendar, 
  PenTool, 
  Hash, 
  CheckCircle2,
  Trash2,
  GripVertical,
  ChevronRight,
  ShieldCheck,
  Send,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Field {
  id: string;
  type: 'signature' | 'date' | 'name' | 'text' | 'number' | 'dob';
  label: string;
  x: number;
  y: number;
  signerEmail: string;
}

interface Signer {
  email: string;
  role: 'Signer' | 'Approver';
}

interface DocumentBuilderProps {
  docName: string;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function DocumentBuilder({ docName, onClose, onSave }: DocumentBuilderProps) {
  const [fields, setFields] = useState<Field[]>([]);
  const [signers, setSigners] = useState<Signer[]>([]);
  const [newSignerEmail, setNewSignerEmail] = useState('');
  const [newSignerRole, setNewSignerRole] = useState<'Signer' | 'Approver'>('Signer');
  const [activeStep, setActiveStep] = useState<'signers' | 'fields'>('signers');
  
  const documentRef = useRef<HTMLDivElement>(null);

  const fieldTypes = [
    { type: 'signature', label: 'Signature', icon: PenTool },
    { type: 'date', label: 'Date', icon: Calendar },
    { type: 'name', label: 'Full Name', icon: Type },
    { type: 'text', label: 'Text Field', icon: Type },
    { type: 'number', label: 'Number', icon: Hash },
    { type: 'dob', label: 'Date of Birth', icon: Calendar },
  ];

  const handleAddSigner = () => {
    if (!newSignerEmail || !newSignerEmail.includes('@')) return;
    if (signers.find(s => s.email === newSignerEmail)) return;
    setSigners([...signers, { email: newSignerEmail, role: newSignerRole }]);
    setNewSignerEmail('');
  };

  const handleRemoveSigner = (email: string) => {
    setSigners(signers.filter(s => s.email !== email));
    setFields(fields.filter(f => f.signerEmail !== email));
  };

  const handleAddField = (type: Field['type'], label: string) => {
    if (signers.length === 0) {
      alert("Please add at least one signer first.");
      return;
    }
    const newField: Field = {
      id: `field-${Date.now()}`,
      type,
      label,
      x: 40 + (fields.length * 2), // Stagger initial positions
      y: 40 + (fields.length * 2),
      signerEmail: signers[0].email
    };
    setFields([...fields, newField]);
  };

  const updateFieldPosition = (id: string, x: number, y: number) => {
    setFields(fields.map(f => f.id === id ? { ...f, x, y } : f));
  };

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    e.dataTransfer.setData('fieldId', fieldId);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fieldId = e.dataTransfer.getData('fieldId');
    const rect = documentRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      updateFieldPosition(fieldId, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
    }
  };

  const handleFinish = () => {
    onSave({
      docName,
      signers,
      fields,
      status: 'Pending',
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-white z-[400] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-80 border-r border-black/[0.05] flex flex-col h-full bg-apple-gray/10">
        <div className="p-6 border-b border-black/[0.05] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-space-gray">Doc Builder</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Step {activeStep === 'signers' ? '1' : '2'} of 2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-apple-gray rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {activeStep === 'signers' ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add Signers & Approvers</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="signer@example.com"
                      value={newSignerEmail}
                      onChange={(e) => setNewSignerEmail(e.target.value)}
                      className="w-full bg-white border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={newSignerRole}
                      onChange={(e) => setNewSignerRole(e.target.value as any)}
                      className="flex-1 bg-white border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="Signer">Signer</option>
                      <option value="Approver">Approver</option>
                    </select>
                    <button 
                      onClick={handleAddSigner}
                      className="p-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recipients List</h4>
                {signers.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-black/[0.05] rounded-2xl text-center">
                    <p className="text-xs text-gray-400">No recipients added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {signers.map((signer) => (
                      <div key={signer.email} className="flex items-center justify-between p-3 bg-white border border-black/[0.05] rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-apple-gray rounded-lg flex items-center justify-center text-gray-400">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-space-gray truncate max-w-[120px]">{signer.email}</p>
                            <p className="text-[10px] text-gray-500">{signer.role}</p>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveSigner(signer.email)} className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Drag Fields to Document</h4>
                <div className="grid grid-cols-2 gap-3">
                  {fieldTypes.map((field) => (
                    <button
                      key={field.type}
                      onClick={() => handleAddField(field.type as any, field.label)}
                      className="flex flex-col items-center justify-center p-4 bg-white border border-black/[0.05] rounded-2xl hover:border-accent hover:text-accent transition-all group"
                    >
                      <field.icon className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{field.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Fields</h4>
                {fields.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-black/[0.05] rounded-2xl text-center">
                    <p className="text-xs text-gray-400">No fields placed yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <div key={field.id} className="p-3 bg-white border border-black/[0.05] rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-accent/5 rounded-lg flex items-center justify-center text-accent">
                              <PenTool className="w-4 h-4" />
                            </div>
                            <p className="text-xs font-bold text-space-gray">{field.label}</p>
                          </div>
                          <button onClick={() => setFields(fields.filter(f => f.id !== field.id))} className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-400 uppercase px-1">Assigned To</label>
                          <select 
                            value={field.signerEmail}
                            onChange={(e) => setFields(fields.map(f => f.id === field.id ? { ...f, signerEmail: e.target.value } : f))}
                            className="w-full bg-apple-gray border-none rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent/20"
                          >
                            {signers.map(s => (
                              <option key={s.email} value={s.email}>{s.email}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-black/[0.05]">
          {activeStep === 'signers' ? (
            <button 
              onClick={() => setActiveStep('fields')}
              disabled={signers.length === 0}
              className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Continue to Fields
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setActiveStep('signers')}
                className="flex-1 btn-secondary py-4 rounded-2xl"
              >
                Back
              </button>
              <button 
                onClick={handleFinish}
                className="flex-1 btn-primary py-4 rounded-2xl flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Document Canvas */}
      <div className="flex-1 bg-apple-gray/30 p-4 md:p-10 overflow-y-auto flex justify-center">
        <div 
          ref={documentRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="bg-white w-full max-w-[800px] aspect-[1/1.414] shadow-2xl rounded-sm relative overflow-hidden p-12 md:p-20"
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
          {fields.map((field) => (
            <motion.div
              key={field.id}
              drag
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const rect = documentRef.current?.getBoundingClientRect();
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
                  onClick={() => setFields(fields.filter(f => f.id !== field.id))}
                  className="p-1 hover:bg-accent/20 rounded text-accent opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}

          {fields.length === 0 && activeStep === 'fields' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-4 opacity-30">
                <PenTool className="w-16 h-16 mx-auto text-gray-400" />
                <p className="text-sm font-bold text-gray-400">Drag fields from the sidebar onto the document</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Download, 
  Layout, 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Award, 
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { cn } from '../lib/utils';

interface CVSection {
  id: string;
  type: 'personal' | 'experience' | 'education' | 'skills' | 'custom';
  title: string;
  content: any;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  desc: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

type CVTemplate = 'chronological' | 'functional' | 'combination';

export default function CVBuilder({ initialData, onCancel }: { initialData?: any, onCancel: () => void }) {
  const [template, setTemplate] = useState<CVTemplate>('chronological');
  const [sections, setSections] = useState<CVSection[]>([
    { id: '1', type: 'personal', title: 'Personal Information', content: { name: initialData?.name || '', email: '', phone: '', summary: initialData?.experience || '' } },
    { id: '2', type: 'experience', title: 'Work Experience', content: [] },
    { id: '3', type: 'education', title: 'Education', content: [] },
    { id: '4', type: 'skills', title: 'Skills', content: initialData?.skills?.split(',').map((s: string) => s.trim()) || [] },
  ]);
  const [activeSection, setActiveSection] = useState<string | null>('1');

  const addSection = () => {
    const newSection: CVSection = {
      id: Date.now().toString(),
      type: 'custom',
      title: 'New Section',
      content: ''
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, content: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, content } : s));
  };

  const handleDownload = (format: 'pdf' | 'docx') => {
    const cvContent = JSON.stringify(sections, null, 2);
    const blob = new Blob([cvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${template}_${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    alert(`Downloading your ${template} CV as ${format.toUpperCase()}...`);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-apple-gray/10 rounded-[2.5rem] overflow-hidden border border-black/[0.05]">
      {/* Sidebar: Sections & Templates */}
      <div className="w-full lg:w-80 bg-white border-r border-black/[0.05] flex flex-col h-full">
        <div className="p-6 border-b border-black/[0.05] bg-apple-gray/30">
          <h3 className="text-lg font-bold text-space-gray">CV Designer</h3>
          <p className="text-xs text-gray-500">Customize your professional profile</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">Choose Template</label>
            <div className="grid grid-cols-1 gap-2">
              {(['chronological', 'functional', 'combination'] as CVTemplate[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    template === t ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-apple-gray/50 text-gray-500 hover:bg-apple-gray"
                  )}
                >
                  <Layout className="w-4 h-4" />
                  <span className="capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section Reordering */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sections</label>
              <button onClick={addSection} className="p-1 hover:bg-apple-gray rounded-lg text-accent">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-2">
              {sections.map((section) => (
                <Reorder.Item 
                  key={section.id} 
                  value={section}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all",
                    activeSection === section.id ? "bg-accent/10 text-accent border border-accent/20" : "bg-white border border-black/[0.05] text-gray-500 hover:border-accent/30"
                  )}
                  onClick={() => setActiveSection(section.id)}
                >
                  <GripVertical className="w-4 h-4 text-gray-300" />
                  <span className="flex-1 truncate">{section.title}</span>
                  {section.type === 'custom' && (
                    <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </div>

        <div className="p-6 border-t border-black/[0.05] bg-apple-gray/30 flex gap-2">
          <button onClick={() => handleDownload('pdf')} className="flex-1 btn-secondary py-3 text-xs flex items-center justify-center gap-2">
            <Download className="w-3.5 h-3.5" />
            PDF
          </button>
          <button onClick={() => handleDownload('docx')} className="flex-1 btn-secondary py-3 text-xs flex items-center justify-center gap-2">
            <Download className="w-3.5 h-3.5" />
            DOCX
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-black/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-space-gray">Editor</h3>
              <p className="text-xs text-gray-500">Editing: {sections.find(s => s.id === activeSection)?.title}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-apple-gray rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-2xl mx-auto space-y-8">
            <AnimatePresence mode="wait">
              {sections.map((section) => section.id === activeSection && (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {section.type === 'personal' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                          <input 
                            type="text" 
                            value={section.content.name}
                            onChange={(e) => updateSection(section.id, { ...section.content, name: e.target.value })}
                            className="w-full bg-apple-gray/50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
                          <input 
                            type="email" 
                            value={section.content.email}
                            onChange={(e) => updateSection(section.id, { ...section.content, email: e.target.value })}
                            className="w-full bg-apple-gray/50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Professional Summary</label>
                        <textarea 
                          rows={6}
                          value={section.content.summary}
                          onChange={(e) => updateSection(section.id, { ...section.content, summary: e.target.value })}
                          className="w-full bg-apple-gray/50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {section.type === 'experience' && (
                    <div className="space-y-6">
                      {section.content.map((exp: Experience, i: number) => (
                        <div key={exp.id} className="p-6 bg-apple-gray/30 rounded-3xl border border-black/[0.03] space-y-4 relative group">
                          <button 
                            onClick={() => updateSection(section.id, section.content.filter((_: any, idx: number) => idx !== i))}
                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                              placeholder="Company"
                              value={exp.company}
                              onChange={(e) => {
                                const newContent = [...section.content];
                                newContent[i].company = e.target.value;
                                updateSection(section.id, newContent);
                              }}
                              className="bg-white border border-black/[0.05] rounded-xl px-4 py-2 text-sm outline-none"
                            />
                            <input 
                              placeholder="Role"
                              value={exp.role}
                              onChange={(e) => {
                                const newContent = [...section.content];
                                newContent[i].role = e.target.value;
                                updateSection(section.id, newContent);
                              }}
                              className="bg-white border border-black/[0.05] rounded-xl px-4 py-2 text-sm outline-none"
                            />
                          </div>
                          <textarea 
                            placeholder="Responsibilities & Achievements"
                            rows={3}
                            value={exp.desc}
                            onChange={(e) => {
                              const newContent = [...section.content];
                              newContent[i].desc = e.target.value;
                              updateSection(section.id, newContent);
                            }}
                            className="w-full bg-white border border-black/[0.05] rounded-xl px-4 py-2 text-sm outline-none resize-none"
                          />
                        </div>
                      ))}
                      <button 
                        onClick={() => updateSection(section.id, [...section.content, { id: Date.now().toString(), company: '', role: '', period: '', desc: '' }])}
                        className="w-full py-4 border-2 border-dashed border-black/[0.05] rounded-3xl text-gray-400 hover:border-accent/30 hover:text-accent transition-all flex items-center justify-center gap-2 font-bold"
                      >
                        <Plus className="w-4 h-4" />
                        Add Experience
                      </button>
                    </div>
                  )}

                  {section.type === 'skills' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {section.content.map((skill: string, i: number) => (
                          <div key={i} className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-bold flex items-center gap-2">
                            {skill}
                            <button onClick={() => updateSection(section.id, section.content.filter((_: any, idx: number) => idx !== i))}>
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Add a skill..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                updateSection(section.id, [...section.content, val]);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                          className="flex-1 bg-apple-gray/50 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                        />
                      </div>
                    </div>
                  )}

                  {section.type === 'custom' && (
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        value={section.title}
                        onChange={(e) => {
                          setSections(sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s));
                        }}
                        className="text-2xl font-bold text-space-gray border-none bg-transparent outline-none w-full"
                      />
                      <textarea 
                        rows={10}
                        value={section.content}
                        onChange={(e) => updateSection(section.id, e.target.value)}
                        className="w-full bg-apple-gray/50 border-none rounded-3xl px-6 py-6 text-sm outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                        placeholder="Write your custom section content here..."
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Preview Area (Hidden on mobile) */}
      <div className="hidden xl:block w-[400px] bg-apple-gray/30 border-l border-black/[0.05] p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Preview</h4>
          <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[8px] font-bold rounded-full uppercase">Auto-saving</span>
        </div>
        
        <div className={cn(
          "bg-white shadow-2xl rounded-sm p-8 min-h-[500px] space-y-6 text-[10px] transform origin-top scale-90",
          template === 'functional' ? "font-serif" : "font-sans"
        )}>
          {sections.map((s) => (
            <div key={s.id} className="space-y-2">
              <h5 className="font-bold border-b border-black/[0.05] pb-1 text-accent uppercase tracking-wider">{s.title}</h5>
              {s.type === 'personal' && (
                <div className="space-y-1">
                  <p className="text-lg font-black text-space-gray">{s.content.name || 'Your Name'}</p>
                  <p className="text-gray-500">{s.content.email || 'email@example.com'}</p>
                  <p className="text-gray-600 mt-2 italic">{s.content.summary}</p>
                </div>
              )}
              {s.type === 'experience' && (
                <div className="space-y-3">
                  {s.content.map((exp: Experience) => (
                    <div key={exp.id}>
                      <p className="font-bold text-space-gray">{exp.role} @ {exp.company}</p>
                      <p className="text-gray-400">{exp.period}</p>
                      <p className="text-gray-600 mt-1">{exp.desc}</p>
                    </div>
                  ))}
                </div>
              )}
              {s.type === 'skills' && (
                <div className="flex flex-wrap gap-1">
                  {s.content.map((skill: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-apple-gray rounded-full">{skill}</span>
                  ))}
                </div>
              )}
              {s.type === 'custom' && (
                <p className="text-gray-600 whitespace-pre-wrap">{s.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

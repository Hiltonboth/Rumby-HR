import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ChevronRight, 
  Download, 
  Scale, 
  BookOpen, 
  HelpCircle, 
  Filter,
  Plus,
  ArrowLeft,
  ExternalLink,
  X,
  Eye,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Resource {
  id: string;
  title: string;
  desc: string;
  type: 'PDF' | 'Template' | 'Case Study' | 'FAQ' | 'Guide' | 'Handbook';
  category: string;
  link?: string;
  content?: string;
  outcome?: 'Won' | 'Lost' | 'Settled' | 'Pending';
  industry?: string;
  fullAnalysis?: string;
}

const RESOURCES: Resource[] = [
  {
    id: 'labour-act',
    title: 'The Labour Act [Chapter 28:01]',
    desc: 'The primary legislation governing employment in Zimbabwe, updated to 2019.',
    type: 'PDF',
    category: 'Legislation',
    link: 'https://www.veritaszim.net/sites/veritas_d/files/Labour%20Act%20updated%20to%202019.pdf',
    content: 'THE LABOUR ACT [CHAPTER 28:01]\n\nAn Act to declare and define the fundamental rights of employees; to give effect to the international obligations of the Republic of Zimbabwe as a member state of the International Labour Organisation...'
  },
  {
    id: 'contract-perm',
    title: 'Permanent Employment Contract',
    desc: 'Standard template for full-time permanent staff with Zimbabwean law clauses.',
    type: 'Template',
    category: 'Contracts',
    content: 'This Employment Contract is made between [Employer Name] and [Employee Name]...\n\n1. Position: [Job Title]\n2. Commencement: [Date]\n3. Remuneration: [Amount]\n4. Notice Period: 3 Months as per Labour Act...'
  },
  {
    id: 'contract-fixed',
    title: 'Fixed-Term Contract',
    desc: 'Short-term contract template for seasonal or project-based work.',
    type: 'Template',
    category: 'Contracts',
    content: 'This Fixed-Term Contract is made between [Employer Name] and [Employee Name]...\n\n1. Duration: [Months]\n2. Expiry Date: [Date]\n3. No automatic renewal clause included.'
  },
  {
    id: 'case-dismissal-1',
    title: 'NSSA vs. Employee (2022)',
    desc: 'Significant ruling on unfair dismissal and the right to a fair hearing.',
    type: 'Case Study',
    category: 'Labor Cases',
    outcome: 'Won',
    fullAnalysis: 'In this landmark 2022 case, the Supreme Court of Zimbabwe reinforced the principle of natural justice. The employee was dismissed without a formal disciplinary hearing as required by the NSSA Internal Code of Conduct. The court ruled that even if the evidence of misconduct is overwhelming, the procedural fairness of a hearing cannot be bypassed. \n\nKey Takeaway: Always follow your registered Code of Conduct to the letter.'
  },
  {
    id: 'case-retrenchment-1',
    title: 'Zimasco vs. Workers Committee',
    desc: 'Analysis of retrenchment procedures and package calculations.',
    type: 'Case Study',
    category: 'Labor Cases',
    outcome: 'Settled',
    fullAnalysis: 'This case involved a dispute over the calculation of retrenchment packages during a major downsizing exercise. The Workers Committee argued that the company had not fully disclosed its financial position to the Retrenchment Board. \n\nOutcome: A settlement was reached where the company agreed to an additional "ex-gratia" payment of 1 month salary for every 2 years served.'
  },
  {
    id: 'case-notice-1',
    title: 'Zuva Petroleum vs. Don Nyamasoka',
    desc: 'The landmark case that led to the 2015 Labour Act amendments regarding termination on notice.',
    type: 'Case Study',
    category: 'Labor Cases',
    outcome: 'Lost',
    fullAnalysis: 'The Zuva Petroleum case is perhaps the most famous in Zimbabwean labor history. It initially allowed employers to terminate contracts on notice without giving a reason. This led to thousands of job losses in weeks. \n\nLegal Impact: Parliament immediately amended the Labour Act to require a valid reason for termination (e.g., retrenchment, disciplinary) even when notice is given.'
  },
  {
    id: 'nec-agric',
    title: 'NEC Agriculture Handbook',
    desc: 'Minimum wage and working conditions for the agricultural sector.',
    type: 'Handbook',
    category: 'NEC Handbooks',
    industry: 'Agriculture',
    content: 'COLLECTIVE BARGAINING AGREEMENT: AGRICULTURAL INDUSTRY\n\n1. Scope: All employees in the agricultural sector.\n2. Wages: Minimum wage for Grade 1 is currently set at [Amount].\n3. Hours: 45 hours per week maximum.'
  },
  {
    id: 'nec-comm',
    title: 'NEC Commercial Sector',
    desc: 'Regulations for retail and commercial business employees.',
    type: 'Handbook',
    category: 'NEC Handbooks',
    industry: 'Commercial',
    content: 'COLLECTIVE BARGAINING AGREEMENT: COMMERCIAL SECTOR\n\n1. Scope: Retail, wholesale, and general commercial businesses.\n2. Grading: 12 distinct grades based on skill and responsibility.\n3. Overtime: 1.5x for weekdays, 2x for Sundays and Public Holidays.'
  },
  {
    id: 'nec-mining',
    title: 'NEC Mining Industry',
    desc: 'Safety regulations and wage scales for the mining sector.',
    type: 'Handbook',
    category: 'NEC Handbooks',
    industry: 'Mining',
    content: 'COLLECTIVE BARGAINING AGREEMENT: MINING INDUSTRY\n\n1. Safety: Mandatory PPE provision by employer.\n2. Underground Allowance: 15% of basic salary.\n3. Shift Rotation: Maximum 8 hours per shift.'
  }
];

const FAQS = [
  {
    q: "What is the minimum notice period for dismissal in Zimbabwe?",
    a: "According to the Labour Act, notice periods vary: 3 months for permanent contracts, 1 month for contracts over 6 months, and 2 weeks for shorter terms.",
    cat: "Dismissal"
  },
  {
    q: "How is NSSA calculated?",
    a: "Currently, both employer and employee contribute 4.5% of the basic salary, capped at a specific limit set by the government periodically.",
    cat: "Compliance"
  },
  {
    q: "Are fixed-term contracts automatically renewed?",
    a: "No, but if an employee continues to work after the expiry without a new contract, it may be deemed a permanent contract under certain conditions.",
    cat: "Contracts"
  },
  {
    q: "What is the AIDS Levy?",
    a: "It is a 3% tax calculated on the PAYE (Pay As You Earn) amount, not the gross salary.",
    cat: "Taxation"
  },
  {
    q: "Can an employer terminate a contract without a hearing?",
    a: "Generally, no. The Labour Act requires a fair hearing following a code of conduct. Termination on notice without a hearing is now strictly limited.",
    cat: "Disciplinary"
  }
];

export default function ResourceLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [visibleCases, setVisibleCases] = useState(2);
  const [editingTemplate, setEditingTemplate] = useState<Resource | null>(null);
  const [templateContent, setTemplateContent] = useState('');
  const [viewingHandbook, setViewingHandbook] = useState<Resource | null>(null);
  const [viewingCase, setViewingCase] = useState<Resource | null>(null);

  const categories = ['All', 'Legislation', 'Contracts', 'Labor Cases', 'NEC Handbooks', 'FAQs'];

  const filteredResources = RESOURCES.filter(r => 
    (activeCategory === 'All' || r.category === activeCategory) &&
    (r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredFaqs = FAQS.filter(f => 
    (activeCategory === 'All' || activeCategory === 'FAQs') &&
    (f.q.toLowerCase().includes(searchTerm.toLowerCase()) || f.a.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const laborCases = filteredResources.filter(r => r.category === 'Labor Cases');
  const otherResources = filteredResources.filter(r => r.category !== 'Labor Cases');

  const handleEditTemplate = (res: Resource) => {
    setEditingTemplate(res);
    setTemplateContent(res.content || '');
  };

  const handleDownload = (res: Resource) => {
    const content = res.content || `Content for ${res.title}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${res.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight text-space-gray">Zimbabwean HR Library</h2>
          <p className="text-gray-500">Everything you need to stay compliant and professional.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search laws, cases, templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-apple-gray border-none rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
              activeCategory === cat 
                ? "bg-accent text-white shadow-lg shadow-accent/20" 
                : "bg-apple-gray text-gray-500 hover:bg-gray-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-16">
        {/* Main Resources */}
        {otherResources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherResources.map((item) => (
              <motion.div 
                layout
                key={item.id} 
                className="p-8 rounded-3xl bg-white border border-black/[0.05] hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest rounded-full">{item.type}</span>
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-space-gray">{item.title}</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{item.desc}</p>
                
                <div className="flex items-center gap-4">
                  {item.id === 'labour-act' ? (
                    <button 
                      onClick={() => handleDownload(item)}
                      className="flex items-center gap-2 text-accent font-bold text-sm hover:gap-3 transition-all"
                    >
                      Download Labour Act
                      <Download className="w-4 h-4" />
                    </button>
                  ) : item.category === 'NEC Handbooks' ? (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setViewingHandbook(item)}
                        className="flex items-center gap-2 text-accent font-bold text-sm hover:text-accent/80 transition-all"
                      >
                        Read Online
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownload(item)}
                        className="flex items-center gap-2 text-gray-400 font-bold text-sm hover:text-accent transition-all"
                      >
                        Download
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ) : item.type === 'Template' ? (
                    <button 
                      onClick={() => handleEditTemplate(item)}
                      className="flex items-center gap-2 text-accent font-bold text-sm hover:gap-3 transition-all"
                    >
                      Customize Template
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      className="flex items-center gap-2 text-accent font-bold text-sm hover:gap-3 transition-all"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Labor Cases Section */}
        {(activeCategory === 'All' || activeCategory === 'Labor Cases') && laborCases.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold">Labor Case Analysis</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {laborCases.slice(0, visibleCases).map((item) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={item.id}
                  className="p-8 rounded-[2.5rem] bg-apple-gray/30 border border-black/[0.03] space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
                      item.outcome === 'Won' ? "bg-green-100 text-green-600" :
                      item.outcome === 'Lost' ? "bg-red-100 text-red-600" :
                      "bg-blue-100 text-blue-600"
                    )}>
                      {item.outcome}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</span>
                  </div>
                  <h4 className="text-xl font-bold text-space-gray">{item.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  <button 
                    onClick={() => setViewingCase(item)}
                    className="text-accent text-sm font-bold hover:underline"
                  >
                    Read Full Analysis
                  </button>
                </motion.div>
              ))}
            </div>
            {visibleCases < laborCases.length && (
              <div className="text-center">
                <button 
                  onClick={() => setVisibleCases(prev => prev + 2)}
                  className="px-8 py-3 bg-white border border-black/[0.1] rounded-full text-sm font-bold hover:bg-apple-gray transition-all"
                >
                  View More Cases
                </button>
              </div>
            )}
          </div>
        )}

        {/* FAQs Section */}
        {(activeCategory === 'All' || activeCategory === 'FAQs') && filteredFaqs.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold">Frequently Asked Questions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFaqs.map((faq, i) => (
                <motion.div 
                  layout
                  key={`faq-${i}`}
                  className="p-8 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-4"
                >
                  <h3 className="text-lg font-bold text-space-gray leading-tight">{faq.q}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  <span className="inline-block text-[10px] font-bold text-blue-400 uppercase tracking-widest">{faq.cat}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {filteredResources.length === 0 && filteredFaqs.length === 0 && (
        <div className="text-center py-20 bg-apple-gray/30 rounded-[3rem]">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No resources found matching your search.</p>
        </div>
      )}

      {/* NEC Handbook Reader Modal */}
      <AnimatePresence>
        {viewingHandbook && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{viewingHandbook.title}</h2>
                    <p className="text-sm text-gray-500">{viewingHandbook.industry} Industry Handbook</p>
                  </div>
                </div>
                <button onClick={() => setViewingHandbook(null)} className="p-2 hover:bg-black/5 rounded-full">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="p-12 flex-1 overflow-y-auto bg-white">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="text-center space-y-2">
                    <h1 className="text-3xl font-serif font-bold text-space-gray">{viewingHandbook.title}</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Official Industry Regulations</p>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-600 leading-relaxed text-base">
                      {viewingHandbook.content}
                    </pre>
                  </div>
                </div>
              </div>
              <div className="p-8 border-t border-black/[0.05] flex justify-between items-center bg-apple-gray/10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page 1 of 1 (Sample View)</p>
                <button 
                  onClick={() => handleDownload(viewingHandbook)}
                  className="btn-primary px-8 py-3 flex items-center gap-2"
                >
                  Download Full PDF
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Case Analysis Modal */}
      <AnimatePresence>
        {viewingCase && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Case Analysis</h2>
                    <p className="text-sm text-gray-500">{viewingCase.title}</p>
                  </div>
                </div>
                <button onClick={() => setViewingCase(null)} className="p-2 hover:bg-black/5 rounded-full">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
                    viewingCase.outcome === 'Won' ? "bg-green-100 text-green-600" :
                    viewingCase.outcome === 'Lost' ? "bg-red-100 text-red-600" :
                    "bg-blue-100 text-blue-600"
                  )}>
                    Outcome: {viewingCase.outcome}
                  </span>
                </div>
                <div className="bg-apple-gray/30 p-6 rounded-2xl border border-black/[0.03]">
                  <h4 className="text-sm font-bold text-space-gray uppercase tracking-widest mb-4">Legal Summary & Analysis</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {viewingCase.fullAnalysis}
                  </p>
                </div>
                <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-accent/80 font-medium">
                    This analysis is for informational purposes only and does not constitute legal advice. Consult with a qualified labor lawyer for specific cases.
                  </p>
                </div>
              </div>
              <div className="p-8 border-t border-black/[0.05] flex justify-end">
                <button onClick={() => setViewingCase(null)} className="btn-primary px-8 py-3">Close Analysis</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template Editor Modal */}
      <AnimatePresence>
        {editingTemplate && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Customize Template</h2>
                  <p className="text-sm text-gray-500">{editingTemplate.title}</p>
                </div>
                <button onClick={() => setEditingTemplate(null)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="p-8 flex-1 overflow-y-auto">
                <textarea 
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  className="w-full h-96 p-6 bg-apple-gray/30 rounded-3xl text-sm font-mono leading-relaxed outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div className="p-8 border-t border-black/[0.05] flex justify-end gap-4">
                <button onClick={() => setEditingTemplate(null)} className="px-6 py-3 text-sm font-bold text-gray-500">Cancel</button>
                <button 
                  onClick={() => {
                    // Simulate download
                    const blob = new Blob([templateContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${editingTemplate.title.replace(/\s+/g, '_')}.txt`;
                    a.click();
                    setEditingTemplate(null);
                  }}
                  className="btn-primary px-8 py-3 flex items-center gap-2"
                >
                  Download Customized Contract
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

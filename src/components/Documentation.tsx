import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  ChevronRight, 
  Search, 
  Users, 
  Shield, 
  CreditCard, 
  BarChart3, 
  PenTool, 
  Star,
  ArrowLeft,
  FileText,
  Zap,
  Lock,
  MessageCircle,
  Smartphone,
  Globe,
  Settings,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface DocumentationProps {
  onBack: () => void;
}

const DOC_SECTIONS = [
  {
    title: 'Technical Setup',
    icon: Settings,
    items: [
      {
        id: 'supabase-setup',
        title: 'Configuring Supabase (Required)',
        content: 'ZivoHR uses Supabase for database and authentication. To make the application functional, you MUST provide your own Supabase credentials in the AI Studio settings.',
        keyFeatures: [
          { title: 'Step 1: Create Project', desc: 'Go to supabase.com and create a new project.' },
          { title: 'Step 2: Get Credentials', desc: 'Go to Project Settings -> API and copy the Project URL and Anon Key.' },
          { title: 'Step 3: Update Settings', desc: 'In AI Studio, go to Settings (gear icon) and add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables.' },
          { title: 'Step 4: SQL Migration', desc: 'Copy and run the contents of supabase-schema.sql in the SQL Editor on Supabase.' }
        ]
      }
    ]
  },
  {
    title: 'Getting Started',
    icon: Zap,
    items: [
      { 
        id: 'intro', 
        title: 'Introduction to ZivoHR', 
        content: 'ZivoHR is a modern HR operating system designed specifically for SMEs in Zimbabwe. We combine global best practices with local compliance requirements, ensuring your business stays ahead of the curve while remaining fully compliant with the Zimbabwean Labour Act.',
        keyFeatures: [
          { title: 'Local Compliance', desc: 'Built-in support for ZIMRA, NSSA, and various NEC regulations.' },
          { title: 'Cloud-Native', desc: 'Access your HR data anywhere, anytime, with bank-grade security.' },
          { title: 'Employee-First', desc: 'Beautiful self-service portals that reduce HR administrative burden.' },
          { title: 'Scalable', desc: 'From 5 to 500 employees, ZivoHR grows with your business.' }
        ]
      },
      { 
        id: 'setup', 
        title: 'Setting up your Company', 
        content: 'Configuring ZivoHR is straightforward. You can set up your company profile, departments, and branding in under 5 minutes. This includes setting your fiscal year, currency (ZWG/USD), and default working hours.',
        keyFeatures: [
          { title: 'Multi-Currency', desc: 'Support for ZWG and USD payroll processing and reporting.' },
          { title: 'Departmental Hierarchy', desc: 'Define reporting lines and cost centers for better organization.' },
          { title: 'Custom Branding', desc: 'Upload your logo and set your brand colors for a native feel.' },
          { title: 'User Roles', desc: 'Granular permissions for HR managers, Finance, and Employees.' }
        ]
      },
      { 
        id: 'onboarding', 
        title: 'Employee Onboarding', 
        content: 'Our automated onboarding wizard helps you bring new hires into the team with zero paperwork. Send digital contracts, collect personal details, and assign equipment automatically.',
        keyFeatures: [
          { title: 'Digital Contracts', desc: 'Send and sign employment contracts electronically.' },
          { title: 'Data Collection', desc: 'Automated collection of NSSA numbers, ZIMRA details, and bank info.' },
          { title: 'Welcome Kits', desc: 'Automatically share company handbooks and policies.' },
          { title: 'Task Tracking', desc: 'Assign onboarding tasks to IT, Finance, and Managers.' }
        ]
      }
    ]
  },
  {
    title: 'Core HR',
    icon: Shield,
    items: [
      { 
        id: 'directory', 
        title: 'Team Directory', 
        content: 'Manage your entire workforce from a single, beautiful interface. Track roles, reporting lines, and employee history. Our directory is designed for quick access and high visibility.',
        keyFeatures: [
          { title: 'Smart Search', desc: 'Find any employee by name, department, or skill instantly.' },
          { title: 'Org Charts', desc: 'Visual representation of your company structure.' },
          { title: 'Profile Management', desc: 'Employees can update their own personal information.' },
          { title: 'Asset Management', desc: 'Track company laptops, phones, and vehicles assigned to staff.' }
        ]
      },
      { 
        id: 'leave', 
        title: 'Leave Management', 
        content: 'Automated leave tracking that handles Zimbabwean public holidays and NEC-specific leave types. Say goodbye to manual spreadsheets and leave forms.',
        keyFeatures: [
          { title: 'Zim Holidays', desc: 'Pre-loaded with all Zimbabwean public holidays.' },
          { title: 'NEC Compliance', desc: 'Configure leave accrual rules based on specific NEC requirements.' },
          { title: 'WhatsApp Requests', desc: 'Employees can apply for leave directly via WhatsApp.' },
          { title: 'Manager Approvals', desc: 'One-click approvals with real-time balance updates.' }
        ]
      }
    ]
  },
  {
    title: 'Payroll & Compliance',
    icon: CreditCard,
    items: [
      { 
        id: 'payroll-engine', 
        title: 'The Payroll Engine', 
        content: 'Automated ZIMRA, NSSA, and NEC calculations. ZivoHR handles the complexity of Zimbabwean payroll so you don\'t have to. Generate accurate payslips in seconds.',
        keyFeatures: [
          { title: 'Tax Calculations', desc: 'Automated PAYE and AIDS Levy calculations based on ZIMRA tables.' },
          { title: 'Statutory Deductions', desc: 'Precise NSSA and NEC levy deductions for every employee.' },
          { title: 'One-Click Payslips', desc: 'Generate and distribute digital payslips via email or WhatsApp.' },
          { title: 'Bank Exports', desc: 'Generate payment files for CBZ, Stanbic, CABS, and EcoCash.' }
        ]
      },
      { 
        id: 'compliance', 
        title: 'Zimbabwean Compliance', 
        content: 'Stay up to date with the latest labor laws and tax regulations in Zimbabwe. ZivoHR is updated automatically whenever ZIMRA or NSSA change their rates.',
        keyFeatures: [
          { title: 'ZIMRA Returns', desc: 'Generate P2 and ITF16 reports automatically.' },
          { title: 'NSSA Submissions', desc: 'Export NSSA monthly return files in the required format.' },
          { title: 'Labour Act Support', desc: 'Templates and workflows aligned with the Labour Act of Zimbabwe.' },
          { title: 'Audit Logs', desc: 'Full history of all payroll and HR changes for audit purposes.' }
        ]
      }
    ]
  },
  {
    title: 'Integrations',
    icon: Globe,
    items: [
      { 
        id: 'whatsapp', 
        title: 'WhatsApp Integration', 
        content: 'The "Africa-first" approach to HR. Employees can request leave, view payslips, and update their profiles directly from WhatsApp without needing a computer.',
        keyFeatures: [
          { title: 'Leave via Chat', desc: 'Apply for leave using simple WhatsApp commands.' },
          { title: 'Payslip Delivery', desc: 'Securely receive payslips as PDFs in your WhatsApp chat.' },
          { title: 'HR Bot', desc: '24/7 AI-powered assistant to answer basic HR queries.' },
          { title: 'Zero Data', desc: 'Works even on low-bandwidth connections.' }
        ]
      }
    ]
  },
  {
    title: 'Performance & Engagement',
    icon: BarChart3,
    items: [
      {
        id: 'performance-reviews',
        title: 'Performance Reviews',
        content: 'Move beyond annual reviews with continuous feedback. ZivoHR supports 360-degree feedback, OKRs, and goal tracking tailored for Zimbabwean business cycles.',
        keyFeatures: [
          { title: 'OKR Tracking', desc: 'Align individual goals with company objectives.' },
          { title: '360 Feedback', desc: 'Collect insights from peers, managers, and direct reports.' },
          { title: 'Review Templates', desc: 'Pre-built templates for probation, annual, and project reviews.' },
          { title: 'Development Plans', desc: 'Track employee growth and skill acquisition over time.' }
        ]
      },
      {
        id: 'engagement',
        title: 'Employee Engagement',
        content: 'Build a vibrant company culture with Kudos and Surveys. Recognize top performers and gather honest feedback to improve your workplace.',
        keyFeatures: [
          { title: 'Kudos Wall', desc: 'A public space to celebrate wins and say thank you.' },
          { title: 'Pulse Surveys', desc: 'Quick, anonymous surveys to gauge team sentiment.' },
          { title: 'Rewards Integration', desc: 'Connect kudos to local rewards like airtime or vouchers.' },
          { title: 'Anniversary Alerts', desc: 'Never miss a birthday or work anniversary again.' }
        ]
      }
    ]
  },
  {
    title: 'Resources & Security',
    icon: Lock,
    items: [
      {
        id: 'resource-library',
        title: 'HR Resource Library',
        content: 'Access a curated collection of templates and guides specifically for the Zimbabwean market. From the Labour Act to NEC handbooks, everything is at your fingertips.',
        keyFeatures: [
          { title: 'Labour Act Guide', desc: 'Simplified explanations of the Zimbabwean Labour Act.' },
          { title: 'Contract Templates', desc: 'Legally vetted templates for various employment types.' },
          { title: 'NEC Handbooks', desc: 'Access to the latest NEC regulations for your industry.' },
          { title: 'Policy Templates', desc: 'Ready-to-use policies for remote work, leave, and conduct.' }
        ]
      },
      {
        id: 'security',
        title: 'Security & Privacy',
        content: 'Your data is protected with bank-grade encryption. We comply with international data protection standards and local privacy requirements.',
        keyFeatures: [
          { title: 'Data Encryption', desc: 'All data is encrypted at rest and in transit.' },
          { title: 'Regular Backups', desc: 'Automated daily backups to ensure data persistence.' },
          { title: 'Audit Trails', desc: 'Detailed logs of all administrative actions.' },
          { title: 'Access Controls', desc: 'Role-based access to ensure data is only seen by authorized staff.' }
        ]
      }
    ]
  }
];

export default function Documentation({ onBack }: DocumentationProps) {
  const [activeSection, setActiveSection] = React.useState('intro');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const allItems = DOC_SECTIONS.flatMap(s => s.items);
  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItem = allItems.find(i => i.id === activeSection) || allItems[0];

  return (
    <div className="min-h-screen bg-white text-space-gray">
      {/* Header */}
      <nav className="fixed top-0 w-full glass z-50 px-6 py-4 flex items-center justify-between border-b border-black/[0.05]">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-apple-gray rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold">Z</div>
            <span className="text-xl font-bold tracking-tight">ZivoHR <span className="text-gray-400 font-medium ml-2">Docs</span></span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-apple-gray/50 border border-black/[0.05] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/20 w-64"
            />
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-apple-gray rounded-xl transition-all text-gray-500"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden pt-20 bg-white overflow-y-auto"
          >
            <div className="p-6 space-y-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-apple-gray/50 border border-black/[0.05] rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div className="space-y-8">
                {DOC_SECTIONS.map((section) => (
                  <div key={section.title} className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <section.icon className="w-3 h-3" />
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveSection(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all",
                            activeSection === item.id 
                              ? "bg-accent/5 text-accent" 
                              : "text-gray-500 hover:text-space-gray hover:bg-apple-gray/50"
                          )}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 flex max-w-7xl mx-auto min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-black/[0.05] p-6 hidden lg:block overflow-y-auto h-[calc(100vh-6rem)] sticky top-24">
          <div className="space-y-8">
            {DOC_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <section.icon className="w-3 h-3" />
                  {section.title}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        activeSection === item.id 
                          ? "bg-accent/5 text-accent" 
                          : "text-gray-500 hover:text-space-gray hover:bg-apple-gray/50"
                      )}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 md:p-12 lg:max-w-3xl">
          <AnimatePresence mode="wait">
            {searchTerm ? (
              <motion.div
                key="search-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/10">
                    Search Results
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-space-gray">
                    Found {filteredItems.length} results for "{searchTerm}"
                  </h1>
                </div>

                <div className="space-y-4">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setSearchTerm('');
                        }}
                        className="w-full text-left p-6 rounded-2xl bg-white border border-black/[0.05] hover:border-accent/30 hover:shadow-xl transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg group-hover:text-accent transition-colors">{item.title}</h3>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-accent transition-all group-hover:translate-x-1" />
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{item.content}</p>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-20 space-y-4">
                      <div className="w-16 h-16 bg-apple-gray rounded-full flex items-center justify-center mx-auto text-gray-400">
                        <Search className="w-8 h-8" />
                      </div>
                      <p className="text-gray-500 font-medium">No results found for your search.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/5 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/10">
                  Documentation
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-space-gray leading-tight">
                  {currentItem.title}
                </h1>
              </div>

              <div className="prose prose-gray max-w-none">
                <p className="text-xl text-gray-500 leading-relaxed">
                  {currentItem.content}
                </p>
                
                <div className="h-[1px] w-full bg-black/[0.05] my-12" />
                
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentItem.keyFeatures?.map((feature, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-apple-gray/30 border border-black/[0.03] flex items-start gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-accent shadow-sm">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{feature.title}</p>
                          <p className="text-xs text-gray-500">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-12 p-8 rounded-[2.5rem] bg-accent text-white relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-bold">Need more help?</h3>
                    <p className="text-white/80">Our support team is available 24/7 to help you with any questions.</p>
                    <button className="bg-white text-accent px-6 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all">
                      Contact Support
                    </button>
                  </div>
                  <Sparkles className="absolute -top-4 -right-4 w-32 h-32 text-white/10" />
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-12 border-t border-black/[0.05]">
                <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-space-gray transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                <button className="flex items-center gap-2 text-sm font-bold text-accent hover:gap-3 transition-all">
                  Next Section
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </main>

        {/* Right Sidebar - On this page */}
        <aside className="w-64 p-6 hidden xl:block overflow-y-auto h-[calc(100vh-6rem)] sticky top-24">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">On this page</p>
            <div className="space-y-2">
              <a href="#" className="block text-xs font-medium text-accent">Overview</a>
              <a href="#" className="block text-xs font-medium text-gray-500 hover:text-space-gray">Key Features</a>
              <a href="#" className="block text-xs font-medium text-gray-500 hover:text-space-gray">Implementation</a>
              <a href="#" className="block text-xs font-medium text-gray-500 hover:text-space-gray">Best Practices</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

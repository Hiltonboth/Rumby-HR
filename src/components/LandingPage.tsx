import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, Users, BarChart3, ChevronRight, Star, CheckCircle2, ChevronDown, CreditCard, Menu, X, MessageCircle, Sparkles, FileText, Heart, PenTool, Book, Moon, Sun, Download } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';
import { useTheme } from './ThemeContext';

const OverlappingInitials = ({ items, className }: { items: { name: string, color: string, img?: string }[], className?: string }) => {
  return (
    <div className={cn("flex -space-x-4 overflow-hidden p-2 justify-center", className)}>
      {items.map((item, i) => (
        <motion.div 
          key={i}
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="relative group"
        >
          <div 
            className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center text-sm md:text-lg font-black text-white transition-all group-hover:scale-110 group-hover:z-10 cursor-pointer overflow-hidden"
            style={{ backgroundColor: item.color }}
          >
            {item.img ? (
              <img src={item.img} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              item.name.split(' ').map(n => n[0]).join('')
            )}
          </div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
            {item.name}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onDocumentation: () => void;
  user?: any;
  onGoToDashboard?: () => void;
}

const FEATURE_TABS = [
  { id: 'hiring', icon: '👥', label: 'Hiring', title: 'Hiring & Onboarding', sub: 'Find the best talent and give them a world-class first day.' },
  { id: 'core', icon: '🛡️', label: 'Core HR', title: 'Core HR & Dashboard', sub: 'Your single source of truth for all employee data.' },
  { id: 'payroll', icon: '💳', label: 'Payroll', title: 'Payroll & Expense', sub: 'Automate your payroll and manage expenses without the headache.' },
  { id: 'performance', icon: '📊', label: 'Performance', title: 'Performance & Development', sub: 'Nurture your talent with continuous feedback and growth paths.' },
  { id: 'esignature', icon: '✍️', label: 'E-Signature', title: 'Secure E-Signatures', sub: 'Send, sign, and store documents securely and legally.' },
  { id: 'engagement', icon: '⭐', label: 'Engagement', title: 'Employee Engagement', sub: 'Listen to your employees and build a workplace they love.' }
];

const TOOLS_TABS = [
  { id: 'automation', icon: '⚙️', label: 'Automation', title: 'HR Automation', sub: 'Custom workflows for any HR process. From leave approvals to asset requests.' },
  { id: 'bank', icon: '🏦', label: 'Banking', title: 'Bank Export Engine', sub: 'Ready-to-use export files for CABS, Nedbank, and many more Zimbabwean banks.' },
  { id: 'vault', icon: '🔒', label: 'Vault', title: 'The Vault', sub: 'Encrypted storage for employee contracts, IDs, and sensitive documents.' },
  { id: 'asset', icon: '💻', label: 'IT Asset', title: 'Asset & IT Shield', sub: 'Track laptops, hardware, and software licenses with full lifecycle management.' },
  { id: 'api', icon: '🔌', label: 'API', title: 'Expert API', sub: 'Connect ZivoHR with your existing ERP or accounting software seamlessly.' },
  { id: 'security', icon: '🔐', label: 'Security', title: 'Security First', sub: 'Enterprise-grade encryption and secure cloud infrastructure for your data.' }
];

const LIBRARY_TABS = [
  { id: 'contracts', icon: '📄', label: 'Contracts', title: 'Employment Contracts', sub: 'Standard and fixed-term contract templates compliant with the Labor Act.' },
  { id: 'policy', icon: '🛡️', label: 'Policy', title: 'HR Policy Manual', sub: 'A complete guide to workplace policies, from leave to disciplinary procedures.' },
  { id: 'review', icon: '📊', label: 'Reviews', title: 'Performance Review', sub: 'Templates and frameworks for effective employee evaluations.' },
  { id: 'disciplinary', icon: '⚖️', label: 'Discipline', title: 'Disciplinary Code', sub: 'Step-by-step guides for handling workplace misconduct fairly.' }
];

const TAB_DURATION = 6000;
const TAB_ORDER = FEATURE_TABS.map(t => t.id);
const TOOLS_ORDER = TOOLS_TABS.map(t => t.id);
const LIBRARY_ORDER = LIBRARY_TABS.map(t => t.id);

export default function LandingPage({ onGetStarted, onLogin, onDocumentation, user, onGoToDashboard }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState('hiring');
  const [progress, setProgress] = useState(0);
  
  const [activeToolsTab, setActiveToolsTab] = useState('automation');
  const [toolsProgress, setToolsProgress] = useState(0);

  const [activeLibraryTab, setActiveLibraryTab] = useState('contracts');
  const [libraryProgress, setLibraryProgress] = useState(0);

  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const laborCases = [
    { 
      t: 'Retrenchment Procedures', 
      c: 'Nyamande & Anor v Zuva Petroleum', 
      d: 'A landmark case that redefined termination on notice, leading to immediate legislative reforms in Zimbabwean labor law.', 
      cat: 'Termination', 
      judge: 'Hon. Justice Makarau',
      av: 'https://api.dicebear.com/9.x/micah/svg?seed=Justice'
    },
    { 
      t: 'Fixed Term Contracts', 
      c: 'Magodora & Ors v Care International', 
      d: 'Analysis of legitimate expectation of renewal and strict interpretation of fixed-term contracts in the Zimbabwean context.', 
      cat: 'Contracts', 
      judge: 'Advocate L. Uriri',
      av: 'https://api.dicebear.com/9.x/micah/svg?seed=Legal'
    },
    { 
      t: 'Unfair Dismissal', 
      c: 'Zimasco v Marikano', 
      d: 'Detailed exploration of procedural versus substantive fairness and the Labor Court powers in reinstatement.', 
      cat: 'Discipline', 
      judge: 'Dr. G. Madhuku',
      av: 'https://api.dicebear.com/9.x/micah/svg?seed=Expert'
    },
    { 
      t: 'Salaries & Benefits', 
      c: 'Dube v PSMAS', 
      d: 'Critical analysis of collective bargaining agreements and the employer capability to vary salaries unilaterally.', 
      cat: 'Remuneration', 
      judge: 'Hon. Justice Gwaunza',
      av: 'https://api.dicebear.com/9.x/micah/svg?seed=Gwaunza'
    },
    { 
      t: 'Constructive Dismissal', 
      c: 'Chirimuuta v ZUPCO', 
      d: 'Examines the high threshold for proving employer-forced resignation in the Supreme Court.', 
      cat: 'Termination', 
      judge: 'Hon. Justice Hlatshwayo',
      av: 'https://api.dicebear.com/9.x/micah/svg?seed=Hlatshwayo'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCaseIndex((prev) => (prev + 1) % laborCases.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [laborCases.length]);

  // ─── WHATSAPP CHAT LOGIC ───
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatInput, setChatInput] = useState('Type a message...');
  const waSectionRef = useRef<HTMLElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const chatIdxRef = useRef(0);
  const chatStartedRef = useRef(false);

  const conversation = [
    { type:'user', sender:'Farai Sithole', text:'Hi, can I get my payslip for March?', time:'10:44 AM' },
    { type:'typing', delay: 950 },
    { type:'bot',  sender:'ZivoHR', text:'Sure! Here is your March payslip in PDF format. 📄', time:'10:44 AM', pdf:true },
    { type:'user', sender:'Farai Sithole', text:'Thanks! How many leave days do I have left?', time:'10:45 AM' },
    { type:'typing', delay: 900 },
    { type:'bot',  sender:'ZivoHR', text:'You have 12 annual leave days remaining for 2026. 🗓️', time:'10:45 AM' },
    { type:'user', sender:'Farai Sithole', text:'Can I request leave for next week?', time:'10:46 AM' },
    { type:'typing', delay: 1000 },
    { type:'bot',  sender:'ZivoHR', text:'Of course! Tap below to submit a leave request — your manager will be notified instantly. ✅', time:'10:46 AM' },
  ];

  const runChat = async () => {
    if (chatIdxRef.current >= conversation.length) {
      chatIdxRef.current = 0;
      await new Promise(r => setTimeout(r, 2500));
      setChatMessages([]);
      setChatInput('Type a message...');
      runChat();
      return;
    }

    const msg = conversation[chatIdxRef.current];
    chatIdxRef.current++;

    if (msg.type === 'typing') {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, msg.delay || 900));
      setIsTyping(false);
      runChat();
    } else if (msg.type === 'user') {
      let typed = '';
      setChatInput('');
      for (let i = 0; i < msg.text.length; i++) {
        typed += msg.text[i];
        setChatInput(typed);
        await new Promise(r => setTimeout(r, 32));
      }
      await new Promise(r => setTimeout(r, 300));
      setChatInput('Type a message...');
      setChatMessages(prev => [...prev, msg]);
      await new Promise(r => setTimeout(r, 700));
      runChat();
    } else {
      setChatMessages(prev => [...prev, msg]);
      await new Promise(r => setTimeout(r, 1200));
      runChat();
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !chatStartedRef.current) {
        chatStartedRef.current = true;
        setTimeout(runChat, 400);
      }
    }, { threshold: 0.35 });

    if (waSectionRef.current) observer.observe(waSectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Feature Tabs Progress
      setProgress(prev => {
        if (prev >= 100) {
          setActiveFeatureTab(current => {
            const nextIdx = (TAB_ORDER.indexOf(current) + 1) % TAB_ORDER.length;
            return TAB_ORDER[nextIdx];
          });
          return 0;
        }
        return prev + 1;
      });

      // Tools Tabs Progress
      setToolsProgress(prev => {
        if (prev >= 100) {
          setActiveToolsTab(current => {
            const nextIdx = (TOOLS_ORDER.indexOf(current) + 1) % TOOLS_ORDER.length;
            return TOOLS_ORDER[nextIdx];
          });
          return 0;
        }
        return prev + 1;
      });

      // Library Tabs Progress
      setLibraryProgress(prev => {
        if (prev >= 100) {
          setActiveLibraryTab(current => {
            const nextIdx = (LIBRARY_ORDER.indexOf(current) + 1) % LIBRARY_ORDER.length;
            return LIBRARY_ORDER[nextIdx];
          });
          return 0;
        }
        return prev + 1;
      });
    }, TAB_DURATION / 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      const orb1 = document.querySelector('.orb1') as HTMLElement;
      const orb2 = document.querySelector('.orb2') as HTMLElement;
      const orb3 = document.querySelector('.orb3') as HTMLElement;
      if (orb1) orb1.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
      if (orb2) orb2.style.transform = `translate(${-x * 0.3}px, ${-y * 0.3}px)`;
      if (orb3) orb3.style.transform = `translate(${x * 0.4}px, ${y * 0.2}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    if (user) onGoToDashboard?.();
    else onLogin();
  };

  const handleTalkToSales = () => {
    window.open('https://wa.me/263772240081?text=Hi!%20I%20want%20to%20talk%20to%20sales%20about%20ZivoHR.', '_blank');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden ${isDark ? 'dark' : ''}`}>
      {/* ─── MESH BG ─── */}
      <div className="mesh-bg"></div>
      <div className="orb orb1"></div>
      <div className="orb orb2"></div>
      <div className="orb orb3"></div>

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 py-4 md:py-5 border-b backdrop-blur-xl transition-all duration-300 ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-[#f0f0ff]/85 border-indigo-500/12'}`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollToSection('hero')}>
          <Logo className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-110" />
          <div className={`text-xl md:text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Zivo<span className="text-indigo-500">HR</span></div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-7">
          <div className="hidden lg:flex items-center gap-7">
            <button onClick={() => scrollToSection('features')} className="text-[13px] font-bold text-indigo-500 hover:opacity-70 transition-opacity">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="text-[13px] font-bold text-indigo-500 hover:opacity-70 transition-opacity">Pricing</button>
            <button onClick={onDocumentation} className="text-[13px] font-bold text-indigo-500 hover:opacity-70 transition-opacity">Documentation</button>
          </div>
          
          <button onClick={toggleTheme} className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg transition-all hover:scale-110 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white/75 border-indigo-500/12 shadow-sm'}`}>
            {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>
          
          <button onClick={handleGetStarted} className="px-3.5 md:px-6 py-2.5 rounded-full bg-indigo-600 text-white font-black text-[11px] md:text-sm shadow-indigo-600/25 shadow-lg hover:-translate-y-0.5 transition-all">
            {user ? 'Dashboard' : 'Sign Up'}
          </button>
          
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden w-10 h-10 rounded-xl border flex items-center justify-center transition-all bg-indigo-500/5 border-indigo-500/10">
            {isMobileMenuOpen ? <X className="w-5 h-5 text-indigo-500" /> : <Menu className="w-5 h-5 text-indigo-500" />}
          </button>
        </div>
      </nav>

      {/* ─── MOBILE MENU ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn("fixed inset-0 z-40 lg:hidden flex flex-col pt-24 px-6 gap-6", isDark ? "bg-slate-950" : "bg-white")}
          >
            {[
              { label: 'Features', id: 'features' },
              { label: 'Labor Cases', id: 'labor-cases' },
              { label: 'Pricing', id: 'pricing' },
              { label: 'FAQ', id: 'faq' }
            ].map((link) => (
              <button 
                key={link.id} 
                onClick={() => scrollToSection(link.id)}
                className={cn("text-2xl font-black text-left", isDark ? "text-white" : "text-slate-900")}
              >
                {link.label}
              </button>
            ))}
            <div className="mt-4 pt-10 border-t border-indigo-500/10 flex flex-col gap-4">
              <button onClick={onLogin} className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black">Login to Account</button>
              <button onClick={onDocumentation} className={cn("w-full py-5 rounded-2xl border font-black", isDark ? "border-white/10 text-white" : "border-indigo-500/10 text-indigo-600")}>Read Docs</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── HERO ─── */}
      <section id="hero" className="relative pt-32 md:pt-48 pb-16 md:pb-32 px-4 md:px-6 max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.1fr] gap-12 md:gap-20 items-center overflow-hidden lg:overflow-visible">
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/8 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-8"
          >
            ✦ Trusted by leading African companies
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-4xl md:text-6xl xl:text-8xl font-black leading-[1.02] tracking-tight mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Your <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 bg-clip-text text-transparent">Integrated HR Platform</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg md:text-xl xl:text-2xl leading-relaxed max-w-[500px] mb-12 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            ZivoHR is the high-integrity platform built for the Zimbabwean market. Manage payroll, hiring, and compliance — all from one dashboard.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button onClick={handleGetStarted} className="px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl bg-indigo-600 text-white font-black text-sm md:text-lg shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">Start Free Trial</button>
            <button onClick={handleTalkToSales} className={cn("px-6 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl border font-black text-sm md:text-lg flex items-center justify-center gap-2 hover:bg-white/5 transition-all", isDark ? "border-white/10 text-white" : "border-indigo-500/10 text-indigo-600")}>Book Demo →</button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-x-6 gap-y-3 mt-10"
          >
            {['Smart Recruitment', 'Easy Payroll', 'Employee Engagement'].map(f => (
              <div key={f} className="flex items-center gap-2 text-[12px] font-black text-indigo-500">
                <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px]">✓</div>
                {f}
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Dashboard Frame Simulation */}
          <div className={`rounded-[2rem] overflow-hidden shadow-2xl border transition-colors ${isDark ? 'bg-slate-900 border-slate-800 shadow-indigo-500/10' : 'bg-white border-indigo-500/12 shadow-indigo-500/18'}`}>
            <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-[#f8f7ff]/90 border-indigo-500/12'}`}>
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#fc5c57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27c840]" />
              </div>
              <div className={`flex-1 mx-3 px-4 py-1 rounded-lg text-[10px] font-bold text-center border ${isDark ? 'bg-slate-950/40 border-slate-700 text-indigo-400' : 'bg-indigo-500/6 border-indigo-500/10 text-indigo-500'}`}>app.zivohr.co.zw</div>
            </div>
            
            <div className={`grid grid-cols-[70px_1fr_100px] min-h-[300px] ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
              {/* Sidebar */}
              <div className={`p-3 space-y-2 border-r ${isDark ? 'border-slate-800' : 'border-indigo-500/8'}`}>
                {[70, 100, 80, 90, 65].map((w, i) => (
                  <div key={i} className={`h-6 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-indigo-500/7'}`} style={{ width: `${w}%` }} />
                ))}
              </div>
              
              {/* Main Content */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { l: 'Employees', v: '124' },
                    { l: 'Jobs', v: '8', full: 'Active Jobs' },
                    { l: 'Rating', v: '94%', full: 'Satisfaction' }
                  ].map(s => (
                    <div key={s.l} className={`p-2.5 md:p-3 rounded-xl border flex flex-col justify-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-indigo-500/7 to-purple-500/4 border-indigo-500/10'}`}>
                      <div className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-1 truncate">{s.full || s.l}</div>
                      <div className={`text-base md:text-xl font-black ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>{s.v}</div>
                    </div>
                  ))}
                </div>
                
                <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#f8f7ff]/80 border-indigo-500/8'}`}>
                  <div className="text-[8px] font-black uppercase tracking-widest text-indigo-400 mb-3">Payroll Overview</div>
                  <div className="flex items-end gap-1.5 h-14 px-1">
                    {[40, 70, 55, 85, 60, 80, 50, 95].map((h, i) => (
                      <div key={i} className={`flex-1 rounded-t-[3px] ${i === 7 ? 'bg-gradient-to-t from-indigo-500 to-purple-500' : isDark ? 'bg-indigo-500/30' : 'bg-indigo-500/20'}`} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {[
                    { n: 'Tendai Moyo', r: 'Senior Dev', s: 'Active', c: '#10b981' },
                    { n: 'Rudo Chikwanda', r: 'HR Manager', s: 'On Leave', c: '#f59e0b' }
                  ].map(e => (
                    <div key={e.n} className={`flex items-center gap-2.5 p-2 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#f8f7ff]/80 border-indigo-500/5'}`}>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white">{e.n[0]}</div>
                      <div className="flex-1">
                        <div className={`text-[10px] font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{e.n}</div>
                        <div className="text-[8px] font-bold text-slate-500">{e.r}</div>
                      </div>
                      <div className="px-2 py-0.5 rounded-full text-[8px] font-black" style={{ backgroundColor: `${e.c}15`, color: e.c }}>{e.s}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right Panel */}
              <div className={`p-3 space-y-3 border-l ${isDark ? 'border-slate-800' : 'border-indigo-500/8'}`}>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="text-[8px] font-black uppercase tracking-widest opacity-75 mb-1">Top Payroll</div>
                    <div className="text-xl font-black">$24,560</div>
                    <div className="text-[8px] opacity-60 mt-0.5">March 2026</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent -translate-x-[200%] animate-[shimmer_3s_infinite]" />
                </div>
                {[1,2,3].map(i => (
                  <div key={i} className={`p-2 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#f8f7ff]/90 border-indigo-500/8'}`}>
                    <div className={`h-1.5 rounded-full mb-1.5 ${isDark ? 'bg-slate-800' : 'bg-indigo-500/10'}`} style={{ width: i === 1 ? '70%' : '50%' }} />
                    <div className={`h-1 rounded-full ${isDark ? 'bg-slate-950' : 'bg-indigo-500/5'}`} style={{ width: i === 1 ? '40%' : '30%' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FEATURES TABS ─── */}
      <section 
        id="features" 
        className="tabs-section"
      >
        <div className="section-inner">
          <div className="text-center mb-10 reveal visible">
            <h2 className={cn("section-title mb-4", isDark ? "text-white" : "text-slate-900")}>
              Everything you need. <span className="text-indigo-300">Nothing you don't.</span>
            </h2>
          </div>
          
          <div className="tabs-nav reveal delay-1 visible">
            {FEATURE_TABS.map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveFeatureTab(tab.id as any); setProgress(0); }}
                className={cn("tab-btn", activeFeatureTab === tab.id && "active")}
              >
                {tab.icon} {tab.label}
                {activeFeatureTab === tab.id && (
                  <div className="tab-progress" style={{ width: `${progress}%`, transition: 'none' }} />
                )}
              </button>
            ))}
          </div>

          <div className="tab-content transition-all">
            {/* ══ HIRING ══ */}
            <div className={cn("tab-panel", activeFeatureTab === 'hiring' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap">👥</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>Hiring & Onboarding</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Find the best talent and give them a world-class first day. Our automated pipelines handle everything from job posting to document signing.</p>
                <ul className="tab-list">
                  {['Applicant Tracking System', 'Custom Onboarding Workflows', 'Electronic Signatures', 'Candidate Portals'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button onClick={onLogin} className="tab-cta">Get Started with Hiring →</button>
              </div>
              <div className="visual-panel">
                <div className="vp-label">Active Pipeline</div>
                <div className="hiring-pipeline-stages">
                  {['Applied', 'Screening', 'Interview', 'Offer'].map((s, i) => (
                    <div key={s} className={cn("pip-stage", i === 3 && "filled")}>{s}</div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 transition-all">
                  {[
                    { n: 'Tendai Moyo', r: 'Senior Frontend Dev', b: 'Interview', bc: 'badge-interview', i: 0 },
                    { n: 'Wei Chen', r: 'Backend Engineer', b: 'Screening', bc: 'badge-screening', i: 1 },
                    { n: 'Sarah O\'Brien', r: 'Product Designer', b: 'Offer', bc: 'badge-offer', i: 2 }
                  ].map((row) => (
                    <div key={row.n} className="hiring-row animate-in slide-in-from-left duration-500" style={{ animationDelay: `${row.i * 0.1}s` }}>
                      <div className="w-9 h-9 rounded-full bg-indigo-500 transition-all flex items-center justify-center overflow-hidden">
                         <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${row.n}&backgroundColor=${row.i === 0 ? '6366F1' : row.i === 1 ? '8B5CF6' : '4338ca'}`} alt={row.n} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className={cn("hire-name", isDark ? "text-white" : "text-slate-900")}>{row.n}</div>
                        <div className="hire-role">{row.r}</div>
                      </div>
                      <span className={cn("badge", row.bc)}>{row.b}</span>
                    </div>
                  ))}
                </div>
                <div className="hire-stats mt-2">
                  {[
                    { val: '12', lbl: 'Applied' },
                    { val: '6', lbl: 'Screen' },
                    { val: '3', lbl: 'Interview' },
                    { val: '1', lbl: 'Offer', color: '#059669' }
                  ].map(stat => (
                    <div key={stat.lbl} className="hire-stat">
                      <div className="hire-stat-val" style={stat.color ? { color: stat.color } : {}}>{stat.val}</div>
                      <div className="hire-stat-lbl">{stat.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══ CORE HR ══ */}
            <div className={cn("tab-panel", activeFeatureTab === 'core' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap">🛡️</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>Core HR & Dashboard</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Your single source of truth for all employee data. Secure, compliant, and accessible from anywhere.</p>
                <ul className="tab-list">
                  {['Centralized Employee Directory', 'Document Management', 'Custom HR Workflows', 'Compliance Tracking'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button className="tab-cta">Manage Your Team →</button>
              </div>
              <div className="visual-panel">
                <div className="vp-label">Employee Directory</div>
                <div className="core-grid">
                  {[
                    { seed: 'EmpA', color: '#6366F1' },
                    { seed: 'EmpB', color: '#8B5CF6' },
                    { seed: 'EmpC', color: '#4338ca' },
                    { seed: 'EmpD', color: '#a78bfa' }
                  ].map((emp, i) => (
                    <div key={emp.seed} className="core-emp-card animate-in zoom-in duration-500" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="core-active-dot" style={i === 2 ? { background: '#fbbf24' } : {}}></div>
                      <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-indigo-500/20">
                         <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${emp.seed}&backgroundColor=${emp.color.replace('#','')}`} alt="Employee" className="w-full h-full object-cover" />
                      </div>
                      <div className="core-name-bar"></div>
                      <div className="core-role-bar"></div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { val: '124', lbl: 'Employees', color: '#6366F1' },
                    { val: '98%', lbl: 'Compliance', color: '#059669' },
                    { val: '8', lbl: 'Depts', color: '#8B5CF6' }
                  ].map(stat => (
                    <div key={stat.lbl} className={cn("text-center p-2 rounded-xl border", isDark ? "bg-slate-900/50 border-white/5" : "bg-white border-black/[0.05]")}>
                      <div className="text-xl font-black" style={{ color: stat.color }}>{stat.val}</div>
                      <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 opacity-70">{stat.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══ PAYROLL ══ */}
            <div className={cn("tab-panel", activeFeatureTab === 'payroll' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap">💳</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>Payroll & Expense</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Automate your payroll and manage expenses without the headache. Seamless integrations with your favorite tools.</p>
                <ul className="tab-list">
                  {['Automated Payroll Processing', 'Expense Reimbursements', 'Tax Compliance', 'Benefits Administration'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button className="tab-cta">Automate Payroll →</button>
              </div>
              <div className="visual-panel">
                <div className="vp-label">Payroll Overview</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="payroll-hero">
                    <div className="shimmer-bar"></div>
                    <div className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Total Payout</div>
                    <div className="text-2xl font-black">$24,560</div>
                    <div className="text-[9px] opacity-60 mt-1">March 2026</div>
                  </div>
                  <div className="payroll-mini flex flex-col justify-center">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Employees</div>
                    <div className="text-2xl font-black text-indigo-500">124</div>
                    <div className="text-[9px] text-emerald-500 font-bold">All paid ✓</div>
                  </div>
                </div>
                <div className={cn("rounded-2xl border p-4", isDark ? "bg-slate-950/50 border-white/5" : "bg-white border-black/[0.05]")}>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Monthly Trend</div>
                  <div className="trend-bars">
                    {[58, 74, 64, 84, 69, 100].map((h, i) => (
                      <div 
                        key={i} 
                        className={cn("trend-bar", i === 5 ? "bg-gradient-to-t from-indigo-500 to-purple-500" : "bg-indigo-500/20")}
                        style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 px-1">
                    {['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m, i) => (
                      <div key={m} className={cn("text-[8px] font-bold", i === 5 ? "text-indigo-500" : "text-slate-400")}>{m}</div>
                    ))}
                  </div>
                </div>
                <div className="payroll-rows">
                  {[
                    { n: 'Tendai Moyo', v: '$2,400', i: 0 },
                    { n: 'Liang Wei', v: '$3,100', i: 1 },
                    { n: 'Sarah O\'Brien', v: '$1,980', i: 2 }
                  ].map((row) => (
                    <div key={row.n} className="payroll-row animate-in slide-in-from-left duration-300" style={{ animationDelay: `${row.i * 0.1}s` }}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 overflow-hidden">
                           <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${row.n}&backgroundColor=6366f1`} alt={row.n} className="w-full h-full object-cover" />
                        </div>
                        <span className={cn("text-xs font-bold", isDark ? "text-white" : "text-slate-900")}>{row.n}</span>
                      </div>
                      <span className="text-xs font-black text-indigo-500">{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══ PERFORMANCE ══ */}
            <div className={cn("tab-panel", activeFeatureTab === 'performance' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap">📊</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>Performance & Development</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Nurture your talent with continuous feedback and clear growth paths. Build a culture of excellence.</p>
                <ul className="tab-list">
                  {['OKR & Goal Tracking', '360-Degree Feedback', 'Skill Gap Analysis', 'Performance Reviews'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button className="tab-cta">Boost Performance →</button>
              </div>
              <div className="visual-panel">
                <div className="vp-label">Team Performance</div>
                <div className="perf-chart">
                  {[40, 70, 50, 90, 60, 80].map((h, i) => (
                    <div 
                      key={i} 
                      className={cn("perf-bar-col", i === 3 ? "bg-gradient-to-t from-indigo-500 to-purple-500" : "bg-indigo-500/20")}
                      style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                    ></div>
                  ))}
                </div>
                <div className="perf-metrics">
                  {[
                    { l: 'Engineering', v: '87%', c: 'linear-gradient(90deg,#6366F1,#8B5CF6)' },
                    { l: 'Design', v: '72%', c: 'linear-gradient(90deg,#8B5CF6,#a78bfa)' },
                    { l: 'Operations', v: '94%', c: 'linear-gradient(90deg,#4338ca,#6366F1)' },
                    { l: 'Sales', v: '78%', c: 'linear-gradient(90deg,#059669,#34d399)' }
                  ].map((m, i) => (
                    <div key={m.l} className="perf-metric-row">
                      <div className={cn("perf-metric-label", isDark ? "text-white" : "text-slate-900")}>{m.l}</div>
                      <div className="perf-track">
                        <div className="perf-fill" style={{ width: m.v, background: m.c, animationDelay: `${i * 0.15}s` }}></div>
                      </div>
                      <div className="perf-val">{m.v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  {[
                    { s: 'FeedbackA', c: '6366f1', n: 'Amara N.' },
                    { s: 'FeedbackB', c: '8B5CF6', n: 'Liang W.' },
                    { s: 'FeedbackC', c: '4338ca', n: 'Sarah O.' }
                  ].map((f) => (
                    <div key={f.s} className={cn("flex-1 p-2 rounded-xl border flex flex-col gap-1.5", isDark ? "bg-slate-900/50 border-white/5" : "bg-white border-black/[0.05]")}>
                      <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${f.s}&backgroundColor=${f.c}&scale=90&radius=50`} className="w-7 h-7 rounded-full" alt="" />
                      <div className={cn("text-[10px] font-black", isDark ? "text-white" : "text-slate-900")}>{f.n}</div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => <div key={s} className={cn("w-1.5 h-1.5 rounded-full", s <= 4 ? "bg-amber-400" : "bg-slate-200")}></div>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══ E-SIGNATURE ══ */}
            <div className={cn("tab-panel", activeFeatureTab === 'esignature' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg text-white">✍️</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>Secure E-Signatures</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Send, sign, and store documents securely. No more printing, scanning, or mailing contracts. Fully legally binding.</p>
                <ul className="tab-list">
                  {['Legally Binding Signatures', 'Custom Signature Templates', 'Automated Signing Reminders', 'Audit Trail & Verification'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button className="tab-cta">Start Signing Documents →</button>
              </div>
              <div className="esig-visual">
                <div className="esig-grid"></div>
                <div className="esig-badge badge-signed">✅ All signatures collected</div>
                <div className="esig-badge badge-verified">🔒 Audit Trail Active</div>
                <div className="esig-node esig-node-left">🖥️</div>
                <div className="esig-node esig-node-right">📱</div>
                <div className="esig-connector esig-connector-left"></div>
                <div className="esig-connector esig-connector-right"></div>
                <div className="doc-stack">
                  <div className="doc doc-back1">
                    <div className="doc-line long accent"></div><div className="doc-line medium"></div><div className="doc-line long"></div><div className="doc-line short"></div>
                  </div>
                  <div className="doc doc-back2">
                    <div className="doc-line long accent"></div><div className="doc-line short"></div><div className="doc-line medium"></div><div className="doc-line long"></div>
                  </div>
                  <div className="doc doc-front">
                    <div className="doc-line long accent"></div><div className="doc-line medium"></div><div className="doc-line long"></div><div className="doc-line short"></div>
                    <div className="doc-success">
                      <div className="success-check">✓</div>
                      <div className={cn("success-text", isDark ? "text-white" : "text-slate-900")}>Thank you for signing!</div>
                      <div className="success-sub">Farai will reach out shortly.</div>
                      <div className="sig-cursive">Sithole F.</div>
                    </div>
                  </div>
                  <div className="envelope">
                    <div className="env-body">
                      <div className="env-flap"></div>
                      <div className="env-body-inner">
                        <div className="env-from">From:</div>
                        <div className={cn("env-sender", isDark ? "text-white" : "text-slate-900")}>ZivoHR</div>
                      </div>
                      <div className="env-glow"></div>
                    </div>
                  </div>
                </div>
                <div className="esig-action-tags">
                  {['⚖️ Legally Binding', '📋 Transactions', '🧾 Tax info'].map(tag => (
                    <div key={tag} className={cn("esig-tag shadow-sm", isDark ? "text-white" : "text-slate-900")}>{tag}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══ ENGAGEMENT ══ */}
            <div className={cn("tab-panel", activeFeatureTab === 'engagement' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap">⭐</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>Employee Engagement</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Listen to your employees and build a workplace they love. Pulse surveys, recognition, and internal comms.</p>
                <ul className="tab-list">
                  {['Pulse Surveys', 'Employee Recognition', 'Internal Social Network', 'Case Management'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button className="tab-cta">Engage Your People →</button>
              </div>
              <div className="engage-visual">
                <div className="vp-label">Team Pulse</div>
                <div className="engage-avatars">
                  {[
                    { s: 'EngTendai', c: '6366f1', i: 0 },
                    { s: 'EngJames', c: '059669', i: 1 },
                    { s: 'EngMeiLing', c: 'd97706', i: 2 },
                    { s: 'EngFarai', c: '8B5CF6', i: 3 },
                    { s: 'EngPreeti', c: 'ec4899', i: 4 },
                    { s: 'EngSophie', c: '2563eb', i: 5 }
                  ].map((av) => (
                    <img key={av.s} className="eng-av" style={{ animationDelay: `${av.i * 0.35}s` }} src={`https://api.dicebear.com/9.x/notionists/svg?seed=${av.s}&backgroundColor=${av.c}&scale=90&radius=50`} alt="" />
                  ))}
                </div>
                <div className="engage-score">
                  <div className="engage-score-lbl">Engagement Score</div>
                  <div className="engage-score-val">94%</div>
                  <div className="engage-score-sub text-emerald-500 font-bold">↑ 6% from last month</div>
                  <div className="engage-track-wrap">
                    <div className="engage-track-fill animate-in slide-in-from-left duration-1000" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div className="engage-feed">
                  {[
                    { icon: '🏆', text: 'Rudo received Employee of the Month!', i: 0 },
                    { icon: '📊', text: 'Q1 Pulse Survey — 98% participation', i: 1 },
                    { icon: '🎉', text: 'Tendai hit a 2-year work anniversary!', i: 2 }
                  ].map((card) => (
                    <div key={card.text} className={cn("engage-card animate-in slide-in-from-left duration-500", isDark ? "text-white" : "text-slate-900")} style={{ animationDelay: `${0.1 + card.i * 0.15}s` }}>
                      <span>{card.icon}</span>
                      <div>{card.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUSTED BY ─── */}
      <section className={`border-y transition-colors overflow-hidden ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-white/35 border-indigo-500/12 backdrop-blur-md'}`}>
        <div className="max-w-[1200px] mx-auto px-10 py-10 md:py-14 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-10">Trusted by leading African organizations</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20">
            {['First Horizon', 'NeoX Solar', 'TEI Oils', 'Strategy Connect', 'Bafang Transport'].map(name => (
              <div key={name} className="text-base md:text-xl font-black tracking-tight bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent opacity-60 hover:opacity-100 transition-opacity cursor-default">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BUILT FOR AFRICA ─── */}
      <section className="py-20 md:py-28 px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={`text-3xl md:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Built for <span className="text-indigo-500">the Way Africa Works</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-lg max-w-[520px] mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Everything small and medium-sized businesses need to simplify and scale HR — localized for the African market.
          </motion.p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className={`p-8 md:p-10 rounded-[2.5rem] border transition-all hover:-translate-y-1 ${isDark ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/50' : 'bg-white/75 border-indigo-500/12 shadow-sm hover:shadow-xl'}`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl mb-6">👥</div>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Smart Recruitment</h3>
            <ul className="space-y-3 mb-8">
              {['Customizable Hiring Pipelines', 'AI-Powered Candidate Screening', 'Automated Onboarding Workflows'].map(l => (
                <li key={l} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-500">✓</div>
                  {l}
                </li>
              ))}
            </ul>
            <button className="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-black text-xs hover:opacity-90 transition-opacity">See More →</button>
            
            <div className={`mt-8 rounded-2xl border p-4 h-36 relative overflow-hidden ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-indigo-500/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-indigo-400">ZivoHR</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full">Candidate</span>
              </div>
              <div className="space-y-4">
                {[
                  { n: 'Tendai', c: '6366f1' },
                  { n: 'Rudo', c: '059669' },
                  { n: 'Farai', c: 'f59e0b' }
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 p-0.5 border border-indigo-500/20 overflow-hidden shadow-sm">
                      <img 
                        src={`https://api.dicebear.com/9.x/notionists/svg?seed=${p.n}&backgroundColor=${p.c}&scale=100`} 
                        alt={p.n} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className={`h-2 flex-1 rounded-full ${isDark ? 'bg-slate-800' : 'bg-indigo-500/10'}`} style={{ width: i === 2 ? '50%' : '80%' }} />
                    <div className={`h-2 w-10 rounded-full ${isDark ? 'bg-slate-900' : (i === 1 ? 'bg-indigo-500/40' : 'bg-emerald-500/20')}`} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className={`p-8 md:p-10 rounded-[2.5rem] border transition-all hover:-translate-y-1 ${isDark ? 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/50' : 'bg-white/75 border-indigo-500/12 shadow-sm hover:shadow-xl'}`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl mb-6">💳</div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Payroll & Expense</h3>
            <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-4">Automated Financials</p>
            <ul className="space-y-3 mb-8">
              {['Automated Payroll Processing', 'Expense Reimbursements', 'Tax Compliance', 'Benefits Administration'].map(l => (
                <li key={l} className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-500">✓</div>
                  {l}
                </li>
              ))}
            </ul>
            <button className="px-6 py-2.5 rounded-full bg-indigo-500 text-white font-black text-xs hover:opacity-90 transition-opacity">See More →</button>
            <div className="mt-8 flex items-end gap-1.5 h-16">
              {[40, 75, 50, 90, 65, 80].map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-[4px] ${i === 3 ? 'bg-gradient-to-t from-indigo-500 to-purple-500' : isDark ? 'bg-indigo-500/30' : 'bg-indigo-500/20'}`} style={{ height: `${h}%` }} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── COMPLIANCE BANNER ─── */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="max-w-[1200px] mx-auto rounded-[2.5rem] bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#3730a3] p-10 md:p-16 grid lg:grid-cols-2 gap-12 items-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-400/15 border border-slate-400/20 text-[10px] font-black uppercase tracking-widest text-[#a5b4fc] mb-6">🛡️ Secure & Compliant</div>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">Secure Payroll & Compliance</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-10">Run payroll, manage NSSA contributions, and stay compliant with local labor laws — all in one powerful, easy-to-use platform.</p>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleGetStarted} className="px-8 py-4 rounded-[1rem] bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black shadow-lg shadow-indigo-500/50 hover:-translate-y-0.5 transition-transform">Start Free Trial</button>
              <button onClick={handleTalkToSales} className="px-8 py-4 rounded-[1rem] bg-white/10 border border-white/20 text-white font-black hover:bg-white/20 transition-all">Book a Demo →</button>
            </div>
          </div>
          <div className="flex justify-center items-center relative">
            <div className="w-60 h-60 md:w-80 md:h-80 border border-indigo-400/15 rounded-full flex items-center justify-center animate-[pulse_3s_infinite]">
              <div className="w-48 h-48 md:w-64 md:h-64 border border-indigo-400/20 rounded-full flex items-center justify-center animate-[pulse_3s_infinite_0.5s]">
                <div className="w-32 h-32 md:w-44 md:h-44 border border-indigo-400/25 rounded-full flex items-center justify-center animate-[pulse_3s_infinite_1s]">
                  <div className="text-6xl md:text-7xl">🛡️</div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#a5b4fc]/15 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ─── WHATSAPP SECTION ─── */}
      <section ref={waSectionRef} className="wa-section">
        <div className="wa-banner reveal-scale">
          <div className="wa-text">
            <div className="wa-tag">
              <svg className="wa-logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.444h.005c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.479-8.447zM12.043 21.785h-.004a9.874 9.874 0 01-5.031-1.378l-.361-.214-3.741.976.998-3.648-.235-.374a9.795 9.795 0 01-1.503-5.268c.002-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.892 6.993c-.003 5.45-4.437 9.899-9.892 9.899zM17.48 14.382c-.3-.149-1.768-.869-2.042-.967-.274-.099-.472-.148-.671.15-.199.297-.767.966-.94 1.164-.174.199-.347.223-.647.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="white"/>
              </svg>
              WhatsApp Chat
            </div>
            <h2>Manage HR directly from WhatsApp.</h2>
            <p>Approve leave, view payslips, and answer employee queries without leaving your favorite chat app. Built for the way Africa works.</p>
            <div className="wa-btns">
              <button 
                onClick={() => window.open('https://wa.me/263772240081?text=Hi!%20I%20want%20to%20know%20more%20about%20ZivoHR.', '_blank')}
                className="wa-btn-primary"
              >
                Chat with Us
              </button>
              <button className="wa-btn-outline">Learn More</button>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div className="chat-phone">
              <div className="chat-header">
                <div className="chat-av-logo">ZHR</div>
                <div className="chat-info">
                  <div className="chat-name">ZivoHR</div>
                  <div className="chat-status" id="wa-status">● Online</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.45)" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft:'auto', flexShrink:0 }}>
                  <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.444h.005c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.479-8.447z"/>
                </svg>
              </div>
              <div className="chat-body" ref={chatBodyRef}>
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("wa-msg visible", msg.type === 'user' ? 'wa-msg-user' : 'wa-msg-bot')}>
                    <div className="wa-msg-sender">{msg.sender}</div>
                    {msg.pdf && (
                      <div className="wa-pdf">
                        <div className="wa-pdf-icon">PDF</div>
                        <div>
                          <div className="wa-pdf-name">Payslip_March_2026.pdf</div>
                          <div className="wa-pdf-size">142 KB · PDF Document</div>
                        </div>
                      </div>
                    )}
                    {msg.text}
                    <div className="wa-msg-time">
                      {msg.time}
                      {msg.type === 'bot' && <span className="wa-ticks"> ✓✓</span>}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="wa-typing">
                    <div className="wa-dot"></div>
                    <div className="wa-dot"></div>
                    <div className="wa-dot"></div>
                  </div>
                )}
              </div>
              <div className="chat-input-bar">
                <div className="chat-input-preview">{chatInput}</div>
                <div className="chat-send-btn">→</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-20 md:py-28 px-6 max-w-[1200px] mx-auto text-center scroll-mt-24">
        <h2 className={`text-4xl md:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Simple, <span className="text-indigo-500">Transparent</span> Pricing</h2>
        <p className={`text-lg mb-16 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Choose the plan that's right for your growing team. No hidden fees.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { n: 'Starter (Small)', p: '$30', d: 'Up to 20 employees. Perfect for small teams.', f: ['Up to 20 employees', 'Core HR features', 'Payroll Included', 'Email Support'] },
            { n: 'Starter (Growth)', p: '$50', d: '21+ employees. Scale your operations.', f: ['21+ employees', 'Core HR features', 'Payroll Included', 'Priority Email Support'] },
            { n: 'Pro', p: '$75', d: 'Advanced automation for modern teams.', f: ['All Starter features', 'Performance Reviews', 'Employee Engagement', 'HR Automation'], popular: true },
            { n: 'Exec', p: 'Custom', d: 'Tailor-made solution with expert advice.', f: ['Unlimited employees', 'Specific HR Advice', 'Dedicated Account Manager', 'Custom Integrations'] }
          ].map(plan => (
            <motion.div 
              key={plan.n}
              whileHover={{ y: -5 }}
              className={`p-8 rounded-[2.5rem] border text-left flex flex-col h-full relative overflow-hidden ${plan.popular ? 'border-indigo-500 ring-4 ring-indigo-500/5' : isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-indigo-500/12 shadow-sm'}`}
            >
              {plan.popular && <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest">Popular</div>}
              <h3 className={`text-lg font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.n}</h3>
              <p className="text-[10px] font-bold text-slate-500 mb-6 leading-relaxed">{plan.d}</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.p}</span>
                {plan.p !== 'Custom' && <span className="text-xs font-bold text-slate-500">/mo</span>}
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {plan.f.map(f => (
                  <li key={f} className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                    <div className="w-4 h-4 rounded-full bg-indigo-500/10 flex items-center justify-center text-[8px] text-indigo-500">✓</div>
                    {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={plan.p === 'Custom' ? () => window.open('https://wa.me/263772240081?text=I%20want%20to%20talk%20to%20sales%20about%20the%20Exec%20plan.') : () => window.open('https://wa.me/263772240081?text=Hi!%20I%20want%20to%20subscribe%20to%20the%20' + plan.n + '%20plan.', '_blank')}
                className={`w-full py-4 rounded-2xl font-black text-xs transition-all ${plan.popular ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-indigo-500/5 text-indigo-500 hover:bg-indigo-500/10'}`}
              >
                {plan.p === 'Custom' ? 'Talk to Sales' : 'Get Started Now'}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── MORE POWERFUL TOOLS TABS ─── */}
      <section className="tabs-section">
        <div className="section-inner">
          <div className="text-center mb-10">
            <h2 className={cn("section-title mb-4", isDark ? "text-white" : "text-slate-900")}>
              More Powerful <span className="text-indigo-300">Tools.</span>
            </h2>
            <p className={cn("text-lg", isDark ? "text-slate-400" : "text-slate-500")}>Everything else you need to run a modern, high-integrity organization.</p>
          </div>

          <div className="tabs-nav mb-12">
            {TOOLS_TABS.map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setActiveToolsTab(tab.id as any); setToolsProgress(0); }}
                className={cn("tab-btn", activeToolsTab === tab.id && "active")}
              >
                {tab.icon} {tab.label}
                {activeToolsTab === tab.id && (
                  <div className="tab-progress" style={{ width: `${toolsProgress}%`, transition: 'none' }} />
                )}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {/* ══ AUTOMATION ══ */}
            <div className={cn("tab-panel", activeToolsTab === 'automation' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap bg-indigo-500/10 text-indigo-500">⚙️</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>HR Automation</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Automate repetitive tasks with custom workflows. From leave approvals to asset requests, build the process that works for you.</p>
                <ul className="tab-list">
                  {['Conditional Logic Gateways', 'Multi-level Approvals', 'SLA Tracking', 'Automated Notifications'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button className="tab-cta">Build Your First Workflow →</button>
              </div>
              <div className="visual-panel !p-0 overflow-hidden relative group">
                <div className="absolute inset-0 bg-indigo-500/[0.02] grid-bg opacity-30"></div>
                
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
                  {/* Step 1: Trigger */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "w-full max-w-[260px] p-4 rounded-2xl border flex items-center gap-4 relative overflow-hidden backdrop-blur-md",
                      isDark ? "bg-slate-900/80 border-indigo-500/20 shadow-2xl" : "bg-white/80 border-indigo-500/10 shadow-xl shadow-indigo-500/5 text-slate-900"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-black tracking-tight">Onboarding Trigger</div>
                      <div className="text-[9px] opacity-60 font-bold">New Employee: J. Doe</div>
                    </div>
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} 
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" 
                    />
                  </motion.div>

                  {/* Connecting Pulse Line */}
                  <div className="h-12 w-[2px] bg-indigo-500/10 relative">
                    <motion.div 
                      animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-1/2 -ml-[1.5px] w-[3px] h-[15px] bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,1)]"
                    />
                  </div>

                  {/* Step 2: Logic Block */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className={cn(
                      "w-48 p-4 rounded-2xl border flex flex-col items-center gap-3 relative backdrop-blur-md",
                      isDark ? "bg-slate-900/60 border-indigo-500/20" : "bg-white/60 border-indigo-500/10 shadow-lg"
                    )}
                  >
                    <div className="flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Auto-Provision</span>
                    </div>
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-indigo-100 dark:bg-slate-700 overflow-hidden">
                           <img src={`https://api.dicebear.com/9.x/shapes/svg?seed=${i * 123}`} alt="" />
                         </div>
                       ))}
                    </div>
                  </motion.div>

                  {/* Split Pathing (Stripe style) */}
                  <div className="w-48 h-12 relative mt-1">
                     <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <path d="M50 0 C50 20, 10 20, 10 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-500/20" />
                        <path d="M50 0 C50 20, 90 20, 90 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-500/20" />
                        {/* Pulse paths */}
                        <motion.path 
                           initial={{ pathLength: 0 }}
                           animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                           transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                           d="M50 0 C50 20, 10 20, 10 40" 
                           fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500" 
                        />
                        <motion.path 
                           initial={{ pathLength: 0 }}
                           animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                           transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                           d="M50 0 C50 20, 90 20, 90 40" 
                           fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500" 
                        />
                     </svg>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 w-full justify-center">
                    <motion.div 
                      key="act1"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className={cn("px-4 py-2 rounded-xl border border-emerald-500/20 text-emerald-500 text-[10px] font-black flex items-center gap-1.5 backdrop-blur-md", isDark ? "bg-emerald-500/10" : "bg-emerald-50")}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Slack Invited
                    </motion.div>
                    <motion.div 
                      key="act2"
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                      className={cn("px-4 py-2 rounded-xl border border-blue-500/20 text-blue-500 text-[10px] font-black flex items-center gap-1.5 backdrop-blur-md", isDark ? "bg-blue-500/10" : "bg-blue-50")}
                    >
                      <CreditCard className="w-3 h-3" /> Bank Setup
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══ BANKING ══ */}
            <div className={cn("tab-panel", activeToolsTab === 'bank' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap bg-indigo-500/10 text-indigo-500">🏦</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>Bank Export Engine</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Export your payroll runs directly to your bank. Native support for Zimbabwean financial institutions and accounting software.</p>
                <ul className="tab-list">
                  {['Native CABS & Nedbank Support', 'Standard CSV/TXT Mappings', 'Direct EcoCash Business Sync', 'Xero & Sage Connectivity'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button className="tab-cta">View All Integrations →</button>
              </div>
              <div className="visual-panel !p-0 overflow-hidden relative group flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-grid opacity-10"></div>
                
                {/* Integration Grid (Documenso style) */}
                <div className="relative z-10 w-full px-8 flex flex-col items-center gap-12">
                   <div className="grid grid-cols-3 gap-6 w-full max-w-sm">
                      {[
                        { n: 'CABS', color: 'bg-blue-600', delay: 0 },
                        { n: 'Sage', color: 'bg-emerald-600', delay: 0.1 },
                        { n: 'Xero', color: 'bg-sky-500', delay: 0.2 },
                        { n: 'CBZ', color: 'bg-red-600', delay: 0.3 },
                        { n: 'EcoCash', color: 'bg-blue-500', delay: 0.4 },
                        { n: 'Zapier', color: 'bg-orange-500', delay: 0.5 }
                      ].map((tool, i) => (
                        <motion.div 
                          key={tool.n}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: tool.delay, duration: 0.5 }}
                          className={cn(
                            "aspect-square rounded-2xl border flex items-center justify-center flex-col transition-all group/icon",
                            isDark ? "bg-slate-900/80 border-white/5 hover:border-indigo-500/50" : "bg-white border-indigo-500/10 hover:shadow-xl hover:shadow-indigo-500/10"
                          )}
                        >
                           <div className={cn("w-10 h-10 rounded-xl mb-2 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-black/20", tool.color)}>
                              {tool.n[0]}
                           </div>
                           <span className={cn("text-[9px] font-black uppercase tracking-widest", isDark ? "text-slate-400" : "text-slate-500")}>{tool.n}</span>
                        </motion.div>
                      ))}
                   </div>

                   <div className="text-center">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-2">Integrations</div>
                      <h3 className={cn("text-xl font-black mb-4", isDark ? "text-white" : "text-slate-900")}>Your Favorite Tools Work<br/>With ZivoHR</h3>
                      <button className="px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 text-[10px] font-black shadow-xl hover:scale-105 transition-transform">
                        Explore Marketplace
                      </button>
                   </div>
                </div>
              </div>
            </div>

            {/* ══ VAULT ══ */}
            <div className={cn("tab-panel", activeToolsTab === 'vault' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap bg-indigo-500/10 text-indigo-500">🔒</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>The Document Vault</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Centralized, encrypted storage for all sensitive personnel files. Manage contracts, compliance documents, and ID copies with ease.</p>
                <ul className="tab-list">
                  {['Role-Based Access Control', 'Two-Party Upload Flow', 'Automatic Expiry Alerts', 'Version History'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button className="tab-cta">Secure Your Files →</button>
              </div>
              <div className="visual-panel !p-0 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 w-full h-full flex flex-col p-8">
                  {/* Layered Document Stack (Documenso style) */}
                  <div className="relative h-48 w-full flex items-center justify-center perspective-[1000px] mb-8">
                    {[1, 2, 3].map((i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                          rotateY: [i * -2, i * 2, i * -2],
                          z: [i * -20, i * -15, i * -20],
                          y: [i * 5, i * 2, i * 5]
                        }}
                        transition={{ duration: 6, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                        className={cn(
                          "absolute w-40 h-52 rounded-2xl border p-4 shadow-2xl backdrop-blur-md",
                          isDark ? "bg-slate-900/80 border-indigo-500/30" : "bg-white/90 border-indigo-500/10",
                          i === 3 ? "z-30" : i === 2 ? "z-20 opacity-60 translate-x-4" : "z-10 opacity-30 translate-x-8"
                        )}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                         <div className="space-y-3">
                            <div className="h-2 w-1/2 bg-indigo-500/20 rounded-full"></div>
                            <div className="space-y-1.5">
                               <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                               <div className="h-1.5 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                               <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                            </div>
                            {i === 3 && (
                              <motion.div 
                                animate={{ opacity: [0, 1, 1, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="mt-8 flex flex-col items-center gap-1"
                              >
                                 <PenTool className="w-4 h-4 text-indigo-500" />
                                 <div className="sig-cursive text-indigo-500/60 scale-75">Contract Signed</div>
                              </motion.div>
                            )}
                         </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Security Stats */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className={cn("p-4 rounded-2xl border flex items-center gap-3 backdrop-blur-md", isDark ? "bg-slate-900/40 border-white/5" : "bg-white/40 border-indigo-500/5")}>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                           <Shield className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex-1">
                           <div className={cn("text-[9px] font-black uppercase text-slate-500 tracking-wider")}>Verification</div>
                           <div className={cn("text-xs font-black", isDark ? "text-white" : "text-slate-900")}>Active 2FA</div>
                        </div>
                     </div>
                     <div className={cn("p-4 rounded-2xl border flex items-center gap-3 backdrop-blur-md", isDark ? "bg-slate-900/40 border-white/5" : "bg-white/40 border-indigo-500/5")}>
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                           <Logo className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex-1">
                           <div className={cn("text-[9px] font-black uppercase text-slate-500 tracking-wider")}>Redundancy</div>
                           <div className={cn("text-xs font-black", isDark ? "text-white" : "text-slate-900")}>3-Region Sync</div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══ ASSET ══ */}
            <div className={cn("tab-panel", activeToolsTab === 'asset' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap bg-indigo-500/10 text-indigo-500">💻</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>Asset & IT Shield</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Track and maintain your organization's physical and digital assets. From MacBook Pros to software licenses.</p>
                <ul className="tab-list">
                  {['Automated Maintenance Logs', 'Asset Assignment History', 'Barcode & QR Tracking', 'Warranty Alerts'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button className="tab-cta">View Asset Inventory →</button>
              </div>
              <div className="visual-panel !p-0 overflow-hidden relative group">
                <div className="absolute inset-0 bg-indigo-500/[0.02] grid-bg opacity-30"></div>
                
                <div className="relative z-10 w-full h-full flex flex-col p-8 items-center justify-center">
                  <div className="relative w-64 h-64 mb-6">
                    {/* Asset Radar Sweep (Stripe-esque technicality) */}
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-500/10" />
                       <circle cx="50%" cy="50%" r="30%" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-500/10" />
                       
                       <motion.circle 
                          cx="50%" cy="50%" r="48%" 
                          fill="none" stroke="#6366F1" strokeWidth="2" 
                          strokeDasharray="1, 20"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                       />
                       
                       <motion.path 
                          d="M128 128 L128 0" 
                          stroke="url(#radarGradient)" 
                          strokeWidth="20"
                          className="origin-center"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                       />
                       <defs>
                          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                             <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                             <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                          </linearGradient>
                       </defs>
                    </svg>

                    {/* Asset Icons pulsing on radar */}
                    {[
                      { x: "20%", y: "30%", icon: "💻", delay: 0 },
                      { x: "75%", y: "25%", icon: "📱", delay: 1 },
                      { x: "60%", y: "70%", icon: "🖥️", delay: 2 },
                      { x: "30%", y: "75%", icon: "🏢", delay: 1.5 }
                    ].map((asset, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: asset.delay }}
                        className="absolute text-xl bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm p-2 rounded-lg"
                        style={{ left: asset.x, top: asset.y }}
                      >
                         {asset.icon}
                      </motion.div>
                    ))}

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className={cn("text-3xl font-black", isDark ? "text-white" : "text-slate-900")}>98.4%</span>
                       <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Inventory Health</span>
                    </div>
                  </div>

                  <div className="flex gap-4 overflow-hidden w-full px-4">
                     {[1, 2, 3, 4, 5].map(i => (
                       <motion.div 
                         key={i}
                         animate={{ y: [0, -5, 0] }}
                         transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                         className={cn("h-1 flex-1 rounded-full", i === 1 ? "bg-rose-500" : "bg-emerald-500")}
                       />
                     ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ══ API ══ */}
            <div className={cn("tab-panel", activeToolsTab === 'api' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap bg-indigo-500/10 text-indigo-500">🔌</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>Expert API</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>Unleash your developers. Integrate ZivoHR data seamlessly with your accounting, ERP, or custom internal tools.</p>
                <ul className="tab-list">
                  {['Webhooks for Real-time Sync', 'Standard RESTful Endpoints', 'Comprehensive Documentation', 'Secure API Key Management'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button className="tab-cta">Read API Docs →</button>
              </div>
              <div className={cn("visual-panel p-0 relative overflow-hidden group shadow-2xl min-h-[460px]", isDark ? "bg-[#0b0e14] border-white/5" : "bg-slate-50 border-indigo-500/10")}>
                {/* Continuous Scroll Container */}
                <div className="relative h-full w-full overflow-hidden">
                  <motion.div 
                    animate={{ y: ["0%", "-50%"] }}
                    transition={{ 
                      duration: 35,
                      repeat: Infinity, 
                      ease: "linear",
                      repeatType: "loop"
                    }}
                    className="flex flex-col p-8 font-mono text-[11px] leading-relaxed"
                  >
                    {[1, 2].map((group) => (
                      <div key={group} className="flex flex-col gap-12 pb-12">
                        <div className={cn("space-y-4", isDark ? "text-slate-300" : "text-slate-700")}>
                          <div>
                            <span className="text-purple-400 font-bold">import</span> {`{`} <span className="text-sky-400">ZivoHR</span> {`}`} <span className="text-purple-400 font-bold">from</span> <span className="text-emerald-500">'@zivohr/sdk'</span>;
                          </div>
                          <div className="opacity-60 space-y-1">
                            <div className="text-slate-500">// Initialize with Zimbabwean context</div>
                            <div className="text-purple-400 font-bold">const <span className="text-sky-400">client</span> = <span className="text-sky-400">new</span> <span className="text-amber-500">ZivoHR</span>({`{`}<br/>
                            <span className="ml-4">apiKey: <span className="text-emerald-400">process.env.ZIVO_KEY</span>,</span><br/>
                            <span className="ml-4">region: <span className="text-emerald-400">'ZW-HRE'</span></span><br/>
                            {`}`});</div>
                          </div>
                          <div className="space-y-1">
                            <div><span className="text-purple-400 font-bold">await</span> client.<span className="text-sky-400">on</span>(<span className="text-emerald-400">'payroll.paid'</span>, <span className="text-sky-300">async</span> (event) ={`>`} {`{`}</div>
                            <div className="ml-4 text-slate-500">// Trigger Xero/Sage sync</div>
                            <div className="ml-4 text-purple-400 font-bold">await <span className="text-sky-400">erp</span>.<span className="text-sky-400">sync</span>(event.data);</div>
                            <div>{`}`});</div>
                          </div>
                        </div>

                        <div className={cn("space-y-4", isDark ? "text-slate-300" : "text-slate-700")}>
                          <div className="space-y-1">
                            <div className="text-slate-500">// Fetch employee contract status</div>
                            <div className="text-purple-400 font-bold">const <span className="text-sky-400">status</span> = <span className="text-purple-400 font-bold">await</span> client.<span className="text-sky-400">employees</span>.<span className="text-sky-400">getContract</span>(<span className="text-emerald-500">'emp_772'</span>);</div>
                            <div><span className="text-purple-400 font-bold">if</span> (status.expires_soon) {`{`}</div>
                            <div className="ml-4">workflow.<span className="text-sky-400">trigger</span>(<span className="text-emerald-500">'renewal'</span>, status.id);</div>
                            <div>{`}`}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-slate-500">// Sync with local banking node</div>
                            <div className="text-purple-400 font-bold">await <span className="text-sky-400">bank</span>.<span className="text-sky-400">pushBatch</span>(client.currentPayload);</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Floating "Check our API" Button */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.button 
                    whileHover={{ scale: 1.05, translateY: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs shadow-2xl transition-all border",
                      isDark 
                        ? "bg-indigo-500 text-white border-indigo-400/50 shadow-indigo-500/20" 
                        : "bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/20"
                    )}
                  >
                    <Book className="w-3.5 h-3.5" />
                    Check our API
                  </motion.button>
                </div>
                
                {/* Gradient Fades for Scroll */}
                <div className={cn("absolute top-0 left-0 right-0 h-24 pointer-events-none z-10", isDark ? "bg-gradient-to-b from-[#0b0e14] to-transparent" : "bg-gradient-to-b from-slate-50 to-transparent")}></div>
                <div className={cn("absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10", isDark ? "bg-gradient-to-t from-[#0b0e14] to-transparent" : "bg-gradient-to-t from-slate-50 to-transparent")}></div>
                
                <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none"></div>
              </div>
            </div>

            {/* ══ SECURITY ══ */}
            <div className={cn("tab-panel", activeToolsTab === 'security' && "active")}>
              <div className="tab-info">
                <div className="tab-icon-wrap bg-indigo-500/10 text-indigo-500">🔐</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>Highly Compliant</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>We treat your data with bank-grade integrity. Enterprise-level encryption and full local compliance right out of the box.</p>
                <ul className="tab-list">
                  {['AES-256 End-to-End Encryption', 'ZIMRA & NSSA Validated', 'SOC2 Compliant Infrastructure', 'Zero-Trust Data Protection'].map(item => (
                    <li key={item} className={isDark ? "text-slate-200" : "text-slate-900"}>
                      <span className="check-icon">✓</span>{item}
                    </li>
                  ))}
                </ul>
                <button className="tab-cta">Explore Security Pillar →</button>
              </div>
              <div className="visual-panel !p-0 overflow-hidden relative flex flex-col items-center justify-center group bg-[#0f1115]">
                <div className="absolute inset-0 bg-grid opacity-[0.05]"></div>
                
                {/* Compliance Card (Documenso style) */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="relative z-10 w-full max-w-[300px] p-10 rounded-[2.5rem] bg-[#1a1c23] border border-white/10 shadow-2xl flex flex-col items-center text-center"
                >
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8">
                      <Shield className="w-6 h-6 text-emerald-500" />
                   </div>
                   
                   <h3 className="text-2xl font-black text-white mb-2 italic">ZIMRA Compliant</h3>
                   <p className="text-[11px] font-bold text-slate-500 mb-10 leading-relaxed">
                     ZivoHR is a certified platform that establishes the criteria for high-integrity payroll and labor law compliance...
                   </p>
                   
                   {/* Glowing Status Badge */}
                   <div className="w-full px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/30 flex items-center justify-center gap-2 mb-8 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Status: Compliant</span>
                   </div>
                   
                   <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs hover:bg-white/10 transition-colors">
                     Learn more
                   </button>
                </motion.div>

                {/* Technical Floating Elements */}
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 opacity-[0.03] border-[2px] border-dashed border-indigo-500 rounded-full scale-[1.5]"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── HR LIBRARY TABS ─── */}
      <section id="library" className="py-20 md:py-28 px-6 max-w-[1200px] mx-auto scroll-mt-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6">📚 Resources</div>
          <h2 className={`text-3xl md:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>ZivoHR Library</h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Access complete HR templates, policies, and guides tailored for Zimbabwe.</p>
        </div>

        <div className="tabs-nav mb-12">
          {LIBRARY_TABS.map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setActiveLibraryTab(tab.id as any); setLibraryProgress(0); }}
              className={cn("tab-btn", activeLibraryTab === tab.id && "active")}
            >
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
              {activeLibraryTab === tab.id && (
                <div className="tab-progress" style={{ width: `${libraryProgress}%`, transition: 'none' }} />
              )}
            </button>
          ))}
        </div>

        <div className="tab-content !bg-transparent !border-0 min-h-[450px]">
          {LIBRARY_TABS.map((tab) => (
            <div key={tab.id} className={cn("tab-panel flex-col lg:flex-row gap-10", activeLibraryTab === tab.id && "active")}>
              <div className="tab-info flex-1">
                <div className="tab-icon-wrap bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg">{tab.icon}</div>
                <h2 className={isDark ? "text-white" : "text-slate-900"}>{tab.title}</h2>
                <p className={isDark ? "text-slate-400" : "text-slate-500"}>{tab.sub}</p>
                <div className="mt-8 space-y-4">
                  {[
                    'Legally Vetted',
                    'Fully Customizable',
                    'Instant Download',
                    'Landmark Zimbabwe Cases Included'
                  ].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="text-indigo-500">✓</div>
                      <span className={cn("text-xs font-bold", isDark ? "text-slate-300" : "text-slate-600")}>{item}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-10 px-8 py-4 rounded-2xl bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-500/20">View {tab.label} Template →</button>
              </div>
              <div className="visual-panel !p-0 overflow-hidden relative group">
                <div className="absolute inset-0 bg-grid opacity-20"></div>
                <div className="relative z-10 w-full h-full flex flex-col p-8 items-center justify-center">
                   {/* Stacked Documents (Documenso style) */}
                   <div className="relative h-48 w-full flex items-center justify-center perspective-[1000px] mb-8">
                     {[1, 2, 3].map((i) => (
                       <motion.div 
                         key={i}
                         animate={{ 
                           rotateY: [i * -3, i * 3, i * -3],
                           z: [i * -15, i * -10, i * -15],
                           y: [i * 4, i * 1, i * 4]
                         }}
                         transition={{ duration: 5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                         className={cn(
                           "absolute w-44 h-56 rounded-2xl border p-5 shadow-2xl backdrop-blur-md",
                           isDark ? "bg-slate-900 border-indigo-500/30" : "bg-white border-indigo-500/10",
                           i === 3 ? "z-30" : i === 2 ? "z-20 opacity-70 translate-x-3" : "z-10 opacity-40 translate-x-6"
                         )}
                         style={{ transformStyle: 'preserve-3d' }}
                       >
                          <div className="flex justify-between items-center mb-4">
                             <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">{tab.icon}</div>
                             <div className="h-1.5 w-12 bg-indigo-500/20 rounded-full"></div>
                          </div>
                          <div className="space-y-3">
                             <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                             <div className="space-y-1.5 opacity-60">
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                <div className="h-1.5 w-4/12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                             </div>
                             {i === 3 && (
                               <motion.div 
                                 animate={{ x: [-2, 2, -2] }}
                                 transition={{ duration: 2, repeat: Infinity }}
                                 className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"
                               >
                                  <div className="flex gap-1">
                                     <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[6px] text-white">✓</div>
                                     <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none">Vetted</span>
                                  </div>
                                  <Download className="w-3.5 h-3.5 text-indigo-500 opacity-60" />
                               </motion.div>
                             )}
                          </div>
                       </motion.div>
                     ))}
                   </div>

                   <button className="relative z-20 group-hover:scale-105 transition-transform px-6 py-2.5 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 text-[10px] font-black shadow-xl">
                      Download Editable {tab.label}
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── LABOR CASES ─── */}
      <section id="labor-cases" className="py-20 md:py-32 px-4 md:px-6 bg-indigo-500/[0.02] border-y border-indigo-500/5 scroll-mt-24 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6 font-mono">⚖️ Legal Intelligence</div>
              <h2 className={cn("text-3xl md:text-5xl font-black mb-4 leading-tight", isDark ? 'text-white' : 'text-slate-900')}>Zimbabwean Labor<br className="hidden md:block" /> Case Library</h2>
              <p className={cn("text-sm md:text-lg font-bold opacity-60", isDark ? "text-slate-400" : "text-slate-600")}>Stay informed with expert analysis of landmark Zimbabwean labor cases and their implications for your business.</p>
            </div>
            
            <div className="flex gap-2">
              {laborCases.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveCaseIndex(i)}
                  className={cn(
                    "w-8 h-1 rounded-full transition-all duration-500",
                    activeCaseIndex === i ? "bg-indigo-500 w-12" : "bg-indigo-500/20"
                  )}
                  aria-label={`Go to case ${i + 1}`}
                />
              ))}
            </div>
          </div>
          
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCaseIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
                className={cn(
                  "relative p-6 md:p-14 rounded-[2rem] md:rounded-[2.5rem] border overflow-hidden flex flex-col lg:flex-row gap-8 md:gap-12 items-center",
                  isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-indigo-500/10 shadow-2xl shadow-indigo-500/5'
                )}
              >
                <div className="flex-1 w-full order-2 lg:order-1">
                  <div className="flex flex-wrap items-center gap-3 mb-8">
                    <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest leading-none">{laborCases[activeCaseIndex].cat}</div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 leading-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Active Reference</span>
                    </div>
                  </div>
                  
                  <h3 className={cn("text-2xl md:text-4xl font-black mb-4 leading-tight tracking-tight", isDark ? 'text-white' : 'text-slate-900')}>
                    {laborCases[activeCaseIndex].t}
                  </h3>
                  
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-indigo-500/5 text-indigo-500 text-[11px] font-black uppercase tracking-[0.1em] mb-8 border border-indigo-500/10 font-mono">
                    {laborCases[activeCaseIndex].c}
                  </div>
                  
                  <p className={cn("text-base md:text-xl font-bold leading-relaxed mb-10 opacity-70", isDark ? "text-slate-400" : "text-slate-600")}>
                    {laborCases[activeCaseIndex].d}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-8 pt-10 border-t border-indigo-500/10">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={laborCases[activeCaseIndex].av} alt={laborCases[activeCaseIndex].judge} className="w-12 h-12 rounded-full border-2 border-indigo-500/20 bg-indigo-500/5 shadow-lg" referrerPolicy="no-referrer" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                           <Shield className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className={cn("text-sm font-black", isDark ? "text-white" : "text-slate-900")}>{laborCases[activeCaseIndex].judge}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Legal Analysis Expert</div>
                      </div>
                    </div>
                    <button onClick={onLogin} className={cn(
                      "group relative px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-center overflow-hidden",
                      isDark ? "bg-white text-black hover:scale-105" : "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-105"
                    )}>
                      <span className="relative z-10">Read Full Analysis →</span>
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20 group-hover:h-full transition-all duration-300 pointer-events-none" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 w-full flex justify-center order-1 lg:order-2">
                  <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-[3rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/15 overflow-hidden group/visual p-1">
                    <div className={cn("w-full h-full rounded-[2.8rem] flex flex-col p-8 items-center justify-center gap-8 transition-colors", isDark ? "bg-slate-900" : "bg-white")}>
                       <div className="relative w-24 h-24 flex items-center justify-center">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30"
                          />
                          <FileText className="w-12 h-12 text-indigo-500" />
                       </div>
                       
                       <div className="w-full space-y-4">
                          {[70, 90, 80, 50].map((w, i) => (
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${w}%` }}
                               key={i} 
                               className="h-2 bg-indigo-500/10 rounded-full" 
                             />
                          ))}
                       </div>
                       
                       <div className="flex gap-2">
                          {[1,2,3].map(i => <div key={i} className="w-8 h-1 rounded-full bg-indigo-500/20" />)}
                       </div>
                    </div>
                    {/* Floating elements */}
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-10 right-10 p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border dark:border-slate-700"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </motion.div>
                    <motion.div 
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-12 left-8 p-3 rounded-2xl bg-indigo-600 shadow-2xl text-white"
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS SECTION ─── */}
      <section className="ts-section">
        <div className="ts-header">
          <div className="ts-eyebrow">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1l1.2 3.6H11L8.1 6.9l1.1 3.5L6 8.2l-3.2 2.2 1.1-3.5L1 4.6h3.8z" fill="#6366F1"/>
            </svg>
            Customer Stories
          </div>
          <h2 className={cn("ts-title", isDark ? "text-white" : "text-slate-900")}>Loved by African HR teams</h2>
          <p className={isDark ? "ts-sub text-slate-400" : "ts-sub text-slate-600"}>500+ companies across Zimbabwe and Africa trust ZivoHR to run their people operations.</p>
        </div>
        
        <div className="ts-grid">
          {/* Card 01 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="ts-card"
          >
            <span className="ts-num">01</span>
            <div>
              <div className="ts-stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} className="ts-star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
                ))}
              </div>
              <span className="ts-quote-mark">"</span>
              <p className={cn("ts-text", isDark ? "text-slate-300" : "text-slate-600")}>
                ZivoHR transformed our HR operations. Payroll that used to take 3 days now takes 20 minutes. The NSSA and ZIMRA integrations alone saved us countless hours every month.
              </p>
            </div>
            <div className="ts-author">
              <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Chipo&backgroundColor=6366f1" alt="Chipo" className="ts-av" referrerPolicy="no-referrer" />
              <div>
                <div className={cn("ts-author-name", isDark ? "text-white" : "text-slate-900")}>Chipo Moyo</div>
                <div className="ts-author-role">HR Director</div>
              </div>
            </div>
          </motion.div>

          {/* Card 02 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="ts-card"
          >
            <span className="ts-num">02</span>
            <div>
              <div className="ts-stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} className="ts-star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
                ))}
              </div>
              <span className="ts-quote-mark">"</span>
              <p className={cn("ts-text", isDark ? "text-slate-300" : "text-slate-600")}>
                The WhatsApp integration is a game-changer. Our employees check leave balances and get payslips instantly — no emails, no waiting. It's exactly how Africa should work.
              </p>
            </div>
            <div className="ts-author">
              <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Tawanda&backgroundColor=059669" alt="Tawanda" className="ts-av" referrerPolicy="no-referrer" />
              <div>
                <div className={cn("ts-author-name", isDark ? "text-white" : "text-slate-900")}>Tawanda Sithole</div>
                <div className="ts-author-role">Chief Executive Officer</div>
              </div>
            </div>
          </motion.div>

          {/* Card 03 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="ts-card"
          >
            <span className="ts-num">03</span>
            <div>
              <div className="ts-stars">
                {[1, 2, 3, 4, 5].map(s => (
                  <svg key={s} className="ts-star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
                ))}
              </div>
              <span className="ts-quote-mark">"</span>
              <p className={cn("ts-text", isDark ? "text-slate-300" : "text-slate-600")}>
                Finally an HR platform built for Zimbabwe. The Labor Act compliance features and the HR library gave our team the confidence to handle disciplinary matters correctly from day one.
              </p>
            </div>
            <div className="ts-author">
              <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Rutendo&backgroundColor=F97316" alt="Rutendo" className="ts-av" referrerPolicy="no-referrer" />
              <div>
                <div className={cn("ts-author-name", isDark ? "text-white" : "text-slate-900")}>Rutendo Dube</div>
                <div className="ts-author-role">Operations Manager</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Continuous Ticker */}
        <div className="ts-strip">
          <div className="ts-strip-track">
            <div className="ts-strip-item">✓ 100% Tax Compliant</div>
            <div className="ts-strip-item">✓ ZIMRA Integrated</div>
            <div className="ts-strip-item">✓ NSSA Validation</div>
            <div className="ts-strip-item">✓ WhatsApp Powered</div>
            <div className="ts-strip-item">✓ Bank Export Engine</div>
            <div className="ts-strip-item">✓ Zimbabwe Labor Law Library</div>
            <div className="ts-strip-item">✓ Multi-Currency Support</div>
            {/* Duplicated for seamless loop */}
            <div className="ts-strip-item">✓ 100% Tax Compliant</div>
            <div className="ts-strip-item">✓ ZIMRA Integrated</div>
            <div className="ts-strip-item">✓ NSSA Validation</div>
            <div className="ts-strip-item">✓ WhatsApp Powered</div>
            <div className="ts-strip-item">✓ Bank Export Engine</div>
            <div className="ts-strip-item">✓ Zimbabwe Labor Law Library</div>
            <div className="ts-strip-item">✓ Multi-Currency Support</div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 md:py-28 px-6 max-w-[800px] mx-auto scroll-mt-24">
        <h2 className={`text-4xl md:text-5xl font-black text-center mb-16 ${isDark ? 'text-white' : 'text-slate-900'}`}>Frequently Asked <span className="text-indigo-500">Questions</span></h2>
        <div className="space-y-4">
          {[
            { q: 'Is ZivoHR compliant with Zimbabwean labor laws?', a: 'Yes, ZivoHR is specifically built for the Zimbabwean market. Our payroll engine handles ZIMRA, NSSA, and NEC calculations automatically.' },
            { q: 'How long does it take to get started?', a: 'You can sign up and have your basic company profile ready in minutes. Full implementationTypically takes 1-3 business days.' },
            { q: 'Is my data secure?', a: 'Absolutely. We use industry-standard encryption and secure cloud infrastructure. Your data is backed up daily.' },
            { q: 'Do you offer training for our HR team?', a: 'Yes, we provide comprehensive onboarding training and ongoing support via chat, email, and WhatsApp.' }
          ].map((item, i) => (
            <details key={i} className={`group rounded-3xl border transition-all open:ring-1 open:ring-indigo-500/30 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-indigo-500/10 shadow-sm'}`}>
              <summary className={`flex items-center justify-between p-6 cursor-pointer font-black text-sm select-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {item.q}
                <span className="text-indigo-500 transition-transform group-open:rotate-180">↓</span>
              </summary>
              <div className="px-6 pb-6 text-xs leading-relaxed font-bold text-slate-500 max-w-[90%]">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 md:py-36 px-6">
        <div className="max-w-[1200px] mx-auto rounded-[4rem] bg-indigo-600 p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-7xl font-black text-white leading-tight mb-8">Ready to write your <br /> <span className="text-indigo-200">success story?</span></h2>
            <p className="text-indigo-100 text-lg md:text-xl font-bold max-w-2xl mx-auto mb-12">Join 500+ high-growth companies managing their workforce with the power of ZivoHR.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={onGetStarted} className="px-12 py-5 rounded-3xl bg-white text-indigo-600 font-black text-lg shadow-xl shadow-black/10 hover:-translate-y-1 transition-all">Get Started for Free</button>
              <button onClick={onLogin} className="px-12 py-5 rounded-3xl bg-indigo-500 text-white font-black text-lg border border-indigo-400 hover:bg-indigo-500/80 transition-all">Book a Demo</button>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={`py-20 px-6 border-t ${isDark ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-200'}`}>
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6 cursor-pointer hover:scale-105 transition-transform origin-left" onClick={() => scrollToSection('hero')}>
              <Logo className="w-10 h-10" />
              <span className={`text-2xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>ZivoHR</span>
            </div>
            <p className={`text-xs leading-relaxed font-bold mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>The most powerful payroll and HR platform built specifically for high-integrity Zimbabwean businesses.</p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs opacity-50">𝕏</div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs opacity-50">in</div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs opacity-50">f</div>
            </div>
          </div>
          
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Product</h4>
            <ul className={`space-y-4 text-xs font-black ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">Payroll Engine</li>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">Smart Recruitment</li>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">Performance Hub</li>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">Library & Legal</li>
            </ul>
          </div>
          
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Company</h4>
            <ul className={`space-y-4 text-xs font-black ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">Contact</li>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">Support</li>
            </ul>
          </div>
          
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Trust</h4>
            <ul className={`space-y-4 text-xs font-black ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">Security</li>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">Compliance</li>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">Privacy</li>
              <li className="hover:text-indigo-500 cursor-pointer transition-colors">Terms</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-[1200px] mx-auto pt-10 border-t border-indigo-500/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-slate-500">© 2026 ZivoHR. Made with ❤️ for Zimbabwe.</p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black text-slate-500 cursor-pointer hover:text-indigo-500">Privacy Policy</span>
            <span className="text-[10px] font-black text-slate-500 cursor-pointer hover:text-indigo-500">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
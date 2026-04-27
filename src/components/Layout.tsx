import React, { useState, useEffect } from 'react';
import { Search, Bell, Command, LayoutDashboard, Users, Briefcase, TrendingUp, CreditCard, Heart, Settings, Zap, ChevronRight, Menu, X, Calendar, Clock, CheckCircle2, ArrowLeft, PartyPopper, ShieldCheck, PenTool, Upload, MessageCircle, BookOpen, Key, Shield, Monitor, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Company } from '../types';
import ConfirmationModal from './ConfirmationModal';

import { useTheme } from './ThemeContext';
import { Logo } from './Logo';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentCompany: Company;
  userProfile?: any;
  onBack?: () => void;
  onGoHome?: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, currentCompany, userProfile, onBack, onGoHome }: LayoutProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { language, setLanguage, t } = useLanguage();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResetPasswordConfirm, setShowResetPasswordConfirm] = useState(false);
  const [activeSettingsView, setActiveSettingsView] = useState<'main' | 'security' | 'roles' | 'company'>('main');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setLogoUploadError('Please upload a valid image (PNG, JPG, or SVG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setLogoUploadError('Logo file size must be less than 2MB');
      return;
    }

    setLogoUploadError(null);
    setIsUploadingLogo(true);

    // Simulate upload process
    setTimeout(() => {
      setIsUploadingLogo(false);
      alert('Logo uploaded successfully! (Simulation)');
    }, 2000);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'onboarding', label: 'Onboarding', icon: PartyPopper },
    { id: 'self_service', label: t('employees'), icon: Users },
    { id: 'leave', label: 'Leave Tracker', icon: Calendar },
    { id: 'time', label: 'Time Tracker', icon: Clock },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
    { id: 'hiring', label: t('hiring'), icon: Briefcase },
    { id: 'team', label: 'Organization', icon: Users },
    { id: 'performance', label: t('performance'), icon: TrendingUp },
    { id: 'payroll', label: t('payroll'), icon: CreditCard },
    { id: 'treasury', label: 'Treasury', icon: Landmark },
    { id: 'esignature', label: 'e-signatures', icon: PenTool },
    { id: 'vault', label: 'Vault (Records)', icon: Shield },
    { id: 'assets', label: 'Assets & IT', icon: Monitor },
    { id: 'community', label: 'Community & Jobs', icon: MessageCircle },
    { id: 'library', label: 'HR Library', icon: BookOpen },
    { id: 'engagement', label: 'Engagement', icon: Heart },
    { id: 'workflows', label: 'Workflows', icon: Zap },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const displayMenuItems = [...menuItems];
  if (userProfile?.role === 'platform_owner') {
    displayMenuItems.push({ id: 'owner_kpis', label: 'Owner Dashboard', icon: ShieldCheck });
  }

  return (
    <div className={`min-h-screen flex overflow-x-hidden transition-colors duration-500 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarCollapsed ? 80 : 256 }}
          className={cn(
            "border-r fixed h-full hidden lg:flex flex-col shadow-sm z-50 overflow-hidden transition-all duration-300",
            isDark ? "bg-slate-950 border-white/5" : "bg-white border-slate-200"
          )}
        >
          <div className={cn(
            "p-6 border-b flex items-center justify-between transition-colors",
            isDark ? "border-white/5" : "border-slate-100"
          )}>
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3 overflow-hidden"
                >
                  {currentCompany.logoUrl ? (
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex-shrink-0 shadow-lg overflow-hidden border cursor-pointer transition-colors",
                      isDark ? "border-white/10" : "border-slate-200"
                    )}>
                      <img src={currentCompany.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <Logo className="w-10 h-10" />
                  )}
                  <div className="min-w-0">
                    <h2 className={cn("font-bold text-sm leading-tight truncate", isDark ? "text-white" : "text-slate-900")}>{currentCompany.name}</h2>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{currentCompany.plan} Plan</p>
                  </div>
                </motion.div>
              )}
              {isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={cn(
                    "w-10 h-10 rounded-xl flex-shrink-0 shadow-lg mx-auto overflow-hidden border transition-colors",
                    isDark ? "border-white/10" : "border-slate-200"
                  )}
                >
                  {currentCompany.logoUrl ? (
                     <img src={currentCompany.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                     <Logo className="w-full h-full" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {!isSidebarCollapsed && (
              <button 
                onClick={() => setIsSidebarCollapsed(true)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isDark ? "hover:bg-white/5 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-900"
                )}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>

          {isSidebarCollapsed && (
            <div className={cn("p-4 border-b flex justify-center", isDark ? "border-white/5" : "border-slate-100")}>
              <button 
                onClick={() => setIsSidebarCollapsed(false)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isDark ? "hover:bg-white/5 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-900"
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {displayMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative",
                  activeTab === item.id 
                    ? (item.id === 'owner_kpis' ? "bg-red-600 text-white shadow-md shadow-red-600/20" : "bg-accent text-white shadow-md shadow-accent/20")
                    : cn(
                        isDark 
                          ? "text-slate-400 hover:text-white hover:bg-white/5" 
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                      ),
                  isSidebarCollapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors", 
                  activeTab === item.id 
                    ? "text-white" 
                    : cn(isDark ? "text-slate-500 group-hover:text-white" : "text-slate-400 group-hover:text-accent")
                )} />
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isSidebarCollapsed && (
                  <div className={cn(
                    "absolute left-full ml-2 px-2 py-1 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-all",
                    isDark ? "bg-slate-800 text-white" : "bg-slate-900 text-white"
                  )}>
                    {item.label}
                  </div>
                )}
              </button>
            ))}
            
            <div className={cn("pt-4 mt-4 border-t space-y-4", isDark ? "border-white/5" : "border-slate-100")}>
              <div className="px-4">
                 <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-2 px-1", isDark ? "text-slate-500" : "text-slate-400")}>Language</p>
                 <select 
                   value={language}
                   onChange={(e) => setLanguage(e.target.value as Language)}
                   className={cn(
                     "w-full rounded-xl px-3 py-2 text-xs font-bold outline-none border transition-all cursor-pointer",
                     isDark 
                      ? "bg-slate-800 text-white border-white/5 hover:border-white/10 focus:ring-1 focus:ring-accent/20" 
                      : "bg-slate-100 text-slate-700 border-slate-200 focus:ring-1 focus:ring-accent/20"
                   )}
                 >
                   <option value="en" className={isDark ? "bg-slate-800" : ""}>English (US)</option>
                   <option value="sn" className={isDark ? "bg-slate-800" : ""}>Shona (ZW)</option>
                   <option value="nd" className={isDark ? "bg-slate-800" : ""}>Ndebele (ZW)</option>
                   <option value="zh" className={isDark ? "bg-slate-800" : ""}>Chinese (CN)</option>
                   <option value="af" className={isDark ? "bg-slate-800" : ""}>Afrikaans (SA)</option>
                 </select>
              </div>

              <button
                 onClick={onGoHome}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group relative",
                  isDark 
                    ? "text-slate-400 hover:text-white hover:bg-white/5" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50",
                  isSidebarCollapsed && "justify-center px-0"
                )}
              >
                <LayoutDashboard className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isDark ? "text-slate-500 group-hover:text-white" : "text-slate-400 group-hover:text-accent"
                )} />
                {!isSidebarCollapsed && <span>Landing Page</span>}
                {isSidebarCollapsed && (
                  <div className={cn(
                    "absolute left-full ml-2 px-2 py-1 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-all",
                    isDark ? "bg-slate-800 text-white" : "bg-slate-900 text-white"
                  )}>
                    Landing Page
                  </div>
                )}
              </button>
            </div>
          </nav>
          
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "p-4 border-t transition-colors",
                isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50/50"
              )}
            >
              <div className="flex items-center gap-3 p-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  isDark ? "bg-accent/20 text-accent" : "bg-accent/10 text-accent"
                )}>
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>Storage</p>
                  <div className={cn("w-full h-1.5 rounded-full mt-1 overflow-hidden", isDark ? "bg-white/5" : "bg-slate-200")}>
                    <div className="w-1/2 h-full bg-accent rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.aside>

      {/* Main Content */}
      <motion.main 
        initial={false}
        animate={{ paddingLeft: isMobile ? 0 : (isSidebarCollapsed ? 80 : 256) }}
        className="flex-1"
      >
        {/* Header */}
        <header className={`sticky top-0 z-50 backdrop-blur-md border-b px-4 md:px-8 py-3 md:py-4 flex items-center justify-between transition-colors ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
          <div className="flex items-center gap-2 md:gap-4">
            {onBack ? (
              <button 
                onClick={onBack}
                className={`p-2 rounded-xl transition-all flex items-center gap-2 font-bold ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600'}`}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden p-2 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <div className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="hover:text-indigo-500 transition-colors hidden sm:inline"
              >
                ZivoHR
              </button>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 hidden sm:inline" />
              <span className={`capitalize truncate max-w-[100px] md:max-w-none ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{activeTab.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Search */}
            <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-apple-gray/50 rounded-xl border border-black/[0.03] w-64 focus-within:bg-white focus-within:shadow-sm focus-within:ring-1 focus-within:ring-accent/20 transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search anything..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-500 hover:text-accent transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowNotifications(false)} 
                      />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={cn(
                            "absolute right-0 mt-2 w-80 border rounded-2xl shadow-xl z-50 overflow-hidden",
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
                          )}
                        >
                          <div className={cn("p-4 border-b flex items-center justify-between transition-colors", isDark ? "border-white/5 bg-white/5" : "border-black/[0.05] bg-apple-gray/10")}>
                            <h3 className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>Notifications</h3>
                            <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">3 NEW</span>
                          </div>
                          <div className={cn("max-h-96 overflow-y-auto divide-y", isDark ? "divide-white/5" : "divide-black/[0.05]")}>
                            {[
                              { title: 'Payroll Approved', desc: 'April 2026 payroll has been approved by Finance.', time: '2h ago', icon: CheckCircle2, color: 'text-green-500' },
                              { title: 'New Leave Request', desc: 'Sarah Johnson requested 3 days of annual leave.', time: '4h ago', icon: Calendar, color: 'text-blue-500' },
                              { title: 'System Update', desc: 'New ZIMRA tax tables have been integrated.', time: '1d ago', icon: Zap, color: 'text-yellow-500' },
                            ].map((n, i) => (
                              <div key={i} className={cn("p-4 transition-colors cursor-pointer", isDark ? "hover:bg-white/5" : "hover:bg-apple-gray/20")}>
                                <div className="flex gap-3">
                                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", isDark ? "bg-white/5" : "bg-apple-gray/50", n.color)}>
                                    <n.icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className={cn("text-sm font-bold", isDark ? "text-white" : "text-space-gray")}>{n.title}</p>
                                    <p className={cn("text-xs mt-0.5", isDark ? "text-slate-400" : "text-gray-500")}>{n.desc}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button className={cn("w-full p-3 text-xs font-bold text-accent transition-colors border-t", isDark ? "hover:bg-white/5 border-white/5" : "hover:bg-accent/5 border-black/[0.05]")}>
                            View All Notifications
                          </button>
                        </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-6 md:h-8 w-[1px] bg-black/[0.05]" />
              
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity"
              >
              <div className="text-right hidden md:block">
                <p className={cn("text-xs font-bold", isDark ? "text-white" : "text-space-gray")}>{userProfile?.fullName || 'Sarah Jenkins'}</p>
                <p className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? "text-slate-500" : "text-gray-400")}>{userProfile?.role === 'platform_owner' ? 'Platform Owner' : 'HR Manager'}</p>
              </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden border border-black/[0.05] shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                    alt="User"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[70] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "fixed inset-y-0 left-0 w-72 z-[80] lg:hidden flex flex-col shadow-2xl transition-colors duration-300",
                isDark ? "bg-slate-950" : "bg-white"
              )}
            >
              <div className={cn(
                "p-6 border-b flex items-center justify-between transition-colors",
                isDark ? "border-white/5" : "border-slate-100"
              )}>
                <div className="flex items-center gap-3">
                  {currentCompany.logoUrl ? (
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border transition-colors",
                      isDark ? "border-white/10" : "border-slate-200"
                    )}>
                      <img src={currentCompany.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <Logo className="w-10 h-10" />
                  )}
                  <h2 className={cn("font-bold transition-colors", isDark ? "text-white" : "text-slate-900")}>{currentCompany.name}</h2>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark ? "hover:bg-white/5 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-900"
                  )}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {displayMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                      activeTab === item.id 
                        ? (item.id === 'owner_kpis' ? "bg-red-600 text-white shadow-md shadow-red-500/20" : "bg-accent text-white shadow-md shadow-accent/20")
                        : (isDark 
                            ? "text-slate-400 hover:text-white hover:bg-white/5" 
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                          )
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors", 
                      activeTab === item.id 
                        ? "text-white" 
                        : (isDark ? "text-slate-500" : "text-slate-400")
                    )} />
                    {item.label}
                  </button>
                ))}
                
                <div className={cn("pt-4 mt-4 border-t", isDark ? "border-white/5" : "border-slate-100")}>
                  <button
                    onClick={() => {
                      onGoHome?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                      isDark 
                        ? "text-slate-400 hover:text-white hover:bg-white/5" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                    )}
                  >
                    <LayoutDashboard className={cn(
                      "w-5 h-5 transition-colors",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )} />
                    Landing Page
                  </button>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Editing Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-colors",
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-white shadow-xl"
              )}
            >
              <div className={cn("p-6 md:p-8 border-b flex items-center justify-between transition-colors", isDark ? "border-white/5 bg-white/5" : "border-black/[0.05] bg-apple-gray/10")}>
                <div className="flex items-center gap-4">
                  {activeSettingsView !== 'main' && (
                    <button 
                      onClick={() => setActiveSettingsView('main')}
                      className={cn("p-2 rounded-xl transition-colors", isDark ? "hover:bg-white/10 text-slate-400 hover:text-accent" : "hover:bg-white text-gray-400 hover:text-accent")}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div>
                    <h2 className={cn("text-xl md:text-2xl font-bold", isDark ? "text-white" : "text-space-gray")}>
                      {activeSettingsView === 'main' && "User Settings"}
                      {activeSettingsView === 'security' && "Security Settings"}
                      {activeSettingsView === 'roles' && "System Roles"}
                      {activeSettingsView === 'company' && "Company Configuration"}
                    </h2>
                    <p className={cn("text-sm transition-colors", isDark ? "text-slate-400" : "text-gray-500")}>
                      {activeSettingsView === 'main' && "Manage your personal profile and account security."}
                      {activeSettingsView === 'security' && "Configure 2FA, passwords, and active sessions."}
                      {activeSettingsView === 'roles' && "Manage user permissions and access levels."}
                      {activeSettingsView === 'company' && "Update your organization's core details."}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowProfileModal(false);
                    setActiveSettingsView('main');
                  }}
                  className={cn("p-2 rounded-full transition-colors", isDark ? "hover:bg-white/10 text-slate-400 hover:text-white" : "hover:bg-white text-gray-400 hover:text-slate-600")}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                {activeSettingsView === 'main' && (
                  <>
                    {/* Profile Section */}
                    <section className="space-y-4">
                      <h3 className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-slate-600" : "text-gray-400")}>Profile Information</h3>
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative group">
                          <div className={cn("w-24 h-24 rounded-3xl overflow-hidden border-4 shadow-inner transition-colors", isDark ? "border-slate-800" : "border-apple-gray")}>
                            <img 
                              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" 
                              alt="Sarah Jenkins"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button className="absolute -bottom-2 -right-2 p-2 bg-accent text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                            <PenTool className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                          <div className="space-y-1.5">
                            <label className={cn("text-[10px] font-bold uppercase ml-1", isDark ? "text-slate-600" : "text-gray-400")}>Full Name</label>
                            <input 
                              type="text" 
                              defaultValue="Sarah Jenkins"
                              className={cn(
                                "w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                                isDark ? "bg-slate-800 text-white" : "bg-apple-gray text-space-gray"
                              )}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className={cn("text-[10px] font-bold uppercase ml-1", isDark ? "text-slate-600" : "text-gray-400")}>Job Title</label>
                            <input 
                              type="text" 
                              defaultValue="HR Manager"
                              className={cn(
                                "w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-colors",
                                isDark ? "bg-slate-800 text-white" : "bg-apple-gray text-space-gray"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Account & Security */}
                    <section className="space-y-4">
                      <h3 className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-slate-600" : "text-gray-400")}>Account & Security</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => setActiveSettingsView('security')}
                          className={cn(
                            "p-4 rounded-2xl border text-left transition-all flex items-center gap-3 group",
                            isDark ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-accent/20 hover:shadow-xl" : "bg-apple-gray/30 border-black/[0.03] hover:bg-apple-gray/50 hover:border-accent/20 hover:shadow-lg"
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600")}>
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={cn("text-sm font-bold", isDark ? "text-white" : "text-space-gray")}>Security Settings</p>
                            <p className={cn("text-[10px]", isDark ? "text-slate-500" : "text-gray-500")}>2FA, Password, Sessions</p>
                          </div>
                        </button>
                        <button 
                          onClick={() => setActiveSettingsView('roles')}
                          className={cn(
                            "p-4 rounded-2xl border text-left transition-all flex items-center gap-3 group",
                            isDark ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-accent/20 hover:shadow-xl" : "bg-apple-gray/30 border-black/[0.03] hover:bg-apple-gray/50 hover:border-accent/20 hover:shadow-lg"
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform", isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600")}>
                            <Settings className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={cn("text-sm font-bold", isDark ? "text-white" : "text-space-gray")}>System Roles</p>
                            <p className={cn("text-[10px]", isDark ? "text-slate-500" : "text-gray-500")}>Manage permissions</p>
                          </div>
                        </button>
                      </div>
                    </section>

                    {/* Company Settings */}
                    <section className="space-y-4">
                      <h3 className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-slate-600" : "text-gray-400")}>Company Configuration</h3>
                      <button 
                        onClick={() => setActiveSettingsView('company')}
                        className={cn(
                          "w-full p-6 rounded-3xl border space-y-4 text-left transition-all group",
                          isDark ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-accent/20 hover:shadow-xl" : "bg-apple-gray/30 border-black/[0.03] hover:bg-apple-gray/50 hover:border-accent/20 hover:shadow-lg"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">R</div>
                            <div>
                              <p className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>ZivoHR</p>
                              <p className={cn("text-xs", isDark ? "text-slate-500" : "text-gray-500")}>Pro Plan • 124 Employees</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-accent group-hover:underline">Edit Company</span>
                        </div>
                        <div className={cn("grid grid-cols-2 gap-4 pt-4 border-t", isDark ? "border-white/5" : "border-black/[0.05]")}>
                          <div className="space-y-1">
                            <p className={cn("text-[10px] font-bold uppercase", isDark ? "text-slate-600" : "text-gray-400")}>Currency</p>
                            <p className={cn("text-sm font-bold", isDark ? "text-slate-300" : "text-space-gray")}>USD ($)</p>
                          </div>
                          <div className="space-y-1">
                            <p className={cn("text-[10px] font-bold uppercase", isDark ? "text-slate-600" : "text-gray-400")}>Fiscal Year</p>
                            <p className={cn("text-sm font-bold", isDark ? "text-slate-300" : "text-space-gray")}>Jan - Dec</p>
                          </div>
                        </div>
                      </button>
                    </section>
                  </>
                )}

                {activeSettingsView === 'security' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                      <h4 className="font-bold text-blue-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-blue-700">Add an extra layer of security to your account by requiring more than just a password to log in.</p>
                      <button className="btn-primary bg-blue-600 hover:bg-blue-700 px-6 py-2 text-xs">Enable 2FA</button>
                    </div>
                    
                    <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 space-y-4">
                      <div className="flex items-center gap-3 text-orange-900">
                        <Key className="w-5 h-5" />
                        <h4 className="font-bold">Password Management</h4>
                      </div>
                      <p className="text-sm text-orange-700">Need to update your password? We will send a secure reset link to your registered email address.</p>
                      <button 
                        onClick={() => setShowResetPasswordConfirm(true)}
                        className="px-6 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20"
                      >
                        Reset Password
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Sessions</h4>
                      {[
                        { device: 'MacBook Pro', location: 'Harare, Zimbabwe', status: 'Current Session', icon: Zap },
                        { device: 'iPhone 15', location: 'Harare, Zimbabwe', status: 'Active 2h ago', icon: Zap },
                      ].map((session, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.03]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400">
                              <session.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-space-gray">{session.device}</p>
                              <p className="text-[10px] text-gray-500">{session.location} • {session.status}</p>
                            </div>
                          </div>
                          <button className="text-xs font-bold text-red-500 hover:underline">Revoke</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSettingsView === 'roles' && (
                  <div className="space-y-6">
                    <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 space-y-4">
                      <h4 className="font-bold text-purple-900">Role-Based Access Control</h4>
                      <p className="text-sm text-purple-700">Define what users can see and do within ZivoHR based on their assigned roles.</p>
                    </div>
                    <div className="space-y-4">
                      {['Platform Owner', 'HR Manager', 'Finance Admin', 'Employee'].map((role) => (
                        <div key={role} className="flex items-center justify-between p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.03]">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-600 font-bold text-xs">
                              {role.charAt(0)}
                            </div>
                            <p className="text-sm font-bold text-space-gray">{role}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSettingsView === 'company' && (
                  <div className="space-y-6">
                    {/* Branding Section */}
                    <div className="p-6 bg-apple-gray/30 rounded-3xl border border-black/[0.03] space-y-6">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative group">
                          <div 
                            className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden bg-accent"
                            style={{ backgroundColor: currentCompany.accentColor }}
                          >
                            {isUploadingLogo ? (
                              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : currentCompany.logoUrl ? (
                              <img src={currentCompany.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                              currentCompany.name.charAt(0)
                            )}
                          </div>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-black/[0.05] text-gray-500 hover:text-accent transition-all hover:scale-110 active:scale-95"
                          >
                            <Upload className="w-5 h-5" />
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleLogoUpload} 
                            className="hidden" 
                            accept="image/*" 
                          />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-space-gray">Company Logo</p>
                            <p className="text-xs text-gray-500">Upload a high-resolution square logo. PNG, JPG or SVG (Max 2MB).</p>
                            {logoUploadError && (
                              <p className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 mt-2">{logoUploadError}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accent Color</p>
                            <div className="flex flex-wrap gap-2">
                              {['#007AFF', '#5856D6', '#FF2D55', '#AF52DE', '#FF9500'].map(color => (
                                <button
                                  key={color}
                                  onClick={() => {
                                    document.documentElement.style.setProperty('--accent-color', color);
                                  }}
                                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Company Name</label>
                        <input type="text" defaultValue="ZivoHR" className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Industry</label>
                        <input type="text" defaultValue="Technology" className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Tax ID (BP Number)</label>
                        <input type="text" defaultValue="200012345" className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Primary Location</label>
                        <input type="text" defaultValue="Harare, Zimbabwe" className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={cn("p-6 md:p-8 border-t flex items-center justify-end gap-4 transition-colors", isDark ? "border-white/5 bg-white/5" : "border-black/[0.05] bg-apple-gray/10")}>
                <button 
                  onClick={() => {
                    setShowProfileModal(false);
                    setActiveSettingsView('main');
                  }}
                  className={cn("px-6 py-3 text-sm font-bold transition-colors", isDark ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-space-gray")}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Settings updated successfully!');
                    setShowProfileModal(false);
                    setActiveSettingsView('main');
                  }}
                  className="btn-primary px-8 py-3"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showResetPasswordConfirm}
        onClose={() => setShowResetPasswordConfirm(false)}
        onConfirm={() => {
          alert('A password reset link has been sent to your email address!');
        }}
        title="Reset Password"
        message="Are you sure you want to reset your password? We will send a secure link to your email address to complete the process. You will be logged out of all other devices."
        confirmText="Send Reset Link"
        type="warning"
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, Bell, Command, LayoutDashboard, Users, Briefcase, TrendingUp, CreditCard, Heart, Settings, Zap, ChevronRight, Menu, X, Calendar, Clock, CheckCircle2, ArrowLeft, PartyPopper, ShieldCheck, PenTool, Upload, MessageCircle, BookOpen, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Company } from '../types';
import ConfirmationModal from './ConfirmationModal';

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
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'onboarding', label: 'Onboarding', icon: PartyPopper },
    { id: 'self_service', label: 'Self Service', icon: Users },
    { id: 'leave', label: 'Leave Tracker', icon: Calendar },
    { id: 'time', label: 'Time Tracker', icon: Clock },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
    { id: 'hiring', label: 'Recruitment', icon: Briefcase },
    { id: 'team', label: 'Organization', icon: Users },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'esignature', label: 'eSignature', icon: PenTool },
    { id: 'community', label: 'Community & Jobs', icon: MessageCircle },
    { id: 'library', label: 'HR Library', icon: BookOpen },
    { id: 'engagement', label: 'Engagement', icon: Heart },
    { id: 'workflows', label: 'Workflows', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const displayMenuItems = [...menuItems];
  if (userProfile?.role === 'platform_owner') {
    displayMenuItems.push({ id: 'owner_kpis', label: 'Owner Dashboard', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-apple-gray/20 flex overflow-x-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        className="border-r border-black/[0.05] bg-white fixed h-full hidden lg:flex flex-col shadow-sm z-50 overflow-hidden"
      >
        <div className="p-6 border-b border-black/[0.05] flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <div 
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ backgroundColor: currentCompany.accentColor }}
                >
                  {currentCompany.logo || currentCompany.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-space-gray leading-tight truncate">{currentCompany.name}</h2>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{currentCompany.plan} Plan</p>
                </div>
              </motion.div>
            )}
            {isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-lg mx-auto"
                style={{ backgroundColor: currentCompany.accentColor }}
              >
                {currentCompany.logo || currentCompany.name.charAt(0)}
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isSidebarCollapsed && (
            <button 
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-2 hover:bg-apple-gray rounded-lg text-gray-400 hover:text-accent transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {isSidebarCollapsed && (
          <div className="p-4 border-b border-black/[0.05] flex justify-center">
            <button 
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-2 hover:bg-apple-gray rounded-lg text-gray-400 hover:text-accent transition-all"
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
                  ? (item.id === 'owner_kpis' ? "bg-[#D32F2F] text-white shadow-md shadow-red-500/20" : "bg-accent text-white shadow-md shadow-accent/20")
                  : "text-gray-500 hover:text-space-gray hover:bg-apple-gray/50",
                isSidebarCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", activeTab === item.id ? "text-white" : "text-gray-400 group-hover:text-accent")} />
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
                <div className="absolute left-full ml-2 px-2 py-1 bg-space-gray text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-black/[0.05]">
            <button
              onClick={onGoHome}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-accent hover:bg-accent/5 transition-all group relative",
                isSidebarCollapsed && "justify-center px-0"
              )}
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span>Landing Page</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-space-gray text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
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
            className="p-4 border-t border-black/[0.05] bg-apple-gray/10"
          >
            <div className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Storage</p>
                <div className="w-full h-1.5 bg-black/[0.05] rounded-full mt-1">
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
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.05] px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            {onBack ? (
              <button 
                onClick={onBack}
                className="p-2 hover:bg-apple-gray rounded-xl transition-all flex items-center gap-2 text-gray-500 hover:text-accent font-bold"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-accent transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-bold text-gray-400">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="hover:text-space-gray transition-colors hidden sm:inline"
              >
                ZivoHR
              </button>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 hidden sm:inline" />
              <span className="text-space-gray capitalize truncate max-w-[100px] md:max-w-none">{activeTab.replace('_', ' ')}</span>
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
                        className="absolute right-0 mt-2 w-80 bg-white border border-black/[0.05] rounded-2xl shadow-xl z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                          <h3 className="font-bold text-space-gray">Notifications</h3>
                          <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">3 NEW</span>
                        </div>
                        <div className="max-h-96 overflow-y-auto divide-y divide-black/[0.05]">
                          {[
                            { title: 'Payroll Approved', desc: 'April 2026 payroll has been approved by Finance.', time: '2h ago', icon: CheckCircle2, color: 'text-green-500' },
                            { title: 'New Leave Request', desc: 'Sarah Johnson requested 3 days of annual leave.', time: '4h ago', icon: Calendar, color: 'text-blue-500' },
                            { title: 'System Update', desc: 'New ZIMRA tax tables have been integrated.', time: '1d ago', icon: Zap, color: 'text-yellow-500' },
                          ].map((n, i) => (
                            <div key={i} className="p-4 hover:bg-apple-gray/20 transition-colors cursor-pointer">
                              <div className="flex gap-3">
                                <div className={cn("w-8 h-8 rounded-lg bg-apple-gray/50 flex items-center justify-center flex-shrink-0", n.color)}>
                                  <n.icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-space-gray">{n.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
                                  <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="w-full p-3 text-xs font-bold text-accent hover:bg-accent/5 transition-colors border-t border-black/[0.05]">
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
                  <p className="text-xs font-bold text-space-gray">Sarah Jenkins</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">HR Manager</p>
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
              className="fixed inset-y-0 left-0 w-72 bg-white z-[80] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-black/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ backgroundColor: currentCompany.accentColor }}
                  >
                    {currentCompany.logo || currentCompany.name.charAt(0)}
                  </div>
                  <h2 className="font-bold text-space-gray">{currentCompany.name}</h2>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-apple-gray rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
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
                        ? (item.id === 'owner_kpis' ? "bg-[#F44336] text-white shadow-md shadow-red-500/20" : "bg-accent text-white shadow-md shadow-accent/20")
                        : "text-gray-500 hover:text-space-gray hover:bg-apple-gray/50"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-gray-400")} />
                    {item.label}
                  </button>
                ))}
                
                <div className="pt-4 mt-4 border-t border-black/[0.05]">
                  <button
                    onClick={() => {
                      onGoHome?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-accent hover:bg-accent/5 transition-all"
                  >
                    <LayoutDashboard className="w-5 h-5" />
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
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-4">
                  {activeSettingsView !== 'main' && (
                    <button 
                      onClick={() => setActiveSettingsView('main')}
                      className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-accent"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-space-gray">
                      {activeSettingsView === 'main' && "User Settings"}
                      {activeSettingsView === 'security' && "Security Settings"}
                      {activeSettingsView === 'roles' && "System Roles"}
                      {activeSettingsView === 'company' && "Company Configuration"}
                    </h2>
                    <p className="text-sm text-gray-500">
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
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                {activeSettingsView === 'main' && (
                  <>
                    {/* Profile Section */}
                    <section className="space-y-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Information</h3>
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-apple-gray shadow-inner">
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
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Full Name</label>
                            <input 
                              type="text" 
                              defaultValue="Sarah Jenkins"
                              className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Job Title</label>
                            <input 
                              type="text" 
                              defaultValue="HR Manager"
                              className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-accent/20"
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Account & Security */}
                    <section className="space-y-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account & Security</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => setActiveSettingsView('security')}
                          className="p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.03] text-left hover:bg-apple-gray/50 hover:border-accent/20 hover:shadow-lg transition-all flex items-center gap-3 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-space-gray">Security Settings</p>
                            <p className="text-[10px] text-gray-500">2FA, Password, Sessions</p>
                          </div>
                        </button>
                        <button 
                          onClick={() => setActiveSettingsView('roles')}
                          className="p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.03] text-left hover:bg-apple-gray/50 hover:border-accent/20 hover:shadow-lg transition-all flex items-center gap-3 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Settings className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-space-gray">System Roles</p>
                            <p className="text-[10px] text-gray-500">Manage permissions</p>
                          </div>
                        </button>
                      </div>
                    </section>

                    {/* Company Settings */}
                    <section className="space-y-4">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company Configuration</h3>
                      <button 
                        onClick={() => setActiveSettingsView('company')}
                        className="w-full p-6 bg-apple-gray/30 rounded-3xl border border-black/[0.03] space-y-4 text-left hover:bg-apple-gray/50 hover:border-accent/20 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">R</div>
                            <div>
                              <p className="font-bold text-space-gray">ZivoHR</p>
                              <p className="text-xs text-gray-500">Pro Plan • 124 Employees</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-accent group-hover:underline">Edit Company</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/[0.05]">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Currency</p>
                            <p className="text-sm font-bold text-space-gray">USD ($)</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Fiscal Year</p>
                            <p className="text-sm font-bold text-space-gray">Jan - Dec</p>
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
                            ) : currentCompany.logo ? (
                              <img src={currentCompany.logo} alt="Logo" className="w-full h-full object-cover" />
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

              <div className="p-6 md:p-8 border-t border-black/[0.05] bg-apple-gray/10 flex items-center justify-end gap-4">
                <button 
                  onClick={() => {
                    setShowProfileModal(false);
                    setActiveSettingsView('main');
                  }}
                  className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-space-gray transition-colors"
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

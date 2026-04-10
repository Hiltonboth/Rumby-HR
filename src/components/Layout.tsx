import React, { useState, useEffect } from 'react';
import { Search, Bell, Command, LayoutDashboard, Users, Briefcase, TrendingUp, CreditCard, Heart, Settings, Zap, ChevronRight, Menu, X, Calendar, Clock, CheckCircle2, ArrowLeft, PartyPopper, ShieldCheck, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Company } from '../types';

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
    { id: 'engagement', label: 'Engagement', icon: Heart },
    { id: 'workflows', label: 'Workflows', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const displayMenuItems = [...menuItems];
  if (userProfile?.role === 'platform_owner') {
    displayMenuItems.push({ id: 'owner_kpis', label: 'Owner Dashboard', icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-apple-gray/20 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-black/[0.05] bg-white fixed h-full hidden lg:flex flex-col shadow-sm">
        <div className="p-6 border-b border-black/[0.05] flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
            style={{ backgroundColor: currentCompany.accentColor }}
          >
            {currentCompany.logo || currentCompany.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-space-gray leading-tight">{currentCompany.name}</h2>
            <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{currentCompany.plan} Plan</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {displayMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                activeTab === item.id 
                  ? (item.id === 'owner_kpis' ? "bg-[#D32F2F] text-white shadow-md shadow-red-500/20" : "bg-accent text-white shadow-md shadow-accent/20")
                  : "text-gray-500 hover:text-space-gray hover:bg-apple-gray/50"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-gray-400")} />
              {item.label}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-black/[0.05]">
            <button
              onClick={onGoHome}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-accent hover:bg-accent/5 transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
              Landing Page
            </button>
          </div>
        </nav>
        
        <div className="p-4 border-t border-black/[0.05] bg-apple-gray/10">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Storage</p>
              <div className="w-32 h-1.5 bg-black/[0.05] rounded-full mt-1">
                <div className="w-1/2 h-full bg-accent rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64">
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
                Rumby HR
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
      </main>

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
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-space-gray">User Settings</h2>
                  <p className="text-sm text-gray-500">Manage your personal profile and account security.</p>
                </div>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
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
                    <button className="p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.03] text-left hover:bg-apple-gray/50 transition-all flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-space-gray">Security Settings</p>
                        <p className="text-[10px] text-gray-500">2FA, Password, Sessions</p>
                      </div>
                    </button>
                    <button className="p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.03] text-left hover:bg-apple-gray/50 transition-all flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
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
                  <div className="p-6 bg-apple-gray/30 rounded-3xl border border-black/[0.03] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white font-bold text-xl">R</div>
                        <div>
                          <p className="font-bold text-space-gray">Rumby HR</p>
                          <p className="text-xs text-gray-500">Pro Plan • 124 Employees</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-accent hover:underline">Edit Company</button>
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
                  </div>
                </section>
              </div>

              <div className="p-6 md:p-8 border-t border-black/[0.05] bg-apple-gray/10 flex items-center justify-end gap-4">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-space-gray transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert('Profile settings saved successfully!');
                    setShowProfileModal(false);
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
    </div>
  );
}

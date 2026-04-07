import React, { useState, useEffect } from 'react';
import { Search, Bell, Command, LayoutDashboard, Users, Briefcase, TrendingUp, CreditCard, Heart, Settings, Zap, ChevronRight, Menu, X, Calendar, Clock, CheckCircle2, ArrowLeft, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Company } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentCompany: Company;
  onBack?: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, currentCompany, onBack }: LayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { id: 'engagement', label: 'Engagement', icon: Heart },
    { id: 'workflows', label: 'Workflows', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                activeTab === item.id 
                  ? "bg-accent text-white shadow-md shadow-accent/20" 
                  : "text-gray-500 hover:text-space-gray hover:bg-apple-gray/50"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-gray-400")} />
              {item.label}
            </button>
          ))}
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
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.05] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="hover:text-space-gray transition-colors"
              >
                Rumby HR
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-space-gray capitalize">{activeTab.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-apple-gray/50 rounded-xl border border-black/[0.03] w-64 focus-within:bg-white focus-within:shadow-sm focus-within:ring-1 focus-within:ring-accent/20 transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search anything..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-accent transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              <div className="h-8 w-[1px] bg-black/[0.05]" />
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-space-gray">Sarah Jenkins</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">HR Manager</p>
                </div>
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-black/[0.05] shadow-sm">
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
        <div className="p-8 max-w-7xl mx-auto">
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
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                      activeTab === item.id 
                        ? "bg-accent text-white shadow-md shadow-accent/20" 
                        : "text-gray-500 hover:text-space-gray hover:bg-apple-gray/50"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-gray-400")} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

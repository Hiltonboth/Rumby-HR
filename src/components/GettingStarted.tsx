import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  Settings, 
  PartyPopper, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  ShieldCheck, 
  CreditCard,
  Target
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

import { useTheme } from './ThemeContext';

interface GettingStartedProps {
  userProfile: UserProfile | null;
  onNavigate: (tab: string) => void;
}

export default function GettingStarted({ userProfile, onNavigate }: GettingStartedProps) {
  const { isDark } = useTheme();
  const [tasks, setTasks] = useState([
    { id: 'profile', title: 'Complete your Company Profile', icon: Building2, desc: 'Set up your branding, country, and currency defaults.', status: 'completed', tab: 'settings' },
    { id: 'departments', title: 'Define your Departments', icon: Target, desc: 'Organize your team into departments and reporting lines.', status: 'pending', tab: 'settings' },
    { id: 'employees', title: 'Add your First Employee', icon: Users, desc: 'Invite or manually add team members to your organization.', status: 'pending', tab: 'team' },
    { id: 'payroll_config', title: 'Verify Payroll Config', icon: CreditCard, desc: 'Review tax bands and NSSA social security settings.', status: 'pending', tab: 'payroll' },
  ]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function checkProgress() {
      if (!userProfile?.companyId) return;

      // 1. Check departments
      const { count: deptCount } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.companyId);

      // 2. Check employees
      const { count: empCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.companyId);

      setTasks(prev => prev.map(t => {
        if (t.id === 'departments' && deptCount && deptCount > 0) return { ...t, status: 'completed' };
        if (t.id === 'employees' && empCount && empCount > 0) return { ...t, status: 'completed' };
        return t;
      }));

      // Auto-hide if all complete? Or keep as a badge of honor.
      if (deptCount && deptCount > 0 && empCount && empCount > 0) {
        // setIsVisible(false);
      }
    }

    checkProgress();
  }, [userProfile]);

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "card-aura p-0 border-2 overflow-hidden mb-12 shadow-2xl",
        isDark ? "bg-slate-900 border-white/5 shadow-black/40" : "bg-white border-accent/10 shadow-accent/5"
      )}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Left: Progress Banner */}
        <div className="lg:w-1/3 bg-gradient-to-br from-accent to-[#5856D6] p-8 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <PartyPopper className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tight">Launch Checklist</h2>
              <p className="text-white/70 text-sm font-medium mt-1">Get your workspace ready for your first payroll run.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-white/60">Progress</span>
                <span className="text-2xl font-black italic tracking-tighter">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-white rounded-full shadow-lg"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-white/50" />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Zimbabwe Compliance Ready</p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />
        </div>

        {/* Right: Tasks List */}
        <div className={cn(
          "lg:w-2/3 p-4 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4",
          isDark ? "bg-slate-900/50" : "bg-white"
        )}>
          {tasks.map((task, i) => (
            <motion.button
              key={task.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onNavigate(task.tab)}
              className={cn(
                "p-4 rounded-[1.5rem] border text-left transition-all group flex items-start gap-4",
                task.status === 'completed' 
                  ? (isDark ? "bg-green-500/10 border-green-500/20" : "bg-green-50/30 border-green-100") 
                  : (isDark ? "bg-slate-800 border-white/5 hover:bg-slate-700" : "bg-apple-gray/20 border-black/[0.03] hover:bg-apple-gray/50 hover:border-black/[0.08]")
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110",
                task.status === 'completed' ? (isDark ? "bg-slate-900 text-green-400" : "bg-white text-green-500") : (isDark ? "bg-slate-900 text-slate-500" : "bg-white text-gray-400")
              )}>
                <task.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={cn(
                    "text-sm font-bold truncate",
                    task.status === 'completed' ? (isDark ? "text-green-400" : "text-green-800") : (isDark ? "text-slate-200" : "text-space-gray")
                  )}>{task.title}</h4>
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500/10 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  )}
                </div>
                <p className={cn("text-[10px] mt-1 font-medium leading-relaxed", isDark ? "text-slate-500" : "text-gray-500")}>{task.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-black/80 py-2 px-8 flex items-center justify-between">
         <p className="text-[10px] font-black text-white/40 uppercase tracking-widest italic flex items-center gap-2">
           <Settings className="w-3 h-3" /> Zivo Success Guide
         </p>
         <button onClick={() => setIsVisible(false)} className="text-[10px] font-black text-white/60 hover:text-white uppercase tracking-widest">
           Dismiss guide
         </button>
      </div>
    </motion.div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

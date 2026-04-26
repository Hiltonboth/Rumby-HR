import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  ChevronRight, 
  FileText, 
  Box, 
  DollarSign, 
  ArrowLeft,
  PenTool,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UserProfile, Employee } from '../types';
import { onboardingService } from '../services/onboardingService';

interface OnboardingWizardProps {
  userProfile: UserProfile | null;
  onNavigate: (tab: string) => void;
}

export default function OnboardingWizard({ userProfile, onNavigate }: OnboardingWizardProps) {
  const [activeChecklist, setActiveChecklist] = useState<any>(null);
  const [allChecklists, setAllChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!userProfile?.companyId) return;
      try {
        setLoading(true);
        if (userProfile.role === 'hr') {
           const all = await onboardingService.getAllChecklists(userProfile.companyId);
           setAllChecklists(all);
        } else {
           // We need to find the employee ID for the current user
           // For now, if not HR, we assume they are the target of onboarding
           // In a real app, we'd fetch current employee first
        }
      } catch (error) {
        console.error("Error loading onboarding:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userProfile]);

  const handleToggle = async (taskId: string, isCompleted: boolean) => {
    try {
      setProcessingId(taskId);
      await onboardingService.toggleTask(taskId, isCompleted);
      
      // Refresh current view
      if (activeChecklist) {
         const fresh = await onboardingService.getChecklist(activeChecklist.employee_id);
         setActiveChecklist(fresh);
      }
      if (userProfile?.companyId) {
         const all = await onboardingService.getAllChecklists(userProfile.companyId);
         setAllChecklists(all);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
     return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {activeChecklist ? (
        /* Detailed View of a Single Checklist */
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveChecklist(null)}
                className="p-3 bg-white border border-black/[0.05] rounded-2xl hover:bg-apple-gray transition-colors"
              >
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-space-gray tracking-tight italic">Onboarding Hub</h1>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Tracking progress for {activeChecklist.employee_id}</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Task Groups */}
              <div className="lg:col-span-2 space-y-6">
                 <TaskCategoryGroup 
                   title="Compliance & Legal" 
                   icon={ShieldCheck} 
                   tasks={activeChecklist.onboarding_tasks.filter((t: any) => t.category === 'compliance')}
                   onToggle={handleToggle}
                   processingId={processingId}
                   onNavigate={onNavigate}
                 />
                 <TaskCategoryGroup 
                   title="Logistics & Assets" 
                   icon={Box} 
                   tasks={activeChecklist.onboarding_tasks.filter((t: any) => t.category === 'logistics')}
                   onToggle={handleToggle}
                   processingId={processingId}
                   onNavigate={onNavigate}
                 />
                 <TaskCategoryGroup 
                   title="Payroll & Finance" 
                   icon={DollarSign} 
                   tasks={activeChecklist.onboarding_tasks.filter((t: any) => t.category === 'finance')}
                   onToggle={handleToggle}
                   processingId={processingId}
                   onNavigate={onNavigate}
                 />
              </div>

              {/* Progress Summary Sidebar */}
              <div className="space-y-6">
                 <div className="bg-accent rounded-[2.5rem] p-10 text-white shadow-2xl shadow-accent/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                       <CheckCircle2 className="w-24 h-24" />
                    </div>
                    <h3 className="text-2xl font-black italic mb-2 tracking-tight">Onboarding Health</h3>
                    <div className="mt-8 space-y-2">
                       <div className="flex items-end justify-between font-black text-4xl">
                          <span>{activeChecklist.progress}%</span>
                          <span className="text-xs uppercase tracking-widest text-white/50 mb-2">COMPLETE</span>
                       </div>
                       <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${activeChecklist.progress}%` }}
                             className="h-full bg-white rounded-full"
                          />
                       </div>
                    </div>
                    <p className="mt-8 text-sm text-white/80 leading-relaxed font-bold italic">
                       Complete all tasks to officially clear this employee for operational work.
                    </p>
                 </div>

                 <div className="bg-white border border-black/[0.05] rounded-[2rem] p-8 space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zimbabwe Regulations</h4>
                    <div className="flex items-start gap-3 p-4 bg-orange-50/50 rounded-2xl text-orange-700">
                       <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                       <p className="text-xs font-bold leading-tight">Must submit P6 Form to ZIMRA within 30 days of hiring.</p>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>
      ) : (
        /* HR Overview View */
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-black text-space-gray tracking-tight italic">Onboarding Pipeline</h1>
            <p className="text-gray-500 mt-1">Manage new hire integration across the organization.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {allChecklists.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => setActiveChecklist(c)}
                  className="bg-white border border-black/[0.05] p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group"
                >
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl border-2 border-apple-gray overflow-hidden group-hover:scale-110 transition-transform">
                         <img src={c.employees.avatar_url || 'https://via.placeholder.com/100'} alt="User" />
                      </div>
                      <div>
                         <h4 className="font-bold text-space-gray text-lg">{c.employees.first_name} {c.employees.last_name}</h4>
                         <p className="text-xs text-gray-500">{c.employees.job_title}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-black italic tracking-tight text-accent">
                         <span>PROGRESS</span>
                         <span>{c.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-apple-gray rounded-full overflow-hidden">
                         <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${c.progress}%` }} />
                      </div>
                   </div>

                   <button className="w-full mt-6 py-4 bg-apple-gray text-space-gray text-xs font-black uppercase tracking-widest rounded-2xl group-hover:bg-accent group-hover:text-white transition-colors flex items-center justify-center gap-2">
                      Manage Entry <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
             ))}
             
             {allChecklists.length === 0 && (
                <div className="lg:col-span-3 py-32 bg-apple-gray/20 rounded-[3rem] border border-dashed border-black/10 flex flex-col items-center justify-center text-center space-y-4">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                      <LayoutGrid className="w-10 h-10 text-gray-200" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-lg font-black text-gray-400 italic">No Active Onboarding</p>
                      <p className="text-sm text-gray-400 max-w-xs">New hires from the recruitment pipeline will automatically appear here.</p>
                   </div>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCategoryGroup({ title, icon: Icon, tasks, onToggle, processingId, onNavigate }: any) {
  return (
    <div className="bg-white border border-black/[0.05] rounded-[3rem] overflow-hidden shadow-sm">
       <div className="p-8 border-b border-black/[0.05] flex items-center gap-4 bg-apple-gray/10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-accent shadow-sm">
             <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-space-gray tracking-tight italic">{title}</h3>
       </div>
       <div className="divide-y divide-black/[0.05]">
          {tasks.map((task: any) => (
             <div key={task.id} className="p-6 md:px-8 flex items-center justify-between hover:bg-apple-gray/20 transition-colors group">
                <div className="flex items-center gap-4">
                   <button 
                    onClick={() => onToggle(task.id, !task.is_completed)}
                    disabled={processingId === task.id}
                    className={cn(
                      "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all",
                      task.is_completed ? "bg-accent border-accent text-white" : "border-gray-200 hover:border-accent"
                    )}
                   >
                     {processingId === task.id ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : task.is_completed ? <CheckCircle2 className="w-4 h-4" /> : null}
                   </button>
                   <div>
                      <p className={cn("text-sm md:text-base font-bold transition-all", task.is_completed ? "text-gray-300 line-through" : "text-space-gray")}>{task.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{task.description}</p>
                   </div>
                </div>
                
                {task.title.includes('Contract') && !task.is_completed && (
                   <button 
                    onClick={() => onNavigate('esignature')}
                    className="p-3 bg-accent/5 text-accent rounded-xl hover:bg-accent hover:text-white transition-all flex items-center gap-2 group-hover:scale-105"
                   >
                      <span className="text-[10px] font-black uppercase tracking-widest">Sign Hub</span>
                      <PenTool className="w-4 h-4" />
                   </button>
                )}
             </div>
          ))}
       </div>
    </div>
  );
}

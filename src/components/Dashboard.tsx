import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  FileText,
  Users,
  TrendingUp,
  Plus,
  Send,
  CreditCard,
  Briefcase,
  Zap,
  Loader2,
  Eye,
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';
import { analyticsService } from '../services/analyticsService';
import { motion } from 'motion/react';
import GettingStarted from './GettingStarted';
import { onboardingService } from '../services/onboardingService';
import { useTheme } from './ThemeContext';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  userProfile: UserProfile | null;
}

export default function Dashboard({ onNavigate, userProfile }: DashboardProps) {
  const { isDark } = useTheme();
  const [timeframe, setTimeframe] = useState<number>(6);
  const [stats, setStats] = useState<any>(null);
  const [salaryTrends, setSalaryTrends] = useState<any[]>([]);
  const [headcountTrends, setHeadcountTrends] = useState<any[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardingTasks, setOnboardingTasks] = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!userProfile?.companyId) return;
      try {
        setLoading(true);
        const [dashStats, trendData, headData, expiryData] = await Promise.all([
          analyticsService.getDashboardStats(userProfile.companyId),
          analyticsService.getSalaryTrends(userProfile.companyId, timeframe),
          analyticsService.getHeadcountTrends(userProfile.companyId, timeframe),
          analyticsService.getExpiringContracts(userProfile.companyId)
        ]);
        setStats(dashStats);
        setSalaryTrends(trendData);
        setHeadcountTrends(headData);
        setExpiringContracts(expiryData);

        // Load onboarding tasks for the employee if not owner/hr
        if (userProfile.role === 'employee') {
          const checklist = await onboardingService.getChecklist(userProfile.uid);
          setOnboardingTasks(checklist?.onboarding_tasks || []);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [userProfile, timeframe]);

  const handleCompleteTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await onboardingService.toggleTask(taskId, !currentStatus);
      setOnboardingTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  const isOwner = userProfile?.role === 'owner' || userProfile?.role === 'hr';
  const isNewCompany = stats?.headcount <= 1 && stats?.totalDocs === 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Onboarding Helper for Owners */}
      {isOwner && isNewCompany && (
        <GettingStarted userProfile={userProfile} onNavigate={onNavigate} />
      )}

      {/* Welcome Checklist for New Employees */}
      {onboardingTasks.length > 0 && onboardingTasks.some(t => !t.is_completed) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-accent/20 relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Zap className="w-64 h-64 rotate-12" />
          </div>
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Welcome to the Team!</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-[0.9] uppercase">
                Your <span className="opacity-50">Launch</span> Checklist.
              </h2>
              <p className="text-white/60 font-medium max-w-xl">
                We're excited to have you on board. Please complete these initial tasks to get fully settled into your new role.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {onboardingTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleCompleteTask(task.id, task.is_completed)}
                  className={cn(
                    "p-6 rounded-3xl border transition-all flex items-center justify-between group",
                    task.is_completed 
                      ? "bg-white/5 border-white/5 opacity-50" 
                      : "bg-white text-space-gray border-white shadow-xl hover:scale-[1.02]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      task.is_completed ? "bg-green-500 text-white" : "bg-apple-gray text-gray-400 group-hover:bg-accent group-hover:text-white"
                    )}>
                      {task.is_completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black italic uppercase tracking-tight">{task.title}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{task.category || 'Standard'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Welcome & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-space-gray")}>Command Center</h1>
          <p className={cn("text-gray-500 mt-2", isDark ? "text-slate-400" : "text-gray-500")}>Real-time health of {userProfile?.fullName}'s organization.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-accent border transition-colors",
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-black/[0.1] text-space-gray"
            )}
          >
            <option value={1}>Last Month</option>
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
          </select>
          <div className="flex gap-2">
             <button onClick={() => onNavigate('hiring')} className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-2">
               <Plus className="w-4 h-4" /> New Hire
             </button>
             <button onClick={() => onNavigate('payroll')} className="btn-primary py-2 px-4 text-xs font-bold shadow-lg shadow-accent/20 flex items-center gap-2">
               <DollarSign className="w-4 h-4" /> Run Payroll
             </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          label="Total Payroll (Last Month)" 
          value={`$${stats?.monies.toLocaleString()}`}
          subtext="Processed in last run"
          icon={DollarSign}
          color="accent"
          onClick={() => onNavigate('payroll')}
        />
         <KPICard 
          label="Employee Headcount" 
          value={stats?.headcount || '0'}
          subtext="Active employees"
          icon={Users}
          color="blue"
          onClick={() => onNavigate('team')}
        />
        <KPICard 
          label="New Hires (30d)" 
          value={stats?.hires || '0'}
          subtext="Onboarding pipeline"
          icon={TrendingUp}
          color="green"
          onClick={() => onNavigate('team')}
        />
        <KPICard 
          label="Pending Signatures" 
          value={stats?.pendingDocs || '0'}
          subtext={`out of ${stats?.totalDocs} total docs`}
          icon={PenToolIcon}
          color="orange"
          onClick={() => onNavigate('esignature')}
        />
        {userProfile?.role === 'hr' && stats?.pendingChanges > 0 && (
          <KPICard 
            label="Profile Requests" 
            value={stats?.pendingChanges}
            subtext="Awaiting HR approval"
            icon={AlertCircle}
            color="orange"
            onClick={() => onNavigate('self_service')}
          />
        )}
        {userProfile?.role === 'hr' && stats?.activeOnboardings > 0 && (
          <KPICard 
            label="Onboarding Active" 
            value={stats?.activeOnboardings}
            subtext="Track new hire progress"
            icon={Zap}
            color="purple"
            onClick={() => onNavigate('onboarding')}
          />
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Trends */}
        <div className={cn("border rounded-[2rem] p-8 shadow-sm transition-colors", isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-black/[0.05]")}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={cn("font-bold text-lg tracking-tight", isDark ? "text-white" : "text-space-gray")}>Salary Expenditure</h3>
            <div className={cn("p-2 rounded-xl", isDark ? "bg-slate-800 text-slate-500" : "bg-apple-gray text-gray-400")}>
               <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salaryTrends}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007AFF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Headcount Growth */}
        <div className={cn("border rounded-[2rem] p-8 shadow-sm transition-colors", isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-black/[0.05]")}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={cn("font-bold text-lg tracking-tight", isDark ? "text-white" : "text-space-gray")}>Headcount Growth</h3>
            <div className={cn("p-2 rounded-xl", isDark ? "bg-slate-800 text-slate-500" : "bg-apple-gray text-gray-400")}>
               <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={headcountTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                />
                <Tooltip 
                   cursor={{ fill: '#007AFF10' }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {headcountTrends.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === headcountTrends.length - 1 ? '#007AFF' : '#E5E7EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compliance Radar */}
      <div className={cn("border rounded-[2rem] p-8 shadow-sm transition-colors", isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-black/[0.05]")}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className={cn("font-bold text-xl tracking-tight", isDark ? "text-white" : "text-space-gray")}>Compliance Radar</h3>
            <p className={cn("text-xs font-medium tracking-tight", isDark ? "text-slate-400" : "text-gray-500")}>Automatic contract expiry & document alerts.</p>
          </div>
          <div className={cn("p-3 rounded-2xl", isDark ? "bg-red-500/10 text-red-500" : "bg-red-50")}>
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expiringContracts.length === 0 ? (
            <div className={cn("lg:col-span-3 py-12 text-center rounded-[2rem] border-2 border-dashed transition-colors", isDark ? "bg-slate-800/10 border-white/5" : "bg-apple-gray/20 border-black/[0.03]")}>
              <ShieldCheckIcon className={cn("w-12 h-12 mx-auto mb-4", isDark ? "text-slate-700" : "text-gray-300")} />
              <p className={cn("font-bold tracking-tight", isDark ? "text-slate-500" : "text-gray-500")}>System Secure • All contracts are currently active.</p>
            </div>
          ) : (
            expiringContracts.map((contract) => {
              const daysLeft = Math.ceil((new Date(contract.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const isCritical = daysLeft <= 30;

              return (
                <div 
                  key={contract.id}
                  onClick={() => onNavigate('team')}
                  className={cn(
                    "p-6 rounded-3xl border transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer group",
                    isCritical 
                      ? (isDark ? "bg-red-500/5 border-red-500/20" : "bg-red-50/30 border-red-100") 
                      : (isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]")
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                       src={contract.avatar || `https://ui-avatars.com/api/?name=${contract.name}&background=random`} 
                       alt={contract.name} 
                       className="w-10 h-10 rounded-xl object-cover"
                       referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className={cn("text-sm font-bold", isDark ? "text-white" : "text-space-gray")}>{contract.name}</p>
                        <p className={cn("text-[10px] font-medium tracking-tight", isDark ? "text-slate-500" : "text-gray-500")}>{contract.role}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                      isCritical ? "bg-red-500 text-white" : "bg-orange-500 text-white"
                    )}>
                      {daysLeft} Days
                    </span>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className={cn("text-[9px] font-black uppercase tracking-widest", isDark ? "text-slate-600" : "text-gray-400")}>Expires On</p>
                      <p className={cn("text-xs font-bold", isDark ? "text-slate-300" : "text-space-gray")}>{new Date(contract.expiryDate).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => onNavigate('team')} 
                      className={cn("p-2 rounded-xl transition-all border", isDark ? "bg-slate-800 border-white/5 hover:bg-slate-700" : "bg-white border-black/[0.05] hover:bg-apple-gray")}
                    >
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recruitment & Signatures Mixed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Recruitment Funnel */}
         <div className={cn("border rounded-[2rem] p-8 shadow-sm lg:col-span-1 transition-colors", isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-black/[0.05]")}>
            <h3 className={cn("font-bold mb-6", isDark ? "text-white" : "text-space-gray")}>Recruitment Funnel</h3>
            <div className="space-y-6">
              <FunnelItem label="Total Applicants" count={stats?.applicants || 0} percentage="100%" color="bg-accent" isDark={isDark} />
              <FunnelItem label="Offers Sent" count={0} percentage="0%" color="bg-purple-500" isDark={isDark} />
              <FunnelItem label="Successfully Hired" count={stats?.hires || 0} percentage={`${stats?.applicants ? Math.round((stats.hires / stats.applicants) * 100) : 0}%`} color="bg-green-500" isDark={isDark} />
            </div>
            <button 
              onClick={() => onNavigate('hiring')}
              className={cn(
                "w-full mt-8 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-apple-gray text-space-gray hover:bg-black/5"
              )}
            >
              Manage Pipeline <ChevronRight className="w-4 h-4" />
            </button>
         </div>

         {/* Pending Signature Queue */}
         <div className={cn("border rounded-[2rem] p-8 shadow-sm lg:col-span-2 transition-colors", isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-black/[0.05]")}>
            <div className="flex items-center justify-between mb-6">
               <h3 className={cn("font-bold", isDark ? "text-white" : "text-space-gray")}>E-Signature Queue</h3>
               <span className={cn("text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full", isDark ? "bg-orange-500/10 text-orange-500 border border-orange-500/20" : "bg-orange-50 text-orange-600")}>{stats?.pendingDocs} ACTION REQUIRED</span>
            </div>
            
            <div className="space-y-4">
               {stats?.totalDocs === 0 ? (
                 <div className="py-12 text-center text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No active signature flows.</p>
                 </div>
               ) : (
                 <div className="flex flex-col gap-3">
                   <div className={cn("p-4 rounded-2xl border transition-colors flex items-center justify-between", isDark ? "bg-slate-800/30 border-white/5" : "bg-apple-gray/30 border-black/[0.03]")}>
                     <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", isDark ? "bg-slate-800 text-accent" : "bg-white text-accent")}>
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className={cn("text-sm font-bold", isDark ? "text-white" : "text-space-gray")}>{stats?.signedDocs} Signed Documents</p>
                          <p className={cn("text-[10px]", isDark ? "text-slate-500" : "text-gray-500")}>Electronically sealed</p>
                        </div>
                     </div>
                     <button onClick={() => onNavigate('esignature')} className="text-xs font-bold text-accent hover:underline">View All</button>
                   </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, subtext, icon: Icon, color, onClick }: any) {
  const { isDark } = useTheme();
  const colorMap = {
    accent: isDark ? "text-accent bg-accent/10" : "text-accent bg-accent/5",
    blue: isDark ? "text-blue-400 bg-blue-500/10" : "text-blue-600 bg-blue-50",
    green: isDark ? "text-green-400 bg-green-500/10" : "text-green-600 bg-green-50",
    orange: isDark ? "text-orange-400 bg-orange-500/10" : "text-orange-600 bg-orange-50",
    purple: isDark ? "text-purple-400 bg-purple-500/10" : "text-purple-600 bg-purple-50",
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "border p-8 rounded-[2rem] text-left hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 group",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-black/[0.05]"
      )}
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", colorMap[color as keyof typeof colorMap])}>
        <Icon className="w-6 h-6" />
      </div>
      <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", isDark ? "text-slate-500" : "text-gray-400")}>{label}</p>
      <h4 className={cn("text-3xl font-black tracking-tight", isDark ? "text-white" : "text-space-gray")}>{value}</h4>
      <div className="flex items-center gap-1 mt-2 text-gray-400">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold">{subtext}</span>
      </div>
    </button>
  );
}

function FunnelItem({ label, count, percentage, color, isDark }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className={cn(isDark ? "text-slate-400" : "text-gray-500")}>{label}</span>
        <span className={isDark ? "text-white" : "text-space-gray"}>{count}</span>
      </div>
      <div className={cn("h-2 w-full rounded-full overflow-hidden", isDark ? "bg-slate-800" : "bg-apple-gray")}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: percentage }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}

function PenToolIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

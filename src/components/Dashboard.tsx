import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  FileText,
  Users,
  TrendingUp,
  Plus,
  Zap,
  Loader2,
  Sparkles,
  Sun,
  Moon,
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
import { motion, useInView } from 'motion/react';
import GettingStarted from './GettingStarted';
import { onboardingService } from '../services/onboardingService';
import { useTheme } from './ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

// ─── Animation variants (Documenso-style) ────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
});

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface DashboardProps {
  onNavigate: (tab: string) => void;
  userProfile: UserProfile | null;
}

// ─── Main component ───────────────────────────────────────────────────────────

function ThemeToggle({ isDark, toggle, T }: { isDark: boolean; toggle: () => void; T: any }) {
  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #1c1d30 0%, #12131e 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f0f1fa 100%)',
        borderColor: T.cardBorder,
        color: T.heading,
      }}
      className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all duration-300 overflow-hidden group"
      aria-label="Toggle theme"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, rgba(251,191,36,0.08) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        animate={{ rotate: isDark ? 0 : 180, opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Moon className="w-4 h-4 text-indigo-400" />
      </motion.div>

      <motion.div
        animate={{ rotate: isDark ? -180 : 0, opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Sun className="w-4 h-4 text-amber-500" />
      </motion.div>

      <span className="w-4 h-4" />

      <span className="text-xs font-bold relative z-10" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
        {isDark ? 'Dark' : 'Light'}
      </span>

      <div
        className="w-8 h-4 rounded-full relative flex-shrink-0 transition-colors duration-300"
        style={{ background: isDark ? '#7c3aed' : '#e2e8f0' }}
      >
        <motion.div
          animate={{ x: isDark ? 16 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm"
        />
      </div>
    </motion.button>
  );
}

export default function Dashboard({ onNavigate, userProfile }: DashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();
  const [timeframe, setTimeframe]                   = useState<number>(6);
  const [stats, setStats]                           = useState<any>(null);
  const [salaryTrends, setSalaryTrends]             = useState<any[]>([]);
  const [headcountTrends, setHeadcountTrends]       = useState<any[]>([]);
  const [expiringContracts, setExpiringContracts]   = useState<any[]>([]);
  const [loading, setLoading]                       = useState(true);
  const [onboardingTasks, setOnboardingTasks]       = useState<any[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!userProfile?.companyId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [dashStats, trendData, headData, expiryData] = await Promise.all([
          analyticsService.getDashboardStats(userProfile.companyId),
          analyticsService.getSalaryTrends(userProfile.companyId, timeframe),
          analyticsService.getHeadcountTrends(userProfile.companyId, timeframe),
          analyticsService.getExpiringContracts(userProfile.companyId),
        ]);
        setStats(dashStats);
        setSalaryTrends(trendData || []);
        setHeadcountTrends(headData || []);
        setExpiringContracts(expiryData || []);

        if (userProfile.role === 'employee') {
          const checklist = await onboardingService.getChecklist(userProfile.uid);
          setOnboardingTasks(checklist?.onboarding_tasks || []);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [userProfile?.companyId, timeframe]);

  const handleCompleteTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await onboardingService.toggleTask(taskId, !currentStatus);
      setOnboardingTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, is_completed: !currentStatus } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ── colour tokens – one source of truth ──────────────────────────────────
  const T = {
    pageBg:      isDark ? '#080910'  : '#f0f1fa',
    cardBg:      isDark ? '#12131e'  : '#ffffff',
    cardBorder:  isDark ? '#1c1d30'  : 'rgba(148,163,184,0.35)',
    innerBg:     isDark ? '#0d0e18'  : '#f8fafc',
    innerBorder: isDark ? '#1c1d30'  : 'rgba(148,163,184,0.25)',
    heading:     isDark ? '#f1f5f9'  : '#0f172a',
    muted:       isDark ? '#64748b'  : '#64748b',
    dim:         isDark ? '#374151'  : '#94a3b8',
    label:       isDark ? '#475569'  : '#94a3b8',
    gridLine:    isDark ? '#1c1d30'  : '#f1f5f9',
    tooltipBg:   isDark ? '#12131e'  : '#ffffff',
    tooltipBorder: isDark ? '#1c1d30' : '#e2e8f0',
    inputBg:     isDark ? '#12131e'  : '#ffffff',
    inputBorder: isDark ? '#1c1d30'  : 'rgba(148,163,184,0.5)',
  };

  if (loading && !stats) {
    return (
      <div style={{ background: T.pageBg }} className="h-[60vh] flex items-center justify-center">
        <div style={{ background: T.cardBg, borderColor: T.cardBorder }}
          className="w-16 h-16 rounded-2xl border flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-violet-500 animate-spin" />
        </div>
      </div>
    );
  }

  const isOwner      = userProfile?.role === 'owner' || userProfile?.role === 'hr';
  const isNewCompany = stats?.headcount <= 1 && stats?.totalDocs === 0;

  const kpiCards = [
    { label: t('payroll'), value: `$${stats?.monies?.toLocaleString() ?? '0'}`, subtext: 'Processed in last run',         icon: DollarSign,  accent: 'violet', trend: '+12%',   nav: 'payroll'     },
    { label: t('employees'),     value: stats?.headcount ?? '0',                      subtext: 'Across all departments',         icon: Users,       accent: 'blue',   trend: 'Active', nav: 'team'        },
    { label: 'New Hires',     value: stats?.hires ?? '0',                          subtext: 'Onboarding pipeline',            icon: TrendingUp,  accent: 'emerald',trend: '+3',     nav: 'team'        },
    { label: 'Pending Sigs',  value: stats?.pendingDocs ?? '0',                    subtext: `of ${stats?.totalDocs ?? 0} docs`, icon: FileText, accent: 'amber', trend: 'Urgent', nav: 'esignature' },
    ...(userProfile?.role === 'hr' && stats?.pendingChanges > 0
      ? [{ label: 'Profile Requests', value: stats.pendingChanges, subtext: 'Awaiting approval', icon: AlertCircle, accent: 'amber', trend: 'Pending', nav: 'self_service' }] : []),
    ...(userProfile?.role === 'hr' && stats?.activeOnboardings > 0
      ? [{ label: 'Onboarding', value: stats.activeOnboardings, subtext: 'New hire progress', icon: Zap, accent: 'purple', trend: 'Active', nav: 'onboarding' }] : []),
  ];

  return (
    <div style={{ background: T.pageBg }} className="min-h-screen transition-colors duration-300">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div style={{ opacity: isDark ? 0.06 : 0.1 }}
          className="absolute -top-56 -right-56 w-[700px] h-[700px] rounded-full blur-[160px] bg-violet-600" />
        <div style={{ opacity: isDark ? 0.04 : 0.07 }}
          className="absolute top-1/2 -left-72 w-[600px] h-[600px] rounded-full blur-[140px] bg-indigo-500" />
      </div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="relative z-10 max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 pt-6 space-y-5"
      >
        {/* Onboarding Helper */}
        {isOwner && isNewCompany && (
          <motion.div variants={fadeUp}>
            <GettingStarted userProfile={userProfile} onNavigate={onNavigate} />
          </motion.div>
        )}

        {/* Employee Checklist */}
        {onboardingTasks.length > 0 && onboardingTasks.some(t => !t.is_completed) && (
          <motion.div
            variants={fadeUp}
            className="relative rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6d28d9 100%)' }}
          >
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute top-0 right-0 p-10 opacity-[0.04]">
              <Zap className="w-56 h-56 rotate-12" />
            </div>
            <div className="relative z-10 p-8 md:p-12 space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Welcome aboard!</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  Your Launch <span className="text-white/40">Checklist</span>
                </h2>
                <p className="text-white/60 text-sm max-w-xl">Complete these tasks to get fully settled into your new role.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {onboardingTasks.map((task, i) => (
                  <motion.button
                    key={task.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    onClick={() => handleCompleteTask(task.id, task.is_completed)}
                    className={cn(
                      'p-5 rounded-xl border backdrop-blur-sm transition-all flex items-center gap-4 text-left',
                      task.is_completed
                        ? 'bg-white/5 border-white/10 opacity-50'
                        : 'bg-white/10 border-white/20 hover:bg-white/[0.18] hover:scale-[1.02]'
                    )}
                  >
                    <div className={cn('w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center', task.is_completed ? 'bg-green-500/20' : 'bg-white/10')}>
                      {task.is_completed ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-white/70" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{task.title}</p>
                      <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-0.5">{task.category || 'Standard'}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Page Header ── */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              <span style={{ color: isDark ? '#a78bfa' : '#7c3aed' }} className="text-[10px] font-black uppercase tracking-[0.2em]">
                Live Dashboard
              </span>
            </div>
            <h1 style={{ color: T.heading }} className="text-2xl font-black tracking-tight">Command Center</h1>
            <p style={{ color: T.muted }} className="text-sm mt-0.5">
              Real-time overview of{' '}
              <span style={{ color: isDark ? '#e2e8f0' : '#1e293b' }} className="font-semibold">
                {userProfile?.fullName}'s
              </span>{' '}
              organization
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <ThemeToggle isDark={isDark} toggle={toggleTheme} T={T} />

            <select
              value={timeframe}
              onChange={e => setTimeframe(Number(e.target.value))}
              style={{ background: T.inputBg, borderColor: T.inputBorder, color: T.heading }}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold outline-none border transition-all cursor-pointer focus:border-violet-500 hover:border-violet-500/50"
            >
              <option value={1}>Last Month</option>
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
            </select>

            <button
              onClick={() => onNavigate('hiring')}
              style={{ background: T.inputBg, borderColor: T.inputBorder, color: T.heading }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all hover:border-violet-500/40"
            >
              <Plus className="w-4 h-4" /> New Hire
            </button>

            <button
              onClick={() => onNavigate('payroll')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <DollarSign className="w-4 h-4" /> Run Payroll
            </button>
          </div>
        </motion.div>

        {/* ── KPI Cards ── */}
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((item, i) => (
            <KPICard key={item.label} {...item} index={i} onClick={() => onNavigate(item.nav)} isDark={isDark} T={T} />
          ))}
        </motion.div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatedSection delay={0}>
            <ChartCard title="Salary Expenditure" subtitle="Monthly payroll spend" icon={DollarSign} isDark={isDark} T={T}>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salaryTrends}>
                    <defs>
                      <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7c3aed" stopOpacity={isDark ? 0.22 : 0.12} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.gridLine} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 600, fill: T.dim }} dy={10} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 600, fill: T.dim }} dx={-8} />
                    <Tooltip contentStyle={{
                      borderRadius: '12px', border: `1px solid ${T.tooltipBorder}`,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
                      background: T.tooltipBg, color: T.heading,
                      padding: '10px 16px', fontSize: '12px', fontWeight: 700,
                    }} />
                    <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2.5}
                      fillOpacity={1} fill="url(#salaryGrad)" dot={false}
                      activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </AnimatedSection>

          <AnimatedSection delay={0.08}>
            <ChartCard title="Headcount Growth" subtitle="Team size over time" icon={Users} isDark={isDark} T={T}>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={headcountTrends} barSize={26}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.gridLine} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 600, fill: T.dim }} dy={10} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 600, fill: T.dim }} dx={-8} />
                    <Tooltip cursor={{ fill: '#7c3aed10', radius: 6 }}
                      contentStyle={{
                        borderRadius: '12px', border: `1px solid ${T.tooltipBorder}`,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
                        background: T.tooltipBg, color: T.heading,
                        padding: '10px 16px', fontSize: '12px', fontWeight: 700,
                      }} />
                    <Bar dataKey="value" radius={[6, 6, 2, 2]}>
                      {headcountTrends.map((_e, idx) => (
                        <Cell key={`cell-${idx}`}
                          fill={idx === headcountTrends.length - 1 ? '#7c3aed' : (isDark ? '#1c1d30' : '#e2e8f0')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </AnimatedSection>
        </div>

        {/* ── Compliance Radar ── */}
        <AnimatedSection delay={0}>
          <div style={{ background: T.cardBg, borderColor: T.cardBorder }} className="rounded-2xl border p-6 transition-colors">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 style={{ color: T.heading }} className="font-black text-lg tracking-tight">Compliance Radar</h3>
                <p style={{ color: T.muted }} className="text-xs mt-0.5">Automatic contract expiry & document alerts</p>
              </div>
              <div style={{ background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2' }}
                className="w-10 h-10 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expiringContracts.length === 0 ? (
                <div style={{ borderColor: T.innerBorder }}
                  className="lg:col-span-3 py-14 text-center rounded-xl border-2 border-dashed">
                  <ShieldCheckIcon style={{ color: T.innerBorder }} className="w-10 h-10 mx-auto mb-3" />
                  <p style={{ color: T.muted }} className="font-bold text-sm">All Clear — No expiring contracts</p>
                  <p style={{ color: T.dim }} className="text-xs mt-1">System is fully compliant</p>
                </div>
              ) : (
                expiringContracts.map((contract, i) => {
                  const daysLeft = Math.ceil((new Date(contract.expiryDate).getTime() - Date.now()) / 86400000);
                  const isCritical = daysLeft <= 30;
                  return (
                    <motion.div
                      key={contract.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -2 }}
                      onClick={() => onNavigate('team')}
                      style={{
                        background: isCritical ? (isDark ? 'rgba(239,68,68,0.05)' : '#fef2f2') : T.innerBg,
                        borderColor: isCritical ? (isDark ? 'rgba(239,68,68,0.2)' : '#fecaca') : T.innerBorder,
                      }}
                      className="group p-5 rounded-xl border transition-all hover:shadow-xl cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={contract.avatar || `https://ui-avatars.com/api/?name=${contract.name}&background=random`}
                            alt={contract.name}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p style={{ color: T.heading }} className="text-sm font-bold truncate">{contract.name}</p>
                            <p style={{ color: T.muted }} className="text-xs truncate">{contract.role}</p>
                          </div>
                        </div>
                        <span className={cn(
                          'flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white',
                          isCritical ? 'bg-red-500' : 'bg-amber-500'
                        )}>
                          {daysLeft}d
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p style={{ color: T.dim }} className="text-[10px] font-bold uppercase tracking-widest mb-0.5">Expires</p>
                          <p style={{ color: isDark ? '#cbd5e1' : '#475569' }} className="text-xs font-semibold">
                            {new Date(contract.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ background: T.innerBg, borderColor: T.innerBorder }}
                          className="w-8 h-8 rounded-lg border flex items-center justify-center group-hover:border-violet-500/40 transition-colors">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </AnimatedSection>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recruitment Funnel */}
          <AnimatedSection delay={0}>
            <div style={{ background: T.cardBg, borderColor: T.cardBorder }} className="rounded-2xl border p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 style={{ color: T.heading }} className="font-black text-base tracking-tight">Recruitment Funnel</h3>
                  <p style={{ color: T.muted }} className="text-xs mt-0.5">Pipeline overview</p>
                </div>
                <div style={{ background: isDark ? 'rgba(124,58,237,0.1)' : '#f5f3ff' }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                </div>
              </div>

              <div className="space-y-5 flex-1">
                {[
                  { label: 'Total Applicants',   count: stats?.applicants || 0, pct: '100%', color: '#7c3aed' },
                  { label: 'Offers Sent',        count: 0,                      pct: '0%',   color: '#6366f1' },
                  { label: 'Successfully Hired', count: stats?.hires || 0,
                    pct: `${stats?.applicants ? Math.round((stats.hires / stats.applicants) * 100) : 0}%`,
                    color: '#10b981' },
                ].map(fi => (
                  <FunnelItem key={fi.label} label={fi.label} count={fi.count} percentage={fi.pct} color={fi.color} T={T} />
                ))}
              </div>

              <button
                onClick={() => onNavigate('hiring')}
                style={{ background: T.innerBg, borderColor: T.innerBorder, color: T.muted }}
                className="w-full mt-6 py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 hover:border-violet-500/40"
              >
                Manage Pipeline <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </AnimatedSection>

          {/* E-Signature Queue */}
          <AnimatedSection delay={0.08} className="lg:col-span-2">
            <div style={{ background: T.cardBg, borderColor: T.cardBorder }} className="rounded-2xl border p-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 style={{ color: T.heading }} className="font-black text-base tracking-tight">E-Signature Queue</h3>
                  <p style={{ color: T.muted }} className="text-xs mt-0.5">Pending document signatures</p>
                </div>
                <div style={{
                  background: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb',
                  borderColor: isDark ? 'rgba(245,158,11,0.2)' : '#fde68a',
                  color: isDark ? '#fbbf24' : '#d97706'
                }} className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border">
                  {stats?.pendingDocs ?? 0} Pending
                </div>
              </div>

              {stats?.totalDocs === 0 ? (
                <div style={{ borderColor: T.innerBorder }} className="py-14 text-center rounded-xl border-2 border-dashed">
                  <FileText style={{ color: T.innerBorder }} className="w-10 h-10 mx-auto mb-3" />
                  <p style={{ color: T.muted }} className="text-sm font-semibold">No active signature flows</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div style={{ background: T.innerBg, borderColor: T.innerBorder }}
                    className="p-4 rounded-xl border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div style={{ background: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5' }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p style={{ color: T.heading }} className="text-sm font-bold">{stats?.signedDocs} Signed Documents</p>
                        <p style={{ color: T.muted }} className="text-xs">Electronically sealed & archived</p>
                      </div>
                    </div>
                    <button onClick={() => onNavigate('esignature')} className="text-xs font-bold text-violet-500 hover:text-violet-400 transition-colors">
                      View All →
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total Docs', value: stats?.totalDocs  ?? 0 },
                      { label: 'Signed',     value: stats?.signedDocs ?? 0 },
                      { label: 'Pending',    value: stats?.pendingDocs ?? 0 },
                    ].map(item => (
                      <div key={item.label} style={{ background: T.innerBg, borderColor: T.innerBorder }}
                        className="p-3 rounded-xl border text-center">
                        <p style={{ color: T.heading }} className="text-xl font-black">{item.value}</p>
                        <p style={{ color: T.dim }} className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Animated section wrapper (scroll-triggered, Documenso-style) ─────────────

function AnimatedSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const accentMap: Record<string, { iconDark: string; iconLight: string; badgeDark: string; badgeLight: string; glow: string }> = {
  violet:  { iconDark: 'rgba(124,58,237,0.12)',  iconLight: '#f5f3ff', badgeDark: 'rgba(167,139,250,0.12)', badgeLight: '#ede9fe', glow: '#7c3aed' },
  blue:    { iconDark: 'rgba(59,130,246,0.12)',   iconLight: '#eff6ff', badgeDark: 'rgba(147,197,253,0.12)', badgeLight: '#dbeafe', glow: '#3b82f6' },
  emerald: { iconDark: 'rgba(16,185,129,0.12)',   iconLight: '#ecfdf5', badgeDark: 'rgba(110,231,183,0.12)', badgeLight: '#d1fae5', glow: '#10b981' },
  amber:   { iconDark: 'rgba(245,158,11,0.12)',   iconLight: '#fffbeb', badgeDark: 'rgba(252,211,77,0.12)',  badgeLight: '#fef3c7', glow: '#f59e0b' },
  purple:  { iconDark: 'rgba(168,85,247,0.12)',   iconLight: '#faf5ff', badgeDark: 'rgba(216,180,254,0.12)', badgeLight: '#ede9fe', glow: '#a855f7' },
};
const accentText: Record<string, { dark: string; light: string }> = {
  violet:  { dark: '#a78bfa', light: '#7c3aed' },
  blue:    { dark: '#93c5fd', light: '#2563eb' },
  emerald: { dark: '#6ee7b7', light: '#059669' },
  amber:   { dark: '#fcd34d', light: '#d97706' },
  purple:  { dark: '#d8b4fe', light: '#9333ea' },
};

function KPICard({ label, value, subtext, icon: Icon, accent, trend, onClick, isDark, index, T }: any) {
  const a = accentMap[accent] ?? accentMap.violet;
  const tx = accentText[accent] ?? accentText.violet;

  return (
    <motion.button
      variants={stagger(index * 0.06)}
      onClick={onClick}
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
      whileTap={{ scale: 0.98 }}
      style={{ background: T.cardBg, borderColor: T.cardBorder }}
      className="group relative w-full text-left p-5 rounded-2xl border overflow-hidden transition-colors duration-200 hover:border-violet-500/30"
    >
      {/* Documenso-style gradient wash on hover */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(ellipse at top right, ${a.glow}08 0%, transparent 60%)` }} />

      <div className="flex items-start justify-between mb-5 relative">
        <motion.div
          whileHover={{ scale: 1.08, rotate: 3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{ background: isDark ? a.iconDark : a.iconLight }}
          className="w-11 h-11 rounded-xl flex items-center justify-center"
        >
          <Icon className="w-5 h-5" style={{ color: tx[isDark ? 'dark' : 'light'] }} />
        </motion.div>
        <span style={{
          background: isDark ? a.badgeDark : a.badgeLight,
          color: tx[isDark ? 'dark' : 'light'],
          border: `1px solid ${isDark ? a.badgeDark : a.badgeLight}`,
        }} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
          {trend}
        </span>
      </div>

      <div className="space-y-0.5 relative">
        <p style={{ color: T.label }} className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
        <h4 style={{ color: T.heading }} className="text-3xl font-black tracking-tight leading-none">{value}</h4>
        <p style={{ color: T.dim }} className="text-xs pt-1">{subtext}</p>
      </div>
    </motion.button>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────

function ChartCard({ title, subtitle, icon: Icon, isDark, T, children }: any) {
  return (
    <div style={{ background: T.cardBg, borderColor: T.cardBorder }} className="rounded-2xl border p-6 transition-colors">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 style={{ color: T.heading }} className="font-black text-base tracking-tight">{title}</h3>
          <p style={{ color: T.muted }} className="text-xs mt-0.5">{subtitle}</p>
        </div>
        <div style={{ background: T.innerBg, borderColor: T.innerBorder }}
          className="w-9 h-9 rounded-xl border flex items-center justify-center">
          <Icon style={{ color: T.dim }} className="w-4 h-4" />
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Funnel Item ──────────────────────────────────────────────────────────────

function FunnelItem({ label, count, percentage, color, T }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span style={{ color: T.muted }} className="text-xs font-semibold">{label}</span>
        <span style={{ color: T.heading }} className="text-xs font-black tabular-nums">{count}</span>
      </div>
      <div style={{ background: T.innerBg }} className="h-1.5 w-full rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: percentage }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ background: color }}
          className="h-full rounded-full"
        />
      </div>
      <p style={{ color: T.dim }} className="text-[10px] font-bold">{percentage} conversion</p>
    </div>
  );
}

// ─── SVG icon helpers ─────────────────────────────────────────────────────────

function PenToolIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function ShieldCheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
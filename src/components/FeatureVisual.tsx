import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeContext';
import { Shield, Users, CreditCard, FileText, Activity, Zap, CheckCircle2, Globe, Heart, MousePointer2 } from 'lucide-react';

export const FeatureVisual = ({ type }: { type: string }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerClass = `w-full h-full rounded-[2.5rem] overflow-hidden relative border transition-all duration-700 ${
    isDark 
      ? 'bg-slate-900/40 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]' 
      : 'bg-white border-indigo-500/10 shadow-2xl shadow-indigo-500/10'
  }`;

  const renderVisual = () => {
    switch (type) {
      case 'hiring':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Background nodes */}
            <div className="absolute inset-0 opacity-10">
               <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500 rounded-full blur-[100px]" />
               <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500 rounded-full blur-[120px]" />
            </div>
            
            <div className="relative z-10 w-full max-w-md space-y-4">
              <div className="flex justify-between items-center px-4">
                 <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Candidate Pipeline</div>
                 <div className={`w-3 h-3 rounded-full bg-emerald-500 animate-pulse`} />
              </div>
              
              <div className="space-y-3">
                {[
                  { name: 'Sarah Miller', pos: 'Senior Frontend', score: 98, icon: <Users className="w-4 h-4" /> },
                  { name: 'James Wilson', pos: 'Product Designer', score: 94, icon: <Activity className="w-4 h-4" /> },
                  { name: 'Elena Korova', pos: 'Backend Lead', score: 89, icon: <Zap className="w-4 h-4" /> }
                ].map((candidate, i) => (
                  <motion.div 
                    key={candidate.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 + 0.2 }}
                    className={`p-4 rounded-2xl border flex items-center justify-between group transition-all hover:scale-[1.02] ${
                      isDark ? 'bg-slate-800/80 border-slate-700 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200 hover:border-indigo-500/30 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700 text-indigo-400' : 'bg-white text-indigo-600'}`}>
                          {candidate.icon}
                       </div>
                       <div>
                          <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{candidate.name}</div>
                          <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{candidate.pos}</div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xs font-bold text-indigo-500">{candidate.score}% Match</div>
                       <div className="h-1 w-12 bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <motion.div 
                            className="h-full bg-indigo-500"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${candidate.score}%` }}
                            transition={{ duration: 1, delay: i * 0.1 + 0.5 }}
                          />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating Connection lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
               <motion.path 
                 d="M0 50 Q 250 100, 500 50"
                 stroke="url(#line-grad)"
                 strokeWidth="2"
                 fill="none"
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
               />
               <defs>
                 <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="transparent" />
                 </linearGradient>
               </defs>
            </svg>
          </div>
        );

      case 'payroll':
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
            <div className={`w-full max-w-sm rounded-3xl p-6 relative overflow-hidden ${isDark ? 'bg-slate-800/50' : 'bg-indigo-50/50'}`}>
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <div className={`text-xs font-bold opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>Total Disbursements</div>
                    <div className={`text-2xl font-bold text-gradient`}>$142,400.00</div>
                 </div>
                 <CreditCard className="w-8 h-8 text-indigo-500" />
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Net Salaries', val: 92, color: '#6366F1', amount: '92,300' },
                  { label: 'Tax (ZIMRA)', val: 24, color: '#F59E0B', amount: '24,100' },
                  { label: 'Pensions (NSSA)', val: 12, color: '#10B981', amount: '12,500' }
                ].map((stat, i) => (
                  <div key={stat.label}>
                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-tight">
                       <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{stat.label}</span>
                       <span className={isDark ? 'text-white' : 'text-slate-900'}>${stat.amount}</span>
                    </div>
                    <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                       <motion.div 
                         className="h-full"
                         style={{ backgroundColor: stat.color }}
                         initial={{ width: 0 }}
                         whileInView={{ width: `${stat.val}%` }}
                         transition={{ duration: 1.2, delay: i * 0.1 }}
                       />
                    </div>
                  </div>
                ))}
              </div>

              {/* Glowing pulses */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-10 blur-[50px] rounded-full" />
            </div>
            
            {/* Action Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`mt-6 p-4 rounded-2xl border flex items-center gap-4 ${
                isDark ? 'bg-slate-900 border-indigo-500/30' : 'bg-white border-indigo-100 shadow-lg'
              }`}
            >
               <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-6 h-6" />
               </div>
               <div>
                  <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Payroll Finalized</div>
                  <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Maker-Checker verified</div>
               </div>
            </motion.div>
          </div>
        );

      case 'esignature':
        return (
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <motion.div 
              className={`w-full max-w-md h-[280px] rounded-3xl border-2 border-dashed relative flex flex-col p-6 overflow-hidden ${
                isDark ? 'border-indigo-500/30 bg-slate-800/40' : 'border-indigo-500/20 bg-indigo-50/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-6">
                 <FileText className="w-5 h-5 text-indigo-500" />
                 <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Employment_Contract_Final.pdf</span>
              </div>
              
              <div className="space-y-3 opacity-40">
                 <div className={`h-2 w-3/4 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                 <div className={`h-2 w-full rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
                 <div className={`h-2 w-1/2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
              </div>

              {/* Signature Area */}
              <div className={`absolute bottom-8 right-8 w-48 h-24 rounded-2xl border flex flex-col items-center justify-center group ${
                isDark ? 'bg-slate-900/80 border-indigo-500/30' : 'bg-white border-indigo-100 shadow-xl'
              }`}>
                 <span className={`absolute top-2 left-3 text-[8px] font-bold uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Sign Here</span>
                 <svg viewBox="0 0 100 40" className="w-32 h-auto">
                    <motion.path 
                      d="M10 25 C 20 10, 40 40, 60 10 S 90 30, 95 20"
                      fill="none"
                      stroke="#6366F1"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                    />
                 </svg>
                 <motion.div 
                   animate={{ x: [-2, 2, -2] }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute -top-2 -right-2 p-1.5 rounded-lg bg-indigo-500 text-white shadow-lg"
                 >
                    <MousePointer2 className="w-3 h-3" />
                 </motion.div>
              </div>

              {/* Background scanline */}
              <motion.div 
                 className="absolute inset-x-0 h-px bg-indigo-500/50"
                 animate={{ top: ['0%', '100%', '0%'] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
             <div className="w-32 h-32 bg-indigo-500/10 rounded-full animate-pulse blur-xl" />
          </div>
        );
    }
  };

  return (
    <div className={containerClass}>
       {renderVisual()}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  History, 
  QrCode, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Calendar,
  AlertCircle,
  Scan,
  User,
  Fingerprint,
  Filter,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UserProfile, Employee } from '../types';
import { attendanceService } from '../services/attendanceService';
import { employeeService } from '../services/employeeService';

interface AttendanceProps {
  userProfile: UserProfile | null;
}

export default function Attendance({ userProfile }: AttendanceProps) {
  const [currentLog, setCurrentLog] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [employeeNum, setEmployeeNum] = useState('');
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [view, setView] = useState<'clock' | 'history' | 'qr'>('clock');

  useEffect(() => {
    async function loadData() {
      if (!userProfile?.companyId) return;
      try {
        setLoading(true);
        const emps = await employeeService.getEmployees(userProfile.companyId);
        const self = emps.find(e => e.email === userProfile.email);
        
        if (self) {
          setCurrentEmployee(self);
          const [log, history] = await Promise.all([
            attendanceService.getTodayLog(self.id),
            attendanceService.getCompanyLogs(userProfile.companyId)
          ]);
          setCurrentLog(log);
          setRecentLogs(history.slice(0, 10));
        }
      } catch (error) {
        console.error("Error loading attendance:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userProfile]);

  const handleClockToggle = async () => {
    if (!currentEmployee || !userProfile?.companyId) return;

    try {
      setClockInLoading(true);
      if (currentLog && !currentLog.clock_out) {
        // Clock out
        const updated = await attendanceService.clockOut(currentLog.id);
        setCurrentLog(updated);
        alert("Successfully clocked out!");
      } else {
        // Clock in
        const brandNew = await attendanceService.clockIn(currentEmployee.id, userProfile.companyId);
        setCurrentLog(brandNew);
        alert("Successfully clocked in!");
      }
      
      // Refresh history
      const history = await attendanceService.getCompanyLogs(userProfile.companyId);
      setRecentLogs(history.slice(0, 10));
    } catch (error) {
      console.error(error);
      alert("Attendance tracking failed.");
    } finally {
      setClockInLoading(false);
    }
  };

  const handleVerifyNumber = () => {
    if (employeeNum === currentEmployee?.employeeNumber) {
        handleClockToggle();
        setEmployeeNum('');
    } else {
        alert("Invalid Employee Number");
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-3xl font-bold text-space-gray tracking-tight">Attendance</h1>
          <p className="text-gray-500 mt-1">Real-time clock-in and activity tracking.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-black/[0.05] shadow-sm">
           {[
             { id: 'clock', icon: Clock, label: 'Clock' },
             { id: 'qr', icon: QrCode, label: 'My QR' },
             { id: 'history', icon: History, label: 'History' }
           ].map(t => (
             <button
              key={t.id}
              onClick={() => setView(t.id as any)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
                view === t.id ? "bg-accent text-white shadow-md shadow-accent/20" : "text-gray-500 hover:text-accent hover:bg-apple-gray"
              )}
             >
               <t.icon className="w-4 h-4" />
               {t.label}
             </button>
           ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'clock' && (
          <motion.div 
            key="clock-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4"
          >
            {/* Main Clock Widget */}
            <div className="bg-white border border-black/[0.05] rounded-[3rem] p-12 shadow-xl shadow-black/5 flex flex-col items-center justify-center space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform">
                 <Clock className="w-32 h-32" />
               </div>

               <div className="w-32 h-32 rounded-full border-8 border-apple-gray flex items-center justify-center text-4xl font-black text-space-gray relative">
                  <div className="absolute inset-0 border-8 border-accent border-t-transparent rounded-full animate-[spin_10s_linear_infinite]" />
                  {new Date().getHours().toString().padStart(2, '0')}
                  <span className="animate-pulse">:</span>
                  {new Date().getMinutes().toString().padStart(2, '0')}
               </div>

               <div className="text-center space-y-2">
                 <h2 className="text-2xl font-black text-space-gray">{currentLog && !currentLog.clock_out ? 'Currently Working' : 'Not Clocked In'}</h2>
                 <p className="text-gray-400 font-medium">Shift started: {currentLog?.clock_in ? new Date(currentLog.clock_in).toLocaleTimeString() : 'N/A'}</p>
               </div>

               <div className="w-full pt-4 space-y-4">
                 <button 
                  onClick={handleClockToggle}
                  disabled={clockInLoading}
                  className={cn(
                    "w-full py-6 rounded-[2rem] text-xl font-black italic tracking-tight transition-all shadow-xl flex items-center justify-center gap-3",
                    currentLog && !currentLog.clock_out 
                      ? "bg-red-500 text-white shadow-red-500/30 hover:bg-red-600" 
                      : "bg-accent text-white shadow-accent/30 hover:bg-blue-600"
                  )}
                 >
                   {clockInLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Zap className="w-8 h-8" />}
                   {currentLog && !currentLog.clock_out ? 'Clock Out Now' : 'Clock In Now'}
                 </button>

                 <div className="flex items-center gap-3 justify-center text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest italic">Harare Head Office HQ</span>
                 </div>
               </div>
            </div>

            {/* Manual Entry Widget */}
            <div className="bg-apple-gray/30 rounded-[3rem] border border-black/[0.03] p-12 flex flex-col justify-center space-y-8">
               <div className="space-y-4">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm">
                   <Fingerprint className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold text-space-gray tracking-tight">Manual Verification</h3>
                 <p className="text-sm text-gray-500 leading-relaxed">Enter your registered Employee ID Number to verify your identity and record your timestamp.</p>
               </div>

               <div className="space-y-4">
                 <div className="relative">
                   <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                   <input 
                    type="text" 
                    placeholder="e.g. EMP-10023"
                    value={employeeNum}
                    onChange={(e) => setEmployeeNum(e.target.value)}
                    className="w-full bg-white border-none rounded-2xl pl-16 pr-6 py-5 text-lg font-black focus:ring-2 focus:ring-accent shadow-inner outline-none placeholder:text-gray-200"
                   />
                 </div>
                 <button 
                  onClick={handleVerifyNumber}
                  className="w-full py-4 bg-white text-accent border border-accent/20 font-black rounded-2xl hover:bg-accent hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 group"
                 >
                   Verify & Process <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </button>
               </div>

               <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3 text-orange-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-[10px] font-bold uppercase leading-normal tracking-wide">IP and Location security measures are active for all manual entries.</p>
               </div>
            </div>
          </motion.div>
        )}

        {view === 'qr' && (
           <motion.div 
            key="qr-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center justify-center py-12 px-4"
           >
             <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-black/[0.05] flex flex-col items-center space-y-8 max-w-sm w-full text-center group">
                <div className="text-center space-y-1">
                   <h2 className="text-2xl font-black text-space-gray tracking-tight">Personal ID Code</h2>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Employee #: {currentEmployee?.employeeNumber}</p>
                </div>
                
                <div className="w-full aspect-square bg-apple-gray/50 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-accent/20 relative group-hover:border-accent transition-colors">
                   <QrCode className="w-48 h-48 text-space-gray group-hover:scale-105 transition-transform" />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-accent/5 backdrop-blur-sm rounded-[2.5rem]">
                      <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center">
                         <Scan className="w-8 h-8 text-accent animate-pulse" />
                         <span className="text-[10px] font-black mt-2 text-accent">READY TO SCAN</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-apple-gray rounded-2xl">
                     <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                        <img src={currentEmployee?.avatarUrl || ''} alt="User" />
                     </div>
                     <div className="text-left">
                        <p className="text-sm font-bold text-space-gray leading-tight">{currentEmployee?.firstName} {currentEmployee?.lastName}</p>
                        <p className="text-[10px] text-gray-500">Security Clearance Level 1</p>
                     </div>
                  </div>
                </div>
             </div>
             <p className="mt-8 text-gray-400 text-xs font-bold text-center max-w-xs">Show this code at any biometric station or scanning point to instantly record your arrival.</p>
           </motion.div>
        )}

        {view === 'history' && (
           <motion.div 
            key="history-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4"
           >
             <div className="bg-white border border-black/[0.05] rounded-[2rem] overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                   <h3 className="font-bold text-space-gray">Activity Timeline</h3>
                   <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-white rounded-xl text-gray-400"><Filter className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-white rounded-xl text-gray-400"><Search className="w-4 h-4" /></button>
                   </div>
                </div>
                <div className="divide-y divide-black/[0.05]">
                   {recentLogs.map((log) => (
                      <div key={log.id} className="p-6 flex items-center justify-between hover:bg-apple-gray/20 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full border-2 border-apple-gray overflow-hidden shadow-sm">
                               <img src={log.employees?.avatar_url || ''} alt="User" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-space-gray">{log.employees?.first_name} {log.employees?.last_name}</p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{log.date} • Via {log.method}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-8">
                            <div className="text-right">
                               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">In</p>
                               <p className="text-sm font-bold text-space-gray">{log.clock_in ? new Date(log.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Out</p>
                               <p className="text-sm font-bold text-space-gray">{log.clock_out ? new Date(log.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still Working'}</p>
                            </div>
                         </div>
                      </div>
                   ))}
                   {recentLogs.length === 0 && (
                     <div className="p-20 text-center">
                        <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">No attendance logs for this period.</p>
                     </div>
                   )}
                </div>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

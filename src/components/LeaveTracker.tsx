import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft,
  CalendarDays,
  User,
  MessageSquare,
  Loader2,
  Filter,
  Search,
  Check,
  X,
  PieChart,
  History,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UserProfile, Employee } from '../types';
import { leaveService } from '../services/leaveService';
import { employeeService } from '../services/employeeService';

interface LeaveTrackerProps {
  userProfile: UserProfile | null;
}

export default function LeaveTracker({ userProfile }: LeaveTrackerProps) {
  const [balances, setBalances] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<'me' | 'approvals'>('me');

  // Form State
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    totalDays: 0
  });

  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    async function init() {
      if (!userProfile?.companyId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // 1. Get employee ID linked to this user
        const emps = await employeeService.getEmployees(userProfile.companyId);
        const self = emps.find(e => e.email === userProfile.email);
        
        if (self) {
          setCurrentEmployee(self);
          // 2. Load balances and types
          const [bal, types, pend] = await Promise.all([
            leaveService.getLeaveBalances(self.id),
            leaveService.getLeaveTypes(userProfile.companyId),
            leaveService.getPendingRequests(userProfile.companyId, self.role === 'hr' ? undefined : self.id)
          ]);
          setBalances(bal);
          setLeaveTypes(types);
          setPendingRequests(pend);
        }
      } catch (error) {
        console.error("Error loading leave data:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee || !userProfile?.companyId) return;

    try {
      setSubmitting(true);
      await leaveService.createLeaveRequest({
        companyId: userProfile.companyId,
        employeeId: currentEmployee.id,
        leaveTypeId: formData.leaveTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: formData.totalDays,
        reason: formData.reason,
        managerId: currentEmployee.managerId || undefined
      });
      setShowRequestModal(false);
      alert("Leave request submitted successfully for approval!");
    } catch (error) {
      console.error(error);
      alert("Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setFormData(prev => ({ ...prev, totalDays: diffDays }));
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-space-gray tracking-tight">Leave Tracker</h1>
          <p className="text-gray-500 mt-1">Manage your time off and seasonal accruals.</p>
        </div>
        <div className="flex gap-3">
          {(userProfile?.role === 'hr' || currentEmployee?.managerId) && (
            <button 
              onClick={() => setView(view === 'me' ? 'approvals' : 'me')}
              className="btn-secondary py-3 px-6 text-sm font-bold flex items-center gap-2"
            >
              {view === 'me' ? <CheckCircle2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {view === 'me' ? 'Approvals' : 'My Leave'}
            </button>
          )}
          <button 
            onClick={() => setShowRequestModal(true)}
            className="btn-primary py-3 px-6 text-sm font-bold shadow-lg shadow-accent/25 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Request Leave
          </button>
        </div>
      </div>

      {view === 'me' ? (
        <>
          {/* Balances Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {balances.map((bal) => (
              <div key={bal.id} className="bg-white border border-black/[0.05] p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-accent/5 text-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{bal.leave_types.name}</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-black text-space-gray">{bal.balance || 0}</h4>
                  <span className="text-xs font-bold text-gray-400">days left</span>
                </div>
                <div className="w-full h-1.5 bg-apple-gray rounded-full mt-6">
                  <div className="w-2/3 h-full bg-accent rounded-full" />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">
                  Accruing at { (bal.leave_types.name === 'Annual Leave' && currentEmployee?.leaveAccrualRate) ? currentEmployee.leaveAccrualRate : bal.leave_types.accrual_rate}d / mo
                </p>
              </div>
            ))}
          </div>

          {/* Statistics/History Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-black/[0.05] rounded-[2rem] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <h3 className="font-bold text-space-gray">My Leave History</h3>
                <History className="w-4 h-4 text-gray-400" />
              </div>
              <div className="p-20 text-center space-y-4">
                <div className="w-16 h-16 bg-apple-gray rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <Calendar className="w-8 h-8" />
                </div>
                <p className="text-gray-500 font-medium">No previous leave records found.</p>
              </div>
            </div>

            <div className="bg-accent rounded-[2rem] p-8 text-white shadow-xl shadow-accent/30 space-y-6">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                 <PieChart className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-xl font-black italic tracking-tight">Zimbabwe Standard policies apply.</h3>
                  <p className="text-white/70 text-sm mt-2 leading-relaxed">Annual leave accrues at 2.5 days per month. Sick leave is fixed at 90 days full-pay per year.</p>
               </div>
               <div className="pt-4 border-t border-white/10">
                 <button className="text-sm font-bold hover:underline underline-offset-4">View Company Leave Policy →</button>
               </div>
            </div>
          </div>
        </>
      ) : (
        /* Approvals View */
        <div className="bg-white border border-black/[0.05] rounded-[2rem] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
            <h3 className="font-bold text-space-gray">Pending My Approval</h3>
            <div className="flex items-center gap-2">
               <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-black rounded-full uppercase tracking-widest">{pendingRequests.length} PENDING</span>
            </div>
          </div>
          <div className="divide-y divide-black/[0.05]">
            {pendingRequests.length === 0 ? (
              <div className="p-20 text-center">
                 <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-20" />
                 <p className="text-gray-400 font-bold">You are all caught up!</p>
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-apple-gray/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-accent/20 overflow-hidden shadow-sm">
                      <img src={req.employees.avatar_url || 'https://via.placeholder.com/100'} alt="User" />
                    </div>
                    <div>
                      <h4 className="font-bold text-space-gray">{req.employees.first_name} {req.employees.last_name}</h4>
                      <p className="text-xs text-gray-500">{req.leave_types.name} • {req.total_days} days</p>
                      <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-1">
                        {req.start_date} → {req.end_date}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-colors">
                      <Check className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-apple-gray text-gray-400 rounded-2xl hover:bg-black/5 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div>
                  <h2 className="text-2xl font-bold text-space-gray">Request Time Off</h2>
                  <p className="text-sm text-gray-500">Submit a request to your manager.</p>
                </div>
                <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-white rounded-full">
                   <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Leave Type</label>
                    <select 
                      required
                      value={formData.leaveTypeId}
                      onChange={(e) => setFormData(prev => ({ ...prev, leaveTypeId: e.target.value }))}
                      className="w-full bg-apple-gray border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-accent"
                    >
                      <option value="">Select leave category...</option>
                      {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.annual_allowance}d/year)</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Start Date</label>
                      <input 
                        required
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, startDate: val }));
                          calculateDays(val, formData.endDate);
                        }}
                        className="w-full bg-apple-gray border-none rounded-2xl px-5 py-4 text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">End Date</label>
                      <input 
                        required
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ ...prev, endDate: val }));
                          calculateDays(formData.startDate, val);
                        }}
                        className="w-full bg-apple-gray border-none rounded-2xl px-5 py-4 text-sm font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Reason / Comments</label>
                    <textarea 
                      required
                      rows={3}
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Why are you taking this time off?"
                      className="w-full bg-apple-gray border-none rounded-2xl px-5 py-4 text-sm font-bold resize-none"
                    />
                  </div>

                  {formData.totalDays > 0 && (
                    <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 flex items-center justify-between">
                       <span className="text-xs font-bold text-accent italic">Total Duration requested:</span>
                       <span className="text-lg font-black text-accent">{formData.totalDays} Days</span>
                    </div>
                  )}
                </div>

                <button 
                   type="submit" 
                   disabled={submitting}
                   className="w-full btn-primary py-5 text-lg font-black tracking-tight shadow-xl shadow-accent/30 flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  Submit Request
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

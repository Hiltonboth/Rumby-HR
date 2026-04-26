import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Award, 
  MessageSquare, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart3,
  Users,
  FileDown,
  ArrowRight,
  ShieldCheck,
  X,
  Trash2,
  Search
} from 'lucide-react';
import { performanceService, PerformanceReview, PerformanceGoal, PerformanceReviewCycle, PerformanceFeedback } from '../services/performanceService';
import { useAuth } from '../contexts/AuthContext';
import { Employee } from '../types';
import { employeeService } from '../services/employeeService';
import { performanceReportGenerator } from '../utils/PerformanceReportGenerator';

const PerformanceHub: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'goals' | 'reviews' | '360' | 'manager'>('goals');
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [cycles, setCycles] = useState<PerformanceReviewCycle[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [directReports, setDirectReports] = useState<Employee[]>([]);
  const [teamReviews, setTeamReviews] = useState<PerformanceReview[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [searchColleague, setSearchColleague] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Feedback States
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showAppraisalModal, setShowAppraisalModal] = useState<PerformanceReview | null>(null);
  const [appraisalForm, setAppraisalForm] = useState({
    manager_rating: 3,
    summary: '',
    strengths: '',
    areas_for_growth: '',
    development_plan: [] as { item: string, deadline: string, status: 'pending' | 'completed' }[]
  });

  useEffect(() => {
    if (userProfile?.companyId) {
      loadData();
    }
  }, [userProfile]);

  const loadData = async () => {
    try {
      setLoading(true);
      const empData = await employeeService.getEmployeeByEmail(userProfile!.email);
      if (empData) {
        setEmployee(empData);
        
        // Fetch direct reports if any
        const reports = await employeeService.getDirectReports(empData.id);
        setDirectReports(reports);

        const [goalsData, reviewsData, cyclesData, allEmps] = await Promise.all([
          performanceService.getEmployeeGoals(empData.id),
          performanceService.getEmployeeReviews(empData.id),
          performanceService.getReviewCycles(userProfile!.companyId!),
          employeeService.getEmployees(userProfile!.companyId!)
        ]);

        setAllEmployees(allEmps);
        setGoals(goalsData);
        setReviews(reviewsData);
        setCycles(cyclesData);
        
        // If manager, fetch team reviews
        if (reports.length > 0) {
          const allTeamReviewsPromises = reports.map(r => performanceService.getEmployeeReviews(r.id));
          const allTeamReviewsResults = await Promise.all(allTeamReviewsPromises);
          setTeamReviews(allTeamReviewsResults.flat());
        }
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startReviewForEmployee = async (subordinateId: string, cycleId: string) => {
    try {
      const newReview = await performanceService.createReview({
        company_id: userProfile!.companyId,
        cycle_id: cycleId,
        employee_id: subordinateId,
        manager_id: employee!.id,
        status: 'self_appraisal' // Start with self-appraisal request
      });
      loadData(); // Refresh
      alert("Performance review initiated for employee.");
    } catch (error) {
      console.error("Failed to start review:", error);
    }
  };

  const handleUpdateAppraisal = async () => {
    if (!showAppraisalModal) return;
    try {
      setLoading(true);
      await performanceService.updateReview(showAppraisalModal.id, {
        ...appraisalForm,
        status: 'completed'
      });
      setShowAppraisalModal(null);
      loadData();
      alert("Appraisal finalized and archived.");
    } catch (error) {
      console.error("Failed to update appraisal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (review: PerformanceReview) => {
    try {
      const fullReview = await performanceService.getReviewById(review.id);
      const cycle = cycles.find(c => c.id === review.cycle_id)!;
      const subordinate = directReports.find(r => r.id === review.employee_id) || employee!;
      
      performanceReportGenerator.generateReviewPDF(
        fullReview,
        subordinate,
        employee || undefined,
        cycle,
        fullReview.feedback || []
      );
    } catch (error) {
      console.error("Failed to export PDF:", error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedReviewId || !feedbackContent) return;
    try {
      await performanceService.submitFeedback({
        review_id: selectedReviewId,
        provider_id: employee!.id,
        content: feedbackContent,
        is_anonymous: isAnonymous
      });
      setShowFeedbackModal(false);
      setFeedbackContent('');
      alert("Feedback submitted anonymously.");
      loadData();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Track growth, goals, and culture across ZivoHR.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'goals' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            My KRAs
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'reviews' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Appraisals
          </button>
          <button
            onClick={() => setActiveTab('360')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === '360' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            360° Feedback
          </button>
          {directReports.length > 0 && (
            <button
              onClick={() => setActiveTab('manager')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'manager' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Manager View
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'goals' && (
          <motion.div key="goals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button className="h-full border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-all hover:bg-indigo-50/30 group">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-medium">Define New KRA</span>
              </button>

              {goals.map((goal) => (
                <div key={goal.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg"><Target className="w-5 h-5 text-indigo-600" /></div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      goal.status === 'achieved' ? 'bg-green-100 text-green-700' :
                      goal.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {goal.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{goal.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{goal.description}</p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-indigo-600" initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div>
                      <h4 className="font-bold text-gray-900">{cycles.find(c => c.id === review.cycle_id)?.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">Status: <span className="text-indigo-600 font-semibold">{review.status.replace('_', ' ').toUpperCase()}</span></p>
                    </div>
                    {review.status === 'completed' && (
                      <button 
                        onClick={() => handleExportPDF(review)}
                        className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors"
                      >
                        <FileDown className="w-4 h-4" />
                        Export Report
                      </button>
                    )}
                  </div>
                  <div className="p-6 grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Self Rating</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{review.self_rating || '--'}/5</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Manager Rating</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{review.manager_rating || '--'}/5</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase">Final Grade</p>
                      <p className="text-xl font-bold text-indigo-600 mt-1">{review.overall_rating || '--'}/5</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
                <h4 className="font-bold">Next Milestone</h4>
                <p className="text-indigo-100 text-sm mt-1">Q2 Performance Review closes in 12 days.</p>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-400" />)}
                  </div>
                  <span className="text-xs font-bold text-indigo-100">85% Participation</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'manager' && (
          <motion.div key="manager" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Team Appraisal Dashboard</h3>
                <span className="text-xs font-bold px-3 py-1 bg-green-50 text-green-600 rounded-full">{directReports.length} Direct Reports</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Employee</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Current Cycle</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Progress</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {directReports.map(emp => {
                      const activeCycle = cycles.find(c => c.status === 'active');
                      const review = teamReviews.find(r => r.employee_id === emp.id && r.cycle_id === activeCycle?.id);
                      
                      return (
                        <tr key={emp.id} className="hover:bg-gray-50/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-apple-gray text-gray-400 flex items-center justify-center font-bold text-sm">
                                {emp.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{emp.name}</p>
                                <p className="text-xs text-gray-400">{emp.jobTitle}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-600">{activeCycle?.title || 'No active cycle'}</span>
                          </td>
                          <td className="px-6 py-4">
                            {review ? (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                review.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {review.status.replace('_', ' ')}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full uppercase">Not Started</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {review ? (
                               <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => handleExportPDF(review)}
                                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                  >
                                    <FileDown className="w-3 h-3" /> Report
                                  </button>
                                  {review.status !== 'completed' && (
                                    <button 
                                      onClick={() => {
                                        setAppraisalForm({
                                          manager_rating: review.manager_rating || 3,
                                          summary: review.summary || '',
                                          strengths: review.strengths || '',
                                          areas_for_growth: review.areas_for_growth || '',
                                          development_plan: review.development_plan || []
                                        });
                                        setShowAppraisalModal(review);
                                      }}
                                      className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                                    >
                                      Appraise Cycle
                                    </button>
                                  )}
                               </div>
                            ) : (
                              <button 
                                onClick={() => activeCycle && startReviewForEmployee(emp.id, activeCycle.id)}
                                className="btn-primary-sm py-1.5 px-3 text-xs"
                              >
                                Start Appraisal
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === '360' && (
          <motion.div key="360" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                <MessageSquare className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black italic text-gray-900 tracking-tight uppercase">Qualitative Peer Feedback</h3>
                <p className="text-sm text-gray-500 max-w-lg mx-auto mt-2 font-medium">Empower your colleagues with anonymous insights. Professional growth starts with radical transparency.</p>
              </div>

              {/* Colleague Search */}
              <div className="max-w-md mx-auto relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search Colleague by Name..."
                  value={searchColleague}
                  onChange={(e) => setSearchColleague(e.target.value)}
                  className="w-full bg-apple-gray/50 border-none rounded-2xl py-5 pl-12 pr-6 text-sm font-bold placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                />
              </div>

              <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allEmployees
                  .filter(e => e.id !== employee?.id && (searchColleague === '' || e.name.toLowerCase().includes(searchColleague.toLowerCase())))
                  .slice(0, 6)
                  .map(emp => (
                  <button 
                    key={emp.id}
                    onClick={async () => {
                      const activeCycle = cycles.find(c => c.status === 'active');
                      if (!activeCycle) {
                        alert("No active appraisal cycle found.");
                        return;
                      }
                      
                      // Try to find if they have a review in this cycle
                      let review = teamReviews.find(r => r.employee_id === emp.id && r.cycle_id === activeCycle.id);
                      
                      if (!review) {
                         // Check if person has any reviews at all
                         const empReviews = await performanceService.getEmployeeReviews(emp.id);
                         review = empReviews.find(r => r.cycle_id === activeCycle.id);
                      }

                      if (review) {
                        setSelectedReviewId(review.id);
                        setShowFeedbackModal(true);
                      } else {
                        // For 360 to work, a review shell must exist. In a real app we'd create one or handle it
                        alert(`Appraisal cycle not yet initiated for ${emp.name}. Please contact HR.`);
                      }
                    }}
                    className="flex items-center justify-between bg-white hover:bg-indigo-50 border border-black/[0.03] p-5 rounded-2xl transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-apple-gray text-gray-400 flex items-center justify-center font-black italic text-xs uppercase group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="text-left">
                         <p className="text-sm font-black text-space-gray tracking-tight">{emp.name}</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{emp.jobTitle}</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Feedback Given Section */}
            <div className="card-aura p-8">
               <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Recent Feedback Vault</h4>
               <div className="space-y-4">
                  <div className="p-6 bg-white border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center py-12 text-gray-400 italic">
                     <Clock className="w-8 h-8 mb-3 opacity-20" />
                     <p className="text-sm font-medium">History of feedback given will appear here.</p>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 bg-indigo-600 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6" /> Submit Anonymous Feedback</h3>
              <p className="text-indigo-100 text-xs mt-1">Help your colleagues grow with honest, qualitative insights.</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Constructive Comments</label>
                <textarea 
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="Focus on specific behaviors, achievements, or growth areas..."
                  className="w-full bg-apple-gray/50 border-none rounded-2xl p-4 text-sm font-bold h-32 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center"><Star className="w-4 h-4 text-indigo-600" /></div>
                  <span className="text-xs font-bold text-gray-600">Anonymous Submission</span>
                </div>
                <button 
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative inline-block w-10 h-5 rounded-full cursor-pointer transition-colors ${isAnonymous ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAnonymous ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowFeedbackModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-400 rounded-2xl text-[10px] font-black uppercase">Cancel</button>
                <button onClick={handleSubmitFeedback} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase">Submit Feedback</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Appraisal Modal */}
      {showAppraisalModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black italic text-space-gray uppercase tracking-tight">Manager Appraisal Terminal</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                  Appearing for: {(allEmployees.find(e => e.id === showAppraisalModal.employee_id))?.name}
                </p>
              </div>
              <button onClick={() => setShowAppraisalModal(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {/* Rating Section */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  Quantitative Scoring
                </h4>
                <div className="flex items-center gap-4">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setAppraisalForm({ ...appraisalForm, manager_rating: rating })}
                      className={`w-16 h-16 rounded-2xl font-black text-xl flex items-center justify-center transition-all ${
                        appraisalForm.manager_rating === rating 
                        ? "bg-accent text-white shadow-xl shadow-accent/20 scale-110" 
                        : "bg-apple-gray text-gray-400 hover:bg-black/5"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                  <div className="ml-6 flex-1 bg-apple-gray/30 p-6 rounded-3xl border border-black/[0.02]">
                    <p className="text-sm font-bold text-space-gray">
                      {appraisalForm.manager_rating === 1 && "⚠️ Critical Intervention Required"}
                      {appraisalForm.manager_rating === 2 && "⚠️ Below Expectations"}
                      {appraisalForm.manager_rating === 3 && "👍 Meets Expectations"}
                      {appraisalForm.manager_rating === 4 && "🌟 Exceeds Expectations"}
                      {appraisalForm.manager_rating === 5 && "👑 Outstanding Professionalism"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Qualitatve Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Key Strengths</label>
                  <textarea 
                    value={appraisalForm.strengths}
                    onChange={(e) => setAppraisalForm({ ...appraisalForm, strengths: e.target.value })}
                    className="w-full bg-apple-gray/50 border-none rounded-3xl p-6 text-sm font-bold h-32 focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="What did this employee excel at?"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Areas for Growth</label>
                  <textarea 
                    value={appraisalForm.areas_for_growth}
                    onChange={(e) => setAppraisalForm({ ...appraisalForm, areas_for_growth: e.target.value })}
                    className="w-full bg-apple-gray/50 border-none rounded-3xl p-6 text-sm font-bold h-32 focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    placeholder="Specific areas of improvement..."
                  />
                </div>
              </div>

              {/* Development Plan Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Individual Development Plan (IDP)
                  </h4>
                  <button 
                    onClick={() => setAppraisalForm({ ...appraisalForm, development_plan: [...appraisalForm.development_plan, { item: '', deadline: '', status: 'pending' }] })}
                    className="text-[10px] font-black text-accent uppercase flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Action Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {appraisalForm.development_plan.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-apple-gray/20 p-4 rounded-2xl border border-black/[0.03]">
                      <input 
                        type="text" 
                        value={item.item}
                        onChange={(e) => {
                          const newPlan = [...appraisalForm.development_plan];
                          newPlan[idx].item = e.target.value;
                          setAppraisalForm({ ...appraisalForm, development_plan: newPlan });
                        }}
                        placeholder="Action Item (e.g. AWS Certification)"
                        className="flex-[2] bg-white border-none rounded-xl px-4 py-2 text-xs font-bold"
                      />
                      <input 
                        type="date" 
                        value={item.deadline}
                        onChange={(e) => {
                          const newPlan = [...appraisalForm.development_plan];
                          newPlan[idx].deadline = e.target.value;
                          setAppraisalForm({ ...appraisalForm, development_plan: newPlan });
                        }}
                        className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-xs font-bold"
                      />
                      <button 
                        onClick={() => {
                          const newPlan = [...appraisalForm.development_plan];
                          newPlan.splice(idx, 1);
                          setAppraisalForm({ ...appraisalForm, development_plan: newPlan });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-gray-100 bg-gray-50/50 flex gap-4">
              <button 
                onClick={handleUpdateAppraisal}
                className="flex-1 py-5 bg-accent text-white rounded-3xl text-xs font-black uppercase italic tracking-widest shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all"
              >
                Seal & Finalize Appraisal
              </button>
              <button onClick={() => setShowAppraisalModal(null)} className="px-10 py-5 bg-white text-gray-400 rounded-3xl text-xs font-black uppercase">Save Draft</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PerformanceHub;

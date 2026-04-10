import React from 'react';
import { 
  DollarSign, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  FileText,
  X,
  Printer,
  MessageCircle,
  Users,
  Settings,
  ShieldCheck,
  TrendingUp,
  Plus,
  Send,
  Building2,
  CreditCard,
  Briefcase,
  History,
  FileBarChart,
  Lock,
  Unlock,
  AlertTriangle,
  Mail,
  Smartphone,
  Eye,
  Sparkles,
  Info,
  Users as UsersIcon,
  PartyPopper,
  Zap,
  Heart,
  Plane,
  GraduationCap,
  LayoutGrid,
  Briefcase as BriefcaseIcon
} from 'lucide-react';
import { MOCK_TASKS } from '../constants';
import { cn } from '../lib/utils';

interface ServiceCardProps {
  key?: string | number;
  id?: string;
  title: string;
  icon: React.ElementType;
  description: string;
  color: string;
  onClick?: () => void;
}

function ServiceCard({ title, icon: Icon, description, color, onClick }: ServiceCardProps) {
  return (
    <button 
      onClick={onClick}
      className="group flex flex-col items-center p-4 md:p-6 bg-white border border-black/[0.05] rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
    >
      <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-110", color)}>
        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
      </div>
      <h3 className="text-sm md:text-base font-bold text-space-gray mb-1">{title}</h3>
      <p className="text-[10px] md:text-xs text-gray-400 line-clamp-2">{description}</p>
    </button>
  );
}

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [tasks, setTasks] = React.useState(MOCK_TASKS);
  const services = [
    { id: 'onboarding', title: 'Onboarding', icon: PartyPopper, description: 'New hire welcome & setup', color: 'bg-accent' },
    { id: 'self_service', title: 'Self Service', icon: Users, description: 'Manage your profile and assets', color: 'bg-blue-500' },
    { id: 'leave', title: 'Leave Tracker', icon: Calendar, description: 'Apply and track time off', color: 'bg-orange-500' },
    { id: 'time', title: 'Time Tracker', icon: Clock, description: 'Log your working hours', color: 'bg-purple-500' },
    { id: 'attendance', title: 'Attendance', icon: CheckCircle2, description: 'Check-in and view history', color: 'bg-green-500' },
    { id: 'performance', title: 'Performance', icon: TrendingUp, description: 'Reviews and goal tracking', color: 'bg-pink-500' },
    { id: 'files', title: 'Files', icon: FileText, description: 'Company documents and vault', color: 'bg-indigo-500' },
    { id: 'team', title: 'Organization', icon: LayoutGrid, description: 'View team and hierarchy', color: 'bg-cyan-500' },
    { id: 'hiring', title: 'Recruitment', icon: Briefcase, description: 'Manage hiring pipeline', color: 'bg-emerald-500' },
    { id: 'training', title: 'Training', icon: GraduationCap, description: 'LMS and skill development', color: 'bg-amber-500' },
    { id: 'pay', title: 'Travel & Expense', icon: Plane, description: 'Claims and reimbursements', color: 'bg-rose-500' },
    { id: 'engagement', title: 'Engagement', icon: Heart, description: 'Surveys and kudos', color: 'bg-red-500' },
    { id: 'payroll', title: 'Payroll', icon: DollarSign, description: 'Process salaries and compliance', color: 'bg-green-600' },
    { id: 'workflows', title: 'Workflows', icon: Zap, description: 'Automate HR processes', color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-8 md:space-y-10 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-space-gray">Home</h1>
          <p className="text-gray-500 mt-2 text-base md:text-lg">Welcome back, Sarah. What would you like to do today?</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Checking in... Time logged: ' + new Date().toLocaleTimeString())}
            className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 py-3 px-6"
          >
            <Clock className="w-4 h-4" />
            Check In
          </button>
          <button 
            onClick={() => onNavigate('leave')}
            className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2 py-3 px-6"
          >
            <Plus className="w-4 h-4" />
            Apply Leave
          </button>
        </div>
      </div>

      {/* Quick Stats - Simple Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <button 
          onClick={() => onNavigate('team')}
          className="bg-apple-gray/30 p-4 md:p-6 rounded-2xl border border-black/[0.03] text-left hover:bg-apple-gray/50 transition-all hover:shadow-sm group"
        >
          <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-accent transition-colors">Team Size</p>
          <p className="text-2xl md:text-3xl font-bold text-space-gray">124</p>
        </button>
        <button 
          onClick={() => onNavigate('leave')}
          className="bg-apple-gray/30 p-4 md:p-6 rounded-2xl border border-black/[0.03] text-left hover:bg-apple-gray/50 transition-all hover:shadow-sm group"
        >
          <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-accent transition-colors">On Leave</p>
          <p className="text-2xl md:text-3xl font-bold text-space-gray">8</p>
        </button>
        <button 
          onClick={() => onNavigate('hiring')}
          className="bg-apple-gray/30 p-4 md:p-6 rounded-2xl border border-black/[0.03] text-left hover:bg-apple-gray/50 transition-all hover:shadow-sm group"
        >
          <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-accent transition-colors">Open Roles</p>
          <p className="text-2xl md:text-3xl font-bold text-space-gray">12</p>
        </button>
        <button 
          onClick={() => onNavigate('workflows')}
          className="bg-apple-gray/30 p-4 md:p-6 rounded-2xl border border-black/[0.03] text-left hover:bg-apple-gray/50 transition-all hover:shadow-sm group"
        >
          <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 group-hover:text-accent transition-colors">Pending Tasks</p>
          <p className="text-2xl md:text-3xl font-bold text-space-gray">3</p>
        </button>
      </div>

      {/* Services Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-space-gray">All Services</h2>
          <button className="text-sm font-bold text-accent hover:underline">Customize Grid</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
          {services.map((service) => (
            <ServiceCard 
              key={service.title}
              id={service.id}
              title={service.title}
              icon={service.icon}
              description={service.description}
              color={service.color}
              onClick={() => service.id && onNavigate(service.id)}
            />
          ))}
        </div>
      </div>

      {/* Simple Task List */}
      <div className="bg-white border border-black/[0.05] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-black/[0.05] flex items-center justify-between">
          <h2 className="text-xl font-bold text-space-gray">Pending Approvals</h2>
          <button 
            onClick={() => onNavigate('workflows')}
            className="text-sm font-bold text-accent hover:underline"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-black/[0.05]">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-apple-gray/20 transition-colors gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className={cn(
                  "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  task.type === 'Time Off' ? "bg-blue-50 text-blue-600" :
                  task.type === 'Contract' ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600"
                )}>
                  {task.type === 'Time Off' ? <Calendar className="w-4 h-4 md:w-5 md:h-5" /> :
                   task.type === 'Contract' ? <FileText className="w-4 h-4 md:w-5 md:h-5" /> : <Users className="w-4 h-4 md:w-5 md:h-5" />}
                </div>
                <div>
                  <p className="text-sm md:text-base font-bold text-space-gray">{task.title}</p>
                  <p className="text-xs md:text-sm text-gray-500">Requested by {task.user} • Due {task.dueDate}</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => alert(`Viewing details for: ${task.title}`)}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-bold text-gray-500 hover:bg-apple-gray rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button 
                  onClick={() => {
                    setTasks(tasks.filter(t => t.id !== task.id));
                    alert(`Rejected: ${task.title}`);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => {
                    setTasks(tasks.filter(t => t.id !== task.id));
                    alert(`Approved: ${task.title}`);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="font-bold text-space-gray">All caught up!</p>
              <p className="text-sm text-gray-500">No pending approvals at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

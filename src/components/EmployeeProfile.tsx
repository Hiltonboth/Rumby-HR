import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  Mail, 
  MapPin, 
  Calendar, 
  Shield, 
  FileText, 
  DollarSign, 
  Clock, 
  ArrowLeft, 
  Download, 
  Edit3, 
  Trash2, 
  Users,
  Phone,
  Briefcase,
  Building,
  Camera,
  Upload,
  Save,
  X,
  MessageCircle
} from 'lucide-react';
import { Employee } from '../types';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface EmployeeProfileProps {
  employee: Employee;
  onBack: () => void;
}

export default function EmployeeProfile({ employee, onBack }: EmployeeProfileProps) {
  const [activeTab, setActiveTab] = useState('Personal');
  const [isUploading, setIsUploading] = useState(false);
  const [bio, setBio] = useState(employee.bio || '<p>Kofi is a highly experienced software engineer with a passion for building scalable web applications. He has a strong background in React, Node.js, and cloud infrastructure.</p>');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload
      setTimeout(() => {
        setIsUploading(false);
        alert("Avatar updated successfully! (Demo mode)");
      }, 1500);
    }
  };

  const tabs = ['Personal', 'Job', 'Time Off', 'Compensation', 'Documents', 'Performance'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-accent font-bold transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </button>
        <div className="flex gap-2 sm:gap-3">
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex-1 sm:flex-none btn-secondary flex items-center justify-center gap-2 py-2.5 px-4 text-sm"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
          <button className="flex-1 sm:flex-none btn-primary py-2.5 px-4 text-sm">Actions</button>
        </div>
      </div>

      {/* Profile Header Block */}
      <div className="bg-white border border-black/[0.05] rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm relative overflow-hidden">
        {/* Subtle cultural pattern overlay (optional, but adds a nice touch) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative group">
          <img 
            src={employee.avatar} 
            alt={employee.name} 
            className="w-32 h-32 rounded-2xl object-cover border-4 border-apple-gray shadow-xl"
            referrerPolicy="no-referrer"
          />
          <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]">
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Change</span>
              </>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
          </label>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-3xl font-bold text-space-gray">{employee.name}</h1>
            <span className={cn(
              "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full w-fit mx-auto md:mx-0",
              employee.status === 'Active' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
            )}>
              {employee.status}
            </span>
          </div>
          <p className="text-lg text-gray-500 font-medium">{employee.role} • {employee.department}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
              {employee.email}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {employee.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Joined {new Date(employee.startDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-black/[0.05] rounded-2xl p-1 flex overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 min-w-[120px] py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeTab === tab 
                ? "bg-accent text-white shadow-md shadow-accent/20" 
                : "text-gray-500 hover:text-space-gray hover:bg-apple-gray/50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'Personal' && (
            <div className="space-y-6">
              <div className="bg-white border border-black/[0.05] rounded-3xl p-8 space-y-8">
                <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
                  <h3 className="text-xl font-bold text-space-gray">Professional Bio</h3>
                  <button 
                    onClick={() => setIsEditingBio(!isEditingBio)}
                    className="text-accent text-sm font-bold hover:underline flex items-center gap-2"
                  >
                    {isEditingBio ? (
                      <>
                        <Save className="w-4 h-4" />
                        Save Bio
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        Edit Bio
                      </>
                    )}
                  </button>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  {isEditingBio ? (
                    <div className="bg-apple-gray/30 rounded-2xl overflow-hidden border border-black/[0.05]">
                      <ReactQuill 
                        theme="snow" 
                        value={bio} 
                        onChange={setBio}
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['clean']
                          ],
                        }}
                        className="bg-white"
                      />
                    </div>
                  ) : (
                    <div 
                      className="text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: bio }}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white border border-black/[0.05] rounded-3xl p-8 space-y-8">
                <h3 className="text-xl font-bold text-space-gray border-b border-black/[0.05] pb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'UI/UX Design', 'Cloud Infrastructure', 'Agile Methodology', 'Product Strategy'].map((skill) => (
                    <span 
                      key={skill}
                      className="px-4 py-2 bg-accent/5 text-accent border border-accent/10 rounded-xl text-sm font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-black/[0.05] rounded-3xl p-8 space-y-8">
                <h3 className="text-xl font-bold text-space-gray border-b border-black/[0.05] pb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'UI/UX Design', 'Cloud Infrastructure', 'Agile Methodology', 'Product Strategy'].map((skill) => (
                    <span 
                      key={skill}
                      className="px-4 py-2 bg-accent/5 text-accent border border-accent/10 rounded-xl text-sm font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-black/[0.05] rounded-3xl p-8 space-y-8">
                <h3 className="text-xl font-bold text-space-gray border-b border-black/[0.05] pb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                  <p className="font-bold text-space-gray">{employee.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee ID</p>
                  <p className="font-bold text-space-gray">{employee.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                  <p className="font-bold text-space-gray">{employee.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                  <p className="font-bold text-space-gray">+1 (555) 012-3456</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date of Birth</p>
                  <p className="font-bold text-space-gray">May 14, 1992</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gender</p>
                  <p className="font-bold text-space-gray">Female</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-space-gray border-b border-black/[0.05] pb-4 pt-4">Address Details</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Address</p>
                  <p className="font-bold text-space-gray">123 Apple Way, Cupertino, CA 95014, USA</p>
                </div>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'Job' && (
            <div className="bg-white border border-black/[0.05] rounded-3xl p-8 space-y-8">
              <h3 className="text-xl font-bold text-space-gray border-b border-black/[0.05] pb-4">Job Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Title</p>
                  <p className="font-bold text-space-gray">{employee.role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</p>
                  <p className="font-bold text-space-gray">{employee.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reporting To</p>
                  <p className="font-bold text-space-gray">David Miller (CEO)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Work Location</p>
                  <p className="font-bold text-space-gray">{employee.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employment Type</p>
                  <p className="font-bold text-space-gray">Full Time</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joining Date</p>
                  <p className="font-bold text-space-gray">{new Date(employee.startDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Time Off' && (
            <div className="bg-white border border-black/[0.05] rounded-3xl p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
                <h3 className="text-xl font-bold text-space-gray">Time Off Balance</h3>
                <button className="btn-primary text-xs py-2">Request Time Off</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Annual Leave', balance: '12 days', color: 'bg-accent' },
                  { label: 'Sick Leave', balance: '5 days', color: 'bg-orange-500' },
                  { label: 'Personal Leave', balance: '2 days', color: 'bg-purple-500' },
                ].map((item) => (
                  <div key={item.label} className="p-6 rounded-2xl bg-apple-gray/30 border border-black/[0.03] space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-2xl font-bold text-space-gray">{item.balance}</p>
                    <div className="w-full h-1.5 bg-apple-gray rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", item.color)} style={{ width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="text-xl font-bold text-space-gray border-b border-black/[0.05] pb-4 pt-4">Recent Requests</h3>
              <div className="space-y-4">
                {[
                  { type: 'Annual Leave', date: 'Mar 10 - Mar 12', status: 'Approved', days: 3 },
                  { type: 'Sick Leave', date: 'Feb 15', status: 'Approved', days: 1 },
                ].map((req, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-black/[0.05] hover:bg-apple-gray/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-apple-gray flex items-center justify-center text-gray-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-space-gray">{req.type}</p>
                        <p className="text-xs text-gray-500">{req.date} • {req.days} days</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-md">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Compensation' && (
            <div className="bg-white border border-black/[0.05] rounded-3xl p-8 space-y-8">
              <h3 className="text-xl font-bold text-space-gray border-b border-black/[0.05] pb-4">Salary Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Annual CTC</p>
                  <p className="text-2xl font-bold text-space-gray">{formatCurrency(employee.salary)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Frequency</p>
                  <p className="font-bold text-space-gray">Monthly</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-space-gray border-b border-black/[0.05] pb-4 pt-4">Bank Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Name</p>
                  <p className="font-bold text-space-gray">Chase Bank</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Number</p>
                  <p className="font-bold text-space-gray">**** **** 4567</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="bg-white border border-black/[0.05] rounded-3xl p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
                <h3 className="text-xl font-bold text-space-gray">Employee Documents</h3>
                <button className="btn-secondary text-xs py-2 flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" />
                  Upload New
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Employment_Contract.pdf', size: '1.2 MB', date: 'Jan 12, 2024' },
                  { name: 'ID_Proof.jpg', size: '450 KB', date: 'Jan 12, 2024' },
                  { name: 'Education_Certificates.zip', size: '4.5 MB', date: 'Jan 15, 2024' },
                  { name: 'Previous_Experience_Letter.pdf', size: '800 KB', date: 'Jan 15, 2024' },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-black/[0.05] hover:bg-apple-gray/20 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-apple-gray flex items-center justify-center text-gray-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-space-gray">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-300 hover:text-accent opacity-0 group-hover:opacity-100 transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Performance' && (
            <div className="bg-white border border-black/[0.05] rounded-3xl p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-4">
                <h3 className="text-xl font-bold text-space-gray">Performance Reviews</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-400">Overall Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((s) => (
                      <div key={s} className="w-4 h-4 bg-accent rounded-full" />
                    ))}
                    <div className="w-4 h-4 bg-apple-gray rounded-full" />
                    <span className="ml-2 text-sm font-bold text-space-gray">4.0/5.0</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  { title: 'Annual Review 2023', date: 'Dec 20, 2023', rating: 'Exceeds Expectations', reviewer: 'David Miller' },
                  { title: 'Mid-Year Check-in', date: 'Jun 15, 2023', rating: 'Meets Expectations', reviewer: 'David Miller' },
                ].map((review, i) => (
                  <div key={i} className="p-6 rounded-3xl border border-black/[0.05] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-space-gray">{review.title}</h4>
                        <p className="text-xs text-gray-500">{review.date} • Reviewer: {review.reviewer}</p>
                      </div>
                      <span className="px-3 py-1 bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-widest rounded-full">
                        {review.rating}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {employee.name} has shown exceptional growth this year. Their contribution to the core platform architecture was pivotal. They consistently deliver high-quality code and mentor junior developers effectively.
                    </p>
                    <button className="text-accent text-xs font-bold hover:underline">View Full Report</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-black/[0.05] rounded-3xl p-6 space-y-6">
            <h3 className="font-bold text-space-gray">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = `mailto:${employee.email}`}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-white/20">
                  <Mail className="w-4 h-4" />
                </div>
                Send Email
              </button>
              <button 
                onClick={() => window.open(`https://wa.me/${employee.phone?.replace(/\D/g, '') || '263770000000'}`, '_blank')}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-white/20">
                  <MessageCircle className="w-4 h-4" />
                </div>
                WhatsApp Message
              </button>
              <button 
                onClick={() => alert("Generating payslip for " + employee.name + "...")}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-accent/5 text-accent hover:bg-accent hover:text-white transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-white/20">
                  <FileText className="w-4 h-4" />
                </div>
                Generate Payslip
              </button>
              <button 
                onClick={() => setActiveTab('Time Off')}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-white/20">
                  <Calendar className="w-4 h-4" />
                </div>
                Request Leave
              </button>
            </div>
          </div>

          <div className="bg-white border border-black/[0.05] rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-space-gray">Experience</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-apple-gray flex items-center justify-center text-gray-400">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-space-gray">Rumby HR</p>
                  <p className="text-xs text-gray-500">2 years 4 months</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-black/[0.05] flex items-center justify-between bg-apple-gray/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold">Edit Profile</h3>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input type="text" defaultValue={employee.name} className="w-full bg-apple-gray/30 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Title</label>
                    <input type="text" defaultValue={employee.role} className="w-full bg-apple-gray/30 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input type="email" defaultValue={employee.email} className="w-full bg-apple-gray/30 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                    <input type="tel" defaultValue="+1 (555) 012-3456" className="w-full bg-apple-gray/30 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</label>
                  <input type="text" defaultValue={employee.location} className="w-full bg-apple-gray/30 border border-black/[0.05] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20" />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button onClick={() => setShowEditModal(false)} className="w-full sm:flex-1 btn-secondary py-4">Cancel</button>
                  <button onClick={() => { setShowEditModal(false); alert("Profile updated successfully!"); }} className="w-full sm:flex-1 btn-primary py-4">Save Changes</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

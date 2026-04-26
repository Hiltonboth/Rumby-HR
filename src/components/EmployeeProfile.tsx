import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Briefcase, 
  Calendar, 
  User, 
  FileText, 
  MoreHorizontal, 
  Upload, 
  ChevronRight,
  Shield,
  CreditCard,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  Download,
  Plus,
  Monitor,
  Smartphone,
  Box,
  Key,
  HelpCircle,
  X,
  Users
} from 'lucide-react';
import { Employee, EmployeeDocument, Department, UserProfile } from '../types';
import { employeeService } from '../services/employeeService';
import { assetService } from '../services/assetService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface EmployeeProfileProps {
  employeeId: string;
  onBack: () => void;
  userProfile: UserProfile | null;
}

export default function EmployeeProfile({ employeeId, onBack, userProfile }: EmployeeProfileProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'payroll' | 'assets'>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  const [editForm, setEditForm] = useState<Partial<Employee>>({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [empData, docData, assetData] = await Promise.all([
          employeeService.getEmployeeById(employeeId),
          employeeService.getEmployeeDocuments(employeeId),
          assetService.getEmployeeAssets(employeeId)
        ]);
        setEmployee(empData);
        setDocuments(docData);
        setAssets(assetData);
      } catch (error) {
        console.error("Error loading employee profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [employeeId]);

  useEffect(() => {
    if (employee) {
      setEditForm({
        firstName: employee.firstName,
        lastName: employee.lastName,
        jobTitle: employee.jobTitle,
        department: employee.department,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        startDate: employee.startDate,
        contractEndDate: employee.contractEndDate,
        leaveAccrualRate: employee.leaveAccrualRate,
        necGrade: employee.necGrade,
        necCategory: employee.necCategory,
      });
    }
  }, [employee]);

  const handleSaveProfile = async () => {
    if (!employee) return;
    try {
      setIsSaving(true);
      await employeeService.updateEmployee(employee.id, editForm);
      const updated = await employeeService.getEmployeeById(employeeId);
      setEmployee(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTerminate = async () => {
    if (!employee || !confirm(`Are you sure you want to terminate ${employee.name}? This will trigger the Asset Recovery Workflow.`)) return;

    try {
      setIsTerminating(true);
      await employeeService.updateEmployeeStatus(employee.id, 'terminated');
      // Refresh local state
      setEmployee(prev => prev ? { ...prev, status: 'terminated' } : null);
      // In a real app, the backend might handle asset flagging via triggers, 
      // but here we can refresh assets to see updated status if the service does it.
      const updatedAssets = await assetService.getEmployeeAssets(employee.id);
      setAssets(updatedAssets);
      alert("Employee terminated. Assets have been flagged for recovery.");
    } catch (err) {
      console.error(err);
      alert("Failed to terminate employee.");
    } finally {
      setIsTerminating(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!employee || !userProfile?.companyId) return;

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string;

    if (!file || !title) return;

    try {
      setIsUploading(true);
      await employeeService.uploadEmployeeDocument(userProfile.companyId, employee.id, file, title, category);
      const updatedDocs = await employeeService.getEmployeeDocuments(employee.id);
      setDocuments(updatedDocs);
      setShowUploadModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Employee not found</h2>
        <button onClick={onBack} className="btn-secondary mt-4">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-apple-gray rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-4 text-left">
            <img 
              src={employee.avatar || `https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=random`} 
              alt={employee.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-space-gray">{employee.name}</h1>
              <p className="text-sm font-medium text-gray-500">{employee.jobTitle} • {employee.department}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary py-2.5 px-4 text-sm font-bold flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Message
          </button>
          {isEditing ? (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="btn-secondary py-2.5 px-4 text-sm font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="btn-primary py-2.5 px-6 text-sm font-bold shadow-lg shadow-accent/25 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="btn-primary py-2.5 px-6 text-sm font-bold shadow-lg shadow-accent/25"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/[0.05] overflow-x-auto no-scrollbar">
        {['overview', 'documents', 'payroll', 'assets'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-6 py-4 text-sm font-bold capitalize transition-all relative",
              activeTab === tab ? "text-accent" : "text-gray-400 hover:text-space-gray"
            )}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Hierarchy & Reporting Card */}
                <div className="bg-white border border-black/[0.05] rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-space-gray mb-8 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" />
                    Reporting Structure
                  </h3>
                  
                  <div className="flex flex-col md:flex-row items-center gap-12 relative">
                    {/* Manager */}
                    <div className="flex-1 w-full md:w-auto">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center md:text-left">Reports To</div>
                      <div className="p-4 bg-apple-gray/30 rounded-2xl border border-black/[0.03] flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-accent font-bold shadow-sm">
                          {employee.managerName ? employee.managerName.charAt(0) : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-space-gray truncate">{employee.managerName || 'No Manager Assigned'}</p>
                          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Immediate Supervisor</p>
                        </div>
                      </div>
                    </div>

                    {/* Icon/Arrow */}
                    <div className="hidden md:flex items-center justify-center text-gray-300">
                      <ChevronRight className="w-8 h-8" />
                    </div>

                    {/* Current Employee */}
                    <div className="flex-1 w-full md:w-auto">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center md:text-left">Current Focus</div>
                      <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10 flex items-center gap-4 ring-2 ring-accent/10">
                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-accent/20">
                          {employee.firstName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-space-gray truncate">{employee.name}</p>
                          <p className="text-[10px] font-bold text-accent uppercase tracking-widest italic font-black">THIS PROFILE</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Reports Section (Simulation) */}
                  <div className="mt-12 bg-apple-gray/10 rounded-3xl p-6 border border-black/[0.03]">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Direct Reports</h4>
                    <div className="flex flex-wrap gap-4">
                      {employee.status === 'onboarding' ? (
                        <p className="text-sm text-gray-500 italic leading-tight">Reports will be visible once onboarding is finalized.</p>
                      ) : (
                        <div className="flex flex-col items-center gap-1 opacity-40">
                           <Users className="w-8 h-8 text-gray-300" />
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No reports</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Info Card */}
                <div className="bg-white border border-black/[0.05] rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-space-gray mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-accent" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {isEditing ? (
                      <>
                        <EditItem label="Full Name" value={editForm.name || employee.name} disabled />
                        <EditItem label="Email" value={editForm.email || ''} onChange={val => setEditForm({...editForm, email: val})} />
                        <EditItem label="Phone" value={editForm.phone || ''} onChange={val => setEditForm({...editForm, phone: val})} />
                        <EditItem label="Address" value={editForm.address || ''} onChange={val => setEditForm({...editForm, address: val})} />
                      </>
                    ) : (
                      <>
                        <InfoItem label="Full Name" value={employee.name || '-'} />
                        <InfoItem label="Email" value={employee.email} />
                        <InfoItem label="Phone" value={employee.phone || '-'} />
                        <InfoItem label="National ID" value={employee.nationalId || '-'} />
                        <InfoItem label="Date of Birth" value={employee.dateOfBirth || '-'} />
                        <InfoItem label="Gender" value={employee.gender || '-'} />
                        <InfoItem label="Marital Status" value={employee.maritalStatus || '-'} />
                        <InfoItem label="Home Address" value={employee.address || '-'} />
                      </>
                    )}
                  </div>
                </div>

                {/* Employment Card */}
                <div className="bg-white border border-black/[0.05] rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-space-gray mb-6 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-accent" />
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {isEditing ? (
                      <>
                        <EditItem label="Employee ID" value={editForm.employeeNumber || ''} disabled />
                        <EditItem label="Job Title" value={editForm.jobTitle || ''} onChange={val => setEditForm({...editForm, jobTitle: val})} />
                        <EditItem label="Department" value={editForm.department || ''} disabled />
                        <EditItem label="Start Date" type="date" value={editForm.startDate || ''} onChange={val => setEditForm({...editForm, startDate: val})} />
                        <EditItem 
                          label="Contract End Date" 
                          type="date" 
                          value={editForm.contractEndDate || ''} 
                          onChange={val => setEditForm({...editForm, contractEndDate: val})} 
                          help="System will alert HR 30 days before this date."
                        />
                        <EditItem 
                          label="Leave Accrual Rate (Days/Month)" 
                          type="number" 
                          value={editForm.leaveAccrualRate?.toString() || '1.83'} 
                          onChange={val => setEditForm({...editForm, leaveAccrualRate: parseFloat(val)})} 
                          help="Standard Zimbabwe rate is 1.83 (22 days/year)."
                        />
                      </>
                    ) : (
                      <>
                        <InfoItem label="Employee ID" value={employee.employeeNumber || '-'} />
                        <InfoItem label="Job Title" value={employee.jobTitle || '-'} />
                        <InfoItem label="Department" value={employee.department || '-'} />
                        <InfoItem label="Employment Type" value={employee.employmentType?.replace('_', ' ') || 'Full Time'} />
                        <InfoItem label="Manager" value={employee.managerName || 'No direct manager'} />
                        <InfoItem label="Start Date" value={new Date(employee.startDate).toLocaleDateString()} />
                        <InfoItem 
                          label="Contract End Date" 
                          value={employee.contractEndDate ? new Date(employee.contractEndDate).toLocaleDateString() : 'No end date set'} 
                          highlight={employee.contractEndDate ? (new Date(employee.contractEndDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000) : false}
                        />
                        <InfoItem 
                          label="Leave Accrual Rate" 
                          value={`${employee.leaveAccrualRate || 1.83} days/month`} 
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Banking Card */}
                <div className="bg-white border border-black/[0.05] rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-space-gray mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent" />
                    Banking Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InfoItem label="Bank Name" value={employee.bankName || 'Not Set'} />
                    <InfoItem label="Account Number" value={employee.bankAccount || 'Not Set'} />
                    <InfoItem label="Branch Name/Code" value={employee.bankBranch || 'Not Set'} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-space-gray">Employee Documents</h3>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="btn-accent py-2 px-4 text-xs font-bold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Document
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="bg-white border border-black/[0.05] p-6 rounded-3xl flex items-center gap-4 hover:shadow-md transition-all group"
                    >
                      <div className="w-12 h-12 bg-apple-gray rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-accent/10 group-hover:text-accent transition-all">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-space-gray truncate">{doc.title}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{doc.category}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2.5 bg-apple-gray text-gray-400 rounded-xl hover:bg-accent hover:text-white transition-all shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <div className="md:col-span-2 py-20 text-center space-y-4 bg-apple-gray/20 border-2 border-dashed border-black/[0.03] rounded-[2rem]">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto" />
                      <p className="text-gray-500 font-medium tracking-tight">No documents available in the vault.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'assets' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-space-gray">Assigned Assets & Equipment</h3>
                  {employee.status === 'terminated' && assets.length > 0 && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-2xl border border-red-100">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Recovery Pending</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assets.map((assignment: any) => (
                    <div 
                      key={assignment.id}
                      className={cn(
                        "bg-white border p-6 rounded-3xl flex items-center justify-between group transition-all",
                        employee.status === 'terminated' ? "border-red-200 bg-red-50/10" : "border-black/[0.05] hover:shadow-md"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                          employee.status === 'terminated' ? "bg-red-100 text-red-600" : "bg-apple-gray text-gray-500"
                        )}>
                          {assignment.assets.category === 'laptop' ? <Monitor className="w-6 h-6" /> : 
                           assignment.assets.category === 'mobile' ? <Smartphone className="w-6 h-6" /> : 
                           assignment.assets.category === 'software' ? <Key className="w-6 h-6" /> : 
                           <Box className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-space-gray tracking-tight">{assignment.assets.name}</h4>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">TAG: {assignment.assets.asset_tag}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                          employee.status === 'terminated' ? "bg-red-500 text-white" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {employee.status === 'terminated' ? "RECOVER" : "ACTIVE"}
                        </span>
                      </div>
                    </div>
                  ))}
                  {assets.length === 0 && (
                    <div className="md:col-span-2 py-20 text-center space-y-4 bg-apple-gray/20 border-2 border-dashed border-black/[0.03] rounded-[2rem]">
                      <Monitor className="w-12 h-12 text-gray-300 mx-auto" />
                      <p className="text-gray-500 font-medium tracking-tight">No assets assigned to this employee.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - Status & Cards */}
        <div className="space-y-6">
          {/* Contract Health Widget */}
          {employee.contractEndDate && (
            <div className={cn(
              "p-8 rounded-[2rem] border shadow-sm transition-all",
              (new Date(employee.contractEndDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000)
                ? "bg-red-50 border-red-100 ring-2 ring-red-500/20"
                : "bg-emerald-50/30 border-emerald-100"
            )}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={cn(
                  "text-xs font-black uppercase tracking-widest",
                  (new Date(employee.contractEndDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000) ? "text-red-600" : "text-emerald-700"
                )}>Contract Shield</h3>
                <div className={cn(
                  "p-2 rounded-xl",
                  (new Date(employee.contractEndDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000) ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                )}>
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Contract End Date</p>
                  <p className="text-xl font-black text-space-gray">
                    {new Date(employee.contractEndDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/[0.05]">
                  {Math.ceil((new Date(employee.contractEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 0 ? (
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                       <AlertTriangle className="w-5 h-5" />
                       <span className="text-xs uppercase tracking-tight">Contract Expired</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-gray-400 uppercase">Days Remaining</span>
                       <span className={cn(
                         "text-xs font-black",
                         (new Date(employee.contractEndDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000) ? "text-red-600" : "text-emerald-600"
                       )}>
                         {Math.max(0, Math.ceil((new Date(employee.contractEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Days
                       </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Status Card */}
          <div className="bg-white border border-black/[0.05] rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Status & Health</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Employment Status</span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  employee.status === 'active' ? "bg-green-50 text-green-600" : 
                  employee.status === 'terminated' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                )}>
                  {employee.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Probation</span>
                <span className="px-3 py-1 bg-apple-gray text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {employee.status === 'onboarding' ? 'Ongoing' : 'Completed'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-black/[0.03]">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold text-space-gray tracking-tight">Onboarding</span>
                </div>
                {employee.onboardingComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-orange-500" />
                )}
              </div>
            </div>

            {userProfile?.role === 'hr' && employee.status !== 'terminated' && (
              <div className="mt-8 pt-6 border-t border-black/[0.03]">
                <button 
                  onClick={handleTerminate}
                  disabled={isTerminating}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                >
                  {isTerminating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Terminate Employment
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-accent rounded-[2rem] p-8 text-white shadow-xl shadow-accent/30 flex flex-col items-center justify-center space-y-4">
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
               <Target className="w-8 h-8" />
             </div>
             <div className="text-center">
               <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Training Completion</p>
               <h4 className="text-3xl font-black">84%</h4>
             </div>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-black/[0.05] flex items-center justify-between">
                <h2 className="text-xl font-bold">Add to Document Vault</h2>
                <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-apple-gray rounded-full">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleFileUpload} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Document Title</label>
                  <input name="title" required className="w-full bg-apple-gray/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent" placeholder="e.g. Identity Card" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                  <select name="category" className="w-full bg-apple-gray/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent">
                    <option value="identity">Identity / Passport</option>
                    <option value="contractual">Contract / Policy</option>
                    <option value="qualification">Academic Qualification</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">File</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-black/[0.05] rounded-3xl cursor-pointer hover:bg-apple-gray/50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Click to upload doc</p>
                      </div>
                      <input name="file" type="file" className="hidden" required />
                    </label>
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full btn-primary py-4 font-bold tracking-tight shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  Upload to Vault
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoItem({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className={cn(
        "text-sm font-bold break-words leading-tight",
        highlight ? "text-red-500" : "text-space-gray"
      )}>{value}</p>
    </div>
  );
}

function EditItem({ label, value, onChange, type = 'text', disabled = false, help }: { 
  label: string, 
  value: string, 
  onChange?: (val: string) => void, 
  type?: string,
  disabled?: boolean,
  help?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{label}</label>
      <input 
        type={type}
        value={value}
        disabled={disabled}
        onChange={e => onChange?.(e.target.value)}
        className={cn(
          "w-full bg-apple-gray/50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      {help && <p className="text-[9px] text-gray-400 font-medium px-1 italic">{help}</p>}
    </div>
  );
}

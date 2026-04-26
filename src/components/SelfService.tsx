import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building2,
  FileText,
  Lock,
  Key,
  Smartphone,
  Save,
  MessageSquare,
  Monitor,
  HelpCircle,
  Box
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { UserProfile, Employee } from '../types';
import { selfService } from '../services/selfService';
import { employeeService } from '../services/employeeService';
import { assetService } from '../services/assetService';

interface SelfServiceProps {
  userProfile: UserProfile | null;
}

export default function SelfService({ userProfile }: SelfServiceProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [assignedAssets, setAssignedAssets] = useState<any[]>([]);
  
  // Local form state
  const [formData, setFormData] = useState<Partial<Employee>>({});

  useEffect(() => {
    async function init() {
      if (!userProfile?.companyId) return;
      try {
        setLoading(true);
        const emps = await employeeService.getEmployees(userProfile.companyId);
        const self = emps.find(e => e.email === userProfile.email);
        if (self) {
          setEmployee(self);
          setFormData(self);
          
          // Load Assets
          const assets = await assetService.getEmployeeAssets(self.id);
          setAssignedAssets(assets);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [userProfile]);

  const handleReportIssue = async (assetId: string) => {
    const desc = prompt("What is the issue with this equipment?");
    if (desc && employee) {
        try {
            await assetService.reportIssue({
                assetId,
                employeeId: employee.id,
                description: desc
            });
            alert("Issue reported to IT/HR.");
        } catch (err) {
            console.error(err);
            alert("Failed to report issue.");
        }
    }
  };

  const handleSave = async () => {
    if (!employee || !userProfile?.companyId) return;

    try {
      setSaving(true);
      
      // Separate "Instant" vs "Restricted" changes
      const restrictedFields = ['bank_account', 'bank_name', 'national_id', 'basic_salary', 'tax_number'];
      const changesToApprove: any[] = [];
      const instantChanges: any = {};

      Object.keys(formData).forEach(key => {
        const k = key as keyof Employee;
        if (formData[k] !== employee[k]) {
           if (restrictedFields.includes(key)) {
             changesToApprove.push({ field: key, old: employee[k], new: formData[k] });
           } else {
             instantChanges[key] = formData[k];
           }
        }
      });

      // 1. Process Instant Updates
      if (Object.keys(instantChanges).length > 0) {
        await selfService.instantUpdate(employee.id, instantChanges);
      }

      // 2. Process Restricted Requests
      for (const change of changesToApprove) {
        await selfService.requestChange({
          companyId: userProfile.companyId,
          employeeId: employee.id,
          fieldName: change.field,
          oldValue: change.old,
          newValue: change.new
        });
      }

      setEditMode(false);
      alert(changesToApprove.length > 0 
        ? "Some changes were updated instantly. Sensitive changes (Bank/ID) are pending HR approval."
        : "Profile updated successfully!");
        
      // Refresh
      const emps = await employeeService.getEmployees(userProfile.companyId);
      const self = emps.find(e => e.email === userProfile.email);
      if (self) {
        setEmployee(self);
        setFormData(self);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
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
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Profile Card */}
      <div className="relative h-48 bg-accent rounded-[3rem] overflow-hidden shadow-xl shadow-accent/20">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
         <div className="absolute -bottom-12 left-12 flex items-end gap-6">
            <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white bg-white overflow-hidden shadow-2xl flex-shrink-0">
               <img src={employee?.avatarUrl || 'https://via.placeholder.com/200'} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <div className="mb-14">
               <h1 className="text-3xl font-black text-white italic tracking-tight">{employee?.firstName} {employee?.lastName}</h1>
               <div className="flex items-center gap-2 text-white/80 text-sm font-bold mt-1 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  {employee?.jobTitle || 'Employee'} • {employee?.department || 'No Department'}
               </div>
            </div>
         </div>
         <div className="absolute bottom-6 right-12">
            {!editMode ? (
              <button 
                onClick={() => setEditMode(true)}
                className="bg-white text-accent px-6 py-3 rounded-2xl text-sm font-black italic shadow-lg hover:-translate-y-1 transition-all"
              >
                Edit My Profile
              </button>
            ) : (
              <div className="flex gap-2">
                 <button 
                  onClick={() => setEditMode(false)}
                  className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-white text-accent px-8 py-3 rounded-2xl text-sm font-black italic shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save All
                </button>
              </div>
            )}
         </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Sidebar Bio Info */}
         <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-black/[0.05] p-8 rounded-[2rem] shadow-sm space-y-6">
               <h3 className="font-bold text-space-gray tracking-tight flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" /> Personal Details
               </h3>
               <div className="space-y-4">
                  <InfoItem label="Employee ID" value={employee?.employeeNumber || '---'} edit={false} />
                  <InfoItem label="Email Address" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} edit={editMode} />
                  <InfoItem label="Contact Phone" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} edit={editMode} />
                  <InfoItem label="Date of Birth" value={employee?.dateOfBirth || '---'} edit={false} />
               </div>
            </div>
            
            <div className="bg-apple-gray/30 p-8 rounded-[2rem] border border-black/[0.03]">
               <h3 className="font-bold text-space-gray text-sm mb-4">Account Security</h3>
               <button className="w-full py-4 px-6 bg-white rounded-2xl text-xs font-bold text-gray-500 flex items-center justify-between hover:text-accent transition-colors">
                  Change Login Password <Lock className="w-4 h-4" />
               </button>
            </div>
         </div>

         {/* Main Content Areas */}
         <div className="md:col-span-2 space-y-8">
            {/* Address & Logistics */}
            <div className="bg-white border border-black/[0.05] p-10 rounded-[2.5rem] shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-space-gray flex items-center gap-3 italic">
                     <MapPin className="w-6 h-6 text-accent" /> Logistics & Address
                  </h3>
                  {editMode && <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">INSTANT UPDATE</span>}
               </div>
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Home Address</label>
                     {editMode ? (
                        <textarea 
                          value={formData.address || ''}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full bg-apple-gray border-none rounded-2xl px-6 py-4 font-bold text-space-gray"
                        />
                     ) : (
                        <p className="p-6 bg-apple-gray/50 rounded-2xl font-bold text-space-gray leading-relaxed">{employee?.address || 'Set your home address...'}</p>
                     )}
                  </div>
               </div>
            </div>

            {/* Financial Details - REQUIRES APPROVAL */}
            <div className="bg-white border border-black/[0.05] p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform">
                  <CreditCard className="w-32 h-32" />
               </div>
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-space-gray flex items-center gap-3 italic">
                     <CreditCard className="w-6 h-6 text-orange-500" /> Payroll & Banking
                  </h3>
                  {editMode && <span className="text-[10px] font-black bg-orange-50 text-orange-600 px-3 py-1 rounded-full flex items-center gap-1"><Lock className="w-3 h-3" /> REQUIRES APPROVAL</span>}
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Name</label>
                     {editMode ? (
                        <input 
                           type="text"
                           value={formData.bank_name || ''}
                           onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                           className="w-full bg-apple-gray border-none rounded-2xl px-6 py-4 font-bold"
                        />
                     ) : (
                        <p className="p-4 bg-apple-gray/30 rounded-xl font-bold text-space-gray">{employee?.bank_name || 'Not set'}</p>
                     )}
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Number</label>
                     {editMode ? (
                        <input 
                           type="text"
                           value={formData.bank_account || ''}
                           onChange={(e) => setFormData({...formData, bank_account: e.target.value})}
                           className="w-full bg-apple-gray border-none rounded-2xl px-6 py-4 font-bold"
                        />
                     ) : (
                        <p className="p-4 bg-apple-gray/30 rounded-xl font-bold text-space-gray">
                           {employee?.bank_account ? `**** **** ${employee.bank_account.slice(-4)}` : 'Not set'}
                        </p>
                     )}
                  </div>
               </div>

               <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-4">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-orange-800 uppercase leading-snug tracking-wide">
                     Sensitive banking data is encrypted and any changes will trigger a manual verification process from HR.
                  </p>
               </div>
            </div>

            {/* Assigned Assets section */}
            <div className="bg-white border border-black/[0.05] p-10 rounded-[2.5rem] shadow-sm">
               <h3 className="text-xl font-bold text-space-gray flex items-center gap-3 italic mb-8">
                  <Monitor className="w-6 h-6 text-accent" /> Assigned Equipment
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assignedAssets.map((assignment: any) => (
                    <div key={assignment.id} className="p-6 bg-apple-gray/30 rounded-[2rem] border border-black/[0.03] group hover:bg-white hover:shadow-xl transition-all">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-accent shadow-sm">
                             {assignment.assets.category === 'laptop' ? <Monitor className="w-5 h-5" /> : 
                              assignment.assets.category === 'mobile' ? <Smartphone className="w-5 h-5" /> : 
                              assignment.assets.category === 'software' ? <Key className="w-5 h-5" /> : 
                              <Box className="w-5 h-5" />}
                          </div>
                          <div>
                             <h4 className="font-bold text-space-gray text-sm">{assignment.assets.name}</h4>
                             <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">TAG: {assignment.assets.asset_tag || '#'}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => handleReportIssue(assignment.asset_id)}
                         className="w-full py-3 bg-white border border-black/[0.05] rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                       >
                          <HelpCircle className="w-4 h-4" /> Report Issue
                       </button>
                    </div>
                  ))}
                  
                  {assignedAssets.length === 0 && (
                    <div className="md:col-span-2 py-12 text-center">
                       <p className="text-gray-400 font-bold italic">No specialized equipment assigned to your profile yet.</p>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, onChange, edit }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      {edit ? (
         <input 
            type="text" 
            value={value || ''} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-apple-gray border-none rounded-xl px-4 py-3 text-sm font-bold"
         />
      ) : (
         <p className="text-sm font-bold text-space-gray tracking-tight">{value}</p>
      )}
    </div>
  );
}

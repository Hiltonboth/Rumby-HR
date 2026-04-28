import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Cpu, 
  Key, 
  Box, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  UserPlus, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Loader2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Tag,
  PenTool,
  FileText,
  DollarSign,
  Wrench,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UserProfile, Employee } from '../types';
import { assetService } from '../services/assetService';
import { employeeService } from '../services/employeeService';
import { supabase } from '../lib/supabase';

export default function AssetTracker({ userProfile }: { userProfile: UserProfile | null }) {
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<any>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function load() {
      if (!userProfile?.companyId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [assetList, empList] = await Promise.all([
          assetService.getAssets(userProfile.companyId),
          employeeService.getEmployees(userProfile.companyId)
        ]);
        setAssets(assetList || []);
        setEmployees(empList || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userProfile]);

  const refreshAssets = async () => {
    if (!userProfile?.companyId) return;
    const assetList = await assetService.getAssets(userProfile.companyId);
    setAssets(assetList);
  };

  const filteredAssets = assets.filter(a => {
    const broadMatch = (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (a.asset_tag || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (a.serial_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = activeCategory === 'all' || a.category === activeCategory;
    return broadMatch && categoryMatch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg">
                 <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-black text-space-gray tracking-tight italic uppercase">Asset & IT Shield</h1>
           </div>
           <p className="text-gray-500 font-bold ml-1 tracking-tight">Centralized inventory of company hardware, licenses, and equipment.</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <button 
             onClick={() => setShowBulkModal(true)}
             className="bg-white border border-black/[0.05] text-space-gray px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-apple-gray transition-all flex items-center gap-2 shadow-sm"
           >
              <Upload className="w-4 h-4" /> Bulk Import
           </button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="bg-accent text-white px-8 py-3 rounded-2xl text-[10px] font-black italic uppercase flex items-center gap-2 shadow-xl shadow-accent/20 hover:-translate-y-1 transition-all"
           >
              <Plus className="w-4 h-4" /> Add Asset
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-black/[0.05] p-2 rounded-[2.5rem] shadow-sm">
         <CategoryTab active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} icon={Box} label="All Hardware" count={assets.length} />
         <CategoryTab active={activeCategory === 'laptop'} onClick={() => setActiveCategory('laptop')} icon={Monitor} label="Computers" count={assets.filter(a => a.category === 'laptop').length} />
         <CategoryTab active={activeCategory === 'mobile'} onClick={() => setActiveCategory('mobile')} icon={Smartphone} label="Mobile Devices" count={assets.filter(a => a.category === 'mobile').length} />
         <CategoryTab active={activeCategory === 'software'} onClick={() => setActiveCategory('software')} icon={Key} label="Licenses" count={assets.filter(a => a.category === 'software').length} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
         <div className="flex-1 space-y-6">
            <div className="relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search by tag, serial, or name..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white border border-black/[0.05] rounded-3xl pl-16 pr-8 py-5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-accent transition-all" 
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <AnimatePresence mode="popLayout">
                  {filteredAssets.map(asset => (
                     <AssetCard 
                       key={asset.id} 
                       asset={asset} 
                       onAssign={() => setShowAssignModal(asset)} 
                       onMaintenance={() => setShowMaintenanceModal(asset)}
                     />
                  ))}
               </AnimatePresence>
            </div>
         </div>

         <div className="lg:w-80 space-y-6">
            <div className="bg-white border border-black/[0.05] p-8 rounded-[2.5rem] shadow-sm">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Inventory Health</h3>
               <div className="space-y-4">
                  <StatRow label="Assigned" value={assets.filter(a => a.status === 'assigned').length} color="text-accent" />
                  <StatRow label="Available" value={assets.filter(a => a.status === 'available').length} color="text-emerald-500" />
                  <StatRow label="Damaged" value={assets.filter(a => a.status === 'damaged').length} color="text-red-500" />
                  <StatRow label="Pending Return" value={assets.filter(a => a.status === 'pending_retrieval').length} color="text-orange-500" />
               </div>
               
               <div className="mt-8 pt-8 border-t border-black/[0.05] space-y-4">
                  <button 
                    onClick={async () => {
                      if(confirm("Trigger annual verification for all employees?")) {
                        await assetService.triggerAnnualVerification(userProfile?.companyId || '');
                        alert("Verification notices sent!");
                      }
                    }}
                    className="w-full py-4 bg-apple-gray text-space-gray text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                     <Zap className="w-4 h-4" /> Annual Audit Run
                  </button>
               </div>
            </div>

            <div className="bg-accent rounded-[2.5rem] p-8 text-white shadow-2xl shadow-accent/30 relative overflow-hidden">
               <div className="absolute -bottom-8 -right-8 opacity-10">
                  <Cpu className="w-48 h-48" />
               </div>
               <h4 className="text-xl font-black italic mb-4 tracking-tight">Recovery Shield</h4>
               <p className="text-xs font-bold text-white/70 leading-relaxed uppercase tracking-wider">
                  Assets held by terminated employees are automatically flagged for retrieval. 
                  HR cannot close employee files until all items are marked "Returned."
               </p>
            </div>
         </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && <AddAssetModal onClose={() => setShowAddModal(false)} companyId={userProfile?.companyId || ''} onRefresh={refreshAssets} />}
        {showBulkModal && <BulkImportModal onClose={() => setShowBulkModal(false)} companyId={userProfile?.companyId || ''} onRefresh={refreshAssets} />}
        {showAssignModal && <AssignAssetModal asset={showAssignModal} employees={employees} onClose={() => setShowAssignModal(null)} onRefresh={refreshAssets} companyId={userProfile?.companyId || ''} />}
        {showMaintenanceModal && <MaintenanceModal asset={showMaintenanceModal} onClose={() => setShowMaintenanceModal(null)} companyId={userProfile?.companyId || ''} />}
      </AnimatePresence>
    </div>
  );
}

function CategoryTab({ active, onClick, icon: Icon, label, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black transition-all",
        active ? "bg-accent text-white shadow-lg" : "text-gray-400 hover:text-space-gray"
      )}
    >
       <Icon className="w-5 h-5" />
       {label}
       {active && <span className="bg-white/20 px-2 py-0.5 rounded-lg ml-1">{count}</span>}
    </button>
  );
}

function AssetCard({ asset, onAssign, onMaintenance }: any) {
  const currentAssignment = asset.asset_assignments?.find((a: any) => a.status === 'active');

  return (
    <motion.div 
      layout
      className="bg-white border border-black/[0.05] p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group"
    >
       <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-apple-gray rounded-2xl flex items-center justify-center text-gray-500 shadow-inner">
                {asset.category === 'laptop' ? <Monitor /> : asset.category === 'mobile' ? <Smartphone /> : asset.category === 'software' ? <Key /> : <Box />}
             </div>
             <div>
                <h4 className="font-bold text-space-gray text-lg tracking-tight group-hover:text-accent transition-colors">{asset.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{asset.category}</p>
                   {asset.serial_number && (
                     <>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">SN: {asset.serial_number}</p>
                     </>
                   )}
                </div>
             </div>
          </div>
          <div className="text-right">
             <span className={cn(
               "text-[9px] font-black uppercase px-3 py-1 rounded-full",
               asset.status === 'available' ? "bg-emerald-50 text-emerald-600" :
               asset.status === 'assigned' ? "bg-accent/10 text-accent" :
               asset.status === 'damaged' ? "bg-red-50 text-red-600" :
               "bg-orange-50 text-orange-600"
             )}>
                {asset.status}
             </span>
             <p className="text-[9px] text-gray-400 font-black mt-2 uppercase tracking-widest">TAG: {asset.asset_tag || '#'}</p>
          </div>
       </div>

       <div className="space-y-4 pt-6 border-t border-black/[0.03]">
          {currentAssignment ? (
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-black/[0.05] bg-apple-gray flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                    {currentAssignment.employees.first_name[0]}{currentAssignment.employees.last_name[0]}
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned to</p>
                     <p className="text-xs font-black text-space-gray">{currentAssignment.employees.first_name} {currentAssignment.employees.last_name}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                 <button 
                  onClick={onMaintenance}
                  className="p-3 bg-apple-gray text-gray-500 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"
                  title="Maintenance Log"
                 >
                    <Wrench className="w-4 h-4" />
                 </button>
                 <button className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                    <History className="w-4 h-4" />
                 </button>
               </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={onAssign}
                className="flex-[2] py-4 bg-apple-gray text-space-gray text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-2"
              >
                 <UserPlus className="w-4 h-4" /> Assign Equipment
              </button>
              <button 
                onClick={onMaintenance}
                className="flex-1 py-4 bg-white border border-black/[0.05] text-gray-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-apple-gray transition-all flex items-center justify-center gap-2"
              >
                  <Wrench className="w-4 h-4" /> Log
              </button>
            </div>
          )}
       </div>
    </motion.div>
  );
}

function MaintenanceModal({ asset, onClose, companyId }: any) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    description: '',
    cost: '',
    performedBy: '',
    maintenanceDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadLogs();
  }, [asset.id]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await assetService.getMaintenanceHistory(asset.id);
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await assetService.addMaintenanceRecord({
        ...form,
        cost: form.cost ? parseFloat(form.cost) : undefined,
        assetId: asset.id,
        companyId
      });
      setForm({ description: '', cost: '', performedBy: '', maintenanceDate: new Date().toISOString().split('T')[0] });
      setShowAdd(false);
      loadLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-10 border-b border-black/[0.05] bg-apple-gray/10 flex items-center justify-between shrink-0">
             <div>
                <h3 className="text-xl font-black italic tracking-tight uppercase">Maintenance Log</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{asset.name} • {asset.asset_tag}</p>
             </div>
             <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-space-gray uppercase tracking-[0.2em]">Repair & Service History</h4>
              {!showAdd && (
                <button 
                  onClick={() => setShowAdd(true)}
                  className="bg-accent text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-accent/20"
                >
                  <Plus className="w-3 h-3" /> Add Event
                </button>
              )}
            </div>

            {showAdd && (
              <motion.form 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                onSubmit={handleSubmit} 
                className="bg-apple-gray/30 p-8 rounded-3xl border border-black/[0.02] space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Date Performed</label>
                    <input required type="date" value={form.maintenanceDate} onChange={e => setForm({...form, maintenanceDate: e.target.value})} className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Cost (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <input type="number" step="0.01" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="w-full bg-white border-none rounded-xl pl-8 pr-4 py-3 text-xs font-bold" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Performed By (Contractor/IT)</label>
                  <input required type="text" value={form.performedBy} onChange={e => setForm({...form, performedBy: e.target.value})} placeholder="e.g. Solution Centre" className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Work Description</label>
                  <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe repairs or service..." className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-bold h-24" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Upload Repair Invoice</label>
                  <button type="button" className="w-full py-4 bg-white border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 flex items-center justify-center gap-2 hover:border-accent hover:text-accent transition-all">
                    <Upload className="w-4 h-4" /> Click to Browse or Drag PDF
                  </button>
                </div>

                <div className="flex gap-2">
                  <button type="submit" disabled={submitting} className="flex-1 py-4 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 italic">
                    {submitting ? 'Stamping...' : 'Commit Log'}
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-4 bg-white text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                </div>
              </motion.form>
            )}

            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12 bg-apple-gray/20 rounded-3xl border border-dashed border-gray-200">
                  <Wrench className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No maintenance history recorded.</p>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={log.id} className="p-6 bg-white border border-black/[0.05] rounded-3xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-apple-gray flex items-center justify-center text-gray-400 italic font-black text-xs">
                      #{logs.length - idx}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-black text-space-gray tracking-tight">{log.description}</p>
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{log.cost ? `$${log.cost.toLocaleString()}` : 'No Cost'}</p>
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold mb-4">{log.performed_by || 'Unknown'} • {new Date(log.maintenance_date).toLocaleDateString()}</p>
                      <button className="flex items-center gap-2 text-[9px] font-black text-accent uppercase tracking-[0.2em] hover:opacity-70 transition-all border border-accent/20 px-3 py-2 rounded-lg bg-accent/5">
                        <FileText className="w-3 h-3" /> View Repair Invoice
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
       </motion.div>
    </div>
  );
}

function BulkImportModal({ onClose, companyId, onRefresh }: any) {
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<any[]>([]);

  const handleParse = () => {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return;
    
    // Simple CSV parser (Name, Category, Tag, Serial)
    const header = lines[0].toLowerCase();
    const dataRows = lines.slice(1);
    
    const results = dataRows.map(row => {
      const parts = row.split(',').map(p => p.trim());
      return {
        name: parts[0],
        category: parts[1] || 'laptop',
        asset_tag: parts[2] || '',
        serial_number: parts[3] || '',
        status: 'available',
        type: parts[1] === 'software' ? 'software' : 'hardware'
      };
    }).filter(r => r.name);
    
    setParsed(results);
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      await assetService.bulkImport(companyId, parsed);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Import failed. Check CSV format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-10 border-b border-black/[0.05] bg-apple-gray/10 shrink-0 flex items-center justify-between">
             <div>
                <h3 className="text-xl font-black italic tracking-tight uppercase">Bulk Asset Importer</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Import hundreds of devices instantly via CSV.</p>
             </div>
             <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 space-y-8">
            {!parsed.length ? (
              <div className="space-y-6">
                <div className="p-6 bg-accent/5 border border-accent/10 rounded-3xl">
                  <h4 className="text-[10px] font-black text-accent uppercase tracking-widest mb-4">CSV Template Guide</h4>
                  <div className="font-mono text-[10px] text-space-gray bg-white p-4 rounded-xl border border-black/[0.03]">
                    Name, Category, AssetTag, SerialNumber<br/>
                    MacBook Pro M3, laptop, ZVO-LP-001, C02XXXXXXX<br/>
                    iPhone 15, mobile, ZVO-PH-042, G7KXXXXXXX<br/>
                    Photoshop License, software, L-100-24, N/A
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Paste CSV Content Below</label>
                  <textarea 
                    value={csvData}
                    onChange={e => setCsvData(e.target.value)}
                    placeholder="Name,Category,AssetTag,SerialNumber..."
                    className="w-full h-64 bg-apple-gray border-none rounded-3xl px-8 py-6 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <button 
                  onClick={handleParse}
                  disabled={!csvData.trim()}
                  className="w-full py-5 bg-black text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                  Analyze & Preview Data
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-space-gray uppercase tracking-widest">Verify {parsed.length} Records</h4>
                  <button onClick={() => setParsed([])} className="text-[10px] font-bold text-red-500 uppercase">Clear All</button>
                </div>

                <div className="space-y-2">
                  {parsed.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-black/[0.03] rounded-2xl group hover:border-accent transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-apple-gray flex items-center justify-center text-[10px] font-black text-gray-400 italic">
                          {i+1}
                        </div>
                        <div>
                          <p className="text-xs font-black text-space-gray">{p.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">{p.category} • {p.asset_tag || 'No Tag'}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-accent transition-all" />
                    </div>
                  ))}
                </div>

                <div className="sticky bottom-0 bg-white pt-6 pb-2 border-t border-black/[0.05]">
                  <button 
                    onClick={handleImport}
                    disabled={loading}
                    className="w-full py-5 bg-accent text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    Confirm & Forge to Registry
                  </button>
                </div>
              </div>
            )}
          </div>
       </motion.div>
    </div>
  );
}

function StatRow({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
       <span className={cn("text-lg font-black italic", color)}>{value}</span>
    </div>
  );
}

function AddAssetModal({ onClose, companyId, onRefresh }: any) {
  const [form, setForm] = useState({
     name: '',
     type: 'hardware',
     category: 'laptop',
     asset_tag: '',
     serial_number: '',
     notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      await assetService.createAsset({ ...form, company_id: companyId });
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-black/[0.05] bg-apple-gray/10 flex items-center justify-between">
             <h3 className="text-xl font-black italic tracking-tight uppercase">Registry New Asset</h3>
             <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-10 space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Name / Description</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-sm font-bold" />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                   <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-4 py-4 text-xs font-bold outline-none appearance-none">
                      <option value="laptop">Laptop / PC</option>
                      <option value="mobile">Phone / Tablet</option>
                      <option value="vehicle">Company Vehicle</option>
                      <option value="software">Software License</option>
                      <option value="other">Furniture / Miscl</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
                   <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-4 py-4 text-xs font-bold outline-none appearance-none">
                      <option value="hardware">Hardware</option>
                      <option value="software">Software</option>
                   </select>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Tag #</label>
                   <input type="text" value={form.asset_tag} onChange={e => setForm({...form, asset_tag: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-xs font-bold" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Serial Number</label>
                   <input type="text" value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} className="w-full bg-apple-gray/50 border-none rounded-2xl px-6 py-4 text-xs font-bold" />
                </div>
             </div>

             <div className="flex gap-3 pt-6">
                <button type="submit" disabled={loading} className="w-full py-5 bg-accent text-white rounded-3xl text-[10px] font-black italic uppercase tracking-widest shadow-xl shadow-accent/40 flex items-center justify-center gap-2">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                   Secure to Registry
                </button>
             </div>
          </form>
       </motion.div>
    </div>
  );
}

function AssignAssetModal({ asset, employees, onClose, onRefresh, companyId }: any) {
  const [selectedEmp, setSelectedEmp] = useState('');
  const [loading, setLoading] = useState(false);
  const [triggerEsign, setTriggerEsign] = useState(true);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedEmp) return;
    try {
      setLoading(true);
      await assetService.assignAsset(asset.id, selectedEmp, companyId, triggerEsign);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
       <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden shadow-black/20">
          <div className="p-10 border-b border-black/[0.05] bg-accent/5 flex items-center justify-between">
             <h3 className="text-xl font-black italic tracking-tight uppercase text-accent">Assign Equipment</h3>
             <button onClick={onClose}><X className="w-6 h-6 text-gray-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
             <div className="flex items-center gap-4 p-6 bg-apple-gray/30 rounded-3xl">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-accent shadow-sm">
                   <Monitor className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Asset Target</p>
                   <p className="font-bold text-space-gray">{asset.name}</p>
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Responisble Employee</label>
                <select 
                  required 
                  value={selectedEmp} 
                  onChange={e => setSelectedEmp(e.target.value)} 
                  className="w-full bg-apple-gray border-none rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:ring-2 focus:ring-accent appearance-none"
                >
                  <option value="">Choose employee...</option>
                  {employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.department})</option>)}
                </select>
             </div>

             <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div 
                    onClick={() => setTriggerEsign(!triggerEsign)}
                    className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all", triggerEsign ? "bg-emerald-500 border-emerald-500 text-white" : "border-emerald-200")}
                   >
                     {triggerEsign && <CheckCircle2 className="w-4 h-4" />}
                   </div>
                   <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Trigger E-signature request</span>
                </div>
                <PenTool className="w-4 h-4 text-emerald-500" />
             </div>

             <button disabled={loading || !selectedEmp} type="submit" className="w-full py-5 bg-accent text-white rounded-3xl text-[10px] font-black italic uppercase tracking-widest shadow-xl shadow-accent/40 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                Confirm Assignment
             </button>
          </form>
       </motion.div>
    </div>
  );
}

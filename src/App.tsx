import React, { useState, useEffect } from 'react';
import { TrendingUp, CreditCard, LogOut, ShieldCheck, ArrowLeft, Upload, Sparkles, Building2, FileText, Calendar, Users, AlertCircle, Plus } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TeamDirectory from './components/TeamDirectory';
import EmployeeProfile from './components/EmployeeProfile';
import HiringPipeline from './components/HiringPipeline';
import OnboardingWizard from './components/OnboardingWizard';
import AIChatbot from './components/AIChatbot';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Payroll from './components/Payroll';
import ESignaturesHub from './components/ESignaturesHub';
import Community from './components/Community';
import ResourceLibrary from './components/ResourceLibrary';
import Documentation from './components/Documentation';
import LeaveTracker from './components/LeaveTracker';
import Attendance from './components/Attendance';
import SelfService from './components/SelfService';
import DocumentVault from './components/DocumentVault';
import AssetTracker from './components/AssetTracker';
import WorkspaceSetup from './components/WorkspaceSetup';
import CompanySettings from './components/CompanySettings';
import Treasury from './components/Treasury';
import { Logo } from './components/Logo';
import { supabase } from './lib/supabase';
import { Employee, Company, UserProfile } from './types';
import { motion } from 'motion/react';
import { cn } from './lib/utils';
// Note: handleFirestoreError will be replaced/removed as we move to Supabase

import JobPortal from './components/JobPortal';
import { ThemeProvider } from './components/ThemeContext';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { user, userProfile, loading: isAuthLoading, isConfigured } = useAuth();
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'app' | 'documentation' | 'careers'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewHistory, setViewHistory] = useState<string[]>(['dashboard']);
  const [portalCompanyId, setPortalCompanyId] = useState<string | null>(null);

  const showConfigWarning = !isConfigured && view !== 'landing' && view !== 'documentation';

  useEffect(() => {
    // Check for Careers Portal URL
    const path = window.location.pathname;
    const careersMatch = path.match(/\/careers\/([a-zA-Z0-9-]+)/);
    if (careersMatch) {
      setPortalCompanyId(careersMatch[1]);
      setView('careers');
    }
  }, []);

  // Update view and fetch company when auth state changes
  useEffect(() => {
    if (userProfile) {
      if (view === 'landing' || view === 'login' || view === 'signup') {
        setView('app');
      }
      
      // Fetch company data if missing or changed
      if (userProfile.companyId && userProfile.companyId !== 'global' && (!currentCompany || currentCompany.id !== userProfile.companyId)) {
        supabase
          .from('companies')
          .select('*')
          .eq('id', userProfile.companyId)
          .single()
          .then(({ data: company, error: companyError }) => {
            if (companyError) {
              console.error("Error fetching company:", companyError);
            } else if (company) {
              setCurrentCompany({
                id: company.id,
                name: company.name,
                logoUrl: company.logo_url,
                accentColor: '#007AFF',
                plan: company.plan,
                industry: company.industry,
                country: company.country,
                currency: company.currency,
                status: company.status
              } as Company);
            }
          });
      }
    } else if (!isAuthLoading) {
      if (view === 'app' || view === 'onboarding') {
        setView('landing');
      }
      setCurrentCompany(null);
    }
  }, [userProfile, isAuthLoading]);

  useEffect(() => {
    if (currentCompany?.accentColor) {
      document.documentElement.style.setProperty('--accent-color', currentCompany.accentColor);
    }
  }, [currentCompany]);

  const navigateTo = (tab: string) => {
    setViewHistory(prev => [...prev, tab]);
    setActiveTab(tab);
    setSelectedEmployee(null);
  };

  const goBack = () => {
    if (selectedEmployee) {
      setSelectedEmployee(null);
      return;
    }
    if (viewHistory.length > 1) {
      const newHistory = [...viewHistory];
      newHistory.pop(); // Remove current
      const previousTab = newHistory[newHistory.length - 1];
      setViewHistory(newHistory);
      setActiveTab(previousTab);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('landing');
  };

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentCompany) return;

    // Validation
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setLogoUploadError('Please upload a valid image (PNG, JPG, or SVG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setLogoUploadError('Logo file size must be less than 2MB');
      return;
    }

    setLogoUploadError(null);
    setIsUploadingLogo(true);

    // Simulate upload process with progress feedback
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const { error: updateError } = await supabase
          .from('companies')
          .update({ logo_url: base64String })
          .eq('id', currentCompany.id);

        if (updateError) {
          console.error("Error updating logo:", updateError);
          setLogoUploadError('Failed to save logo to database');
        } else {
          setCurrentCompany(prev => prev ? { ...prev, logoUrl: base64String } : null);
          alert('Company logo updated successfully!');
        }
        setIsUploadingLogo(false);
      };
      reader.onerror = () => {
        setLogoUploadError('Failed to read file');
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading logo:", error);
      setLogoUploadError('An unexpected error occurred during upload');
      setIsUploadingLogo(false);
    }
  };

  const renderContent = () => {
    if (userProfile?.role === 'platform_owner' && activeTab === 'owner_kpis') {
      return (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="p-2 hover:bg-red-50 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5 text-[#D32F2F]" />
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-[#D32F2F]">Platform Owner Dashboard</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-[#FFCA28]/20 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Signups</p>
              <p className="text-4xl font-bold text-space-gray">1,248</p>
              <div className="mt-4 h-1 w-full bg-[#FFCA28]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#FFCA28] w-3/4" />
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-[#D32F2F]/20 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Tenants</p>
              <p className="text-4xl font-bold text-space-gray">84</p>
              <div className="mt-4 h-1 w-full bg-[#D32F2F]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#D32F2F] w-1/2" />
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-[#FFCA28]/20 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Monthly Revenue</p>
              <p className="text-4xl font-bold text-[#D32F2F]">$12,450</p>
              <div className="mt-4 h-1 w-full bg-[#FFCA28]/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#FFCA28] w-2/3" />
              </div>
            </div>
          </div>
          
          <div className="card-aura p-8 bg-gradient-to-br from-[#D32F2F]/5 to-[#FFCA28]/5 border-none">
            <h3 className="text-lg font-bold text-space-gray mb-4">Platform Health</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Uptime', value: '99.9%', color: '#D32F2F' },
                { label: 'API Latency', value: '45ms', color: '#FFCA28' },
                { label: 'Error Rate', value: '0.02%', color: '#D32F2F' },
                { label: 'DB Load', value: '12%', color: '#FFCA28' }
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (selectedEmployee) {
      return (
        <EmployeeProfile 
          employeeId={selectedEmployee.id}
          userProfile={userProfile}
          onBack={goBack} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} userProfile={userProfile} />;
      case 'team':
      case 'self_service':
        return <SelfService userProfile={userProfile} />;
      case 'leave':
        return <LeaveTracker userProfile={userProfile} />;
      case 'attendance':
      case 'time':
        return <Attendance userProfile={userProfile} />;
      case 'engagement':
      case 'workflows':
        return <TeamDirectory onSelectEmployee={setSelectedEmployee} userProfile={userProfile} />;
      case 'hiring':
        return <HiringPipeline userProfile={userProfile} />;
      case 'payroll':
        return <Payroll userProfile={userProfile} />;
      case 'treasury':
        return <Treasury userProfile={userProfile} />;
      case 'esignature':
        return <ESignaturesHub userProfile={userProfile} />;
      case 'community':
        return <Community initialView="feed" />;
      case 'jobs':
        return <Community initialView="jobs" />;
      case 'library':
        return <ResourceLibrary />;
      case 'vault':
        return <DocumentVault userProfile={userProfile} />;
      case 'assets':
        return <AssetTracker userProfile={userProfile} />;
      case 'onboarding':
        return (
          <OnboardingWizard 
            userProfile={userProfile} 
            onNavigate={navigateTo}
          />
        );
      case 'performance':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="w-16 h-16 bg-apple-gray rounded-3xl flex items-center justify-center text-gray-400">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Performance Reviews</h2>
            <p className="text-gray-500 max-w-xs">Detailed performance tracking and 360-degree reviews are coming soon.</p>
          </div>
        );
      case 'settings':
        if (['owner', 'admin'].includes(userProfile?.role || '')) {
          return <CompanySettings userProfile={userProfile} />;
        }
        return (
          <div className="max-w-2xl space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={goBack} className="p-2 hover:bg-apple-gray rounded-xl transition-all">
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <h1 className="text-3xl font-bold tracking-tight text-space-gray">Settings</h1>
              </div>
              <button onClick={handleLogout} className="btn-secondary flex items-center gap-2 text-red-500 hover:bg-red-50">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
            {currentCompany && (
              <div className="space-y-8">
                <div className="card-aura p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      Branding
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="relative group">
                        <div 
                          className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden bg-accent"
                          style={{ backgroundColor: currentCompany.accentColor }}
                        >
                          {isUploadingLogo ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : currentCompany.logoUrl ? (
                            <img src={currentCompany.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            currentCompany.name.charAt(0)
                          )}
                        </div>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-md border border-black/[0.05] text-gray-500 hover:text-accent transition-all"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleLogoUpload} 
                          className="hidden" 
                          accept="image/*" 
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-space-gray">Company Logo</p>
                          <p className="text-xs text-gray-500">Upload a square logo for your company. PNG, JPG or SVG (Max 2MB).</p>
                          {logoUploadError && (
                            <p className="text-xs font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{logoUploadError}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Accent Color</p>
                          <div className="flex flex-wrap gap-2">
                            {['#007AFF', '#5856D6', '#FF2D55', '#AF52DE', '#FF9500'].map(color => (
                              <button
                                key={color}
                                onClick={() => {
                                  setCurrentCompany(prev => prev ? { ...prev, accentColor: color } : null);
                                }}
                                className="w-8 h-8 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-aura p-8 space-y-8">
                  <div className="space-y-6">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-accent" />
                      Company Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => alert('Opening Policy Manager...')}
                        className="p-6 bg-apple-gray/30 rounded-2xl border border-black/[0.02] text-left hover:bg-apple-gray/50 transition-all group"
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="font-bold text-space-gray">Company Policies</p>
                        <p className="text-xs text-gray-500 mt-1">Manage employee handbooks and legal documents.</p>
                      </button>

                      <button 
                        onClick={() => alert('Opening Holiday Calendar...')}
                        className="p-6 bg-apple-gray/30 rounded-2xl border border-black/[0.02] text-left hover:bg-apple-gray/50 transition-all group"
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                          <Calendar className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="font-bold text-space-gray">Holiday Calendar</p>
                        <p className="text-xs text-gray-500 mt-1">Configure public holidays and company-wide breaks.</p>
                      </button>

                      <button 
                        onClick={() => alert('Opening Department Structures...')}
                        className="p-6 bg-apple-gray/30 rounded-2xl border border-black/[0.02] text-left hover:bg-apple-gray/50 transition-all group"
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="font-bold text-space-gray">Department Structure</p>
                        <p className="text-xs text-gray-500 mt-1">Define organizational hierarchy and reporting lines.</p>
                      </button>

                      <button 
                        onClick={() => alert('Opening Security Settings...')}
                        className="p-6 bg-apple-gray/30 rounded-2xl border border-black/[0.02] text-left hover:bg-apple-gray/50 transition-all group"
                      >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="font-bold text-space-gray">Security & Access</p>
                        <p className="text-xs text-gray-500 mt-1">Manage admin permissions and login security.</p>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={() => alert('All settings saved successfully!')}
                    className="btn-primary px-8 py-3"
                  >
                    Save All Changes
                  </button>
                </div>
              </div>
            )}
        </div>
      );
      default:
        return <Dashboard onNavigate={navigateTo} userProfile={userProfile} />;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-8 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Pulsing Aura */}
          <motion.div 
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-accent blur-3xl rounded-full"
          />
          <Logo className="w-32 h-32 relative drop-shadow-[0_20px_50px_rgba(0,122,255,0.3)]" />
        </motion.div>
        
        <div className="text-center space-y-6 relative">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">ZivoHR</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">The Heart of your Workspace</p>
          </div>
          
          <div className="flex items-center gap-3 justify-center">
            {[0, 2, 4].map((delay) => (
              <motion.div 
                key={delay}
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1]
                }} 
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  delay: delay * 0.1 
                }}
                className="w-2.5 h-2.5 bg-accent rounded-full shadow-lg shadow-accent/20" 
              />
            ))}
          </div>
          
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs font-bold text-slate-500 tracking-widest uppercase"
          >
            Securing your session...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {showConfigWarning && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-orange-600 text-white p-2 text-center text-xs font-bold flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your settings.
          <button 
            onClick={() => setView('documentation')}
            className="underline ml-2"
          >
            How to set up?
          </button>
        </div>
      )}
      {view === 'careers' && portalCompanyId ? (
        <JobPortal companyId={portalCompanyId} />
      ) : view === 'landing' ? (
        <LandingPage 
          onGetStarted={() => setView('signup')} 
          onLogin={() => setView('login')} 
          onDocumentation={() => setView('documentation')}
          user={user}
          onGoToDashboard={() => setView('app')}
        />
      ) : view === 'documentation' ? (
        <Documentation onBack={() => setView('landing')} />
      ) : view === 'login' || view === 'signup' ? (
        <LoginPage isSignup={view === 'signup'} onBackToHome={() => setView('landing')} onSuccess={() => setView('app')} />
      ) : userProfile && (!userProfile.companyId || userProfile.companyId === '') && userProfile.role !== 'platform_owner' ? (
        <WorkspaceSetup 
          userProfile={userProfile} 
          onComplete={() => {
            // Re-fetch profile or just reload
            window.location.reload(); 
          }} 
        />
      ) : (
        <Layout 
          activeTab={activeTab} 
          setActiveTab={navigateTo}
          currentCompany={currentCompany || { id: 'temp', name: 'ZivoHR', logoUrl: '', accentColor: '#007AFF', plan: 'pro', country: 'Zimbabwe', currency: 'USD' }}
          userProfile={userProfile}
          onBack={viewHistory.length > 1 || selectedEmployee ? goBack : undefined}
          onGoHome={() => setView('landing')}
        >
          {renderContent()}
        </Layout>
      )}
      <AIChatbot />
    </ThemeProvider>
  );
}

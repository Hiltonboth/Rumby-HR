import React, { useState, useEffect } from 'react';
import { TrendingUp, CreditCard, LogOut, ShieldCheck, ArrowLeft, Upload, Sparkles, Building2, FileText, Calendar, Users } from 'lucide-react';
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
import ESignature from './components/ESignature';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Employee, Company, UserProfile } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewHistory, setViewHistory] = useState<string[]>(['dashboard']);

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      handleAuthChange(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthChange = async (firebaseUser: any) => {
    if (firebaseUser) {
      setUser(firebaseUser);
      
      // Fetch user profile from Firestore 'profiles' collection
      const profileRef = doc(db, 'profiles', firebaseUser.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const profile = profileSnap.data() as UserProfile;
        setUserProfile(profile);
        
        // Fetch company data
        const tenantRef = doc(db, 'tenants', profile.tenantId);
        const tenantSnap = await getDoc(tenantRef);

        if (tenantSnap.exists()) {
          setCurrentCompany({ id: tenantSnap.id, ...tenantSnap.data() } as Company);
        }
        
        setView('app');
      } else {
        // Handle platform owner or incomplete signup
        if (firebaseUser.email === 'hmarumure@gmail.com') {
           setUserProfile({ uid: firebaseUser.uid, role: 'platform_owner', tenantId: 'global', email: firebaseUser.email! });
           setView('app');
        } else {
           setView('login');
        }
      }
    } else {
      setUser(null);
      setUserProfile(null);
      setCurrentCompany(null);
      if (view === 'app') setView('landing');
    }
    setIsAuthReady(true);
  };

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
    await signOut(auth);
    setView('landing');
  };

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentCompany) return;

    setIsUploadingLogo(true);
    // Simulate upload
    setTimeout(async () => {
      try {
        // In a real app, we'd upload to Storage and get a URL
        // Here we'll just use a placeholder or the first letter as requested if it "fails"
        // But the user said "simulate an upload process and then display the first letter... as a fallback if the upload fails"
        // Let's assume it "succeeds" with a mock URL for now, or just updates the state.
        const mockUrl = URL.createObjectURL(file);
        const tenantRef = doc(db, 'tenants', currentCompany.id);
        await updateDoc(tenantRef, { logo: mockUrl });
        setCurrentCompany(prev => prev ? { ...prev, logo: mockUrl } : null);
      } catch (error) {
        console.error("Error uploading logo:", error);
      } finally {
        setIsUploadingLogo(false);
      }
    }, 1500);
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
          employee={selectedEmployee} 
          onBack={goBack} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'team':
      case 'self_service':
      case 'leave':
      case 'time':
      case 'attendance':
      case 'engagement':
      case 'workflows':
        return <TeamDirectory onSelectEmployee={setSelectedEmployee} />;
      case 'hiring':
        return <HiringPipeline />;
      case 'payroll':
        return <Payroll />;
      case 'esignature':
        return <ESignature />;
      case 'onboarding':
        return (
          <OnboardingWizard 
            userId={user?.id || ''} 
            onComplete={() => navigateTo('dashboard')}
            onCancel={() => navigateTo('dashboard')}
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
                          ) : currentCompany.logo ? (
                            <img src={currentCompany.logo} alt="Logo" className="w-full h-full object-cover" />
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
                          <p className="text-xs text-gray-500">Upload a square logo for your company. PNG or JPG preferred.</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Accent Color</p>
                          <div className="flex flex-wrap gap-2">
                            {['#007AFF', '#5856D6', '#FF2D55', '#AF52DE', '#FF9500'].map(color => (
                              <button
                                key={color}
                                onClick={async () => {
                                  try {
                                    const tenantRef = doc(db, 'tenants', currentCompany.id);
                                    await updateDoc(tenantRef, { accentColor: color });
                                    setCurrentCompany(prev => prev ? { ...prev, accentColor: color } : null);
                                  } catch (error) {
                                    console.error("Error updating accent color:", error);
                                  }
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
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {view === 'landing' ? (
        <LandingPage 
          onGetStarted={() => setView('signup')} 
          onLogin={() => setView('login')} 
          user={user}
          onGoToDashboard={() => setView('app')}
        />
      ) : view === 'login' || view === 'signup' ? (
        <LoginPage isSignup={view === 'signup'} onBackToHome={() => setView('landing')} onSuccess={() => setView('app')} />
      ) : (
        <Layout 
          activeTab={activeTab} 
          setActiveTab={navigateTo}
          currentCompany={currentCompany || { id: 'temp', name: 'Rumby HR', logo: 'R', accentColor: '#007AFF', plan: 'Pro', employeeCount: 0, status: 'Active', ownerUid: '' }}
          userProfile={userProfile}
          onBack={viewHistory.length > 1 || selectedEmployee ? goBack : undefined}
          onGoHome={() => setView('landing')}
        >
          {renderContent()}
        </Layout>
      )}
      <AIChatbot />
    </>
  );
}

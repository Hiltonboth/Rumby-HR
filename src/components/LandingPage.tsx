import React, { useState } from 'react';
import { Shield, Zap, Users, BarChart3, ChevronRight, Star, CheckCircle2, ChevronDown, CreditCard, Menu, X, MessageCircle, Sparkles, FileText, Heart, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import ResourceLibrary from './ResourceLibrary';
import Community from './Community';
import SuccessStories from './SuccessStories';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  user?: any;
  onGoToDashboard?: () => void;
}

const features = [
  { 
    name: 'Hiring & Onboarding', 
    id: 'hiring',
    subFeatures: ['Applicant Tracking', 'Onboarding', 'Candidate Experience', 'Offer Management'] 
  },
  { 
    name: 'Core HR', 
    id: 'core',
    subFeatures: ['Employee Database', 'Document Management', 'HR Workflows', 'Employee Self-Service'] 
  },
  { 
    name: 'Performance & Development', 
    id: 'performance',
    subFeatures: ['Goal Setting', '360-degree Feedback', 'Skill Gap Analysis', 'Learning Management'] 
  },
  { 
    name: 'Payroll & Expense', 
    id: 'payroll',
    subFeatures: ['Payroll Integration', 'Expense Claims', 'Reimbursements', 'Tax Compliance'] 
  },
  {
    name: 'E-Signature',
    id: 'esignature',
    subFeatures: ['Document Upload', 'Digital Signing', 'Signature Requests', 'Audit Trails']
  },
  { 
    name: 'Employee Engagement', 
    id: 'engagement',
    subFeatures: ['Case Management', 'Internal Communications', 'Employee Surveys', 'Recognition'] 
  },
  { name: 'Resource Library', id: 'library' },
  { name: 'Community Forum', id: 'community' },
  { name: 'Case Studies', id: 'case-studies' },
  { name: 'HR automation', id: 'automation' },
  { name: 'Mobile app', id: 'mobile' },
];

export default function LandingPage({ onGetStarted, onLogin, user, onGoToDashboard }: LandingPageProps) {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedFeature, setMobileExpandedFeature] = useState<string | null>(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState('hiring');

  const featureTabs = [
    { id: 'hiring', label: 'Hiring', icon: Users },
    { id: 'core', label: 'Core HR', icon: Shield },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'esignature', label: 'E-Signature', icon: PenTool },
    { id: 'engagement', label: 'Engagement', icon: Star },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsFeaturesOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleGetStarted = () => {
    if (user) {
      // If there was a checkout tab, we'd go there. 
      // For now, let's assume onGetStarted handles the routing to checkout if logged in.
      onGetStarted();
    } else {
      onLogin();
    }
  };

  const handleTalkToSales = () => {
    window.open('https://wa.me/263772240081?text=Hi!%20I%20want%20to%20talk%20to%20sales%20about%20ZivoHR.', '_blank');
  };

  return (
    <div className="min-h-screen bg-white text-space-gray overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full glass z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold">Z</div>
          <span className="text-xl font-bold tracking-tight">ZivoHR</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-500">
          <div 
            className="relative"
            onMouseEnter={() => setIsFeaturesOpen(true)}
            onMouseLeave={() => {
              setIsFeaturesOpen(false);
              setActiveSubMenu(null);
            }}
          >
            <button className="flex items-center gap-1 hover:text-space-gray transition-colors py-2 font-bold">
              Features
              <ChevronDown className={cn("w-4 h-4 transition-transform", isFeaturesOpen && "rotate-180")} />
            </button>
            
            <AnimatePresence>
              {isFeaturesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 flex mt-1"
                >
                  <div className="w-72 bg-white border border-black/[0.05] rounded-2xl shadow-2xl p-2 z-10">
                    <div className="space-y-1">
                      {features.map((feature) => (
                        <button 
                          key={feature.name}
                          onMouseEnter={() => setActiveSubMenu(feature.subFeatures ? feature.name : null)}
                          onClick={() => scrollToSection(feature.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left text-sm font-bold",
                            activeSubMenu === feature.name 
                              ? "bg-accent/5 text-accent" 
                              : "text-gray-600 hover:bg-apple-gray/50 hover:text-space-gray"
                          )}
                        >
                          {feature.name}
                          {feature.subFeatures && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-black/[0.03]">
                      <button 
                        onClick={onGetStarted}
                        className="w-full py-3 rounded-xl border border-accent/20 text-accent font-bold text-sm hover:bg-accent/5 transition-all"
                      >
                        Explore MVP Features
                      </button>
                    </div>
                  </div>

                  {/* Sub-menu */}
                  <AnimatePresence>
                    {activeSubMenu && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="w-64 bg-white border border-black/[0.05] rounded-2xl shadow-2xl p-2 ml-2 h-fit"
                      >
                        <div className="px-4 py-2 border-b border-black/[0.03] mb-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeSubMenu}</p>
                        </div>
                        <div className="space-y-1">
                          {features.find(f => f.name === activeSubMenu)?.subFeatures?.map((sub) => (
                            <button 
                              key={sub}
                              onClick={() => scrollToSection(features.find(f => f.name === activeSubMenu)?.id || 'features')}
                              className="w-full px-4 py-2.5 rounded-lg hover:bg-apple-gray/50 text-left text-sm font-medium text-gray-500 hover:text-space-gray transition-all"
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <a href="#pricing" className="hover:text-space-gray transition-colors font-bold">Pricing</a>
          <div className="h-6 w-[1px] bg-black/[0.05]" />
          {user ? (
            <button 
              onClick={onGoToDashboard} 
              className="btn-primary px-6 py-2.5 shadow-lg shadow-accent/20 flex items-center gap-2"
            >
              Go to Dashboard
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button 
                onClick={onLogin} 
                className="px-4 py-2 rounded-xl font-bold text-gray-600 hover:bg-apple-gray transition-all"
              >
                Login
              </button>
              <button 
                onClick={onGetStarted} 
                className="btn-primary px-6 py-2.5 shadow-lg shadow-accent/20"
              >
                Sign Up Free
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-gray-500 hover:text-accent transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white border-b border-black/[0.05] shadow-2xl lg:hidden max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Features</p>
                  <div className="space-y-2">
                    {features.map((feature) => (
                      <div key={feature.name} className="space-y-2">
                        <button 
                          onClick={() => {
                            if (feature.subFeatures) {
                              setMobileExpandedFeature(mobileExpandedFeature === feature.name ? null : feature.name);
                            } else {
                              scrollToSection(feature.id);
                            }
                          }}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl text-left font-bold transition-all",
                            mobileExpandedFeature === feature.name ? "bg-accent/5 text-accent" : "text-gray-600 hover:bg-apple-gray/50"
                          )}
                        >
                          {feature.name}
                          {feature.subFeatures && (
                            <ChevronDown className={cn("w-4 h-4 transition-transform", mobileExpandedFeature === feature.name && "rotate-180")} />
                          )}
                        </button>
                        
                        {/* Mobile Sub-features */}
                        <AnimatePresence>
                          {mobileExpandedFeature === feature.name && feature.subFeatures && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-4 space-y-1"
                            >
                              {feature.subFeatures.map((sub) => (
                                <button
                                  key={sub}
                                  onClick={() => scrollToSection(feature.id)}
                                  className="w-full p-2 text-sm font-medium text-gray-500 hover:text-accent text-left"
                                >
                                  {sub}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-black/[0.05] space-y-4">
                  {user ? (
                    <button onClick={onGoToDashboard} className="w-full btn-primary py-4">Go to Dashboard</button>
                  ) : (
                    <>
                      <button onClick={onLogin} className="w-full p-3 text-center font-bold text-gray-600">Login</button>
                      <button onClick={onGetStarted} className="w-full btn-primary py-4">Get Started</button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-bold"
          >
            <Zap className="w-4 h-4" />
            The Future of HR is Here
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl font-bold tracking-tight text-space-gray max-w-4xl mx-auto leading-[1.1]"
          >
            Your All-in-One <br />
            <span className="text-accent">HR Platform for SMEs</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto"
          >
            We handle it all. The all-in-one HR platform built specifically for SMEs in Zimbabwe and Africa. From hiring to payroll, manage everything in one beautiful interface.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            <button onClick={handleGetStarted} className="btn-primary px-8 py-4 text-lg">Start Free Trial</button>
            <button onClick={handleTalkToSales} className="btn-secondary px-8 py-4 text-lg flex items-center gap-2">
              Talk to Sales
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Tabbed Interface */}
      <div className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Everything you need in one place</h2>
            <p className="text-xl text-gray-500">Click a tab to explore our powerful HR tools.</p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-16 bg-apple-gray/30 p-2 rounded-[2rem] w-fit mx-auto">
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all",
                  activeFeatureTab === tab.id 
                    ? "bg-white text-accent shadow-lg shadow-accent/5 scale-105" 
                    : "text-gray-500 hover:text-space-gray hover:bg-white/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeatureTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
            >
              {activeFeatureTab === 'hiring' && (
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight">Hiring & Onboarding</h2>
                    <p className="text-lg text-gray-500">
                      Find the best talent and give them a world-class first day. Our automated pipelines handle everything from job posting to document signing.
                    </p>
                    <ul className="space-y-4">
                      {['Applicant Tracking System', 'Custom Onboarding Workflows', 'Electronic Signatures', 'Candidate Portals'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-gray-600 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button onClick={onLogin} className="btn-primary px-6 py-3 flex items-center gap-2">
                      Get Started with Hiring <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-apple-gray/50 rounded-[2.5rem] p-8 aspect-square flex items-center justify-center border border-black/[0.03]">
                    <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-black/[0.05] p-6 space-y-4">
                      <div className="h-4 w-1/3 bg-apple-gray rounded-full" />
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-12 w-full bg-apple-gray/50 rounded-xl flex items-center px-4 gap-3">
                            <div className="w-6 h-6 rounded-full bg-accent/20" />
                            <div className="h-2 w-1/2 bg-apple-gray rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'core' && (
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="order-2 md:order-1 bg-apple-gray/50 rounded-[2.5rem] p-8 aspect-square flex items-center justify-center border border-black/[0.03]">
                    <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-black/[0.05] p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-1/4 bg-apple-gray rounded-full" />
                        <div className="h-8 w-8 rounded-full bg-apple-gray" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-24 bg-apple-gray/50 rounded-2xl" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="order-1 md:order-2 space-y-6">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight">Core HR & Database</h2>
                    <p className="text-lg text-gray-500">
                      Your single source of truth for all employee data. Secure, compliant, and accessible from anywhere.
                    </p>
                    <ul className="space-y-4">
                      {['Centralized Employee Directory', 'Document Management', 'Custom HR Workflows', 'Compliance Tracking'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-gray-600 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button onClick={onLogin} className="btn-primary px-6 py-3 flex items-center gap-2">
                      Manage Your Team <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'payroll' && (
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="order-2 md:order-1 bg-apple-gray/50 rounded-[2.5rem] p-8 aspect-square flex items-center justify-center border border-black/[0.03]">
                    <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-black/[0.05] p-6 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="h-3 w-24 bg-apple-gray rounded-full" />
                          <div className="h-2 w-16 bg-apple-gray/50 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[1, 2].map(i => (
                          <div key={i} className="p-4 rounded-2xl border border-black/[0.05] flex justify-between items-center">
                            <div className="h-3 w-20 bg-apple-gray rounded-full" />
                            <div className="h-3 w-12 bg-green-100 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="order-1 md:order-2 space-y-6">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight">Payroll & Expense</h2>
                    <p className="text-lg text-gray-500">
                      Automate your payroll and manage expenses without the headache. Seamless integrations with your favorite tools.
                    </p>
                    <ul className="space-y-4">
                      {['Automated Payroll Processing', 'Expense Reimbursements', 'Tax Compliance', 'Benefits Administration'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-gray-600 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button onClick={onLogin} className="btn-primary px-6 py-3 flex items-center gap-2">
                      Automate Payroll <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'performance' && (
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-6">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight">Performance & Development</h2>
                    <p className="text-lg text-gray-500">
                      Nurture your talent with continuous feedback and clear growth paths. Build a culture of excellence.
                    </p>
                    <ul className="space-y-4">
                      {['OKR & Goal Tracking', '360-Degree Feedback', 'Skill Gap Analysis', 'Performance Reviews'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-gray-600 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button onClick={onLogin} className="btn-primary px-6 py-3 flex items-center gap-2">
                      Boost Performance <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-apple-gray/50 rounded-[2.5rem] p-8 aspect-square flex items-center justify-center border border-black/[0.03]">
                    <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-black/[0.05] p-6 space-y-8">
                      <div className="space-y-2">
                        <div className="h-4 w-1/2 bg-apple-gray rounded-full" />
                        <div className="h-2 w-full bg-apple-gray/50 rounded-full" />
                      </div>
                      <div className="flex items-end gap-2 h-32">
                        {[40, 70, 50, 90, 60, 80].map((h, i) => (
                          <div key={i} className="flex-1 bg-accent/20 rounded-t-lg" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'esignature' && (
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="order-2 md:order-1 bg-apple-gray/50 rounded-[2.5rem] p-8 aspect-square flex items-center justify-center border border-black/[0.03]">
                    <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-black/[0.05] p-8 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white">
                          <PenTool className="w-6 h-6" />
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Secure</div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-lg">Sign Employment Contract</h4>
                        <p className="text-sm text-gray-500">Document: Contract_Rivera.pdf</p>
                      </div>
                      <div className="h-32 w-full border-2 border-dashed border-black/[0.05] rounded-2xl flex items-center justify-center">
                        <p className="text-xs text-gray-300 font-medium italic">Signature goes here</p>
                      </div>
                      <button className="w-full btn-primary py-3 rounded-xl">Confirm Signature</button>
                    </div>
                  </div>
                  <div className="order-1 md:order-2 space-y-6">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight">Secure E-Signatures</h2>
                    <p className="text-lg text-gray-500">
                      Go paperless with our integrated e-signature solution. Upload any document, sign it digitally, and request signatures from employees or partners with a single click.
                    </p>
                    <ul className="space-y-4">
                      {['Legally Binding Signatures', 'Bulk Signature Requests', 'Document Status Tracking', 'Secure Audit Trails'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-gray-600 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button onClick={onLogin} className="btn-primary px-6 py-3 flex items-center gap-2">
                      Try E-Signatures <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeFeatureTab === 'engagement' && (
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <div className="space-y-6">
                    <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600">
                      <Star className="w-6 h-6" />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight">Employee Engagement</h2>
                    <p className="text-lg text-gray-500">
                      Listen to your employees and build a workplace they love. Pulse surveys, recognition, and internal comms.
                    </p>
                    <ul className="space-y-4">
                      {['Pulse Surveys', 'Employee Recognition', 'Internal Social Network', 'Case Management'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-gray-600 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button onClick={onLogin} className="btn-primary px-6 py-3 flex items-center gap-2">
                      Engage Your People <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-apple-gray/50 rounded-[2.5rem] p-8 aspect-square flex items-center justify-center border border-black/[0.03]">
                    <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-black/[0.05] p-6 flex flex-col items-center justify-center space-y-6">
                      <div className="flex -space-x-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-apple-gray shadow-sm" />
                        ))}
                      </div>
                      <div className="text-center space-y-2">
                        <div className="h-4 w-32 bg-apple-gray rounded-full mx-auto" />
                        <div className="h-2 w-48 bg-apple-gray/50 rounded-full mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* WhatsApp Integration Banner */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto bg-accent rounded-[3rem] p-12 md:p-20 text-white overflow-hidden relative">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold">
                <MessageCircle className="w-4 h-4" />
                WhatsApp Integration
              </div>
              <h2 className="text-5xl font-bold leading-tight tracking-tight">Manage HR directly <br /> from WhatsApp.</h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Approve leave, view payslips, and answer employee queries without leaving your favorite chat app. Built for the way Africa works.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => window.open('https://wa.me/263772240081?text=Hi!%20I%20want%20to%20manage%20my%20HR%20via%20WhatsApp.', '_blank')}
                  className="bg-white text-accent px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all"
                >
                  Chat with Us
                </button>
                <button className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl">
                <div className="space-y-4">
                  {[
                    { sender: 'Employee', text: 'Hi, can I get my payslip for March?' },
                    { sender: 'ZivoHR AI', text: 'Sure! Here is your March payslip in PDF format.', isBot: true },
                    { sender: 'Employee', text: 'Thanks! Also, how many leave days do I have left?' }
                  ].map((msg, i) => (
                    <div key={i} className={cn(
                      "p-4 rounded-2xl max-w-[85%] text-sm font-medium",
                      msg.isBot ? "bg-white text-accent self-start" : "bg-white/20 text-white self-end ml-auto"
                    )}>
                      <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1">{msg.sender}</p>
                      {msg.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        </div>
      </section>

      {/* Resource Library & Community */}
      <div className="space-y-32 pb-32">
        <section id="library" className="px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <ResourceLibrary />
          </div>
        </section>

        <section id="community" className="px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <Community />
          </div>
        </section>
      </div>

      {/* Support & Advice */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="p-12 rounded-[2.5rem] bg-white border border-black/[0.05] space-y-6 hover:border-accent/30 transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold">Technical Challenges?</h3>
            <p className="text-gray-500">Our technical team is ready to help you with any platform-related issues or integrations.</p>
            <button 
              onClick={() => window.open('https://wa.me/263772240081?text=I%20need%20technical%20support%20with%20the%20platform.', '_blank')}
              className="text-accent font-bold flex items-center gap-2 hover:gap-3 transition-all"
            >
              Speak to Technical Team <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-12 rounded-[2.5rem] bg-white border border-black/[0.05] space-y-6 hover:border-accent/30 transition-all">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold">Need HR Advice?</h3>
            <p className="text-gray-500">Connect with our experienced HR consultants for advice on labor laws, disputes, or strategy.</p>
            <button 
              onClick={() => window.open('https://wa.me/263772240081?text=I%20need%20expert%20HR%20advice.', '_blank')}
              className="text-accent font-bold flex items-center gap-2 hover:gap-3 transition-all"
            >
              Speak to HR Team <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Hashtag Banner */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto text-center py-12 border-y border-black/[0.03]">
          <p className="text-2xl md:text-3xl font-bold text-gray-400 italic">
            #WeCombineHRExpertise + AI + simpleToolsToManageYourWorkforce
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 scroll-mt-24">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-500">Choose the plan that's right for your growing team.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                name: 'Starter (Small)', 
                price: '$30', 
                desc: 'Up to 20 employees. Perfect for small teams.', 
                features: ['Up to 20 employees', 'Core HR features', 'Payroll Included', 'Email Support'],
                excVat: true
              },
              { 
                name: 'Starter (Growth)', 
                price: '$50', 
                desc: '21+ employees. Scale your operations.', 
                features: ['21+ employees', 'Core HR features', 'Payroll Included', 'Priority Email Support'],
                excVat: true
              },
              { 
                name: 'Pro', 
                price: '$75', 
                desc: 'Advanced automation for modern teams.', 
                features: ['All Starter features', 'Performance Reviews', 'Employee Engagement', 'HR Automation'], 
                popular: true,
                excVat: true
              },
              { 
                name: 'Exec', 
                price: 'Custom', 
                desc: 'Tailor-made solution with expert advice.', 
                features: ['Unlimited employees', 'Specific HR Advice', 'Dedicated Account Manager', 'Custom Integrations'] 
              },
            ].map((plan) => (
              <div key={plan.name} className={cn(
                "p-6 rounded-[2.5rem] border flex flex-col space-y-6 transition-all hover:scale-105",
                plan.popular ? "border-accent bg-accent/5 shadow-2xl shadow-accent/10" : "border-black/[0.05] bg-white"
              )}>
                {plan.popular && <span className="px-3 py-1 bg-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-full w-fit">Most Popular</span>}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{plan.desc}</p>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-gray-400 text-xs font-medium">/month</span>}
                  </div>
                  {plan.excVat && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Exc VAT</p>}
                </div>
                <ul className="space-y-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={plan.price === 'Custom' ? () => window.open('https://wa.me/1234567890?text=I%20want%20to%20talk%20to%20sales%20about%20the%20Exec%20plan.') : onGetStarted}
                  className={cn(
                    "w-full py-3 rounded-xl font-bold transition-all text-sm",
                    plan.popular ? "btn-primary" : "btn-secondary"
                  )}
                >
                  {plan.price === 'Custom' ? 'Talk to Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Features Grid */}
      <section className="px-6 py-20 bg-apple-gray/30 rounded-[3rem] mx-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">More Powerful Tools</h2>
            <p className="text-gray-500">Everything else you need to run a modern organization.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 'automation', title: 'HR Automation', desc: 'Custom workflows for any HR process.' },
              { id: 'custom', title: 'Custom Services', desc: 'Tailor the platform to your unique needs.' },
              { id: 'chatbot', title: 'HR Chatbot', desc: 'AI-powered assistant for employee queries.' },
              { id: 'mobile', title: 'Mobile App', desc: 'Manage HR on the go with our native app.' },
              { id: 'integrations', title: 'Integrations', desc: 'Connect with Slack, Teams, and more.' },
            ].map(feature => (
              <div key={feature.id} id={feature.id} className="card-aura p-8 space-y-4 hover:bg-white transition-all scroll-mt-24">
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Credibility: Client Logos */}
      <section className="py-20 border-t border-black/[0.03] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-12">Trusted by leading African organizations</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            {[
              { name: 'EcoCash', color: 'text-blue-600' },
              { name: 'Delta', color: 'text-red-600' },
              { name: 'Old Mutual', color: 'text-green-700' },
              { name: 'CBZ Bank', color: 'text-blue-800' },
              { name: 'Simbisa', color: 'text-orange-600' }
            ].map((company) => (
              <div key={company.name} className="flex items-center gap-3 group cursor-pointer">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-all", company.color.replace('text-', 'bg-'))}>
                  {company.name[0]}
                </div>
                <span className={cn("text-xl font-bold tracking-tighter transition-colors", company.color)}>{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Credibility: Testimonials & Case Studies */}
      <section className="py-32 px-6 bg-apple-gray/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            {/* Testimonials */}
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight">Loved by HR Teams</h2>
                <p className="text-xl text-gray-500">See why companies are switching to ZivoHR.</p>
              </div>
              
              <div className="space-y-8">
                {[
                  {
                    quote: "ZivoHR has completely transformed how we manage our payroll. What used to take days now takes minutes.",
                    author: "Sarah Moyo",
                    role: "HR Manager, TechZim",
                    avatar: "https://picsum.photos/seed/sarah/100/100"
                  },
                  {
                    quote: "The WhatsApp integration is a game-changer for our field staff. They can now access their payslips instantly.",
                    author: "John Dube",
                    role: "Operations Director, AgriGrow",
                    avatar: "https://picsum.photos/seed/john/100/100"
                  }
                ].map((testimonial, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-[2rem] bg-white border border-black/[0.05] shadow-sm space-y-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 fill-accent text-accent" />)}
                    </div>
                    <p className="text-lg font-medium text-space-gray leading-relaxed italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4">
                      <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-space-gray">{testimonial.author}</p>
                        <p className="text-xs text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Case Studies */}
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight text-right">Real Results</h2>
                <p className="text-xl text-gray-500 text-right">How we help businesses scale efficiently.</p>
              </div>

              <div className="space-y-6">
                <SuccessStories />
                <div className="p-10 rounded-[3rem] bg-accent text-white space-y-6 relative overflow-hidden shadow-2xl shadow-accent/20">
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-3xl font-bold leading-tight">Ready to write your <br /> success story?</h3>
                    <p className="text-white/80 text-lg">Join 500+ companies managing their workforce with ZivoHR.</p>
                    <button onClick={handleGetStarted} className="bg-white text-accent px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl">
                      Get Started Now
                    </button>
                  </div>
                  <Sparkles className="absolute -top-4 -right-4 w-32 h-32 text-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-black/[0.03]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold">Z</div>
              <span className="text-xl font-bold tracking-tight">ZivoHR</span>
            </div>
            <p className="text-sm text-gray-400">Headquartered in Harare, Zimbabwe</p>
          </div>
          <p className="text-sm text-gray-400">© 2026 ZivoHR. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-space-gray transition-colors">Privacy</a>
            <a href="#" className="hover:text-space-gray transition-colors">Terms</a>
            <a href="#" className="hover:text-space-gray transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

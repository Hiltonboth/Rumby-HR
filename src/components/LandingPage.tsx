import React, { useState } from 'react';
import { Shield, Zap, Users, BarChart3, ChevronRight, Star, CheckCircle2, ChevronDown, CreditCard, Menu, X, MessageCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
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
    name: 'Employee Engagement', 
    id: 'engagement',
    subFeatures: ['Case Management', 'Internal Communications', 'Employee Surveys', 'Recognition'] 
  },
  { name: 'HR automation', id: 'automation' },
  { name: 'Custom services', id: 'custom' },
  { name: 'HR chatbot', id: 'chatbot' },
  { name: 'Mobile app', id: 'mobile' },
  { name: 'Integrations', id: 'integrations' },
];

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedFeature, setMobileExpandedFeature] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsFeaturesOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-space-gray overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full glass z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold">R</div>
          <span className="text-xl font-bold tracking-tight">Rumby HR</span>
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
                  <button onClick={onLogin} className="w-full p-3 text-center font-bold text-gray-600">Login</button>
                  <button onClick={onGetStarted} className="w-full btn-primary py-4">Get Started</button>
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
            Unburden your HR. <br />
            <span className="text-accent">Empower your people.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto"
          >
            The all-in-one HR platform designed for modern teams. From hiring to payroll, manage everything in one beautiful interface.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            <button onClick={onGetStarted} className="btn-primary px-8 py-4 text-lg">Start Free Trial</button>
            <button className="btn-secondary px-8 py-4 text-lg flex items-center gap-2">
              Watch Demo
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Feature Sections */}
      <div className="space-y-32 pb-32">
        {/* Hiring & Onboarding */}
        <section id="hiring" className="px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
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
              <button 
                onClick={onLogin}
                className="btn-primary px-6 py-3 flex items-center gap-2 shadow-lg shadow-accent/20"
              >
                Get Started with Hiring
                <ChevronRight className="w-4 h-4" />
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
        </section>

        {/* Core HR */}
        <section id="core" className="px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
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
              <button 
                onClick={onLogin}
                className="btn-primary px-6 py-3 flex items-center gap-2 shadow-lg shadow-accent/20"
              >
                Manage Your Team
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Performance & Development */}
        <section id="performance" className="px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
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
              <button 
                onClick={onLogin}
                className="btn-primary px-6 py-3 flex items-center gap-2 shadow-lg shadow-accent/20"
              >
                Boost Performance
                <ChevronRight className="w-4 h-4" />
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
        </section>

        {/* Payroll & Expense */}
        <section id="payroll" className="px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
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
              <button 
                onClick={onLogin}
                className="btn-primary px-6 py-3 flex items-center gap-2 shadow-lg shadow-accent/20"
              >
                Automate Payroll
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Employee Engagement */}
        <section id="engagement" className="px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
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
              <button 
                onClick={onLogin}
                className="btn-primary px-6 py-3 flex items-center gap-2 shadow-lg shadow-accent/20"
              >
                Engage Your People
                <ChevronRight className="w-4 h-4" />
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
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-500">Choose the plan that's right for your growing team.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'Starter', price: '$49', desc: 'Perfect for small teams just getting started.', features: ['Up to 10 employees', 'Core HR features', 'Basic Onboarding', 'Email Support'] },
                { name: 'Pro', price: '$149', desc: 'Advanced tools for growing organizations.', features: ['Up to 50 employees', 'Full Payroll & Expenses', 'Performance Reviews', 'Priority Support'], popular: true },
                { name: 'Enterprise', price: 'Custom', desc: 'Full-scale solution for large enterprises.', features: ['Unlimited employees', 'Custom Integrations', 'Dedicated Account Manager', '24/7 Phone Support'] },
              ].map((plan) => (
                <div key={plan.name} className={cn(
                  "p-8 rounded-[2.5rem] border flex flex-col space-y-6 transition-all hover:scale-105",
                  plan.popular ? "border-accent bg-accent/5 shadow-2xl shadow-accent/10" : "border-black/[0.05] bg-white"
                )}>
                  {plan.popular && <span className="px-3 py-1 bg-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-full w-fit">Most Popular</span>}
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-gray-500 text-sm">{plan.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-gray-400 text-sm font-medium">/month</span>}
                  </div>
                  <ul className="space-y-4 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={plan.price === 'Custom' ? () => window.open('https://wa.me/1234567890?text=I%20want%20to%20talk%20to%20sales%20about%20the%20Enterprise%20plan.') : onGetStarted}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold transition-all",
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
      </div>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-black/[0.03]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold">R</div>
              <span className="text-xl font-bold tracking-tight">Rumby HR</span>
            </div>
            <p className="text-sm text-gray-400">Headquartered in Harare, Zimbabwe</p>
          </div>
          <p className="text-sm text-gray-400">© 2026 Rumby HR. All rights reserved.</p>
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

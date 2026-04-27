import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Github, Chrome, AlertCircle, Building, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

import { useTheme } from './ThemeContext';
import { Logo } from './Logo';

interface LoginPageProps {
  isSignup?: boolean;
  onSuccess: () => void;
  onBackToHome: () => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0077B5">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

export default function LoginPage({ isSignup: initialIsSignup = false, onSuccess, onBackToHome }: LoginPageProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [invitedCompanyId, setInvitedCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('company_id');
    if (companyId) {
      setInvitedCompanyId(companyId);
      setIsSignup(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignup) {
        // 1. Sign up user with Supabase
        const { data: authData, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_id: invitedCompanyId,
            }
          }
        });
        
        if (signupError) throw signupError;
        
        // If email confirmation is required, authData.user will be present but session might be null.
        if (!authData.session) {
          setError('Success! Confirmation email sent.');
          return;
        }

      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
      }
      
      onSuccess();
    } catch (err: any) {
      console.error('Auth Error:', err.message);
      let message = err.message || 'An error occurred during authentication';
      
      if (err.message?.toLowerCase().includes('email not confirmed')) {
        message = 'Please check your email and confirm your address before signing in.';
      } else if (err.message?.toLowerCase().includes('confirmation_sent')) {
        message = 'Success! A confirmation email has been sent. Please verify it before logging in.';
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'linkedin_oidc') => {
    setIsLoading(true);
    setError(null);
    try {
      // Use signInWithPopup for better experience in AI Studio
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: false,
          queryParams: {
             prompt: 'select_account'
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-5" />
        <div className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${isDark ? 'opacity-20' : 'opacity-10'}`}>
           <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Back to Home */}
      <button 
        onClick={onBackToHome}
        className={`absolute top-8 left-8 flex items-center gap-2 font-bold transition-colors z-10 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-indigo-600'}`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="text-center space-y-4">
          <Logo className="w-16 h-16 mx-auto" />
          <h1 className="text-3xl font-bold tracking-tight">{isSignup ? 'Create your workspace' : 'Welcome back'}</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            {isSignup ? 'Start your 14-day free trial today.' : 'Enter your credentials to access ZivoHR.'}
          </p>
        </div>

        <div className={`p-8 space-y-6 rounded-[2.5rem] border shadow-2xl transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        className="input-aura pl-10 w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Company Name</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="text" 
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Corp"
                        className="input-aura pl-10 w-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="input-aura pl-10 w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-aura pl-10 w-full"
                />
              </div>
            </div>

            {error && (
              <div className={`p-3 border rounded-xl flex items-center gap-2 text-sm ${error.includes('Success') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className={`px-2 font-bold ${isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'}`}>Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleSocialLogin('google')} 
              disabled={isLoading}
              className={`flex items-center justify-center gap-3 py-3 rounded-2xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-md'}`}
            >
              <GoogleIcon />
              <span className="font-bold text-sm">Google</span>
            </button>
            <button 
              onClick={() => handleSocialLogin('linkedin_oidc')}
              disabled={isLoading}
              className={`flex items-center justify-center gap-3 py-3 rounded-2xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-md'}`}
            >
              <LinkedInIcon />
              <span className="font-bold text-sm">LinkedIn</span>
            </button>
          </div>
        </div>

        <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => setIsSignup(!isSignup)}
            className="text-indigo-500 font-bold hover:underline"
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

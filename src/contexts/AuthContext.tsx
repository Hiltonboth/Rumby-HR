import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session?.user ?? null);
    }).catch(err => {
      console.error("Session check failed:", err);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const handleAuthChange = async (supabaseUser: any) => {
    if (supabaseUser) {
      setUser(supabaseUser);
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Create an in-memory profile for new users so they can still see their Info 
          // while being forced to WorkspaceSetup
          const tempProfile: UserProfile = {
            uid: supabaseUser.id,
            email: supabaseUser.email || '',
            role: 'employee',
            companyId: '',
            fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User'
          };

          // Fallback for platform owner email
          if (supabaseUser.email === 'hmarumure@gmail.com') {
             tempProfile.role = 'platform_owner';
             tempProfile.companyId = 'global';
             tempProfile.fullName = 'Hudson Marumure';
          }
          
          setUserProfile(tempProfile);
          setLoading(false);
          return;
        }

        if (profile) {
          setUserProfile({
            uid: profile.id,
            email: profile.email,
            role: profile.role,
            companyId: profile.company_id,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url
          });
        }
      } catch (err) {
        console.error("Auth context error:", err);
      }
    } else {
      setUser(null);
      setUserProfile(null);
    }
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, isConfigured: configured }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

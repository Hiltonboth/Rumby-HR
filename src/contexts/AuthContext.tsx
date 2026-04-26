import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
          // Fallback for platform owner email
          if (supabaseUser.email === 'hmarumure@gmail.com') {
             const ownerProfile: UserProfile = { 
               uid: supabaseUser.id, 
               role: 'platform_owner', 
               companyId: 'global', 
               email: supabaseUser.email!, 
               fullName: 'Hudson Marumure' 
             };
             setUserProfile(ownerProfile);
             setLoading(false);
             return;
          }
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
        } else if (supabaseUser.email === 'hmarumure@gmail.com') {
           // Double check for platform owner even if profile missing
           const ownerProfile: UserProfile = { 
             uid: supabaseUser.id, 
             role: 'platform_owner', 
             companyId: 'global', 
             email: supabaseUser.email!, 
             fullName: 'Hudson Marumure' 
           };
           setUserProfile(ownerProfile);
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
    <AuthContext.Provider value={{ user, userProfile, loading, signOut }}>
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

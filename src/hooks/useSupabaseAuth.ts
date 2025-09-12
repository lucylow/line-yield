import { useState, useEffect, useCallback } from 'react';
import { AuthService, UserService, UserPreferencesService } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  walletAddress?: string;
}

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  wallet_address?: string;
  total_deposited: string;
  total_withdrawn: string;
  total_earned: string;
  current_balance: string;
  apy: string;
}

interface UserPreferences {
  notifications_enabled: boolean;
  email_notifications: boolean;
  theme: string;
  currency: string;
  language: string;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await AuthService.getCurrentUser();
        
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            displayName: currentUser.user_metadata?.display_name,
            avatarUrl: currentUser.user_metadata?.avatar_url,
            walletAddress: currentUser.user_metadata?.wallet_address,
          });

          // Load user profile
          const userProfile = await UserService.getUserProfile(currentUser.id);
          if (userProfile) {
            setProfile(userProfile);
          }

          // Load user preferences
          const userPrefs = await UserPreferencesService.getUserPreferences(currentUser.id);
          if (userPrefs) {
            setPreferences(userPrefs);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (currentUser) => {
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email || '',
          displayName: currentUser.user_metadata?.display_name,
          avatarUrl: currentUser.user_metadata?.avatar_url,
          walletAddress: currentUser.user_metadata?.wallet_address,
        });

        // Load user profile and preferences
        try {
          const [userProfile, userPrefs] = await Promise.all([
            UserService.getUserProfile(currentUser.id),
            UserPreferencesService.getUserPreferences(currentUser.id)
          ]);

          if (userProfile) setProfile(userProfile);
          if (userPrefs) setPreferences(userPrefs);
        } catch (err) {
          console.error('Error loading user data:', err);
        }
      } else {
        setUser(null);
        setProfile(null);
        setPreferences(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { user: newUser, session } = await AuthService.signUp(email, password, {
        display_name: displayName
      });

      if (newUser) {
        // Create user profile
        await UserService.createUserProfile(newUser.id, {
          id: newUser.id,
          email: newUser.email || '',
          display_name: displayName,
          avatar_url: newUser.user_metadata?.avatar_url,
          wallet_address: newUser.user_metadata?.wallet_address,
          total_deposited: '0',
          total_withdrawn: '0',
          total_earned: '0',
          current_balance: '0',
          apy: '0.085'
        });

        // Create default preferences
        await UserPreferencesService.updateUserPreferences(newUser.id, {
          user_id: newUser.id,
          notifications_enabled: true,
          email_notifications: true,
          theme: 'auto',
          currency: 'USD',
          language: 'en'
        });

        toast({
          title: "Account Created",
          description: "Welcome to LINE Yield! Please check your email to verify your account.",
        });

        return { user: newUser, session };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { user: signedInUser, session } = await AuthService.signIn(email, password);

      toast({
        title: "Welcome Back!",
        description: "Successfully signed in to your account.",
      });

      return { user: signedInUser, session };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await AuthService.signInWithGoogle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMessage);
      toast({
        title: "Google Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await AuthService.signOut();
      setUser(null);
      setProfile(null);
      setPreferences(null);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      toast({
        title: "Sign Out Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      await AuthService.resetPassword(email);
      
      toast({
        title: "Password Reset Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset';
      setError(errorMessage);
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updatedProfile = await UserService.updateUserProfile(user.id, updates);
      setProfile(updatedProfile);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast({
        title: "Profile Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [user, toast]);

  // Update user preferences
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const updatedPrefs = await UserPreferencesService.updateUserPreferences(user.id, updates);
      setPreferences(updatedPrefs);
      
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been successfully updated.",
      });

      return updatedPrefs;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      toast({
        title: "Preferences Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [user, toast]);

  // Link wallet address
  const linkWallet = useCallback(async (walletAddress: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await updateProfile({ wallet_address: walletAddress });
      
      toast({
        title: "Wallet Linked",
        description: `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} has been linked to your account.`,
      });
    } catch (err) {
      throw err;
    }
  }, [user, updateProfile, toast]);

  return {
    user,
    profile,
    preferences,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    updatePreferences,
    linkWallet,
    isAuthenticated: !!user,
  };
};

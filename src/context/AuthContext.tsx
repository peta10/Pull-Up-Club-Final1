import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Provider, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase, isDevelopment, getRedirectUrl } from "../lib/supabase.ts";
import { createCheckoutSession, getActiveSubscription } from "../lib/stripe.ts";

interface User {
  id: string;
  email: string;
  role?: "user" | "admin";
}

interface ProfileSettings {
  user_settings: any;
  notification_preferences: {
    email_notifications: boolean;
    workout_reminders: boolean;
    subscription_reminders: boolean;
    achievement_notifications: boolean;
    leaderboard_updates: boolean;
  };
  theme_preferences: {
    theme: 'light' | 'dark';
    color_scheme: string;
    font_size: string;
  };
  privacy_settings: {
    show_profile: boolean;
    show_stats: boolean;
    show_achievements: boolean;
    show_activity: boolean;
  };
}

interface Profile extends ProfileSettings {
  isProfileCompleted: boolean;
  socialMedia: string | null;
  streetAddress: string | null;
  apartment: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  isFirstLogin: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  updateProfileSettings: (settingType: keyof ProfileSettings, newValues: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  signIn: async () => {},
  signUp: async () => {},
  signInWithProvider: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  isFirstLogin: false,
  isLoading: true,
  isAdmin: false,
  updateProfileSettings: async () => {},
});

const defaultSettings: ProfileSettings = {
  user_settings: {},
  notification_preferences: {
    email_notifications: true,
    workout_reminders: true,
    subscription_reminders: true,
    achievement_notifications: true,
    leaderboard_updates: true
  },
  theme_preferences: {
    theme: 'light',
    color_scheme: 'default',
    font_size: 'medium'
  },
  privacy_settings: {
    show_profile: true,
    show_stats: true,
    show_achievements: true,
    show_activity: true
  }
};

// Track subscription state explicitly so unpaid users don't get stuck on a spinner
type SubscriptionState = 'loading' | 'active' | 'unpaid';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>('loading');
  const navigate = useNavigate();
  const location = useLocation();

  const handlePostAuthSubscription = async (
    authedUser: User,
    plan: "monthly" | "annual"
  ) => {
    if (!authedUser || !plan) {
      console.log(
        "[AuthContext] handlePostAuthSubscription: Missing user or plan."
      );
      return;
    }
    setIsLoading(true);
    try {
      // Store pending subscription in database instead of localStorage
      const { error: pendingError } = await supabase.rpc('handle_pending_subscription', {
        user_id: authedUser.id,
        plan_data: { plan, timestamp: new Date().toISOString() }
      });

      if (pendingError) throw pendingError;

      console.log(
        `[AuthContext] User ${authedUser.email} proceeding to ${plan} subscription.`
      );
      const checkoutUrl = await createCheckoutSession(plan, authedUser.email, {
        userId: authedUser.id,
      });
      console.log("[AuthContext] Checkout URL received:", checkoutUrl);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        console.error("[AuthContext] Checkout URL is null or undefined.");
        navigate("/subscribe?error=checkout_url_missing");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[AuthContext] Post-auth subscription error:", error);
      navigate("/subscribe?error=checkout_failed");
      setIsLoading(false);
    }
  };

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      console.log("[AuthContext] Fetching profile for user:", userId, "retry:", retryCount);
      
      // First check if user has admin role
      const { data: adminData, error: adminError } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', userId);

      const isUserAdmin = !adminError && adminData && adminData.length > 0;
      console.log("[AuthContext] Admin check result:", { isUserAdmin, adminData, adminError });
      
      setIsAdmin(isUserAdmin);

      // Then fetch the full profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        if (profileError.code === "PGRST116") {
          console.log("[AuthContext] Profile not found, this might be a new user. Creating fallback profile.");
          
          if (retryCount < 3) {
            console.log("[AuthContext] Retrying profile fetch in", (retryCount + 1) * 1000, "ms");
            setTimeout(() => fetchProfile(userId, retryCount + 1), (retryCount + 1) * 1000);
            return;
          }
          
          // After retries, create a fallback profile object
          console.log("[AuthContext] Creating fallback profile after retries");
          const fallbackProfile: Profile = {
            isProfileCompleted: false,
            socialMedia: null,
            streetAddress: null,
            apartment: null,
            city: null,
            state: null,
            zipCode: null,
            country: null,
            role: (isUserAdmin ? "admin" : "user") as "user" | "admin",
            ...defaultSettings
          };
          
          console.log("[AuthContext] Setting fallback profile:", fallbackProfile);
          setProfile(fallbackProfile);
          setIsFirstLogin(true);
          
          // ✅ CRITICAL FIX: Clear loading state after setting fallback profile
          console.log("[AuthContext] Clearing loading state after fallback profile");
          setIsLoading(false);
          return;
        }
        console.error("Error fetching profile:", profileError);
        // ✅ CRITICAL FIX: Clear loading state on error
        setIsLoading(false);
        return;
      }

      console.log("[AuthContext] Profile data received:", profileData);

      const profileObject: Profile = {
        isProfileCompleted: profileData.is_profile_completed || false,
        socialMedia: profileData.social_media,
        streetAddress: profileData.street_address,
        apartment: profileData.apartment,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zip_code,
        country: profileData.country,
        role: (isUserAdmin ? "admin" : "user") as "user" | "admin",
        user_settings: profileData.user_settings || defaultSettings.user_settings,
        notification_preferences: profileData.notification_preferences || defaultSettings.notification_preferences,
        theme_preferences: profileData.theme_preferences || defaultSettings.theme_preferences,
        privacy_settings: profileData.privacy_settings || defaultSettings.privacy_settings
      };

      console.log("[AuthContext] Setting profile object:", profileObject);
      setProfile(profileObject);
      setIsFirstLogin(!profileData.is_profile_completed);

      // ✅ CRITICAL FIX: Clear loading state after successful profile fetch
      console.log("[AuthContext] Profile fetch completed successfully, clearing loading state");
      setIsLoading(false);

      if (user) {
        const updatedUser: User = {
          ...user,
          role: isUserAdmin ? "admin" : "user"
        };
        console.log("[AuthContext] Updating user with role:", updatedUser);
        setUser(updatedUser);
      }
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      // ✅ CRITICAL FIX: Clear loading state on exception
      setIsLoading(false);
    }
  };

  const processPendingSubscription = async (currentUser: User) => {
    console.log(
      "[AuthContext] processPendingSubscription called for user:",
      currentUser.email
    );
    
    try {
      // Get pending subscription from database instead of localStorage
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('pending_subscription_plan')
        .eq('id', currentUser.id)
        .single();

      if (profileError) throw profileError;

      const pendingPlan = profileData?.pending_subscription_plan?.plan as "monthly" | "annual" | null;
      
      if (pendingPlan) {
        // Clear pending subscription from database
        await supabase.rpc('clear_pending_subscription', {
          user_id: currentUser.id
        });
        
        await handlePostAuthSubscription(currentUser, pendingPlan);
      } else {
        console.log("[AuthContext] No pending plan in database. Checking location.state for fallback.");
        const routeState = location.state as {
          intendedAction?: string;
          plan?: "monthly" | "annual";
        } | null;

        if (routeState?.intendedAction === "subscribe" && routeState.plan) {
          await handlePostAuthSubscription(currentUser, routeState.plan);
          navigate(location.pathname, { replace: true, state: {} });
        } else {
          const isAuthRoute = location.pathname === "/login" || location.pathname === "/create-account";
          if (isAuthRoute) {
            navigate("/profile", { replace: true });
          }
        }
      }
    } catch (error) {
      console.error("[AuthContext] Error processing pending subscription:", error);
    }
  };

  const updateProfileSettings = async (settingType: keyof ProfileSettings, newValues: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('update_profile_settings', {
        setting_type: settingType,
        new_values: newValues
      });

      if (error) throw error;

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          [settingType]: { ...profile[settingType], ...newValues }
        });
      }

      return data;
    } catch (error) {
      console.error(`Error updating ${settingType}:`, error);
      throw error;
    }
  };

  const handleAuthError = async (error: any) => {
    console.error('[AuthContext] Auth error:', error);
    
    if (error.message.includes('Invalid Refresh Token')) {
      // Clear invalid session
      await supabase.auth.signOut();
      
      // Clear local storage
      localStorage.clear();
      
      // Redirect to login
      navigate('/login');
    }
  };

  const recoverSession = async () => {
    try {
      // First try to get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (session) {
        console.log('[AuthContext] Active session found:', session.user.email);
        return session;
      }
      
      // If no session, don't try to refresh as it will cause an AuthSessionMissingError
      console.log('[AuthContext] No active session found, skipping refresh attempt');
      return null;
    } catch (error) {
      console.error('[AuthContext] Session recovery failed:', error);
      // Clear any potentially corrupted session data
      await supabase.auth.signOut();
      localStorage.clear();
      return null;
    }
  };

  const checkSessionPersistence = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('[AuthContext] No active session found');
        return false;
      }

      // Verify session expiry
      if (new Date(session.expires_at!) < new Date()) {
        console.log('[AuthContext] Session expired, attempting refresh...');
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        return !!refreshedSession;
      }

      return true;
    } catch (error) {
      console.error('[AuthContext] Error checking session persistence:', error);
      return false;
    }
  };

  /**
   * Determine whether the current user has an active Stripe subscription.
   * Treat any failure or missing subscription as "unpaid" so the UI can continue.
   */
  const evaluateSubscription = async () => {
    try {
      const sub = await getActiveSubscription();
      const isActive = !!sub && (sub as any)?.status === 'active';
      setSubscriptionState(isActive ? 'active' : 'unpaid');
      return isActive ? 'active' : 'unpaid';
    } catch (err) {
      console.warn('[AuthContext] Subscription lookup failed, assuming unpaid:', err);
      setSubscriptionState('unpaid');
      return 'unpaid';
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log("[AuthContext] initAuth started.");
      setIsLoading(true);
      try {
        // First try to recover any existing session
        const recoveredSession = await recoverSession();
        
        if (recoveredSession?.user) {
          console.log("[AuthContext] Recovered session for user:", recoveredSession.user.email);
          const currentUser = {
            id: recoveredSession.user.id,
            email: recoveredSession.user.email!,
          };
          setUser(currentUser);
          await fetchProfile(recoveredSession.user.id);
          await processPendingSubscription(currentUser);

          const initialSubState = await evaluateSubscription();
          if (initialSubState === 'unpaid' && location.pathname !== '/subscribe') {
            navigate('/subscribe', { replace: true });
          }
        } else {
          console.log("[AuthContext] No active session to recover.");
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, session: Session | null) => {
            console.log(
              `[AuthContext] onAuthStateChange event: ${event}, User: ${session?.user?.email}`,
            );

            // Ignore INITIAL_SESSION if we've already finished the first recovery to avoid double loading flicker
            if (event === 'INITIAL_SESSION' && !isLoading) return;

            setIsLoading(true);

            try {
              if (session?.user) {
                const currentUserFromSession = {
                  id: session.user.id,
                  email: session.user.email!,
                };
                setUser(currentUserFromSession);
                await fetchProfile(session.user.id);

                // Always evaluate subscription so we can render pricing if needed
                const subState = await evaluateSubscription();

                // After profile fetch, handle admin redirect
                if (isAdmin) {
                  if (event === 'SIGNED_IN') navigate('/admin-dashboard');
                }

                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('is_profile_completed')
                  .eq('id', session.user.id)
                  .single();

                const isProfileActuallyCompleted = profileData?.is_profile_completed ?? false;

                if (event === 'SIGNED_IN') {
                  if (!isProfileActuallyCompleted) {
                    localStorage.removeItem('pendingSubscriptionPlan');
                    navigate('/subscribe', { replace: true });
                  } else {
                    await processPendingSubscription(currentUserFromSession);
                    // If profile is complete but subscription unpaid, redirect
                    if (subState === 'unpaid' && location.pathname !== '/subscribe') {
                      navigate('/subscribe', { replace: true });
                    }
                  }
                }
              } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                setIsFirstLogin(false);
                setIsAdmin(false);
                localStorage.removeItem('pendingSubscriptionPlan');
              } else {
                if (!session?.user) {
                  setUser(null);
                  setProfile(null);
                  setIsFirstLogin(false);
                  setIsAdmin(false);
                }
              }
            } catch (err) {
              console.error('[AuthContext] Error inside onAuthStateChange:', err);
            } finally {
              setIsLoading(false);
              if (subscriptionState === 'loading') {
                setSubscriptionState('unpaid');
              }
            }
          },
        );

        // Verify session persistence
        const hasPersistedSession = await checkSessionPersistence();
        if (!hasPersistedSession) {
          console.log('[AuthContext] No valid persisted session found');
        }

        return () => {
          console.log("[AuthContext] Unsubscribing from onAuthStateChange.");
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("[AuthContext] Error in initAuth:", error);
        await handleAuthError(error);
      } finally {
        console.log("[AuthContext] initAuth finished.");
        setIsLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("[AuthContext] signIn called for:", email);
    if (isDevelopment && email === "dev@example.com" && password === "dev123") {
      const devUser = { id: "dev-user-id", email: "dev@example.com" };
      setUser(devUser);
      setProfile({
        isProfileCompleted: false,
        socialMedia: null,
        streetAddress: null,
        apartment: null,
        city: null,
        state: null,
        zipCode: null,
        country: null,
        role: "user" as "user" | "admin",
        ...defaultSettings
      });
      setIsFirstLogin(true);
      console.log("[AuthContext] Dev signIn, processing pending subscription.");
      await processPendingSubscription(devUser);
      return;
    }
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("[AuthContext] Supabase signIn error:", error);
      throw error;
    }
    console.log("[AuthContext] Supabase signIn successful. Session:", session);
  };

  const ensureProfileExists = async (userId: string, email: string): Promise<boolean> => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (existingProfile) {
        return true; // Profile exists
      }

      // Create profile if it doesn't exist
      console.log("[AuthContext] Creating missing profile for user:", userId);
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: email,
          role: 'user',
          is_paid: false,
          is_profile_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("[AuthContext] Error creating profile:", insertError);
        return false;
      }

      console.log("[AuthContext] Profile created successfully for user:", userId);
      return true;
    } catch (error) {
      console.error("[AuthContext] Error in ensureProfileExists:", error);
      return false;
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log("[AuthContext] signUp called for:", email);
    if (isDevelopment && email === "dev@example.com" && password === "dev123") {
      const devUser = { id: "dev-user-id", email: "dev@example.com" };
      setUser(devUser);
      setProfile({
        isProfileCompleted: false,
        socialMedia: null,
        streetAddress: null,
        apartment: null,
        city: null,
        state: null,
        zipCode: null,
        country: null,
        role: "user" as "user" | "admin",
        ...defaultSettings
      });
      setIsFirstLogin(true);
      console.log("[AuthContext] Dev signUp, processing pending subscription.");
      await processPendingSubscription(devUser);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getRedirectUrl()}profile`,
      },
    });

    if (error) {
      console.error("[AuthContext] Supabase signUp error:", error);
      throw error;
    }
    console.log(
      "[AuthContext] Supabase signUp call successful. User data from signUp:",
      data?.user
    );

    if (data?.user) {
      console.log(
        "[AuthContext] User object present in signUp response. Attempting to set user and process subscription."
      );
      const newUser = { id: data.user.id, email: data.user.email! };
      setUser(newUser);
      
      // Ensure profile exists before proceeding
      await ensureProfileExists(newUser.id, newUser.email);
      await fetchProfile(newUser.id);
      setIsFirstLogin(true);
      await processPendingSubscription(newUser);
    } else {
      console.warn(
        "[AuthContext] No user object in signUp response, relying on onAuthStateChange."
      );
      setIsFirstLogin(true);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getRedirectUrl()}profile`,
      },
    });

    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getRedirectUrl()}reset-password`,
    });

    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsFirstLogin(false);
    navigate("/"); // Redirect to home page after sign out
  };

  if (isLoading || subscriptionState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9b9b6f]"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        signIn,
        signUp,
        signInWithProvider,
        signOut,
        resetPassword,
        updatePassword,
        isFirstLogin,
        isLoading,
        isAdmin,
        updateProfileSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
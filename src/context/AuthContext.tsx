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
  region: string;
  role: "user" | "admin";
  fullName?: string;
  age?: number;
  gender?: string;
  organization?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
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
  setProfile: () => {},
  signIn: async () => {},
  signUp: async () => {},
  signInWithProvider: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  isFirstLogin: false,
  isLoading: false,
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

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>('active');
  const [hasInitialized, setHasInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Safety net: Force clear loading after 10 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("[AuthContext] Forcing loading to false after timeout");
        setIsLoading(false);
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

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

      console.log("[AuthContext] Raw profile data from DB:", profileData);
      if (profileData) {
        console.log("[AuthContext] Social media from DB:", profileData.social_media);
      }

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
            region: '',
            role: (isUserAdmin ? "admin" : "user") as "user" | "admin",
            fullName: '',
            age: 0,
            gender: '',
            organization: '',
            phone: '',
            ...defaultSettings
          };
          
          console.log("[AuthContext] Setting fallback profile:", fallbackProfile);
          setProfile(fallbackProfile);
          setIsFirstLogin(true);
          
          console.log("[AuthContext] Setting fallback profile");
          return;
        }
        console.error("Error fetching profile:", profileError);
        return;
      }

      console.log("[AuthContext] Profile data received:", profileData);

      const profileObject: Profile = {
        isProfileCompleted: profileData.is_profile_completed || false,
        socialMedia: profileData.social_media,
        region: profileData.region || '',
        role: (isUserAdmin ? "admin" : "user") as "user" | "admin",
        fullName: profileData.full_name,
        age: profileData.age,
        gender: profileData.gender,
        organization: profileData.organization,
        phone: profileData.phone,
        user_settings: profileData.user_settings || defaultSettings.user_settings,
        notification_preferences: profileData.notification_preferences || defaultSettings.notification_preferences,
        theme_preferences: profileData.theme_preferences || defaultSettings.theme_preferences,
        privacy_settings: profileData.privacy_settings || defaultSettings.privacy_settings
      };

      console.log("[AuthContext] Setting profile object:", profileObject);
      setProfile(profileObject);
      setIsFirstLogin(!profileData.is_profile_completed);

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
      const { error } = await supabase
        .from('profiles')
        .update({ [settingType]: newValues, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
      if (profile) {
        setProfile({
          ...profile,
          [settingType]: { ...profile[settingType], ...newValues }
        });
      }
    } catch (error) {
      console.error(`Error updating ${settingType}:`, error);
      throw error;
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
    if (hasInitialized) {
      console.log("[AuthContext] Already initialized, skipping");
      return;
    }
    setHasInitialized(true);

    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      console.log("[AuthContext] initAuth started.");
      try {
        // Set up auth state change listener FIRST
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, session: Session | null) => {
            console.log(
              `[AuthContext] onAuthStateChange event: ${event}, User: ${session?.user?.email}`,
            );
            if (event === 'SIGNED_IN' && session?.user) {
              const currentUser = {
                id: session.user.id,
                email: session.user.email!,
              };
              setUser(currentUser);
              await fetchProfile(session.user.id);
              await evaluateSubscription();
              await processPendingSubscription(currentUser);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setProfile(null);
              setIsFirstLogin(false);
              setIsAdmin(false);
            }
            // Ignore other events (INITIAL_SESSION, TOKEN_REFRESHED, etc.)
          }
        );
        subscription = sub;

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const currentUser = {
            id: session.user.id,
            email: session.user.email!,
          };
          setUser(currentUser);
          await fetchProfile(session.user.id);
          await evaluateSubscription();
          // Do not process pending subscription here, only on SIGNED_IN
        }
      } catch (error) {
        console.error("[AuthContext] Error in initAuth:", error);
      }
    };

    initAuth();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [hasInitialized]);

  const signIn = async (email: string, password: string) => {
    console.log("[AuthContext] signIn called for:", email);
    if (isDevelopment && email === "dev@example.com" && password === "dev123") {
      const devUser = { id: "dev-user-id", email: "dev@example.com" };
      setUser(devUser);
      setProfile({
        isProfileCompleted: false,
        socialMedia: null,
        region: '',
        role: "user" as "user" | "admin",
        fullName: '',
        age: 0,
        gender: '',
        organization: '',
        phone: '',
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
    // Immediately update user and fetch profile after successful sign in
    if (session?.user) {
      setUser({ id: session.user.id, email: session.user.email! });
      await fetchProfile(session.user.id);
    }
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
        region: '',
        role: "user" as "user" | "admin",
        fullName: '',
        age: 0,
        gender: '',
        organization: '',
        phone: '',
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

  // Debug log to see what is blocking render
  console.log('AuthProvider render:', { isLoading, subscriptionState, user, profile });

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        setProfile,
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

export { AuthProvider };

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
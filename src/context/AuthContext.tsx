import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Provider, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase, isDevelopment } from "../lib/supabase.ts";
import { createCheckoutSession } from "../lib/stripe.ts";

interface User {
  id: string;
  email: string;
  role?: "user" | "admin";
}

interface Profile {
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
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
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
        navigate("/subscription?error=checkout_url_missing");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[AuthContext] Post-auth subscription error:", error);
      navigate("/subscription?error=checkout_failed");
      setIsLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No profile found
          setIsFirstLogin(true);
          setTimeout(async () => {
            const { data: retryData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .single();

            if (retryData) {
              setProfile({
                isProfileCompleted: false,
                socialMedia: null,
                streetAddress: null,
                apartment: null,
                city: null,
                state: null,
                zipCode: null,
                country: null,
                role: "user",
              });
            }
          }, 1500);
          return;
        }
        console.error("Error fetching profile:", error);
        return;
      }

      // Check if user is admin
      const { data: adminData } = await supabase
        .from("admin_roles")
        .select("user_id")
        .eq("user_id", userId)
        .single();

      const isUserAdmin = !!adminData;
      setIsAdmin(isUserAdmin);

      setProfile({
        isProfileCompleted: profileData.is_profile_completed || false,
        socialMedia: profileData.social_media,
        streetAddress: profileData.street_address,
        apartment: profileData.apartment,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zip_code,
        country: profileData.country,
        role: isUserAdmin ? "admin" : "user",
      });
      setIsFirstLogin(!profileData.is_profile_completed);

      // Update user object with role
      if (user) {
        setUser({ ...user, role: isUserAdmin ? "admin" : "user" });
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
    const pendingPlan = localStorage.getItem("pendingSubscriptionPlan") as
      | "monthly"
      | "annual"
      | null;
    console.log("[AuthContext] Pending plan from localStorage:", pendingPlan);

    if (pendingPlan) {
      localStorage.removeItem("pendingSubscriptionPlan");
      await handlePostAuthSubscription(currentUser, pendingPlan);
    } else {
      console.log(
        "[AuthContext] No pending plan in localStorage. Checking location.state for fallback."
      );
      const routeState = location.state as {
        intendedAction?: string;
        plan?: "monthly" | "annual";
      } | null;
      console.log("[AuthContext] Location state for fallback:", routeState);
      if (routeState?.intendedAction === "subscribe" && routeState.plan) {
        console.log(
          "[AuthContext] Found pending plan in location.state (fallback):",
          routeState.plan
        );
        await handlePostAuthSubscription(currentUser, routeState.plan);
        navigate(location.pathname, { replace: true, state: {} });
      } else {
        console.log(
          "[AuthContext] No pending subscription found in localStorage or location.state for fallback."
        );
        // Don't automatically redirect to profile page unless we're in the login flow
        // This allows the home page to be viewed without login
        const isAuthRoute =
          location.pathname === "/login" ||
          location.pathname === "/create-account";
        if (isAuthRoute) {
          navigate("/profile", { replace: true });
        }
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log("[AuthContext] initAuth started.");
      setIsLoading(true);
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        console.log(
          "[AuthContext] getSession result - Session:",
          session,
          "Error:",
          sessionError
        );

        if (session?.user) {
          console.log(
            "[AuthContext] User session found on init:",
            session.user.email
          );
          const currentUser = {
            id: session.user.id,
            email: session.user.email!,
          };
          setUser(currentUser);
          await fetchProfile(session.user.id);
          await processPendingSubscription(currentUser);
        } else {
          console.log("[AuthContext] No active session on init.");
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
          console.log(
            `[AuthContext] onAuthStateChange event: ${event}, User: ${session?.user?.email}, Session:`,
            session
          );
          setIsLoading(true);

          if (session?.user) {
            const currentUserFromSession = {
              id: session.user.id,
              email: session.user.email!,
            };
            setUser(currentUserFromSession);
            await fetchProfile(session.user.id);

            if (isAdmin) {
              console.log("[AuthContext] Admin user detected. Navigating to /admin-dashboard.");
              navigate("/admin-dashboard", { replace: true });
              setIsLoading(false);
              return;
            }

            const { data: profileData } = await supabase
              .from("profiles")
              .select("is_profile_completed")
              .eq("id", session.user.id)
              .single();

            const isProfileActuallyCompleted = profileData?.is_profile_completed || false;
            console.log("[AuthContext] Profile data for non-admin:", profileData);
            console.log(
              "[AuthContext] isProfileActuallyCompleted for non-admin:",
              isProfileActuallyCompleted
            );

            if (event === "SIGNED_IN") {
              console.log(
                "[AuthContext] SIGNED_IN event processing for non-admin. isProfileActuallyCompleted:",
                isProfileActuallyCompleted
              );
              if (!isProfileActuallyCompleted) {
                console.log(
                  "[AuthContext] New non-admin user (profile not completed) signed in, redirecting to /subscription."
                );
                localStorage.removeItem("pendingSubscriptionPlan");
                navigate("/subscription", { replace: true });
              } else {
                console.log(
                  "[AuthContext] Existing non-admin user (profile completed) signed in. Processing pending subscription."
                );
                await processPendingSubscription(currentUserFromSession);
              }
            }
          } else if (event === "SIGNED_OUT") {
            console.log("[AuthContext] SIGNED_OUT event. Clearing user data.");
            setUser(null);
            setProfile(null);
            setIsFirstLogin(false);
            setIsAdmin(false);
            localStorage.removeItem("pendingSubscriptionPlan");
          } else {
            console.log(
              `[AuthContext] Auth event ${event} without a new user session or unhandled event.`
            );
            if (!session?.user) {
              setUser(null);
              setProfile(null);
              setIsFirstLogin(false);
              setIsAdmin(false);
            }
          }
          setIsLoading(false);
        });

        return () => {
          console.log("[AuthContext] Unsubscribing from onAuthStateChange.");
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("[AuthContext] Error initializing auth:", error);
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
        role: "user",
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
        role: "user",
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
        emailRedirectTo: `${window.location.origin}/profile`,
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
        redirectTo: `${window.location.origin}/profile`,
      },
    });

    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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

  if (isLoading) {
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

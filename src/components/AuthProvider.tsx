import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";
import { UserRole } from "../types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  profile: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Initial Session Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for Auth Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        fetchProfile(session.user.id);
      } else {
        setRole(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Fetch Role from Database & Subscribe to Realtime Changes
  const fetchProfile = async (userId: string) => {
    try {
      // Priorizamos siempre la tabla perfiles_usuario que es la estándar del SASE
      const { data, error } = await supabase
        .from("perfiles_usuario")
        .select("*")
        .eq("id", userId)
        .single();

      let userData: any = data;

      if (error || !data) {
        // Fallback a profiles por si hay usuarios antiguos
        const { data: legacyData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        userData = legacyData;
      }

      if (!userData) {
        console.warn("Profile not found or error, denying access.");
        setRole(null);
        setProfile(null);
      } else {
        const dbRole = (userData.rol || userData.role) as UserRole;
        if (Object.values(UserRole).includes(dbRole)) {
          setRole(dbRole);
          setProfile(userData);
        } else {
          console.warn(`Unknown role "${dbRole}" in DB, denying access.`);
          setRole(null);
          setProfile(null);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      setRole(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    // For now, we rely on Supabase UI or other login components calling supabase.auth.signInWith...
    // This function can be expanded or removed if we handle login in a separate component.
    // Making it a no-op placeholder or redirect could work here.
    console.log("Sign in logic should be triggered via UI");
  };

  const signOut = async () => {
    try {
      await supabase.rpc("log_event" as any, {
        p_module: "AUTH",
        p_action: "LOGOUT",
        p_result: "SUCCESS",
        p_details: { email: user?.email },
      });
    } catch (err) {
      console.warn("Logout event logging failed:", err);
    }
    await supabase.auth.signOut();
    setRole(null);
    setUser(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) {
      setLoading(true);
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        session, 
        role, 
        profile, 
        loading, 
        signIn, 
        signOut, 
        refreshProfile 
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

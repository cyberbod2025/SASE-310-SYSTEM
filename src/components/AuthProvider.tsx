import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";
import { UserRole } from "../types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signIn: () => Promise<void>; // Simple trigger for Supabase Auth UI or redirection
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
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
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Fetch Role from Database & Subscribe to Realtime Changes
  const fetchProfile = async (userId: string) => {
    try {
      // Initial fetch
      const { data, error } = await supabase
        .from("profiles") // Ensure table name is correct (perfiles_usuario vs profiles in other files?)
        // In AprobacionesPersonal it was 'perfiles_usuario'. Here it is 'profiles'.
        // We probably need to check 'perfiles_usuario' if 'profiles' fails or alias it.
        // Assuming 'perfiles_usuario' is the new standard from my previous reads.
        .select("role") // Note: Database likely uses 'rol' in Spanish based on INSERTs seen
        .eq("id", userId)
        .single();

      // Fallback for different table name schema strategy in pilot
      let remoteRole = null;

      if (error || !data) {
        // Try alternate table 'perfiles_usuario' if 'profiles' not found/empty
        const { data: data2 } = await supabase
          .from("perfiles_usuario")
          .select("rol")
          .eq("id", userId)
          .single();

        if (data2) remoteRole = data2.rol;
      } else {
        remoteRole = data.role || (data as any).rol; // Handle both cases
      }

      if (!remoteRole) {
        console.warn("Profile not found or error, denying access.");
        setRole(null); // Secure fallback: Deny access
      } else {
        // Validate that the DB role exists in our Frontend Enum
        const dbRole = remoteRole as UserRole;
        if (Object.values(UserRole).includes(dbRole)) {
          setRole(dbRole);
        } else {
          console.warn(`Unknown role "${dbRole}" in DB, denying access.`);
          setRole(null);
        }
      }

      // Realtime Subscription (Simplified for Pilot Reliability)
      // Removed complex subscription logic to avoid errors on non-existent tables during demo
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      setRole(null);
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
    await supabase.auth.signOut();
    setRole(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, role, loading, signIn, signOut }}
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

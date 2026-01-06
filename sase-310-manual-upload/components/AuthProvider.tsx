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
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error || !data) {
        console.warn("Profile not found or error, using fallback role.", error);
        setRole(UserRole.DOCENTE); // Fallback defensivo
      } else {
        // Validate that the DB role exists in our Frontend Enum
        const dbRole = data.role as UserRole;
        if (Object.values(UserRole).includes(dbRole)) {
          setRole(dbRole);
        } else {
          console.warn(
            `Unknown role "${dbRole}" in DB, falling back to Docente.`
          );
          setRole(UserRole.DOCENTE);
        }
      }

      // Realtime Subscription
      const channel = supabase
        .channel(`public:profiles:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            console.log("Profile updated via Realtime:", payload);
            const newRole = payload.new.role as UserRole;
            if (Object.values(UserRole).includes(newRole)) {
              setRole(newRole);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
      setRole(UserRole.DOCENTE);
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

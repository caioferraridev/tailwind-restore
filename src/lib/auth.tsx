import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  company_id: string;
  full_name: string | null;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      console.log("AUTH STATE CHANGE");
      console.log(s?.user);

      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      console.log("SESSION INICIAL");
      console.log(s?.user);

      setSession(s);
      setUser(s?.user ?? null);

      if (s?.user) {
        loadProfile(s.user.id);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(uid: string) {
    console.log("================================");
    console.log("UID RECEBIDO");
    console.log(uid);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, company_id, full_name, email")
      .eq("id", uid)
      .maybeSingle();

    console.log("PROFILE ENCONTRADO");
    console.log(data);

    console.log("PROFILE ERROR");
    console.log(error);

    console.log("================================");

    setProfile(data ?? null);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { BRAND_SLUG } from "@/lib/brand";
import type { Profil } from "@/lib/types";

interface AuthState {
  user: User | null;
  session: Session | null;
  profil: Profil | null;
  loading: boolean;
  isMember: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfil(userId: string | undefined) {
    if (!userId) {
      setProfil(null);
      return;
    }
    const { data } = await supabase
      .from("profils")
      .select("*")
      .eq("id", userId)
      .eq("marque", BRAND_SLUG)
      .maybeSingle();
    setProfil((data as Profil | null) ?? null);
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      void loadProfil(s?.user?.id);
    });
    void supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfil(data.session?.user?.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    user: session?.user ?? null,
    session,
    profil,
    loading,
    isMember: profil?.statut === "valide",
    isAdmin: !!profil?.est_admin,
    refresh: async () => loadProfil(session?.user?.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

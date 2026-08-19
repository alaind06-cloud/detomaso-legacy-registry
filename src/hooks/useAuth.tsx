import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { BRAND_SLUG } from "@/lib/brand";
import type { Profil } from "@/lib/types";

export interface DemandeAcces {
  id?: number | string;
  user_id: string;
  marque: string;
  raison: string | null;
  statut: string | null;
  created_at?: string | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profil: Profil | null;
  /** Demande d'accès de l'utilisateur pour la marque de ce site. */
  demande: DemandeAcces | null;
  loading: boolean;
  isMember: boolean;
  isAdmin: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [demande, setDemande] = useState<DemandeAcces | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfil(userId: string | undefined) {
    if (!userId) {
      setProfil(null);
      setDemande(null);
      return;
    }
    // Les comptes sont partagés entre les registres du projet Supabase :
    // on ne filtre pas sur la marque (sinon un admin créé sur un autre
    // registre serait vu comme non connecté / non membre ici).
    const { data, error } = await supabase.from("profils").select("*").eq("id", userId);
    if (error) console.error("profil:", error.message);
    const rows = (data as Profil[] | null) ?? [];
    setProfil(rows.find((r) => r.marque === BRAND_SLUG) ?? rows[0] ?? null);

    // Le statut d'accès est propre à la marque du site : il vient de demandes_acces.
    const { data: dRows, error: dErr } = await supabase
      .from("demandes_acces")
      .select("*")
      .eq("user_id", userId)
      .eq("marque", BRAND_SLUG)
      .order("created_at", { ascending: false });
    if (dErr) console.error("demandes_acces:", dErr.message);
    const demandes = (dRows as DemandeAcces[] | null) ?? [];
    setDemande(demandes.find((d) => d.statut === "valide") ?? demandes[0] ?? null);
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

  const isAdmin = !!profil?.est_admin;
  const value: AuthState = {
    user: session?.user ?? null,
    session,
    profil,
    demande,
    loading,
    isMember: demande?.statut === "valide" || isAdmin,
    isAdmin,
    refresh: async () => loadProfil(session?.user?.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

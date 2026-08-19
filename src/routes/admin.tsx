import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BRAND, BRAND_SLUG } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Profil } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Administration — ${BRAND.registerName}` },
      { name: "description", content: `Gestion des demandes d'accès du registre ${BRAND.name}.` },
      { property: "og:title", content: `Administration — ${BRAND.registerName}` },
      { property: "og:description", content: `Gestion des demandes d'accès du registre ${BRAND.name}.` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

interface DemandeRow {
  id: number | string;
  user_id: string;
  marque: string;
  raison: string | null;
  statut: string | null;
  created_at: string | null;
}

function demandesQueryKey() {
  return ["admin-demandes", BRAND_SLUG] as const;
}

async function fetchDemandes() {
  const { data, error } = await supabase
    .from("demandes_acces")
    .select("*")
    .eq("marque", BRAND_SLUG)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const demandes = (data as DemandeRow[] | null) ?? [];

  const ids = [...new Set(demandes.map((d) => d.user_id))];
  let profils: Profil[] = [];
  if (ids.length) {
    const { data: pRows, error: pErr } = await supabase.from("profils").select("*").in("id", ids);
    if (pErr) throw new Error(pErr.message);
    profils = (pRows as Profil[] | null) ?? [];
  }
  const byId = new Map(profils.map((p) => [p.id, p]));
  return demandes.map((d) => ({ ...d, profil: byId.get(d.user_id) ?? null }));
}

const STATUT_LABEL: Record<string, string> = {
  valide: "Validée",
  refuse: "Refusée",
  en_attente: "En attente",
};

function AdminPage() {
  const { loading, user, isAdmin } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: demandesQueryKey(),
    queryFn: fetchDemandes,
    enabled: isAdmin,
  });

  const setStatut = useMutation({
    mutationFn: async ({ id, statut }: { id: number | string; statut: string }) => {
      const { error: e } = await supabase.from("demandes_acces").update({ statut }).eq("id", id);
      if (e) throw new Error(e.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: demandesQueryKey() }),
  });

  if (loading) {
    return <div className="mx-auto max-w-7xl px-5 py-24 text-sm text-muted-foreground">Chargement…</div>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="eyebrow">Administration</p>
          <h1 className="mt-3 font-display text-3xl">Accès réservé</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Cette page est réservée aux administrateurs du registre {BRAND.name}.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/auth"
              className="bg-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground"
            >
              Se connecter
            </Link>
            <Link to="/" className="border border-border px-6 py-3 text-xs uppercase tracking-[0.18em]">
              Retour au registre
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rows = data ?? [];
  const enAttente = rows.filter((r) => (r.statut ?? "en_attente") === "en_attente").length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Administration — {BRAND.name}</p>
          <h1 className="mt-3 font-display text-4xl">Demandes d'accès</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {rows.length} demande(s) pour ce registre · {enAttente} en attente
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center border border-border px-5 py-3 text-xs uppercase tracking-[0.14em] transition-colors hover:bg-muted/50"
        >
          ← Retour au registre
        </Link>
      </div>

      {isLoading && <p className="mt-10 text-sm text-muted-foreground">Chargement des demandes…</p>}
      {error && <p className="mt-10 text-sm text-destructive">{(error as Error).message}</p>}

      {!isLoading && !error && (
        <div className="mt-10 overflow-x-auto border border-border">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Motivation</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const statut = r.statut ?? "en_attente";
                return (
                  <tr key={String(r.id)} className="border-t border-border align-top">
                    <td className="px-4 py-4">
                      <span className="font-medium">
                        {[r.profil?.prenom, r.profil?.nom].filter(Boolean).join(" ") || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      <div>{r.profil?.email ?? "—"}</div>
                      <div>{r.profil?.telephone ?? ""}</div>
                    </td>
                    <td className="max-w-md px-4 py-4 text-muted-foreground">{r.raison ?? "—"}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="border border-border px-2 py-1 text-xs uppercase tracking-[0.14em]">
                        {STATUT_LABEL[statut] ?? statut}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={statut === "valide" || setStatut.isPending}
                          onClick={() => setStatut.mutate({ id: r.id, statut: "valide" })}
                          className="bg-primary px-3 py-2 text-xs uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-40"
                        >
                          Valider
                        </button>
                        <button
                          disabled={statut === "refuse" || setStatut.isPending}
                          onClick={() => setStatut.mutate({ id: r.id, statut: "refuse" })}
                          className="border border-border px-3 py-2 text-xs uppercase tracking-[0.14em] disabled:opacity-40"
                        >
                          Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Aucune demande pour ce registre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

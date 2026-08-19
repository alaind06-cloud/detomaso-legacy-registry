import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, CheckCircle2, Clock3, RotateCcw, UserRoundCheck, UserRoundX, X } from "lucide-react";
import { toast } from "sonner";
import { BRAND, BRAND_SLUG } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Profil } from "@/lib/types";
import { Button } from "@/components/ui/button";

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
  user_id: string;
  marque: string;
  raison: string | null;
  statut: string | null;
  created_at: string | null;
}

type DemandeAvecProfil = DemandeRow & { profil: Profil | null };
type StatutFiltre = "en_attente" | "valide" | "refuse";

const ADMIN_DECISION_PATH = "/api/public/admin-access-decision";
const LOVABLE_BACKEND_URL = "https://id-preview--561a914c-f1bd-417e-9b36-a553d17436f5.lovable.app";

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
  const [filtre, setFiltre] = useState<StatutFiltre>("en_attente");

  const { data, isLoading, error } = useQuery({
    queryKey: demandesQueryKey(),
    queryFn: fetchDemandes,
    enabled: isAdmin,
  });

  const setStatut = useMutation({
    mutationFn: async ({ userId, statut }: { userId: string; statut: string }) => {
      // `demandes_acces` a une clé primaire composite (user_id, marque) : pas de colonne `id`.
      // L'écriture passe par un endpoint serveur qui revérifie le rôle admin (service_role serveur).
      let { data: sess } = await supabase.auth.getSession();
      if (!sess.session?.access_token) {
        const refreshed = await supabase.auth.refreshSession();
        sess = refreshed.data;
      }
      const token = sess.session?.access_token;
      if (!token) throw new Error("Session expirée, reconnectez-vous.");
      const request = async (url: string) => {
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId, marque: BRAND_SLUG, statut }),
        });
        let body: { error?: string } = {};
        try {
          body = (await res.json()) as typeof body;
        } catch {
          /* réponse non JSON */
        }
        return { res, body };
      };

      let result = await request(ADMIN_DECISION_PATH);
      if (result.res.status === 500 && result.body.error === "Configuration serveur incomplète.") {
        result = await request(`${LOVABLE_BACKEND_URL}${ADMIN_DECISION_PATH}`);
      }
      if (!result.res.ok) throw new Error(result.body.error ?? `Erreur serveur (${result.res.status}).`);
    },
    onMutate: async ({ userId, statut }) => {
      await qc.cancelQueries({ queryKey: demandesQueryKey() });
      const previous = qc.getQueryData<DemandeAvecProfil[]>(demandesQueryKey());
      qc.setQueryData<DemandeAvecProfil[]>(demandesQueryKey(), (current) =>
        current?.map((row) => (row.user_id === userId ? { ...row, statut } : row)),
      );
      return { previous };
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.statut === "valide" ? "Accès validé" : "Demande refusée");
    },
    onError: (mutationError, _variables, context) => {
      if (context?.previous) qc.setQueryData(demandesQueryKey(), context.previous);
      toast.error((mutationError as Error).message);
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: demandesQueryKey() });
    },
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
  const counts: Record<StatutFiltre, number> = {
    en_attente: rows.filter((r) => (r.statut ?? "en_attente") === "en_attente").length,
    valide: rows.filter((r) => r.statut === "valide").length,
    refuse: rows.filter((r) => r.statut === "refuse").length,
  };
  const filteredRows = rows.filter((r) => (r.statut ?? "en_attente") === filtre);
  const tabs: Array<{ statut: StatutFiltre; label: string; icon: typeof Clock3 }> = [
    { statut: "en_attente", label: "En attente", icon: Clock3 },
    { statut: "valide", label: "Validés", icon: UserRoundCheck },
    { statut: "refuse", label: "Refusés", icon: UserRoundX },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Administration — {BRAND.name}</p>
          <h1 className="mt-3 font-display text-4xl">Demandes d'accès</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Gérez les accès au registre {BRAND.name} depuis une vue unique.
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
      {setStatut.error && (
        <p role="alert" className="mt-6 border-l-2 border-destructive pl-3 text-sm text-destructive">
          {(setStatut.error as Error).message}
        </p>
      )}

      {!isLoading && !error && (
        <>
          <div className="mt-10 grid grid-cols-1 border border-border sm:grid-cols-3">
            {tabs.map(({ statut, label, icon: Icon }, index) => (
              <Button
                key={statut}
                type="button"
                variant="ghost"
                onClick={() => setFiltre(statut)}
                aria-pressed={filtre === statut}
                className={`h-auto min-h-24 justify-between rounded-none px-5 py-4 text-left shadow-none ${
                  index > 0 ? "border-t border-border sm:border-l sm:border-t-0" : ""
                } ${filtre === statut ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
              >
                <span>
                  <span className="block text-xs uppercase tracking-[0.14em] opacity-70">{label}</span>
                  <span className="mt-1 block font-display text-3xl">{counts[statut]}</span>
                </span>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </Button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">{tabs.find((tab) => tab.statut === filtre)?.label}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{filteredRows.length} compte(s)</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void qc.invalidateQueries({ queryKey: demandesQueryKey() })}
              disabled={setStatut.isPending}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Actualiser
            </Button>
          </div>

        <div className="mt-4 overflow-x-auto border border-border">
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
              {filteredRows.map((r) => {
                const statut = r.statut ?? "en_attente";
                const isCurrent = setStatut.isPending && setStatut.variables?.userId === r.user_id;
                return (
                  <tr key={r.user_id} className="border-t border-border align-top">
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
                      <span className="inline-flex items-center gap-1.5 border border-border px-2 py-1 text-xs uppercase tracking-[0.14em]">
                        {statut === "valide" ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                        {STATUT_LABEL[statut] ?? statut}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={statut === "valide" || isCurrent}
                          onClick={() => setStatut.mutate({ userId: r.user_id, statut: "valide" })}
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                          {isCurrent && setStatut.variables?.statut === "valide" ? "Validation…" : "Valider"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={statut === "refuse" || isCurrent}
                          onClick={() => setStatut.mutate({ userId: r.user_id, statut: "refuse" })}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                          {isCurrent && setStatut.variables?.statut === "refuse" ? "Refus…" : "Refuser"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Aucun compte dans cette catégorie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/integrations/supabase/client";

/**
 * Validation / refus d'une demande d'accès, côté serveur.
 *
 * Pourquoi un endpoint HTTP (et pas `createServerFn`) : le RPC des server
 * functions n'est pas joignable sur la cible de déploiement de ce projet
 * (« Server not ready »). Ici la table `demandes_acces` a une clé primaire
 * composite (user_id, marque) — il n'existe pas de colonne `id`.
 *
 * Sécurité : le prefixe /api/public/* contourne l'auth du site, donc le
 * handler vérifie lui-même le jeton Bearer de l'appelant puis son flag
 * `profils.est_admin`. La clé service_role reste strictement serveur.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MARQUE = /^[a-z0-9-]{2,40}$/;
const STATUTS = new Set(["valide", "refuse", "en_attente"]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/admin-access-decision")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: Record<string, unknown>;
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ error: "Requête invalide." }, 400);
        }

        const str = (k: string) => (typeof payload[k] === "string" ? (payload[k] as string) : "");
        const userId = str("userId").trim();
        const marque = str("marque").trim();
        const statut = str("statut").trim();

        if (!UUID.test(userId)) return json({ error: "Identifiant utilisateur invalide." }, 400);
        if (!MARQUE.test(marque)) return json({ error: "Marque invalide." }, 400);
        if (!STATUTS.has(statut)) return json({ error: "Statut invalide." }, 400);

        const serviceKey =
          process.env["SHARED_SUPABASE_SERVICE_ROLE_KEY"] ??
          process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!serviceKey) {
          console.error("admin-access-decision: SHARED_SUPABASE_SERVICE_ROLE_KEY manquante");
          return json({ error: "Configuration serveur incomplète." }, 500);
        }

        const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
        if (!token) return json({ error: "Authentification requise." }, 401);

        const admin = createClient(SUPABASE_URL, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        // 1. Identifier l'appelant à partir de son jeton.
        const { data: caller, error: callerErr } = await admin.auth.getUser(token);
        if (callerErr || !caller?.user) return json({ error: "Session invalide." }, 401);

        // 2. Vérifier qu'il est administrateur.
        const { data: callerProfil, error: cpErr } = await admin
          .from("profils")
          .select("est_admin")
          .eq("id", caller.user.id)
          .maybeSingle();
        if (cpErr) return json({ error: cpErr.message }, 500);
        if (!callerProfil?.est_admin) return json({ error: "Accès réservé aux administrateurs." }, 403);

        // 3. Mettre à jour la demande (clé composite user_id + marque).
        const { data: updated, error: uErr } = await admin
          .from("demandes_acces")
          .update({ statut })
          .eq("user_id", userId)
          .eq("marque", marque)
          .select("user_id, marque, statut");
        if (uErr) return json({ error: uErr.message }, 500);
        if (!updated || updated.length === 0) return json({ error: "Demande introuvable." }, 404);

        // 4. Aligner le profil quand il appartient à cette marque.
        const { data: profil, error: pErr } = await admin
          .from("profils")
          .select("id, marque")
          .eq("id", userId)
          .maybeSingle();
        if (pErr) return json({ error: pErr.message }, 500);
        if (profil && profil.marque === marque) {
          const { error } = await admin.from("profils").update({ statut }).eq("id", userId);
          if (error) return json({ error: error.message }, 500);
        }

        return json({ statut, ok: true });
      },
    },
  },
});

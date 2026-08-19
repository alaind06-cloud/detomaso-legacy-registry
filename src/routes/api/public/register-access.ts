import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/integrations/supabase/client";

/**
 * Inscription : création du profil + de la demande d'accès, côté serveur.
 *
 * Pourquoi un endpoint HTTP et pas un `createServerFn` : le protocole RPC des
 * server functions n'est pas joignable depuis toutes les cibles de déploiement
 * de ce projet (le navigateur recevait « Server not ready »). Une route serveur
 * est un vrai endpoint HTTP, disponible partout où le SSR tourne.
 *
 * Sécurité : la clé service_role reste strictement serveur (jamais exposée au
 * client), et l'écriture n'a lieu qu'après vérification que le compte Auth
 * existe réellement et que l'e-mail correspond.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MARQUE = /^[a-z0-9-]{2,40}$/;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/register-access")({
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
        const email = str("email").trim();
        const marque = str("marque").trim();
        const raison = str("raison").trim();
        const nom = str("nom").trim();
        const prenom = str("prenom").trim();
        const telephone = str("telephone").trim();

        if (!UUID.test(userId)) return json({ error: "Identifiant utilisateur invalide." }, 400);
        if (!email.includes("@")) return json({ error: "E-mail invalide." }, 400);
        if (!MARQUE.test(marque)) return json({ error: "Marque invalide." }, 400);
        if (raison.length < 30)
          return json({ error: "La motivation doit contenir au moins 30 caractères." }, 400);

        const serviceKey =
          process.env["SHARED_SUPABASE_SERVICE_ROLE_KEY"] ??
          process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!serviceKey) {
          console.error("register-access: SHARED_SUPABASE_SERVICE_ROLE_KEY manquante");
          return json({ error: "Configuration serveur incomplète." }, 500);
        }

        const admin = createClient(SUPABASE_URL, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        // Le compte Auth doit exister et l'e-mail correspondre.
        const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(userId);
        if (authErr || !authUser?.user) return json({ error: "Compte introuvable." }, 404);
        if ((authUser.user.email ?? "").toLowerCase() !== email.toLowerCase())
          return json({ error: "E-mail non concordant." }, 403);

        const identity: Record<string, string> = {};
        const put = (k: string, v: string) => {
          if (v) identity[k] = v;
        };
        put("email", email);
        put("nom", nom);
        put("prenom", prenom);
        put("telephone", telephone);
        put("raison", raison);

        // --- profils (idempotent, sans écraser statut/est_admin existants)
        const { data: existingProfil, error: pSelErr } = await admin
          .from("profils")
          .select("id")
          .eq("id", userId)
          .maybeSingle();
        if (pSelErr) return json({ error: pSelErr.message }, 500);

        if (existingProfil) {
          if (Object.keys(identity).length > 0) {
            const { error } = await admin.from("profils").update(identity).eq("id", userId);
            if (error) return json({ error: error.message }, 500);
          }
        } else {
          const { error } = await admin.from("profils").insert({
            id: userId,
            marque,
            statut: "en_attente",
            nom: identity["nom"] ?? "",
            prenom: identity["prenom"] ?? "",
            ...identity,
          });
          if (error) return json({ error: error.message }, 500);
        }

        // --- demandes_acces (clé primaire composite user_id + marque)
        const { data: existingDemande, error: dSelErr } = await admin
          .from("demandes_acces")
          .select("statut")
          .eq("user_id", userId)
          .eq("marque", marque)
          .maybeSingle();
        if (dSelErr) return json({ error: dSelErr.message }, 500);

        if (!existingDemande) {
          const { error } = await admin
            .from("demandes_acces")
            .insert({ user_id: userId, marque, raison, statut: "en_attente" });
          if (error) return json({ error: error.message }, 500);
          return json({ statut: "en_attente", created: true });
        }

        if (existingDemande.statut === "valide") return json({ statut: "valide", created: false });

        const { error } = await admin
          .from("demandes_acces")
          .update({ raison, statut: "en_attente" })
          .eq("user_id", userId)
          .eq("marque", marque);
        if (error) return json({ error: error.message }, 500);
        return json({ statut: "en_attente", created: false });
      },
    },
  },
});

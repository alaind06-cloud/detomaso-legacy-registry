import { supabase } from "@/integrations/supabase/client";
import { BRAND_SLUG } from "@/lib/brand";

/**
 * Crée (ou met à jour) la demande d'accès de l'utilisateur pour la marque du site.
 * Idempotent : si une demande existe déjà pour ce couple (user_id, marque),
 * on ne crée pas de doublon.
 * - demande déjà "valide" : on ne touche à rien.
 * - demande "en_attente"/"refuse" : on met à jour la motivation et on repasse
 *   le statut en "en_attente".
 */
export async function ensureAccessRequest(userId: string, raison: string) {
  const motivation = raison.trim();

  const { data: existing, error: selErr } = await supabase
    .from("demandes_acces")
    .select("id, statut")
    .eq("user_id", userId)
    .eq("marque", BRAND_SLUG)
    .order("created_at", { ascending: false })
    .limit(1);

  if (selErr) throw new Error(selErr.message);

  const current = existing?.[0] as { id: number | string; statut: string | null } | undefined;

  if (current) {
    if (current.statut === "valide") return { created: false, updated: false };
    const { error } = await supabase
      .from("demandes_acces")
      .update({ raison: motivation, statut: "en_attente" })
      .eq("id", current.id);
    if (error) throw new Error(error.message);
    return { created: false, updated: true };
  }

  const { error } = await supabase.from("demandes_acces").insert({
    user_id: userId,
    marque: BRAND_SLUG,
    raison: motivation,
    statut: "en_attente",
  });
  if (error) throw new Error(error.message);
  return { created: true, updated: false };
}

/**
 * Crée le profil s'il n'existe pas, sinon met à jour uniquement les champs
 * d'identité (jamais le statut ni les droits admin déjà en base).
 */
export async function upsertProfil(input: {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  raison?: string;
}) {
  const identity = {
    email: input.email.trim(),
    nom: input.nom?.trim() ?? "",
    prenom: input.prenom?.trim() ?? "",
    telephone: input.telephone?.trim() ?? "",
    raison: input.raison?.trim() ?? "",
  };

  const { data: existing, error: selErr } = await supabase
    .from("profils")
    .select("id")
    .eq("id", input.id)
    .limit(1);
  if (selErr) throw new Error(selErr.message);

  if (existing && existing.length > 0) {
    const { error } = await supabase.from("profils").update(identity).eq("id", input.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase
    .from("profils")
    .insert({ id: input.id, marque: BRAND_SLUG, statut: "en_attente", ...identity });
  if (error) throw new Error(error.message);
}


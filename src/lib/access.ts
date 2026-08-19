import { BRAND_SLUG } from "@/lib/brand";

/**
 * Crée (ou met à jour) le profil ET la demande d'accès pour la marque du site.
 *
 * L'écriture passe par l'endpoint serveur `/api/public/register-access` :
 * après `auth.signUp`, la session peut être absente (confirmation e-mail
 * obligatoire) et RLS bloquerait alors toute écriture depuis le navigateur.
 * Le serveur vérifie l'existence du compte avant d'écrire, et l'opération est
 * idempotente (`demandes_acces` a une clé primaire (user_id, marque)).
 */
export async function submitAccessRequest(input: {
  userId: string;
  email: string;
  raison: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
}) {
  const res = await fetch("/api/public/register-access", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      userId: input.userId,
      email: input.email.trim(),
      marque: BRAND_SLUG,
      raison: input.raison,
      nom: input.nom ?? "",
      prenom: input.prenom ?? "",
      telephone: input.telephone ?? "",
    }),
  });

  let body: { statut?: string; created?: boolean; error?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    /* réponse non JSON */
  }
  if (!res.ok) throw new Error(body.error ?? `Erreur serveur (${res.status}).`);
  return body;
}

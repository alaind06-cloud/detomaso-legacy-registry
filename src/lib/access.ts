import { BRAND_SLUG } from "@/lib/brand";
import { registerAccessRequest } from "@/lib/access.functions";

/**
 * Crée (ou met à jour) le profil ET la demande d'accès pour la marque du site.
 *
 * L'écriture passe par une fonction serveur : après `auth.signUp`, la session
 * peut être absente (confirmation e-mail obligatoire) et RLS bloquerait alors
 * toute écriture client. Le serveur vérifie l'existence du compte avant
 * d'écrire, et l'opération est idempotente (aucun doublon possible :
 * `demandes_acces` a une clé primaire (user_id, marque)).
 */
export async function submitAccessRequest(input: {
  userId: string;
  email: string;
  raison: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
}) {
  return registerAccessRequest({
    data: {
      userId: input.userId,
      email: input.email.trim(),
      marque: BRAND_SLUG,
      raison: input.raison,
      nom: input.nom ?? "",
      prenom: input.prenom ?? "",
      telephone: input.telephone ?? "",
    },
  });
}

import { createServerFn } from "@tanstack/react-start";

/**
 * Inscription : création du profil + de la demande d'accès côté serveur.
 *
 * Pourquoi côté serveur : Supabase peut exiger la confirmation e-mail, donc
 * `auth.signUp` ne renvoie pas toujours de session. Sans session, les écritures
 * client vers `profils` / `demandes_acces` sont refusées par RLS et la demande
 * n'apparaîtrait jamais dans /admin. Ici on utilise la clé service_role
 * (serveur uniquement) après avoir vérifié que le compte existe réellement.
 *
 * Note : la base est partagée entre marques et ne peut pas recevoir de DDL
 * depuis ce projet ; ce point d'entrée joue le rôle du trigger
 * `AFTER INSERT ON auth.users` sans modifier le schéma commun.
 */
export const registerAccessRequest = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      userId: string;
      email: string;
      marque: string;
      raison: string;
      nom?: string;
      prenom?: string;
      telephone?: string;
    }) => {
      const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuid.test(input.userId)) throw new Error("Identifiant utilisateur invalide.");
      if (!input.email.includes("@")) throw new Error("E-mail invalide.");
      if (!/^[a-z0-9-]{2,40}$/.test(input.marque)) throw new Error("Marque invalide.");
      if (input.raison.trim().length < 30)
        throw new Error("La motivation doit contenir au moins 30 caractères.");
      return input;
    },
  )
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = "https://darckkyqmzningzzbkhr.supabase.co";
    const serviceKey =
      process.env["SHARED_SUPABASE_SERVICE_ROLE_KEY"] ?? process.env["SUPABASE_SERVICE_ROLE_KEY"];
    if (!serviceKey) throw new Error("Configuration serveur incomplète.");

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Vérification : le compte doit exister et l'e-mail correspondre.
    const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(data.userId);
    if (authErr || !authUser?.user) throw new Error("Compte introuvable.");
    if ((authUser.user.email ?? "").toLowerCase() !== data.email.trim().toLowerCase())
      throw new Error("E-mail non concordant.");

    const identity: Record<string, string> = {};
    const put = (k: string, v?: string) => {
      const val = v?.trim();
      if (val) identity[k] = val;
    };
    put("email", data.email);
    put("nom", data.nom);
    put("prenom", data.prenom);
    put("telephone", data.telephone);
    put("raison", data.raison);

    // --- profils (idempotent, sans écraser statut/est_admin d'un compte existant)
    const { data: existingProfil, error: pSelErr } = await admin
      .from("profils")
      .select("id")
      .eq("id", data.userId)
      .maybeSingle();
    if (pSelErr) throw new Error(pSelErr.message);

    if (existingProfil) {
      if (Object.keys(identity).length > 0) {
        const { error } = await admin.from("profils").update(identity).eq("id", data.userId);
        if (error) throw new Error(error.message);
      }
    } else {
      const { error } = await admin.from("profils").insert({
        id: data.userId,
        marque: data.marque,
        statut: "en_attente",
        nom: identity["nom"] ?? "",
        prenom: identity["prenom"] ?? "",
        ...identity,
      });
      if (error) throw new Error(error.message);
    }

    // --- demandes_acces (clé primaire composite user_id + marque)
    const { data: existingDemande, error: dSelErr } = await admin
      .from("demandes_acces")
      .select("statut")
      .eq("user_id", data.userId)
      .eq("marque", data.marque)
      .maybeSingle();
    if (dSelErr) throw new Error(dSelErr.message);

    if (!existingDemande) {
      const { error } = await admin.from("demandes_acces").insert({
        user_id: data.userId,
        marque: data.marque,
        raison: data.raison.trim(),
        statut: "en_attente",
      });
      if (error) throw new Error(error.message);
      return { statut: "en_attente" as const, created: true };
    }

    if (existingDemande.statut === "valide") return { statut: "valide" as const, created: false };

    const { error } = await admin
      .from("demandes_acces")
      .update({ raison: data.raison.trim(), statut: "en_attente" })
      .eq("user_id", data.userId)
      .eq("marque", data.marque);
    if (error) throw new Error(error.message);
    return { statut: "en_attente" as const, created: false };
  });

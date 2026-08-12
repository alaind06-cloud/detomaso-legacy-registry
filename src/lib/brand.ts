/**
 * Identité de marque du registre.
 * Le code filtre toutes les requêtes sur cette valeur ("marque" en base),
 * ce qui permet la cohabitation de plusieurs registres dans un seul projet Supabase.
 */
export const BRAND_SLUG = (import.meta.env["VITE_MARQUE"] as string | undefined) ?? "de-tomaso";

export const BRAND = {
  slug: BRAND_SLUG,
  name: "De Tomaso",
  registerName: "De Tomaso Register",
  baseline: "Le registre mondial des châssis De Tomaso",
  siteUrl: "https://www.registerdetomaso.com",
  founder: {
    name: "Alejandro de Tomaso",
    role: "Fondateur",
  },
  contactEmail: "registerdetomaso@gmail.com",
} as const;

/** Langues supportées pour les historiques de châssis. */
export const LANGS = ["fr", "en", "it"] as const;
export type Lang = (typeof LANGS)[number];

export const LANG_LABELS: Record<Lang, string> = {
  fr: "Français",
  en: "English",
  it: "Italiano",
};

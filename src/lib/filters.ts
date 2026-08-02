import { MODEL_GROUPS } from "@/lib/model-groups";
import type { Voiture } from "@/lib/types";


/** Filtres du registre, synchronisés dans l'URL (partageables + retour arrière fidèle). */
export type RegistrySearch = {
  /** Modèle */
  g?: string | undefined;
  /** Décennie (1960, 1970…) */
  d?: string | undefined;
  /** Recherche libre (châssis, titre) */
  q?: string | undefined;
  /** Page courante */
  p?: number | undefined;
};

export const PAGE_SIZE = 24;
export const REGISTRY_SCROLL_KEY = "registry:scroll";

export function parseRegistrySearch(search: Record<string, unknown>): RegistrySearch {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const page = Number(search["p"]);
  return {
    g: str(search["g"]),
    d: str(search["d"]),
    q: str(search["q"]),
    p: Number.isFinite(page) && page > 1 ? Math.floor(page) : undefined,
  };
}


export function yearOf(annee: string | null): number | null {
  const m = (annee ?? "").match(/\d{4}/);
  return m ? Number(m[0]) : null;
}

export function decadeOf(annee: string | null): number | null {
  const y = yearOf(annee);
  return y ? Math.floor(y / 10) * 10 : null;
}

export function matchesFilters(v: Voiture, f: RegistrySearch): boolean {
  if (f.g) {
    const group = MODEL_GROUPS.find((g) => g.key === f.g);
    if (!group || !group.test(v)) return false;
  }
  if (f.d) {
    const dec = decadeOf(v.annee);
    if (dec === null || String(dec) !== f.d) return false;
  }

  if (f.q) {
    const needle = f.q.toLowerCase().replace(/\s+/g, "");
    const hay = `${v.chassis ?? ""} ${v.titre ?? ""} ${v.modele ?? ""} ${v.annee ?? ""}`
      .toLowerCase()
      .replace(/\s+/g, "");
    if (!hay.includes(needle)) return false;
  }
  return true;
}

export function hasFilters(f: RegistrySearch): boolean {
  return Boolean(f.g || f.d || f.q);
}

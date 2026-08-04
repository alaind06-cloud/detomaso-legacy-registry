import type { Voiture } from "@/lib/types";

/**
 * La colonne "modele" est très granulaire (une variante par châssis).
 * Le registre regroupe donc les châssis par familles pour le filtrage.
 */
export type ModelGroup = { key: string; label: string; test: (v: Voiture) => boolean };

function hay(v: Voiture) {
  return `${v.modele ?? ""} ${v.titre ?? ""}`.toLowerCase();
}

const has = (...words: string[]) => (v: Voiture) => words.some((w) => hay(v).includes(w));

export const MODEL_GROUPS: ModelGroup[] = [
  { key: "pantera", label: "Pantera", test: has("pantera") },
  
  { key: "vallelunga", label: "Vallelunga", test: has("vallelunga") },
  { key: "deauville", label: "Deauville", test: has("deauville") },
  { key: "longchamp", label: "Longchamp", test: has("longchamp") },
  { key: "barchetta", label: "Barchetta", test: has("barchetta") },
  { key: "sport", label: "Sport & Prototypes", test: has("sport", "p70", "sport 5000", "proto") },
  {
    key: "monoplace",
    label: "Monoplaces",
    test: has("formula", "f1", "f2", "f3", "osca", "indy"),
  },
];

export function groupOf(v: Voiture): ModelGroup | undefined {
  return MODEL_GROUPS.find((g) => g.test(v));
}

export function availableGroups(cars: Voiture[]): ModelGroup[] {
  return MODEL_GROUPS.filter((g) => cars.some((v) => g.test(v)));
}

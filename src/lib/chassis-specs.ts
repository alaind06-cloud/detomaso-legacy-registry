/**
 * Extraction éditoriale des spécifications et de la chronologie
 * à partir du texte libre d'historique (voiture_details).
 */

export type SpecKey =
  | "engine"
  | "engineNumber"
  | "displacement"
  | "power"
  | "gearbox"
  | "gearboxNumber"
  | "bodywork"
  | "coachbuilder"
  | "color"
  | "interior"
  | "registration"
  | "condition";

export const SPEC_GROUPS: Array<{ id: string; label: string; keys: SpecKey[] }> = [
  { id: "engine", label: "Moteur", keys: ["engine", "engineNumber", "displacement", "power"] },
  { id: "chassis", label: "Transmission & châssis", keys: ["gearbox", "gearboxNumber", "registration"] },
  {
    id: "body",
    label: "Carrosserie & finition",
    keys: ["bodywork", "coachbuilder", "color", "interior", "condition"],
  },
];

export const SPEC_LABELS: Record<SpecKey, string> = {
  engine: "Moteur",
  engineNumber: "N° moteur",
  displacement: "Cylindrée",
  power: "Puissance",
  gearbox: "Boîte de vitesses",
  gearboxNumber: "N° boîte",
  bodywork: "Carrosserie",
  coachbuilder: "Carrossier",
  color: "Couleur d'origine",
  interior: "Intérieur",
  registration: "Immatriculation",
  condition: "État",
};

const SPEC_PATTERNS: Partial<Record<SpecKey, RegExp[]>> = {
  engine: [/^\s*(?:engine|moteur|motore)\s*[:\-–]\s*(.+)$/im],
  power: [/^\s*(?:power|puissance|potenza)\s*[:\-–]\s*(.+)$/im, /\b(\d{2,3}\s*(?:ch|cv|bhp|hp))\b/i],
  displacement: [
    /^\s*(?:displacement|cylindr[ée]e|cilindrata)\s*[:\-–]\s*(.+)$/im,
    /\b(\d[\d ., ]{2,6}\s*(?:cm3|cm³|cc|l)\b)/i,
  ],
  color: [
    /^\s*(?:original\s+colou?r|colou?r|couleur(?:\s+d['’]origine)?|colore(?:\s+originale)?)\s*[:\-–]\s*(.+)$/im,
  ],
  gearbox: [/^\s*(?:gearbox|transmission|bo[îi]te(?:\s+de\s+vitesses?)?|cambio)\s*[:\-–]\s*(.+)$/im],
  bodywork: [/^\s*(?:body(?:work)?|carrosserie|carrozzeria)\s*[:\-–]\s*(.+)$/im],
  coachbuilder: [
    /^\s*(?:coachbuilder|carrossier|carrozziere)\s*[:\-–]\s*(.+)$/im,
    /\b(?:carrosserie\s+(?:de|par)|body\s+by|carrozzeria\s+di)\s+([A-Z][\w'’\-.& ]{2,40})/,
  ],
  interior: [/^\s*(?:interior|int[ée]rieur|interni)\s*[:\-–]\s*(.+)$/im],
  registration: [/^\s*(?:reg(?:istration)?|immatriculation|targa)\s*[:\-–]\s*(.+)$/im],
  engineNumber: [
    /^\s*(?:engine\s*(?:no\.?|number|n[°º]?)|n[°º]?\s*moteur|motore\s*n[°º]?)\s*[:\-–]?\s*(.+)$/im,
  ],
  gearboxNumber: [
    /^\s*(?:gearbox\s*(?:no\.?|number|n[°º]?)|n[°º]?\s*bo[îi]te|cambio\s*n[°º]?)\s*[:\-–]?\s*(.+)$/im,
  ],
  condition: [/^\s*(?:condition|[ée]tat|stato)\s*[:\-–]\s*(.+)$/im],
};

const CONDITION_HINTS: Array<[RegExp, string]> = [
  [/\b(?:enti[èe]rement|compl[èe]tement)\s+restaur/i, "Restaurée"],
  [/\bfully\s+restored\b/i, "Restaurée"],
  [/\bmatching[- ]numbers\b/i, "Matching numbers"],
  [/\b(?:[ée]tat\s+d['’]origine|unrestored)\b/i, "D'origine"],
];

function cleanValue(raw: string): string {
  let v = raw.trim();
  v = v.split(/(?:\.\s|\s[-–—]\s|;)/)[0];
  return v.replace(/^["“”'‘’(]+/, "").replace(/["“”'‘’).,;:\s]+$/g, "").trim();
}

export function extractSpecs(text: string): Partial<Record<SpecKey, string>> {
  const out: Partial<Record<SpecKey, string>> = {};
  if (!text) return out;
  for (const key of Object.keys(SPEC_PATTERNS) as SpecKey[]) {
    for (const re of SPEC_PATTERNS[key] ?? []) {
      const m = text.match(re);
      if (m?.[1]) {
        const cleaned = cleanValue(m[1]);
        if (cleaned.length >= 2 && cleaned.length <= 80) {
          out[key] = cleaned;
          break;
        }
      }
    }
  }
  if (!out.condition) {
    for (const [re, label] of CONDITION_HINTS) {
      if (re.test(text)) {
        out.condition = label;
        break;
      }
    }
  }
  return out;
}

export interface TimelineEvent {
  key?: string;
  value: string;
}

export interface TimelineEntry {
  year: string;
  events: TimelineEvent[];
}

function toEvent(raw: string): TimelineEvent {
  const i = raw.indexOf(":");
  if (i > 0 && i < 32) {
    const key = raw.slice(0, i).trim();
    const value = raw.slice(i + 1).trim();
    if (key && value && key.length < 28) return { key, value };
  }
  return { value: raw };
}

export function parseHistory(description: string): TimelineEntry[] {
  const lines = description
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const entries: TimelineEntry[] = [];
  let current: TimelineEntry | null = null;

  for (const line of lines) {
    const m = line.match(/^(\d{4})\s*[:\-–]?(?:\s+|$)(.*)/);
    if (m) {
      current = { year: m[1], events: m[2].trim() ? [toEvent(m[2].trim())] : [] };
      entries.push(current);
      continue;
    }
    if (current) current.events.push(toEvent(line));
    else {
      current = { year: "", events: [toEvent(line)] };
      entries.push(current);
    }
  }

  if (entries.length > 1 && entries[0].year === "") {
    const preamble = entries.shift()!;
    entries[0].events.unshift(...preamble.events);
  }
  return entries;
}

import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BRAND_SLUG } from "@/lib/brand";
import { referenceRank } from "@/lib/order";

import type { Book, Marque, Photo, Profil, Video, Voiture, VoitureDetails } from "@/lib/types";

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

// Fiche technique interne, jamais affichée dans le registre.
const HIDDEN_SLUGS = new Set(["00-cover"]);

export const voituresQuery = queryOptions({
  queryKey: ["voitures", BRAND_SLUG],
  queryFn: async () => {
    const rows = await unwrap<Voiture[]>(
      supabase
        .from("voitures")
        .select("*")
        .eq("marque", BRAND_SLUG)
        .order("ordre_affichage", { ascending: true, nullsFirst: false })
        .order("id", { ascending: true }),
    );
    // Ordre de référence du site historique en priorité, puis ordre_affichage / id.
    return rows
      .filter((r) => !HIDDEN_SLUGS.has((r.slug ?? "").toLowerCase()))
      .sort(
        (a, b) =>
          referenceRank(a.slug) - referenceRank(b.slug) ||
          (a.ordre_affichage ?? Number.MAX_SAFE_INTEGER) - (b.ordre_affichage ?? Number.MAX_SAFE_INTEGER) ||
          a.id - b.id,
      );
  },
});


export const marqueQuery = queryOptions({
  queryKey: ["marque", BRAND_SLUG],
  queryFn: async () => {
    const { data, error } = await supabase.from("marques").select("*").eq("slug", BRAND_SLUG).maybeSingle();
    if (error) throw new Error(error.message);
    return data as Marque | null;
  },
});

export const marquesQuery = queryOptions({
  queryKey: ["marques"],
  queryFn: () =>
    unwrap<Marque[]>(
      supabase.from("marques").select("*").order("ordre", { ascending: true, nullsFirst: false }).order("id"),
    ),
});

export const videosQuery = queryOptions({
  queryKey: ["videos", BRAND_SLUG],
  queryFn: () =>
    unwrap<Video[]>(
      supabase
        .from("videos")
        .select("*")
        .eq("marque", BRAND_SLUG)
        .order("ordre", { ascending: true, nullsFirst: false }),
    ),
});

export function voitureBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["voiture", BRAND_SLUG, slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voitures")
        .select("*")
        .eq("marque", BRAND_SLUG)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Voiture | null;
    },
  });
}

export function photosQuery(voitureId: number | undefined) {
  return queryOptions({
    queryKey: ["photos", voitureId],
    enabled: !!voitureId,
    queryFn: () =>
      unwrap<Photo[]>(
        supabase
          .from("photos")
          .select("*")
          .eq("voiture_id", voitureId!)
          .order("ordre", { ascending: true, nullsFirst: false })
          .order("id", { ascending: true }),
      ),
  });
}

export function detailsQuery(voitureId: number | undefined) {
  return queryOptions({
    queryKey: ["details", voitureId],
    enabled: !!voitureId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voiture_details")
        .select("*")
        .eq("voiture_id", voitureId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as VoitureDetails | null;
    },
  });
}

export const booksQuery = queryOptions({
  queryKey: ["books"],
  queryFn: () =>
    unwrap<Book[]>(
      supabase.from("books").select("*").order("ordre", { ascending: true, nullsFirst: false }).order("id"),
    ),
});

export const profilsQuery = queryOptions({
  queryKey: ["profils"],
  queryFn: () =>
    unwrap<Profil[]>(
      // Comptes partagés entre registres : pas de filtre marque.
      supabase.from("profils").select("*").order("created_at", { ascending: false }),
    ),
});

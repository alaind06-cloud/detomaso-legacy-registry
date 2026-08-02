import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, X, ZoomIn } from "lucide-react";
import { detailsQuery, photosQuery, voitureBySlugQuery, voituresQuery } from "@/lib/data";
import { photoUrl } from "@/lib/media";
import { BRAND, LANG_LABELS, LANGS, type Lang } from "@/lib/brand";
import { hasFilters, matchesFilters, parseRegistrySearch } from "@/lib/filters";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Voiture } from "@/lib/types";

export const Route = createFileRoute("/chassis/$slug")({
  validateSearch: parseRegistrySearch,
  head: ({ params }) => {
    const url = `${BRAND.siteUrl}/chassis/${params.slug}`;
    return {
      meta: [
        { title: `Châssis ${params.slug} — ${BRAND.registerName}` },
        {
          name: "description",
          content: `Fiche détaillée du châssis ${params.slug} : spécifications techniques, historique documenté et galerie photographique dans le registre De Tomaso.`,
        },
        { property: "og:title", content: `Châssis ${params.slug} — ${BRAND.registerName}` },
        {
          property: "og:description",
          content: `Spécifications, historique et photographies du châssis ${params.slug}.`,
        },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ChassisPage,
});


function ChassisPage() {
  const { slug } = Route.useParams();
  const filters = Route.useSearch();
  const { isMember, isAdmin, loading } = useAuth();
  const { data: voiture, isLoading } = useQuery(voitureBySlugQuery(slug));
  const { data: photos = [] } = useQuery(photosQuery(voiture?.id));
  const { data: details } = useQuery(detailsQuery(voiture?.id));
  const { data: siblings = [] } = useQuery(voituresQuery);
  const [lang, setLang] = useState<Lang>("fr");
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  const canSeeDetails = isMember || isAdmin;

  // Voisins dans la liste courante (filtres du registre conservés).
  const neighbours = useMemo(() => {
    const scoped = hasFilters(filters) ? siblings.filter((v) => matchesFilters(v, filters)) : siblings;
    const list = scoped.some((v) => v.slug === slug) ? scoped : siblings;
    const i = list.findIndex((v) => v.slug === slug);
    return {
      prev: i > 0 ? (list[i - 1] as Voiture) : null,
      next: i >= 0 && i < list.length - 1 ? (list[i + 1] as Voiture) : null,
      position: i + 1,
      total: list.length,
    };
  }, [siblings, filters, slug]);

  // La galerie repart de la première photo quand on change de châssis.
  useEffect(() => {
    setIndex(0);
  }, [slug]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") setIndex((i) => (photos.length ? (i + 1) % photos.length : 0));
      if (e.key === "ArrowLeft")
        setIndex((i) => (photos.length ? (i - 1 + photos.length) % photos.length : 0));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length]);

  // Verrouille le défilement de la page pendant le zoom plein écran.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    if (zoom) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [zoom]);

  if (isLoading) return <div className="mx-auto max-w-7xl px-5 py-24 eyebrow">Chargement…</div>;
  if (!voiture) throw notFound();

  const current = photos[index];
  const history = (details?.[`description_${lang}`] ?? details?.description ?? "") as string;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: voiture.titre ?? `De Tomaso ${voiture.modele}`,
    brand: { "@type": "Brand", name: "De Tomaso" },
    model: voiture.modele ?? undefined,
    vehicleIdentificationNumber: voiture.chassis ?? undefined,
    productionDate: voiture.annee ?? undefined,
    url: `${BRAND.siteUrl}/chassis/${voiture.slug}`,
  };

  return (
    <article className="mx-auto max-w-7xl px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/" search={filters} hash="registre" className="eyebrow hover:text-foreground">
          ← Retour au registre
        </Link>
        <Pager prev={neighbours.prev} next={neighbours.next} filters={filters} />
      </div>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <p className="eyebrow">
            {voiture.modele}
            {neighbours.total > 0 && ` · ${neighbours.position} / ${neighbours.total}`}
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">{voiture.titre ?? voiture.modele}</h1>
        </div>

        <dl className="flex gap-10">
          <div>
            <dt className="eyebrow">Châssis</dt>
            <dd className="mt-1 font-mono text-lg text-primary">{voiture.chassis ?? "—"}</dd>
          </div>
          <div>
            <dt className="eyebrow">Année</dt>
            <dd className="mt-1 font-mono text-lg">{voiture.annee ?? "—"}</dd>
          </div>
        </dl>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="relative aspect-4/3 overflow-hidden bg-muted">
            {current ? (
              <>
                <img
                  src={photoUrl(voiture.storage_path, current.filename)}
                  alt={`${voiture.titre ?? voiture.modele} — photo ${index + 1}`}
                  className="size-full object-cover"
                />
                <button
                  onClick={() => setZoom(true)}
                  className="absolute top-3 right-3 bg-background/85 p-2 hover:bg-background"
                  aria-label="Agrandir"
                >
                  <ZoomIn className="size-4" />
                </button>
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
                      className="absolute top-1/2 left-3 -translate-y-1/2 bg-background/85 p-2 hover:bg-background"
                      aria-label="Photo précédente"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      onClick={() => setIndex((i) => (i + 1) % photos.length)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 bg-background/85 p-2 hover:bg-background"
                      aria-label="Photo suivante"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                    <span className="absolute bottom-3 left-3 bg-background/85 px-2.5 py-1 font-mono text-xs">
                      {index + 1} / {photos.length}
                    </span>
                  </>
                )}
              </>
            ) : (
              <div className="flex size-full items-center justify-center eyebrow">Aucune photographie</div>
            )}
          </div>

          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-6 gap-2">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "aspect-square overflow-hidden bg-muted opacity-60 transition-opacity hover:opacity-100",
                    i === index && "opacity-100 ring-2 ring-primary",
                  )}
                >
                  <img
                    src={photoUrl(voiture.storage_path, p.filename)}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <aside>
          <h2 className="font-display text-2xl">Historique</h2>
          <div className="mt-4 flex gap-2">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "border px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase",
                  lang === l ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {LANG_LABELS[l].slice(0, 2)}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="mt-6 text-sm text-muted-foreground">Chargement…</p>
          ) : canSeeDetails ? (
            <div className="mt-6 space-y-4 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {history || "Historique en cours de documentation."}
            </div>
          ) : (
            <div className="mt-6 border border-border bg-secondary/50 p-6">
              <Lock className="size-5 text-primary" />
              <p className="mt-3 font-display text-lg">Réservé aux membres validés</p>
              <p className="mt-2 text-sm text-muted-foreground">
                L'historique détaillé de ce châssis est accessible aux membres du registre.
              </p>
              <Link
                to="/auth"
                className="mt-5 inline-flex bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-primary-foreground"
              >
                Demander l'accès
              </Link>
            </div>
          )}
        </aside>
      </div>

      {zoom && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6"
          onClick={() => setZoom(false)}
        >
          <button className="absolute top-5 right-5 text-white" aria-label="Fermer">
            <X className="size-6" />
          </button>
          <img
            src={photoUrl(voiture.storage_path, current.filename)}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </article>
  );
}

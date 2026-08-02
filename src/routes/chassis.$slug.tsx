import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, X } from "lucide-react";
import { detailsQuery, photosQuery, voitureBySlugQuery, voituresQuery } from "@/lib/data";
import { photoUrl } from "@/lib/media";
import { BRAND, LANG_LABELS, LANGS, type Lang } from "@/lib/brand";
import { hasFilters, matchesFilters, parseRegistrySearch } from "@/lib/filters";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { extractSpecs } from "@/lib/chassis-specs";
import { SpecsBlock } from "@/components/site/SpecsBlock";
import { HistoryTimeline } from "@/components/site/HistoryTimeline";
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
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Bandeau de navigation */}
      <div className="border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link to="/" search={filters} hash="registre" className="eyebrow hover:text-foreground">
            ← Retour au registre
          </Link>
          <div className="flex items-center gap-4">
            {neighbours.total > 0 && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {neighbours.position} / {neighbours.total}
              </span>
            )}
            <Pager prev={neighbours.prev} next={neighbours.next} filters={filters} />
          </div>
        </div>
      </div>

      {/* Hero éditorial */}
      <header className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[1.55fr_1fr] lg:py-14">
          <figure className="border border-border bg-card p-2 sm:p-3">
            <div className="flex items-center justify-center overflow-hidden bg-muted">
              {cover ? (
                <img
                  src={photoUrl(voiture.storage_path, cover.filename)}
                  alt={voiture.titre ?? voiture.modele ?? "De Tomaso"}
                  fetchPriority="high"
                  className="max-h-[64vh] w-full object-contain"
                />
              ) : (
                <div className="grid aspect-4/3 w-full place-items-center eyebrow">Aucune photographie</div>
              )}
            </div>
          </figure>

          <div className="flex flex-col gap-7">
            <div>
              <p className="eyebrow">
                {voiture.modele ?? "De Tomaso"}
                {voiture.annee ? ` · ${voiture.annee}` : ""}
              </p>
              <h1 className="mt-3 font-display text-4xl leading-[1.05] sm:text-5xl">
                {voiture.titre ?? voiture.modele}
              </h1>
              {voiture.chassis && (
                <span className="mt-5 inline-flex items-center gap-3 border border-primary/40 bg-primary/5 px-4 py-2">
                  <span className="text-[0.6rem] tracking-[0.22em] text-muted-foreground uppercase">Châssis</span>
                  <span className="font-mono text-sm text-primary">{voiture.chassis}</span>
                </span>
              )}
            </div>

            <SpecsBlock specs={specs} />

            <aside className="border-l-2 border-primary/60 bg-secondary/50 p-5">
              <h2 className="font-display text-lg">Provenance & authentification</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Chaque châssis du registre est documenté à partir d'archives d'usine, de la presse
                d'époque et des témoignages de propriétaires successifs.
              </p>
              <Link to="/expert" className="mt-3 inline-block eyebrow text-primary hover:underline">
                L'expertise du registre →
              </Link>
            </aside>
          </div>
        </div>
      </header>

      {/* Historique */}
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-3xl">Historique</h2>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "border px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase transition-colors",
                    lang === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary hover:text-primary",
                  )}
                >
                  {LANG_LABELS[l].slice(0, 2)}
                </button>
              ))}
            </div>
            {canSeeDetails && history.trim() && (
              <div className="inline-flex overflow-hidden border border-border text-[11px]">
                {(["summary", "full"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    aria-pressed={mode === m}
                    className={cn(
                      "px-3 py-1.5 tracking-[0.16em] uppercase transition-colors",
                      m === "full" && "border-l border-border",
                      mode === m ? "bg-primary text-primary-foreground" : "hover:text-primary",
                    )}
                  >
                    {m === "summary" ? "Vue résumée" : "Vue complète"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : canSeeDetails ? (
          <HistoryTimeline
            description={history}
            mode={mode}
            modele={voiture.modele}
            annee={voiture.annee}
            chassis={voiture.chassis}
          />
        ) : (
          <div className="max-w-xl border border-border bg-secondary/50 p-8">
            <Lock className="size-5 text-primary" />
            <p className="mt-3 font-display text-xl">Réservé aux membres validés</p>
            <p className="mt-2 text-sm text-muted-foreground">
              L'historique détaillé de ce châssis est accessible aux membres du registre.
            </p>
            <Link
              to="/auth"
              className="mt-5 inline-flex bg-primary px-5 py-2.5 text-xs tracking-[0.18em] text-primary-foreground uppercase"
            >
              Demander l'accès
            </Link>
          </div>
        )}
      </section>

      {/* Galerie */}
      {photos.length > 0 && (
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-5 py-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl">Galerie</h2>
              <span className="eyebrow">
                {photos.length} photographie{photos.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setIndex(i);
                    setZoom(true);
                  }}
                  className="group aspect-square overflow-hidden border border-border bg-muted"
                  aria-label={`Agrandir la photo ${i + 1}`}
                >
                  <img
                    src={photoUrl(voiture.storage_path, p.filename)}
                    alt={`${voiture.titre ?? voiture.modele} — photo ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-5 py-10">
        <Pager prev={neighbours.prev} next={neighbours.next} filters={filters} wide />
      </div>

      {zoom && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
        >
          <button className="absolute top-5 right-5 text-white" aria-label="Fermer">
            <X className="size-6" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i - 1 + photos.length) % photos.length);
                }}
                className="absolute top-1/2 left-5 -translate-y-1/2 p-2 text-white/80 hover:text-white"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="size-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i + 1) % photos.length);
                }}
                className="absolute top-1/2 right-5 -translate-y-1/2 p-2 text-white/80 hover:text-white"
                aria-label="Photo suivante"
              >
                <ChevronRight className="size-8" />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs text-white/70">
                {index + 1} / {photos.length}
              </span>
            </>
          )}
          <img
            src={photoUrl(voiture.storage_path, current.filename)}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </article>
  );
}


function Pager({
  prev,
  next,
  filters,
  wide = false,
}: {
  prev: Voiture | null;
  next: Voiture | null;
  filters: ReturnType<typeof Route.useSearch>;
  wide?: boolean;
}) {
  if (!prev && !next) return null;
  const base =
    "inline-flex max-w-[45vw] items-center gap-2 border border-border px-4 py-2 text-[11px] tracking-[0.16em] uppercase transition-colors hover:border-primary hover:text-primary";
  const label = (v: Voiture) => v.chassis ?? v.titre ?? v.modele ?? "—";

  return (
    <nav
      aria-label="Navigation entre châssis"
      className={cn("flex flex-wrap items-center gap-3", wide ? "justify-between" : "justify-end")}
    >
      {prev ? (
        <Link to="/chassis/$slug" params={{ slug: prev.slug }} search={filters} className={base}>
          <ChevronLeft className="size-3.5 shrink-0" />
          <span className="truncate">{wide ? `Précédent · ${label(prev)}` : label(prev)}</span>
        </Link>
      ) : (
        <span className={cn(base, "pointer-events-none opacity-40")} aria-disabled>
          <ChevronLeft className="size-3.5" />
          <span>Précédent</span>
        </span>
      )}
      {next ? (
        <Link to="/chassis/$slug" params={{ slug: next.slug }} search={filters} className={base}>
          <span className="truncate">{wide ? `Suivant · ${label(next)}` : label(next)}</span>
          <ChevronRight className="size-3.5 shrink-0" />
        </Link>
      ) : (
        <span className={cn(base, "pointer-events-none opacity-40")} aria-disabled>
          <span>Suivant</span>
          <ChevronRight className="size-3.5" />
        </span>
      )}
    </nav>
  );
}


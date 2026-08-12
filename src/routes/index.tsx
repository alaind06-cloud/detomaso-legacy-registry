import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import heroImage from "@/assets/hero-detomaso.jpg";
import heroImageWebp from "@/assets/hero-detomaso.webp";
import { voituresQuery } from "@/lib/data";
import { PhotoPicture } from "@/components/site/PhotoPicture";
import { BRAND } from "@/lib/brand";
import {
  PAGE_SIZE,
  REGISTRY_SCROLL_KEY,
  decadeOf,
  matchesFilters,
  parseRegistrySearch,
  type RegistrySearch,
} from "@/lib/filters";
import { availableGroups } from "@/lib/model-groups";
import { ActivePills, FilterChip, type ActivePill } from "@/components/site/FilterChip";
import { useT } from "@/lib/i18n";
import type { Voiture } from "@/lib/types";


export const Route = createFileRoute("/")({
  validateSearch: parseRegistrySearch,
  head: () => ({
    meta: [
      { title: `${BRAND.registerName} — Registre mondial des châssis De Tomaso` },
      {
        name: "description",
        content:
          "Le registre indépendant des châssis De Tomaso : Pantera, Mangusta, Longchamp, Deauville. Numéros de châssis, historiques documentés et archives photographiques.",
      },
      { property: "og:title", content: `${BRAND.registerName} — Registre mondial des châssis` },
      {
        property: "og:description",
        content: "Recensement châssis par châssis des automobiles De Tomaso, documenté et illustré.",
      },
      { property: "og:url", content: BRAND.siteUrl },
    ],
    links: [{ rel: "canonical", href: BRAND.siteUrl }],
  }),
  component: Home,
});

function Home() {
  const { data: voitures = [], isLoading, error } = useQuery(voituresQuery);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const t = useT();


  const modele = search.g ?? "all";
  const decennie = search.d ?? "all";
  const q = search.q ?? "";
  const page = Math.max(1, search.p ?? 1);

  const patch = (next: Partial<RegistrySearch>) =>
    navigate({
      search: (prev: RegistrySearch) => ({ ...prev, ...next }),
      replace: true,
      resetScroll: false,
    });

  const setModele = (v: string) => patch({ g: v === "all" ? undefined : v, p: undefined });
  const setDecennie = (v: string) => patch({ d: v === "all" ? undefined : v, p: undefined });
  const setQ = (v: string) => patch({ q: v.trim() ? v : undefined, p: undefined });
  const setPage = (n: number) => patch({ p: n > 1 ? n : undefined });

  const groups = useMemo(() => availableGroups(voitures), [voitures]);
  const selectedGroup = groups.find((g) => g.key === modele);

  const decennies = useMemo(() => {
    const set = new Set<number>();
    voitures.forEach((v) => {
      const d = decadeOf(v.annee);
      if (d) set.add(d);
    });
    return [...set].sort();
  }, [voitures]);

  const filtered = useMemo(
    () => voitures.filter((v) => matchesFilters(v, search)),
    [voitures, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pills: ActivePill[] = [];
  if (modele !== "all")
    pills.push({ key: "g", label: t("home.model"), value: selectedGroup?.label ?? modele, onRemove: () => setModele("all") });
  if (decennie !== "all")
    pills.push({
      key: "d",
      label: t("home.decade"),
      value: `${decennie}s`,
      onRemove: () => setDecennie("all"),
    });
  if (q.trim())
    pills.push({ key: "q", label: t("filters.search"), value: q.trim(), onRemove: () => setQ("") });


  // Restaure la position de défilement au retour depuis une fiche châssis.
  useEffect(() => {
    if (isLoading || typeof window === "undefined") return;
    const saved = sessionStorage.getItem(REGISTRY_SCROLL_KEY);
    if (!saved) return;
    sessionStorage.removeItem(REGISTRY_SCROLL_KEY);
    const y = parseInt(saved, 10);
    if (!Number.isFinite(y)) return;
    requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "auto" }));
  }, [isLoading]);

  const goToPage = (n: number) => {
    setPage(n);
    if (typeof window !== "undefined") {
      document.getElementById("registre")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={heroAsset.url}
          alt={t("home.heroAlt")}
          fetchPriority="high"
          decoding="sync"
          className="hero-kenburns absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_180px_60px_hsl(var(--background)/0.9)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-28 sm:py-36">
          <p className="eyebrow">{t("home.eyebrow")}</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] sm:text-7xl">
            {t("home.title1")}
            <span className="block text-primary">{t("home.title2")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("home.intro")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#registre"
              className="bg-primary px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground"
            >
              {t("home.cta.browse")}
            </a>
            <Link
              to="/auth"
              className="border border-foreground/25 px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-accent"
            >
              {t("home.cta.join")}
            </Link>
          </div>
        </div>
      </section>

      <section id="registre" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
        <div className="border-b border-border pb-8">
          <p className="eyebrow">{t("home.registry.eyebrow")}</p>
          <h2 className="mt-2 font-display text-3xl">{t("home.registry.title")}</h2>

          <div className="mt-8 max-w-md">
            <label htmlFor="registry-search" className="eyebrow mb-2 block">
              {t("home.search.label")}
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="registry-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("home.search.placeholder")}
                className="h-11 w-full border border-input bg-card pr-3 pl-9 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-8">
            <span className="eyebrow mb-3 block">{t("home.model")}</span>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={modele === "all"} onClick={() => setModele("all")}>
                {t("home.allModels")}
              </FilterChip>
              {groups.map((g) => (
                <FilterChip key={g.key} active={modele === g.key} onClick={() => setModele(g.key)}>
                  {g.label}
                </FilterChip>
              ))}

            </div>
          </div>

          {decennies.length > 1 && (
            <div className="mt-6">
              <span className="eyebrow mb-3 block">{t("home.decade")}</span>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={decennie === "all"} onClick={() => setDecennie("all")}>
                  {t("home.allDecades")}
                </FilterChip>
                {decennies.map((d) => (
                  <FilterChip
                    key={d}
                    active={decennie === String(d)}
                    onClick={() => setDecennie(String(d))}
                  >
                    {d}s
                  </FilterChip>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <ActivePills pills={pills} />
            <p className="eyebrow ml-auto" aria-live="polite" aria-atomic="true">
              {isLoading
                ? "…"
                : t(filtered.length > 1 ? "home.count.other" : "home.count.one", {
                    n: filtered.length,
                  })}
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-10 border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {t("home.error")} {(error as Error).message}
          </p>
        )}

        {!isLoading && totalPages > 1 && (
          <p className="mt-6 text-right eyebrow">
            {t("home.page")} {currentPage} / {totalPages}
          </p>
        )}

        <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" aria-busy={isLoading}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : items.map((v, i) => (
                <CarCard key={v.id} v={v} filters={search} priority={i < 3} />
              ))}
        </div>

        {!isLoading && filtered.length === 0 && !error && (
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">{t("home.empty")}</p>
            <button
              onClick={() => navigate({ search: {}, replace: true, resetScroll: false })}
              className="mt-4 border border-border px-5 py-2.5 text-xs uppercase tracking-[0.18em] hover:bg-accent"
            >
              {t("home.reset")}
            </button>
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-3" aria-label={t("common.pagination")}>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="border border-border px-5 py-2.5 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-accent disabled:opacity-40"
            >
              {t("common.prev")}
            </button>
            <span className="px-2 font-mono text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border border-border px-5 py-2.5 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-accent disabled:opacity-40"
            >
              {t("common.next")}
            </button>
          </nav>
        )}

      </section>
    </>
  );
}

function CarCard({
  v,
  filters,
  priority,
}: {
  v: Voiture;
  filters: RegistrySearch;
  priority: boolean;
}) {
  const t = useT();
  return (
    <Link
      to="/chassis/$slug"
      params={{ slug: v.slug }}
      search={filters}
      onClick={() => {
        if (typeof window !== "undefined")
          sessionStorage.setItem(REGISTRY_SCROLL_KEY, String(window.scrollY));
      }}
      className="group block"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {v.cover_photo ? (
          <PhotoPicture
            storagePath={v.storage_path}
            filename={v.cover_photo}
            alt={v.titre ?? `${t("chassis.plate")} ${v.chassis}`}
            priority={priority}
            width={640}
            height={480}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />

        ) : (
          <div className="flex size-full items-center justify-center eyebrow">
            {t("home.noVisual")}
          </div>
        )}

        {v.annee && (
          <span className="absolute top-0 left-0 bg-background/90 px-3 py-1.5 text-[11px] tracking-[0.18em]">
            {v.annee}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-border pt-3">
        <div>
          <h3 className="font-display text-xl leading-tight">{v.titre ?? v.modele}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{v.modele}</p>
        </div>
        <span className="shrink-0 font-mono text-xs text-primary">{v.chassis}</span>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div aria-hidden>
      <div className="aspect-4/3 animate-pulse bg-muted" />
      <div className="mt-4 space-y-3 border-t border-border pt-3">
        <div className="h-4 w-3/4 animate-pulse bg-muted" />
        <div className="h-3 w-1/3 animate-pulse bg-muted" />
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import heroImage from "@/assets/hero-detomaso.jpg";
import { voituresQuery } from "@/lib/data";
import { photoUrl } from "@/lib/media";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
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
  const [modele, setModele] = useState<string>("all");
  const [annee, setAnnee] = useState<string>("all");
  const [q, setQ] = useState("");

  const modeles = useMemo(
    () => [...new Set(voitures.map((v) => v.modele).filter(Boolean))].sort() as string[],
    [voitures],
  );
  const annees = useMemo(
    () => [...new Set(voitures.map((v) => v.annee).filter(Boolean))].sort() as string[],
    [voitures],
  );

  const filtered = voitures.filter((v) => {
    if (modele !== "all" && v.modele !== modele) return false;
    if (annee !== "all" && v.annee !== annee) return false;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      const hay = `${v.chassis ?? ""} ${v.titre ?? ""} ${v.modele ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={heroImage}
          alt="Automobile De Tomaso dans un atelier de Modène"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
        <div className="relative mx-auto max-w-7xl px-5 py-28 sm:py-36">
          <p className="eyebrow">Modena · Depuis 1959</p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[1.05] sm:text-7xl">
            Chaque châssis De&nbsp;Tomaso a une histoire.
            <span className="block text-primary">Nous la documentons.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Un recensement indépendant, châssis par châssis, des automobiles nées de la vision
            d'Alejandro de Tomaso — Vallelunga, Mangusta, Pantera, Deauville, Longchamp.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#registre"
              className="bg-primary px-7 py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground"
            >
              Consulter le registre
            </a>
            <Link
              to="/auth"
              className="border border-foreground/25 px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-accent"
            >
              Devenir membre
            </Link>
          </div>
        </div>
      </section>

      <section id="registre" className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <p className="eyebrow">Le registre</p>
            <h2 className="mt-2 font-display text-3xl">
              {filtered.length} châssis référencé{filtered.length > 1 ? "s" : ""}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="N° de châssis…"
                className="h-11 w-56 border border-input bg-card pr-3 pl-9 text-sm outline-none focus:border-primary"
              />
            </div>
            <select
              value={modele}
              onChange={(e) => setModele(e.target.value)}
              className="h-11 border border-input bg-card px-3 text-sm outline-none focus:border-primary"
            >
              <option value="all">Tous les modèles</option>
              {modeles.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={annee}
              onChange={(e) => setAnnee(e.target.value)}
              className="h-11 border border-input bg-card px-3 text-sm outline-none focus:border-primary"
            >
              <option value="all">Toutes les années</option>
              {annees.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-10 border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            Impossible de charger le registre : {(error as Error).message}
          </p>
        )}

        {isLoading ? (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-4/3 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => (
              <Link
                key={v.id}
                to="/chassis/$slug"
                params={{ slug: v.slug }}
                className="group block"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-muted">
                  {v.cover_photo ? (
                    <img
                      src={photoUrl(v.storage_path, v.cover_photo)}
                      alt={v.titre ?? `Châssis ${v.chassis}`}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center eyebrow">Sans visuel</div>
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
                  <span className={cn("shrink-0 font-mono text-xs text-primary")}>{v.chassis}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && !error && (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            Aucun châssis ne correspond à cette recherche.
          </p>
        )}
      </section>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { videosQuery } from "@/lib/data";
import { BRAND } from "@/lib/brand";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: `Vidéos d'archives — ${BRAND.registerName}` },
      {
        name: "description",
        content:
          "Films d'époque, essais et reportages consacrés aux automobiles De Tomaso : Pantera, Mangusta, Longchamp et Deauville.",
      },
      { property: "og:title", content: `Vidéos d'archives — ${BRAND.registerName}` },
      { property: "og:description", content: "La vidéothèque du registre De Tomaso." },
      { property: "og:url", content: `${BRAND.siteUrl}/videos` },
    ],
    links: [{ rel: "canonical", href: `${BRAND.siteUrl}/videos` }],
  }),
  component: Videos,
});

function Videos() {
  const { data: videos = [], isLoading } = useQuery(videosQuery);
  const [active, setActive] = useState<string | null>(null);
  const t = useT();

  return (
    <div className="mx-auto max-w-7xl px-5 py-16">
      <p className="eyebrow">{t("videos.eyebrow")}</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{t("videos.title")}</h1>
      <div className="mt-6 h-px w-24 bg-primary/60" />

      {isLoading && <p className="mt-10 text-sm text-muted-foreground">{t("common.loading")}</p>}

      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v, i) => (
          <article key={v.id} className="group flex flex-col">
            <div className="relative aspect-video overflow-hidden border border-border/60 bg-muted shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
              {active === v.youtube_id ? (
                <iframe
                  src={`https://www.youtube.com/embed/${v.youtube_id}?autoplay=1&rel=0`}
                  title={v.titre ?? "Vidéo De Tomaso"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              ) : (
                <button
                  onClick={() => setActive(v.youtube_id)}
                  aria-label={`${t("videos.play")} — ${v.titre ?? ""}`}
                  className="size-full"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${v.youtube_id}/maxresdefault.jpg`}
                    onError={(e) => {
                      e.currentTarget.src = `https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`;
                    }}
                    alt={v.titre ?? "Vidéo De Tomaso"}
                    loading={i < 3 ? "eager" : "lazy"}
                    width={1280}
                    height={720}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-14 items-center justify-center rounded-full border border-primary-foreground/60 bg-primary/90 text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 size-5" aria-hidden>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                  <span className="absolute bottom-3 left-3 text-[0.65rem] uppercase tracking-[0.25em] text-foreground/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </button>
              )}
            </div>
            <h2 className="mt-4 font-display text-lg leading-snug">{v.titre ?? t("videos.untitled")}</h2>
            {v.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.description}</p>
            )}
          </article>
        ))}
      </div>

      {!isLoading && videos.length === 0 && (
        <p className="mt-12 text-sm text-muted-foreground">{t("videos.empty")}</p>
      )}
    </div>
  );
}

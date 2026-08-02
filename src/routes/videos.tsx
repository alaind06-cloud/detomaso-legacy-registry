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

      {isLoading && <p className="mt-10 text-sm text-muted-foreground">{t("common.loading")}</p>}

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <div key={v.id}>
            <div className="relative aspect-video overflow-hidden bg-muted">
              {active === v.youtube_id ? (
                <iframe
                  src={`https://www.youtube.com/embed/${v.youtube_id}?autoplay=1`}
                  title={v.titre ?? "Vidéo De Tomaso"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="size-full"
                />
              ) : (
                <button onClick={() => setActive(v.youtube_id)} className="group size-full">
                  <img
                    src={`https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`}
                    alt={v.titre ?? "Vidéo De Tomaso"}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-background/20">
                    <span className="border border-primary-foreground/70 bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-primary-foreground">
                      {t("videos.play")}
                    </span>
                  </span>
                </button>
              )}
            </div>
            <h2 className="mt-3 font-display text-lg">{v.titre ?? t("videos.untitled")}</h2>
            {v.description && (
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{v.description}</p>
            )}
          </div>
        ))}
      </div>

      {!isLoading && videos.length === 0 && (
        <p className="mt-12 text-sm text-muted-foreground">{t("videos.empty")}</p>
      )}
    </div>
  );
}

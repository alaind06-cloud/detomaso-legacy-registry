import { createFileRoute } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";
import { useT, type TKey } from "@/lib/i18n";

const PORTRAIT_URL =
  "https://upload.wikimedia.org/wikipedia/commons/9/95/Alejandro_detomaso.jpg";

export const Route = createFileRoute("/fondateur")({
  head: () => ({
    meta: [
      { title: `Alejandro de Tomaso — L'expert | ${BRAND.registerName}` },
      {
        name: "description",
        content:
          "Alejandro de Tomaso, pilote argentin devenu constructeur à Modène : l'histoire de l'homme derrière la Pantera, la Mangusta et la Vallelunga.",
      },
      { property: "og:title", content: `Alejandro de Tomaso — ${BRAND.registerName}` },
      {
        property: "og:description",
        content: "Portrait du fondateur et regard d'expert sur les automobiles De Tomaso.",
      },
      { property: "og:url", content: `${BRAND.siteUrl}/fondateur` },
      { property: "og:image", content: PORTRAIT_URL },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: PORTRAIT_URL },
    ],
    links: [{ rel: "canonical", href: `${BRAND.siteUrl}/fondateur` }],
  }),
  component: Fondateur,
});

const TIMELINE: Array<{ year: string; key: TKey }> = [
  { year: "1928", key: "founder.t1928" },
  { year: "1955", key: "founder.t1955" },
  { year: "1959", key: "founder.t1959" },
  { year: "1963", key: "founder.t1963" },
  { year: "1967", key: "founder.t1967" },
  { year: "1971", key: "founder.t1971" },
  { year: "1976", key: "founder.t1976" },
  { year: "1993", key: "founder.t1993" },
];

function Fondateur() {
  const t = useT();

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <p className="eyebrow">{t("founder.eyebrow")}</p>
      <h1 className="mt-4 font-display text-4xl sm:text-6xl">{BRAND.founder.name}</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{t("founder.intro")}</p>

      <figure className="mt-10">
        <div className="overflow-hidden rounded-sm border border-border bg-muted shadow-sm">
          <img
            src={PORTRAIT_URL}
            alt="Portrait d'Alejandro de Tomaso, fondateur de De Tomaso, vers 1965"
            width={640}
            height={800}
            loading="eager"
            fetchPriority="high"
            className="mx-auto max-h-[70vh] w-auto object-contain"
          />
        </div>
        <figcaption className="mt-3 text-center text-xs text-muted-foreground">
          Crédit photo : Wikimedia Commons — Domaine public
        </figcaption>
      </figure>

      <div className="mt-16 border-t border-border">
        {TIMELINE.map((item) => (
          <div
            key={item.year}
            className="grid gap-4 border-b border-border py-6 sm:grid-cols-[120px_1fr]"
          >
            <span className="font-mono text-sm text-primary">{item.year}</span>
            <p className="text-sm leading-relaxed text-muted-foreground">{t(item.key)}</p>
          </div>
        ))}
      </div>

      <section className="mt-16 border border-border bg-secondary/40 p-8">
        <h2 className="font-display text-2xl">{t("founder.expertise.title")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("founder.expertise.text")}
        </p>
        <a
          href={`mailto:${BRAND.contactEmail}`}
          className="mt-6 inline-flex bg-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground"
        >
          {t("founder.contact")}
        </a>
      </section>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";
import { useT, type TKey } from "@/lib/i18n";

const PORTRAIT_URL =
  "https://upload.wikimedia.org/wikipedia/commons/9/95/Alejandro_detomaso.jpg";

const PERSON_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://detomaso-legacy-registry.com/alejandro#person",
  name: "Alejandro de Tomaso",
  givenName: "Alejandro",
  familyName: "de Tomaso",
  birthDate: "1928-07-10",
  deathDate: "2003-05-21",
  birthPlace: {
    "@type": "Place",
    address: { "@type": "PostalAddress", addressLocality: "Buenos Aires", addressCountry: "AR" },
  },
  deathPlace: {
    "@type": "Place",
    address: { "@type": "PostalAddress", addressLocality: "Modena", addressCountry: "IT" },
  },
  nationality: [
    { "@type": "Country", name: "Argentina" },
    { "@type": "Country", name: "Italy" },
  ],
  jobTitle: ["Automotive Industry Executive", "Race Car Driver", "Entrepreneur"],
  description:
    "Alejandro de Tomaso (1928–2003) était un pilote de course, entrepreneur et constructeur automobile fondateur de De Tomaso Automobili à Modène. Il est célèbre pour la création des supercars Mangusta et Pantera, ainsi que le rachat de Maserati.",
  image: PORTRAIT_URL,
  sameAs: [
    "https://fr.wikipedia.org/wiki/Alejandro_de_Tomaso",
    "https://www.wikidata.org/wiki/Q172234",
  ],
  founder: [
    {
      "@type": "Organization",
      name: "De Tomaso Automobili",
      foundingDate: "1959",
      location: {
        "@type": "Place",
        address: { "@type": "PostalAddress", addressLocality: "Modena", addressCountry: "IT" },
      },
    },
  ],
  knowsAbout: [
    "De Tomaso Mangusta",
    "De Tomaso Pantera",
    "De Tomaso Vallelunga",
    "Maserati Biturbo",
    "Carrozzeria Ghia",
    "Motor Valley Modena",
  ],
};

const META_TITLE = `Alejandro de Tomaso : Le Visionnaire de Modène | ${BRAND.registerName}`;
const META_DESC =
  "Découvrez Alejandro de Tomaso (1928–2003), pilote et industriel argentin fondateur de De Tomaso Automobili à Modène, créateur de la Mangusta et de la Pantera, et repreneur de Maserati.";

export const Route = createFileRoute("/fondateur")({
  head: () => ({
    meta: [
      { title: META_TITLE },
      { name: "description", content: META_DESC },
      { property: "og:title", content: META_TITLE },
      { property: "og:description", content: META_DESC },
      { property: "og:url", content: `${BRAND.siteUrl}/fondateur` },
      { property: "og:image", content: PORTRAIT_URL },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: PORTRAIT_URL },
    ],
    links: [{ rel: "canonical", href: `${BRAND.siteUrl}/fondateur` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(PERSON_JSONLD) }],
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

const EMPIRE: Array<{ name: string; period: string; key: TKey }> = [
  { name: "De Tomaso Automobili", period: "1959 – 1993", key: "founder.empire.e1" },
  { name: "Carrozzeria Ghia", period: "1967 – 1973", key: "founder.empire.e2" },
  { name: "Carrozzeria Vignale", period: "1969 – 1973", key: "founder.empire.e3" },
  { name: "Moto Guzzi / Benelli", period: "1972 – 1993", key: "founder.empire.e4" },
  { name: "Maserati", period: "1975 – 1993", key: "founder.empire.e5" },
  { name: "Innocenti", period: "1976 – 1990", key: "founder.empire.e6" },
];

function Fondateur() {
  const t = useT();

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <p className="eyebrow">{t("founder.eyebrow")}</p>
      <h1 className="mt-4 font-display text-4xl sm:text-6xl">{t("founder.h1")}</h1>
      <p className="mt-3 font-display text-xl italic text-primary sm:text-2xl">
        {t("founder.subtitle")}
      </p>
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

      <h2 className="mt-16 font-display text-3xl">{t("founder.timeline.title")}</h2>
      <div className="mt-6 border-t border-border">
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

      <h2 className="mt-16 font-display text-3xl">{t("founder.empire.title")}</h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {t("founder.empire.intro")}
      </p>
      <div className="mt-6 overflow-x-auto border border-border">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-secondary/60">
              <th className="border-b border-border px-4 py-3 text-xs uppercase tracking-[0.14em]">
                {t("founder.empire.col1")}
              </th>
              <th className="border-b border-border px-4 py-3 text-xs uppercase tracking-[0.14em]">
                {t("founder.empire.col2")}
              </th>
              <th className="border-b border-border px-4 py-3 text-xs uppercase tracking-[0.14em]">
                {t("founder.empire.col3")}
              </th>
            </tr>
          </thead>
          <tbody>
            {EMPIRE.map((row) => (
              <tr key={row.name} className="align-top">
                <th
                  scope="row"
                  className="border-b border-border px-4 py-4 font-display text-base font-normal"
                >
                  {row.name}
                </th>
                <td className="whitespace-nowrap border-b border-border px-4 py-4 font-mono text-xs text-primary">
                  {row.period}
                </td>
                <td className="border-b border-border px-4 py-4 leading-relaxed text-muted-foreground">
                  {t(row.key)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

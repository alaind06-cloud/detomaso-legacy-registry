import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { marqueQuery } from "@/lib/data";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: `Books & bibliographie — ${BRAND.registerName}` },
      {
        name: "description",
        content:
          "Ouvrages de référence, brochures d'usine et documentation technique consacrés aux automobiles De Tomaso.",
      },
      { property: "og:title", content: `Books & bibliographie — ${BRAND.registerName}` },
      { property: "og:description", content: "La bibliothèque de référence du registre De Tomaso." },
      { property: "og:url", content: `${BRAND.siteUrl}/books` },
    ],
    links: [{ rel: "canonical", href: `${BRAND.siteUrl}/books` }],
  }),
  component: Books,
});

const books = [
  {
    title: "De Tomaso — Un constructeur à Modène",
    detail: "Monographie illustrée retraçant l'aventure industrielle de 1959 à 1993.",
  },
  {
    title: "Pantera — Chassis by Chassis",
    detail: "Recensement des séries Pre-L, L, GTS et GT5 avec relevés d'usine.",
  },
  {
    title: "Ghia & Vignale, les carrossiers",
    detail: "Le rôle des maisons de carrosserie dans la production De Tomaso.",
  },
  {
    title: "Brochures d'usine 1967-1989",
    detail: "Fac-similés des documents commerciaux européens et nord-américains.",
  },
];

function Books() {
  const { data: marque } = useQuery(marqueQuery);

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <p className="eyebrow">Bibliothèque</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{marque?.books_title ?? "Books"}</h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Les sources écrites qui nourrissent le travail du registre. Chaque historique de châssis est
        recoupé avec ces documents, les archives d'usine et les témoignages de propriétaires.
      </p>

      <div className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2">
        {books.map((b) => (
          <article key={b.title} className="bg-background p-8">
            <h2 className="font-display text-xl leading-snug">{b.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.detail}</p>
          </article>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        Une référence manque à cette liste ?{" "}
        <a href={`mailto:${BRAND.contactEmail}`} className="text-primary underline underline-offset-4">
          Signalez-la nous
        </a>
        .
      </p>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";

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
    ],
    links: [{ rel: "canonical", href: `${BRAND.siteUrl}/fondateur` }],
  }),
  component: Fondateur,
});

const timeline = [
  { year: "1928", text: "Naissance d'Alejandro de Tomaso à Buenos Aires." },
  { year: "1955", text: "Départ pour l'Italie ; débuts en compétition au volant de Maserati et OSCA." },
  { year: "1959", text: "Fondation de De Tomaso Automobili à Modène." },
  { year: "1963", text: "Vallelunga : premier modèle de route à moteur central et châssis poutre." },
  { year: "1967", text: "Mangusta, dessinée par Giugiaro chez Ghia — 401 exemplaires." },
  { year: "1971", text: "Pantera : V8 Ford, distribution Lincoln-Mercury aux États-Unis." },
  { year: "1976", text: "Berlines Deauville et coupés Longchamp signés Tom Tjaarda." },
  { year: "1993", text: "Guarà, dernier chapitre de la production artisanale de Modène." },
];

function Fondateur() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <p className="eyebrow">L'expert</p>
      <h1 className="mt-4 font-display text-4xl sm:text-6xl">{BRAND.founder.name}</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        Pilote argentin, industriel italien d'adoption, Alejandro de Tomaso a bâti à Modène une maison
        automobile née d'une obsession : marier la brutalité mécanique américaine à la ligne italienne.
        Ce registre documente châssis par châssis ce que cette obsession a produit.
      </p>

      <div className="mt-16 border-t border-border">
        {timeline.map((t) => (
          <div key={t.year} className="grid gap-4 border-b border-border py-6 sm:grid-cols-[120px_1fr]">
            <span className="font-mono text-sm text-primary">{t.year}</span>
            <p className="text-sm leading-relaxed text-muted-foreground">{t.text}</p>
          </div>
        ))}
      </div>

      <section className="mt-16 border border-border bg-secondary/40 p-8">
        <h2 className="font-display text-2xl">Expertise & authentification</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Le registre accompagne propriétaires, collectionneurs et maisons de vente dans la vérification
          des numéros de châssis, la reconstitution d'historiques et la recherche d'archives d'époque.
          Toute demande d'expertise peut être adressée par courriel.
        </p>
        <a
          href={`mailto:${BRAND.contactEmail}`}
          className="mt-6 inline-flex bg-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground"
        >
          Contacter l'expert
        </a>
      </section>
    </div>
  );
}

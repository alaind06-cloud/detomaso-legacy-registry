import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { booksQuery, marqueQuery } from "@/lib/data";
import { BRAND, BRAND_SLUG } from "@/lib/brand";
import { useT } from "@/lib/i18n";
import type { Book } from "@/lib/types";

const AUTHOR = "Philippe Olczyk";


export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: `Books & bibliographie — ${BRAND.registerName}` },
      {
        name: "description",
        content:
          "Ouvrages de référence signés Philippe Olczyk : histoires officielles, registres de châssis et documentation de course.",
      },
      { property: "og:title", content: `Books & bibliographie — ${BRAND.registerName}` },
      { property: "og:description", content: "La bibliothèque de référence du registre De Tomaso." },
      { property: "og:url", content: `${BRAND.siteUrl}/books` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${BRAND.siteUrl}/books` }],
  }),
  component: Books,
});

function Cover({ book, large = false }: { book: Book; large?: boolean }) {
  const t = useT();
  return (
    <div
      className={`flex items-center justify-center overflow-hidden border border-border bg-secondary ${
        large ? "aspect-[3/4]" : "aspect-[3/4]"
      }`}
    >
      {book.couverture_url ? (
        <img
          src={book.couverture_url}
          alt={`${t("books.cover")} ${book.titre}`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="px-4 text-center font-display text-sm leading-snug text-muted-foreground">
          {book.titre}
        </span>
      )}
    </div>
  );
}


function BookCard({ book, large = false }: { book: Book; large?: boolean }) {
  const content = (
    <>
      <Cover book={book} large={large} />
      <h3 className={`mt-4 font-display leading-snug ${large ? "text-2xl" : "text-base"}`}>{book.titre}</h3>
      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{AUTHOR}</p>
    </>
  );
  return book.lien_achat ? (
    <a href={book.lien_achat} target="_blank" rel="noreferrer" className="group block">
      {content}
    </a>
  ) : (
    <article>{content}</article>
  );
}

function Books() {
  const { data: marque } = useQuery(marqueQuery);
  const { data: books = [], isLoading } = useQuery(booksQuery);
  const t = useT();

  const featured = books.filter((b) => b.marque === BRAND_SLUG);
  const others = books.filter((b) => b.marque !== BRAND_SLUG);
  const brandName = marque?.nom_affichage ?? BRAND.name;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <p className="eyebrow">{t("books.eyebrow")}</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">
        {marque?.books_title ?? t("books.title")}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {t("books.intro", { author: AUTHOR })}
      </p>

      {isLoading && <p className="mt-14 text-sm text-muted-foreground">{t("common.loading")}</p>}

      {featured.length > 0 && (
        <section className="mt-14">
          <h2 className="eyebrow">{t("books.featured", { brand: brandName })}</h2>
          <div className="mt-6 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((b) => (
              <BookCard key={b.id} book={b} large />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-20">
          <h2 className="eyebrow">{t("books.others")}</h2>
          <div className="mt-6 grid gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {others.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-16 text-sm text-muted-foreground">
        {t("books.missing")}{" "}
        <a href={`mailto:${BRAND.contactEmail}`} className="text-primary underline underline-offset-4">
          {t("books.report")}
        </a>
        .
      </p>

    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Administration — ${BRAND.registerName}` },
      { name: "description", content: "L'administration du registre est centralisée sur registerbizzarrini.com." },
      { property: "og:title", content: `Administration — ${BRAND.registerName}` },
      { property: "og:description", content: "L'administration du registre est centralisée sur registerbizzarrini.com." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUnavailable,
});

const CENTRAL_ADMIN_URL = "https://registerbizzarrini.com/admin";

function AdminUnavailable() {
  const t = useT();

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">{t("adminUnavailable.eyebrow")}</p>
        <h1 className="mt-3 font-display text-3xl">{t("adminUnavailable.title")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("adminUnavailable.text")}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={CENTRAL_ADMIN_URL}
            className="bg-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("adminUnavailable.cta")}
          </a>
          <Link
            to="/"
            className="border border-border px-6 py-3 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-accent"
          >
            {t("adminUnavailable.home")}
          </Link>
        </div>
      </div>
    </div>
  );
}

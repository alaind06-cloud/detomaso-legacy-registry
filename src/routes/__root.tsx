import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  Link,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { BRAND } from "@/lib/brand";
import { I18nProvider, useT } from "@/lib/i18n";

function NotFoundComponent() {
  const t = useT();
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">{t("notFound.eyebrow")}</p>
        <h1 className="mt-3 font-display text-4xl">{t("notFound.title")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("notFound.text")}</p>
        <Link
          to="/"
          className="mt-8 inline-flex bg-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground"
        >
          {t("notFound.cta")}
        </Link>
      </div>
    </div>
  );
}


function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Cette page n'a pas pu se charger</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-primary-foreground"
          >
            Réessayer
          </button>
          <a href="/" className="border border-border px-5 py-2.5 text-xs uppercase tracking-[0.18em]">
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${BRAND.registerName} — Registre mondial des châssis` },
      { name: "description", content: BRAND.baseline },
      { property: "og:site_name", content: BRAND.registerName },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "VImV60vgivrV0KuInmcOKQb8NAa4P6tabW7h6Z2pRvA" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://darckkyqmzningzzbkhr.supabase.co" },
      {
        rel: "preconnect",
        href: "https://pub-5d4df75020194b5d8aaf953bd0696401.r2.dev",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/bodoni-moda-latin.woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/jost-latin.woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const bare = pathname.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            {!bare && <Header />}
            <main className="flex-1">
              {/* Required: nested routes render here. */}
              <Outlet />
            </main>
            {!bare && <Footer />}
          </div>
          <Toaster position="top-right" />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );

}

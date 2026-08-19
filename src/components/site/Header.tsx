import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useT, type TKey } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";

const NAV: Array<{ to: string; key: TKey }> = [
  { to: "/", key: "nav.registry" },
  { to: "/alejandro-de-tomaso", key: "nav.founder" },
  { to: "/videos", key: "nav.videos" },
  { to: "/books", key: "nav.books" },
];

export function Header() {
  const { user, isMember } = useAuth();
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5">
        <Link to="/" className="group flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-[0.2em] uppercase">{BRAND.name}</span>
          <span className="hidden eyebrow sm:inline">{t("nav.registerLabel")}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {user ? (
            <>
              {!isMember && (
                <Link
                  to="/auth"
                  className="bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t("nav.requestAccess")}
                </Link>
              )}
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="border border-border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-accent"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("nav.member")}
            </Link>
          )}
        </div>



        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher />
          {!user && (
            <Link
              to="/auth"
              className="bg-primary px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] text-primary-foreground"
            >
              {t("nav.member")}
            </Link>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={t("nav.menu")}
            aria-expanded={open}
            className="p-1"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div className={cn("border-t border-border md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-7xl flex-col px-5 py-3">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2.5 text-sm">
              {t(n.key)}
            </Link>
          ))}
          {user ? (
            <button
              onClick={async () => {
                setOpen(false);
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="py-2.5 text-left text-sm text-primary"
            >
              {t("nav.logout")}
            </button>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)} className="py-2.5 text-sm text-primary">
              {t("nav.member")}
            </Link>
          )}
        </nav>
      </div>

    </header>
  );
}

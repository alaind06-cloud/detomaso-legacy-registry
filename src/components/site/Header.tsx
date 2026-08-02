import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Registre" },
  { to: "/fondateur", label: "Alejandro" },
  { to: "/videos", label: "Vidéos" },
  { to: "/books", label: "Books" },
] as const;

export function Header() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5">
        <Link to="/" className="group flex items-baseline gap-3">
          <span className="font-display text-2xl tracking-[0.2em] uppercase">{BRAND.name}</span>
          <span className="hidden eyebrow sm:inline">Register</span>
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
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAdmin && (
            <Link to="/admin" className="eyebrow hover:text-foreground">
              Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="border border-border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors hover:bg-accent"
            >
              Déconnexion
            </button>
          ) : (
            <Link
              to="/auth"
              className="bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Espace membre
            </Link>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className={cn("border-t border-border md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-7xl flex-col px-5 py-3">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2.5 text-sm">
              {n.label}
            </Link>
          ))}
          <Link to="/auth" onClick={() => setOpen(false)} className="py-2.5 text-sm text-primary">
            Espace membre
          </Link>
        </nav>
      </div>
    </header>
  );
}

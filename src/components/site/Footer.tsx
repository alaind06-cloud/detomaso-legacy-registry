import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl tracking-[0.2em] uppercase">{BRAND.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{BRAND.baseline}</p>
        </div>
        <div>
          <p className="eyebrow">Registre</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-foreground">
                Catalogue des châssis
              </Link>
            </li>
            <li>
              <Link to="/fondateur" className="hover:text-foreground">
                Alejandro de Tomaso
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Archives</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/videos" className="hover:text-foreground">
                Vidéos
              </Link>
            </li>
            <li>
              <Link to="/books" className="hover:text-foreground">
                Books
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">Accès</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Espace membre
              </Link>
            </li>
            <li>
              <a href={`mailto:${BRAND.contactEmail}`} className="hover:text-foreground">
                {BRAND.contactEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {BRAND.registerName}
          </span>
          <span>Registre indépendant — non affilié au constructeur.</span>
        </div>
      </div>
    </footer>
  );
}

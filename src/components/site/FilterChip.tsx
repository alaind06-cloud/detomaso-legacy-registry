import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center border px-4 py-1.5 text-[0.72rem] tracking-[0.2em] uppercase transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

export type ActivePill = { key: string; label: string; value: string; onRemove: () => void };

export function ActivePills({ pills }: { pills: ActivePill[] }) {
  if (pills.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-1">Filtres actifs</span>
      {pills.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={p.onRemove}
          aria-label={`Retirer le filtre ${p.label} : ${p.value}`}
          className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-1 text-xs transition-colors hover:border-primary hover:bg-primary/20"
        >
          <span className="tracking-[0.18em] text-primary uppercase">{p.label}</span>
          <span className="font-medium">{p.value}</span>
          <span aria-hidden className="text-foreground/60">
            ×
          </span>
        </button>
      ))}
    </div>
  );
}

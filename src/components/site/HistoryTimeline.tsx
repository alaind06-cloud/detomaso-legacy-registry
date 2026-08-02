import { parseHistory, type TimelineEntry } from "@/lib/chassis-specs";

export function HistoryTimeline({
  description,
  mode,
  modele,
  annee,
  chassis,
}: {
  description?: string | null;
  mode: "summary" | "full";
  modele?: string | null;
  annee?: string | null;
  chassis?: string | null;
}) {
  const all: TimelineEntry[] = description?.trim() ? parseHistory(description) : [];

  if (all.length === 0) {
    return (
      <div className="max-w-3xl border-l-2 border-primary/60 py-2 pl-5 leading-relaxed text-foreground/80">
        <p>
          {modele ?? "De Tomaso"}
          {annee ? ` · ${annee}` : ""}
          {chassis ? ` · châssis ${chassis}` : ""}.
        </p>
        <p className="mt-3 text-sm text-muted-foreground italic">
          Historique en cours de documentation. Les archives du registre sont enrichies en continu.
        </p>
      </div>
    );
  }

  const entries =
    mode === "summary"
      ? all.filter((e) => e.year).map((e) => ({ ...e, events: e.events.slice(0, 1) }))
      : all;
  const list = entries.length ? entries : all;

  return (
    <div className="relative max-w-4xl">
      <div className="absolute top-3 bottom-3 left-[15px] w-px bg-border md:left-[19px]" aria-hidden="true" />
      <ol className="space-y-6">
        {list.map((entry, i) => (
          <li key={i} className="relative pl-10 md:pl-14">
            <span className="absolute top-1 left-0 grid size-8 place-items-center rounded-full border border-border bg-secondary md:size-10">
              <span className="size-2.5 rounded-full bg-primary md:size-3" />
            </span>
            {entry.year && (
              <p className="font-mono text-sm tracking-[0.14em] text-primary">{entry.year}</p>
            )}
            <div className="mt-2 space-y-2">
              {entry.events.map((ev, j) => (
                <p key={j} className="leading-relaxed text-foreground/85">
                  {ev.key && (
                    <span className="mr-2 text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">
                      {ev.key}
                    </span>
                  )}
                  {ev.value}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

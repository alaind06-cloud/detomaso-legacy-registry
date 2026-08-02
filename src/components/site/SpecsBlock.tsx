import { SPEC_GROUPS, type SpecKey } from "@/lib/chassis-specs";
import { useT, type TKey } from "@/lib/i18n";

export function SpecsBlock({ specs }: { specs: Partial<Record<SpecKey, string>> }) {
  const t = useT();

  const groups = SPEC_GROUPS.map((g) => ({
    ...g,
    fields: g.keys.filter((k) => (specs[k] ?? "").trim().length > 0),
  })).filter((g) => g.fields.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="border border-border bg-card/70 p-6 sm:p-7">
      <p className="eyebrow">{t("specs.title")}</p>

      <div className="mt-6 space-y-7">
        {groups.map((group) => (
          <section key={group.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[0.65rem] tracking-[0.2em] whitespace-nowrap text-foreground/70 uppercase">
                {t(`specs.group.${group.id}` as TKey)}
              </h3>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>
            <dl className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
              {group.fields.map((key) => (
                <div key={key} className="flex flex-col gap-1">
                  <dt className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">
                    {t(`spec.${key}` as TKey)}
                  </dt>
                  <dd className="text-[0.95rem] leading-snug font-medium">{specs[key]}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}

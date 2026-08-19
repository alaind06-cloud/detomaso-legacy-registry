import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, BRAND_SLUG } from "@/lib/brand";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `Espace membre — ${BRAND.registerName}` },
      {
        name: "description",
        content:
          "Connexion et demande d'adhésion au registre De Tomaso. L'accès aux historiques détaillés est réservé aux membres validés.",
      },
      { property: "og:title", content: `Espace membre — ${BRAND.registerName}` },
      { property: "og:description", content: "Rejoignez le registre des châssis De Tomaso." },
      { property: "og:url", content: `${BRAND.siteUrl}/auth` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const MOTIVATION_MIN_LENGTH = 30;

function AuthPage() {
  const navigate = useNavigate();
  const { user, profil, isMember, refresh } = useAuth();
  const t = useT();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    telephone: "",
    raison: "",
  });

  useEffect(() => {
    if (user && isMember) navigate({ to: "/" });
  }, [user, isMember, navigate]);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup") {
      const raisonTrim = form.raison.trim();
      if (raisonTrim.length < MOTIVATION_MIN_LENGTH) {
        toast.error(t("auth.reason.tooShort", { min: String(MOTIVATION_MIN_LENGTH) }));
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        await refresh();
        toast.success(t("auth.toast.loggedIn"));
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { marque: BRAND_SLUG },
          },
        });
        if (error) throw error;
        if (data.user) {
          const { error: pErr } = await supabase.from("profils").insert({
            id: data.user.id,
            marque: BRAND_SLUG,
            email: form.email.trim(),
            nom: form.nom.trim(),
            prenom: form.prenom.trim(),
            telephone: form.telephone.trim(),
            raison: form.raison.trim(),
            statut: "en_attente",
          });
          if (pErr) console.error(pErr);
        }
        setSent(true);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <Shell title={t("auth.sent.title")}>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("auth.sent.text")}</p>
      </Shell>
    );
  }

  if (user && profil && !isMember) {
    return (
      <Shell title={t("auth.pending.title")}>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("auth.pending.text")}</p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            await refresh();
          }}
          className="mt-6 border border-border px-5 py-2.5 text-xs uppercase tracking-[0.18em]"
        >
          {t("auth.signout")}
        </button>
      </Shell>
    );
  }

  return (
    <Shell title={mode === "login" ? t("auth.login") : t("auth.signupTitle")}>
      <form onSubmit={submit} className="space-y-5">
        {mode === "signup" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("auth.firstname")}
                value={form.prenom}
                onChange={(v) => set("prenom", v)}
                required
              />
              <Field
                label={t("auth.lastname")}
                value={form.nom}
                onChange={(v) => set("nom", v)}
                required
              />
            </div>
            <Field
              label={t("auth.phone")}
              value={form.telephone}
              onChange={(v) => set("telephone", v)}
              required
            />
            <label className="block">
              <span className="eyebrow">{t("auth.reason", { brand: BRAND.name })}</span>
              <textarea
                value={form.raison}
                onChange={(e) => set("raison", e.target.value)}
                onInvalid={(e) => {
                  const el = e.currentTarget;
                  if (el.validity.tooShort) {
                    el.setCustomValidity(
                      t("auth.reason.tooShort", {
                        min: String(MOTIVATION_MIN_LENGTH),
                        brand: BRAND.name,
                      })
                    );
                  } else {
                    el.setCustomValidity("");
                  }
                }}
                onInput={(e) => e.currentTarget.setCustomValidity("")}
                rows={5}
                required
                minLength={MOTIVATION_MIN_LENGTH}
                maxLength={1000}
                placeholder={t("auth.reason.placeholder", { brand: BRAND.name })}
                className="mt-2 w-full border border-input bg-card p-3 text-sm outline-none focus:border-primary"
              />
              <span className="mt-1 block text-xs text-muted-foreground">
                {t("auth.reason.hint", { min: String(MOTIVATION_MIN_LENGTH) })}
              </span>
            </label>
          </>
        )}
        <Field
          label={t("auth.email")}
          type="email"
          value={form.email}
          onChange={(v) => set("email", v)}
          required
        />
        <Field
          label={t("auth.password")}
          type="password"
          value={form.password}
          onChange={(v) => set("password", v)}
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-primary py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "…" : mode === "login" ? t("auth.tab.login") : t("auth.createAccount")}
        </button>
      </form>

      <div className="mt-7 border-t border-border pt-5 text-center">
        {mode === "login" ? (
          <>
            <p className="text-sm text-muted-foreground">
              {t("auth.notMember")}{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-primary underline underline-offset-4"
              >
                {t("auth.askAccess")}
              </button>
            </p>
            <button
              onClick={async () => {
                if (!form.email.trim()) {
                  toast.error(t("auth.toast.needEmail"));
                  return;
                }
                const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
                  redirectTo: `${BRAND.siteUrl}/reset-password`,
                });
                if (error) toast.error(error.message);
                else toast.success(t("auth.toast.resetSent"));
              }}
              className="mt-3 text-xs text-muted-foreground underline underline-offset-4"
            >
              {t("auth.forgot")}
            </button>
          </>
        ) : (
          <button
            onClick={() => setMode("login")}
            className="text-sm text-primary underline underline-offset-4"
          >
            ← {t("auth.backToLogin")}
          </button>
        )}
      </div>
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <div className="mx-auto max-w-lg px-5 py-20">
      <p className="eyebrow text-center">{t("auth.eyebrow")}</p>
      <h1 className="mt-3 mb-8 text-center font-display text-4xl">{title}</h1>
      <div className="border border-border bg-card/40 p-8 sm:p-10">{children}</div>
      <p className="mt-4 text-center text-xs italic text-muted-foreground">
        {t("auth.note")}{" "}
        <Link to="/" className="underline underline-offset-4">
          {t("auth.backToRegistry")}
        </Link>
      </p>
    </div>
  );
}


function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        maxLength={255}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full border border-input bg-card px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

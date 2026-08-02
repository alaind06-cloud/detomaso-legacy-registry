import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, BRAND_SLUG } from "@/lib/brand";
import { useAuth } from "@/hooks/useAuth";

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

const RAISONS = [
  "Propriétaire d'une De Tomaso",
  "Ancien propriétaire",
  "Passionné / collectionneur",
  "Historien / chercheur",
  "Professionnel de l'automobile",
  "Autre",
] as const;

function AuthPage() {
  const navigate = useNavigate();
  const { user, profil, isMember, refresh } = useAuth();
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
    precision: "",
  });

  useEffect(() => {
    if (user && isMember) navigate({ to: "/" });
  }, [user, isMember, navigate]);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        await refresh();
        toast.success("Connexion réussie");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: { emailRedirectTo: window.location.origin },
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
            raison:
              form.raison === "Autre" && form.precision.trim()
                ? `Autre — ${form.precision.trim()}`
                : form.raison.trim(),
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
      <Shell title="Demande enregistrée">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Confirmez votre adresse via le courriel qui vient de vous être envoyé. Votre demande sera
          ensuite examinée par l'équipe du registre — vous serez averti dès sa validation.
        </p>
      </Shell>
    );
  }

  if (user && profil && !isMember) {
    return (
      <Shell title="Demande en cours d'examen">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Votre compte est créé mais n'est pas encore validé par un administrateur. Les historiques
          détaillés des châssis seront accessibles dès validation.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            await refresh();
          }}
          className="mt-6 border border-border px-5 py-2.5 text-xs uppercase tracking-[0.18em]"
        >
          Se déconnecter
        </button>
      </Shell>
    );
  }

  return (
    <Shell title={mode === "login" ? "Connexion" : "Demande d'adhésion"}>
      <div className="mb-8 flex gap-2">
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`border px-4 py-2 text-[11px] uppercase tracking-[0.18em] ${
              mode === m ? "border-primary bg-primary text-primary-foreground" : "border-border"
            }`}
          >
            {m === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" value={form.prenom} onChange={(v) => set("prenom", v)} required />
            <Field label="Nom" value={form.nom} onChange={(v) => set("nom", v)} required />
          </div>
        )}
        <Field
          label="Adresse e-mail"
          type="email"
          value={form.email}
          onChange={(v) => set("email", v)}
          required
        />
        <Field
          label="Mot de passe"
          type="password"
          value={form.password}
          onChange={(v) => set("password", v)}
          required
        />
        {mode === "signup" && (
          <>
            <Field label="Téléphone" value={form.telephone} onChange={(v) => set("telephone", v)} />
            <label className="block">
              <span className="eyebrow">Raison de la demande</span>
              <select
                value={form.raison}
                onChange={(e) => set("raison", e.target.value)}
                required
                className="mt-2 h-11 w-full border border-input bg-card px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Sélectionnez une option…</option>
                {RAISONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            {form.raison === "Autre" && (
              <label className="block">
                <span className="eyebrow">Précisez</span>
                <textarea
                  value={form.precision}
                  onChange={(e) => set("precision", e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="mt-2 w-full border border-input bg-card p-3 text-sm outline-none focus:border-primary"
                />
              </label>
            )}
          </>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-primary py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60"
        >
          {busy ? "…" : mode === "login" ? "Entrer" : "Envoyer la demande"}
        </button>
      </form>

      {mode === "login" && (
        <button
          onClick={async () => {
            if (!form.email.trim()) {
              toast.error("Renseignez votre e-mail d'abord");
              return;
            }
            const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) toast.error(error.message);
            else toast.success("Courriel de réinitialisation envoyé");
          }}
          className="mt-5 text-xs text-muted-foreground underline underline-offset-4"
        >
          Mot de passe oublié ?
        </button>
      )}
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <p className="eyebrow">Registre privé</p>
      <h1 className="mt-3 mb-8 font-display text-4xl">{title}</h1>
      {children}
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

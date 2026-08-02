import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: `Nouveau mot de passe — ${BRAND.registerName}` },
      { name: "description", content: "Définissez un nouveau mot de passe pour votre compte membre." },
      { property: "og:title", content: `Nouveau mot de passe — ${BRAND.registerName}` },
      { property: "og:description", content: "Réinitialisation du mot de passe membre." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const t = useT();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error(t("reset.tooShort"));
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("reset.updated"));
    navigate({ to: "/" });
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <p className="eyebrow">{t("reset.eyebrow")}</p>
      <h1 className="mt-3 mb-8 font-display text-4xl">{t("reset.title")}</h1>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="eyebrow">{t("auth.password")}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 h-11 w-full border border-input bg-card px-3 text-sm outline-none focus:border-primary"
            required
          />
        </label>
        <button
          disabled={busy}
          className="w-full bg-primary py-3.5 text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60"
        >
          {t("reset.save")}
        </button>
      </form>
    </div>
  );
}

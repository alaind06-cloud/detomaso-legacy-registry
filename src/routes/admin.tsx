import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Languages, Lock, RotateCw, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { detailsQuery, marquesQuery, photosQuery, profilsQuery, voituresQuery } from "@/lib/data";
import { photoUrl } from "@/lib/media";
import { BRAND, BRAND_SLUG } from "@/lib/brand";
import { translateHistory } from "@/lib/translate.functions";
import type { Photo, Voiture } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Administration — ${BRAND.registerName}` },
      { name: "description", content: "Console d'administration du registre De Tomaso." },
      { property: "og:title", content: `Administration — ${BRAND.registerName}` },
      { property: "og:description", content: "Console d'administration réservée." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type Tab = "membres" | "chassis" | "fiche";

function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading, user } = useAuth();
  const [tab, setTab] = useState<Tab>("membres");
  const [selected, setSelected] = useState<Voiture | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/auth" });
  }, [loading, isAdmin, navigate]);

  if (loading) return <div className="p-10 eyebrow">Vérification…</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-baseline gap-4">
            <Link to="/" className="font-display text-lg tracking-[0.15em] uppercase">
              {BRAND.name}
            </Link>
            <span className="eyebrow">Administration</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{user?.email}</span>
            <button
              onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/" }))}
              className="border border-border px-3 py-1.5 uppercase tracking-[0.16em]"
            >
              Quitter
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-6 px-5">
          {(
            [
              ["membres", "Membres"],
              ["chassis", "Châssis & ordre"],
              ["fiche", "Fiche & historiques"],
            ] as [Tab, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "-mb-px border-b-2 py-3 text-xs uppercase tracking-[0.16em]",
                tab === k ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10">
        {tab === "membres" && <Membres />}
        {tab === "chassis" && (
          <Chassis
            onEdit={(v) => {
              setSelected(v);
              setTab("fiche");
            }}
          />
        )}
        {tab === "fiche" && <Fiche voiture={selected} onPick={setSelected} />}
      </main>
    </div>
  );
}

/* ---------------- Membres ---------------- */

function Membres() {
  const qc = useQueryClient();
  const { data: profils = [], isLoading } = useQuery(profilsQuery);
  const { data: marques = [] } = useQuery(marquesQuery);
  const [marqueFilter, setMarqueFilter] = useState<string>("all");

  const marqueMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of marques) map.set(m.slug, m.nom_affichage ?? m.slug);
    return map;
  }, [marques]);

  const filtered = useMemo(() => {
    if (marqueFilter === "all") return profils;
    return profils.filter((p) => p.marque === marqueFilter);
  }, [profils, marqueFilter]);

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from("profils").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profils", BRAND_SLUG] });
      toast.success("Membre mis à jour");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading) return <p className="eyebrow">Chargement…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="marque-filter" className="eyebrow">
          Filtrer par marque
        </label>
        <select
          id="marque-filter"
          value={marqueFilter}
          onChange={(e) => setMarqueFilter(e.target.value)}
          className="h-9 border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="all">Toutes les marques</option>
          {marques.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.nom_affichage ?? m.slug}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} membre(s)</span>
      </div>

      <div className="border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {["Membre", "Contact", "Marque", "Motivation", "Statut", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 eyebrow">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/70 align-top">
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {p.prenom} {p.nom}
                  </div>
                  {p.est_admin && <span className="text-xs text-primary">Administrateur</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div>{p.email}</div>
                  <div>{p.telephone}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {marqueMap.get(p.marque) ?? p.marque}
                </td>
                <td className="max-w-xs px-4 py-3 text-muted-foreground">{p.raison}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "px-2 py-1 text-xs",
                      p.statut === "valide" && "bg-primary/10 text-primary",
                      p.statut === "en_attente" && "bg-muted text-muted-foreground",
                      p.statut === "refuse" && "bg-destructive/10 text-destructive",
                    )}
                  >
                    {p.statut}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => update.mutate({ id: p.id, patch: { statut: "valide" } })}
                      className="bg-primary px-3 py-1.5 text-xs text-primary-foreground"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => update.mutate({ id: p.id, patch: { statut: "refuse" } })}
                      className="border border-border px-3 py-1.5 text-xs"
                    >
                      Refuser
                    </button>
                    <button
                      onClick={() => update.mutate({ id: p.id, patch: { est_admin: !p.est_admin } })}
                      className="border border-border px-3 py-1.5 text-xs"
                    >
                      {p.est_admin ? "Retirer admin" : "Nommer admin"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-6 text-sm text-muted-foreground">Aucun membre.</p>}
      </div>
    </div>
  );
}

/* ---------------- Châssis & ordre ---------------- */

function Chassis({ onEdit }: { onEdit: (v: Voiture) => void }) {
  const { data: voitures = [] } = useQuery(voituresQuery);
  const [creating, setCreating] = useState(false);

  // NOTE : le glisser-déposer est temporairement verrouillé car l'ordre actuel
  // (ordre_affichage) a été validé. Pour réactiver, restaurer DndContext +
  // SortableContext + useSortable dans la liste ci-dessous.
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl">{voitures.length} châssis</h2>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            Ordre verrouillé
          </span>
          <button
            onClick={() => setCreating((c) => !c)}
            className="border border-border bg-background px-4 py-2 text-xs uppercase tracking-[0.16em]"
          >
            {creating ? "Annuler" : "Ajouter un châssis"}
          </button>
        </div>
      </div>

      {creating && <NewChassis onDone={() => setCreating(false)} />}

      <p className="mb-4 text-sm text-muted-foreground">
        La réorganisation du catalogue est temporairement verrouillée. L'ordre affiché ci-dessous
        correspond à l'ordre validé du site d'origine.
      </p>

      <ul className="space-y-2">
        {voitures.map((v) => (
          <ReadOnlyRow key={v.id} voiture={v} onEdit={onEdit} />
        ))}
      </ul>
    </div>
  );
}

function ReadOnlyRow({ voiture, onEdit }: { voiture: Voiture; onEdit: (v: Voiture) => void }) {
  return (
    <li className="flex items-center gap-4 border border-border bg-background p-3">
      <span className="text-muted-foreground/60">
        <Lock className="size-4" />
      </span>
      <div className="size-14 shrink-0 overflow-hidden bg-muted">
        {voiture.cover_photo && (
          <img
            src={photoUrl(voiture.storage_path, voiture.cover_photo)}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg">{voiture.titre ?? voiture.modele}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {voiture.chassis} · {voiture.annee}
        </p>
      </div>
      <button
        onClick={() => onEdit(voiture)}
        className="border border-border px-3 py-1.5 text-xs uppercase tracking-[0.16em]"
      >
        Éditer
      </button>
    </li>
  );
}

function NewChassis({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ titre: "", modele: "", annee: "", chassis: "", slug: "", storage_path: "" });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("voitures").insert({
        marque: BRAND_SLUG,
        titre: f.titre,
        modele: f.modele,
        annee: f.annee,
        chassis: f.chassis,
        slug: f.slug || f.chassis.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        storage_path: f.storage_path,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voitures", BRAND_SLUG] });
      toast.success("Châssis créé");
      onDone();
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate();
      }}
      className="mb-6 grid gap-4 border border-border bg-background p-5 sm:grid-cols-3"
    >
      {(
        [
          ["titre", "Titre"],
          ["modele", "Modèle"],
          ["annee", "Année"],
          ["chassis", "N° de châssis"],
          ["slug", "Slug (optionnel)"],
          ["storage_path", "Dossier photos (ex: pantera/1234/)"],
        ] as const
      ).map(([k, label]) => (
        <label key={k} className="block">
          <span className="eyebrow">{label}</span>
          <input
            value={f[k]}
            onChange={(e) => setF((s) => ({ ...s, [k]: e.target.value }))}
            className="mt-2 h-10 w-full border border-input bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </label>
      ))}
      <div className="sm:col-span-3">
        <button className="bg-primary px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-primary-foreground">
          Créer
        </button>
      </div>
    </form>
  );
}

/* ---------------- Fiche : photos + historiques ---------------- */

function Fiche({ voiture, onPick }: { voiture: Voiture | null; onPick: (v: Voiture) => void }) {
  const { data: voitures = [] } = useQuery(voituresQuery);

  if (!voiture) {
    return (
      <div>
        <h2 className="font-display text-2xl">Choisir un châssis</h2>
        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {voitures.map((v) => (
            <button
              key={v.id}
              onClick={() => onPick(v)}
              className="border border-border bg-background p-3 text-left"
            >
              <p className="font-display">{v.titre ?? v.modele}</p>
              <p className="font-mono text-xs text-muted-foreground">{v.chassis}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl">{voiture.titre ?? voiture.modele}</h2>
        <button onClick={() => onPick(null as unknown as Voiture)} className="eyebrow">
          Changer de châssis
        </button>
      </div>
      <PhotoManager voiture={voiture} />
      <HistoryEditor voiture={voiture} />
    </div>
  );
}

function PhotoManager({ voiture }: { voiture: Voiture }) {
  const qc = useQueryClient();
  const { data: photos = [] } = useQuery(photosQuery(voiture.id));
  const [items, setItems] = useState<Photo[]>([]);
  const [edit, setEdit] = useState<Photo | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => setItems(photos), [photos]);

  const saveOrder = useMutation({
    mutationFn: async (list: Photo[]) => {
      for (let i = 0; i < list.length; i++) {
        const { error } = await supabase
          .from("photos")
          .update({ ordre: i + 1 })
          .eq("id", list[i]!.id);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photos", voiture.id] });
      toast.success("Ordre des photos enregistré");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const setCover = useMutation({
    mutationFn: async (filename: string) => {
      const { error } = await supabase
        .from("voitures")
        .update({ cover_photo: filename })
        .eq("id", voiture.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voitures", BRAND_SLUG] });
      toast.success("Photo de couverture définie");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="eyebrow">Photos — glisser pour réordonner</h3>
        <button
          onClick={() => saveOrder.mutate(items)}
          className="bg-primary px-4 py-2 text-xs uppercase tracking-[0.16em] text-primary-foreground"
        >
          Enregistrer l'ordre
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return;
          setItems((list) =>
            arrayMove(
              list,
              list.findIndex((p) => p.id === active.id),
              list.findIndex((p) => p.id === over.id),
            ),
          );
        }}
      >
        <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((p) => (
              <SortablePhoto
                key={p.id}
                photo={p}
                voiture={voiture}
                isCover={voiture.cover_photo === p.filename}
                onCover={() => setCover.mutate(p.filename)}
                onEdit={() => setEdit(p)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {edit && <PhotoEditor photo={edit} voiture={voiture} onClose={() => setEdit(null)} />}
    </section>
  );
}

function SortablePhoto({
  photo,
  voiture,
  isCover,
  onCover,
  onEdit,
}: {
  photo: Photo;
  voiture: Voiture;
  isCover: boolean;
  onCover: () => void;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: photo.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="border border-border bg-background"
    >
      <div className="relative aspect-square bg-muted" {...attributes} {...listeners}>
        <img
          src={photoUrl(voiture.storage_path, photo.filename)}
          alt=""
          loading="lazy"
          className="size-full cursor-grab object-cover"
        />
        {isCover && (
          <span className="absolute top-1 left-1 bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">
            Couverture
          </span>
        )}
      </div>
      <div className="flex gap-1 p-1">
        <button onClick={onCover} className="flex-1 border border-border py-1 text-[10px] uppercase">
          Couverture
        </button>
        <button onClick={onEdit} className="flex-1 border border-border py-1 text-[10px] uppercase">
          Retoucher
        </button>
      </div>
    </li>
  );
}

function PhotoEditor({
  photo,
  voiture,
  onClose,
}: {
  photo: Photo;
  voiture: Voiture;
  onClose: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 100, h: 100 });

  function download() {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const sw = (img.width * crop.w) / 100;
      const sh = (img.height * crop.h) / 100;
      const sx = (img.width * crop.x) / 100;
      const sy = (img.height * crop.y) / 100;
      const swap = rotation % 180 !== 0;
      const canvas = document.createElement("canvas");
      canvas.width = swap ? sh : sw;
      canvas.height = swap ? sw : sh;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = photo.filename;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success("Image retouchée téléchargée — remplacez le fichier dans le stockage");
      }, "image/jpeg", 0.92);
    };
    img.onerror = () => toast.error("Image inaccessible (CORS du stockage)");
    img.src = photoUrl(voiture.storage_path, photo.filename);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="max-h-full w-full max-w-3xl overflow-auto bg-background p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-xl">Retouche — {photo.filename}</h4>
          <button onClick={onClose} className="eyebrow">
            Fermer
          </button>
        </div>

        <div className="mt-5 overflow-hidden bg-muted">
          <img
            src={photoUrl(voiture.storage_path, photo.filename)}
            alt=""
            style={{
              transform: `rotate(${rotation}deg)`,
              clipPath: `inset(${crop.y}% ${100 - crop.x - crop.w}% ${100 - crop.y - crop.h}% ${crop.x}%)`,
            }}
            className="mx-auto max-h-[50vh] transition-transform"
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="flex items-center justify-center gap-2 border border-border py-2.5 text-xs uppercase tracking-[0.16em]"
          >
            <RotateCw className="size-4" /> Rotation 90°
          </button>
          <button
            onClick={download}
            className="bg-primary py-2.5 text-xs uppercase tracking-[0.16em] text-primary-foreground"
          >
            Exporter l'image retouchée
          </button>
          {(
            [
              ["x", "Recadrage gauche"],
              ["y", "Recadrage haut"],
              ["w", "Largeur"],
              ["h", "Hauteur"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="block">
              <span className="eyebrow">
                {label} — {crop[k]}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={crop[k]}
                onChange={(e) => setCrop((c) => ({ ...c, [k]: Number(e.target.value) }))}
                className="mt-2 w-full accent-primary"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryEditor({ voiture }: { voiture: Voiture }) {
  const qc = useQueryClient();
  const { data: details } = useQuery(detailsQuery(voiture.id));
  const [fr, setFr] = useState("");
  const [en, setEn] = useState("");
  const [it, setIt] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    setFr(details?.description_fr ?? details?.description ?? "");
    setEn(details?.description_en ?? "");
    setIt(details?.description_it ?? "");
  }, [details]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("voiture_details").upsert(
        {
          voiture_id: voiture.id,
          description_fr: fr,
          description_en: en,
          description_it: it,
        },
        { onConflict: "voiture_id" },
      );
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["details", voiture.id] });
      toast.success("Historiques enregistrés");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  async function translate(target: "en" | "it") {
    if (!fr.trim()) {
      toast.error("Rédigez d'abord l'historique en français");
      return;
    }
    setBusy(target);
    try {
      const res = await translateHistory({ data: { text: fr, target } });
      if (target === "en") setEn(res.text);
      else setIt(res.text);
      toast.success("Traduction générée");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const fields = useMemo(
    () =>
      [
        ["Français (source)", fr, setFr, null],
        ["English", en, setEn, "en"],
        ["Italiano", it, setIt, "it"],
      ] as [string, string, (v: string) => void, "en" | "it" | null][],
    [fr, en, it],
  );

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="eyebrow">Historiques multilingues</h3>
        <button
          onClick={() => save.mutate()}
          className="bg-primary px-4 py-2 text-xs uppercase tracking-[0.16em] text-primary-foreground"
        >
          Enregistrer
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {fields.map(([label, value, setter, target]) => (
          <div key={label} className="border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{label}</span>
              {target && (
                <button
                  onClick={() => translate(target)}
                  disabled={busy === target}
                  className="flex items-center gap-1.5 text-xs text-primary disabled:opacity-50"
                >
                  {busy === target ? (
                    <Sparkles className="size-3.5 animate-pulse" />
                  ) : (
                    <Languages className="size-3.5" />
                  )}
                  Traduire par IA
                </button>
              )}
            </div>
            <textarea
              value={value}
              onChange={(e) => setter(e.target.value)}
              rows={16}
              className="mt-3 w-full resize-y border border-input bg-card p-3 text-sm outline-none focus:border-primary"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

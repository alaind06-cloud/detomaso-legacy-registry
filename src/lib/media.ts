/**
 * Les fichiers photo sont stockés sur un bucket objet (R2) commun.
 * `voitures.storage_path` contient le dossier (terminé par "/"),
 * `photos.filename` le nom du fichier.
 */
export const MEDIA_BASE_URL = (
  import.meta.env["VITE_MEDIA_BASE_URL"] ?? "https://pub-5d4df75020194b5d8aaf953bd0696401.r2.dev"
).replace(/\/$/, "");

/** Encode chaque segment (les dossiers contiennent des espaces, points, etc.). */
function encodePath(path: string) {
  return path
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/");
}

export function photoUrl(storagePath: string | null | undefined, filename: string | null | undefined) {
  if (!filename) return "";
  const dir = (storagePath ?? "").replace(/^\//, "");
  const full = `${dir}${filename}`;
  return `${MEDIA_BASE_URL}/${encodePath(full)}`;
}

/** Même chemin, extension .webp (une variante WebP existe pour chaque photo). */
export function webpUrl(storagePath: string | null | undefined, filename: string | null | undefined) {
  if (!filename) return "";
  return photoUrl(storagePath, filename.replace(/\.(jpe?g|png)$/i, "") + ".webp");
}

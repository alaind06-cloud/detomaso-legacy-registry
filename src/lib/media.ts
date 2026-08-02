/**
 * Les fichiers photo sont stockés sur un bucket objet (R2) commun.
 * `voitures.storage_path` contient le dossier (terminé par "/"),
 * `photos.filename` le nom du fichier.
 */
export const MEDIA_BASE_URL = (
  import.meta.env["VITE_MEDIA_BASE_URL"] ?? "https://media.registerdetomaso.com"
).replace(/\/$/, "");

export function photoUrl(storagePath: string | null | undefined, filename: string | null | undefined) {
  if (!filename) return "";
  const dir = (storagePath ?? "").replace(/^\//, "");
  return `${MEDIA_BASE_URL}/${dir}${filename}`;
}

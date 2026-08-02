export interface Voiture {
  id: number;
  marque: string;
  annee: string | null;
  modele: string | null;
  chassis: string | null;
  titre: string | null;
  slug: string;
  photo_prefix: string | null;
  photo_count: number | null;
  cover_photo: string | null;
  ordre_affichage: number | null;
  storage_path: string;
  created_at?: string;
}

export interface Photo {
  id: number;
  voiture_id: number;
  filename: string;
  ordre: number | null;
  retouchee: boolean | null;
}

export interface VoitureDetails {
  voiture_id: number;
  description: string | null;
  description_fr: string | null;
  description_en: string | null;
  description_it: string | null;
  updated_at?: string;
}

export interface Profil {
  id: string;
  marque: string;
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
  email: string | null;
  raison: string | null;
  statut: "en_attente" | "valide" | "refuse" | string;
  est_admin: boolean | null;
  created_at: string | null;
}

export interface Marque {
  slug: string;
  nom_affichage: string | null;
  logo: string | null;
  favicon: string | null;
  couleur: string | null;
  hero_image: string | null;
  youtube_playlist: string | null;
  books_title: string | null;
  site_url: string | null;
  actif: boolean | null;
  ordre: number | null;
}

export interface Book {
  id: number;
  marque: string | null;
  titre: string;
  couverture_url: string | null;
  lien_achat: string | null;
  ordre: number | null;
}

export interface Video {
  id: number;
  marque: string;
  voiture_id: number | null;
  youtube_id: string;
  titre: string | null;
  description: string | null;
  ordre: number | null;
  public: boolean | null;
}

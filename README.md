# De Tomaso Legacy Registry

Objectif : créer un nouveau site de registre automobile pour la marque De Tomaso, sur le même modèle exact que le site Bizzarrini Register déjà en production — mêmes fonctionnalités, même structure technique, seule l'identité visuelle change.

CONNEXION BASE DE DONNÉES — NE PAS PROVISIONNER UNE NOUVELLE BASE SUPABASE :

Ce projet doit se connecter au projet Supabase EXISTANT ci-dessous (partagé avec les autres marques), pas en créer un nouveau :

- URL : https://darckkyqmzningzzbkhr.supabase.co

- Clé publique (anon) : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhcmNra3lxbXpuaW5nenpia2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzc3ODAsImV4cCI6MjEwMDkxMzc4MH0.pnPTG7mmP3O_RSHCyegbLlM8JLvPocq3kfAqlriaV4E

Toutes les tables (voitures, photos, voiture_details, profils, marques, videos) existent déjà dans ce projet et sont déjà peuplées pour De Tomaso — ne pas les recréer, s'y connecter directement.

FONCTIONNALITÉS À REPRODUIRE À L'IDENTIQUE :

Côté public :

- Page d'accueil avec catalogue de châssis, filtres (modèle, année, recherche par numéro de châssis)

- Fiches châssis individuelles avec URL propre /chassis/slug : specs techniques, historique en 3 langues (FR/EN/IT), galerie photos avec navigation précédent/suivant et zoom

- Page dédiée au fondateur/expert de la marque

- Pages Vidéos et Books en accès libre (SEO)

- Espace membre : inscription (nom/prénom/email/téléphone/raison de la demande), accès aux fiches détaillées réservé aux membres validés

- SEO complet : sitemap.xml, robots.txt (avec Disallow /admin, /auth, /reset-password), Schema.org, canonical et og:url corrects sur le domaine de production

Côté admin (page /admin, protégée par connexion), organisée en deux sections :

- "Validations" : gestion des membres (onglets En attente / Validés / Refusés), avec colonnes Email/Raison de la demande/Date, notification email automatique au webmaster à chaque nouvelle inscription (via Resend)

- "Gestion" :

  - "Ajouter un châssis" : formulaire guidé en étapes (identité, historique/specs, photos, validation)

  - "Ordre des châssis" : réorganisation du catalogue par glisser-déposer, filtres par modèle, compteur de progression, navigation précédent/suivant

  - "Ordre & retouche des photos" : upload en masse (50+ fichiers), recadrage automatique des bordures + rotation EXIF sans perte de qualité, aperçu avant/après, ajustement manuel, statut retouchée/à valider par photo, renommage de photo, désignation de la photo de couverture sans la retirer de la galerie

  - "Historique (FR/EN/IT)" : édition du texte avec aperçu du rendu, traduction automatique dans les 2 autres langues quelle que soit la langue saisie, réutilisant le même mécanisme de traduction que le reste du site

Architecture base de données : ce site doit cohabiter avec les autres marques dans un seul et même projet Supabase partagé, via une colonne "marque" = 'de-tomaso' sur les tables voitures/photos/voiture_details/profils, le code filtrant automatiquement selon le domaine appelé.

CE QUI CHANGE PAR RAPPORT À BIZZARRINI (identité visuelle uniquement) :

- Nom de la marque, logo, palette de couleurs d'accent (le thème de base "Heritage Luxury" — fond clair, typographie serif, structure de page — reste commun à tous les sites)

- Textes d'accroche de la page d'accueil et de la page fondateur/expert

- Domaine de déploiement dédié à De Tomaso

Le contenu (châssis, photos, historiques) sera fourni séparément une fois la structure en place.

Prends un peu de libertées design pour ne pas trop ressembler à https://www.registerbizzarrini.com/ mais le principe reste le meme

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://detomaso-legacy-registry.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/561a914c-f1bd-417e-9b36-a553d17436f5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

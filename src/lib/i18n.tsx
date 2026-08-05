import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LANGS, type Lang } from "@/lib/brand";

/**
 * Traduction de l'interface (habillage du site uniquement).
 * Le contenu documentaire (historiques de châssis) n'est pas localisé :
 * il reste affiché dans sa langue d'origine.
 */

const fr = {
  "nav.registry": "Registre",
  "nav.founder": "Alejandro",
  "nav.videos": "Vidéos",
  "nav.books": "Books",
  "nav.admin": "Admin",
  "nav.member": "Espace membre",
  "nav.logout": "Déconnexion",
  "nav.menu": "Menu",
  "nav.registerLabel": "Register",
  "lang.aria": "Langue de l'interface",

  "footer.baseline": "Le registre mondial des châssis De Tomaso",
  "footer.registry": "Registre",
  "footer.archives": "Archives",
  "footer.access": "Accès",
  "footer.catalog": "Catalogue des châssis",
  "footer.independent": "Registre indépendant — non affilié au constructeur.",

  "home.eyebrow": "Modena · Depuis 1959",
  "home.title1": "Chaque châssis De Tomaso a une histoire.",
  "home.title2": "Nous la documentons.",
  "home.intro":
    "Un recensement indépendant, châssis par châssis, des automobiles nées de la vision d'Alejandro de Tomaso — Vallelunga, Mangusta, Pantera, Deauville, Longchamp.",
  "home.cta.browse": "Consulter le registre",
  "home.cta.join": "Devenir membre",
  "home.heroAlt": "Automobile De Tomaso dans un atelier de Modène",
  "home.registry.eyebrow": "Le registre",
  "home.registry.title": "Rechercher un châssis",
  "home.search.label": "Recherche",
  "home.search.placeholder": "N° de châssis, modèle, année…",
  "home.model": "Modèle",
  "home.allModels": "Tous",
  "home.decade": "Décennie",
  "home.allDecades": "Toutes",
  "home.count.one": "{n} châssis référencé",
  "home.count.other": "{n} châssis référencés",
  "home.error": "Impossible de charger le registre :",
  "home.page": "Page",
  "home.empty": "Aucun châssis ne correspond à cette recherche.",
  "home.reset": "Réinitialiser les filtres",
  "home.noVisual": "Sans visuel",
  "filters.active": "Filtres actifs",
  "filters.remove": "Retirer le filtre",
  "filters.search": "Recherche",

  "common.prev": "Précédent",
  "common.next": "Suivant",
  "common.loading": "Chargement…",
  "common.pagination": "Pagination",
  "common.close": "Fermer",

  "chassis.back": "← Retour au registre",
  "chassis.plate": "Châssis",
  "chassis.noPhoto": "Aucune photographie",
  "chassis.provenance.title": "Provenance & authentification",
  "chassis.provenance.text":
    "Chaque châssis du registre est documenté à partir d'archives d'usine, de la presse d'époque et des témoignages de propriétaires successifs.",
  "chassis.provenance.link": "Le registre & son fondateur →",
  "chassis.history": "Historique",
  "chassis.history.note": "Document d'origine, non traduit",
  "chassis.lang.original": "Original",
  "chassis.lang.translated": "Traduction",
  "chassis.lang.missing": "Traduction non disponible pour ce châssis.",
  "chassis.view.summary": "Vue résumée",
  "chassis.view.full": "Vue complète",
  "chassis.locked.title": "Réservé aux membres validés",
  "chassis.locked.text":
    "L'historique détaillé de ce châssis est accessible aux membres du registre.",
  "chassis.locked.cta": "Demander l'accès",
  "chassis.gallery": "Galerie",
  "chassis.photos.one": "{n} photographie",
  "chassis.photos.other": "{n} photographies",
  "chassis.enlarge": "Agrandir la photo",
  "chassis.prevPhoto": "Photo précédente",
  "chassis.nextPhoto": "Photo suivante",
  "chassis.nav": "Navigation entre châssis",
  "chassis.pending":
    "Historique en cours de documentation. Les archives du registre sont enrichies en continu.",

  "specs.title": "Spécifications",
  "specs.group.engine": "Moteur",
  "specs.group.chassis": "Transmission & châssis",
  "specs.group.body": "Carrosserie & finition",
  "spec.engine": "Moteur",
  "spec.engineNumber": "N° moteur",
  "spec.displacement": "Cylindrée",
  "spec.power": "Puissance",
  "spec.gearbox": "Boîte de vitesses",
  "spec.gearboxNumber": "N° boîte",
  "spec.bodywork": "Carrosserie",
  "spec.coachbuilder": "Carrossier",
  "spec.color": "Couleur d'origine",
  "spec.interior": "Intérieur",
  "spec.registration": "Immatriculation",
  "spec.condition": "État",

  "auth.eyebrow": "Registre privé",
  "auth.login": "Connexion",
  "auth.signup": "Demande d'adhésion",
  "auth.tab.login": "Se connecter",
  "auth.tab.signup": "S'inscrire",
  "auth.firstname": "Prénom",
  "auth.lastname": "Nom",
  "auth.email": "Adresse e-mail",
  "auth.password": "Mot de passe",
  "auth.phone": "Téléphone",
  "auth.reason": "Raison de la demande",
  "auth.reason.placeholder": "Sélectionnez une option…",
  "auth.reason.owner": "Propriétaire d'une De Tomaso",
  "auth.reason.former": "Ancien propriétaire",
  "auth.reason.enthusiast": "Passionné / collectionneur",
  "auth.reason.historian": "Historien / chercheur",
  "auth.reason.pro": "Professionnel de l'automobile",
  "auth.reason.other": "Autre",
  "auth.precise": "Précisez",
  "auth.submit.login": "Entrer",
  "auth.submit.signup": "Envoyer la demande",
  "auth.forgot": "Mot de passe oublié ?",
  "auth.toast.loggedIn": "Connexion réussie",
  "auth.toast.needEmail": "Renseignez votre e-mail d'abord",
  "auth.toast.resetSent": "Courriel de réinitialisation envoyé",
  "auth.sent.title": "Demande enregistrée",
  "auth.sent.text":
    "Confirmez votre adresse via le courriel qui vient de vous être envoyé. Votre demande sera ensuite examinée par l'équipe du registre — vous serez averti dès sa validation.",
  "auth.pending.title": "Demande en cours d'examen",
  "auth.pending.text":
    "Votre compte est créé mais n'est pas encore validé par un administrateur. Les historiques détaillés des châssis seront accessibles dès validation.",
  "auth.signout": "Se déconnecter",

  "reset.eyebrow": "Sécurité",
  "reset.title": "Nouveau mot de passe",
  "reset.save": "Enregistrer",
  "reset.tooShort": "8 caractères minimum",
  "reset.updated": "Mot de passe mis à jour",

  "books.eyebrow": "Bibliothèque",
  "books.title": "Books",
  "books.intro":
    "Les ouvrages de {author} qui nourrissent le travail du registre. Chaque historique de châssis est recoupé avec ces documents, les archives d'usine et les témoignages de propriétaires.",
  "books.featured": "Ouvrage {brand}",
  "books.others": "Autres ouvrages",
  "books.cover": "Couverture :",
  "books.missing": "Une référence manque à cette liste ?",
  "books.report": "Signalez-la nous",

  "videos.eyebrow": "Archives filmées",
  "videos.title": "Vidéothèque",
  "videos.play": "Lecture",
  "videos.untitled": "Sans titre",
  "videos.empty": "Aucune vidéo publiée pour le moment.",

  "founder.eyebrow": "L'expert",
  "founder.intro":
    "Pilote argentin, industriel italien d'adoption, Alejandro de Tomaso a bâti à Modène une maison automobile née d'une obsession : marier la brutalité mécanique américaine à la ligne italienne. Ce registre documente châssis par châssis ce que cette obsession a produit.",
  "founder.expertise.title": "Expertise & authentification",
  "founder.expertise.text":
    "Le registre accompagne propriétaires, collectionneurs et maisons de vente dans la vérification des numéros de châssis, la reconstitution d'historiques et la recherche d'archives d'époque. Toute demande d'expertise peut être adressée par courriel.",
  "founder.contact": "Contacter l'expert",
  "founder.t1928": "Naissance d'Alejandro de Tomaso à Buenos Aires.",
  "founder.t1955": "Départ pour l'Italie ; débuts en compétition au volant de Maserati et OSCA.",
  "founder.t1959": "Fondation de De Tomaso Automobili à Modène.",
  "founder.t1963": "Vallelunga : premier modèle de route à moteur central et châssis poutre.",
  "founder.t1967": "Au milieu des années 1960, De Tomaso s'associe à Carroll Shelby pour développer une voiture de course, la P70. La collaboration tourne court — Shelby tarde à financer le projet. De Tomaso reprend alors le châssis, l'associe à la carrosserie dessinée par Giorgetto Giugiaro chez Ghia, et transforme le projet en voiture de série : la Mangusta. Le nom n'est pas un hasard : la mangouste est l'un des seuls prédateurs naturels du cobra — un clin d'œil direct à la Shelby Cobra, rivale déchue du projet.",
  "founder.t1971": "Contrairement à Enzo Ferrari, pour qui le moteur restait le cœur sacré de l'automobile, Alejandro de Tomaso adoptait une démarche pragmatique : intégrer des V8 Ford de grande série, fiables et peu coûteux, pour concentrer ses ressources sur l'architecture du châssis et le design. On raconte que les négociations avec Henry Ford II pour la distribution de la Pantera aux États-Unis via le réseau Lincoln-Mercury se seraient nouées de façon informelle, autour d'un repas, avant même la signature des documents juridiques.",
  "founder.t1975": "Rachat de Maserati, alors en grande difficulté financière suite au retrait de Citroën, via la société publique italienne GEPI. De Tomaso y engage une stratégie de développement rapide et de production accessible, incarnée par la Maserati Biturbo, qui contribuera à maintenir la marque en activité pendant plus d'une décennie.",
  "founder.t1976": "Berlines Deauville et coupés Longchamp signés Tom Tjaarda.",
  "founder.t1993": "Guarà, dernier chapitre de la production artisanale de Modène.",
  "founder.h1": "Alejandro de Tomaso : Le Visionnaire de Modène",
  "founder.subtitle": "L'Argentin qui défia les géants de l'Émilie-Romagne",
  "founder.timeline.title": "Chronologie & Repères Historiques",
  "founder.empire.title": "Un empire industriel à l'italienne",
  "founder.empire.intro":
    "Au-delà de la marque qui porte son nom, Alejandro de Tomaso a assemblé en deux décennies un véritable conglomérat émilien : carrossiers, motocyclistes et constructeurs historiques rachetés, restructurés puis revendus. Ce tableau résume les principales pièces de cet empire.",
  "founder.empire.col1": "Entreprise / Marque",
  "founder.empire.col2": "Période",
  "founder.empire.col3": "Stratégie & modèles majeurs",
  "founder.empire.e1": "Marque fondatrice : Vallelunga, Mangusta, Pantera, Deauville, Longchamp, Guarà.",
  "founder.empire.e2": "Bureau de style maison (Giugiaro puis Tjaarda) ; revendue à Ford.",
  "founder.empire.e3": "Capacité de production et carrosserie ; cédée à Ford avec Ghia.",
  "founder.empire.e4": "Diversification moto : Le Mans, 850 T3, Benelli Sei.",
  "founder.empire.e5": "Relance par le volume : Biturbo, Quattroporte III, industrialisation du luxe.",
  "founder.empire.e6": "Petites voitures de grande série (Mini Bertone, moteurs Daihatsu).",

  "notFound.eyebrow": "Erreur 404",
  "notFound.title": "Châssis introuvable",
  "notFound.text": "Cette page n'existe pas ou a été déplacée.",
  "notFound.cta": "Retour au registre",
} as const;

export type TKey = keyof typeof fr;
type Dict = Record<TKey, string>;

const en: Dict = {
  "nav.registry": "Register",
  "nav.founder": "Alejandro",
  "nav.videos": "Videos",
  "nav.books": "Books",
  "nav.admin": "Admin",
  "nav.member": "Member area",
  "nav.logout": "Sign out",
  "nav.menu": "Menu",
  "nav.registerLabel": "Register",
  "lang.aria": "Interface language",

  "footer.baseline": "The world register of De Tomaso chassis",
  "footer.registry": "Register",
  "footer.archives": "Archives",
  "footer.access": "Access",
  "footer.catalog": "Chassis catalogue",
  "footer.independent": "Independent register — not affiliated with the manufacturer.",

  "home.eyebrow": "Modena · Since 1959",
  "home.title1": "Every De Tomaso chassis has a story.",
  "home.title2": "We document it.",
  "home.intro":
    "An independent, chassis-by-chassis survey of the cars born from Alejandro de Tomaso's vision — Vallelunga, Mangusta, Pantera, Deauville, Longchamp.",
  "home.cta.browse": "Browse the register",
  "home.cta.join": "Become a member",
  "home.heroAlt": "A De Tomaso car in a Modena workshop",
  "home.registry.eyebrow": "The register",
  "home.registry.title": "Search for a chassis",
  "home.search.label": "Search",
  "home.search.placeholder": "Chassis no., model, year…",
  "home.model": "Model",
  "home.allModels": "All",
  "home.decade": "Decade",
  "home.allDecades": "All",
  "home.count.one": "{n} chassis listed",
  "home.count.other": "{n} chassis listed",
  "home.error": "Unable to load the register:",
  "home.page": "Page",
  "home.empty": "No chassis matches this search.",
  "home.reset": "Reset filters",
  "home.noVisual": "No image",
  "filters.active": "Active filters",
  "filters.remove": "Remove filter",
  "filters.search": "Search",

  "common.prev": "Previous",
  "common.next": "Next",
  "common.loading": "Loading…",
  "common.pagination": "Pagination",
  "common.close": "Close",

  "chassis.back": "← Back to the register",
  "chassis.plate": "Chassis",
  "chassis.noPhoto": "No photograph",
  "chassis.provenance.title": "Provenance & authentication",
  "chassis.provenance.text":
    "Every chassis in the register is documented from factory archives, period press and the accounts of successive owners.",
  "chassis.provenance.link": "The register & its founder →",
  "chassis.history": "History",
  "chassis.history.note": "Original document, not translated",
  "chassis.lang.original": "Original",
  "chassis.lang.translated": "Translation",
  "chassis.lang.missing": "Translation not available for this chassis.",
  "chassis.view.summary": "Summary view",
  "chassis.view.full": "Full view",
  "chassis.locked.title": "Reserved for approved members",
  "chassis.locked.text": "The detailed history of this chassis is available to register members.",
  "chassis.locked.cta": "Request access",
  "chassis.gallery": "Gallery",
  "chassis.photos.one": "{n} photograph",
  "chassis.photos.other": "{n} photographs",
  "chassis.enlarge": "Enlarge photo",
  "chassis.prevPhoto": "Previous photo",
  "chassis.nextPhoto": "Next photo",
  "chassis.nav": "Chassis navigation",
  "chassis.pending":
    "History currently being documented. The register's archives are continuously expanded.",

  "specs.title": "Specifications",
  "specs.group.engine": "Engine",
  "specs.group.chassis": "Transmission & chassis",
  "specs.group.body": "Body & finish",
  "spec.engine": "Engine",
  "spec.engineNumber": "Engine no.",
  "spec.displacement": "Displacement",
  "spec.power": "Power",
  "spec.gearbox": "Gearbox",
  "spec.gearboxNumber": "Gearbox no.",
  "spec.bodywork": "Bodywork",
  "spec.coachbuilder": "Coachbuilder",
  "spec.color": "Original colour",
  "spec.interior": "Interior",
  "spec.registration": "Registration",
  "spec.condition": "Condition",

  "auth.eyebrow": "Private register",
  "auth.login": "Sign in",
  "auth.signup": "Membership request",
  "auth.tab.login": "Sign in",
  "auth.tab.signup": "Sign up",
  "auth.firstname": "First name",
  "auth.lastname": "Last name",
  "auth.email": "Email address",
  "auth.password": "Password",
  "auth.phone": "Phone",
  "auth.reason": "Reason for the request",
  "auth.reason.placeholder": "Select an option…",
  "auth.reason.owner": "De Tomaso owner",
  "auth.reason.former": "Former owner",
  "auth.reason.enthusiast": "Enthusiast / collector",
  "auth.reason.historian": "Historian / researcher",
  "auth.reason.pro": "Automotive professional",
  "auth.reason.other": "Other",
  "auth.precise": "Please specify",
  "auth.submit.login": "Enter",
  "auth.submit.signup": "Send request",
  "auth.forgot": "Forgot your password?",
  "auth.toast.loggedIn": "Signed in successfully",
  "auth.toast.needEmail": "Enter your email address first",
  "auth.toast.resetSent": "Reset email sent",
  "auth.sent.title": "Request received",
  "auth.sent.text":
    "Please confirm your address via the email just sent to you. Your request will then be reviewed by the register team — you will be notified once approved.",
  "auth.pending.title": "Request under review",
  "auth.pending.text":
    "Your account has been created but is not yet approved by an administrator. Detailed chassis histories will be accessible once approved.",
  "auth.signout": "Sign out",

  "reset.eyebrow": "Security",
  "reset.title": "New password",
  "reset.save": "Save",
  "reset.tooShort": "8 characters minimum",
  "reset.updated": "Password updated",

  "books.eyebrow": "Library",
  "books.title": "Books",
  "books.intro":
    "The books by {author} that underpin the register's work. Every chassis history is cross-checked against these publications, factory archives and owners' accounts.",
  "books.featured": "{brand} book",
  "books.others": "Other books",
  "books.cover": "Cover:",
  "books.missing": "A reference missing from this list?",
  "books.report": "Let us know",

  "videos.eyebrow": "Filmed archives",
  "videos.title": "Video library",
  "videos.play": "Play",
  "videos.untitled": "Untitled",
  "videos.empty": "No video published yet.",

  "founder.eyebrow": "The expert",
  "founder.intro":
    "An Argentine racing driver turned Italian industrialist, Alejandro de Tomaso built a car company in Modena out of a single obsession: marrying American mechanical brutality to Italian line. This register documents, chassis by chassis, what that obsession produced.",
  "founder.expertise.title": "Expertise & authentication",
  "founder.expertise.text":
    "The register assists owners, collectors and auction houses with chassis number verification, history reconstruction and period archive research. Any expertise request can be sent by email.",
  "founder.contact": "Contact the expert",
  "founder.t1928": "Alejandro de Tomaso is born in Buenos Aires.",
  "founder.t1955": "Moves to Italy; begins racing at the wheel of Maserati and OSCA cars.",
  "founder.t1959": "De Tomaso Automobili is founded in Modena.",
  "founder.t1963": "Vallelunga: first road car with a mid engine and backbone chassis.",
  "founder.t1967": "Mangusta, designed by Giugiaro at Ghia — 401 units.",
  "founder.t1971": "Pantera: Ford V8, distributed by Lincoln-Mercury in the United States.",
  "founder.t1976": "Deauville saloons and Longchamp coupés styled by Tom Tjaarda.",
  "founder.t1993": "Guarà, the last chapter of Modena's artisanal production.",
  "founder.h1": "Alejandro de Tomaso: The Visionary of Modena",
  "founder.subtitle": "The Argentine who challenged the giants of Emilia-Romagna",
  "founder.timeline.title": "Timeline & Historical Landmarks",
  "founder.empire.title": "An industrial empire, Italian style",
  "founder.empire.intro":
    "Beyond the marque bearing his name, Alejandro de Tomaso assembled a genuine Emilian conglomerate in two decades: coachbuilders, motorcycle makers and historic manufacturers acquired, restructured and later sold on. This table summarises the main pieces of that empire.",
  "founder.empire.col1": "Company / Marque",
  "founder.empire.col2": "Period",
  "founder.empire.col3": "Strategy & key models",
  "founder.empire.e1": "Founding marque: Vallelunga, Mangusta, Pantera, Deauville, Longchamp, Guarà.",
  "founder.empire.e2": "In-house design studio (Giugiaro, then Tjaarda); sold to Ford.",
  "founder.empire.e3": "Production and body capacity; transferred to Ford along with Ghia.",
  "founder.empire.e4": "Motorcycle diversification: Le Mans, 850 T3, Benelli Sei.",
  "founder.empire.e5": "Revival through volume: Biturbo, Quattroporte III, industrialised luxury.",
  "founder.empire.e6": "High-volume small cars (Mini Bertone, Daihatsu engines).",

  "notFound.eyebrow": "Error 404",
  "notFound.title": "Chassis not found",
  "notFound.text": "This page does not exist or has been moved.",
  "notFound.cta": "Back to the register",
};

const it: Dict = {
  "nav.registry": "Registro",
  "nav.founder": "Alejandro",
  "nav.videos": "Video",
  "nav.books": "Libri",
  "nav.admin": "Admin",
  "nav.member": "Area soci",
  "nav.logout": "Esci",
  "nav.menu": "Menu",
  "nav.registerLabel": "Register",
  "lang.aria": "Lingua dell'interfaccia",

  "footer.baseline": "Il registro mondiale dei telai De Tomaso",
  "footer.registry": "Registro",
  "footer.archives": "Archivi",
  "footer.access": "Accesso",
  "footer.catalog": "Catalogo dei telai",
  "footer.independent": "Registro indipendente — non affiliato al costruttore.",

  "home.eyebrow": "Modena · Dal 1959",
  "home.title1": "Ogni telaio De Tomaso ha una storia.",
  "home.title2": "Noi la documentiamo.",
  "home.intro":
    "Un censimento indipendente, telaio per telaio, delle automobili nate dalla visione di Alejandro de Tomaso — Vallelunga, Mangusta, Pantera, Deauville, Longchamp.",
  "home.cta.browse": "Consulta il registro",
  "home.cta.join": "Diventa socio",
  "home.heroAlt": "Automobile De Tomaso in un'officina di Modena",
  "home.registry.eyebrow": "Il registro",
  "home.registry.title": "Cerca un telaio",
  "home.search.label": "Ricerca",
  "home.search.placeholder": "N° di telaio, modello, anno…",
  "home.model": "Modello",
  "home.allModels": "Tutti",
  "home.decade": "Decennio",
  "home.allDecades": "Tutti",
  "home.count.one": "{n} telaio censito",
  "home.count.other": "{n} telai censiti",
  "home.error": "Impossibile caricare il registro:",
  "home.page": "Pagina",
  "home.empty": "Nessun telaio corrisponde a questa ricerca.",
  "home.reset": "Azzera i filtri",
  "home.noVisual": "Senza immagine",
  "filters.active": "Filtri attivi",
  "filters.remove": "Rimuovi il filtro",
  "filters.search": "Ricerca",

  "common.prev": "Precedente",
  "common.next": "Successivo",
  "common.loading": "Caricamento…",
  "common.pagination": "Paginazione",
  "common.close": "Chiudi",

  "chassis.back": "← Torna al registro",
  "chassis.plate": "Telaio",
  "chassis.noPhoto": "Nessuna fotografia",
  "chassis.provenance.title": "Provenienza e autenticazione",
  "chassis.provenance.text":
    "Ogni telaio del registro è documentato a partire dagli archivi di fabbrica, dalla stampa dell'epoca e dalle testimonianze dei proprietari successivi.",
  "chassis.provenance.link": "Il registro e il suo fondatore →",
  "chassis.history": "Storia",
  "chassis.history.note": "Documento originale, non tradotto",
  "chassis.lang.original": "Originale",
  "chassis.lang.translated": "Traduzione",
  "chassis.lang.missing": "Traduzione non disponibile per questo telaio.",
  "chassis.view.summary": "Vista sintetica",
  "chassis.view.full": "Vista completa",
  "chassis.locked.title": "Riservato ai soci approvati",
  "chassis.locked.text": "La storia dettagliata di questo telaio è riservata ai soci del registro.",
  "chassis.locked.cta": "Richiedi l'accesso",
  "chassis.gallery": "Galleria",
  "chassis.photos.one": "{n} fotografia",
  "chassis.photos.other": "{n} fotografie",
  "chassis.enlarge": "Ingrandisci la foto",
  "chassis.prevPhoto": "Foto precedente",
  "chassis.nextPhoto": "Foto successiva",
  "chassis.nav": "Navigazione tra i telai",
  "chassis.pending":
    "Storia in corso di documentazione. Gli archivi del registro vengono arricchiti di continuo.",

  "specs.title": "Specifiche",
  "specs.group.engine": "Motore",
  "specs.group.chassis": "Trasmissione e telaio",
  "specs.group.body": "Carrozzeria e finiture",
  "spec.engine": "Motore",
  "spec.engineNumber": "N° motore",
  "spec.displacement": "Cilindrata",
  "spec.power": "Potenza",
  "spec.gearbox": "Cambio",
  "spec.gearboxNumber": "N° cambio",
  "spec.bodywork": "Carrozzeria",
  "spec.coachbuilder": "Carrozziere",
  "spec.color": "Colore originale",
  "spec.interior": "Interni",
  "spec.registration": "Targa",
  "spec.condition": "Stato",

  "auth.eyebrow": "Registro privato",
  "auth.login": "Accesso",
  "auth.signup": "Richiesta di adesione",
  "auth.tab.login": "Accedi",
  "auth.tab.signup": "Registrati",
  "auth.firstname": "Nome",
  "auth.lastname": "Cognome",
  "auth.email": "Indirizzo e-mail",
  "auth.password": "Password",
  "auth.phone": "Telefono",
  "auth.reason": "Motivo della richiesta",
  "auth.reason.placeholder": "Seleziona un'opzione…",
  "auth.reason.owner": "Proprietario di una De Tomaso",
  "auth.reason.former": "Ex proprietario",
  "auth.reason.enthusiast": "Appassionato / collezionista",
  "auth.reason.historian": "Storico / ricercatore",
  "auth.reason.pro": "Professionista del settore",
  "auth.reason.other": "Altro",
  "auth.precise": "Specifica",
  "auth.submit.login": "Entra",
  "auth.submit.signup": "Invia la richiesta",
  "auth.forgot": "Password dimenticata?",
  "auth.toast.loggedIn": "Accesso effettuato",
  "auth.toast.needEmail": "Inserisci prima la tua e-mail",
  "auth.toast.resetSent": "E-mail di reimpostazione inviata",
  "auth.sent.title": "Richiesta registrata",
  "auth.sent.text":
    "Conferma il tuo indirizzo tramite l'e-mail appena inviata. La richiesta sarà poi esaminata dal team del registro — riceverai una notifica all'approvazione.",
  "auth.pending.title": "Richiesta in esame",
  "auth.pending.text":
    "Il tuo account è stato creato ma non è ancora approvato da un amministratore. Le storie dettagliate dei telai saranno accessibili dopo l'approvazione.",
  "auth.signout": "Esci",

  "reset.eyebrow": "Sicurezza",
  "reset.title": "Nuova password",
  "reset.save": "Salva",
  "reset.tooShort": "Minimo 8 caratteri",
  "reset.updated": "Password aggiornata",

  "books.eyebrow": "Biblioteca",
  "books.title": "Libri",
  "books.intro":
    "I volumi di {author} che alimentano il lavoro del registro. Ogni storia di telaio è verificata con questi documenti, gli archivi di fabbrica e le testimonianze dei proprietari.",
  "books.featured": "Volume {brand}",
  "books.others": "Altri volumi",
  "books.cover": "Copertina:",
  "books.missing": "Manca un riferimento in questo elenco?",
  "books.report": "Segnalacelo",

  "videos.eyebrow": "Archivi filmati",
  "videos.title": "Videoteca",
  "videos.play": "Riproduci",
  "videos.untitled": "Senza titolo",
  "videos.empty": "Nessun video pubblicato al momento.",

  "founder.eyebrow": "L'esperto",
  "founder.intro":
    "Pilota argentino, industriale italiano d'adozione, Alejandro de Tomaso ha costruito a Modena una casa automobilistica nata da un'ossessione: unire la brutalità meccanica americana alla linea italiana. Questo registro documenta, telaio per telaio, ciò che quell'ossessione ha prodotto.",
  "founder.expertise.title": "Perizia e autenticazione",
  "founder.expertise.text":
    "Il registro assiste proprietari, collezionisti e case d'asta nella verifica dei numeri di telaio, nella ricostruzione delle storie e nella ricerca d'archivio. Ogni richiesta di perizia può essere inviata via e-mail.",
  "founder.contact": "Contatta l'esperto",
  "founder.t1928": "Nasce Alejandro de Tomaso a Buenos Aires.",
  "founder.t1955": "Partenza per l'Italia; esordi in gara al volante di Maserati e OSCA.",
  "founder.t1959": "Fondazione della De Tomaso Automobili a Modena.",
  "founder.t1963": "Vallelunga: prima vettura stradale a motore centrale e telaio a trave.",
  "founder.t1967": "Mangusta, disegnata da Giugiaro alla Ghia — 401 esemplari.",
  "founder.t1971": "Pantera: V8 Ford, distribuzione Lincoln-Mercury negli Stati Uniti.",
  "founder.t1976": "Berline Deauville e coupé Longchamp firmate Tom Tjaarda.",
  "founder.t1993": "Guarà, ultimo capitolo della produzione artigianale modenese.",
  "founder.h1": "Alejandro de Tomaso: il visionario di Modena",
  "founder.subtitle": "L'argentino che sfidò i giganti dell'Emilia-Romagna",
  "founder.timeline.title": "Cronologia e riferimenti storici",
  "founder.empire.title": "Un impero industriale all'italiana",
  "founder.empire.intro":
    "Oltre al marchio che porta il suo nome, Alejandro de Tomaso ha costruito in due decenni un vero conglomerato emiliano: carrozzerie, case motociclistiche e costruttori storici acquisiti, ristrutturati e poi ceduti. Questa tabella riassume i principali tasselli di quell'impero.",
  "founder.empire.col1": "Azienda / Marchio",
  "founder.empire.col2": "Periodo",
  "founder.empire.col3": "Strategia e modelli principali",
  "founder.empire.e1": "Marchio fondatore: Vallelunga, Mangusta, Pantera, Deauville, Longchamp, Guarà.",
  "founder.empire.e2": "Centro stile interno (Giugiaro, poi Tjaarda); ceduta a Ford.",
  "founder.empire.e3": "Capacità produttiva e carrozzeria; ceduta a Ford insieme a Ghia.",
  "founder.empire.e4": "Diversificazione moto: Le Mans, 850 T3, Benelli Sei.",
  "founder.empire.e5": "Rilancio sui volumi: Biturbo, Quattroporte III, lusso industrializzato.",
  "founder.empire.e6": "Vetture piccole di grande serie (Mini Bertone, motori Daihatsu).",

  "notFound.eyebrow": "Errore 404",
  "notFound.title": "Telaio non trovato",
  "notFound.text": "Questa pagina non esiste o è stata spostata.",
  "notFound.cta": "Torna al registro",
};

const DICTS: Record<Lang, Dict> = { fr, en, it };

const STORAGE_KEY = "ui-lang";

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nState | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  // Lecture après hydratation pour éviter tout écart SSR/client.
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && (LANGS as readonly string[]).includes(saved)) setLangState(saved as Lang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage indisponible */
    }
  }, []);

  const t = useCallback<I18nState["t"]>(
    (key, vars) => {
      let out = DICTS[lang][key] ?? fr[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
      }
      return out;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

/** Raccourci : const t = useT(); */
export function useT() {
  return useI18n().t;
}

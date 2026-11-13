/** Une carte telle que lue dans une liste .txt. */
export type DeckCard = {
  /** Clé de comparaison : nom normalisé (minuscules, sans accents, face avant). */
  key: string;
  name: string;
  qty: number;
  /** Catégories Archidekt, hors « Commander ». */
  cats: string[];
  /** Marquée commandant dans la liste (section ou catégorie). */
  commander: boolean;
};

export type ParsedDeck = {
  cards: Map<string, DeckCard>;
  /** Cartes hors deck (sideboard, maybeboard), ignorées pour la comparaison. */
  outside: { name: string; qty: number }[];
};

export type DiffType = "add" | "remove" | "same";

export type DiffEntry = {
  key: string;
  name: string;
  /** Quantité dans A (deck d'origine) et B (deck modifié). */
  qa: number;
  qb: number;
  delta: number;
  type: DiffType;
  /** Première catégorie Archidekt, ou « Sans catégorie ». */
  cat: string;
};

/** Changements validés par l'utilisateur, par clé de carte. */
export type Decisions = Record<string, true>;

/** Données utiles d'une carte, venant de Scryfall. */
export type CardData = {
  name: string;
  small?: string;
  normal?: string;
  large?: string;
  art?: string;
  type: string;
  cmc: number;
  identity: string[];
  /** Le texte de la carte dit « … can be your commander » (certains planeswalkers, etc.). */
  canCommand?: boolean;
};

/** Cache des cartes : `null` = carte introuvable sur Scryfall. */
export type CardDb = Record<string, CardData | null>;

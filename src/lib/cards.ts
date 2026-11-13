import type { CardData, CardDb, DeckCard } from "./types";

/** Groupes de types, dans l'ordre d'affichage. */
export const TYPE_GROUPS: [en: string, fr: string][] = [
  ["Creature", "Créatures"],
  ["Planeswalker", "Planeswalkers"],
  ["Battle", "Batailles"],
  ["Instant", "Éphémères"],
  ["Sorcery", "Rituels"],
  ["Artifact", "Artefacts"],
  ["Enchantment", "Enchantements"],
  ["Land", "Terrains"],
];
export const OTHER_GROUP = "Autres";

const frontType = (d: CardData) => d.type.split(" // ")[0];

export function isLand(d: CardData | null | undefined): boolean {
  return !!d && /\bLand\b/.test(frontType(d));
}

/** Type principal d'une carte, en français (« Créatures », « Terrains »…). */
export function mainType(d: CardData | null | undefined): string {
  if (!d) return OTHER_GROUP;
  const t = frontType(d);
  if (/\bLand\b/.test(t) && !/Creature/.test(t)) return "Terrains";
  for (const [en, fr] of TYPE_GROUPS) if (t.includes(en)) return fr;
  return OTHER_GROUP;
}

/** Créature légendaire, Background, ou carte qui dit « can be your commander » (ex. certains planeswalkers). */
export function canBeCommander(d: CardData): boolean {
  return !!d.canCommand || (/Legendary/.test(d.type) && /Creature|Background/.test(d.type));
}

export type DeckStats = {
  count: number;
  lands: number;
  /** Coût moyen des cartes hors terrains. */
  avgCmc: number;
  /** Toutes les cartes ont leurs données Scryfall. */
  complete: boolean;
};

export function deckStats(cards: Iterable<DeckCard>, db: CardDb): DeckStats {
  let count = 0;
  let lands = 0;
  let cmcSum = 0;
  let cmcN = 0;
  let complete = true;
  for (const c of cards) {
    count += c.qty;
    const d = db[c.key];
    if (!d) {
      complete = false;
      continue;
    }
    if (isLand(d)) lands += c.qty;
    else {
      cmcSum += d.cmc * c.qty;
      cmcN += c.qty;
    }
  }
  return { count, lands, avgCmc: cmcN ? cmcSum / cmcN : 0, complete };
}

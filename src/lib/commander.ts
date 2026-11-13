import { canBeCommander } from "./cards";
import type { CardDb, ParsedDeck } from "./types";

type Deck = ParsedDeck | null;

/** Commandant indiqué dans les listes (catégorie ou section « Commander »), B en priorité. */
export function taggedCommander(a: Deck, b: Deck): string | null {
  for (const p of [b, a]) if (p) for (const c of p.cards.values()) if (c.commander) return c.key;
  return null;
}

/** Commandant retenu : le choix de l'utilisateur s'il est dans les listes, sinon celui indiqué. */
export function resolveCommander(chosen: string | null, a: Deck, b: Deck): string | null {
  if (chosen && (a?.cards.has(chosen) || b?.cards.has(chosen))) return chosen;
  return taggedCommander(a, b);
}

export function cardName(key: string, a: Deck, b: Deck): string | null {
  return b?.cards.get(key)?.name ?? a?.cards.get(key)?.name ?? null;
}

type Option = [key: string, name: string];

/**
 * Choix possibles pour le commandant :
 * `likely` = cartes qui peuvent l'être (ou dont on n'a pas encore les données), `others` = le reste du deck,
 * proposé quand même pour ne jamais bloquer l'utilisateur sur un cas particulier.
 */
export function commanderCandidates(a: Deck, b: Deck, db: CardDb): { likely: Option[]; others: Option[] } {
  const m = new Map<string, string>();
  for (const p of [b, a]) if (p) for (const c of p.cards.values()) if (!m.has(c.key)) m.set(c.key, c.name);
  const all = [...m].sort((x, y) => x[1].localeCompare(y[1], "fr"));
  const isLikely = ([k]: Option) => {
    const d = db[k];
    return !d || canBeCommander(d);
  };
  return { likely: all.filter(isLikely), others: all.filter((o) => !isLikely(o)) };
}

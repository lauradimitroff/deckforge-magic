import type { DeckCard, ParsedDeck } from "./types";

const SECTION_RE =
  /^(commander|commandant|deck|main ?deck|mainboard|sideboard|maybeboard|companion|compagnon)\s*:?\s*$/i;
const OUT_OF_DECK = /^(sideboard|maybeboard)$/i;
const COMMANDER_CAT = /^commander$/i;

/**
 * Clé de comparaison d'une carte : face avant, minuscules, sans accents ni espaces superflus.
 * « Fire // Ice », « fire » et « Fire » donnent la même clé.
 */
export function normalizeKey(name: string): string {
  const front = name.split(/\s*\/\/?\s*/)[0];
  return front
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Lit une liste de deck au format texte (Archidekt, Moxfield, Arena…).
 * Ignore l'édition, le numéro, le foil et les étiquettes ; garde les catégories Archidekt.
 */
export function parseList(text: string): ParsedDeck {
  const cards = new Map<string, DeckCard>();
  const outside: ParsedDeck["outside"] = [];
  let section = "main";

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("//") || line.startsWith("#")) continue;

    const sec = line.match(SECTION_RE);
    if (sec) {
      section = sec[1].toLowerCase();
      continue;
    }

    const m = line.match(/^(\d+)\s*x?\s+(.+)$/i);
    if (!m) continue;
    const qty = parseInt(m[1], 10);
    let rest = m[2];

    // Catégories Archidekt : [Ramp,Draw] ou [Commander{top}]
    const cats: string[] = [];
    rest = rest.replace(/\s*\[([^\]]*)\]\s*/g, (_, c: string) => {
      cats.push(
        ...c
          .split(",")
          .map((s) => s.replace(/\{[^}]*\}/g, "").trim())
          .filter(Boolean),
      );
      return " ";
    });
    rest = rest
      .replace(/\s*\^[^^]*\^\s*/g, " ") // étiquettes couleur ^Have,#37d67a^
      .replace(/\s*\*[A-Z]+\*\s*/gi, " ") // *F* foil, *E* etched
      .replace(/\s*\([A-Za-z0-9]{2,6}\)(\s+[A-Za-z0-9\-★]+)?\s*$/, ""); // (set) numéro

    const name = rest.replace(/\s+/g, " ").trim();
    if (!name) continue;

    if (OUT_OF_DECK.test(section) || cats.some((c) => OUT_OF_DECK.test(c))) {
      outside.push({ name, qty });
      continue;
    }

    const isCommander = /^command/.test(section) || cats.some((c) => COMMANDER_CAT.test(c));
    const key = normalizeKey(name);
    const cleanCats = cats.filter((c) => !COMMANDER_CAT.test(c));
    const existing = cards.get(key);
    if (existing) {
      existing.qty += qty;
      existing.commander ||= isCommander;
      if (!existing.cats.length) existing.cats = cleanCats;
    } else {
      cards.set(key, { key, name, qty, cats: cleanCats, commander: isCommander });
    }
  }
  return { cards, outside };
}

export function totalCards(cards: Iterable<{ qty: number }>): number {
  let n = 0;
  for (const c of cards) n += c.qty;
  return n;
}

import type { Decisions, DeckCard, DiffEntry, ParsedDeck } from "./types";

const byName = (x: { name: string }, y: { name: string }) => x.name.localeCompare(y.name, "fr");

/** Compare A (deck d'origine) et B (deck modifié), carte par carte. */
export function computeDiff(a: ParsedDeck, b: ParsedDeck): DiffEntry[] {
  const entries: DiffEntry[] = [];
  for (const key of new Set([...a.cards.keys(), ...b.cards.keys()])) {
    const ca = a.cards.get(key);
    const cb = b.cards.get(key);
    const qa = ca?.qty ?? 0;
    const qb = cb?.qty ?? 0;
    const delta = qb - qa;
    const ref = (cb ?? ca)!;
    const cats = (delta > 0 ? cb?.cats : ca?.cats) ?? ref.cats;
    entries.push({
      key,
      name: ref.name,
      qa,
      qb,
      delta,
      type: delta > 0 ? "add" : delta < 0 ? "remove" : "same",
      cat: cats[0] ?? "Sans catégorie",
    });
  }
  return entries.sort(byName);
}

export const onlyChanges = (diff: DiffEntry[]) => diff.filter((d) => d.type !== "same");

/** Garde uniquement les validations qui portent sur un changement existant. */
export function effectiveDecisions(diff: DiffEntry[], decisions: Decisions): Decisions {
  const out: Decisions = {};
  for (const d of diff) if (d.type !== "same" && decisions[d.key]) out[d.key] = true;
  return out;
}

/** Libellé de quantité : « +1 », « −2 » ou « 12 → 9 ». */
export function deltaLabel(d: DiffEntry): string {
  if (d.qa && d.qb) return `${d.qa} → ${d.qb}`;
  return d.delta > 0 ? `+${d.delta}` : `−${-d.delta}`;
}

/** Deck A avec les changements validés appliqués. */
export function buildFinalDeck(
  a: ParsedDeck,
  b: ParsedDeck,
  diff: DiffEntry[],
  decisions: Decisions,
): Map<string, DeckCard> {
  const out = new Map<string, DeckCard>();
  for (const c of a.cards.values()) out.set(c.key, { ...c });
  for (const d of onlyChanges(diff)) {
    if (!decisions[d.key]) continue;
    const cur = out.get(d.key);
    if (cur) {
      cur.qty = d.qb;
      if (!cur.qty) out.delete(d.key);
    } else {
      const fromB = b.cards.get(d.key);
      if (fromB) out.set(d.key, { ...fromB });
    }
  }
  return out;
}

/** Texte « À AJOUTER / À RETIRER » des changements validés. */
export function changesText(diff: DiffEntry[], decisions: Decisions): string {
  const ok = onlyChanges(diff).filter((d) => decisions[d.key]);
  const adds = ok.filter((d) => d.type === "add");
  const rems = ok.filter((d) => d.type === "remove");
  let t = "";
  if (adds.length) t += "À AJOUTER\n" + adds.map((d) => `${d.delta}x ${d.name}`).join("\n") + "\n";
  if (rems.length)
    t += (t ? "\n" : "") + "À RETIRER\n" + rems.map((d) => `${-d.delta}x ${d.name}`).join("\n") + "\n";
  return t || "Aucun changement validé.\n";
}

/**
 * Liste des cartes à ajouter, une par ligne (« 1 Sol Ring »), importable sur Archidekt, Moxfield ou Cardmarket.
 * Si des ajouts sont validés, seuls ceux-là sont gardés ; sinon, tous les ajouts.
 */
export function addListText(diff: DiffEntry[], decisions: Decisions): { text: string; count: number; validatedOnly: boolean } {
  const adds = onlyChanges(diff).filter((d) => d.type === "add");
  const validated = adds.filter((d) => decisions[d.key]);
  const list = validated.length ? validated : adds;
  return {
    text: list.map((d) => `${d.delta} ${d.name}`).join("\n") + (list.length ? "\n" : ""),
    count: list.reduce((n, d) => n + d.delta, 0),
    validatedOnly: validated.length > 0,
  };
}

/** Deck final au format Archidekt, commandant en tête et marqué [Commander{top}]. */
export function finalDeckText(deck: Map<string, DeckCard>, commanderKey: string | null): string {
  const cards = [...deck.values()].sort(
    (x, y) => Number(y.key === commanderKey) - Number(x.key === commanderKey) || byName(x, y),
  );
  return (
    cards
      .map((c) => {
        const cats = (c.key === commanderKey ? ["Commander{top}"] : []).concat(c.cats);
        return `${c.qty}x ${c.name}` + (cats.length ? ` [${cats.join(",")}]` : "");
      })
      .join("\n") + "\n"
  );
}

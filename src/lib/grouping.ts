import { mainType, OTHER_GROUP, TYPE_GROUPS } from "./cards";
import type { CardDb, DiffEntry } from "./types";

export type GroupBy = "type" | "cat" | "none";
const NO_CAT = "Sans catégorie";

/** Regroupe les cartes par type, par catégorie Archidekt, ou pas du tout (un seul groupe sans titre). */
export function groupEntries(entries: DiffEntry[], groupBy: GroupBy, db: CardDb): [string, DiffEntry[]][] {
  const label = (d: DiffEntry) => (groupBy === "type" ? mainType(db[d.key]) : groupBy === "cat" ? d.cat : "");
  const groups = new Map<string, DiffEntry[]>();
  for (const d of entries) {
    const k = label(d);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(d);
  }
  const typeOrder = TYPE_GROUPS.map(([, fr]) => fr);
  const rank = (k: string) =>
    groupBy === "type"
      ? k === OTHER_GROUP
        ? 99
        : typeOrder.indexOf(k)
      : k === NO_CAT
        ? 99
        : 0;
  return [...groups].sort((x, y) => rank(x[0]) - rank(y[0]) || x[0].localeCompare(y[0], "fr"));
}

export const hasCategories = (entries: DiffEntry[]) => entries.some((d) => d.cat !== NO_CAT);

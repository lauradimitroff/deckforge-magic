"use client";

import { useEffect, useState } from "react";
import type { GroupBy } from "@/lib/grouping";
import { loadJSON, saveJSON } from "@/lib/storage";

export type ViewMode = "cards" | "list";
export type Filter = "all" | "pending" | "done";
export type ViewPrefs = { view: ViewMode; filter: Filter; groupBy: GroupBy };

const KEY = "deck-compare-view-v1";
const DEFAULTS: ViewPrefs = { view: "cards", filter: "all", groupBy: "type" };

/** Préférences d'affichage (cartes/liste, filtre, regroupement), propres à ce navigateur. */
export function useViewPrefs() {
  const [prefs, setPrefs] = useState<ViewPrefs>(() => ({ ...DEFAULTS, ...loadJSON<Partial<ViewPrefs>>(KEY, {}) }));
  useEffect(() => saveJSON(KEY, prefs), [prefs]);
  return [prefs, (patch: Partial<ViewPrefs>) => setPrefs((p) => ({ ...p, ...patch }))] as const;
}

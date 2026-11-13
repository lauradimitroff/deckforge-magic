"use client";

import { useEffect, useState } from "react";
import { DEMO_A, DEMO_B } from "@/lib/demo";
import { loadJSON, saveJSON } from "@/lib/storage";
import type { Decisions } from "@/lib/types";

export type Side = "A" | "B";

export type QuickState = {
  textA: string;
  textB: string;
  decisions: Decisions;
  commander: string | null;
};

const STORAGE_KEY = "deck-compare-v1";
const EMPTY: QuickState = { textA: "", textB: "", decisions: {}, commander: null };

/**
 * Comparaison rapide, sans compte : les deux listes et les validations sont gardées dans ce navigateur.
 * À utiliser uniquement côté client (l'état initial est lu dans localStorage).
 */
export function useQuickComparison() {
  const [state, setState] = useState<QuickState>(() => {
    const saved = loadJSON<Partial<QuickState>>(STORAGE_KEY, {});
    return {
      textA: saved.textA ?? "",
      textB: saved.textB ?? "",
      decisions: saved.decisions ?? {},
      commander: saved.commander ?? null,
    };
  });
  useEffect(() => saveJSON(STORAGE_KEY, state), [state]);

  const update = (patch: Partial<QuickState>) => setState((s) => ({ ...s, ...patch }));
  return {
    state,
    update,
    setText: (side: Side, text: string) => update(side === "A" ? { textA: text } : { textB: text }),
    clearAll: () => setState(EMPTY),
    loadDemo: () => setState({ ...EMPTY, textA: DEMO_A, textB: DEMO_B }),
  };
}

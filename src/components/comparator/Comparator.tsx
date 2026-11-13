"use client";

import { useMemo } from "react";
import { useQuickComparison } from "@/hooks/useComparator";
import { parseList } from "@/lib/parse";
import ComparisonView from "./ComparisonView";
import ImportPanel from "./ImportPanel";

/** Comparaison rapide sans compte : import des deux listes + comparateur, tout dans le navigateur. */
export default function Comparator() {
  const { state, update, setText, clearAll, loadDemo } = useQuickComparison();
  const deckA = useMemo(() => (state.textA.trim() ? parseList(state.textA) : null), [state.textA]);
  const deckB = useMemo(() => (state.textB.trim() ? parseList(state.textB) : null), [state.textB]);

  return (
    <>
      <ImportPanel
        textA={state.textA}
        textB={state.textB}
        deckA={deckA}
        deckB={deckB}
        onText={setText}
        onDemo={loadDemo}
        onClear={() => {
          if (confirm("Effacer les deux listes et toutes les validations ?")) clearAll();
        }}
      />
      <ComparisonView
        textA={state.textA}
        textB={state.textB}
        decisions={state.decisions}
        commanderChoice={state.commander}
        onDecisionsChange={(decisions) => update({ decisions })}
        onCommanderChange={(commander) => update({ commander })}
      />
    </>
  );
}

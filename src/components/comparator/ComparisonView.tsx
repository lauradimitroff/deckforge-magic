"use client";

import { useMemo, useState } from "react";
import { useCardDb } from "@/hooks/useCardDb";
import { useToast } from "@/hooks/useToast";
import { useViewPrefs } from "@/hooks/useViewPrefs";
import { resolveCommander } from "@/lib/commander";
import { addListText, buildFinalDeck, changesText, computeDiff, effectiveDecisions, finalDeckText, onlyChanges } from "@/lib/diff";
import { parseList } from "@/lib/parse";
import { downloadText } from "@/lib/storage";
import type { Decisions } from "@/lib/types";
import CommanderHero from "./CommanderHero";
import DiffPanel from "./DiffPanel";
import { CardModal, HoverPreview, Toast } from "./Overlays";
import ResultPanel from "./ResultPanel";

type Props = {
  textA: string;
  textB: string;
  /** Validations enregistrées (peuvent contenir des clés obsolètes, ignorées). */
  decisions: Decisions;
  /** Commandant choisi par l'utilisateur (sinon celui indiqué dans les listes). */
  commanderChoice: string | null;
  onDecisionsChange: (next: Decisions) => void;
  onCommanderChange: (key: string | null) => void;
  /** Nom de fichier pour l'export du deck final, sans extension. */
  exportName?: string;
  /** Contenu affiché sous la bannière du commandant (ex. barre de sauvegarde). */
  children?: React.ReactNode;
};

/** Le cœur du comparateur : commandant, différences, résultat. Ne sait pas où l'état est stocké. */
export default function ComparisonView({
  textA,
  textB,
  decisions: rawDecisions,
  commanderChoice,
  onDecisionsChange,
  onCommanderChange,
  exportName = "deck-final",
  children,
}: Props) {
  const deckA = useMemo(() => (textA.trim() ? parseList(textA) : null), [textA]);
  const deckB = useMemo(() => (textB.trim() ? parseList(textB) : null), [textB]);
  const diff = useMemo(() => (deckA && deckB ? computeDiff(deckA, deckB) : []), [deckA, deckB]);
  const decisions = useMemo(() => effectiveDecisions(diff, rawDecisions), [diff, rawDecisions]);
  const allCards = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of [deckA, deckB]) if (p) for (const c of p.cards.values()) m.set(c.key, c.name);
    return [...m];
  }, [deckA, deckB]);

  const cards = useCardDb(allCards);
  const [prefs, setPrefs] = useViewPrefs();
  const toast = useToast();
  const [preview, setPreview] = useState<string | null>(null);

  const ready = !!deckA && !!deckB;
  const commander = resolveCommander(commanderChoice, deckA, deckB);
  const finalDeck = useMemo(
    () => (deckA && deckB ? buildFinalDeck(deckA, deckB, diff, decisions) : null),
    [deckA, deckB, diff, decisions],
  );

  const toggle = (key: string) => {
    const next = { ...decisions };
    if (next[key]) delete next[key];
    else next[key] = true;
    onDecisionsChange(next);
  };

  return (
    <>
      {ready && (
        <CommanderHero deckA={deckA} deckB={deckB} db={cards.db} commander={commander} onChange={onCommanderChange} />
      )}
      {children}

      <DiffPanel
        ready={ready}
        diff={diff}
        decisions={decisions}
        cards={cards}
        commander={commander}
        view={prefs.view}
        filter={prefs.filter}
        groupBy={prefs.groupBy}
        onUpdate={setPrefs}
        onToggle={toggle}
        onValidateAll={() => onDecisionsChange(Object.fromEntries(onlyChanges(diff).map((d) => [d.key, true])))}
        onReset={() => onDecisionsChange({})}
        onPreview={setPreview}
      />

      <ResultPanel
        deckA={deckA}
        finalDeck={finalDeck}
        diff={diff}
        decisions={decisions}
        db={cards.db}
        commander={commander}
        onExportFinal={() => {
          if (!finalDeck) return toast.show("Importe d'abord les deux listes");
          downloadText(`${exportName}.txt`, finalDeckText(finalDeck, commander));
        }}
        onExportChanges={() => downloadText("changements.txt", changesText(diff, decisions))}
        onExportAdds={() => downloadText(`${exportName}-a-ajouter.txt`, addListText(diff, decisions).text)}
        onCopyAdds={() =>
          navigator.clipboard.writeText(addListText(diff, decisions).text).then(
            () => toast.show("Liste des cartes à ajouter copiée"),
            () => toast.show("Copie impossible"),
          )
        }
        onCopyChanges={() =>
          navigator.clipboard.writeText(changesText(diff, decisions)).then(
            () => toast.show("Changements copiés"),
            () => toast.show("Copie impossible"),
          )
        }
      />

      <CardModal src={preview ? cards.db[preview]?.large : undefined} onClose={() => setPreview(null)} />
      <HoverPreview db={cards.db} />
      <Toast message={toast.message} />
    </>
  );
}

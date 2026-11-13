"use client";

import { useEffect, useRef, useState } from "react";
import { saveDecisions, setCommander } from "@/app/decks/actions";
import type { Decisions } from "@/lib/types";
import ComparisonView from "./ComparisonView";
import styles from "./SavedComparator.module.css";

export type SavedComparatorProps = {
  deckId: string;
  fromId: string;
  toId: string;
  textA: string;
  textB: string;
  initialDecisions: Decisions;
  initialCommander: string | null;
  exportName: string;
};

type Status = "saved" | "saving" | "error";
const SAVE_DELAY = 500;

/** Comparaison de deux versions d'un deck sauvegardé : chaque validation est enregistrée en base. */
export default function SavedComparator(props: SavedComparatorProps) {
  const { deckId, fromId, toId } = props;
  const [decisions, setDecisions] = useState(props.initialDecisions);
  const [commander, setCommanderState] = useState(props.initialCommander);
  const [status, setStatus] = useState<Status>("saved");

  // Les enregistrements partent l'un après l'autre, pour que le dernier état gagne toujours.
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const inflight = useRef(0);
  const pending = useRef<{ timer: ReturnType<typeof setTimeout>; value: Decisions } | null>(null);

  const enqueue = (job: () => Promise<unknown>) => {
    inflight.current++;
    setStatus("saving");
    const run = queue.current.then(job);
    queue.current = run.catch(() => undefined);
    run.then(
      () => {
        inflight.current--;
        if (!inflight.current && !pending.current) setStatus("saved");
      },
      () => {
        inflight.current--;
        setStatus("error");
      },
    );
  };

  const flush = () => {
    if (!pending.current) return;
    clearTimeout(pending.current.timer);
    const value = pending.current.value;
    pending.current = null;
    enqueue(() => saveDecisions(deckId, fromId, toId, value));
  };

  const onDecisionsChange = (next: Decisions) => {
    setDecisions(next);
    setStatus("saving");
    if (pending.current) clearTimeout(pending.current.timer);
    pending.current = { value: next, timer: setTimeout(flush, SAVE_DELAY) };
  };

  // Si on quitte la page avant la fin du délai, on enregistre tout de suite.
  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });
  useEffect(() => () => flushRef.current(), []);

  return (
    <ComparisonView
      textA={props.textA}
      textB={props.textB}
      decisions={decisions}
      commanderChoice={commander}
      onDecisionsChange={onDecisionsChange}
      onCommanderChange={(key) => {
        setCommanderState(key);
        enqueue(() => setCommander(deckId, key));
      }}
      exportName={props.exportName}
    >
      <p className={styles.status} data-status={status} role="status">
        {status === "saving" && "Enregistrement…"}
        {status === "saved" && "✓ Validations enregistrées dans ton compte"}
        {status === "error" && "Impossible d'enregistrer. Vérifie ta connexion : tes derniers choix ne sont pas sauvegardés."}
      </p>
    </ComparisonView>
  );
}

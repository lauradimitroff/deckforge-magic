"use client";

import { useState } from "react";
import type { Side } from "@/hooks/useComparator";
import { cx } from "@/lib/cx";
import { totalCards } from "@/lib/parse";
import type { ParsedDeck } from "@/lib/types";
import styles from "./ImportPanel.module.css";

type Props = {
  textA: string;
  textB: string;
  deckA: ParsedDeck | null;
  deckB: ParsedDeck | null;
  onText: (side: Side, text: string) => void;
  onDemo: () => void;
  onClear: () => void;
};

export default function ImportPanel({ textA, textB, deckA, deckB, onText, onDemo, onClear }: Props) {
  return (
    <section className="panel">
      <div className={styles.imports}>
        <DeckDrop letter="A" title="Deck d'origine" text={textA} deck={deckA} onText={(t) => onText("A", t)} />
        <DeckDrop letter="B" title="Deck modifié" text={textB} deck={deckB} onText={(t) => onText("B", t)} />
      </div>
      <div className={styles.foot}>
        <button type="button" className="ghost" onClick={onDemo}>
          Charger un exemple
        </button>
        <button type="button" className="ghost" onClick={onClear}>
          Tout effacer
        </button>
      </div>
    </section>
  );
}

type DropProps = {
  letter: Side;
  title: string;
  text: string;
  deck: ParsedDeck | null;
  onText: (text: string) => void;
};

function DeckDrop({ letter, title, text, deck, onText }: DropProps) {
  const [editing, setEditing] = useState(false);
  const [over, setOver] = useState(false);

  const readFile = (file?: File) => {
    if (!file) return;
    file.text().then((t) => {
      onText(t);
      setEditing(false);
    });
  };

  let info = "Glisse un .txt ou colle la liste";
  if (deck) {
    info = `${totalCards(deck.cards.values())} cartes · ${deck.cards.size} différentes`;
    const out = totalCards(deck.outside);
    if (out) info += ` · ${out} hors deck ignorées`;
  }

  return (
    <div
      className={cx(styles.drop, deck && styles.loaded, over && styles.over)}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        readFile(e.dataTransfer.files[0]);
      }}
    >
      <div className={styles.head}>
        <div className={styles.title}>
          <span className={cx(styles.letter, "display")}>{letter}</span>
          <div>
            <strong>{title}</strong>
            <small>{info}</small>
          </div>
        </div>
        <div className={styles.actions}>
          {deck && (
            <button type="button" className="ghost" onClick={() => setEditing(!editing)}>
              {editing ? "Masquer" : "Modifier"}
            </button>
          )}
          <label className="btn">
            Importer .txt
            <input
              type="file"
              accept=".txt,text/plain"
              hidden
              onChange={(e) => {
                readFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
      {(!deck || editing) && (
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => onText(e.target.value)}
          placeholder={"1 Sol Ring\n1 Command Tower\n10 Forest\n…"}
          spellCheck={false}
          aria-label={`Liste ${letter} : ${title}`}
        />
      )}
    </div>
  );
}

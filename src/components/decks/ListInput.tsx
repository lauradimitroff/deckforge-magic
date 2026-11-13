"use client";

import { useMemo, useState } from "react";
import { cx } from "@/lib/cx";
import { parseList, totalCards } from "@/lib/parse";
import styles from "./decks.module.css";

/** Champ « liste de cartes » d'un formulaire : coller, importer un .txt ou glisser-déposer. */
export default function ListInput({ name = "listText", label }: { name?: string; label: string }) {
  const [text, setText] = useState("");
  const [over, setOver] = useState(false);
  const count = useMemo(() => (text.trim() ? totalCards(parseList(text).cards.values()) : 0), [text]);

  const readFile = (file?: File) => file?.text().then(setText);

  return (
    <div
      className={cx(styles.listInput, over && styles.over)}
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
      <div className={styles.listHead}>
        <strong>{label}</strong>
        <span className={styles.muted}>{count ? `${count} cartes reconnues` : "Colle la liste, glisse un .txt ou"}</span>
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
      <textarea
        name={name}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"1 Sol Ring\n1 Command Tower\n10 Forest\n…"}
        spellCheck={false}
        required
        aria-label={label}
      />
    </div>
  );
}

"use client";

import type { CSSProperties } from "react";
import { cardName, commanderCandidates } from "@/lib/commander";
import { manaSymbolUrl } from "@/lib/scryfall";
import type { CardDb, ParsedDeck } from "@/lib/types";
import styles from "./CommanderHero.module.css";

type Props = {
  deckA: ParsedDeck;
  deckB: ParsedDeck;
  db: CardDb;
  commander: string | null;
  onChange: (key: string | null) => void;
};

export default function CommanderHero({ deckA, deckB, db, commander, onChange }: Props) {
  const data = commander ? db[commander] : null;
  const name = commander ? cardName(commander, deckA, deckB) : null;
  const style = { "--art": data?.art ? `url("${data.art}")` : "none" } as CSSProperties;
  const { likely, others } = commanderCandidates(deckA, deckB, db);
  const options = (list: typeof likely) =>
    list.map(([k, n]) => (
      <option key={k} value={k}>
        {n}
      </option>
    ));

  return (
    <section className={styles.hero} style={style}>
      <div className={styles.body}>
        <div>
          <div className={styles.eyebrow}>♛ Commandant</div>
          <h2 className="display">{name ?? "Choisis ton commandant"}</h2>
          <div className={styles.type}>
            {data?.type ?? (name ? "" : "Ta liste n'indique pas le commandant : sélectionne-le dans la liste.")}
          </div>
          {data && data.identity.length > 0 && (
            <div className={styles.pips}>
              {data.identity.map((c) => (
                <img key={c} src={manaSymbolUrl(c)} alt={c} />
              ))}
            </div>
          )}
        </div>
        <label className={styles.picker}>
          {name ? "Changer" : "Sélectionner"}
          <select value={commander ?? ""} onChange={(e) => onChange(e.target.value || null)}>
            <option value="">—</option>
            {others.length ? (
              <>
                <optgroup label="Peuvent être commandant">{options(likely)}</optgroup>
                <optgroup label="Autres cartes du deck">{options(others)}</optgroup>
              </>
            ) : (
              options(likely)
            )}
          </select>
        </label>
      </div>
    </section>
  );
}

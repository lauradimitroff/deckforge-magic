"use client";

import { deckStats } from "@/lib/cards";
import { cx } from "@/lib/cx";
import { addListText, onlyChanges } from "@/lib/diff";
import type { CardDb, Decisions, DeckCard, DiffEntry, ParsedDeck } from "@/lib/types";
import styles from "./ResultPanel.module.css";

type Props = {
  deckA: ParsedDeck | null;
  finalDeck: Map<string, DeckCard> | null;
  diff: DiffEntry[];
  decisions: Decisions;
  db: CardDb;
  commander: string | null;
  onExportFinal: () => void;
  onExportChanges: () => void;
  onCopyChanges: () => void;
  onExportAdds: () => void;
  onCopyAdds: () => void;
};

const DECK_SIZE = 100;

export default function ResultPanel(props: Props) {
  const { deckA, finalDeck, diff, decisions, db, commander } = props;
  const changes = onlyChanges(diff);
  const adds = changes.filter((d) => d.type === "add");
  const rems = changes.filter((d) => d.type === "remove");
  const sum = (arr: DiffEntry[]) => arr.reduce((n, d) => n + Math.abs(d.delta), 0);
  const addList = addListText(diff, decisions);

  return (
    <section className="panel">
      <h2 className="display">Résultat</h2>
      {deckA && finalDeck && (
        <Stats deckA={deckA} finalDeck={finalDeck} db={db} done={Object.keys(decisions).length} total={changes.length} />
      )}

      <div className={styles.cols}>
        <ChangeList title={`✖ À retirer (${sum(rems)})`} kind="remove" entries={rems} {...{ decisions, db, commander }} />
        <div>
          <ChangeList title={`➜ À ajouter (${sum(adds)})`} kind="add" entries={adds} {...{ decisions, db, commander }} />
          {adds.length > 0 && <AddListExport {...addList} onCopy={props.onCopyAdds} onDownload={props.onExportAdds} />}
        </div>
      </div>

      <div className={styles.exports}>
        <button type="button" className="primary" onClick={props.onExportFinal}>
          Exporter le deck final .txt
        </button>
        <button type="button" onClick={props.onCopyChanges}>
          Copier les changements
        </button>
        <button type="button" onClick={props.onExportChanges}>
          Exporter les changements .txt
        </button>
      </div>
    </section>
  );
}

function Stats({
  deckA,
  finalDeck,
  db,
  done,
  total,
}: {
  deckA: ParsedDeck;
  finalDeck: Map<string, DeckCard>;
  db: CardDb;
  done: number;
  total: number;
}) {
  const before = deckStats(deckA.cards.values(), db);
  const after = deckStats(finalDeck.values(), db);
  const known = before.complete && after.complete;
  const pct = total ? Math.round((100 * done) / total) : 100;
  const n = after.count;
  const sizeNote =
    n === DECK_SIZE
      ? " ✓"
      : n > DECK_SIZE
        ? ` · ${n - DECK_SIZE} de trop`
        : ` · ${DECK_SIZE - n} manquante${DECK_SIZE - n > 1 ? "s" : ""}`;

  const compare = (x: number, y: number, decimals = 0) => {
    const [a, b] = [x.toFixed(decimals), y.toFixed(decimals)];
    return a === b ? b : (
      <>
        {b} <small>({a} avant)</small>
      </>
    );
  };

  return (
    <div className={styles.stats}>
      <div className={styles.stat}>
        <div className={styles.k}>Validé</div>
        <div className={styles.v}>
          {done}
          <small> / {total}</small>
        </div>
        <div className={styles.progress}>
          <div style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className={cx(styles.stat, n === DECK_SIZE ? styles.ok : styles.warn)}>
        <div className={styles.k}>Deck final</div>
        <div className={styles.v}>
          {n}
          <small>
            {" "}
            carte{n > 1 ? "s" : ""}
            {sizeNote}
          </small>
        </div>
      </div>
      <div className={styles.stat}>
        <div className={styles.k}>Terrains</div>
        <div className={styles.v}>{known ? compare(before.lands, after.lands) : "…"}</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.k}>Coût moyen</div>
        <div className={styles.v}>{known ? compare(before.avgCmc, after.avgCmc, 2) : "…"}</div>
      </div>
    </div>
  );
}

function AddListExport({
  count,
  validatedOnly,
  onCopy,
  onDownload,
}: {
  count: number;
  validatedOnly: boolean;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <div className={styles.addExport}>
      <p>
        Exporter cette liste : {count} carte{count > 1 ? "s" : ""}{" "}
        {validatedOnly ? "validée" + (count > 1 ? "s" : "") : "(tous les ajouts, rien n'est encore validé)"}
      </p>
      <div>
        <button type="button" onClick={onCopy}>
          Copier la liste
        </button>
        <button type="button" onClick={onDownload}>
          Télécharger .txt
        </button>
      </div>
    </div>
  );
}

function ChangeList({
  title,
  kind,
  entries,
  decisions,
  db,
  commander,
}: {
  title: string;
  kind: "add" | "remove";
  entries: DiffEntry[];
  decisions: Decisions;
  db: CardDb;
  commander: string | null;
}) {
  return (
    <div>
      <h3 className={styles[kind]}>{title}</h3>
      <ul>
        {entries.length === 0 && <li className={styles.pending}>—</li>}
        {entries.map((d) => {
          const ok = !!decisions[d.key];
          const art = db[d.key]?.art;
          return (
            <li key={d.key} className={cx(styles[kind], ok ? styles.done : styles.pending)} data-hover={d.key}>
              <span className={styles.mark}>{ok ? "✓" : "·"}</span>
              {art && <img src={art} alt="" loading="lazy" />}
              <span>
                {Math.abs(d.delta)} {d.name}
                {d.key === commander && <span className="crown"> ♛</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

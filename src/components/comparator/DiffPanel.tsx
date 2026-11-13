"use client";

import { useState } from "react";
import CardArt from "@/components/cards/CardArt";
import CardRow from "@/components/cards/CardRow";
import CardTile from "@/components/cards/CardTile";
import type { CardDbState } from "@/hooks/useCardDb";
import type { Filter, ViewMode, ViewPrefs } from "@/hooks/useViewPrefs";
import { cx } from "@/lib/cx";
import { onlyChanges } from "@/lib/diff";
import { groupEntries, hasCategories, type GroupBy } from "@/lib/grouping";
import type { CardDb, Decisions, DiffEntry } from "@/lib/types";
import styles from "./DiffPanel.module.css";

type Props = {
  ready: boolean;
  diff: DiffEntry[];
  decisions: Decisions;
  cards: CardDbState;
  commander: string | null;
  view: ViewMode;
  filter: Filter;
  groupBy: GroupBy;
  onUpdate: (patch: Partial<ViewPrefs>) => void;
  onToggle: (key: string) => void;
  onValidateAll: () => void;
  onReset: () => void;
  onPreview: (key: string) => void;
};

const VIEWS: [ViewMode, string][] = [
  ["cards", "Cartes"],
  ["list", "Liste"],
];
const FILTERS: [Filter, string][] = [
  ["all", "Tout"],
  ["pending", "En attente"],
  ["done", "Validées"],
];

export default function DiffPanel(props: Props) {
  const { ready, diff, cards, view, filter, onUpdate } = props;
  const changes = onlyChanges(diff);
  const catsAvailable = hasCategories(changes);
  const groupBy: GroupBy = props.groupBy === "cat" && !catsAvailable ? "type" : props.groupBy;

  return (
    <section className="panel">
      <div className={styles.toolbar}>
        <div className={styles.titleRow}>
          <h2 className="display">Différences</h2>
          <CardStatus cards={cards} />
        </div>
        <div className={styles.tools}>
          <Segmented options={VIEWS} value={view} onChange={(v) => onUpdate({ view: v })} label="Affichage" />
          <Segmented options={FILTERS} value={filter} onChange={(f) => onUpdate({ filter: f })} label="Filtre" />
          <select
            value={groupBy}
            onChange={(e) => onUpdate({ groupBy: e.target.value as GroupBy })}
            aria-label="Grouper par"
          >
            <option value="type">Par type de carte</option>
            {catsAvailable && <option value="cat">Par catégorie Archidekt</option>}
            <option value="none">Sans regroupement</option>
          </select>
          <button type="button" onClick={props.onValidateAll}>
            Tout valider
          </button>
          <button type="button" className="ghost" onClick={props.onReset}>
            Réinitialiser
          </button>
        </div>
      </div>

      {!ready ? (
        <div className="empty">Importe les deux listes pour voir les différences.</div>
      ) : !changes.length ? (
        <div className="empty">Les deux listes sont identiques.</div>
      ) : (
        <div className={styles.cols}>
          {/* Même ordre que l'import : deck d'origine à gauche, deck modifié à droite. */}
          <DiffColumn kind="remove" {...props} groupBy={groupBy} />
          <DiffColumn kind="add" {...props} groupBy={groupBy} />
        </div>
      )}

      {ready && <SameCards diff={diff} db={cards.db} commander={props.commander} onPreview={props.onPreview} />}
    </section>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={v === value} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  );
}

function CardStatus({ cards }: { cards: CardDbState }) {
  if (cards.error)
    return (
      <span className={cx(styles.status, styles.err)}>
        Images indisponibles (connexion ?)
        <button type="button" className="ghost" onClick={cards.retry}>
          Réessayer
        </button>
      </span>
    );
  if (cards.loading) return <span className={styles.status}>Chargement des images… {cards.remaining} restantes</span>;
  return null;
}

function DiffColumn({
  kind,
  diff,
  decisions,
  cards,
  commander,
  view,
  filter,
  groupBy,
  onToggle,
  onPreview,
}: Props & { kind: "add" | "remove" }) {
  const all = diff.filter((d) => d.type === kind);
  const shown = all.filter((d) =>
    filter === "pending" ? !decisions[d.key] : filter === "done" ? !!decisions[d.key] : true,
  );
  const doneN = all.filter((d) => decisions[d.key]).length;
  const count = all.reduce((n, d) => n + Math.abs(d.delta), 0);

  let body;
  if (!all.length) body = <div className="empty">{kind === "add" ? "Aucune carte à ajouter." : "Aucune carte à retirer."}</div>;
  else if (!shown.length) body = <div className="empty">Rien pour ce filtre.</div>;
  else {
    const groups = groupEntries(shown, groupBy, cards.db);
    const item = (d: DiffEntry) => {
      const common = {
        entry: d,
        data: cards.db[d.key],
        done: !!decisions[d.key],
        isCommander: d.key === commander,
        onToggle,
      };
      return view === "cards" ? (
        <CardTile key={d.key} {...common} onPreview={onPreview} />
      ) : (
        <CardRow key={d.key} {...common} />
      );
    };
    body = (
      <div className={view === "cards" ? styles.groups : undefined}>
        {groups.map(([label, items]) => (
          <div key={label} className={view === "cards" ? styles.group : undefined}>
            {label ? (
              <div className={styles.groupTitle}>
                {label} · {items.length}
              </div>
            ) : (
              <div className={styles.spacer} />
            )}
            <div className={view === "cards" ? styles.tiles : styles.rows}>{items.map(item)}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cx(styles.col, styles[kind])}>
      <div className={styles.colHead}>
        <h3>{kind === "add" ? "➜ Cartes à ajouter" : "✖ Cartes à retirer"}</h3>
        <span>
          {count} carte{count > 1 ? "s" : ""} · {doneN}/{all.length} validée{doneN > 1 ? "s" : ""}
        </span>
      </div>
      <p className={styles.colHint}>
        {kind === "add"
          ? "Dans le deck modifié, mais pas dans le deck d'origine."
          : "Dans le deck d'origine, mais plus dans le deck modifié."}
      </p>
      {body}
    </div>
  );
}

function SameCards({
  diff,
  db,
  commander,
  onPreview,
}: {
  diff: DiffEntry[];
  db: CardDb;
  commander: string | null;
  onPreview: (key: string) => void;
}) {
  // Les images ne sont chargées qu'à l'ouverture du bloc.
  const [open, setOpen] = useState(false);
  const same = diff
    .filter((d) => d.type === "same")
    .sort((x, y) => Number(y.key === commander) - Number(x.key === commander) || x.name.localeCompare(y.name, "fr"));
  if (!same.length) return null;
  const total = same.reduce((n, d) => n + d.qa, 0);

  return (
    <details className={styles.same} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Cartes inchangées ({total})</summary>
      {open && (
        <div className={styles.sameGrid}>
          {same.map((d) => (
            <CardArt
              key={d.key}
              name={d.name}
              src={db[d.key]?.small}
              badge={d.qa > 1 ? { label: String(d.qa), tone: "neutral" } : undefined}
              crown={d.key === commander}
              onClick={() => onPreview(d.key)}
            />
          ))}
        </div>
      )}
    </details>
  );
}

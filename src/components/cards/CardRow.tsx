import { cx } from "@/lib/cx";
import { deltaLabel } from "@/lib/diff";
import type { CardData, DiffEntry } from "@/lib/types";
import ActionButton from "./ActionButton";
import styles from "./CardRow.module.css";

type Props = {
  entry: DiffEntry;
  data: CardData | null | undefined;
  done: boolean;
  isCommander: boolean;
  onToggle: (key: string) => void;
};

/** Vue « Liste » : miniature, nom, type et bouton ; la carte s'affiche au survol (data-hover). */
export default function CardRow({ entry, data, done, isCommander, onToggle }: Props) {
  const kind = entry.type === "add" ? "add" : "remove";
  return (
    <div className={cx(styles.row, done && styles[kind])} data-hover={entry.key}>
      {data?.art ? <img className={styles.thumb} src={data.art} alt="" loading="lazy" /> : <span className={styles.thumb} />}
      <div>
        <div className={styles.name}>
          {entry.name}
          {isCommander && (
            <span className="crown" title="Commandant">
              {" "}
              ♛
            </span>
          )}
        </div>
        <div className={styles.type}>{data?.type}</div>
      </div>
      <span className={styles.qty}>{deltaLabel(entry)}</span>
      <ActionButton kind={kind} done={done} cardName={entry.name} compact onClick={() => onToggle(entry.key)} />
    </div>
  );
}

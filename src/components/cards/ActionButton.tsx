import { cx } from "@/lib/cx";
import styles from "./ActionButton.module.css";

type Props = {
  kind: "add" | "remove";
  done: boolean;
  cardName: string;
  /** Icône seule (vue liste) ou icône + libellé (vue cartes). */
  compact?: boolean;
  onClick: () => void;
};

/** Flèche verte (ajouter) ou croix rouge (retirer) ; un second clic annule. */
export default function ActionButton({ kind, done, cardName, compact, onClick }: Props) {
  const label = kind === "add" ? (done ? "Ajoutée" : "Ajouter") : done ? "Retirée" : "Retirer";
  const icon = done ? "✓" : kind === "add" ? "➜" : "✖";
  return (
    <button
      type="button"
      className={cx(styles.act, styles[kind], done && styles.on, compact && styles.compact)}
      onClick={onClick}
      aria-pressed={done}
      title={`${kind === "add" ? "Ajouter" : "Retirer"} ${cardName}`}
    >
      <span className={styles.icon}>{icon}</span>
      {!compact && <span>{label}</span>}
    </button>
  );
}

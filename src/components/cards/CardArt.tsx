import { cx } from "@/lib/cx";
import styles from "./CardArt.module.css";

export type BadgeTone = "add" | "remove" | "neutral";

type Props = {
  name: string;
  src?: string;
  /** Effet visuel une fois le changement validé. */
  state?: "added" | "removed";
  badge?: { label: string; tone: BadgeTone };
  crown?: boolean;
  onClick?: () => void;
};

/** Image de carte cliquable (agrandissement), avec badge de quantité et couronne du commandant. */
export default function CardArt({ name, src, state, badge, crown, onClick }: Props) {
  return (
    <button
      type="button"
      className={cx(styles.art, state && styles[state])}
      onClick={onClick}
      aria-label={`Agrandir ${name}`}
    >
      {src ? <img src={src} alt={name} loading="lazy" /> : <span className={styles.placeholder}>{name}</span>}
      {badge && <span className={cx(styles.badge, styles[badge.tone])}>{badge.label}</span>}
      {crown && (
        <span className={styles.crown} title="Commandant">
          ♛
        </span>
      )}
    </button>
  );
}

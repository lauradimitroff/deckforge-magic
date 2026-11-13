import { deltaLabel } from "@/lib/diff";
import type { CardData, DiffEntry } from "@/lib/types";
import ActionButton from "./ActionButton";
import CardArt from "./CardArt";
import styles from "./CardTile.module.css";

type Props = {
  entry: DiffEntry;
  data: CardData | null | undefined;
  done: boolean;
  isCommander: boolean;
  onToggle: (key: string) => void;
  onPreview: (key: string) => void;
};

/** Vue « Cartes » : l'image de la carte et son bouton ajouter / retirer. */
export default function CardTile({ entry, data, done, isCommander, onToggle, onPreview }: Props) {
  const kind = entry.type === "add" ? "add" : "remove";
  return (
    <div className={styles.tile}>
      <CardArt
        name={entry.name}
        src={data?.normal}
        state={done ? (kind === "add" ? "added" : "removed") : undefined}
        badge={{ label: deltaLabel(entry), tone: kind }}
        crown={isCommander}
        onClick={() => onPreview(entry.key)}
      />
      <ActionButton kind={kind} done={done} cardName={entry.name} onClick={() => onToggle(entry.key)} />
    </div>
  );
}

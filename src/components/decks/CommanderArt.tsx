import { cardImageUrl } from "@/lib/scryfall";
import styles from "./decks.module.css";

/** Illustration du commandant (via Scryfall), ou un motif neutre s'il n'est pas choisi. */
export default function CommanderArt({ commanderKey }: { commanderKey: string | null }) {
  if (!commanderKey) return <div className={styles.artFallback} aria-hidden="true">♛</div>;
  return <img className={styles.art} src={cardImageUrl(commanderKey, "art_crop")} alt="" loading="lazy" />;
}

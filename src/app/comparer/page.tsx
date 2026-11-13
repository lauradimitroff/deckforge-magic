import Link from "next/link";
import ComparatorLoader from "@/components/comparator/ComparatorLoader";
import styles from "./page.module.css";

export const metadata = { title: "Comparaison rapide · Deckforge" };

export default function QuickComparePage() {
  return (
    <>
      <header className={styles.header}>
        <h1 className="display">
          Comparaison <span>rapide</span>
        </h1>
        <p>
          Importe ton deck d&apos;origine et ton deck modifié, puis valide chaque échange de cartes. Tout reste dans
          ce navigateur. Pour garder tes decks et toutes leurs versions,{" "}
          <Link href="/decks">sauvegarde-les dans ton compte</Link>.
        </p>
      </header>
      <ComparatorLoader />
    </>
  );
}

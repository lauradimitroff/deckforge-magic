import Link from "next/link";
import styles from "@/components/decks/decks.module.css";
import { NewDeckForm } from "@/components/decks/forms";

export const metadata = { title: "Nouveau deck · Deckforge" };

export default function NewDeckPage() {
  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.crumbs}>
            <Link href="/decks">Mes decks</Link> ›
          </div>
          <h1 className="display">Nouveau deck</h1>
          <p>Importe la liste de départ. Tu pourras ensuite ajouter tes versions modifiées et les comparer.</p>
        </div>
      </div>
      <section className="panel">
        <NewDeckForm />
      </section>
    </>
  );
}

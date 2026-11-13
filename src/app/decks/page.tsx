import Link from "next/link";
import { Suspense } from "react";
import CommanderArt from "@/components/decks/CommanderArt";
import styles from "@/components/decks/decks.module.css";
import { listDecks } from "@/db/queries";
import { requireUser } from "@/lib/auth/dal";
import { formatDate, plural } from "@/lib/format";

export const metadata = { title: "Mes decks · Deckforge" };

export default function DecksPage() {
  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className="display">Mes decks</h1>
          <p>Chaque deck garde toutes ses versions. Compare-les deux à deux quand tu veux.</p>
        </div>
        <Link href="/decks/new" className={styles.btnLink}>
          + Nouveau deck
        </Link>
      </div>
      <Suspense fallback={<div className="panel empty">Chargement de tes decks…</div>}>
        <DeckList />
      </Suspense>
    </>
  );
}

async function DeckList() {
  const user = await requireUser();
  const decks = await listDecks(user.id);

  if (!decks.length)
    return (
      <div className={`panel ${styles.emptyState}`}>
        <h2 className="display">Aucun deck pour l&apos;instant</h2>
        <p>Importe ton deck d&apos;origine pour commencer, puis ajoute tes versions modifiées.</p>
        <Link href="/decks/new" className={styles.btnLink}>
          Créer mon premier deck
        </Link>
      </div>
    );

  return (
    <div className={styles.grid}>
      {decks.map((d) => (
        <Link key={d.id} href={`/decks/${d.id}`} className={styles.deckCard}>
          <CommanderArt commanderKey={d.commanderKey} />
          <div className={styles.body}>
            <h2 className="display">{d.name}</h2>
            <div className={styles.muted}>
              {plural(d.versionCount, "version")} · {d.latestCardCount} cartes · modifié le {formatDate(d.updatedAt)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import styles from "@/components/decks/decks.module.css";
import { AddVersionForm, DeckActions, DeleteVersionButton } from "@/components/decks/forms";
import { getDeck } from "@/db/queries";
import { requireUser } from "@/lib/auth/dal";
import { formatDate, plural } from "@/lib/format";

export default function DeckPage({ params }: PageProps<"/decks/[id]">) {
  return (
    <Suspense fallback={<div className="panel empty">Chargement du deck…</div>}>
      <DeckDetail params={params} />
    </Suspense>
  );
}

async function DeckDetail({ params }: Pick<PageProps<"/decks/[id]">, "params">) {
  const { id } = await params;
  const user = await requireUser();
  const found = await getDeck(user.id, id);
  if (!found) notFound();
  const { deck, versions } = found;
  const last = versions.at(-1);
  const beforeLast = versions.at(-2);
  const compareUrl = (fromId: string, toId: string) => `/decks/${deck.id}/compare?from=${fromId}&to=${toId}`;

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.crumbs}>
            <Link href="/decks">Mes decks</Link> ›
          </div>
          <h1 className="display">{deck.name}</h1>
          <p>
            {plural(versions.length, "version")} · créé le {formatDate(deck.createdAt)}
          </p>
        </div>
        <DeckActions deckId={deck.id} name={deck.name} />
      </div>

      <div className={styles.twoCols}>
        <section className="panel">
          <h2 className={`display ${styles.panelTitle}`}>Versions</h2>
          <ol className={styles.versions} reversed>
            {[...versions].reverse().map((v, i, list) => {
              const prev = list[i + 1];
              return (
                <li key={v.id} className={styles.version}>
                  <span className={styles.vnum}>v{v.number}</span>
                  <div className={styles.vmeta}>
                    <strong>{v.note || (v.number === 1 ? "Deck d'origine" : `Version ${v.number}`)}</strong>
                    <span className={styles.muted}>
                      {v.cardCount} cartes · {formatDate(v.createdAt)}
                    </span>
                  </div>
                  <div className={styles.vactions}>
                    {prev && (
                      <Link href={compareUrl(prev.id, v.id)} className={`${styles.btnLink} ${styles.secondary} ${styles.small}`}>
                        Comparer avec v{prev.number}
                      </Link>
                    )}
                    {versions.length > 1 && <DeleteVersionButton deckId={deck.id} versionId={v.id} number={v.number} />}
                  </div>
                </li>
              );
            })}
          </ol>

          {versions.length > 2 && last && beforeLast && (
            <form action={`/decks/${deck.id}/compare`} className={styles.compareForm}>
              Comparer
              <select name="from" defaultValue={versions[0].id} aria-label="Version de départ">
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    v{v.number}
                  </option>
                ))}
              </select>
              avec
              <select name="to" defaultValue={last.id} aria-label="Version d'arrivée">
                {versions.map((v) => (
                  <option key={v.id} value={v.id}>
                    v{v.number}
                  </option>
                ))}
              </select>
              <button type="submit">Comparer</button>
            </form>
          )}
        </section>

        <section className="panel">
          <h2 className={`display ${styles.panelTitle}`}>Ajouter une version</h2>
          <AddVersionForm deckId={deck.id} nextNumber={(last?.number ?? 0) + 1} />
        </section>
      </div>
    </>
  );
}

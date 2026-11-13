import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import SavedComparatorLoader from "@/components/comparator/SavedComparatorLoader";
import styles from "@/components/decks/decks.module.css";
import { getComparison } from "@/db/queries";
import { requireUser } from "@/lib/auth/dal";

export default function ComparePage({ params, searchParams }: PageProps<"/decks/[id]/compare">) {
  return (
    <Suspense fallback={<div className="panel empty">Chargement de la comparaison…</div>}>
      <Compare params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Compare({ params, searchParams }: Pick<PageProps<"/decks/[id]/compare">, "params" | "searchParams">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const user = await requireUser();
  const from = typeof query.from === "string" ? query.from : "";
  const to = typeof query.to === "string" ? query.to : "";
  const data = await getComparison(user.id, id, from, to);
  if (!data) notFound();
  const { deck, versions } = data;

  const fileName = `${deck.name} v${data.to.number}`.replace(/[^\p{L}\p{N} ,'-]+/gu, "").trim() || "deck-final";

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.crumbs}>
            <Link href="/decks">Mes decks</Link> › <Link href={`/decks/${deck.id}`}>{deck.name}</Link> ›
          </div>
          <h1 className="display">
            v{data.from.number} → v{data.to.number}
          </h1>
          <p>
            {data.from.note || `Version ${data.from.number}`} → {data.to.note || `Version ${data.to.number}`}
          </p>
        </div>
        <form action={`/decks/${deck.id}/compare`} className={styles.inlineActions}>
          <select name="from" defaultValue={data.from.id} aria-label="Version de départ">
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.number}
              </option>
            ))}
          </select>
          <select name="to" defaultValue={data.to.id} aria-label="Version d'arrivée">
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.number}
              </option>
            ))}
          </select>
          <button type="submit">Changer</button>
        </form>
      </div>

      <SavedComparatorLoader
        key={`${data.from.id}-${data.to.id}`}
        deckId={deck.id}
        fromId={data.from.id}
        toId={data.to.id}
        textA={data.from.listText}
        textB={data.to.listText}
        initialDecisions={data.decisions}
        initialCommander={deck.commanderKey}
        exportName={fileName}
      />
    </>
  );
}

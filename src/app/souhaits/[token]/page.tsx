import { notFound } from "next/navigation";
import { Suspense } from "react";
import styles from "@/components/decks/decks.module.css";
import WishGrid from "@/components/wishlist/WishGridLoader";
import { getSharedWishlist } from "@/db/queries";

// Page publique (sans connexion), mais pas destinée aux moteurs de recherche.
export const metadata = { title: "Liste de souhaits · Deckforge", robots: { index: false, follow: false } };

export default function SharedWishlistPage({ params }: PageProps<"/souhaits/[token]">) {
  return (
    <Suspense fallback={<div className="panel empty">Chargement de la liste…</div>}>
      <SharedWishlist params={params} />
    </Suspense>
  );
}

async function SharedWishlist({ params }: Pick<PageProps<"/souhaits/[token]">, "params">) {
  const { token } = await params;
  const list = await getSharedWishlist(token);
  if (!list) notFound();
  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className="display">Liste de souhaits de {list.ownerName}</h1>
          <p>Les cartes que {list.ownerName} cherche encore.</p>
        </div>
      </div>
      <section className="panel">
        {list.items.length ? (
          <WishGrid items={list.items} editable={false} />
        ) : (
          <div className={styles.emptyState}>
            <h2 className="display">Liste vide pour l&apos;instant</h2>
          </div>
        )}
      </section>
    </>
  );
}

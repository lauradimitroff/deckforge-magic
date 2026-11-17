import { Suspense } from "react";
import styles from "@/components/decks/decks.module.css";
import AddWishForm from "@/components/wishlist/AddWishForm";
import ShareBox from "@/components/wishlist/ShareBox";
import WishGrid from "@/components/wishlist/WishGridLoader";
import ws from "@/components/wishlist/wishlist.module.css";
import { getShareToken, listWishlist } from "@/db/queries";
import { requireUser } from "@/lib/auth/dal";

export const metadata = { title: "Ma liste de souhaits · Deckforge" };

export default function WishlistPage() {
  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1 className="display">Ma liste de souhaits</h1>
          <p>Les cartes que tu n&apos;as pas encore. Partage la liste pour qu&apos;on sache quoi t&apos;offrir ou t&apos;échanger.</p>
        </div>
      </div>
      <Suspense fallback={<div className="panel empty">Chargement de ta liste…</div>}>
        <Wishlist />
      </Suspense>
    </>
  );
}

async function Wishlist() {
  const user = await requireUser();
  const [items, token] = await Promise.all([listWishlist(user.id), getShareToken(user.id)]);
  return (
    <>
      <div className={ws.top}>
        <section className="panel">
          <h2 className={`display ${ws.panelTitle}`}>Ajouter des cartes</h2>
          <AddWishForm />
        </section>
        <section className="panel">
          <h2 className={`display ${ws.panelTitle}`}>Partager</h2>
          <ShareBox token={token} />
        </section>
      </div>
      <section className="panel" style={{ marginTop: 20 }}>
        {items.length ? (
          <WishGrid items={items} editable />
        ) : (
          <div className={styles.emptyState}>
            <h2 className="display">Ta liste est vide</h2>
            <p>Ajoute une première carte ci-dessus.</p>
          </div>
        )}
      </section>
    </>
  );
}

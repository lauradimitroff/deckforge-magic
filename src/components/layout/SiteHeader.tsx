import Link from "next/link";
import { Suspense } from "react";
import { getUser } from "@/lib/auth/dal";
import SignOutButton from "./SignOutButton";
import styles from "./SiteHeader.module.css";

/** Barre du haut : logo, navigation et compte (la partie compte arrive après la lecture de session). */
export default function SiteHeader() {
  return (
    <header className={styles.bar}>
      <Link href="/" className={`${styles.brand} display`}>
        <span>♛</span> Deckforge
      </Link>
      <nav className={styles.nav}>
        <Link href="/comparer">Comparaison rapide</Link>
        <Link href="/decks">Mes decks</Link>
        <Suspense fallback={<span className={styles.placeholder} />}>
          <Account />
        </Suspense>
      </nav>
    </header>
  );
}

async function Account() {
  const user = await getUser();
  if (!user)
    return (
      <Link href="/auth/sign-in" className={styles.cta}>
        Se connecter
      </Link>
    );
  return (
    <span className={styles.account}>
      <span className={styles.avatar} aria-hidden="true">
        {(user.name || user.email).slice(0, 1).toUpperCase()}
      </span>
      <span className={styles.name}>{user.name || user.email}</span>
      <SignOutButton />
    </span>
  );
}

"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { newShareLink, stopSharing } from "@/app/souhaits/actions";
import styles from "./wishlist.module.css";

const noop = () => () => {};

/** Lien public de la liste : le créer, le copier, le remplacer ou le désactiver. */
export default function ShareBox({ token }: { token: string | null }) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  // L'adresse du site n'est connue que dans le navigateur (local ou en ligne).
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");

  if (!token)
    return (
      <div className={styles.share}>
        <p className={styles.muted}>
          Ta liste est privée. Crée un lien pour la montrer à qui tu veux : pas besoin de compte pour la consulter.
        </p>
        <button type="button" className="primary" disabled={pending} onClick={() => start(() => newShareLink())}>
          {pending ? "Un instant…" : "Créer un lien de partage"}
        </button>
      </div>
    );

  const url = `${origin}/souhaits/${token}`;
  return (
    <div className={styles.share}>
      <p className={styles.muted}>Toute personne qui a ce lien peut voir ta liste (sans pouvoir la modifier).</p>
      <div className={styles.oneRow}>
        <input type="text" readOnly value={url} aria-label="Lien de partage" onFocus={(e) => e.currentTarget.select()} />
        <button
          type="button"
          className="primary"
          onClick={() =>
            navigator.clipboard.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            })
          }
        >
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
      <div className={styles.shareActions}>
        <a href={`/souhaits/${token}`} target="_blank" rel="noreferrer">
          Voir comme les autres ↗
        </a>
        <button
          type="button"
          className="ghost"
          disabled={pending}
          onClick={() => {
            if (confirm("Créer un nouveau lien ? L'ancien ne fonctionnera plus.")) start(() => newShareLink());
          }}
        >
          Nouveau lien
        </button>
        <button
          type="button"
          className={`ghost ${styles.danger}`}
          disabled={pending}
          onClick={() => {
            if (confirm("Arrêter le partage ? Le lien actuel ne fonctionnera plus.")) start(() => stopSharing());
          }}
        >
          Arrêter le partage
        </button>
      </div>
    </div>
  );
}

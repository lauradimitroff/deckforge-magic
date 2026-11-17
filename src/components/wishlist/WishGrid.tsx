"use client";

import { useMemo, useState, useTransition } from "react";
import { removeWish, setWishNote, setWishQty } from "@/app/souhaits/actions";
import CardArt from "@/components/cards/CardArt";
import { CardModal } from "@/components/comparator/Overlays";
import type { WishItem } from "@/db/queries";
import { useCardDb } from "@/hooks/useCardDb";
import { mainType, OTHER_GROUP, TYPE_GROUPS } from "@/lib/cards";
import { plural } from "@/lib/format";
import { downloadText } from "@/lib/storage";
import styles from "./wishlist.module.css";

const cardmarketUrl = (name: string) =>
  `https://www.cardmarket.com/fr/Magic/Products/Search?searchString=${encodeURIComponent(name)}`;

const listText = (items: WishItem[]) => items.map((i) => `${i.qty} ${i.name}`).join("\n");

/** Cartes de la liste, regroupées par type. `editable` : boutons quantité, note et retrait. */
export default function WishGrid({ items, editable }: { items: WishItem[]; editable: boolean }) {
  const pairs = useMemo(() => items.map((i): [string, string] => [i.key, i.name]), [items]);
  const { db, loading } = useCardDb(pairs);
  const [zoom, setZoom] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);

  const groups = useMemo(() => {
    const map = new Map<string, WishItem[]>();
    for (const i of items) {
      const g = mainType(db[i.key]);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(i);
    }
    const order = TYPE_GROUPS.map(([, fr]) => fr);
    const rank = (g: string) => (g === OTHER_GROUP ? 99 : order.indexOf(g));
    return [...map].sort((a, b) => rank(a[0]) - rank(b[0]));
  }, [items, db]);

  const total = items.reduce((n, i) => n + i.qty, 0);

  return (
    <>
      <div className={styles.gridHead}>
        <span className={styles.muted}>
          {plural(total, "carte")}
          {loading && " · chargement des images…"}
        </span>
        <div className={styles.shareActions}>
          <button
            type="button"
            className="ghost"
            onClick={() =>
              navigator.clipboard.writeText(listText(items)).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              })
            }
          >
            {copied ? "Copiée !" : "Copier la liste"}
          </button>
          <button type="button" className="ghost" onClick={() => downloadText("liste-de-souhaits.txt", listText(items))}>
            Télécharger .txt
          </button>
        </div>
      </div>

      {groups.map(([group, list]) => (
        <section key={group} className={styles.group}>
          <h3 className={`display ${styles.groupTitle}`}>
            {group} <span className={styles.muted}>{list.reduce((n, i) => n + i.qty, 0)}</span>
          </h3>
          <div className={styles.tiles}>
            {list.map((item) => (
              <WishTile
                key={item.id}
                item={item}
                src={db[item.key]?.normal}
                editable={editable}
                onZoom={() => setZoom(db[item.key]?.large)}
              />
            ))}
          </div>
        </section>
      ))}

      <CardModal src={zoom} onClose={() => setZoom(undefined)} />
    </>
  );
}

function WishTile({ item, src, editable, onZoom }: { item: WishItem; src?: string; editable: boolean; onZoom: () => void }) {
  const [pending, start] = useTransition();
  return (
    <div className={styles.tile} aria-busy={pending}>
      <CardArt
        name={item.name}
        src={src}
        badge={item.qty > 1 ? { label: `×${item.qty}`, tone: "neutral" } : undefined}
        onClick={onZoom}
      />
      <div className={styles.tileName} title={item.name}>
        {item.name}
      </div>
      {item.note && <div className={styles.note}>{item.note}</div>}

      {editable ? (
        <div className={styles.controls}>
          <button
            type="button"
            className="ghost"
            disabled={pending}
            aria-label={`Un exemplaire de moins : ${item.name}`}
            onClick={() => start(() => setWishQty(item.id, item.qty - 1))}
          >
            −
          </button>
          <span className={styles.qty}>{item.qty}</span>
          <button
            type="button"
            className="ghost"
            disabled={pending}
            aria-label={`Un exemplaire de plus : ${item.name}`}
            onClick={() => start(() => setWishQty(item.id, item.qty + 1))}
          >
            +
          </button>
          <button
            type="button"
            className="ghost"
            disabled={pending}
            title="Ajouter une note"
            aria-label={`Note pour ${item.name}`}
            onClick={() => {
              const note = prompt(`Note pour ${item.name} (ex. « version foil ») :`, item.note ?? "");
              if (note !== null) start(() => setWishNote(item.id, note));
            }}
          >
            ✎
          </button>
          <button
            type="button"
            className={`ghost ${styles.danger}`}
            disabled={pending}
            title="Retirer de la liste"
            aria-label={`Retirer ${item.name}`}
            onClick={() => start(() => removeWish(item.id))}
          >
            ✕
          </button>
        </div>
      ) : (
        <a className={styles.buy} href={cardmarketUrl(item.name)} target="_blank" rel="noreferrer">
          Cardmarket ↗
        </a>
      )}
    </div>
  );
}

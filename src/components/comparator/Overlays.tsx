"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/cx";
import type { CardDb } from "@/lib/types";
import styles from "./Overlays.module.css";

/** Carte en grand ; se ferme au clic ou avec Échap. */
export function CardModal({ src, onClose }: { src?: string; onClose: () => void }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [src, onClose]);

  return (
    <div className={cx(styles.modal, src && styles.show)} onClick={onClose} aria-hidden={!src}>
      {src && <img src={src} alt="" />}
    </div>
  );
}

const PREVIEW_W = 220;
const PREVIEW_H = 306;

/** Aperçu qui suit la souris au survol d'un élément portant `data-hover="<clé de carte>"`. */
export function HoverPreview({ db }: { db: CardDb }) {
  const [hover, setHover] = useState<{ src: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const place = (e: MouseEvent, src: string) => {
      let x = e.clientX + 24;
      if (x + PREVIEW_W > innerWidth - 8) x = e.clientX - PREVIEW_W - 24;
      const y = Math.max(8, Math.min(e.clientY - PREVIEW_H / 2, innerHeight - PREVIEW_H - 8));
      setHover({ src, x, y });
    };
    const onMove = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-hover]");
      const src = el ? db[el.getAttribute("data-hover")!]?.normal : undefined;
      if (src) place(e, src);
      else setHover(null);
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [db]);

  if (!hover) return null;
  return <img className={styles.hover} src={hover.src} alt="" style={{ left: hover.x, top: hover.y }} />;
}

export function Toast({ message }: { message: string | null }) {
  return (
    <div className={cx(styles.toast, message && styles.show)} role="status">
      {message}
    </div>
  );
}

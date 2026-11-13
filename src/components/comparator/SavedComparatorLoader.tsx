"use client";

import dynamic from "next/dynamic";
import type { SavedComparatorProps } from "./SavedComparator";

// Comme la comparaison rapide, le comparateur lit le cache d'images du navigateur : rendu côté client.
const SavedComparator = dynamic(() => import("./SavedComparator"), {
  ssr: false,
  loading: () => <div className="panel empty">Chargement du comparateur…</div>,
});

export default function SavedComparatorLoader(props: SavedComparatorProps) {
  return <SavedComparator {...props} />;
}

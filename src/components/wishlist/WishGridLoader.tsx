"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type WishGridType from "./WishGrid";

// La grille lit le cache d'images du navigateur (localStorage) : rendu côté client, comme le comparateur.
const WishGrid = dynamic(() => import("./WishGrid"), {
  ssr: false,
  loading: () => <div className="empty">Chargement des cartes…</div>,
});

export default function WishGridLoader(props: ComponentProps<typeof WishGridType>) {
  return <WishGrid {...props} />;
}

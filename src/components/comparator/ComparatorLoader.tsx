"use client";

import dynamic from "next/dynamic";

// Le comparateur lit tes listes dans le navigateur (localStorage) : on le rend uniquement côté client.
const Comparator = dynamic(() => import("./Comparator"), {
  ssr: false,
  loading: () => <div className="panel empty">Chargement…</div>,
});

export default function ComparatorLoader() {
  return <Comparator />;
}

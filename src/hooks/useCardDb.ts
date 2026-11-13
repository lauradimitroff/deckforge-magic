"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCardsByName, SCRYFALL_CHUNK } from "@/lib/scryfall";
import { loadJSON, saveJSON } from "@/lib/storage";
import type { CardDb } from "@/lib/types";

// v2 : ajout de `canCommand` ; les données de la v1 sont rechargées.
const CACHE_KEY = "deck-compare-scryfall-v2";

/**
 * Données Scryfall (images, type, coût) des cartes demandées.
 * Gardées en cache dans le navigateur ; les manquantes sont chargées par paquets de 75.
 */
export function useCardDb(cards: [key: string, name: string][]) {
  const [db, setDb] = useState<CardDb>(() => loadJSON<CardDb>(CACHE_KEY, {}));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => saveJSON(CACHE_KEY, db), [db]);

  const missing = useMemo(() => cards.filter(([k]) => !(k in db)), [cards, db]);
  const nextChunk = useMemo(() => missing.slice(0, SCRYFALL_CHUNK), [missing]);

  // Un paquet à la fois : quand il arrive, `db` change, et l'effet repart sur le paquet suivant.
  useEffect(() => {
    if (!nextChunk.length || error) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const found = await fetchCardsByName(
          nextChunk.map(([, name]) => name),
          ctrl.signal,
        );
        setDb((prev) => {
          const next = { ...prev };
          for (const [k] of nextChunk) next[k] = found.get(k) ?? null;
          return next;
        });
      } catch (e) {
        if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : "Erreur réseau");
      }
    }, 100); // petite pause demandée par Scryfall entre deux requêtes
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [nextChunk, error]);

  return {
    db,
    loading: missing.length > 0 && !error,
    remaining: missing.length,
    error,
    retry: () => setError(null),
  };
}

export type CardDbState = ReturnType<typeof useCardDb>;

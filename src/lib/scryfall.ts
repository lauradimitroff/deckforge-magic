import { normalizeKey } from "./parse";
import type { CardData } from "./types";

/**
 * En-têtes des appels à Scryfall. Côté serveur, Scryfall refuse le User-Agent par défaut de Node ;
 * dans le navigateur, on laisse celui du navigateur (sinon requête CORS supplémentaire).
 */
export const scryfallHeaders: Record<string, string> = {
  Accept: "application/json",
  ...(typeof window === "undefined" ? { "User-Agent": "Deckforge/1.0 (+https://deckforge-magic.vercel.app)" } : {}),
};

/** Nombre maximal de cartes par requête /cards/collection. */
export const SCRYFALL_CHUNK = 75;

type ImageUris = { small?: string; normal?: string; large?: string; art_crop?: string };
type ScryfallCard = {
  name: string;
  type_line?: string;
  oracle_text?: string;
  cmc?: number;
  color_identity?: string[];
  image_uris?: ImageUris;
  card_faces?: { type_line?: string; oracle_text?: string; image_uris?: ImageUris }[];
};

export function toCardData(c: ScryfallCard): CardData {
  const face = c.card_faces?.[0];
  const iu = c.image_uris ?? face?.image_uris ?? {};
  return {
    name: c.name,
    small: iu.small,
    normal: iu.normal,
    large: iu.large ?? iu.normal,
    art: iu.art_crop,
    type: c.type_line ?? face?.type_line ?? "",
    cmc: c.cmc ?? 0,
    identity: c.color_identity ?? [],
    canCommand: [c.oracle_text, ...(c.card_faces ?? []).map((f) => f.oracle_text)].some((t) =>
      /can be your commander/i.test(t ?? ""),
    ),
  };
}

/**
 * Récupère jusqu'à 75 cartes par leur nom.
 * Renvoie une Map clé normalisée → données ; les cartes introuvables sont absentes.
 */
export async function fetchCardsByName(names: string[], signal?: AbortSignal): Promise<Map<string, CardData>> {
  const res = await fetch("https://api.scryfall.com/cards/collection", {
    method: "POST",
    headers: { ...scryfallHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ identifiers: names.map((n) => ({ name: n.split(/\s*\/\/\s*/)[0] })) }),
    signal,
  });
  if (!res.ok) throw new Error(`Scryfall a répondu ${res.status}`);
  const json = (await res.json()) as { data: ScryfallCard[] };
  return new Map(json.data.map((c) => [normalizeKey(c.name), toCardData(c)]));
}

export const manaSymbolUrl = (color: string) => `https://svgs.scryfall.io/card-symbols/${color}.svg`;

/** Image d'une carte par son nom exact (Scryfall redirige vers son CDN). Pour quelques images fixes seulement. */
export const cardImageUrl = (name: string, version: "normal" | "art_crop" = "normal") =>
  `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}&format=image&version=${version}`;

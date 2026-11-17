"use server";

import { randomBytes } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { db } from "@/db";
import { isUuid } from "@/db/queries";
import { wishlistItems, wishlists } from "@/db/schema";
import { requireUser } from "@/lib/auth/dal";
import { normalizeKey, parseList } from "@/lib/parse";
import { fetchCardsByName, SCRYFALL_CHUNK, scryfallHeaders } from "@/lib/scryfall";

export type WishFormState = { error?: string; ok?: string; text?: string } | null;

const MAX_TEXT = 20_000;
const MAX_CARDS = 300;
const MAX_ITEMS = 2_000;
const MAX_QTY = 99;

/** Les lignes sans quantité (« Sol Ring ») comptent pour un exemplaire. */
function readCards(text: string) {
  const withQty = text
    .split(/\r?\n/)
    .map((l) => (l.trim() && !/^\d/.test(l.trim()) && !l.trim().startsWith("//") ? `1 ${l.trim()}` : l))
    .join("\n");
  return [...parseList(withQty).cards.values()];
}

const MAX_FRENCH_LOOKUPS = 20;

/** Nom anglais d'une carte d'après son nom français exact, ou null. */
async function fromFrenchName(name: string): Promise<string | null> {
  const q = `lang:fr !"${name.replace(/"/g, "")}"`;
  const res = await fetch(`https://api.scryfall.com/cards/search?unique=cards&q=${encodeURIComponent(q)}`, {
    headers: scryfallHeaders,
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { name: string }[] };
  return json.data?.[0]?.name ?? null;
}

/**
 * Noms officiels (anglais) Scryfall, par clé de la carte saisie. Les noms français exacts sont aussi reconnus.
 * `null` si Scryfall ne répond pas : on garde alors les noms saisis.
 */
async function officialNames(cards: { key: string; name: string }[]): Promise<Map<string, string> | null> {
  try {
    const found = new Map<string, string>();
    for (let i = 0; i < cards.length; i += SCRYFALL_CHUNK) {
      const chunk = await fetchCardsByName(
        cards.slice(i, i + SCRYFALL_CHUNK).map((c) => c.name),
        AbortSignal.timeout(8000),
      );
      for (const [k, c] of chunk) found.set(k, c.name);
    }
    for (const c of cards.filter((c) => !found.has(c.key)).slice(0, MAX_FRENCH_LOOKUPS)) {
      await new Promise((r) => setTimeout(r, 100)); // pause demandée par Scryfall entre deux requêtes
      const en = await fromFrenchName(c.name);
      if (en) found.set(c.key, en);
    }
    return found;
  } catch {
    return null;
  }
}

/** Ajoute des cartes : une par ligne, avec ou sans quantité. Une carte déjà présente garde la plus grande quantité. */
export async function addWishes(_prev: WishFormState, form: FormData): Promise<WishFormState> {
  const user = await requireUser();
  const text = String(form.get("cards") ?? "").trim();
  if (!text) return { error: "Indique au moins une carte." };
  if (text.length > MAX_TEXT) return { error: "Cette liste est trop longue.", text };

  const cards = readCards(text);
  if (!cards.length) return { error: "Aucune carte reconnue.", text };
  if (cards.length > MAX_CARDS) return { error: `${MAX_CARDS} cartes maximum à la fois.`, text };

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(wishlistItems)
    .where(eq(wishlistItems.ownerId, user.id));
  if (n + cards.length > MAX_ITEMS) return { error: `Ta liste est limitée à ${MAX_ITEMS} cartes.`, text };

  const names = await officialNames(cards);
  const unknown = names ? cards.filter((c) => !names.has(c.key)) : [];
  if (unknown.length)
    return {
      error: `Introuvable sur Scryfall : ${unknown.map((c) => c.name).join(", ")}. Vérifie l'orthographe : nom exact, en anglais ou en français.`,
      text,
    };

  // Un nom français et son nom anglais donnent la même carte : une seule ligne.
  const byKey = new Map<string, { ownerId: string; cardKey: string; name: string; qty: number }>();
  for (const c of cards) {
    const name = (names?.get(c.key) ?? c.name).slice(0, 200);
    const cardKey = normalizeKey(name);
    const qty = Math.min(Math.max(c.qty, byKey.get(cardKey)?.qty ?? 1, 1), MAX_QTY);
    byKey.set(cardKey, { ownerId: user.id, cardKey, name, qty });
  }
  const rows = [...byKey.values()];
  await db
    .insert(wishlistItems)
    .values(rows)
    .onConflictDoUpdate({
      target: [wishlistItems.ownerId, wishlistItems.cardKey],
      set: { qty: sql`greatest(${wishlistItems.qty}, excluded.qty)` },
    });
  refresh();
  return { ok: rows.length === 1 ? `${rows[0].name} ajoutée.` : `${rows.length} cartes ajoutées.` };
}

const own = (userId: string, itemId: string) => and(eq(wishlistItems.id, itemId), eq(wishlistItems.ownerId, userId));

export async function setWishQty(itemId: string, qty: number) {
  const user = await requireUser();
  if (!isUuid(itemId) || !Number.isInteger(qty)) return;
  if (qty <= 0) await db.delete(wishlistItems).where(own(user.id, itemId));
  else await db.update(wishlistItems).set({ qty: Math.min(qty, MAX_QTY) }).where(own(user.id, itemId));
  refresh();
}

export async function setWishNote(itemId: string, note: string) {
  const user = await requireUser();
  if (!isUuid(itemId)) return;
  await db
    .update(wishlistItems)
    .set({ note: note.trim().slice(0, 200) || null })
    .where(own(user.id, itemId));
  refresh();
}

export async function removeWish(itemId: string) {
  const user = await requireUser();
  if (!isUuid(itemId)) return;
  await db.delete(wishlistItems).where(own(user.id, itemId));
  refresh();
}

/** Crée (ou remplace) le lien de partage : l'ancien lien cesse de fonctionner. */
export async function newShareLink() {
  const user = await requireUser();
  const token = randomBytes(18).toString("base64url");
  await db
    .insert(wishlists)
    .values({ ownerId: user.id, shareToken: token })
    .onConflictDoUpdate({ target: wishlists.ownerId, set: { shareToken: token, updatedAt: new Date() } });
  refresh();
}

export async function stopSharing() {
  const user = await requireUser();
  await db.update(wishlists).set({ shareToken: null, updatedAt: new Date() }).where(eq(wishlists.ownerId, user.id));
  refresh();
}

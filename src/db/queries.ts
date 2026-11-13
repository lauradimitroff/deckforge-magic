import "server-only";
import { and, asc, desc, eq, max, sql } from "drizzle-orm";
import { db } from ".";
import { comparisons, decks, deckVersions } from "./schema";

/**
 * Lectures en base. Chaque fonction reçoit l'id de l'utilisateur connecté et ne renvoie
 * que ses propres données : c'est ici que se fait le contrôle d'accès.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string | undefined | null): s is string => !!s && UUID_RE.test(s);

export type DeckSummary = {
  id: string;
  name: string;
  commanderKey: string | null;
  updatedAt: Date;
  versionCount: number;
  latestCardCount: number;
};

export async function listDecks(userId: string): Promise<DeckSummary[]> {
  const rows = await db
    .select({
      id: decks.id,
      name: decks.name,
      commanderKey: decks.commanderKey,
      updatedAt: decks.updatedAt,
      versionCount: sql<number>`count(${deckVersions.id})::int`,
      latestCardCount: sql<number>`coalesce((array_agg(${deckVersions.cardCount} order by ${deckVersions.number} desc))[1], 0)::int`,
    })
    .from(decks)
    .leftJoin(deckVersions, eq(deckVersions.deckId, decks.id))
    .where(eq(decks.ownerId, userId))
    .groupBy(decks.id)
    .orderBy(desc(decks.updatedAt));
  return rows;
}

/** Deck de l'utilisateur avec ses versions (sans le texte des listes), ou null. */
export async function getDeck(userId: string, deckId: string) {
  if (!isUuid(deckId)) return null;
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.ownerId, userId)));
  if (!deck) return null;
  const versions = await db
    .select({
      id: deckVersions.id,
      number: deckVersions.number,
      note: deckVersions.note,
      cardCount: deckVersions.cardCount,
      createdAt: deckVersions.createdAt,
    })
    .from(deckVersions)
    .where(eq(deckVersions.deckId, deckId))
    .orderBy(asc(deckVersions.number));
  return { deck, versions };
}

export async function nextVersionNumber(deckId: string): Promise<number> {
  const [row] = await db
    .select({ n: max(deckVersions.number) })
    .from(deckVersions)
    .where(eq(deckVersions.deckId, deckId));
  return (row?.n ?? 0) + 1;
}

/** Les deux versions comparées (avec leurs listes) et les validations enregistrées. */
export async function getComparison(userId: string, deckId: string, fromId: string, toId: string) {
  if (![deckId, fromId, toId].every(isUuid) || fromId === toId) return null;
  const found = await getDeck(userId, deckId);
  if (!found) return null;

  const versions = await db
    .select()
    .from(deckVersions)
    .where(and(eq(deckVersions.deckId, deckId), sql`${deckVersions.id} in (${fromId}, ${toId})`));
  const from = versions.find((v) => v.id === fromId);
  const to = versions.find((v) => v.id === toId);
  if (!from || !to) return null;

  const [saved] = await db
    .select({ decisions: comparisons.decisions })
    .from(comparisons)
    .where(and(eq(comparisons.fromVersionId, fromId), eq(comparisons.toVersionId, toId)));

  return { deck: found.deck, versions: found.versions, from, to, decisions: saved?.decisions ?? {} };
}

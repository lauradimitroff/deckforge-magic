"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { getDeck, isUuid, nextVersionNumber } from "@/db/queries";
import { comparisons, decks, deckVersions } from "@/db/schema";
import { requireUser } from "@/lib/auth/dal";
import { parseList, totalCards } from "@/lib/parse";
import type { Decisions } from "@/lib/types";

/** Erreur + valeurs saisies (React vide le formulaire après l'envoi). */
export type FormState = { error: string; name?: string; note?: string } | null;

const MAX_LIST_LENGTH = 50_000;

/** Vérifie une liste importée et renvoie son nombre de cartes, ou un message d'erreur. */
function checkList(raw: FormDataEntryValue | null): { text: string; count: number } | { error: string } {
  const text = typeof raw === "string" ? raw.trim() : "";
  if (!text) return { error: "Importe ou colle une liste de cartes." };
  if (text.length > MAX_LIST_LENGTH) return { error: "Cette liste est trop longue." };
  const count = totalCards(parseList(text).cards.values());
  if (!count) return { error: "Aucune carte reconnue. Chaque ligne doit ressembler à « 1 Sol Ring »." };
  return { text, count };
}

/** Deck de l'utilisateur, ou erreur si l'id ne lui appartient pas. */
async function ownDeck(deckId: string) {
  const user = await requireUser();
  const found = await getDeck(user.id, deckId);
  if (!found) throw new Error("Deck introuvable");
  return found;
}

const touch = (deckId: string) => db.update(decks).set({ updatedAt: new Date() }).where(eq(decks.id, deckId));

export async function createDeck(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  if (!name) return { error: "Donne un nom à ton deck." };
  const list = checkList(form.get("listText"));
  if ("error" in list) return { ...list, name };

  const deckId = crypto.randomUUID();
  await db.batch([
    db.insert(decks).values({ id: deckId, ownerId: user.id, name }),
    db.insert(deckVersions).values({ deckId, number: 1, note: "Deck d'origine", listText: list.text, cardCount: list.count }),
  ]);
  redirect(`/decks/${deckId}`);
}

export async function addVersion(deckId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const { versions } = await ownDeck(deckId);
  const note = String(form.get("note") ?? "").trim().slice(0, 200) || null;
  const list = checkList(form.get("listText"));
  if ("error" in list) return { ...list, note: note ?? undefined };

  const number = await nextVersionNumber(deckId);
  const [created] = await db
    .insert(deckVersions)
    .values({ deckId, number, note, listText: list.text, cardCount: list.count })
    .returning({ id: deckVersions.id });
  await touch(deckId);

  const previous = versions.at(-1);
  redirect(previous ? `/decks/${deckId}/compare?from=${previous.id}&to=${created.id}` : `/decks/${deckId}`);
}

export async function renameDeck(deckId: string, name: string) {
  await ownDeck(deckId);
  const clean = name.trim().slice(0, 120);
  if (!clean) return;
  await db.update(decks).set({ name: clean, updatedAt: new Date() }).where(eq(decks.id, deckId));
  refresh();
}

export async function deleteDeck(deckId: string) {
  await ownDeck(deckId);
  await db.delete(decks).where(eq(decks.id, deckId));
  redirect("/decks");
}

export async function deleteVersion(deckId: string, versionId: string) {
  const { versions } = await ownDeck(deckId);
  if (versions.length <= 1) throw new Error("Un deck garde au moins une version.");
  if (!versions.some((v) => v.id === versionId)) throw new Error("Version introuvable");
  await db.delete(deckVersions).where(and(eq(deckVersions.id, versionId), eq(deckVersions.deckId, deckId)));
  await touch(deckId);
  refresh();
}

export async function setCommander(deckId: string, commanderKey: string | null) {
  await ownDeck(deckId);
  await db
    .update(decks)
    .set({ commanderKey: commanderKey?.slice(0, 200) ?? null })
    .where(eq(decks.id, deckId));
}

export async function saveDecisions(deckId: string, fromId: string, toId: string, decisions: Decisions) {
  if (!isUuid(fromId) || !isUuid(toId)) throw new Error("Versions invalides");
  const { versions } = await ownDeck(deckId);
  if (!versions.some((v) => v.id === fromId) || !versions.some((v) => v.id === toId))
    throw new Error("Versions introuvables");

  // On ne garde que des clés de cartes valides (chaînes courtes → true).
  const clean: Decisions = {};
  for (const [k, v] of Object.entries(decisions ?? {})) if (v === true && k.length <= 200) clean[k] = true;

  await db
    .insert(comparisons)
    .values({ deckId, fromVersionId: fromId, toVersionId: toId, decisions: clean })
    .onConflictDoUpdate({
      target: [comparisons.fromVersionId, comparisons.toVersionId],
      set: { decisions: clean, updatedAt: new Date() },
    });
}

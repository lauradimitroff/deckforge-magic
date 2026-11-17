import { sql } from "drizzle-orm";
import { check, index, integer, jsonb, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import type { Decisions } from "@/lib/types";

/**
 * Un deck appartient à un utilisateur Neon Auth (`neon_auth.user.id`).
 * Pas de clé étrangère vers le schéma `neon_auth`, géré par Neon : on filtre toujours par `ownerId`.
 */
export const decks = pgTable(
  "decks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull(),
    name: text("name").notNull(),
    /** Commandant choisi (clé normalisée), partagé par toutes les versions. */
    commanderKey: text("commander_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("decks_owner_idx").on(t.ownerId, t.updatedAt)],
);

/** Une version d'un deck : la liste .txt telle qu'importée. v1 = deck d'origine. */
export const deckVersions = pgTable(
  "deck_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deckId: uuid("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    note: text("note"),
    listText: text("list_text").notNull(),
    cardCount: integer("card_count").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("deck_versions_number_uq").on(t.deckId, t.number), check("deck_versions_number_pos", sql`${t.number} > 0`)],
);

/** Comparaison entre deux versions d'un deck : les changements validés. */
export const comparisons = pgTable(
  "comparisons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deckId: uuid("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    fromVersionId: uuid("from_version_id")
      .notNull()
      .references(() => deckVersions.id, { onDelete: "cascade" }),
    toVersionId: uuid("to_version_id")
      .notNull()
      .references(() => deckVersions.id, { onDelete: "cascade" }),
    decisions: jsonb("decisions").$type<Decisions>().notNull().default({}),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("comparisons_pair_uq").on(t.fromVersionId, t.toVersionId)],
);

/** Réglages de la liste de souhaits d'un utilisateur : lien de partage (null = non partagée). */
export const wishlists = pgTable("wishlists", {
  ownerId: uuid("owner_id").primaryKey(),
  /** Jeton secret du lien public `/souhaits/<jeton>`. */
  shareToken: text("share_token").unique(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Une carte voulue (pas encore possédée). Une ligne par carte et par utilisateur. */
export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id").notNull(),
    /** Clé normalisée (voir `normalizeKey`). */
    cardKey: text("card_key").notNull(),
    name: text("name").notNull(),
    qty: integer("qty").notNull().default(1),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("wishlist_items_card_uq").on(t.ownerId, t.cardKey),
    check("wishlist_items_qty_pos", sql`${t.qty} > 0`),
  ],
);

export type Deck = typeof decks.$inferSelect;
export type DeckVersion = typeof deckVersions.$inferSelect;
export type Comparison = typeof comparisons.$inferSelect;
export type WishlistItem = typeof wishlistItems.$inferSelect;

CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"card_key" text NOT NULL,
	"name" text NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_items_card_uq" UNIQUE("owner_id","card_key"),
	CONSTRAINT "wishlist_items_qty_pos" CHECK ("wishlist_items"."qty" > 0)
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"owner_id" uuid PRIMARY KEY NOT NULL,
	"share_token" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlists_share_token_unique" UNIQUE("share_token")
);

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildFinalDeck,
  changesText,
  computeDiff,
  deltaLabel,
  effectiveDecisions,
  finalDeckText,
  onlyChanges,
} from "../diff";
import { parseList, totalCards } from "../parse";
import type { Decisions } from "../types";

const exemple = (f: string) => readFileSync(join(__dirname, "../../../exemples", f), "utf8");

describe("computeDiff", () => {
  it("classe les cartes en ajouts, retraits et identiques", () => {
    const a = parseList("1 Sol Ring\n1 Starstorm\n12 Forest");
    const b = parseList("1 Sol Ring\n1 Bedlam\n9 Forest");
    const diff = computeDiff(a, b);
    const byKey = Object.fromEntries(diff.map((d) => [d.key, d]));
    expect(byKey["sol ring"].type).toBe("same");
    expect(byKey["bedlam"]).toMatchObject({ type: "add", delta: 1 });
    expect(byKey["starstorm"]).toMatchObject({ type: "remove", delta: -1 });
    expect(byKey["forest"]).toMatchObject({ type: "remove", delta: -3, qa: 12, qb: 9 });
    expect(deltaLabel(byKey["forest"])).toBe("12 → 9");
    expect(deltaLabel(byKey["bedlam"])).toBe("+1");
    expect(deltaLabel(byKey["starstorm"])).toBe("−1");
  });

  it("considère deux éditions d'une même carte comme identiques", () => {
    const diff = computeDiff(parseList("1x Sol Ring (c21) 263"), parseList("1x Sol Ring (cmm) 464 *F*"));
    expect(onlyChanges(diff)).toHaveLength(0);
  });

  it("prend la catégorie de B pour un ajout et celle de A pour un retrait", () => {
    const diff = computeDiff(parseList("1x Mind Stone [Ramp]"), parseList("1x Mana Crypt [Fast mana]"));
    expect(diff.find((d) => d.key === "mana crypt")?.cat).toBe("Fast mana");
    expect(diff.find((d) => d.key === "mind stone")?.cat).toBe("Ramp");
  });
});

describe("deck final et exports", () => {
  const a = parseList("1 Bello, Bard of the Brambles\n1 Starstorm\n12 Forest");
  const b = parseList("1 Bello, Bard of the Brambles\n1 Bedlam\n9 Forest");
  const diff = computeDiff(a, b);

  it("n'applique que les changements validés", () => {
    const final = buildFinalDeck(a, b, diff, { bedlam: true, forest: true });
    expect(final.has("bedlam")).toBe(true);
    expect(final.has("starstorm")).toBe(true);
    expect(final.get("forest")?.qty).toBe(9);
  });

  it("ignore les validations qui ne correspondent plus à un changement", () => {
    expect(effectiveDecisions(diff, { bedlam: true, "sol ring": true, "bello, bard of the brambles": true })).toEqual({
      bedlam: true,
    });
  });

  it("exporte le commandant en tête avec la catégorie Archidekt", () => {
    const final = buildFinalDeck(a, b, diff, {});
    const lines = finalDeckText(final, "bello, bard of the brambles").trim().split("\n");
    expect(lines[0]).toBe("1x Bello, Bard of the Brambles [Commander{top}]");
    expect(lines).toContain("12x Forest");
  });

  it("liste les changements validés", () => {
    expect(changesText(diff, { bedlam: true, starstorm: true })).toBe(
      "À AJOUTER\n1x Bedlam\n\nÀ RETIRER\n1x Starstorm\n",
    );
    expect(changesText(diff, {})).toBe("Aucun changement validé.\n");
  });
});

describe("avec les vrais decks (exemples/)", () => {
  const a = parseList(exemple("bello-v1-precon.txt"));
  const b = parseList(exemple("bello-v2.txt"));
  const diff = computeDiff(a, b);

  it("lit 100 cartes de chaque côté", () => {
    expect(totalCards(a.cards.values())).toBe(100);
    expect(totalCards(b.cards.values())).toBe(100);
  });

  it("trouve les 6 ajouts et 6 retraits", () => {
    const names = (t: string) => diff.filter((d) => d.type === t).map((d) => d.name);
    expect(names("add")).toEqual([
      "Bedlam",
      "Collective Defiance",
      "Pia, Aether Ascetic",
      "Rockfall Vale",
      "Something Worth Saving",
      "Xenagos, the Reveler",
    ]);
    expect(names("remove")).toEqual([
      "Gruul Turf",
      "Hugs, Grisly Guardian",
      "Peerless Recycling",
      "Radagast of Rhosgobel",
      "Scrapshooter",
      "Starstorm",
    ]);
  });

  it("garde 100 cartes quand tout est validé", () => {
    const all: Decisions = Object.fromEntries(onlyChanges(diff).map((d) => [d.key, true]));
    expect(totalCards(buildFinalDeck(a, b, diff, all).values())).toBe(100);
  });
});

describe("addListText", () => {
  it("liste les ajouts validés, ou tous les ajouts si rien n'est validé", async () => {
    const { addListText, computeDiff } = await import("../diff");
    const { parseList } = await import("../parse");
    const diff = computeDiff(parseList("1 Sol Ring\n1 Forest"), parseList("1 Sol Ring\n3 Forest\n1 Arcane Signet"));
    expect(addListText(diff, {})).toEqual({ text: "1 Arcane Signet\n2 Forest\n", count: 3, validatedOnly: false });
    expect(addListText(diff, { forest: true })).toEqual({ text: "2 Forest\n", count: 2, validatedOnly: true });
  });
});

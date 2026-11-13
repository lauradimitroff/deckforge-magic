import { describe, expect, it } from "vitest";
import { normalizeKey, parseList, totalCards } from "../parse";

describe("normalizeKey", () => {
  it("ignore la casse, les accents et les espaces superflus", () => {
    expect(normalizeKey("  Lim-Dûl's   Vault ")).toBe("lim-dul's vault");
  });
  it("ne garde que la face avant des cartes doubles", () => {
    expect(normalizeKey("Fire // Ice")).toBe("fire");
    expect(normalizeKey("Fire/Ice")).toBe("fire");
  });
  it("unifie les apostrophes typographiques", () => {
    expect(normalizeKey("Commander’s Sphere")).toBe(normalizeKey("Commander's Sphere"));
  });
});

describe("parseList", () => {
  it("lit le format simple « 1 Nom »", () => {
    const p = parseList("1 Sol Ring\n10 Forest\n");
    expect(p.cards.get("sol ring")?.qty).toBe(1);
    expect(p.cards.get("forest")?.qty).toBe(10);
    expect(totalCards(p.cards.values())).toBe(11);
  });

  it("lit le format Archidekt : 1x, édition, numéro, foil, catégories", () => {
    const p = parseList("1x Sol Ring (cmm) 464 *F* [Ramp,Artifact]\n");
    const c = p.cards.get("sol ring")!;
    expect(c.name).toBe("Sol Ring");
    expect(c.cats).toEqual(["Ramp", "Artifact"]);
    expect(c.commander).toBe(false);
  });

  it("reconnaît le commandant par catégorie ou par section", () => {
    expect(parseList("1x Atraxa, Praetors' Voice (c16) 28 [Commander{top}]").cards.get("atraxa, praetors' voice")?.commander).toBe(true);
    expect(parseList("Commander\n1 Bello, Bard of the Brambles\nDeck\n1 Sol Ring").cards.get("bello, bard of the brambles")?.commander).toBe(true);
    expect(parseList("Commander\n1 Bello, Bard of the Brambles\nDeck\n1 Sol Ring").cards.get("sol ring")?.commander).toBe(false);
  });

  it("met de côté le sideboard et le maybeboard", () => {
    const p = parseList("1 Sol Ring\nSideboard\n2 Pyroblast\n1x Opt [Maybeboard]");
    expect([...p.cards.keys()]).toEqual(["sol ring"]);
    expect(p.outside).toEqual([
      { name: "Pyroblast", qty: 2 },
      { name: "Opt", qty: 1 },
    ]);
  });

  it("additionne une même carte présente dans plusieurs éditions", () => {
    const p = parseList("4x Forest (c21) 300\n6x Forest (blb) 278");
    expect(p.cards.get("forest")?.qty).toBe(10);
  });

  it("ignore les lignes vides, commentaires et lignes sans quantité", () => {
    const p = parseList("// mon deck\n\n# note\nSol Ring\n1 Sol Ring");
    expect(totalCards(p.cards.values())).toBe(1);
  });
});

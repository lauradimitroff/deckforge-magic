import { describe, expect, it } from "vitest";
import { commanderCandidates, resolveCommander } from "../commander";
import { deckStats, mainType } from "../cards";
import { parseList } from "../parse";
import { toCardData } from "../scryfall";
import type { CardDb } from "../types";

const card = (type: string, cmc = 0) => ({ name: "x", type, cmc, identity: [] });

describe("mainType", () => {
  it("range chaque carte dans son type principal", () => {
    expect(mainType(card("Legendary Creature — Raccoon Bard"))).toBe("Créatures");
    expect(mainType(card("Enchantment Creature — God"))).toBe("Créatures");
    expect(mainType(card("Basic Land — Forest"))).toBe("Terrains");
    expect(mainType(card("Legendary Planeswalker — Xenagos"))).toBe("Planeswalkers");
    expect(mainType(card("Kindred Instant — Elf"))).toBe("Éphémères");
    expect(mainType(card("Artifact"))).toBe("Artefacts");
    expect(mainType(null)).toBe("Autres");
  });
});

describe("deckStats", () => {
  it("compte les terrains et le coût moyen hors terrains", () => {
    const deck = parseList("10 Forest\n1 Sol Ring\n1 Cultivate");
    const db: CardDb = {
      forest: card("Basic Land — Forest"),
      "sol ring": card("Artifact", 1),
      cultivate: card("Sorcery", 3),
    };
    expect(deckStats(deck.cards.values(), db)).toEqual({ count: 12, lands: 10, avgCmc: 2, complete: true });
    expect(deckStats(deck.cards.values(), {}).complete).toBe(false);
  });
});

describe("commandant", () => {
  const a = parseList("1 Bello, Bard of the Brambles\n1 Sol Ring");
  const b = parseList("1 Bello, Bard of the Brambles\n1 Sol Ring\n1 Xenagos, the Reveler");
  const db: CardDb = {
    "bello, bard of the brambles": card("Legendary Creature — Raccoon Bard"),
    "sol ring": card("Artifact"),
    "xenagos, the reveler": card("Legendary Planeswalker — Xenagos"),
  };

  it("propose d'abord les créatures légendaires, puis le reste du deck", () => {
    const { likely, others } = commanderCandidates(a, b, db);
    expect(likely.map(([k]) => k)).toEqual(["bello, bard of the brambles"]);
    expect(others.map(([k]) => k)).toEqual(["sol ring", "xenagos, the reveler"]);
  });

  it("reconnaît un planeswalker qui « can be your commander »", () => {
    const quintorius = toCardData({
      name: "Quintorius, History Chaser",
      type_line: "Legendary Planeswalker — Quintorius",
      oracle_text: "…\nQuintorius, History Chaser can be your commander.",
    });
    expect(quintorius.canCommand).toBe(true);
    const deck = parseList("1 Quintorius, History Chaser\n1 Sol Ring");
    const { likely } = commanderCandidates(deck, deck, {
      "quintorius, history chaser": quintorius,
      "sol ring": card("Artifact"),
    });
    expect(likely.map(([, n]) => n)).toEqual(["Quintorius, History Chaser"]);
  });

  it("ignore un choix qui n'est plus dans les listes", () => {
    expect(resolveCommander("bello, bard of the brambles", a, b)).toBe("bello, bard of the brambles");
    expect(resolveCommander("atraxa", a, b)).toBeNull();
  });
});

describe("toCardData", () => {
  it("prend l'image de la face avant pour les cartes doubles", () => {
    const d = toCardData({
      name: "Delver of Secrets // Insectile Aberration",
      card_faces: [{ type_line: "Creature — Human Wizard", image_uris: { normal: "front.jpg" } }, {}],
    });
    expect(d.normal).toBe("front.jpg");
    expect(d.type).toBe("Creature — Human Wizard");
  });
});

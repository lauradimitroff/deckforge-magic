import { describe, expect, it, vi } from "vitest";
import { insertWithNextNumber } from "../next-number";

describe("insertWithNextNumber", () => {
  it("insère directement quand le numéro est libre", async () => {
    const insert = vi.fn(async (n: number) => ({ n }));
    await expect(insertWithNextNumber(async () => 4, insert)).resolves.toEqual({ n: 4 });
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("recalcule le numéro quand une requête concurrente l'a pris", async () => {
    const taken = new Set([4]);
    let latest = 3;
    const nextNumber = async () => latest + 1;
    const insert = async (n: number) => {
      if (taken.has(n)) {
        latest = n;
        return undefined;
      }
      return { n };
    };
    await expect(insertWithNextNumber(nextNumber, insert)).resolves.toEqual({ n: 5 });
  });

  it("renvoie null après le dernier essai", async () => {
    const insert = vi.fn(async () => undefined);
    await expect(insertWithNextNumber(async () => 4, insert, 3)).resolves.toBeNull();
    expect(insert).toHaveBeenCalledTimes(3);
  });
});

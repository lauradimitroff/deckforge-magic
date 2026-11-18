/**
 * Insère une ligne sous le prochain numéro libre, en recalculant ce numéro si
 * une requête concurrente l'a pris entre-temps.
 *
 * `insert` renvoie `undefined` quand le numéro est déjà pris.
 * Renvoie `null` si tous les essais ont échoué.
 */
export async function insertWithNextNumber<T>(
  nextNumber: () => Promise<number>,
  insert: (number: number) => Promise<T | undefined>,
  maxAttempts = 3,
): Promise<T | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const created = await insert(await nextNumber());
    if (created !== undefined) return created;
  }
  return null;
}

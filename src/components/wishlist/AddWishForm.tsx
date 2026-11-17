"use client";

import { useActionState, useState } from "react";
import { addWishes, type WishFormState } from "@/app/souhaits/actions";
import CardNameInput from "./CardNameInput";
import styles from "./wishlist.module.css";

/** Le numéro d'envoi sert à vider le champ après chaque ajout réussi, même identique au précédent. */
type State = (WishFormState & { n: number }) | null;

/** Ajout de cartes : une carte (avec suggestions Scryfall) ou une liste collée. */
export default function AddWishForm() {
  const [state, action, pending] = useActionState<State, FormData>(
    async (prev, form) => ({ ...(await addWishes(prev, form)), n: (prev?.n ?? 0) + 1 }),
    null,
  );
  const [bulk, setBulk] = useState(false);

  return (
    <form action={action} className={styles.addForm}>
      <div className="seg" role="group" aria-label="Mode d'ajout">
        <button type="button" aria-pressed={!bulk} onClick={() => setBulk(false)}>
          Une carte
        </button>
        <button type="button" aria-pressed={bulk} onClick={() => setBulk(true)}>
          Coller une liste
        </button>
      </div>

      {bulk ? (
        <label className="field">
          Une carte par ligne, avec ou sans quantité
          <textarea
            name="cards"
            className={styles.bulk}
            placeholder={"Sol Ring\n2 Arcane Signet\nAnneau solaire"}
            spellCheck={false}
            required
            defaultValue={state?.error ? state.text : undefined}
          />
        </label>
      ) : (
        <div className={styles.oneRow}>
          <CardNameInput name="cards" key={state?.n ?? 0} defaultValue={state?.error ? state.text : ""} />
          <button type="submit" className="primary" disabled={pending}>
            {pending ? "Ajout…" : "Ajouter"}
          </button>
        </div>
      )}

      {bulk && (
        <div>
          <button type="submit" className="primary" disabled={pending}>
            {pending ? "Ajout…" : "Ajouter ces cartes"}
          </button>
        </div>
      )}

      {state?.error && (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className={styles.ok} role="status">
          {state.ok}
        </p>
      )}
    </form>
  );
}

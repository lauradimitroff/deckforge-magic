"use client";

import { useActionState } from "react";
import { addVersion, createDeck, deleteDeck, deleteVersion, renameDeck } from "@/app/decks/actions";
import ListInput from "./ListInput";
import styles from "./decks.module.css";

function FormError({ error }: { error?: string }) {
  return error ? (
    <p className={styles.error} role="alert">
      {error}
    </p>
  ) : null;
}

export function NewDeckForm() {
  const [state, action, pending] = useActionState(createDeck, null);
  return (
    <form action={action} className={styles.form}>
      <label className="field">
        Nom du deck
        <input name="name" type="text" required maxLength={120} placeholder="Ex. Bello, Bard of the Brambles" defaultValue={state?.name} />
      </label>
      <ListInput label="Deck d'origine (version 1)" />
      <FormError error={state?.error} />
      <div>
        <button type="submit" className="primary" disabled={pending}>
          {pending ? "Création…" : "Créer le deck"}
        </button>
      </div>
    </form>
  );
}

export function AddVersionForm({ deckId, nextNumber }: { deckId: string; nextNumber: number }) {
  const [state, action, pending] = useActionState(addVersion.bind(null, deckId), null);
  return (
    <form action={action} className={styles.form}>
      <ListInput label={`Deck modifié (version ${nextNumber})`} />
      <label className="field">
        Note (facultatif)
        <input name="note" type="text" maxLength={200} placeholder="Ex. plus de ramp, moins de removal" defaultValue={state?.note} />
      </label>
      <FormError error={state?.error} />
      <div>
        <button type="submit" className="primary" disabled={pending}>
          {pending ? "Ajout…" : `Ajouter la version ${nextNumber} et comparer`}
        </button>
      </div>
    </form>
  );
}

export function DeckActions({ deckId, name }: { deckId: string; name: string }) {
  return (
    <div className={styles.inlineActions}>
      <button
        type="button"
        className="ghost"
        onClick={() => {
          const next = prompt("Nouveau nom du deck :", name);
          if (next && next.trim() && next.trim() !== name) renameDeck(deckId, next);
        }}
      >
        Renommer
      </button>
      <button
        type="button"
        className={`ghost ${styles.danger}`}
        onClick={() => {
          if (confirm(`Supprimer « ${name} » et toutes ses versions ? C'est définitif.`)) deleteDeck(deckId);
        }}
      >
        Supprimer le deck
      </button>
    </div>
  );
}

export function DeleteVersionButton({ deckId, versionId, number }: { deckId: string; versionId: string; number: number }) {
  return (
    <button
      type="button"
      className={`ghost ${styles.danger} ${styles.small}`}
      onClick={() => {
        if (confirm(`Supprimer la version ${number} ? Ses comparaisons seront aussi supprimées.`))
          deleteVersion(deckId, versionId);
      }}
    >
      Supprimer
    </button>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { cardImageUrl } from "@/lib/scryfall";
import styles from "./CardNameInput.module.css";

const MAX_SUGGESTIONS = 8;

/** Le nom avec la partie tapée en gras. */
function Highlight({ name, query }: { name: string; query: string }) {
  const i = name.toLowerCase().indexOf(query.trim().toLowerCase());
  if (!query.trim() || i < 0) return <>{name}</>;
  const end = i + query.trim().length;
  return (
    <>
      {name.slice(0, i)}
      <mark>{name.slice(i, end)}</mark>
      {name.slice(end)}
    </>
  );
}

/**
 * Champ « nom de carte » avec une liste de suggestions Scryfall (noms anglais) :
 * flèches haut/bas pour choisir, Entrée pour valider la suggestion, Échap pour fermer.
 * L'image de la suggestion active s'affiche à côté de la liste.
 */
export default function CardNameInput({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [items, setItems] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [preview, setPreview] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const previewTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ctrl = useRef<AbortController>(undefined);
  const listId = useId();

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(previewTimer.current);
      ctrl.current?.abort();
    },
    [],
  );

  const search = (q: string) => {
    clearTimeout(timer.current);
    ctrl.current?.abort();
    if (q.trim().length < 2) {
      setItems([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    timer.current = setTimeout(async () => {
      const c = (ctrl.current = new AbortController());
      try {
        const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q.trim())}`, {
          signal: c.signal,
        });
        const json = (await res.json()) as { data?: string[] };
        setItems(json.data?.slice(0, MAX_SUGGESTIONS) ?? []);
        setActive(-1);
        setStatus("done");
      } catch {
        if (!c.signal.aborted) setStatus("done");
      }
    }, 180);
  };

  /** L'image ne charge qu'après une courte pause, pour ne pas solliciter Scryfall à chaque flèche. */
  const highlight = (i: number) => {
    setActive(i);
    clearTimeout(previewTimer.current);
    const card = items[i];
    previewTimer.current = setTimeout(() => setPreview(card ?? null), 250);
  };

  const choose = (card: string) => {
    setValue(card);
    setOpen(false);
    setItems([]);
    setStatus("idle");
    setPreview(null);
  };

  const showList = open && status !== "idle";

  return (
    <div className={styles.wrap}>
      <input
        name={name}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder="Nom de la carte (anglais ou français)"
        aria-label="Nom de la carte"
        required
        maxLength={200}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setPreview(null);
          search(e.target.value);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (!showList || !items.length) return;
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            const last = items.length - 1;
            highlight(e.key === "ArrowDown" ? (active < last ? active + 1 : 0) : active > 0 ? active - 1 : last);
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault(); // valide la suggestion sans envoyer le formulaire
            choose(items[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      />

      {showList && (
        <div className={styles.popup}>
          <ul id={listId} role="listbox" className={styles.list} aria-label="Suggestions">
            {status === "loading" && !items.length && <li className={styles.info}>Recherche…</li>}
            {status === "done" && !items.length && (
              <li className={styles.info}>
                Aucune suggestion. Les noms français sont reconnus à l&apos;ajout s&apos;ils sont exacts.
              </li>
            )}
            {items.map((card, i) => (
              <li
                key={card}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={cx(styles.option, i === active && styles.active)}
                onMouseEnter={() => highlight(i)}
                onMouseDown={(e) => e.preventDefault()} // garde le focus dans le champ
                onClick={() => choose(card)}
              >
                <Highlight name={card} query={value} />
              </li>
            ))}
          </ul>
          {preview && (
            <img className={styles.preview} src={cardImageUrl(preview)} alt={preview} key={preview} />
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp } from "@/app/auth/actions";
import styles from "./AuthForm.module.css";

/** Formulaire de connexion ou d'inscription (e-mail + mot de passe). */
export default function AuthForm({ mode, next }: { mode: "sign-in" | "sign-up"; next?: string }) {
  const isSignUp = mode === "sign-up";
  const [state, action, pending] = useActionState(isSignUp ? signUp : signIn, null);
  return (
    <div className={`panel ${styles.card}`}>
      <h1 className="display">{isSignUp ? "Créer un compte" : "Se connecter"}</h1>
      <p className={styles.sub}>
        {isSignUp
          ? "Pour sauvegarder tes decks et leurs versions, et les retrouver partout."
          : "Retrouve tes decks sauvegardés."}
      </p>

      <form action={action} className={styles.form}>
        {next && <input type="hidden" name="next" value={next} />}
        {isSignUp && (
          <label className="field">
            Pseudo
            <input
              name="name"
              type="text"
              autoComplete="nickname"
              placeholder="Ex. Bello Fan"
              maxLength={60}
              defaultValue={state?.name}
            />
          </label>
        )}
        <label className="field">
          E-mail
          <input name="email" type="email" autoComplete="email" required defaultValue={state?.email} />
        </label>
        <label className="field">
          Mot de passe
          <input
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            minLength={8}
            required
          />
          {isSignUp && <small>8 caractères minimum.</small>}
        </label>
        {state?.error && (
          <p className={styles.error} role="alert">
            {state.error}
          </p>
        )}
        <button type="submit" className="primary" disabled={pending}>
          {pending ? "Un instant…" : isSignUp ? "Créer mon compte" : "Se connecter"}
        </button>
      </form>

      <p className={styles.switch}>
        {isSignUp ? (
          <>
            Déjà un compte ? <Link href="/auth/sign-in">Se connecter</Link>
          </>
        ) : (
          <>
            Pas encore de compte ? <Link href="/auth/sign-up">Créer un compte</Link>
          </>
        )}
      </p>
    </div>
  );
}


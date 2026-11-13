"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

/** En cas d'erreur, on renvoie aussi ce qui a été saisi : React vide le formulaire après l'envoi. */
export type AuthState = { error: string; email?: string; name?: string } | null;

/** Messages Better Auth traduits ; sinon un message générique. */
function frenchError(code: string | undefined, message: string | undefined, fallback: string): string {
  // Neon renvoie parfois seulement le message (« Invalid email or password ») : on le ramène à un code.
  const key = (code || message || "").toUpperCase().replace(/[^A-Z]+/g, "_").replace(/^_|_$/g, "");
  switch (key) {
    case "INVALID_CREDENTIALS":
    case "INVALID_EMAIL_OR_PASSWORD":
      return "E-mail ou mot de passe incorrect.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.";
    case "PASSWORD_TOO_SHORT":
      return "Le mot de passe est trop court (8 caractères minimum).";
    case "PASSWORD_TOO_LONG":
      return "Le mot de passe est trop long.";
    case "INVALID_EMAIL":
      return "Cette adresse e-mail n'est pas valide.";
    default:
      return message || fallback;
  }
}

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

/** Redirection après connexion : uniquement un chemin interne au site. */
function safeNext(form: FormData): string {
  const next = field(form, "next");
  return next.startsWith("/") && !next.startsWith("//") ? next : "/decks";
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const { error } = await auth.signUp.email({
    name: field(form, "name") || field(form, "email").split("@")[0],
    email: field(form, "email"),
    password: String(form.get("password") ?? ""),
  });
  if (error)
    return {
      error: frenchError(error.code, error.message, "Impossible de créer le compte."),
      email: field(form, "email"),
      name: field(form, "name"),
    };
  redirect(safeNext(form));
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const { error } = await auth.signIn.email({
    email: field(form, "email"),
    password: String(form.get("password") ?? ""),
  });
  if (error)
    return { error: frenchError(error.code, error.message, "Connexion impossible, réessaie."), email: field(form, "email") };
  redirect(safeNext(form));
}

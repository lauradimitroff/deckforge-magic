import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./server";

export type CurrentUser = { id: string; name: string; email: string };

/** Utilisateur connecté, ou null. Lit le cookie de session : à appeler sous un <Suspense>. */
export async function getUser(): Promise<CurrentUser | null> {
  // Lire les cookies d'abord : au pré-rendu, Next s'arrête ici proprement, avant l'appel à Neon
  // (qui sinon journalise une fausse erreur « Cookie validation error »).
  await cookies();
  const { data } = await auth.getSession();
  const u = data?.user;
  return u ? { id: u.id, name: u.name, email: u.email } : null;
}

/** Utilisateur connecté ; redirige vers la connexion sinon. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}

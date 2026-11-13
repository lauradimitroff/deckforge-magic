import { auth } from "@/lib/auth/server";

// Les pages « Mes decks » demandent d'être connecté ; le reste du site est public.
export default auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: ["/decks/:path*"],
};

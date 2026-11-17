import { auth } from "@/lib/auth/server";

// « Mes decks » et « Ma liste de souhaits » demandent d'être connecté ; le reste du site est public,
// y compris les listes de souhaits partagées (/souhaits/<jeton>).
export default auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: ["/decks/:path*", "/souhaits"],
};

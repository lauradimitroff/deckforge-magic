import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";

/** Instance d'authentification côté serveur (Neon Auth / Managed Better Auth). */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});

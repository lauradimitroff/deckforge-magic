import { defineConfig } from "@neon/config/v1";

// Services Neon du projet : Postgres (toujours présent) + comptes utilisateurs (Managed Better Auth).
export default defineConfig({
  auth: true,
});

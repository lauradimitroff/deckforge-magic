"use client";

import { createAuthClient } from "@neon/auth/next";

/** Client d'authentification du navigateur ; passe par la route /api/auth du site. */
export const authClient = createAuthClient();

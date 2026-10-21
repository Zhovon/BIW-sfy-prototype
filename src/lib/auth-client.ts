"use client";
/**
 * Better Auth browser client. Talks to /api/auth/* on the same origin, so no
 * baseURL is needed in normal use. `inferAdditionalFields` makes the custom
 * profile fields (phone, address) type-safe on the client.
 */
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession, getSession, updateUser } = authClient;

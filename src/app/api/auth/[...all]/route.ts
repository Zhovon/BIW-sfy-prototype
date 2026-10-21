import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Better Auth mounts all its endpoints (sign-in, sign-up, session, sign-out,
// etc.) under /api/auth/*.
export const { POST, GET } = toNextJsHandler(auth);

import fs from "fs";
import os from "os";
import path from "path";

/**
 * Resolved data directory for the flat-file scaffold (orders + logs).
 *
 * Priority:
 *  1. `DATA_DIR` env — a mounted persistent volume in production (e.g. Coolify
 *     volume at /app/data) so orders + logs survive redeploys.
 *  2. `<cwd>/data` — local dev + the historic behaviour.
 *  3. If that dir is not writable (Vercel's serverless filesystem is read-only
 *     outside /tmp), fall back to a per-instance temp dir. Writes there are
 *     EPHEMERAL — they vanish per instance — which is the honest degradation:
 *     real durability needs the Postgres migration.
 */
function resolveDataDir(): string {
  if (process.env.DATA_DIR) return path.resolve(process.env.DATA_DIR);

  const local = path.join(process.cwd(), "data");
  try {
    fs.mkdirSync(local, { recursive: true });
    fs.accessSync(local, fs.constants.W_OK);
    return local;
  } catch {
    /* read-only filesystem (e.g. Vercel) — fall through to tmp */
  }

  const tmp = path.join(os.tmpdir(), "biw-data");
  fs.mkdirSync(tmp, { recursive: true });
  return tmp;
}

export const DATA_DIR = resolveDataDir();

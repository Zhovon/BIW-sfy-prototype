import path from "path";

/**
 * Resolved data directory for the flat-file scaffold (orders + logs).
 *
 * Defaults to `<cwd>/data` (local dev + the historic behaviour). In the VPS
 * container this dir is inside the ephemeral build output, so set `DATA_DIR`
 * to a mounted persistent volume (e.g. `/app/data`) to keep orders + logs
 * across redeploys. Until the store joins the CRM Postgres, this is the
 * durability boundary — see the deferred DB migration.
 */
export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");

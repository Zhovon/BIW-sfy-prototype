import { promises as fs } from "fs";
import path from "path";

/**
 * Scaffold analytics + request logging — append-only JSONL files under data/.
 * Same caveat as the order store: this works locally, but Vercel's serverless
 * filesystem is ephemeral and not shared between instances, so in production
 * these move to Postgres (or a real analytics sink). Client code must NOT import
 * this module — it uses `fs`.
 */

const DIR = path.join(process.cwd(), "data");
const ACCESS_FILE = path.join(DIR, "access-log.jsonl");
const API_FILE = path.join(DIR, "api-log.jsonl");

export type AccessEvent = {
  ts: string;
  path: string;
  ip: string;
  country: string | null;
  ua: string;
  referrer: string | null;
};

export type ApiEvent = {
  ts: string;
  method: string;
  path: string;
  status: number;
  ms: number;
  ip: string;
};

async function append(file: string, obj: unknown) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.appendFile(file, JSON.stringify(obj) + "\n");
}

/** Read the last `limit` JSONL entries, newest first. Tolerates bad lines. */
async function readTail<T>(file: string, limit: number): Promise<T[]> {
  let text: string;
  try {
    text = await fs.readFile(file, "utf-8");
  } catch {
    return [];
  }
  const lines = text.split("\n").filter(Boolean);
  const out: T[] = [];
  for (const line of lines.slice(-limit)) {
    try {
      out.push(JSON.parse(line) as T);
    } catch {
      /* skip corrupt line */
    }
  }
  return out.reverse();
}

export function logAccess(e: AccessEvent) {
  return append(ACCESS_FILE, e);
}
export function readAccess(limit = 2000) {
  return readTail<AccessEvent>(ACCESS_FILE, limit);
}
export function readApi(limit = 1000) {
  return readTail<ApiEvent>(API_FILE, limit);
}

/** Pull client metadata off request headers (works behind Vercel/proxies). */
export function clientMeta(req: Request) {
  const h = req.headers;
  const xff = h.get("x-forwarded-for") || "";
  const ip = xff.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return {
    ip,
    country: h.get("x-vercel-ip-country"),
    ua: h.get("user-agent") || "",
    referrer: h.get("referer"),
  };
}

/**
 * Wrap a route handler to record method/path/status/duration/IP for every call.
 * Logging failures never break the response. Errors are logged as 500 then
 * rethrown so Next still returns its error page.
 */
export function withApiLog<R extends Request, A extends unknown[]>(
  handler: (req: R, ...args: A) => Promise<Response>,
): (req: R, ...args: A) => Promise<Response> {
  return async (req, ...args) => {
    const start = Date.now();
    const record = async (status: number) => {
      try {
        await append(API_FILE, {
          ts: new Date().toISOString(),
          method: req.method,
          path: new URL(req.url).pathname,
          status,
          ms: Date.now() - start,
          ip: clientMeta(req).ip,
        } satisfies ApiEvent);
      } catch {
        /* never let logging break the request */
      }
    };
    try {
      const res = await handler(req, ...args);
      await record(res.status);
      return res;
    } catch (err) {
      await record(500);
      throw err;
    }
  };
}

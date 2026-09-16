import { promises as fs } from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/data-dir";

/**
 * Scaffold analytics + request logging — append-only JSONL files under data/.
 * Same caveat as the order store: the container filesystem is ephemeral, so set
 * `DATA_DIR` to a mounted volume in production to keep logs across redeploys.
 * Client code must NOT import this module — it uses `fs`.
 */

const DIR = DATA_DIR;
const ACCESS_FILE = path.join(DIR, "access-log.jsonl");
const API_FILE = path.join(DIR, "api-log.jsonl");
const VITALS_FILE = path.join(DIR, "vitals-log.jsonl");

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

/** One Core Web Vitals sample from a real visitor (useReportWebVitals beacon). */
export type VitalEvent = {
  ts: string;
  /** Metric name: LCP | INP | CLS | FCP | TTFB */
  name: string;
  /** Metric value (ms for all except CLS, which is unitless). */
  value: number;
  /** Browser's own classification: good | needs-improvement | poor */
  rating: string;
  path: string;
  ip: string;
  ua: string;
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
export function logVital(e: VitalEvent) {
  return append(VITALS_FILE, e);
}
export function readVitals(limit = 4000) {
  return readTail<VitalEvent>(VITALS_FILE, limit);
}

/** Simple device classification off the raw user-agent (no heavy UA lib). */
export function parseDevice(ua: string): "Mobile" | "Tablet" | "Desktop" {
  const u = ua || "";
  if (/iPad|Tablet|Nexus 7|Nexus 10/i.test(u)) return "Tablet";
  if (/Android/i.test(u) && !/Mobile/i.test(u)) return "Tablet";
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(u)) return "Mobile";
  return "Desktop";
}

/** Rough browser family off the raw user-agent (order matters: checks are exclusionary). */
export function parseBrowser(ua: string): string {
  const u = ua || "";
  if (!u) return "Unknown";
  if (/bot|crawl|spider|slurp|curl|wget|headless/i.test(u)) return "Bot/Other";
  if (/Edg\//i.test(u)) return "Edge";
  if (/OPR\//i.test(u)) return "Opera";
  if (/SamsungBrowser/i.test(u)) return "Samsung Internet";
  if (/Firefox\//i.test(u)) return "Firefox";
  if (/Chrome\//i.test(u)) return "Chrome";
  if (/Safari\//i.test(u)) return "Safari";
  return "Other";
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

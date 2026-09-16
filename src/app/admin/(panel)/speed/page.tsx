import { readVitals, parseBrowser, parseDevice, type VitalEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

/**
 * Google's Core Web Vitals assessment thresholds. At or below `good` = good;
 * above `poor` = poor; in between = needs improvement. CLS is unitless, the
 * rest are milliseconds.
 */
const METRICS: { name: string; label: string; good: number; poor: number; unit: string; desc: string }[] = [
  { name: "LCP", label: "LCP", good: 2500, poor: 4000, unit: "ms", desc: "Largest Contentful Paint" },
  { name: "INP", label: "INP", good: 200, poor: 500, unit: "ms", desc: "Interaction to Next Paint" },
  { name: "CLS", label: "CLS", good: 0.1, poor: 0.25, unit: "", desc: "Cumulative Layout Shift" },
  { name: "FCP", label: "FCP", good: 1800, poor: 3000, unit: "ms", desc: "First Contentful Paint" },
  { name: "TTFB", label: "TTFB", good: 800, poor: 1800, unit: "ms", desc: "Time to First Byte" },
];

function fmt(v: number, unit: string): string {
  if (unit === "ms") return `${Math.round(v)}ms`;
  return v.toFixed(2);
}

/** p75 = 75th-percentile sample (the number Google judges field data on). */
function p75(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(sorted.length * 0.75) - 1)];
}

function ratingClass(value: number, good: number, poor: number): string {
  if (value <= good) return "text-emerald-700";
  if (value <= poor) return "text-amber-700";
  return "text-red-700";
}

function MetricCard({ m, values }: { m: (typeof METRICS)[number]; values: number[] }) {
  const p = p75(values);
  const good = values.filter((v) => v <= m.good).length;
  const poor = values.filter((v) => v > m.poor).length;
  const share = values.length ? Math.round((good / values.length) * 100) : 0;
  return (
    <div className="border border-line bg-paper p-6">
      <div className="flex items-baseline justify-between">
        <p className="kicker">{m.label}</p>
        <span className="text-[11px] text-muted">{m.desc}</span>
      </div>
      <p className={`font-display text-4xl mt-2 ${values.length ? ratingClass(p, m.good, m.poor) : "text-muted"}`}>
        {values.length ? fmt(p, m.unit) : "—"}
      </p>
      <p className="text-[13px] text-muted mt-1">
        p75 of {values.length.toLocaleString()} sample{values.length === 1 ? "" : "s"}
        {values.length ? ` · ${share}% good · ${poor} poor` : ""}
      </p>
    </div>
  );
}
export default async function SpeedPage() {
  const events: VitalEvent[] = await readVitals(4000);
  const byMetric = (name: string) => events.filter((e) => e.name === name).map((e) => e.value);

  // Slowest paths by p75 LCP — only paths with enough samples to be meaningful.
  const perPath = new Map<string, number[]>();
  for (const e of events) {
    if (e.name !== "LCP") continue;
    perPath.set(e.path, [...(perPath.get(e.path) ?? []), e.value]);
  }
  const slowPages = [...perPath.entries()]
    .filter(([, vals]) => vals.length >= 3)
    .map(([path, vals]) => ({ path, p: p75(vals), n: vals.length }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 8);

  // LCP p75 grouped by device classification off the user-agent.
  const perDevice = new Map<string, number[]>();
  for (const e of events) {
    if (e.name !== "LCP") continue;
    const d = parseDevice(e.ua);
    perDevice.set(d, [...(perDevice.get(d) ?? []), e.value]);
  }
  const devices = [...perDevice.entries()]
    .map(([d, vals]) => ({ d, p: p75(vals), n: vals.length }))
    .sort((a, b) => b.n - a.n);

  const lcp = METRICS[0];


  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl">Speed insights</h1>
        <p className="text-[13px] text-muted">
          Real-user Core Web Vitals · last {events.length.toLocaleString()} samples · p75 at
          good / needs-improvement / poor thresholds
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {METRICS.map((m) => (
          <MetricCard key={m.name} m={m} values={byMetric(m.name)} />
        ))}
      </div>

      {events.length === 0 && (
        <p className="text-muted text-sm border border-line bg-paper p-6">
          No vitals collected yet. Browse the store in another tab — samples appear on the next page
          load (LCP/FCP/TTFB arrive immediately; CLS and INP need some interaction).
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border border-line bg-paper p-6">
          <h2 className="kicker mb-4">Slowest pages (p75 LCP)</h2>
          {slowPages.length === 0 ? (
            <p className="text-sm text-muted">Not enough samples yet (needs 3+ per page).</p>
          ) : (
            <ul className="space-y-3">
              {slowPages.map((s) => (
                <li key={s.path} className="text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="truncate">{s.path}</span>
                    <span className={`tabular-nums font-semibold ${ratingClass(s.p, lcp.good, lcp.poor)}`}>
                      {fmt(s.p, "ms")}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">{s.n} samples</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-line bg-paper p-6">
          <h2 className="kicker mb-4">LCP by device</h2>
          {devices.length === 0 ? (
            <p className="text-sm text-muted">No samples yet.</p>
          ) : (
            <ul className="space-y-3">
              {devices.map((d) => (
                <li key={d.d} className="text-sm">
                  <div className="flex justify-between gap-4">
                    <span>{d.d}</span>
                    <span className={`tabular-nums font-semibold ${ratingClass(d.p, lcp.good, lcp.poor)}`}>
                      {fmt(d.p, "ms")}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">{d.n} samples</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <RecentSamples events={events} />
    </div>
  );
}
function RecentSamples({ events }: { events: VitalEvent[] }) {
  if (events.length === 0) return null;
  return (
    <div>
      <h2 className="font-display text-2xl mb-3">Recent samples</h2>
      <div className="border border-line bg-paper overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.06em] text-muted">
              <th className="px-4 py-3 font-semibold">Time</th>
              <th className="px-4 py-3 font-semibold">Metric</th>
              <th className="px-4 py-3 font-semibold text-right">Value</th>
              <th className="px-4 py-3 font-semibold">Rating</th>
              <th className="px-4 py-3 font-semibold">Path</th>
              <th className="px-4 py-3 font-semibold">Device</th>
              <th className="px-4 py-3 font-semibold">Browser</th>
            </tr>
          </thead>
          <tbody>
            {events.slice(0, 60).map((e, i) => {
              const m = METRICS.find((x) => x.name === e.name);
              return (
                <tr key={i} className="border-b border-line last:border-0 hover:bg-ice/50">
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(e.ts).toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px]">{e.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {m ? fmt(e.value, m.unit) : e.value}
                  </td>
                  <td
                    className={`px-4 py-3 ${
                      e.rating === "good"
                        ? "text-emerald-700"
                        : e.rating === "poor"
                          ? "text-red-700"
                          : "text-amber-700"
                    }`}
                  >
                    {e.rating}
                  </td>
                  <td className="px-4 py-3 max-w-[260px] truncate">{e.path}</td>
                  <td className="px-4 py-3 text-muted">{parseDevice(e.ua)}</td>
                  <td className="px-4 py-3 text-muted">{parseBrowser(e.ua)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { readAccess, parseBrowser, parseDevice, type AccessEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-line bg-paper p-6">
      <p className="kicker">{label}</p>
      <p className="font-display text-4xl mt-2">{value}</p>
      {sub && <p className="text-[13px] text-muted mt-1">{sub}</p>}
    </div>
  );
}

/** Count occurrences of a key, return the top N sorted desc. */
function topBy(events: AccessEvent[], key: (e: AccessEvent) => string, n = 8) {
  const counts = new Map<string, number>();
  for (const e of events) {
    const k = key(e);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function referrerHost(r: string | null): string {
  if (!r) return "Direct";
  try {
    return new URL(r).hostname || "Direct";
  } catch {
    return r;
  }
}

function BarList({ rows }: { rows: [string, number][] }) {
  const max = rows.reduce((m, [, v]) => Math.max(m, v), 0) || 1;
  if (rows.length === 0) return <p className="text-sm text-muted">No data yet.</p>;
  return (
    <ul className="space-y-2">
      {rows.map(([label, count]) => (
        <li key={label} className="text-sm">
          <div className="flex justify-between gap-4">
            <span className="truncate">{label}</span>
            <span className="text-muted tabular-nums">{count}</span>
          </div>
          <div className="mt-1 h-1.5 bg-ice">
            <div className="h-1.5 bg-teal" style={{ width: `${(count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line bg-paper p-6">
      <h2 className="kicker mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default async function AnalyticsPage() {
  const events = await readAccess(2000);

  const uniqueIps = new Set(events.map((e) => e.ip)).size;

  // Views per day for the last 7 days (including empty days).
  const days: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = events.filter((e) => e.ts.slice(0, 10) === key).length;
    days.push({ label: key.slice(5), count });
  }
  const last7 = days.reduce((n, d) => n + d.count, 0);
  const dayMax = days.reduce((m, d) => Math.max(m, d.count), 0) || 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl">Analytics</h1>
        <p className="text-[13px] text-muted">
          Last {events.length.toLocaleString()} page views (excludes /admin)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total page views" value={events.length.toLocaleString()} />
        <Stat label="Unique visitors" value={uniqueIps.toLocaleString()} sub="by IP" />
        <Stat label="Views last 7 days" value={last7.toLocaleString()} />
      </div>

      <Panel title="Views per day (last 7 days)">
        <div className="flex items-end gap-3 h-32">
          {days.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-1">
              <span className="text-[11px] text-muted tabular-nums">{d.count}</span>
              <div
                className="w-full bg-teal"
                style={{ height: `${(d.count / dayMax) * 100}%`, minHeight: d.count ? 4 : 0 }}
              />
              <span className="text-[10px] text-muted">{d.label}</span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Top pages">
          <BarList rows={topBy(events, (e) => e.path)} />
        </Panel>
        <Panel title="Top referrers">
          <BarList rows={topBy(events, (e) => referrerHost(e.referrer))} />
        </Panel>
        <Panel title="Top countries">
          <BarList rows={topBy(events, (e) => e.country || "—")} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Devices">
          <BarList rows={topBy(events, (e) => parseDevice(e.ua))} />
        </Panel>
        <Panel title="Browsers">
          <BarList rows={topBy(events, (e) => parseBrowser(e.ua))} />
        </Panel>
        <Panel title="Traffic funnel (share of product views)">
          <ul className="space-y-3 text-sm">
            {(() => {
              const productViews = events.filter((e) => e.path.startsWith("/products/")).length;
              const cart = events.filter((e) => e.path === "/cart").length;
              const checkout = events.filter((e) => e.path.startsWith("/checkout") && e.path !== "/checkout/success").length;
              const success = events.filter((e) => e.path === "/checkout/success").length;
              const base = productViews || 1;
              const steps: [string, number][] = [
                ["Product views", productViews],
                ["Cart visits", cart],
                ["Checkout started", checkout],
                ["Order completed", success],
              ];
              return steps.map(([label, count], i) => {
                const pct = Math.round((count / base) * 100);
                const prev = i === 0 ? count : steps[i - 1][1];
                const drop = i === 0 || prev === 0 ? null : `−${Math.round((1 - count / prev) * 100)}% from step ${i}`;
                return (
                  <li key={label}>
                    <div className="flex justify-between gap-4">
                      <span>{label}</span>
                      <span className="text-muted tabular-nums">
                        {count.toLocaleString()} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 bg-ice">
                      <div className="h-1.5 bg-teal" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    {drop && <p className="text-[11px] text-muted mt-0.5">{drop}</p>}
                  </li>
                );
              });
            })()}
          </ul>
        </Panel>
      </div>

      <div>
        <h2 className="font-display text-2xl mb-3">Recent visits</h2>
        {events.length === 0 ? (
          <p className="text-muted text-sm border border-line bg-paper p-6">
            No visits logged yet. Browse the store in another tab to generate traffic.
          </p>
        ) : (
          <div className="border border-line bg-paper overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.06em] text-muted">
                  <th className="px-4 py-3 font-semibold">Time</th>
                  <th className="px-4 py-3 font-semibold">Path</th>
                  <th className="px-4 py-3 font-semibold">IP</th>
                  <th className="px-4 py-3 font-semibold">Country</th>
                  <th className="px-4 py-3 font-semibold">Referrer</th>
                  <th className="px-4 py-3 font-semibold">Browser</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 100).map((e, i) => (
                  <tr key={i} className="border-b border-line last:border-0 hover:bg-ice/50">
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {new Date(e.ts).toLocaleString("en-GB")}
                    </td>
                    <td className="px-4 py-3">{e.path}</td>
                    <td className="px-4 py-3 font-mono text-[12px]">{e.ip}</td>
                    <td className="px-4 py-3 text-muted">{e.country || "—"}</td>
                    <td className="px-4 py-3 text-muted">{referrerHost(e.referrer)}</td>
                    <td className="px-4 py-3 text-muted max-w-[240px] truncate" title={e.ua}>
                      {e.ua || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

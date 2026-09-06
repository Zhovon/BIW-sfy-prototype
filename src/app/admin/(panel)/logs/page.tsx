import { readApi, type ApiEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

function statusClass(status: number): string {
  if (status >= 500) return "text-red-700";
  if (status >= 400) return "text-amber-700";
  if (status >= 300) return "text-teal-700";
  return "text-emerald-700";
}

export default async function ApiLogsPage() {
  const events: ApiEvent[] = await readApi(1000);

  const errors = events.filter((e) => e.status >= 400).length;
  const avgMs = events.length
    ? Math.round(events.reduce((n, e) => n + e.ms, 0) / events.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl">API log</h1>
        <p className="text-[13px] text-muted">
          Last {events.length.toLocaleString()} calls · {errors} errors · ~{avgMs}ms avg
        </p>
      </div>

      {events.length === 0 ? (
        <p className="text-muted text-sm border border-line bg-paper p-6">
          No API calls logged yet. Checkout and admin actions will appear here.
        </p>
      ) : (
        <div className="border border-line bg-paper overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.06em] text-muted">
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Path</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Duration</th>
                <th className="px-4 py-3 font-semibold">IP</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i} className="border-b border-line last:border-0 hover:bg-ice/50">
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(e.ts).toLocaleString("en-GB")}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px]">{e.method}</td>
                  <td className="px-4 py-3">{e.path}</td>
                  <td className={`px-4 py-3 font-semibold tabular-nums ${statusClass(e.status)}`}>
                    {e.status}
                  </td>
                  <td className="px-4 py-3 text-right text-muted tabular-nums">{e.ms}ms</td>
                  <td className="px-4 py-3 font-mono text-[12px]">{e.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { getProduct } from "@/lib/catalog";
import type { BookingCatalog, CrmBranch, CrmService, CrmSlot } from "@/lib/crm";

/**
 * Native, brand-styled booking flow. Runs entirely on biw.beauty and talks to
 * the CRM through the storefront's own /api/booking proxy routes (server-to-
 * server), so there is no iframe and no cross-origin dependency. Seeds the
 * service selection from the cart, then walks branch → date → time → details →
 * confirm. Services are paid at the salon; nothing here touches online checkout.
 */

type Step = "services" | "branch" | "when" | "details" | "done";

/** Selected services as a service-id → count map (count = number of guests). */
type Selection = Record<string, number>;

function formatTk(n: number): string {
  return "৳ " + Math.round(n).toLocaleString("en-US");
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h} hr` : "", m ? `${m} min` : ""].filter(Boolean).join(" ") || "0 min";
}

/** Today in Dhaka as YYYY-MM-DD (the salon's timezone), no DST to worry about. */
function dhakaToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** The next `count` days from Dhaka today, as {ymd, weekday, day, month}. */
function upcomingDates(count: number) {
  const [y, m, d] = dhakaToday().split("-").map(Number);
  const out: { ymd: string; weekday: string; day: string; month: string }[] = [];
  for (let i = 0; i < count; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d + i));
    const ymd = dt.toISOString().slice(0, 10);
    out.push({
      ymd,
      weekday: dt.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      day: dt.toLocaleDateString("en-US", { day: "numeric", timeZone: "UTC" }),
      month: dt.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
    });
  }
  return out;
}

function longDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function BookingFlow() {
  const { serviceItems, remove, hydrated } = useCart();

  const [catalog, setCatalog] = useState<BookingCatalog | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [step, setStep] = useState<Step>("services");
  const [seeded, setSeeded] = useState(false);

  const [selection, setSelection] = useState<Selection>({});
  const [branchId, setBranchId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<CrmSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load the bookable catalog once.
  useEffect(() => {
    let alive = true;
    fetch("/api/booking/catalog")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: BookingCatalog) => {
        if (!alive) return;
        setCatalog(data);
        if (data.branches.length === 1) setBranchId(data.branches[0].id);
      })
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, []);

  const serviceById = useMemo(() => {
    const map = new Map<string, CrmService>();
    catalog?.services.forEach((s) => map.set(s.id, s));
    return map;
  }, [catalog]);

  // Seed the selection from the cart's service items once, after the catalog
  // and cart are both ready. Matches Shopify products to CRM services by id.
  useEffect(() => {
    if (seeded || !catalog || !hydrated) return;
    const seed: Selection = {};
    for (const item of serviceItems) {
      const pid = getProduct(item.handle)?.shopify_product_id;
      if (pid == null) continue;
      const svc = catalog.services.find((s) => s.shopify_product_id === String(pid));
      if (svc) seed[svc.id] = (seed[svc.id] || 0) + item.qty;
    }
    setSelection(seed);
    setSeeded(true);
  }, [seeded, catalog, hydrated, serviceItems]);

  const selectedServices = useMemo(
    () =>
      Object.entries(selection)
        .map(([id, count]) => ({ service: serviceById.get(id), count }))
        .filter((x): x is { service: CrmService; count: number } => Boolean(x.service) && x.count > 0),
    [selection, serviceById],
  );

  const totalDuration = selectedServices.reduce((n, { service, count }) => n + service.duration_minutes * count, 0);
  const totalPrice = selectedServices.reduce((n, { service, count }) => n + service.price * count, 0);
  const hasSelection = selectedServices.length > 0;

  const setCount = useCallback((id: string, next: number) => {
    setSelection((cur) => {
      const copy = { ...cur };
      if (next <= 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  }, []);

  // Fetch slots whenever branch + date + duration are settled.
  const loadSlots = useCallback(
    async (d: string) => {
      if (!branchId || !d) return;
      setSlotsLoading(true);
      setSlots([]);
      setTime("");
      try {
        const qs = new URLSearchParams({ branch_id: branchId, date: d, duration_minutes: String(totalDuration || 60) });
        const res = await fetch(`/api/booking/slots?${qs}`);
        const data = await res.json();
        setSlots(res.ok ? data.slots ?? [] : []);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    },
    [branchId, totalDuration],
  );

  async function submit() {
    setError("");
    if (!name.trim() || !phone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    setSubmitting(true);
    const service_ids: string[] = [];
    for (const { service, count } of selectedServices) {
      for (let i = 0; i < count; i++) service_ids.push(service.id);
    }
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim() || null,
          service_ids,
          branch_id: branchId,
          date,
          time,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Could not confirm your booking. Please try again.");
        return;
      }
      // Clear the booked services from the cart and show the confirmation.
      serviceItems.forEach((i) => remove(i.handle));
      setStep("done");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---- render states ---------------------------------------------------

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-line bg-paper px-6 py-10 text-center">
        <p className="text-muted mb-6">We couldn&apos;t load the booking system just now.</p>
        <button className="btn btn--gold" onClick={() => location.reload()}>Try again</button>
      </div>
    );
  }

  if (!catalog || !hydrated) {
    return <div className="py-24 text-center text-muted">Loading the booking system…</div>;
  }

  if (step === "done") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#d8e9dd] bg-[#f2f9f4] px-6 py-12 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#2f855a] text-white">
          <Check />
        </div>
        <h2 className="font-display text-3xl text-ink">Appointment confirmed</h2>
        <p className="mt-3 text-muted">
          Thank you{name ? `, ${name.split(" ")[0]}` : ""}. We&apos;ve booked you for {longDate(date)} at{" "}
          {slots.find((s) => s.time === time)?.label || time}.
        </p>
        <p className="mt-1 text-sm text-muted">Payment is at the salon. We look forward to seeing you.</p>
        <Link href="/" className="btn btn--gold mt-8 inline-block">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Active step */}
      <div className="order-2 lg:order-1">
        <Stepper step={step} hasSelection={hasSelection} branchNeeded={catalog.branches.length > 1} />

        {step === "services" && (
          <ServiceStep
            services={catalog.services}
            selection={selection}
            setCount={setCount}
            search={search}
            setSearch={setSearch}
          />
        )}

        {step === "branch" && (
          <BranchStep branches={catalog.branches} branchId={branchId} onPick={(id) => { setBranchId(id); setDate(""); setTime(""); }} />
        )}

        {step === "when" && (
          <WhenStep
            date={date}
            time={time}
            slots={slots}
            slotsLoading={slotsLoading}
            onPickDate={(d) => { setDate(d); loadSlots(d); }}
            onPickTime={setTime}
          />
        )}

        {step === "details" && (
          <DetailsStep
            name={name} email={email} phone={phone}
            setName={setName} setEmail={setEmail} setPhone={setPhone}
          />
        )}

        {error && <p role="alert" className="mt-5 text-sm text-[#b91c1c]">{error}</p>}

        <Nav
          step={step}
          canForward={
            (step === "services" && hasSelection) ||
            (step === "branch" && !!branchId) ||
            (step === "when" && !!date && !!time) ||
            (step === "details" && !!name.trim() && !!phone.trim())
          }
          submitting={submitting}
          onBack={() => setStep(prevStep(step, catalog.branches.length > 1))}
          onForward={() => {
            if (step === "details") return submit();
            setStep(nextStep(step, catalog.branches.length > 1));
          }}
        />
      </div>

      {/* Sticky summary */}
      <aside className="order-1 lg:order-2">
        <Summary
          services={selectedServices}
          setCount={setCount}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
          branch={catalog.branches.find((b) => b.id === branchId)}
          date={date}
          timeLabel={slots.find((s) => s.time === time)?.label || (time || "")}
        />
      </aside>
    </div>
  );
}

// ---- step navigation order --------------------------------------------

const order: Step[] = ["services", "branch", "when", "details"];
function nextStep(s: Step, branchStep: boolean): Step {
  let i = order.indexOf(s) + 1;
  if (order[i] === "branch" && !branchStep) i += 1;
  return order[Math.min(i, order.length - 1)];
}
function prevStep(s: Step, branchStep: boolean): Step {
  let i = order.indexOf(s) - 1;
  if (order[i] === "branch" && !branchStep) i -= 1;
  return order[Math.max(i, 0)];
}

// ---- sub-components ----------------------------------------------------

function Stepper({ step, hasSelection, branchNeeded }: { step: Step; hasSelection: boolean; branchNeeded: boolean }) {
  const items = [
    { key: "services", label: "Services" },
    ...(branchNeeded ? [{ key: "branch", label: "Branch" }] : []),
    { key: "when", label: "Date & time" },
    { key: "details", label: "Details" },
  ] as { key: Step; label: string }[];
  const activeIdx = items.findIndex((i) => i.key === step);
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] tracking-[0.06em] text-muted">
      {items.map((it, idx) => (
        <li key={it.key} className="flex items-center gap-2">
          <span className={idx === activeIdx ? "text-ink font-medium" : idx < activeIdx ? "text-teal" : ""}>
            {idx + 1}. {it.label}
          </span>
          {idx < items.length - 1 && <span aria-hidden className="text-line">→</span>}
        </li>
      ))}
      {!hasSelection && step === "services" && <span className="sr-only">Choose a service to begin</span>}
    </ol>
  );
}

function ServiceStep({
  services, selection, setCount, search, setSearch,
}: {
  services: CrmService[];
  selection: Selection;
  setCount: (id: string, n: number) => void;
  search: string;
  setSearch: (s: string) => void;
}) {
  const q = search.trim().toLowerCase();
  const list = q
    ? services.filter((s) => s.name.toLowerCase().includes(q) || (s.category || "").toLowerCase().includes(q))
    : services;
  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Choose your services</h2>
      <p className="mt-1 text-sm text-muted">Pick one or more — they&apos;re booked together. Use +/− for more than one guest.</p>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search services…"
        className="mt-4 w-full border border-line bg-paper px-4 py-3 text-sm focus:border-ink focus:outline-none"
      />
      <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {list.map((s) => {
          const count = selection[s.id] || 0;
          const picked = count > 0;
          return (
            <div
              key={s.id}
              className={`flex items-center justify-between gap-3 border px-4 py-3 transition-colors ${
                picked ? "border-ink bg-ice" : "border-line bg-paper hover:border-ink"
              }`}
            >
              <button type="button" onClick={() => setCount(s.id, count > 0 ? 0 : 1)} className="min-w-0 flex-1 text-left">
                <div className="truncate font-medium text-ink">{s.name}</div>
                <div className="text-xs text-muted">{formatDuration(s.duration_minutes)} · {formatTk(s.price)}</div>
              </button>
              {picked ? (
                <div className="flex items-center gap-2">
                  <StepBtn label="Decrease" onClick={() => setCount(s.id, count - 1)}>−</StepBtn>
                  <span className="w-5 text-center text-sm font-medium">{count}</span>
                  <StepBtn label="Increase" onClick={() => setCount(s.id, count + 1)}>+</StepBtn>
                </div>
              ) : (
                <button type="button" onClick={() => setCount(s.id, 1)} className="text-teal">
                  <span className="text-sm tracking-[0.06em]">Add</span>
                </button>
              )}
            </div>
          );
        })}
        {list.length === 0 && <p className="py-8 text-center text-sm text-muted">No services match “{search}”.</p>}
      </div>
    </div>
  );
}

function StepBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center border border-line text-ink hover:border-ink"
    >
      {children}
    </button>
  );
}

function BranchStep({ branches, branchId, onPick }: { branches: CrmBranch[]; branchId: string; onPick: (id: string) => void }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Which branch?</h2>
      <div className="mt-4 space-y-2">
        {branches.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onPick(b.id)}
            className={`block w-full border px-4 py-4 text-left transition-colors ${
              branchId === b.id ? "border-ink bg-ink text-white" : "border-line bg-paper hover:border-ink"
            }`}
          >
            <div className="font-medium">{b.name}</div>
            {b.address && <div className={`text-xs ${branchId === b.id ? "text-white/70" : "text-muted"}`}>{b.address}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function WhenStep({
  date, time, slots, slotsLoading, onPickDate, onPickTime,
}: {
  date: string;
  time: string;
  slots: CrmSlot[];
  slotsLoading: boolean;
  onPickDate: (d: string) => void;
  onPickTime: (t: string) => void;
}) {
  const dates = useMemo(() => upcomingDates(30), []);
  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Pick a date &amp; time</h2>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {dates.map((d) => (
          <button
            key={d.ymd}
            type="button"
            onClick={() => onPickDate(d.ymd)}
            className={`flex flex-col items-center border py-2 transition-colors ${
              date === d.ymd ? "border-ink bg-ink text-white" : "border-line bg-paper hover:border-ink"
            }`}
          >
            <span className={`text-[10px] uppercase tracking-[0.08em] ${date === d.ymd ? "text-white/70" : "text-muted"}`}>{d.weekday}</span>
            <span className="text-lg font-display leading-none">{d.day}</span>
            <span className={`text-[10px] ${date === d.ymd ? "text-white/70" : "text-muted"}`}>{d.month}</span>
          </button>
        ))}
      </div>

      {date && (
        <div className="mt-8">
          <h3 className="mb-3 text-[12px] uppercase tracking-[0.1em] text-muted">Available times</h3>
          {slotsLoading ? (
            <p className="py-8 text-center text-sm text-muted">Checking availability…</p>
          ) : slots.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No times available for this day — please pick another.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s.time}
                  type="button"
                  disabled={!s.available}
                  onClick={() => onPickTime(s.time)}
                  className={`border py-2.5 text-sm transition-colors ${
                    !s.available
                      ? "cursor-not-allowed border-line bg-ice text-muted line-through opacity-60"
                      : time === s.time
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-paper hover:border-ink"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailsStep({
  name, email, phone, setName, setEmail, setPhone,
}: {
  name: string; email: string; phone: string;
  setName: (v: string) => void; setEmail: (v: string) => void; setPhone: (v: string) => void;
}) {
  const field = "w-full border border-line bg-paper px-4 py-3 text-sm focus:border-ink focus:outline-none";
  const lbl = "block text-[13px] tracking-[0.08em] mb-1.5";
  return (
    <div>
      <h2 className="font-display text-2xl text-ink">Your details</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="bk-name" className={lbl}>Full name *</label>
          <input id="bk-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} placeholder="Jane Doe" />
        </div>
        <div>
          <label htmlFor="bk-phone" className={lbl}>Phone number *</label>
          <input id="bk-phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" className={field} placeholder="017…" />
        </div>
        <div>
          <label htmlFor="bk-email" className={lbl}>Email (optional)</label>
          <input id="bk-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" className={field} placeholder="jane@example.com" />
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">Payment is made at the salon — nothing is charged now.</p>
    </div>
  );
}

function Nav({
  step, canForward, submitting, onBack, onForward,
}: {
  step: Step;
  canForward: boolean;
  submitting: boolean;
  onBack: () => void;
  onForward: () => void;
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      {step !== "services" ? (
        <button type="button" onClick={onBack} className="btn btn--ghost">← Back</button>
      ) : (
        <span />
      )}
      <button type="button" onClick={onForward} disabled={!canForward || submitting} className="btn btn--gold disabled:cursor-not-allowed disabled:opacity-50">
        {step === "details" ? (submitting ? "Confirming…" : "Confirm booking") : "Continue"}
      </button>
    </div>
  );
}

function Summary({
  services, setCount, totalPrice, totalDuration, branch, date, timeLabel,
}: {
  services: { service: CrmService; count: number }[];
  setCount: (id: string, n: number) => void;
  totalPrice: number;
  totalDuration: number;
  branch?: CrmBranch;
  date: string;
  timeLabel: string;
}) {
  return (
    <div className="lg:sticky lg:top-24 border border-line bg-ice px-6 py-6">
      <span className="kicker">Your booking</span>
      {services.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No services chosen yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {services.map(({ service, count }) => (
            <li key={service.id} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink">
                {service.name}
                {count > 1 && <span className="text-muted"> ×{count}</span>}
                <button type="button" onClick={() => setCount(service.id, 0)} className="ml-2 text-xs text-muted underline hover:text-ink">remove</button>
              </span>
              <span className="whitespace-nowrap text-muted">{formatTk(service.price * count)}</span>
            </li>
          ))}
        </ul>
      )}

      {services.length > 0 && (
        <div className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><span className="text-muted">Total time</span><span className="text-ink">{formatDuration(totalDuration)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Total (pay at salon)</span><span className="font-medium text-ink">{formatTk(totalPrice)}</span></div>
        </div>
      )}

      {(branch || date) && (
        <div className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
          {branch && <div className="flex justify-between gap-3"><span className="text-muted">Branch</span><span className="text-right text-ink">{branch.name}</span></div>}
          {date && <div className="flex justify-between gap-3"><span className="text-muted">When</span><span className="text-right text-ink">{longDate(date)}{timeLabel ? `, ${timeLabel}` : ""}</span></div>}
        </div>
      )}
    </div>
  );
}

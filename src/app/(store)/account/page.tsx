import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ordersForEmail } from "@/lib/orders";
import { getCustomerAppointments } from "@/lib/crm";
import SignOutButton from "./_components/SignOutButton";
import ProfileForm from "./_components/ProfileForm";

export const metadata = { title: "My Account · BIW" };
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending", paid: "Paid", failed: "Failed",
  cancelled: "Cancelled", fulfilled: "Fulfilled", refunded: "Refunded",
};

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/account/login?next=/account");

  const user = session.user as typeof session.user & { phone?: string; address?: string };
  const orders = await ordersForEmail(user.email);
  const appointments = await getCustomerAppointments({ phone: user.phone, email: user.email });

  // appointment_time is Dhaka wall-clock labeled UTC — format in UTC to show the
  // real local time (never the viewer's timezone). See CRM timezone convention.
  const fmtApptTime = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      timeZone: "UTC", day: "2-digit", month: "short", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });

  return (
    <div className="wrap py-14 max-w-3xl">
      <div className="flex items-end justify-between border-b border-line pb-4 mb-10">
        <div>
          <h1 className="font-display text-4xl">My Account</h1>
          <p className="text-sm text-muted mt-1">{user.name} · {user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {/* Orders */}
      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">Order history</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted">You have no orders yet.</p>
        ) : (
          <div className="divide-y divide-line border border-line">
            {orders.map((o) => (
              <div key={o.tranId} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">#{o.tranId}</div>
                  <div className="text-muted text-[13px]">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.lines.length} item{o.lines.length === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="text-right">
                  <div>৳{o.amount.toLocaleString()}</div>
                  <div className="text-muted text-[13px]">{STATUS_LABEL[o.status] ?? o.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Appointments */}
      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">My appointments</h2>
        {!user.phone && appointments.length === 0 ? (
          <p className="text-sm text-muted">
            Add your phone number in your profile below to see your salon bookings here.
          </p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-muted">No appointments found yet.</p>
        ) : (
          <div className="divide-y divide-line border border-line">
            {appointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">{a.services.length ? a.services.join(", ") : "Appointment"}</div>
                  <div className="text-muted text-[13px]">
                    {fmtApptTime(a.appointment_time)}{a.branch_name ? ` · ${a.branch_name}` : ""}
                  </div>
                </div>
                <div className="text-muted text-[13px]">{a.status}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Loyalty — Phase 2 */}
      <section className="mb-12">
        <h2 className="font-display text-2xl mb-4">Loyalty</h2>
        <p className="text-sm text-muted">Coming soon — track your stamps and rewards here.</p>
      </section>

      {/* Profile */}
      <section className="mb-4">
        <h2 className="font-display text-2xl mb-4">Profile &amp; address</h2>
        <ProfileForm
          name={user.name ?? ""}
          email={user.email}
          phone={user.phone ?? ""}
          address={user.address ?? ""}
        />
      </section>
    </div>
  );
}

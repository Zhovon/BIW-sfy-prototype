import { SITE_URL, SITE_NAME, absoluteUrl } from "@/lib/site";
import type { Order } from "@/lib/order-types";

/**
 * Email templates for the contact form. Built email-safe on purpose:
 * table-based layout, all styles inline, absolute image URLs, and a serif
 * fallback (Gmail/Outlook strip web fonts, so Cormorant → Georgia). Two
 * emails: a scannable STAFF notification and a branded CUSTOMER auto-reply.
 *
 * Brand (Clinical Couture): Ice #EEF6F9 · Teal #4E9DB8 · Ink #12333D · Gold #C9A961.
 */

const INK = "#12333D";
const GOLD = "#C9A961";
const ICE = "#EEF6F9";
const TEAL = "#4E9DB8";
const MUTED = "#5F6B72";
const LINE = "#D8DEE1";

const SANS = "Arial, Helvetica, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const SALON_PHONE = "+8801806553255";

export type ContactSubmission = {
  name: string;
  email: string;
  phone: string;
  comment: string;
};

/** Escape user input before interpolating into HTML (prevents markup injection). */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(name: string): string {
  return (name.trim().split(/\s+/)[0] || "there");
}

/** Convert newlines in the message to <br> after escaping. */
function messageHtml(comment: string): string {
  return esc(comment).replace(/\r?\n/g, "<br>");
}

/** Shared outer shell: ice background, centered 600px white card with a border. */
function shell(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${ICE};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ICE};">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:2px;">
        ${inner}
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * Ink header bar with the gold logo. Uses the transparent-background wordmark
 * (biw-logo.png), NOT biw-emblem.png — the emblem is a cream-marble mockup photo
 * that shows as a light tile on dark. `center` for the customer email.
 */
function header(center: boolean): string {
  const logo = `<img src="${absoluteUrl("/biw-logo.png")}" width="${center ? 150 : 96}" alt="${SITE_NAME}" style="display:block;border:0;${center ? "margin:0 auto;" : ""}">`;
  if (center) {
    return `<tr><td style="background:${INK};padding:24px 32px;text-align:center;">${logo}</td></tr>`;
  }
  return `<tr><td style="background:${INK};padding:18px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle;">${logo}</td>
      <td style="vertical-align:middle;text-align:right;color:${GOLD};font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;">New Website Enquiry</td>
    </tr></table>
  </td></tr>`;
}

const goldRule = `<tr><td style="padding:20px 0 0;"><div style="height:2px;width:48px;background:${GOLD};"></div></td></tr>`;

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${GOLD};color:${INK};font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:13px 26px;border-radius:2px;">${label}</a>`;
}

/** STAFF notification — clear and scannable; reply goes to the customer. */
export function staffNotificationEmail(s: ContactSubmission): { subject: string; html: string; text: string } {
  const dhaka = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short",
  }).format(new Date());

  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:6px 0;font-family:${SANS};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};width:80px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-family:${SANS};font-size:15px;color:${INK};">${value}</td>
    </tr>`;

  const inner = `
    ${header(false)}
    <tr><td style="padding:32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${TEAL};padding-bottom:4px;">New enquiry</td></tr>
        <tr><td style="font-family:${SERIF};font-size:26px;color:${INK};line-height:1.2;">${esc(s.name || "Website visitor")}</td></tr>
        ${goldRule}
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
        ${s.phone ? row("Phone", `<a href="tel:${esc(s.phone)}" style="color:${INK};text-decoration:none;">${esc(s.phone)}</a>`) : ""}
        ${row("Email", `<a href="mailto:${esc(s.email)}" style="color:${INK};text-decoration:none;">${esc(s.email)}</a>`)}
      </table>
      <div style="margin-top:20px;font-family:${SANS};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};">Message</div>
      <div style="margin-top:8px;background:${ICE};border-left:3px solid ${TEAL};padding:16px 18px;font-family:${SANS};font-size:15px;line-height:1.6;color:${INK};">${messageHtml(s.comment)}</div>
      <div style="margin-top:26px;">${button(`mailto:${esc(s.email)}`, `Reply to ${esc(firstName(s.name))}`)}</div>
    </td></tr>
    <tr><td style="padding:18px 32px;border-top:1px solid ${LINE};font-family:${SANS};font-size:12px;color:${MUTED};">
      Sent from the biw.beauty contact form · ${dhaka} (Dhaka)
    </td></tr>`;

  const text = [
    `New enquiry — ${s.name || "Website visitor"}`,
    ``,
    `Phone: ${s.phone || "—"}`,
    `Email: ${s.email}`,
    ``,
    s.comment,
    ``,
    `— Sent from the biw.beauty contact form (${dhaka} Dhaka)`,
  ].join("\n");

  return { subject: `New enquiry from ${s.name || "a website visitor"}`, html: shell(inner), text };
}

/** CUSTOMER auto-reply — warm, branded acknowledgement with a copy of their message. */
export function customerAutoReplyEmail(s: ContactSubmission): { subject: string; html: string; text: string } {
  const inner = `
    ${header(true)}
    <tr><td style="padding:40px 40px 8px;text-align:center;">
      <div style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${TEAL};">${SITE_NAME}</div>
      <div style="font-family:${SERIF};font-size:30px;color:${INK};line-height:1.2;margin-top:6px;">Thank you, ${esc(firstName(s.name))}</div>
      <div style="height:2px;width:48px;background:${GOLD};margin:20px auto 0;"></div>
    </td></tr>
    <tr><td style="padding:20px 40px 0;font-family:${SANS};font-size:15px;line-height:1.7;color:${INK};text-align:center;">
      We&rsquo;ve received your message and a member of our team will be in touch with you very soon. We&rsquo;re delighted you reached out.
    </td></tr>
    <tr><td style="padding:24px 40px 0;">
      <div style="font-family:${SANS};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};text-align:center;padding-bottom:8px;">Your message</div>
      <div style="background:${ICE};border-left:3px solid ${GOLD};padding:16px 18px;font-family:${SANS};font-size:14px;line-height:1.6;color:${INK};">${messageHtml(s.comment)}</div>
    </td></tr>
    <tr><td style="padding:28px 40px 8px;text-align:center;">${button(SITE_URL, "Explore our services")}</td></tr>
    <tr><td style="padding:32px 40px;text-align:center;">
      <div style="font-family:${SERIF};font-size:16px;color:${INK};font-style:italic;">Bring out your inner beauty</div>
    </td></tr>
    <tr><td style="background:${INK};padding:24px 40px;text-align:center;font-family:${SANS};font-size:12px;line-height:1.7;color:#c7d3d8;">
      <div style="color:${GOLD};letter-spacing:1px;text-transform:uppercase;font-size:11px;">${SITE_NAME}</div>
      Dhaka, Bangladesh · <a href="tel:${SALON_PHONE}" style="color:#c7d3d8;text-decoration:none;">${SALON_PHONE}</a><br>
      <a href="${SITE_URL}" style="color:${GOLD};text-decoration:none;">biw.beauty</a>
    </td></tr>`;

  const text = [
    `Thank you, ${firstName(s.name)}`,
    ``,
    `We've received your message and a member of our team will be in touch with you very soon.`,
    ``,
    `Your message:`,
    s.comment,
    ``,
    `Beauty Intelligent Wellness · Dhaka, Bangladesh · ${SALON_PHONE}`,
    SITE_URL,
  ].join("\n");

  return { subject: `We've received your message — ${SITE_NAME}`, html: shell(inner), text };
}

const bdt = (n: number) => `৳${Math.round(n).toLocaleString("en-US")}`;

/**
 * STAFF notification for a new "pay at the salon" order. Since there's no payment
 * callback for floor orders, this email is how the team learns an order came in —
 * with the items, total and customer contact, so they can prepare it and collect
 * payment in person. The order sits as `pending` in /admin/orders until fulfilled.
 */
export function orderNotificationEmail(o: Order): { subject: string; html: string; text: string } {
  const dhaka = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short",
  }).format(new Date(o.createdAt));

  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:6px 0;font-family:${SANS};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};width:80px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-family:${SANS};font-size:15px;color:${INK};">${value}</td>
    </tr>`;

  const items = o.lines.map((l) =>
    `<tr>
      <td style="padding:8px 0;border-bottom:1px solid ${LINE};font-family:${SANS};font-size:14px;color:${INK};">${esc(l.title)} <span style="color:${MUTED};">× ${l.qty}</span></td>
      <td style="padding:8px 0;border-bottom:1px solid ${LINE};font-family:${SANS};font-size:14px;color:${INK};text-align:right;white-space:nowrap;">${bdt(l.price * l.qty)}</td>
    </tr>`).join("");

  const inner = `
    ${header(false)}
    <tr><td style="padding:32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${TEAL};padding-bottom:4px;">New order · Pay at the salon</td></tr>
        <tr><td style="font-family:${SERIF};font-size:26px;color:${INK};line-height:1.2;">${esc(o.customer.name)}</td></tr>
        ${goldRule}
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;">
        ${row("Phone", `<a href="tel:${esc(o.customer.phone)}" style="color:${INK};text-decoration:none;">${esc(o.customer.phone)}</a>`)}
        ${row("Email", `<a href="mailto:${esc(o.customer.email)}" style="color:${INK};text-decoration:none;">${esc(o.customer.email)}</a>`)}
        ${o.customer.address ? row("Address", esc(o.customer.address)) : ""}
        ${row("Order", esc(o.tranId))}
      </table>
      <div style="margin-top:22px;font-family:${SANS};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${MUTED};">Items</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
        ${items}
        <tr>
          <td style="padding:12px 0 0;font-family:${SANS};font-size:15px;font-weight:bold;color:${INK};">Total</td>
          <td style="padding:12px 0 0;font-family:${SANS};font-size:15px;font-weight:bold;color:${INK};text-align:right;">${bdt(o.amount)}</td>
        </tr>
      </table>
      <div style="margin-top:20px;background:${ICE};border-left:3px solid ${GOLD};padding:14px 18px;font-family:${SANS};font-size:14px;line-height:1.6;color:${INK};">
        <strong>Payment:</strong> collect in person at the salon. This order is <strong>pending</strong> in the admin panel until you mark it fulfilled.
      </div>
      <div style="margin-top:24px;">${button(absoluteUrl("/admin/orders"), "Open admin orders")}</div>
    </td></tr>
    <tr><td style="padding:18px 32px;border-top:1px solid ${LINE};font-family:${SANS};font-size:12px;color:${MUTED};">
      New order placed on biw.beauty · ${dhaka} (Dhaka)
    </td></tr>`;

  const text = [
    `New order (pay at the salon) — ${o.customer.name}`,
    ``,
    `Phone: ${o.customer.phone}`,
    `Email: ${o.customer.email}`,
    o.customer.address ? `Address: ${o.customer.address}` : ``,
    `Order: ${o.tranId}`,
    ``,
    ...o.lines.map((l) => `  ${l.title} × ${l.qty} — ${bdt(l.price * l.qty)}`),
    `  Total — ${bdt(o.amount)}`,
    ``,
    `Payment: collect in person at the salon. Order is pending until fulfilled.`,
    `${SITE_URL}/admin/orders`,
    ``,
    `— Placed on biw.beauty (${dhaka} Dhaka)`,
  ].filter(Boolean).join("\n");

  return { subject: `New order · ${bdt(o.amount)} · ${o.customer.name} (pay at salon)`, html: shell(inner), text };
}

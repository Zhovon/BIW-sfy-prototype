/**
 * SSLCommerz gateway client (Bangladesh) — sandbox by default.
 *
 * Sandbox test credentials are the SSLCommerz public defaults (testbox/qwerty).
 * Flip to live by setting SSLC_IS_LIVE=true and providing real store creds:
 *   SSLC_STORE_ID, SSLC_STORE_PASSWD, SSLC_IS_LIVE, APP_URL
 *
 * Hosted redirect flow (keeps us out of PCI scope):
 *   init()  -> returns GatewayPageURL, redirect customer there
 *   gateway -> POSTs back to success/fail/cancel + ipn_url
 *   validate(val_id) -> confirm the transaction is genuinely paid
 */

export const SSLC = {
  storeId: process.env.SSLC_STORE_ID || "testbox",
  storePasswd: process.env.SSLC_STORE_PASSWD || "qwerty",
  isLive: process.env.SSLC_IS_LIVE === "true",
  appUrl: (process.env.APP_URL || "http://localhost:3002").replace(/\/$/, ""),
};

function apiBase() {
  return SSLC.isLive ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com";
}

export type InitCustomer = { name: string; email: string; phone: string; address: string };

export type InitResult =
  | { ok: true; gatewayUrl: string }
  | { ok: false; reason: string };

export async function initSession(opts: {
  tranId: string;
  amount: number;
  customer: InitCustomer;
  productName: string;
  numItems: number;
}): Promise<InitResult> {
  const body = new URLSearchParams({
    store_id: SSLC.storeId,
    store_passwd: SSLC.storePasswd,
    total_amount: opts.amount.toFixed(2),
    currency: "BDT",
    tran_id: opts.tranId,
    success_url: `${SSLC.appUrl}/api/checkout/success`,
    fail_url: `${SSLC.appUrl}/api/checkout/fail`,
    cancel_url: `${SSLC.appUrl}/api/checkout/cancel`,
    ipn_url: `${SSLC.appUrl}/api/checkout/ipn`,
    shipping_method: "NO",
    product_name: opts.productName.slice(0, 255),
    product_category: "Salon",
    product_profile: "general",
    num_of_item: String(opts.numItems),
    cus_name: opts.customer.name,
    cus_email: opts.customer.email,
    cus_phone: opts.customer.phone,
    cus_add1: opts.customer.address || "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
  });

  try {
    const res = await fetch(`${apiBase()}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    if (data?.status === "SUCCESS" && data?.GatewayPageURL) {
      return { ok: true, gatewayUrl: data.GatewayPageURL };
    }
    return { ok: false, reason: data?.failedreason || "Gateway did not return a payment URL" };
  } catch (e) {
    return { ok: false, reason: `Gateway unreachable: ${(e as Error).message}` };
  }
}

/** Confirm a transaction is genuinely paid. Returns true only for VALID/VALIDATED. */
export async function validatePayment(valId: string): Promise<boolean> {
  const url = new URL(`${apiBase()}/validator/api/validationserverAPI.php`);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", SSLC.storeId);
  url.searchParams.set("store_passwd", SSLC.storePasswd);
  url.searchParams.set("format", "json");
  try {
    const res = await fetch(url, { method: "GET" });
    const data = await res.json();
    return data?.status === "VALID" || data?.status === "VALIDATED";
  } catch {
    return false;
  }
}

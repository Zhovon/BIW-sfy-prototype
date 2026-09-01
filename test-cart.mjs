import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "http://localhost:3002";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

function assert(cond, label) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);
  if (!cond) process.exitCode = 1;
}

// 1. product page loads
await page.goto(`${BASE}/products/signature-facial`, { waitUntil: "networkidle0" });
const title = await page.$eval("h1", (el) => el.textContent);
assert(title.includes("Signature Facial"), "product title renders");

// 2. click "Book appointment now" -> drawer opens with the item
await page.click("button.btn:not(.btn--ghost)");
await new Promise((r) => setTimeout(r, 500));
const drawerText = await page.$eval('aside[aria-label="Cart"]', (el) => el.textContent);
assert(/Signature Facial/.test(drawerText), "drawer shows added item");
assert(/Tk 14,000\.00 BDT/.test(drawerText), "drawer shows correct subtotal price");

// 3. cart count badge shows 1
const badge = await page.$eval("header", (el) => el.textContent);
assert(/1/.test(badge), "header cart badge increments");

// 4. add same item again -> qty 2, subtotal 28,000
await page.reload({ waitUntil: "networkidle0" });
await page.click("button.btn:not(.btn--ghost)");
await new Promise((r) => setTimeout(r, 400));

// 5. go to /cart page, verify line total
await page.goto(`${BASE}/cart`, { waitUntil: "networkidle0" });
const cartText = await page.$eval("main", (el) => el.textContent);
assert(/Order Summary/.test(cartText), "cart page renders summary");
assert(/Tk 28,000\.00 BDT/.test(cartText), "cart subtotal reflects qty 2 (28,000)");

// 6. persistence across reload (localStorage)
await page.reload({ waitUntil: "networkidle0" });
const afterReload = await page.$eval("main", (el) => el.textContent);
assert(/Signature Facial/.test(afterReload), "cart persists across reload");

assert(errors.length === 0, `no JS/console errors (${errors.length})`);
if (errors.length) console.log("  errors:", errors.slice(0, 3));

await browser.close();

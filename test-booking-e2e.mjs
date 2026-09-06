// End-to-end booking verification.
//  A) Storefront /book builds the correct CRM handoff URL from the cart.
//  B) The real prod CRM widget resolves that pid, shows availability, and books
//     a real appointment (driven top-level; the CRM's frame-ancestors CSP blocks
//     iframe embedding from localhost, so we drive the widget page directly).
// Creates ONE test appointment — the companion cleanup script removes it.
// Email is left blank => no confirmation email is sent.
import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const STORE = "http://localhost:3002";
const CRM = "https://crm.biw.salon";
const PID = "8313669615805";       // Face Fair Polish
const BRANCH = "Bashundhara Female";
const DAY = "8";                    // 2026-09-08
const SLOT = "11:00 AM";
const NAME = "E2E TEST DELETE ME";
const PHONE = "01900000099";

const log = (m) => console.log(`  ${m}`);
const fail = async (browser, page, m) => {
  try { if (page) await page.screenshot({ path: "/tmp/biw-e2e-fail.png", fullPage: true }); } catch {}
  if (browser) await browser.close();
  console.error(`✗ ${m}`);
  process.exit(1);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();

try {
  // ---- A) Storefront handoff URL ------------------------------------------
  await page.goto(`${STORE}/collections/all`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.setItem("biw-cart-v1", JSON.stringify([
      { handle: "face-fair-polish", title: "Face Fair Polish", price: 1500, image: null, type: "service", qty: 1 },
    ]));
  });
  await page.goto(`${STORE}/book`, { waitUntil: "networkidle2" });
  await page.waitForSelector("iframe", { timeout: 10000 }).catch(() => {});
  const src = await page.$eval("iframe", (el) => el.src).catch(() => null);
  if (src !== `${CRM}/book?cart=${PID}`) await fail(browser, page, `handoff URL wrong: ${src}`);
  log(`✓ storefront handoff URL = ${src}`);

  // ---- B) Drive the real CRM widget top-level -----------------------------
  await page.goto(`${CRM}/book?cart=${PID}`, { waitUntil: "networkidle2" });

  const clickBtn = async (text, exact = false) => {
    const ok = await page.evaluate((t, ex) => {
      const btns = [...document.querySelectorAll("button")].filter((b) => !b.disabled);
      const el = btns.find((b) => (ex ? b.textContent.trim() === t : b.textContent.includes(t)));
      if (el) { el.click(); return true; }
      return false;
    }, text, exact);
    return ok;
  };
  const waitText = (re, t = 15000) =>
    page.waitForFunction((s) => new RegExp(s, "i").test(document.body.innerText), { timeout: t }, re.source);

  // pid resolved => jumps straight to branch step ("Select Location")
  await waitText(/Select Location/, 25000).catch(() =>
    fail(browser, page, "widget did not resolve pid (never reached 'Select Location')"));
  log("✓ CRM widget resolved the service (branch step)");

  if (!(await clickBtn(BRANCH))) await fail(browser, page, `no branch button "${BRANCH}"`);
  await waitText(/Select a Date/);
  if (!(await clickBtn(DAY, true))) await fail(browser, page, `no calendar day "${DAY}"`);
  await waitText(/Select Time/);
  if (!(await clickBtn(SLOT))) await fail(browser, page, `slot "${SLOT}" not available`);
  log(`✓ branch + date ${DAY} + slot ${SLOT}`);

  await page.waitForSelector('input[placeholder="Jane Doe"]', { timeout: 15000 });
  await (await page.$('input[placeholder="Jane Doe"]')).type(NAME);
  await (await page.$('input[placeholder="017..."]')).type(PHONE);
  log("✓ name + phone (email blank)");

  if (!(await clickBtn("Confirm Booking"))) await fail(browser, page, "no Confirm button");
  await waitText(/all set|I&#39;m all set|Confirm Booking/, 8000);
  if (!(await clickBtn("all set"))) await fail(browser, page, "no 'all set' modal confirm");

  await waitText(/Booking Confirmed/, 20000).catch(() =>
    fail(browser, page, "widget never confirmed — POST likely failed"));
  log("✓ CRM widget: 'Booking Confirmed!' (appointment created)");

  console.log("\n✓✓ E2E PASSED — storefront handoff + real booking round-trip through the CRM");
  await browser.close();
} catch (e) {
  await fail(browser, page, e.message);
}

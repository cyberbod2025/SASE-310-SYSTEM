import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "C:\\Users\\cyber\\Desktop\\Capturas_Video_SASE";
const BASE_URL = "http://localhost:3000";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

(async () => {
  console.log("Launching browser (SLOW MODE)...");
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 },
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1920,1080",
    ],
  });
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: "networkidle0", timeout: 90000 });

    // Explicit wait for app load
    await new Promise((r) => setTimeout(r, 5000));

    // Check where we are
    const dashboardExists = await page.$("#nav-protocolos");
    if (!dashboardExists) {
      console.log("Not logged in. Searching for login buttons...");

      // Try to find ANY button to click if it looks like a demo button
      try {
        await page.waitForSelector("button", { timeout: 10000 });

        const demoBtn = await page.evaluateHandle(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          // Look for common keywords
          return btns.find((b) => {
            const t = (b.textContent || "").toLowerCase();
            return (
              t.includes("demo") ||
              t.includes("acceso") ||
              t.includes("ingresar")
            );
          });
        });

        if (demoBtn && demoBtn.asElement()) {
          console.log("Found a likely login/demo button. Clicking...");
          await demoBtn.click();
          await page
            .waitForNavigation({ waitUntil: "networkidle0", timeout: 60000 })
            .catch((e) => console.log("Nav wait timeout, continuing..."));
        } else {
          console.log("No obvious button found. Trying form fill...");
          await page.type('input[type="email"]', "docente@sase.edu.mx");
          await page.type('input[type="password"]', "demo123");
          await page.click("button[type='submit']");
          await page.waitForNavigation({
            waitUntil: "networkidle0",
            timeout: 60000,
          });
        }
      } catch (e) {
        console.log("Login attempt failed:", e.message);
      }
    }

    console.log("Checking for Protocols nav...");
    await page.waitForSelector("#nav-protocolos", {
      visible: true,
      timeout: 30000,
    });
    await page.click("#nav-protocolos");
    console.log("Clicked Protocolos.");

    console.log("Waiting for cards...");
    await new Promise((r) => setTimeout(r, 8000));

    // Click Card
    console.log("Finding card...");
    const card = await page.evaluateHandle(() => {
      // Find element containing "RIESGO" or "ALERTA"
      const elements = Array.from(document.querySelectorAll("h3, span, div"));
      const target = elements.find((el) => {
        const t = (el.textContent || "").toUpperCase();
        return (
          t.includes("RIESGO") ||
          t.includes("ALERTA") ||
          t.includes("EMERGENCIA")
        );
      });
      if (target)
        return (
          target.closest(".cursor-pointer") || target.closest("div.bg-white")
        );
      return null;
    });

    if (card && card.asElement()) {
      await card.click();
      await new Promise((r) => setTimeout(r, 5000));
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "02_modal_protocolo.png"),
      });
      console.log("Captured 02_modal_protocolo.png");
    } else {
      console.log("Card not found. Taking debug screenshot.");
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "debug_no_card_slow.png"),
      });
    }
  } catch (e) {
    console.error("Fatal Error:", e);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "debug_fatal.png") });
  } finally {
    await browser.close();
  }
})();

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "C:\\Users\\cyber\\Desktop\\Capturas_Video_SASE";
const BASE_URL = "http://localhost:3000";

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

(async () => {
  console.log("Launching browser for Screenshot 02...");
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: "networkidle0", timeout: 60000 });

    // Check if we need to login
    const dashboardExists = await page.$("#nav-protocolos");
    if (!dashboardExists) {
      console.log("Not logged in. Attempting login...");
      // Login logic
      try {
        // Check for Demo button (any button with 'Demo' text)
        const demoBtn = await page.evaluateHandle(() => {
          const btns = Array.from(document.querySelectorAll("button"));
          return btns.find(
            (b) =>
              b.textContent &&
              (b.textContent.toLowerCase().includes("demo") ||
                b.textContent.includes("Acceso"))
          );
        });

        if (demoBtn && demoBtn.asElement()) {
          console.log("Clicking Demo Button...");
          await demoBtn.click();
        } else {
          console.log("Demo button not found, trying credentials...");
          await page.waitForSelector('input[type="email"]', { timeout: 5000 });
          await page.type('input[type="email"]', "docente@sase.edu.mx");
          await page.type('input[type="password"]', "demo123");
          await page.click("button[type='submit']");
        }
        await page.waitForNavigation({ waitUntil: "networkidle0" });
      } catch (e) {
        console.log("Login step error:", e.message);
      }
    } else {
      console.log("Already on dashboard.");
    }

    console.log("Navigating to Protocols...");
    try {
      await page.waitForSelector("#nav-protocolos", {
        visible: true,
        timeout: 15000,
      });
      await page.click("#nav-protocolos");
      console.log("Clicked Protocolos.");
    } catch (e) {
      console.log("Failed to click #nav-protocolos. Taking debug screenshot.");
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "debug_nav_fail.png"),
      });
      throw e;
    }

    // Wait for cards
    console.log("Waiting for cards...");
    await new Promise((r) => setTimeout(r, 5000));

    // Find a Protocol Card.
    const card = await page.evaluateHandle(() => {
      // Look for any element that looks like a protocol card.
      // They usually have an H3 or span with uppercase text like "RIESGO".
      const relevantTags = Array.from(
        document.querySelectorAll("span, h3, div")
      );
      // Find one with text "RIESGO" or "ALERTA" or "SALUD"
      const target = relevantTags.find((el) => {
        const t = el.textContent || "";
        return (
          t.includes("RIESGO") ||
          t.includes("ALERTA") ||
          t.includes("SALUD") ||
          t.includes("EMERGENCIA")
        );
      });

      if (target) {
        // Traverse up to find the card container (usually clickable)
        // The card has a click handler. It's likely a div.
        let p = target.parentElement;
        while (p && p.tagName !== "BODY") {
          if (getComputedStyle(p).cursor === "pointer") return p;
          p = p.parentElement;
        }
        // If no pointer cursor found, just return the target's parent context
        return target.closest("div.bg-white") || target.closest("div.relative");
      }
      return null;
    });

    if (card && card.asElement()) {
      console.log("Clicking protocol card...");
      await card.click();

      // Wait for modal
      console.log("Waiting for modal...");
      await new Promise((r) => setTimeout(r, 3000));

      console.log("Taking screenshot 02_modal_protocolo.png...");
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "02_modal_protocolo.png"),
      });
      console.log("Captured 02 successfully.");
    } else {
      console.error("No protocol card found. Taking debug screenshot.");
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "debug_no_cards.png"),
      });
    }
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await browser.close();
  }
})();

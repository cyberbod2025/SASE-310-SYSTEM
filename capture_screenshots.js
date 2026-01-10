import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "C:\\Users\\cyber\\Desktop\\Capturas_Video_SASE";
const BASE_URL = "http://localhost:3000";

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: { width: 1920, height: 1080 },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: "networkidle0", timeout: 60000 });

    // Simulate Login
    // Prefer Demo Button
    try {
      const demoBtn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        return btns.find(
          (b) => b.textContent && b.textContent.includes("ACCESO DEMOSTRATIVO")
        );
      });
      if (demoBtn && demoBtn.asElement()) {
        console.log("Clicking Demo Button...");
        await demoBtn.click();
        await page.waitForNavigation({ waitUntil: "networkidle0" });
      } else {
        console.log("Demo button not found, trying credentials...");
        const loginBtn = await page.$('button[type="submit"]');
        if (loginBtn) {
          await page.type('input[type="email"]', "docente@sase.edu.mx");
          await page.type('input[type="password"]', "demo123");
          await page.click("button");
          await page.waitForNavigation({ waitUntil: "networkidle0" });
        }
      }
    } catch (e) {
      console.log("Login step error:", e);
    }

    console.log("Logged in. Waiting for dashboard...");
    try {
      await page.waitForSelector("#sidebar-nav", { timeout: 10000 });
    } catch (e) {
      console.log(
        "Sidebar not found immediately, checking if already inside..."
      );
    }

    // Initialize output dir
    if (!fs.existsSync(OUTPUT_DIR))
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // --- 1. Dashboard Protocolos ---
    console.log("Navigating to Protocols...");
    try {
      await page.waitForSelector("#nav-protocolos", { timeout: 10000 });
      await page.click("#nav-protocolos");
      await new Promise((r) => setTimeout(r, 10000)); // Long wait for animation/load
      await page.screenshot({
        path: path.join(OUTPUT_DIR, "01_dashboard_protocolos.png"),
      });
      console.log("Captured 01");
    } catch (e) {
      console.error("Failed 01:", e);
    }

    // --- 2. Card Protocolo Salud (Convulsion) ---
    console.log("Finding Salud Card...");
    let savedProtocolCard;
    try {
      await new Promise((r) => setTimeout(r, 2000));
      savedProtocolCard = await page.evaluateHandle(() => {
        const h3s = Array.from(document.querySelectorAll("h3"));
        console.log(
          "Available H3s:",
          h3s.map((h) => h.textContent)
        );
        const header = h3s.find((el) => el.textContent.includes("Convuls"));
        // Return immediate parent or reliable container
        if (header) return header.parentElement.parentElement;
        return null;
      });

      if (savedProtocolCard && savedProtocolCard.asElement()) {
        await savedProtocolCard.screenshot({
          path: path.join(OUTPUT_DIR, "02_card_protocolo_salud_convulsion.png"),
        });
        console.log("Captured 02");

        // --- 3. Modal Protocolo Convulsion ---
        console.log("Opening Convulsion Modal...");
        await savedProtocolCard.click();
        await new Promise((r) => setTimeout(r, 3000)); // Wait for modal animation
        await page.screenshot({
          path: path.join(OUTPUT_DIR, "03_modal_protocolo_convulsion.png"),
        });
        console.log("Captured 03");

        // Close modal
        await page.mouse.click(10, 10);
        await new Promise((r) => setTimeout(r, 1500));
      } else {
        console.log("Convulsion card not found");
      }
    } catch (e) {
      console.error("Failed 02/03:", e);
    }

    // --- 4. Card Sismo ---
    try {
      const sismoCard = await page.evaluateHandle(() => {
        const h3s = Array.from(document.querySelectorAll("h3"));
        const header = h3s.find((el) => el.textContent.includes("Sismo"));
        return header ? header.parentElement.parentElement : null;
      });

      if (sismoCard && sismoCard.asElement()) {
        await sismoCard.screenshot({
          path: path.join(OUTPUT_DIR, "04_card_protocolo_pc_sismo.png"),
        });
        console.log("Captured 04");

        // --- 5. Modal Sismo ---
        console.log("Opening Sismo Modal...");
        await sismoCard.click();
        await new Promise((r) => setTimeout(r, 3000));
        await page.screenshot({
          path: path.join(OUTPUT_DIR, "05_modal_protocolo_sismo.png"),
        });
        console.log("Captured 05");

        // Close
        await page.mouse.click(10, 10);
        await new Promise((r) => setTimeout(r, 1500));
      } else {
        console.log("Sismo card not found");
      }
    } catch (e) {
      console.error("Failed 04/05:", e);
    }

    // --- 6. Quick Register ---
    console.log("Opening Quick Register...");
    try {
      const boltBtn = await page.evaluateHandle(() => {
        const spans = Array.from(
          document.querySelectorAll("span.material-symbols-outlined")
        );
        return spans
          .find((s) => s.textContent && s.textContent.includes("add"))
          ?.closest("button");
      });
      if (boltBtn && boltBtn.asElement()) {
        await boltBtn.click();
        await new Promise((r) => setTimeout(r, 3000));
        await page.screenshot({
          path: path.join(OUTPUT_DIR, "06_registro_incidencia_docente.png"),
        });
        console.log("Captured 06");

        // --- 7. Protocol Activated from Incident ---
        console.log("Registering Incident...");
        await page.waitForSelector("#qr-search", {
          visible: true,
          timeout: 5000,
        });
        await page.type("#qr-search", "Maria Lopez");
        await new Promise((r) => setTimeout(r, 2000));

        const firstResult = await page.$("div.absolute button");
        if (firstResult) await firstResult.click();

        await new Promise((r) => setTimeout(r, 1000));
        await page.type("#qr-desc", "Convulsión en salón.");

        // Set health type
        await page.evaluate(() => {
          const select = document.querySelector("#qr-type");
          if (select) {
            // Try matching keywords in options
            const ops = Array.from(select.options);
            const target = ops.find(
              (o) => o.text.includes("Salud") || o.text.includes("Médica")
            );
            if (target) {
              select.value = target.value;
              select.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        });

        await new Promise((r) => setTimeout(r, 1000));
        await page.click("#qr-save");

        console.log("Waiting for success/protocol...");
        await new Promise((r) => setTimeout(r, 4000));
        await page.screenshot({
          path: path.join(
            OUTPUT_DIR,
            "07_protocolo_activado_desde_incidencia.png"
          ),
        });
        console.log("Captured 07");

        // Close modal
        await page.mouse.click(10, 10);
        await new Promise((r) => setTimeout(r, 1500));
      } else {
        console.log("Bolt button (Quick Register) not found");
      }
    } catch (e) {
      console.error("Failed 06/07:", e);
    }

    // --- 8. Dashboard Direccion ---
    console.log("Switching to Directivo...");
    try {
      await page.evaluate(() => {
        const selects = Array.from(document.querySelectorAll("select"));
        const roleSelect = selects.find((s) =>
          s.querySelector('option[value="directivo"]')
        );
        if (roleSelect) {
          roleSelect.value = "directivo";
          roleSelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      await new Promise((r) => setTimeout(r, 4000));

      // Go to Dashboard explicitly if needed
      const dbLink = await page.$("#nav-dashboard");
      if (dbLink) await dbLink.click();
      await new Promise((r) => setTimeout(r, 2000));

      await page.screenshot({
        path: path.join(OUTPUT_DIR, "08_dashboard_direccion_evento.png"),
      });
      console.log("Captured 08");
    } catch (e) {
      console.error("Failed 08:", e);
    }

    // --- 9. Trazabilidad (Bitacora) ---
    console.log("Navigating to Bitacora...");
    try {
      const bitacoraBtn = await page.evaluateHandle(() => {
        const spans = Array.from(document.querySelectorAll("span"));
        const label = spans.find(
          (s) => s.textContent && s.textContent.includes("Bitácora")
        );
        return label ? label.closest("button") : null;
      });
      if (bitacoraBtn && bitacoraBtn.asElement()) {
        await bitacoraBtn.click();
        await new Promise((r) => setTimeout(r, 4000));
        await page.screenshot({
          path: path.join(OUTPUT_DIR, "09_registro_trazabilidad.png"),
        });
        console.log("Captured 09");
      }
    } catch (e) {
      console.error("Failed 09:", e);
    }
  } catch (e) {
    console.error("Error in automation:", e);
  } finally {
    await browser.close();
    process.exit(0);
  }
})();

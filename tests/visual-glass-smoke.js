import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

const BASE_URL = process.env.SASE_BASE_URL || "http://localhost:4173";
const outputDir = path.resolve("qa_artifacts", "visual-audit");

const routes = [
  {
    name: "login",
    url: `${BASE_URL}/`,
    readySelector: "form, main, button",
  },
  {
    name: "registro",
    url: `${BASE_URL}/?registro=true`,
    readySelector: "form, main, textarea, input, button",
  },
  {
    name: "laboratorio-ui",
    url: `${BASE_URL}/?lab=ui`,
    readySelector: "form, header",
  },
];

async function ensureOutputDir() {
  await fs.mkdir(outputDir, { recursive: true });
}

async function capturePage(page, route) {
  await page.goto(route.url, { waitUntil: "networkidle0", timeout: 120000 });

  if (route.name === "login") {
    const skipButton = await page.$("button");
    if (skipButton) {
      const buttonText = await page.evaluate((el) => el.textContent || "", skipButton);
      if (buttonText.toUpperCase().includes("SALTAR")) {
        await skipButton.click();
        await page.waitForNetworkIdle({ idleTime: 800, timeout: 15000 }).catch(() => null);
      }
    }
  }

  let selectorMatched = true;
  try {
    await page.waitForSelector(route.readySelector, { timeout: 15000 });
  } catch {
    selectorMatched = false;
  }
  await page.screenshot({
    path: path.join(outputDir, `${route.name}.png`),
    fullPage: true,
  });

  const diagnostics = await page.evaluate((matched) => {
    const bodyText = document.body.innerText || "";
    const hasWhitePanels = Array.from(document.querySelectorAll("*")).some((el) => {
      const className = typeof el.className === "string" ? el.className : "";
      return /bg-white(?!\/5|\/8|\/10|\/12|\/15|\/20)/.test(className);
    });

    return {
      title: document.title,
      hasWhitePanels,
      selectorMatched: matched,
      bodySample: bodyText.slice(0, 240),
    };
  }, selectorMatched);

  return {
    name: route.name,
    url: route.url,
    screenshot: path.join("qa_artifacts", "visual-audit", `${route.name}.png`),
    ...diagnostics,
  };
}

async function main() {
  await ensureOutputDir();

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  page.on("pageerror", (err) => console.error("PAGE ERROR:", err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error("BROWSER CONSOLE:", msg.text());
    }
  });

  const results = [];

  try {
    for (const route of routes) {
      console.log(`Capturando ${route.name}...`);
      const result = await capturePage(page, route);
      results.push(result);
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(
    path.join(outputDir, "summary.json"),
    JSON.stringify(results, null, 2),
    "utf8",
  );

  console.log(`Capturas guardadas en ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

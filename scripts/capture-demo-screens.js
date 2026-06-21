import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUT_DIR = path.join(__dirname, "..", "docs", "video-assets", "sase310-demo");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  console.log("Iniciando Puppeteer...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  console.log("Capturando: 01_inicio_sase310.png");
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto("http://localhost:3101/?skipIntro=1", { waitUntil: "networkidle2", timeout: 10000 }).catch(() => {});
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  await page.screenshot({ path: path.join(OUT_DIR, "01_inicio_sase310.png") });
  console.log("-> Guardado: 01_inicio_sase310.png");

  console.log("Capturando: 15_responsivo_movil.png");
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.reload({ waitUntil: "networkidle2" }).catch(() => {});
  await new Promise(resolve => setTimeout(resolve, 3000));
  await page.screenshot({ path: path.join(OUT_DIR, "15_responsivo_movil.png") });
  console.log("-> Guardado: 15_responsivo_movil.png");

  console.log("Cerrando navegador...");
  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});

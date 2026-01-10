import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const HTML_FILE =
  "C:\\Users\\cyber\\Desktop\\Capturas_Video_SASE\\Guion_Consolidado_Protocolos_SASE.html";
const PDF_FILE =
  "C:\\Users\\cyber\\Desktop\\Capturas_Video_SASE\\SASE-310_Manual_Operativo_Protocolos.pdf";

(async () => {
  if (!fs.existsSync(HTML_FILE)) {
    console.error("HTML file not found:", HTML_FILE);
    process.exit(1);
  }

  console.log("Generating PDF from HTML...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  // Load local HTML
  const content = fs.readFileSync(HTML_FILE, "utf8");
  await page.setContent(content, { waitUntil: "networkidle0" });

  await page.pdf({
    path: PDF_FILE,
    format: "A4",
    printBackground: true,
    margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
  });

  console.log("PDF Generated:", PDF_FILE);
  await browser.close();
})();

import crypto from "crypto";
import puppeteer from "puppeteer";

const diagnosticoUrl = process.env.DIAGNOSTICO_APP_URL || "https://diagnostico-colectivo.vercel.app/";
const sharedSecret = process.env.SASE_SHARED_SECRET;
const teacherId = process.env.SMOKE_USER_ID || "081766d8-151b-4209-a942-6345c74c2178";
const teacherEmail = process.env.SMOKE_EMAIL || "docente.diagnostico.smoke@sase.mx";
const teacherName = process.env.SMOKE_NAME || "Docente Diagnóstico Smoke";

if (!sharedSecret) {
  throw new Error("Falta SASE_SHARED_SECRET para el browser smoke de Diagnóstico.");
}

const now = Math.floor(Date.now() / 1000);
const payload = {
  sub: teacherId,
  uid: teacherId,
  email: teacherEmail,
  role: "teacher",
  name: teacherName,
  module: "diagnostico",
  institutionId: "09DES4310M",
  groupId: null,
  iat: now,
  exp: now + 300,
};

const tokenPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
const signature = crypto.createHmac("sha256", sharedSecret).update(tokenPayload).digest("base64url");
const launchUrl = new URL(diagnosticoUrl);
launchUrl.searchParams.set("sase_token", `${tokenPayload}.${signature}`);

const browser = await puppeteer.launch({ headless: "new" });

try {
  const page = await browser.newPage();
  await page.goto(launchUrl.toString(), { waitUntil: "networkidle2", timeout: 60000 });
  await page.waitForFunction(() => Boolean(sessionStorage.getItem("sirde_sase_session")), { timeout: 20000 });

  const result = await page.evaluate(() => {
    const authWall = document.getElementById("auth-wall");
    const docente = document.getElementById("docente");
    const session = JSON.parse(sessionStorage.getItem("sirde_sase_session") || "null");

    return {
      authWallHidden: Boolean(authWall) && getComputedStyle(authWall).display === "none",
      docenteValue: docente ? docente.value : null,
      docenteDisabled: docente ? docente.disabled : null,
      session,
      url: window.location.href,
    };
  });

  console.log(JSON.stringify(result, null, 2));

  if (!result.authWallHidden) {
    throw new Error("El muro de autenticación sigue visible tras consumir sase_token.");
  }

  if (!result.session || result.session.provider !== "sase") {
    throw new Error("No se guardó una sesión SASE válida en sessionStorage.");
  }

  console.log("Browser Smoke OK: Diagnóstico consumió el sase_token y ocultó el auth wall.");
} finally {
  await browser.close();
}

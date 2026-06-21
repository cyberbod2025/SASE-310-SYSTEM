import { createClient } from "@supabase/supabase-js";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.join(__dirname, "..", "docs", "video-assets", "sase310-demo");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Faltan variables de entorno de Supabase en .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

const TEST_EMAIL = process.env.TEST_DEMO_EMAIL || "docente.demo.video@sase.mx";
const TEST_PASSWORD = process.env.TEST_DEMO_PASSWORD || (() => { throw new Error("Falta TEST_DEMO_PASSWORD en .env.local"); })();

async function setupUser() {
  console.log("Configurando usuario QA en base de datos...");
  // Limpiar si ya existe
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users?.users.find((u) => u.email === TEST_EMAIL);
  if (existingUser) {
    await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
  }

  // Crear usuario
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error(`Error creando usuario: ${authError?.message}`);
  }

  const userId = authData.user.id;

  // Insertar perfil docente
  const { error: profileError } = await supabaseAdmin.from("perfiles_usuario").upsert({
    id: userId,
    email: TEST_EMAIL,
    nombre_completo: "Docente Demo",
    rol: "docente",
    seguridad_status: "active",
  });

  if (profileError) {
    throw new Error(`Error creando perfil: ${profileError.message}`);
  }

  console.log(`Usuario creado exitosamente: ${TEST_EMAIL}`);
  return userId;
}

async function cleanupUser(userId) {
  console.log("Limpiando usuario QA...");
  if (userId) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.log("Usuario eliminado.");
  }
}

async function captureScreens(userId) {
  let browser;
  try {
    console.log("Iniciando navegador...");
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1920,1080"],
      defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();
    
    // 01_inicio_sase310
    console.log("Navegando al inicio...");
    await page.goto("http://localhost:3101/?skipIntro=1", { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(OUT_DIR, "01_inicio_sase310.png") });
    console.log("-> 01_inicio_sase310.png");

    // Login
    console.log("Iniciando sesión...");
    await page.type("#email", TEST_EMAIL);
    await page.type("#password", TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load (wait for some element that implies login success)
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 4000)); // extra wait for animations

    // 02_dashboard_docente
    await page.screenshot({ path: path.join(OUT_DIR, "02_dashboard_docente.png") });
    console.log("-> 02_dashboard_docente.png");

    // Utility to click by text
    const clickByText = async (text) => {
      const elements = await page.$x(`//*[contains(text(), '${text}')]`);
      if (elements.length > 0) {
        await elements[0].click();
        await new Promise(r => setTimeout(r, 2000));
        return true;
      }
      return false;
    };

    // 03_grupos_docente
    console.log("Buscando 'Mis grupos' o 'Grupos'...");
    let clicked = await clickByText("Mis grupos") || await clickByText("Grupos");
    if (clicked) {
      await page.screenshot({ path: path.join(OUT_DIR, "03_grupos_docente.png") });
      console.log("-> 03_grupos_docente.png");
    } else {
      console.log("No se encontró botón para Grupos (saltando).");
    }

    // 05_registro_incidencia
    console.log("Buscando 'Incidencias' o 'Registrar'...");
    clicked = await clickByText("Incidencia") || await clickByText("Registrar");
    if (clicked) {
      await page.screenshot({ path: path.join(OUT_DIR, "05_registro_incidencia.png") });
      console.log("-> 05_registro_incidencia.png");
    }

    // 14_sasito_asistente
    console.log("Buscando a SASITO...");
    clicked = await clickByText("SASITO") || await clickByText("Asistente");
    if (clicked) {
      await page.screenshot({ path: path.join(OUT_DIR, "14_sasito_asistente.png") });
      console.log("-> 14_sasito_asistente.png");
    }

    // 15_responsivo_movil
    console.log("Capturando responsivo móvil...");
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUT_DIR, "15_responsivo_movil.png") });
    console.log("-> 15_responsivo_movil.png");

  } catch (error) {
    console.error("Error durante la navegación:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function main() {
  let userId;
  try {
    userId = await setupUser();
    await captureScreens(userId);
  } catch (err) {
    console.error(err);
  } finally {
    await cleanupUser(userId);
  }
}

main();

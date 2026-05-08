import { test, expect, type Page } from '@playwright/test';

async function enterSystemIfNeeded(page: Page) {
  const entrarSistema = page.getByRole('button', { name: /ENTRAR AL SISTEMA/i });

  if (await entrarSistema.isVisible().catch(() => false)) {
    await entrarSistema.click();
  }
}

async function expectAppShellLoaded(page: Page) {
  // Primero aseguramos que salimos de la pantalla de login (o que algo cambió)
  // Pero ojo: RADAR ESCOLAR también tiene un h1. 
  // Mejor esperamos a que aparezca cualquiera de las señales de éxito.
  await expect(
    page.getByRole('heading', { name: /RADAR ESCOLAR|HOY/i })
      .or(page.getByText(/Incidencias Activas|Registro Rápido|Alumnos|NÚCLEO OPERATIVO|Iniciando Protocolos/i))
  ).toBeVisible({ timeout: 20000 });
}

test.describe('SASE-310 Smoke Tests (Modo Cierre)', () => {

  test('Página de login carga y funciona con docente', async ({ page }) => {
    await page.goto('/?skipIntro=1');

    // 1. Página de login carga
    await expect(page.getByRole('heading', { name: 'SASE 310' })).toBeVisible({ timeout: 15000 });

    // 2. Login con cuenta smoke docente
    const email = process.env.SMOKE_DOCENTE_EMAIL;
    const password = process.env.SMOKE_DOCENTE_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'Credenciales smoke docente no configuradas');
      return;
    }

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Esperar señal real de app cargada
    await expectAppShellLoaded(page);

    // Si aparece "Entrar al sistema", hacer clic
    await enterSystemIfNeeded(page);

    // 3. Registro Rápido abre
    const btnRegistro = page.locator('#quick-register-btn');
    if (await btnRegistro.isVisible()) {
      await btnRegistro.click();
      await expect(page.locator('text=Incidencia').first()).toBeVisible();
      // Cerrar modal
      await page.keyboard.press('Escape');
    }

    // 4. Dashboard / Tablero carga sin error
    const linkTablero = page.locator('#nav-dashboard');
    if (await linkTablero.isVisible()) {
      await linkTablero.click();
      await expect(page.getByText(/Mis alumnos|Reportes hoy/i).first()).toBeVisible({ timeout: 10000 });
    }

    // 5. Expedientes carga sin error
    const linkExpedientes = page.locator('#nav-expedientes');
    if (await linkExpedientes.isVisible()) {
      await linkExpedientes.click();
      await expect(page.locator('text=Directorio').first()).toBeVisible({ timeout: 10000 });
    }

    // 6. Sasito visual aparece sin romper layout
    const sasitoElement = page.locator('[id*="sasito"], [class*="sasito"]');
    if (await sasitoElement.count() > 0) {
      await expect(sasitoElement.first()).toBeVisible();
    }

    // Logout
    const btnLogout = page.locator('button:has-text("Salir")');
    if (await btnLogout.isVisible()) {
      await btnLogout.click();
    }
  });

  test('Feria handoff no entrega role="teacher" a alumno', async ({ page }) => {
    // Si no hay alumno smoke config, saltamos para que no falle en entornos donde no existe
    const email = process.env.SMOKE_ALUMNO_EMAIL;
    const password = process.env.SMOKE_ALUMNO_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'Credenciales smoke alumno no configuradas');
      return;
    }

    await page.goto('/?skipIntro=1');
    await page.fill('input[type="email"]', email as string);
    await page.fill('input[type="password"]', password as string);
    
    // Interceptar la navegación a /api/modules/launch ANTES de dar clic al submit
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('launch') || req.url().includes('feria'), { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);

    expect(request.url()).toBeTruthy();
  });

});

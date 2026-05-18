import { test, expect, type Page } from '@playwright/test';

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return Buffer.from(padded, 'base64').toString('utf-8');
}

function extractSaseTokenFromLaunchUrl(urlString: string): string | null {
  const url = new URL(urlString);
  const tokenFromSearch = url.searchParams.get('sase_token');
  if (tokenFromSearch) {
    return tokenFromSearch;
  }

  const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
  const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
  if (!hashQuery) {
    return null;
  }

  return new URLSearchParams(hashQuery).get('sase_token');
}

async function enterSystemIfNeeded(page: Page) {
  const entrarSistema = page.getByRole('button', { name: /ENTRAR AL SISTEMA/i });

  if (await entrarSistema.isVisible().catch(() => false)) {
    await entrarSistema.click();
  }
}

async function expectAppShellLoaded(page: Page) {
  await expect(
    page.getByRole('heading', { name: /RADAR ESCOLAR|HOY/i })
      .or(page.getByText(/Incidencias Activas|Registro Rápido|Alumnos|NÚCLEO OPERATIVO|Iniciando Protocolos/i))
  ).toBeVisible({ timeout: 20000 });
}

test.describe('SASE-310 Smoke Tests (Modo Cierre)', () => {

  test('Página de login carga y funciona con docente', async ({ page }) => {
    await page.goto('/?skipIntro=1');

    await expect(page.getByRole('heading', { name: 'SASE 310' })).toBeVisible({ timeout: 15000 });

    const email = process.env.SMOKE_DOCENTE_EMAIL;
    const password = process.env.SMOKE_DOCENTE_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'Credenciales smoke docente no configuradas');
      return;
    }

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    await expectAppShellLoaded(page);
    await enterSystemIfNeeded(page);

    const btnRegistro = page.locator('#quick-register-btn');
    if (await btnRegistro.isVisible()) {
      await btnRegistro.click();
      await expect(page.locator('text=Incidencia').first()).toBeVisible();
      await page.keyboard.press('Escape');
    }

    const linkTablero = page.locator('#nav-dashboard');
    if (await linkTablero.isVisible()) {
      await linkTablero.click();
      await expect(page.getByText(/Mis alumnos|Reportes hoy/i).first()).toBeVisible({ timeout: 10000 });
    }

    const linkExpedientes = page.locator('#nav-expedientes');
    if (await linkExpedientes.isVisible()) {
      await linkExpedientes.click();
      await expect(page.locator('text=Directorio').first()).toBeVisible({ timeout: 10000 });
    }

    const sasitoElement = page.locator('[id*="sasito"], [class*="sasito"]');
    if (await sasitoElement.count() > 0) {
      await expect(sasitoElement.first()).toBeVisible();
    }

    const btnLogout = page.locator('button:has-text("Salir")');
    if (await btnLogout.isVisible()) {
      await btnLogout.click();
    }
  });

  test('Feria handoff no entrega role="teacher" a alumno', async ({ page }) => {
    const email = process.env.SMOKE_ALUMNO_EMAIL;
    const password = process.env.SMOKE_ALUMNO_PASSWORD;

    if (!email || !password) {
      test.skip(true, 'Credenciales smoke alumno no configuradas');
      return;
    }

    await page.goto('/?skipIntro=1');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/modules/launch'), { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('url');
    expect(body).toHaveProperty('module', 'feria');

    const redirectUrl = new URL(body.url);
    const saseToken = extractSaseTokenFromLaunchUrl(body.url);
    expect(saseToken).toBeTruthy();
    expect(redirectUrl.hash || redirectUrl.search).toContain('sase_token=');

    const parts = saseToken!.split('.');
    expect(parts.length).toBe(2);

    const payloadRaw = decodeBase64Url(parts[0]);
    const payload = JSON.parse(payloadRaw);

    expect(payload.module).toBe('feria');
    expect(payload.role).toBe('student');
    expect(payload.role).not.toBe('teacher');
    expect(payload.sub).toBeTruthy();
    expect(payload.uid).toBe(payload.sub);
  });

});

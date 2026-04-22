import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://127.0.0.1:3100
        await page.goto("http://127.0.0.1:3100")
        
        # -> Probar una ruta alternativa: navegar a la página de login explícita (/login) para forzar la carga del UI y mostrar elementos interactivos.
        await page.goto("http://127.0.0.1:3100/login")
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        current_url = await frame.evaluate("() => window.location.href")
        assert '/login' in current_url, "The page should have navigated to the login page after forcing the login route"
        assert await frame.locator("xpath=//*[contains(., 'Iniciar sesión')]").nth(0).is_visible(), "The login form should be visible after opening the login route"
        assert await frame.locator("xpath=//*[contains(., 'docente.testsprite@sase.mx')]").nth(0).is_visible(), "The dashboard should show the docente.testsprite@sase.mx account after login"
        assert not await frame.locator("xpath=//*[contains(., 'Error fatal')]").nth(0).is_visible(), "The dashboard should load without a fatal error after login"
        assert await frame.locator("xpath=//*[contains(., 'Reporte Rápido')]").nth(0).is_visible(), "The dashboard should display Reporte Rápido within the docente dashboard"
        assert await frame.locator("xpath=//*[contains(., 'Glass dark')]").nth(0).is_visible(), "The main surfaces should maintain the Glass dark visual language and not use solid white panels outside the visual system"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    
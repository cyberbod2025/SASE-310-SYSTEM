from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the app (using port 3000 as defined in vite.config.ts)
    try:
        page.goto("http://localhost:3000", timeout=30000)
        # Wait for root, but don't fail if it's empty (React might fail to render if env vars missing)
        # We just want to ensure we get a screenshot of the state
        page.wait_for_selector("#root", state="attached", timeout=10000)
    except Exception as e:
        print(f"Navigation/Selector error: {e}")

    # Wait a bit for JS to execute and render something
    page.wait_for_timeout(5000)

    page.screenshot(path="verification/reportes_verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)

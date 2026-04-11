import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    console.log('Navigating to http://localhost:3100...');
    await page.goto('http://localhost:3100', { waitUntil: 'networkidle' });
    
    // Check for SasinLoginOrb or SasitoCopilot
    const hasOrb = await page.evaluate(() => {
      return !!document.querySelector('.SasinLoginOrb') || !!document.querySelector('.SasitoCopilot');
    });

    console.log('Orb/Sasito present:', hasOrb);
    
    await page.screenshot({ path: 'testsprite_tests/render_check.png' });
    console.log('Screenshot saved to testsprite_tests/render_check.png');
    
  } catch (e) {
    console.error('Error during test:', e);
  } finally {
    await browser.close();
  }
})();

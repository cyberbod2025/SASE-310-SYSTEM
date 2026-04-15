import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  try {
    console.log('Navigating to http://localhost:3100...');
    await page.goto('http://127.0.0.1:3100', { waitUntil: 'networkidle0' });
    const firstButton = await page.$('button');
    if (firstButton) {
      const text = await page.evaluate((el) => el.textContent || '', firstButton);
      if (text.toUpperCase().includes('SALTAR')) {
        await firstButton.click();
        await page.waitForNetworkIdle({ idleTime: 800, timeout: 15000 }).catch(() => null);
      }
    }
    
    // Check for SasinLoginOrb or SasitoCopilot
    const hasOrb = await page.evaluate(() => {
      return !!document.querySelector('.SasinLoginOrb') || !!document.querySelector('.SasitoCopilot');
    });

    console.log('Orb/Sasito present:', hasOrb);
    
    await page.screenshot({ path: 'qa_artifacts/render_check.png' });
    console.log('Screenshot saved to qa_artifacts/render_check.png');
    
  } catch (e) {
    console.error('Error during test:', e);
  } finally {
    await browser.close();
  }
})();

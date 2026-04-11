import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  try {
    console.log('Navigating to http://localhost:3100...');
    await page.goto('http://localhost:3100', { waitUntil: 'networkidle0' });
    
    const skipButton = await page.$('button');
    if (skipButton) {
      const text = await page.evaluate(el => el.textContent, skipButton);
      if (text.includes('Saltar')) {
        await skipButton.click();
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.log('Final check of the UI state...');
    
  } catch (e) {
    console.error('Error during test:', e);
  } finally {
    await browser.close();
  }
})();

import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    defaultViewport: { width: 375, height: 812 }
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  const heroAction = await page.$('.hero-action-area');
  if (heroAction) {
    await heroAction.screenshot({ path: 'screenshots/hero_action_mobile_375.png' });
  }
  await browser.close();
  console.log('Mobile screenshot saved: hero_action_mobile_375.png');
})();

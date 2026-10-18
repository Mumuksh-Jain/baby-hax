import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  const workshop = await page.$('#workshop');
  if (workshop) {
    await workshop.screenshot({ path: 'screenshots/final_workshop_doorways_full.png' });
    console.log('Saved screenshots/final_workshop_doorways_full.png');
  }
  const credits = await page.$('.pip-credits-footer');
  if (credits) {
    await credits.screenshot({ path: 'screenshots/final_credits_footer.png' });
    console.log('Saved screenshots/final_credits_footer.png');
  }
  await browser.close();
})();

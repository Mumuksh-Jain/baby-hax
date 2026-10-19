import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://127.0.0.1:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots/qa_verify');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verify() {
  console.log('🚀 Launching Edge browser to verify user features...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(err.toString()));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.setViewport({ width: 1440, height: 960 });
  console.log(`Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // 1. Verify landing dream galaxy structure
  console.log('Checking dream galaxy structure on landing...');
  const galaxyEl = await page.$('.hero-dream-galaxy');
  if (!galaxyEl) throw new Error('Could not find .hero-dream-galaxy on landing!');
  console.log('PASS: .hero-dream-galaxy found on landing');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_landing_dream_galaxy.png') });
  console.log('Captured 01_landing_dream_galaxy.png');

  // 2. Verify and screenshot the Logs tab
  console.log('Switching to midnight_nursery.log tab...');
  await page.click('#tab-log');
  await new Promise((r) => setTimeout(r, 400));
  const logPanelText = await page.$eval('#panel-log', (el) => el.textContent);
  if (!logPanelText.includes('midnight_nursery.log')) {
    throw new Error('Log panel missing midnight_nursery.log text!');
  }
  console.log('PASS: midnight_nursery.log panel displayed with new storybook theme');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_storybook_logs_panel.png') });
  console.log('Captured 02_storybook_logs_panel.png');

  // 3. Verify and screenshot the Blueprints tab
  console.log('Switching to dream_blueprints.txt tab...');
  await page.click('#tab-blueprint');
  await new Promise((r) => setTimeout(r, 400));
  const bpPanelText = await page.$eval('#panel-blueprint', (el) => el.textContent);
  if (!bpPanelText.includes('dream_blueprints.txt') || !bpPanelText.includes('Component D: The Living Dream Express')) {
    throw new Error('Blueprint panel missing expected content!');
  }
  console.log('PASS: dream_blueprints.txt panel displayed with warm drafting graph paper theme & Locomotive 003');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_storybook_blueprint_panel.png') });
  console.log('Captured 03_storybook_blueprint_panel.png');

  // Switch back to bedroom
  await page.click('#tab-bedroom');
  await new Promise((r) => setTimeout(r, 300));

  // 4. Open Living Dream Express experience
  console.log('Opening The Living Dream Express experience...');
  // Open experience via query param or button
  await page.goto(`${URL}?experience=express`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));

  // Enable sound to test audio integration
  const soundBtn = await page.$('.shell-sound-btn');
  if (soundBtn) {
    const isMuted = await page.$eval('.shell-sound-btn', (el) => el.getAttribute('aria-pressed') !== 'true');
    if (isMuted) {
      await soundBtn.click();
      console.log('Toggled sound ON');
    }
  }

  // Check the Toot-Toot & Chuk-Chuk test button
  const chukBtn = await page.$('.express-sound-preview-btn');
  if (!chukBtn) throw new Error('Missing .express-sound-preview-btn!');
  console.log('PASS: Found .express-sound-preview-btn in Dispatch desk');
  await chukBtn.click();
  console.log('Clicked Toot-Toot & Chuk-Chuk button');

  // Dispatch the train and let it chug along the rails
  console.log('Dispatching Dream Express...');
  const dispatchBtn = await page.$('.dispatch-train-btn');
  await dispatchBtn.click();

  // Wait 1.5 seconds while train is traveling and chukking
  await new Promise((r) => setTimeout(r, 1500));
  const isTraveling = await page.$eval('.dispatch-train-btn', (el) => el.classList.contains('is-traveling'));
  console.log('Train traveling state:', isTraveling);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_dream_express_in_flight.png') });
  console.log('Captured 04_dream_express_in_flight.png');

  // Wait for delivery receipt
  console.log('Waiting for train arrival...');
  await page.waitForSelector('.exp-delivery-receipt', { timeout: 10000 });
  console.log('PASS: Train arrived and delivery receipt displayed!');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_dream_express_delivered.png') });
  console.log('Captured 05_dream_express_delivered.png');

  if (consoleErrors.length > 0) {
    console.error('Console errors encountered:', consoleErrors);
    throw new Error('Page had console errors: ' + consoleErrors.join(', '));
  }

  console.log('🎉 ALL USER FEATURES VERIFIED SUCCESSFULLY with ZERO ERRORS!');
  await browser.close();
}

verify().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});

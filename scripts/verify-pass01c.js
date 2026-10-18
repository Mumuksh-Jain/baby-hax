import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPass01CVerification() {
  console.log('🚀 Launching Edge browser for PASS 01C Star Orchestra QA testing...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
  });

  console.log(`📡 Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // 1. Initial State & Star Discovery
  console.log('⭐ 1. Verifying Star Discovery and Initial Idle State...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.waitForSelector('.pip-star-btn');

  const starCount = await page.$$eval('.pip-star-btn', (els) => els.length);
  console.log(`Found ${starCount} interactive stars.`);
  if (starCount !== 3) {
    throw new Error(`Expected 3 interactive stars, found ${starCount}`);
  }

  // Check discovery hint/invitation on Star 1
  const star1Title = await page.$eval('.star-1', (el) => el.getAttribute('title'));
  console.log('Star 1 Title:', star1Title);

  // Enable sound for the musical test
  console.log('🔊 Enabling sound effects for orchestra test...');
  await page.click('.sound-toggle-btn');
  const soundEnabled = await page.$eval('.sound-toggle-btn', (el) => el.getAttribute('aria-pressed'));
  if (soundEnabled !== 'true') throw new Error('Sound toggle failed to activate');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c-01-stars-idle.png'), fullPage: true });

  // 2. Collect Star 1
  console.log('⭐ 2. Collecting Star 1 (Gold, top-left)...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 400));

  // Check ghost slot in star 1 home spot
  const hasGhost1 = await page.$eval('.star-1-wrap .star-ghost-slot', (el) => !!el);
  console.log('Ghost slot rendered at Star 1 home spot:', hasGhost1);
  if (!hasGhost1) throw new Error('Ghost slot missing for star 1');

  // Check status sign text
  const status1 = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  console.log('Status sign after Star 1:', status1);
  if (!status1.includes('1 OF 3')) throw new Error(`Unexpected status text: ${status1}`);

  // Test duplicate click constraint on Star 1 (ghost slot click shouldn't trigger duplicate)
  console.log('Checking duplicate click prevention on Star 1...');
  const star1InDom = await page.$('.star-1');
  if (star1InDom) {
    throw new Error('Star 1 button should be replaced by ghost slot once collected');
  }

  // 3. Collect Star 2
  console.log('⭐ 3. Collecting Star 2 (Blush, bottom-right)...');
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 400));

  const hasGhost2 = await page.$eval('.star-2-wrap .star-ghost-slot', (el) => !!el);
  console.log('Ghost slot rendered at Star 2 home spot:', hasGhost2);
  const status2 = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  console.log('Status sign after Star 2:', status2);
  if (!status2.includes('2 OF 3')) throw new Error(`Unexpected status text: ${status2}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c-02-stars-collecting-2.png'), fullPage: true });

  // 4. Collect Star 3 -> Orchestral Performance begins!
  console.log('⭐ 4. Collecting Star 3 (Lavender, bottom-left) -> Triggering Orchestra!');
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 500));

  // Verify orchestra mode is active
  const stageClass = await page.$eval('.pip-stage-container', (el) => el.className);
  console.log('Stage classes:', stageClass);
  if (!stageClass.includes('orchestra-performing')) {
    throw new Error(`Expected orchestra-performing class, got: ${stageClass}`);
  }

  const statusPerforming = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  console.log('Status sign during performance:', statusPerforming);
  if (!statusPerforming.includes('PLAYING TWINKLE TWINKLE')) {
    throw new Error(`Expected Twinkle Twinkle in status, got: ${statusPerforming}`);
  }

  // Check that all 3 orbiting carriers are rendered
  const orbitingCarriers = await page.$$eval('.orbiting-star-carrier', (els) => els.length);
  console.log(`Orbiting star carriers rendered: ${orbitingCarriers}`);
  if (orbitingCarriers !== 3) {
    throw new Error(`Expected 3 orbiting star carriers, found ${orbitingCarriers}`);
  }

  // Check caption text
  const caption = await page.$eval('.caption-text', (el) => el.textContent.trim());
  console.log('Caption during orchestra:', caption);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c-03-orchestra-performing.png'), fullPage: true });

  // 5. Test Mute Toggle Mid-Performance
  console.log('🔇 5. Testing Mute Switch Toggle mid-performance (sound off)...');
  await page.click('.sound-toggle-btn');
  const soundMuted = await page.$eval('.sound-toggle-btn', (el) => el.getAttribute('aria-pressed'));
  console.log('Sound state during performance:', soundMuted);
  if (soundMuted !== 'false') throw new Error('Sound failed to mute mid-performance');

  // Toggle sound back on so we hear the remainder
  await page.click('.sound-toggle-btn');
  console.log('Re-enabled sound.');

  // 6. Fast-forward through Twinkle sequence to Phase E (Pip reaction)
  console.log('⏳ 6. Waiting for Twinkle Twinkle melody to finish and trigger Pip reaction (~10s)...');
  await page.waitForFunction(
    () => {
      const stage = document.querySelector('.pip-stage-container');
      return stage && stage.classList.contains('orchestra-reacting');
    },
    { timeout: 15000 }
  );

  console.log('✨ Orchestra finished! Pip is reacting...');
  const dialogueQuote1 = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  console.log('Pip Dialogue Part 1:', dialogueQuote1);
  if (!dialogueQuote1.includes('turn my stars into a band')) {
    throw new Error(`Unexpected Pip dialogue: ${dialogueQuote1}`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c-04-pip-reaction-part1.png'), fullPage: true });

  // Wait for Part 2 dialogue (with uploaded faaahhh sigh)
  console.log('⏳ Waiting for Pip Dialogue Part 2 (*faaahhh* sigh)...');
  await page.waitForFunction(
    () => {
      const quote = document.querySelector('.dialogue-quote');
      return quote && quote.textContent.includes('getting out of hand');
    },
    { timeout: 6000 }
  );

  const dialogueQuote2 = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  console.log('Pip Dialogue Part 2:', dialogueQuote2);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c-05-pip-reaction-part2.png'), fullPage: true });

  // 7. Phase F — Stars return home and state becomes idle & replayable
  console.log('⏳ 7. Waiting for stars to return home and state to reset to idle...');
  await page.waitForFunction(
    () => {
      const stage = document.querySelector('.pip-stage-container');
      return stage && stage.classList.contains('orchestra-idle');
    },
    { timeout: 9000 }
  );

  console.log('🎉 Stars successfully returned home! State is idle again.');
  const resetStarCount = await page.$$eval('.pip-star-btn', (els) => els.length);
  console.log(`Interactive stars after reset: ${resetStarCount}`);
  if (resetStarCount !== 3) {
    throw new Error(`Expected all 3 stars to be restored, found ${resetStarCount}`);
  }

  // 8. Test Tab Switching Reset
  console.log('📑 8. Testing Tab Switching interruption & reset...');
  // Click Star 1
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 200));
  // Switch to Midnight Nursery Log tab
  await page.click('#tab-log');
  await new Promise((r) => setTimeout(r, 400));
  // Switch back to Bedroom
  await page.click('#tab-bedroom');
  await new Promise((r) => setTimeout(r, 400));
  const restoredStarsAfterTab = await page.$$eval('.pip-star-btn', (els) => els.length);
  console.log(`Stars after tab switch reset: ${restoredStarsAfterTab}`);
  if (restoredStarsAfterTab !== 3) {
    throw new Error(`Expected 3 stars after tab switch reset, found ${restoredStarsAfterTab}`);
  }

  // 9. Responsive Viewport Verifications (Zero horizontal overflow)
  console.log('📱 9. Verifying Responsive Viewports...');
  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-375', width: 375, height: 667 },
    { name: 'narrow-320', width: 320, height: 568 },
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await new Promise((r) => setTimeout(r, 300));

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    console.log(`Viewport ${vp.name} (${vp.width}px): horizontal overflow = ${overflow}`);
    if (overflow) {
      throw new Error(`Horizontal overflow detected at ${vp.name}!`);
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `pass01c-viewport-${vp.name}.png`),
      fullPage: false,
    });
  }

  // Check console errors
  console.log('Console errors during QA run:', consoleErrors);
  if (consoleErrors.length > 0) {
    throw new Error(`Console errors encountered: ${consoleErrors.join(', ')}`);
  }

  await browser.close();
  console.log('✅ ALL PASS 01C ACCEPTANCE CHECKS PASSED PERFECTLY!');
}

runPass01CVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

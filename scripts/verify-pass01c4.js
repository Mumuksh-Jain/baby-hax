import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPass01C4Verification() {
  console.log('🚀 Launching Edge browser for PASS 01C.4 Magical Star Theater QA Verification...\n');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
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

  console.log(`📡 1. Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Enable Sound
  console.log('\n🔊 2. Enabling sound switch...');
  await page.click('.sound-toggle-btn');
  const soundEnabled = await page.$eval('.sound-toggle-btn', (el) => el.getAttribute('aria-pressed'));
  if (soundEnabled !== 'true') throw new Error('Sound toggle failed to enable');
  console.log('✓ Sound switch is ON');

  // 2. Collect Star 1 and Star 2
  console.log('\n⭐ 3. Collecting Star 1 and Star 2 in bedroom...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 350));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 350));
  const status2 = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  console.log('Status after Star 2:', status2);
  if (!status2.includes('2/3')) throw new Error('Expected 2/3 collected');

  // 3. Collect Star 3 -> Launch Magical Star Theater
  console.log('\n🌌 4. Collecting Star 3 -> Triggering Magical Star Theater...');
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 600));

  // Check theater modal mounted and active
  const theaterActive = await page.$eval('.magical-star-theater', (el) => el.classList.contains('theater-active'));
  console.log('Theater active class present:', theaterActive);
  if (!theaterActive) throw new Error('MagicalStarTheater failed to activate!');

  const appDimmed = await page.$eval('.app-shell', (el) => el.classList.contains('theater-overlay-active'));
  console.log('App shell dimmed with theater-overlay-active:', appDimmed);
  if (!appDimmed) throw new Error('App shell background was not dimmed for theater!');

  // Check Scene 1 Dialogue
  const scene1Quote = await page.$eval('.theater-dialogue-quote', (el) => el.textContent.trim());
  console.log('Scene 1 Quote:', scene1Quote);
  if (!scene1Quote.includes('where did my bedroom go')) {
    throw new Error(`Expected Scene 1 quote, got: ${scene1Quote}`);
  }
  console.log('✓ Scene 1 (Entering the Sky) verified!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4-01-scene1-entering-sky.png'), fullPage: true });

  // 4. Test Star Tap interaction during Theater
  console.log('\n✨ 5. Testing interactive star tap during theater...');
  await new Promise((r) => setTimeout(r, 1800)); // into star-arrival
  const starNode1 = await page.$('.star-node-1');
  if (starNode1) {
    await starNode1.click();
    await new Promise((r) => setTimeout(r, 200));
    console.log('✓ Star 1 clicked inside theater (sparkle triggered)');
  }

  // 5. Verify Scene 3: The Magical Spiral & Constellation Hold
  console.log('\n🌀 6. Verifying Scene 3: The Magical Spiral...');
  let reachedSpiral = false;
  let spiralQuote = '';
  for (let i = 0; i < 8; i++) {
    await new Promise((r) => setTimeout(r, 600));
    const currentPhase = await page.$eval('.magical-star-theater', (el) => el.className);
    if (currentPhase.includes('phase-spiral')) {
      reachedSpiral = true;
      spiralQuote = await page.$eval('.theater-dialogue-quote', (el) => el.textContent.trim());
      break;
    }
  }
  console.log('Reached spiral phase:', reachedSpiral);
  console.log('Spiral quote:', spiralQuote);
  if (!reachedSpiral) throw new Error('Failed to reach spiral phase!');
  if (!spiralQuote.includes('invent a galaxy')) {
    throw new Error(`Expected galaxy quote, got: ${spiralQuote}`);
  }
  console.log('✓ Scene 3 (The Magical Spiral) verified!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4-02-scene3-spiral.png'), fullPage: true });

  // 6. Test Back to Bedroom button
  console.log('\n🚪 7. Testing "Back to Bedroom" safe exit during spiral hold...');
  await new Promise((r) => setTimeout(r, 2500)); // into spiral-hold
  await page.click('.back-bedroom-btn');
  await new Promise((r) => setTimeout(r, 1400)); // allow fade exit

  const theaterClosed = await page.evaluate(() => !document.querySelector('.magical-star-theater.theater-active'));
  console.log('Theater closed and unmounted after Back button click:', theaterClosed);
  if (!theaterClosed) throw new Error('Theater failed to close via Back to Bedroom button!');

  const bedroomRestored = await page.$eval('.sign-status-text', (el) => el.textContent.includes('WIDE AWAKE'));
  console.log('Bedroom restored to WIDE AWAKE:', bedroomRestored);
  if (!bedroomRestored) throw new Error('Bedroom was not restored cleanly!');
  console.log('✓ Back to Bedroom button safely closes theater and resets bedroom state!');

  // 7. Full Cinematic Performance to Natural Finale & Achievement Popup
  console.log('\n🎬 8. Replaying full performance to completion (~30s total)...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 250));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 250));
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 800));

  console.log('Waiting through Scene 1 -> 2 -> 3 -> 4 (Animated Song) -> 5 (Finale)...');
  let reachedFinale = false;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const theaterEl = await page.$('.magical-star-theater');
    if (theaterEl) {
      const className = await page.evaluate((el) => el.className, theaterEl);
      if (className.includes('phase-celebrating')) {
        reachedFinale = true;
        const finaleQuote = await page.$eval('.theater-dialogue-quote', (el) => el.textContent.trim());
        console.log(`✓ Finale reached! Quote: ${finaleQuote}`);
        if (!finaleQuote.includes('STUDIO')) {
          throw new Error(`Expected STUDIO in finale quote, got: ${finaleQuote}`);
        }
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4-03-scene5-finale.png'), fullPage: true });
        break;
      }
    }
  }

  if (!reachedFinale) {
    throw new Error('Theater failed to reach finale celebration within 40 seconds!');
  }

  // 8. Verify Scene 6 Return to Bedroom and Retro Achievement Popup
  console.log('\n🏆 9. Waiting for Scene 6 fade return & Achievement Popup...');
  let popupVisible = false;
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 600));
    const popup = await page.$('.retro-achievement-window');
    if (popup) {
      popupVisible = true;
      break;
    }
  }
  if (!popupVisible) throw new Error('Retro Achievement Popup failed to appear after theater completion!');
  console.log('✓ Retro Achievement Popup appeared!');

  const popupTitle = await page.$eval('.popup-title-text', (el) => el.textContent.trim());
  const achievementHeader = await page.$eval('.popup-achievement-title', (el) => el.textContent.trim());
  const achievementDesc = await page.$eval('.popup-achievement-desc', (el) => el.textContent.trim());
  const conductorBtnText = await page.$eval('.popup-conductor-btn', (el) => el.textContent.trim());

  console.log(`Popup Title: "${popupTitle}"`);
  console.log(`Achievement Header: "${achievementHeader}"`);
  console.log(`Achievement Description: "${achievementDesc}"`);
  console.log(`Action Button: "${conductorBtnText}"`);

  if (!popupTitle.includes("Pip's First Website.exe")) throw new Error(`Wrong title: ${popupTitle}`);
  if (!achievementHeader.includes('Achievement Unlocked!')) throw new Error(`Wrong header: ${achievementHeader}`);
  if (!achievementDesc.includes('very first concert')) throw new Error(`Wrong desc: ${achievementDesc}`);
  if (!conductorBtnText.includes('Certified Star Conductor ★')) throw new Error(`Wrong btn: ${conductorBtnText}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4-04-achievement-popup.png'), fullPage: true });

  // Dismiss popup by clicking "Certified Star Conductor ★"
  console.log('Clicking "Certified Star Conductor ★" button to dismiss popup...');
  await page.click('.popup-conductor-btn');
  await new Promise((r) => setTimeout(r, 600));

  const popupDismissed = await page.evaluate(() => !document.querySelector('.retro-achievement-window'));
  console.log('Popup dismissed cleanly:', popupDismissed);
  if (!popupDismissed) throw new Error('Popup failed to dismiss!');

  // 9. Verify Keyboard Escape handling
  console.log('\n⌨️ 10. Testing Keyboard Escape key handling...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 600));

  console.log('Pressing Escape key...');
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 1400));

  const closedOnEsc = await page.evaluate(() => !document.querySelector('.magical-star-theater.theater-active'));
  console.log('Theater closed on Escape key:', closedOnEsc);
  if (!closedOnEsc) throw new Error('Escape key failed to close theater!');
  console.log('✓ Escape key safely closes theater!');

  // 10. Check Mobile Viewport (375x667)
  console.log('\n📱 11. Checking Mobile Viewport (375x667)...');
  await page.setViewport({ width: 375, height: 667 });
  await new Promise((r) => setTimeout(r, 600));

  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 600));

  const mobileOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth <= window.innerWidth;
  });
  console.log('Mobile theater horizontal overflow check (fits inside viewport):', mobileOverflow);
  if (!mobileOverflow) throw new Error('Horizontal scroll detected on mobile theater!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4-05-mobile-theater.png'), fullPage: true });

  await page.click('.back-bedroom-btn');
  await new Promise((r) => setTimeout(r, 1200));

  // 11. Check Console Errors
  console.log('\n🚨 12. Checking Console Errors...');
  console.log('Console errors recorded:', consoleErrors);
  if (consoleErrors.length > 0) {
    throw new Error(`Console errors found: ${consoleErrors.join(', ')}`);
  }
  console.log('✓ 0 Console errors recorded!');

  await browser.close();
  console.log('\n🎉 ALL PASS 01C.4 VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
}

runPass01C4Verification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

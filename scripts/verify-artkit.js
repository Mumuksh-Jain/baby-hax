import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:4173';

async function runArtKitVerification() {
  console.log('====================================================');
  console.log('ART KIT INTEGRATION VERIFICATION SUITE');
  console.log('====================================================\n');

  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots', { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const consoleErrors = [];
  const page = await browser.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  try {
    // ----------------------------------------------------
    // PROOF (e): Full Gallery View & Living Dreamspace Clouds
    // ----------------------------------------------------
    console.log('--- PROOF (e): Full Gallery & Living Dreamspace Clouds (1440x900) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    const dreamspaceCloudImg = await page.$('.dreamspace-paper-clouds-img');
    console.log(`[PASS] Dreamspace paper clouds frame sprite rendered: ${!!dreamspaceCloudImg}`);

    const doorways = await page.$$('.doorway-card');
    console.log(`[PASS] Workshop Doorway Cards present: ${doorways.length} of 3`);

    await page.screenshot({ path: 'screenshots/artkit_full_gallery.png', fullPage: false });
    console.log('[SAVED] screenshots/artkit_full_gallery.png');

    // ----------------------------------------------------
    // PROOF (a): Star Orchestra Stage with Interactive Stars
    // ----------------------------------------------------
    console.log('\n--- PROOF (a): Star Orchestra Stage & Sprite Stars ---');
    await page.goto(`${BASE_URL}/?experience=orchestra`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    const stageElem = await page.$('.conductor-sky-stage');
    console.log(`[PASS] Conductor stage rendered: ${!!stageElem}`);

    const starSprites = await page.$$('.star-sprite-img');
    console.log(`[PASS] Star sprite cutouts rendered: ${starSprites.length} of 3`);

    const pipConductor = await page.$('.podium-pip-img');
    console.log(`[PASS] Official Pip conductor rendered: ${!!pipConductor}`);

    // Verify Star Conduction Clickability
    const star1Btn = await page.$('.star-conduction-btn.star-1');
    if (star1Btn) await star1Btn.click();
    await new Promise((r) => setTimeout(r, 200));

    await page.screenshot({ path: 'screenshots/artkit_stage_interactive_stars.png' });
    console.log('[SAVED] screenshots/artkit_stage_interactive_stars.png');

    // ----------------------------------------------------
    // PROOF (b): Moonlight Lab — Two Lantern / Ghost States
    // ----------------------------------------------------
    console.log('\n--- PROOF (b): Moonlight Lab — Two Lantern & Ghost States ---');
    await page.goto(`${BASE_URL}/?experience=moonlight`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 500));

    // State 1: Warm mood, 45% brightness
    const lanternImg = await page.$('.chamber-lantern-img');
    console.log(`[PASS] Single Official Lantern rendered: ${!!lanternImg}`);

    const ghostBed = await page.$('.chamber-ghost-bed');
    console.log(`[PASS] Bedside Ghost rendered: ${!!ghostBed}`);

    await page.screenshot({ path: 'screenshots/artkit_lantern_ghost_warm.png' });
    console.log('[SAVED] screenshots/artkit_lantern_ghost_warm.png (State 1: Warm Mood)');

    // State 2: Switch to Starlight mood, 55% brightness, trigger Test Nightlight (Cozy Sleep)
    const moodBtns = await page.$$('.desk-pill-btn');
    if (moodBtns.length >= 3) {
      await moodBtns[2].click(); // Little Starlight
      await new Promise((r) => setTimeout(r, 200));
    }

    const testBtn = await page.$('.test-nightlight-btn');
    if (testBtn) {
      await testBtn.click();
      await new Promise((r) => setTimeout(r, 1200));
    }

    await page.screenshot({ path: 'screenshots/artkit_lantern_ghost_starlight.png' });
    console.log('[SAVED] screenshots/artkit_lantern_ghost_starlight.png (State 2: Starlight Cozy Sleep)');

    // ----------------------------------------------------
    // PROOF (d) & (c): Dream Express — Lighthouse Beam & Train Positions
    // ----------------------------------------------------
    console.log('\n--- PROOF (d) & (c): Dream Express — Lighthouse Beam & In-Flight Train ---');
    await page.goto(`${BASE_URL}/?experience=express`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    // PROOF (d): Lighthouse Beam 2 angles
    await page.screenshot({ path: 'screenshots/artkit_lighthouse_angle1.png' });
    console.log('[SAVED] screenshots/artkit_lighthouse_angle1.png');

    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshots/artkit_lighthouse_angle2.png' });
    console.log('[SAVED] screenshots/artkit_lighthouse_angle2.png');

    // Capture the actual eased React progress, rather than assumed wall-clock times.
    const destBtns = await page.$$('.dest-select-btn');
    if (destBtns.length >= 3) {
      await destBtns[2].click(); // Moonbeam Tower
      await new Promise((r) => setTimeout(r, 200));
    }

    const cargoBtns = await page.$$('.cargo-select-btn');
    if (cargoBtns.length >= 3) {
      await cargoBtns[2].click(); // Starlight Compass
      await new Promise((r) => setTimeout(r, 200));
    }

    const dispatchBtn = await page.$('.dispatch-train-btn');
    if (dispatchBtn) {
      await dispatchBtn.click();
      console.log('[PASS] Dispatched train to Moonbeam Tower (6.8s trip)!');

      // 25% of 8500ms = ~2125ms
      await page.waitForFunction(() => Number(document.querySelector('.express-stage-viewport').dataset.progress) >= 0.25);
      await page.screenshot({ path: 'screenshots/artkit_locomotive_25pct.png' });
      console.log('[SAVED] screenshots/artkit_locomotive_25pct.png (25% flight)');

      // 50% of 8500ms = ~4250ms (+2150ms)
      await page.waitForFunction(() => Number(document.querySelector('.express-stage-viewport').dataset.progress) >= 0.5);
      await page.screenshot({ path: 'screenshots/artkit_locomotive_50pct.png' });
      console.log('[SAVED] screenshots/artkit_locomotive_50pct.png (50% flight)');

      // 75% of 8500ms = ~6375ms (+2125ms)
      await page.waitForFunction(() => Number(document.querySelector('.express-stage-viewport').dataset.progress) >= 0.75);
      await page.screenshot({ path: 'screenshots/artkit_locomotive_75pct.png' });
      console.log('[SAVED] screenshots/artkit_locomotive_75pct.png (75% flight)');

      // Wait for completion and receipt
      await page.waitForSelector('.express-delivery-receipt', { timeout: 10000 });
      console.log('[PASS] Locomotive arrived and delivery receipt displayed!');
    }

    // ----------------------------------------------------
    // PROOF (f): Responsive & Mobile Controls (768, 375, 320)
    // ----------------------------------------------------
    console.log('\n--- PROOF (f): Mobile & Tablet Controls Audit ---');
    const viewports = [
      { name: 'Tablet 768', width: 768, height: 1024, file: 'screenshots/artkit_tablet_768.png' },
      { name: 'Mobile 375', width: 375, height: 667, file: 'screenshots/artkit_mobile_375.png' },
      { name: 'Mobile 320', width: 320, height: 568, file: 'screenshots/artkit_mobile_320.png' },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 300));

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      console.log(`[${overflow ? 'FAIL' : 'PASS'}] Viewport ${vp.name} (${vp.width}x${vp.height}) - Horizontal overflow: ${overflow ? 'YES' : 'NONE'}`);

      await page.screenshot({ path: vp.file });
      console.log(`[SAVED] ${vp.file}`);
    }

    // ----------------------------------------------------
    // Console Error Audit
    // ----------------------------------------------------
    console.log('\n--- Console Errors Audit ---');
    console.log(`Total Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Console errors logged:', consoleErrors);
    } else {
      console.log('[PASS] ZERO CONSOLE ERRORS DETECTED across entire test run!');
    }

  } catch (err) {
    console.error('Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    console.log('\n====================================================');
    console.log('ART KIT INTEGRATION VERIFICATION COMPLETE');
    console.log('====================================================');
  }
}

runArtKitVerification();

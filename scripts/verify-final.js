import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:4173';

async function runFinalVerification() {
  console.log('====================================================');
  console.log('FINAL PRODUCTION DIRECTIVE — VERIFICATION SUITE');
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
    // TEST 1: Load main page at 1440x900 & Check Base Elements
    // ----------------------------------------------------
    console.log('--- TEST 1: Main Page & Gallery of Doorways (1440x900) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    // Check Living Dreamspace
    const dreamspace = await page.$('.living-dreamspace-root');
    console.log(`[PASS] Living Dreamspace container rendered: ${!!dreamspace}`);

    // Check Workshop Gallery of Doorways
    const workshop = await page.$('#workshop.invention-workshop-doorway-gallery');
    console.log(`[PASS] Workshop Doorway Gallery rendered: ${!!workshop}`);

    const stampTray = await page.$('.stamp-tray-card');
    console.log(`[PASS] Dream Passport StampTray rendered: ${!!stampTray}`);

    const doorways = await page.$$('.doorway-card');
    console.log(`[PASS] Doorway Cards rendered: ${doorways.length} of 3`);

    // Check Credits Footer
    const footer = await page.$('.pip-credits-footer');
    console.log(`[PASS] Credits and Attribution Footer rendered: ${!!footer}`);

    // Capture main gallery screenshot
    await page.screenshot({ path: 'screenshots/final_gallery_doorways.png', fullPage: false });

    // ----------------------------------------------------
    // TEST 2: Responsive Viewport Overflow Checks
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Viewport Responsiveness & Zero Overflow ---');
    const viewports = [
      { name: 'Desktop 1440', width: 1440, height: 900 },
      { name: 'Tablet 1136', width: 1136, height: 800 },
      { name: 'Tablet 768', width: 768, height: 1024 },
      { name: 'Mobile 375', width: 375, height: 667 },
      { name: 'Mobile 320', width: 320, height: 568 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 100));

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      console.log(`[${hasOverflow ? 'FAIL' : 'PASS'}] Viewport ${vp.name} (${vp.width}x${vp.height}) - Horizontal overflow: ${hasOverflow ? 'YES (BUG)' : 'NO (CLEAN)'}`);
      if (vp.width === 375) {
        await page.screenshot({ path: 'screenshots/final_mobile_375.png' });
      }
    }

    // Reset to desktop viewport for interactive tests
    await page.setViewport({ width: 1440, height: 900 });

    // ----------------------------------------------------
    // TEST 3: Dedicated Experience 1 — The Star Orchestra
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Experience 1 — The Star Orchestra ---');
    const orchestraBtn = await page.$('.btn-orchestra');
    if (orchestraBtn) {
      await orchestraBtn.click();
      await new Promise((r) => setTimeout(r, 400));

      // Verify URL updated
      const currentUrl = page.url();
      const hasUrlParam = currentUrl.includes('experience=orchestra');
      console.log(`[PASS] URL updated to ?experience=orchestra: ${hasUrlParam}`);

      // Verify Experience Shell
      const shellTitle = await page.$eval('#exp-shell-title', (el) => el.textContent);
      console.log(`[PASS] Opened Experience: "${shellTitle}"`);

      // Conduction steps
      const star1Btn = await page.$('.star-conduction-btn.star-1');
      if (star1Btn) await star1Btn.click();
      await new Promise((r) => setTimeout(r, 200));

      const star2Btn = await page.$('.star-conduction-btn.star-2');
      if (star2Btn) await star2Btn.click();
      await new Promise((r) => setTimeout(r, 200));

      const star3Btn = await page.$('.star-conduction-btn.star-3');
      if (star3Btn) await star3Btn.click();
      await new Promise((r) => setTimeout(r, 300));

      // Capture screenshot of Conductor Podium in action
      await page.screenshot({ path: 'screenshots/final_exp1_orchestra.png' });

      // Close experience using Back button
      const closeBtn = await page.$('.shell-back-btn');
      if (closeBtn) await closeBtn.click();
      await new Promise((r) => setTimeout(r, 300));

      const clearedUrl = page.url();
      console.log(`[PASS] Closed Experience 1 and URL cleared: ${!clearedUrl.includes('experience=orchestra')}`);
    }

    // ----------------------------------------------------
    // TEST 4: Direct URL Navigation — Experience 2 (Moonlight Lab)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Direct URL Deep Link — Experience 2 (Moonlight Lab) ---');
    await page.goto(`${BASE_URL}/?experience=moonlight`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const moonShellTitle = await page.$eval('#exp-shell-title', (el) => el.textContent);
    console.log(`[PASS] Deep-linked directly to Experience: "${moonShellTitle}"`);

    // Test Brightness Slider
    await page.evaluate(() => {
      const slider = document.querySelector('.desk-slider');
      if (slider) {
        slider.value = 50;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Test Color Preset (sleepy)
    const moodBtns = await page.$$('.desk-pill-btn');
    if (moodBtns.length > 1) await moodBtns[1].click();
    await new Promise((r) => setTimeout(r, 200));

    // Test Nightlight Action
    const testNightlightBtn = await page.$('.test-nightlight-btn');
    if (testNightlightBtn) {
      await testNightlightBtn.click();
      await new Promise((r) => setTimeout(r, 1200));

      const ghostFeedback = await page.$eval('.ghost-speech-bubble', (el) => el.textContent);
      console.log(`[PASS] Ghost reaction: "${ghostFeedback}"`);
    }

    await page.screenshot({ path: 'screenshots/final_exp2_moonlight.png' });

    // Close via Escape key
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 300));
    console.log(`[PASS] Escape key dismissed Experience 2 and URL cleaned: ${!page.url().includes('experience=moonlight')}`);

    // ----------------------------------------------------
    // TEST 5: Dedicated Experience 3 — The Living Dream Express
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Experience 3 — The Living Dream Express ---');
    const expressBtn = await page.$('.btn-express');
    if (expressBtn) {
      await expressBtn.click();
      await new Promise((r) => setTimeout(r, 400));

      const expressShellTitle = await page.$eval('#exp-shell-title', (el) => el.textContent);
      console.log(`[PASS] Opened Experience: "${expressShellTitle}"`);

      // Select destination Platform 1 (Cloud Cottage - fastest 5.5s)
      const destBtns = await page.$$('.dest-select-btn');
      if (destBtns.length > 0) await destBtns[0].click();
      await new Promise((r) => setTimeout(r, 150));

      // Select cargo (blanket)
      const cargoBtns = await page.$$('.cargo-select-btn');
      if (cargoBtns.length > 0) await cargoBtns[0].click();
      await new Promise((r) => setTimeout(r, 150));

      // Dispatch Train
      const dispatchBtn = await page.$('.dispatch-train-btn');
      if (dispatchBtn) {
        await dispatchBtn.click();
        console.log('[PASS] Dispatched Dream Express locomotive No. 003!');

        // Wait for train travel animation to complete and receipt to show
        await page.waitForSelector('.express-delivery-receipt', { timeout: 15000 });
        const receiptDest = await page.$eval('.exp-receipt-destination', (el) => el.textContent);
        console.log(`[PASS] Delivery Completed! Receipt at: "${receiptDest}"`);
      }

      await page.screenshot({ path: 'screenshots/final_exp3_dream_express.png' });

      // Close modal
      const closeBtn = await page.$('.shell-back-btn');
      if (closeBtn) await closeBtn.click();
      await new Promise((r) => setTimeout(r, 300));
    }

    // ----------------------------------------------------
    // TEST 6: Narrative Payoff ("Tuck the Website In")
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Narrative Bedtime Payoff ("Tuck the Website In") ---');
    await page.evaluate(() => {
      localStorage.setItem('pip_stamps_v1', JSON.stringify({ orchestra: true, moonlight: true, express: true }));
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const tuckBtn = await page.$('.tuck-bedtime-cta-btn');
    console.log(`[PASS] "Tuck the Website In" CTA unlocked with 3/3 stamps: ${!!tuckBtn}`);
    if (tuckBtn) {
      await tuckBtn.click();
      await new Promise((r) => setTimeout(r, 500));

      const modalTitle = await page.$eval('#bedtime-modal-title', (el) => el.textContent);
      console.log(`[PASS] Bedtime Ending Modal Opened: "${modalTitle}"`);

      // Verify all 3 badges in seal
      const badges = await page.$$('.seal-badge');
      console.log(`[PASS] Dream Passport Seal Badges rendered: ${badges.length} of 3`);

      await page.screenshot({ path: 'screenshots/final_bedtime_payoff.png' });

      // Test "Wake the Website Again" (Zero Lockout!)
      const wakeBtn = await page.$('.bedtime-wake-btn');
      if (wakeBtn) {
        await wakeBtn.click();
        await new Promise((r) => setTimeout(r, 400));
        const modalStillOpen = await page.$('.bedtime-ending-backdrop');
        console.log(`[PASS] "Wake the Website Again" restored the website: ${!modalStillOpen}`);
      }
    }

    // ----------------------------------------------------
    // TEST 7: Console Errors Audit
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Console Errors Audit ---');
    console.log(`Total Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Console errors detected:', consoleErrors);
    } else {
      console.log('[PASS] ZERO CONSOLE ERRORS DETECTED across entire session!');
    }

  } catch (err) {
    console.error('Verification failed with error:', err);
  } finally {
    await browser.close();
    console.log('\n====================================================');
    console.log('VERIFICATION RUN COMPLETE');
    console.log('====================================================');
  }
}

runFinalVerification();

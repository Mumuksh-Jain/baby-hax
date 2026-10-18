import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPass01C4AVerification() {
  console.log('🎬 Launching Edge browser for PASS 01C.4A Cinematic Animation Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--autoplay-policy=no-user-gesture-required', '--window-size=1280,800'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('📡 1. Navigating to', URL);
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // 2. Enable sound switch
  console.log('🔊 2. Enabling sound switch...');
  await page.click('.sound-toggle-btn');
  const soundEnabled = await page.evaluate(() => {
    const btn = document.querySelector('.sound-toggle-btn');
    return btn ? btn.getAttribute('aria-pressed') === 'true' : false;
  });
  console.log('✓ Sound switch is ON:', soundEnabled);

  // 3. Collect Star 1 and Star 2
  console.log('⭐ 3. Collecting Star 1 and Star 2 in bedroom...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 400));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 400));

  // 4. Click Star 3 to trigger opening and begin timed frame capture
  console.log('🌌 4. Collecting Star 3 -> Triggering Opening Sequence...');
  const t0 = Date.now();
  await page.click('.star-3');

  // Timestamps to capture: 0.5s, 1.5s, 2.5s, 3.5s, 4.5s, 5.5s, 6.5s, 8.0s, 9.5s
  const captureSchedule = [
    { sec: 0.5, name: 'frame-0.5s.png', label: '0.5s: Bedroom Paper-Cut Cloud Wipe Transition' },
    { sec: 1.5, name: 'frame-1.5s.png', label: '1.5s: Curtains Part, 3 Scenery Layers & Pip Cradle Unveiled' },
    { sec: 2.5, name: 'frame-2.5s.png', label: '2.5s: Star 1 Arcs in from Left with Comet Trail' },
    { sec: 3.5, name: 'frame-3.5s.png', label: '3.5s: Star 2 Loops from Upper Right under Moon' },
    { sec: 4.5, name: 'frame-4.5s.png', label: '4.5s: Star 3 Arrives from Below; Trio Prepares Spiral' },
    { sec: 5.5, name: 'frame-5.5s.png', label: '5.5s: Full Coordinated Spiral Flight around Pip' },
    { sec: 6.5, name: 'frame-6.5s.png', label: '6.5s: Contracting Spiral with Luminous Motion Ribbons' },
    { sec: 8.0, name: 'frame-8.0s.png', label: '8.0s: Stars Ease to Constellation; Triangle Line Forms' },
    { sec: 9.5, name: 'frame-9.5s.png', label: '9.5s: Constellation Settles; "Did I just invent a galaxy?!"' },
  ];

  console.log('\n📸 Capturing 9 continuous animation proof frames across the opening...');
  let vocalStartedDuringOpening = false;
  for (const item of captureSchedule) {
    const targetMs = item.sec * 1000;
    const currentElapsed = Date.now() - t0;
    const waitTime = targetMs - currentElapsed;
    if (waitTime > 0) {
      await new Promise((r) => setTimeout(r, waitTime));
    }

    // Check if song started prematurely during opening frames (0 to 9.0s)
    if (item.sec <= 9.0) {
      const text = await page.evaluate(() => document.querySelector('.subtitle-text')?.textContent || '');
      if (text.includes('Twinkle, twinkle')) {
        vocalStartedDuringOpening = true;
      }
    }

    const filePath = path.join(SCREENSHOT_DIR, item.name);
    await page.screenshot({ path: filePath });
    console.log(`✓ Captured [${item.sec.toFixed(1)}s] -> ${item.name} (${item.label})`);
  }

  // 5. Verify audio ownership during opening: ensure vocal lullaby did NOT start prematurely
  console.log('\n🎵 Audio Ownership Check: Vocal lullaby refrained from starting during opening (0-9.0s):', !vocalStartedDuringOpening);
  if (vocalStartedDuringOpening) {
    throw new Error('Vocal lullaby started prematurely during the opening animation!');
  }

  // Verify that vocal lullaby starts promptly when opening finishes (10.0s+)
  const waitToSong = 10600 - (Date.now() - t0);
  if (waitToSong > 0) await new Promise((r) => setTimeout(r, waitToSong));
  const songStarted = await page.evaluate(() => {
    const subtitle = document.querySelector('.subtitle-text')?.textContent || '';
    return subtitle.includes('Twinkle, twinkle');
  });
  console.log('🎵 Audio Ownership Check: Vocal lullaby started promptly after opening finishes (10.0s+):', songStarted);
  if (!songStarted) {
    throw new Error('Vocal lullaby failed to start after opening sequence finished!');
  }

  // 6. Build Labeled Contact Sheet combining all 9 frames
  console.log('\n🖼️ 6. Generating Labeled Contact Sheet (pass01c4a-contact-sheet.png)...');
  const contactSheetHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>PASS 01C.4A Cinematic Proof Contact Sheet</title>
        <style>
          body {
            margin: 0;
            padding: 30px;
            background: #0A0D1A;
            color: #FFF8F1;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          h1 {
            text-align: center;
            color: #F5D88C;
            margin-bottom: 8px;
            font-size: 26px;
            letter-spacing: 0.05em;
          }
          p.subtitle {
            text-align: center;
            color: #FAF1E2;
            opacity: 0.8;
            margin-bottom: 24px;
            font-size: 14px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            max-width: 1400px;
            margin: 0 auto;
          }
          .card {
            background: #131930;
            border: 1.5px solid rgba(245, 216, 140, 0.4);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 24px rgba(0,0,0,0.6);
          }
          .card img {
            width: 100%;
            height: auto;
            display: block;
          }
          .caption {
            padding: 10px 14px;
            font-size: 13px;
            font-weight: 600;
            color: #F5D88C;
            background: #18203D;
            border-top: 1px solid rgba(245, 216, 140, 0.2);
          }
        </style>
      </head>
      <body>
        <h1>PIP'S MAGICAL STAR THEATER — OPENING ANIMATION CONTACT SHEET</h1>
        <p class="subtitle">haX.baby Track 1 · PASS 01C.4A Proof of Motion · 9 Timed Rendered Frames (0.5s – 9.5s)</p>
        <div class="grid">
          ${captureSchedule
            .map(
              (item) => `
            <div class="card">
              <img src="http://localhost:4173/screenshots/${item.name}" />
              <div class="caption">${item.label}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </body>
    </html>
  `;

  // Serve screenshots folder temporarily or load via file path
  // In puppeteer we can read the image files as base64 and embed directly in canvas/html!
  const cardsHtml = captureSchedule.map((item) => {
    const data = fs.readFileSync(path.join(SCREENSHOT_DIR, item.name)).toString('base64');
    return `
      <div class="card">
        <img src="data:image/png;base64,${data}" />
        <div class="caption">${item.label}</div>
      </div>
    `;
  }).join('');

  const fullContactHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>PASS 01C.4A Cinematic Proof Contact Sheet</title>
        <style>
          body {
            margin: 0;
            padding: 30px;
            background: #0A0D1A;
            color: #FFF8F1;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          h1 {
            text-align: center;
            color: #F5D88C;
            margin-bottom: 8px;
            font-size: 26px;
            letter-spacing: 0.05em;
          }
          p.subtitle {
            text-align: center;
            color: #FAF1E2;
            opacity: 0.8;
            margin-bottom: 24px;
            font-size: 14px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            max-width: 1400px;
            margin: 0 auto;
          }
          .card {
            background: #131930;
            border: 1.5px solid rgba(245, 216, 140, 0.4);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 24px rgba(0,0,0,0.6);
          }
          .card img {
            width: 100%;
            height: auto;
            display: block;
          }
          .caption {
            padding: 10px 14px;
            font-size: 13px;
            font-weight: 600;
            color: #F5D88C;
            background: #18203D;
            border-top: 1px solid rgba(245, 216, 140, 0.2);
          }
        </style>
      </head>
      <body>
        <h1>PIP'S MAGICAL STAR THEATER — OPENING ANIMATION CONTACT SHEET</h1>
        <p class="subtitle">haX.baby Track 1 · PASS 01C.4A Proof of Motion · 9 Timed Rendered Frames (0.5s – 9.5s)</p>
        <div class="grid">
          ${cardsHtml}
        </div>
      </body>
    </html>
  `;

  const contactPage = await browser.newPage();
  await contactPage.setViewport({ width: 1440, height: 1200 });
  await contactPage.setContent(fullContactHtml);
  await contactPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4a-contact-sheet.png'), fullPage: true });
  await contactPage.close();
  console.log('✓ Generated labeled contact sheet: screenshots/pass01c4a-contact-sheet.png');

  // 7. Test "Back to Bedroom" safe exit during opening
  console.log('\n🚪 7. Testing "Back to Bedroom" button safe exit...');
  await page.bringToFront();
  await page.click('.back-bedroom-btn');
  await new Promise((r) => setTimeout(r, 1200));
  const theaterClosed = await page.evaluate(() => {
    return !document.querySelector('.magical-star-theater.theater-active');
  });
  console.log('Theater closed cleanly after Back button:', theaterClosed);
  if (!theaterClosed) throw new Error('Back to Bedroom button failed to close theater!');

  // 8. Test Keyboard Escape key handling
  console.log('\n⌨️ 8. Testing Escape key handling...');
  // Trigger theater again
  await page.click('.star-1');
  await page.click('.star-2');
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 800));
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 1200));
  const closedOnEsc = await page.evaluate(() => !document.querySelector('.magical-star-theater.theater-active'));
  console.log('Theater closed cleanly on Escape:', closedOnEsc);
  if (!closedOnEsc) throw new Error('Escape key failed to close theater!');

  // 9. Mobile Viewports (375x667 and 320x568)
  console.log('\n📱 9. Checking Mobile Viewports (375px and 320px)...');
  await page.setViewport({ width: 375, height: 667 });
  await page.click('.star-1');
  await page.click('.star-2');
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 1000));

  const mobile375Overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  console.log('Mobile 375px horizontal overflow check:', mobile375Overflow);
  if (!mobile375Overflow) throw new Error('Mobile 375px has horizontal overflow!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4a-mobile-375.png') });

  // 320px check
  await page.setViewport({ width: 320, height: 568 });
  await new Promise((r) => setTimeout(r, 500));
  const mobile320Overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  console.log('Mobile 320px horizontal overflow check:', mobile320Overflow);
  if (!mobile320Overflow) throw new Error('Mobile 320px has horizontal overflow!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4a-mobile-320.png') });

  await page.click('.back-bedroom-btn');
  await new Promise((r) => setTimeout(r, 1000));

  // 10. Console Errors Check
  console.log('\n🚨 10. Checking Console Errors...');
  console.log('Console errors recorded:', consoleErrors);
  if (consoleErrors.length > 0) {
    throw new Error(`Console errors found: ${consoleErrors.join(', ')}`);
  }
  console.log('✓ 0 Console errors recorded!');

  await browser.close();
  console.log('\n🎉 ALL PASS 01C.4A VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
}

runPass01C4AVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

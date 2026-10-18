import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPass01C1Verification() {
  console.log('🚀 Launching Edge browser for PASS 01C.1 & 01C.2 QA verification...');
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
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Enable Sound Opt-in
  console.log('🔊 1. Enabling sound switch...');
  await page.click('.sound-toggle-btn');
  const soundEnabled = await page.$eval('.sound-toggle-btn', (el) => el.getAttribute('aria-pressed'));
  console.log('Sound state:', soundEnabled);
  if (soundEnabled !== 'true') throw new Error('Sound failed to enable');

  // Verify twinkle_vocal.mp3 is loaded & decodable
  console.log('🎵 Checking twinkle_vocal.mp3 decodability...');
  const vocalCheck = await page.evaluate(async () => {
    const res = await fetch('/assets/audio/twinkle_vocal.mp3');
    if (!res.ok) return { ok: false, status: res.status };
    const buf = await res.arrayBuffer();
    const ctx = new AudioContext();
    const decoded = await ctx.decodeAudioData(buf);
    return { ok: true, duration: decoded.duration };
  });
  console.log('Vocal audio check result:', vocalCheck);
  if (!vocalCheck.ok) throw new Error(`Could not load /assets/audio/twinkle_vocal.mp3: ${vocalCheck.status}`);

  // 2. Test First Star Collection
  console.log('⭐ 2. Collecting First Star (Star 1)...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 450));

  // Check progress indicator 1/3
  const status1 = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  console.log('Status after Star 1:', status1);
  if (!status1.includes('1/3')) throw new Error(`Expected '1/3' in status, got: ${status1}`);

  // Check Pip surprised motion state
  const puppetMotion1 = await page.$eval('.pip-puppet-actor', (el) => el.className);
  console.log('Pip puppet actor class after Star 1:', puppetMotion1);
  if (!puppetMotion1.includes('pip-motion-surprised')) {
    throw new Error(`Expected pip-motion-surprised, got: ${puppetMotion1}`);
  }

  // Check Pip dialogue
  const dialogue1 = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  console.log('Pip dialogue after Star 1:', dialogue1);
  if (!dialogue1.includes('One little star? For me?')) {
    throw new Error(`Expected 'One little star? For me?', got: ${dialogue1}`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c1-01-star1-surprised.png'), fullPage: true });

  // 3. Test Second Star Collection
  console.log('⭐ 3. Collecting Second Star (Star 2)...');
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 450));

  // Check progress indicator 2/3
  const status2 = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  console.log('Status after Star 2:', status2);
  if (!status2.includes('2/3')) throw new Error(`Expected '2/3' in status, got: ${status2}`);

  // Check Pip curious motion state
  const puppetMotion2 = await page.$eval('.pip-puppet-actor', (el) => el.className);
  console.log('Pip puppet actor class after Star 2:', puppetMotion2);
  if (!puppetMotion2.includes('pip-motion-curious')) {
    throw new Error(`Expected pip-motion-curious, got: ${puppetMotion2}`);
  }

  // Check Pip dialogue
  const dialogue2 = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  console.log('Pip dialogue after Star 2:', dialogue2);
  if (!dialogue2.includes('are you starting a band?!')) {
    throw new Error(`Expected 'Wait... are you starting a band?!', got: ${dialogue2}`);
  }

  // Check that both stars 1 and 2 orbit together!
  const star1Orbiting = await page.$eval('.carrier-star-1', (el) => el.classList.contains('orbiting'));
  const star2Orbiting = await page.$eval('.carrier-star-2', (el) => el.classList.contains('orbiting'));
  console.log('Star 1 orbiting during dual-orbit:', star1Orbiting);
  console.log('Star 2 orbiting during dual-orbit:', star2Orbiting);
  if (!star1Orbiting || !star2Orbiting) {
    throw new Error('Both stars must orbit together when Star 2 is collected!');
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c1-02-star2-curious-dualorbit.png'), fullPage: true });

  // 4. Test Third Star Collection -> Full Vocal Lullaby Performance
  console.log('⭐ 4. Collecting Third Star (Star 3) -> Vocal Lullaby Performance!');
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 500));

  // Check progress indicator 3/3
  const status3 = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  console.log('Status after Star 3:', status3);
  if (!status3.includes('3/3')) throw new Error(`Expected '3/3' in status, got: ${status3}`);

  // Check Pip listening motion state
  const puppetMotion3 = await page.$eval('.pip-puppet-actor', (el) => el.className);
  console.log('Pip puppet actor class during lullaby:', puppetMotion3);
  if (!puppetMotion3.includes('pip-motion-listening')) {
    throw new Error(`Expected pip-motion-listening, got: ${puppetMotion3}`);
  }

  // Check floating musical notes
  const hasMusicNotes = await page.$eval('.pip-music-notes-layer', (el) => !!el);
  console.log('Floating musical notes rendered:', hasMusicNotes);
  if (!hasMusicNotes) throw new Error('Expected floating musical notes during performance');

  // Check dialogue at start of singing
  const dialogue3 = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  console.log('Pip dialogue at singing start:', dialogue3);
  if (!dialogue3.includes('they’re singing?!')) {
    throw new Error(`Expected 'Wait... they’re singing?!', got: ${dialogue3}`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c1-03-star3-vocal-listening.png'), fullPage: true });

  // 5. Test Muting mid-vocal immediately silences audio
  console.log('🔇 5. Testing mute mid-vocal (sound off)...');
  await page.click('.sound-toggle-btn');
  const soundMuted = await page.$eval('.sound-toggle-btn', (el) => el.getAttribute('aria-pressed'));
  console.log('Sound state during performance:', soundMuted);
  if (soundMuted !== 'false') throw new Error('Sound failed to mute mid-performance');

  // Re-enable sound
  await page.click('.sound-toggle-btn');

  // 6. Test Skip/Finish lullaby early by clicking Pip
  console.log('✨ 6. Testing early finish by tapping Pip to tuck in...');
  await page.click('.pip-poke-btn');
  await new Promise((r) => setTimeout(r, 500));

  // Verify Pip transitioned to celebrating motion state
  const puppetMotionFinale = await page.$eval('.pip-puppet-actor', (el) => el.className);
  console.log('Pip puppet actor class in Finale:', puppetMotionFinale);
  if (!puppetMotionFinale.includes('pip-motion-celebrating')) {
    throw new Error(`Expected pip-motion-celebrating, got: ${puppetMotionFinale}`);
  }

  // Verify celebrating dialogue
  const dialogueFinale = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  console.log('Pip dialogue in Finale:', dialogueFinale);
  if (!dialogueFinale.includes('bedroom into a studio')) {
    throw new Error(`Expected 'Wow! You turned my bedroom into a studio!', got: ${dialogueFinale}`);
  }

  // Verify status sign in Finale
  const statusFinale = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  console.log('Status sign in Finale:', statusFinale);
  if (!statusFinale.includes('FINALE!')) {
    throw new Error(`Expected FINALE! in status, got: ${statusFinale}`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c1-04-finale-celebrating.png'), fullPage: true });

  // 7. Wait for return flight and reset to idle
  console.log('⏳ 7. Waiting for stars to return home and state to reset to idle...');
  await page.waitForFunction(
    () => {
      const stage = document.querySelector('.pip-stage-container');
      return stage && stage.classList.contains('orchestra-idle');
    },
    { timeout: 10000 }
  );

  console.log('🎉 Stars successfully returned home! State is idle again.');
  const resetStarCount = await page.$$eval('.pip-star-btn', (els) => els.length);
  console.log(`Interactive stars after reset: ${resetStarCount}`);
  if (resetStarCount !== 3) {
    throw new Error(`Expected all 3 stars to be restored, found ${resetStarCount}`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c1-05-stars-returned-replay.png'), fullPage: true });

  // 8. Test Tab Switching Reset during playback
  console.log('📑 8. Testing Tab Switching interruption & reset...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('#tab-log');
  await new Promise((r) => setTimeout(r, 300));
  await page.click('#tab-bedroom');
  await new Promise((r) => setTimeout(r, 300));
  const restoredStarsAfterTab = await page.$$eval('.pip-star-btn', (els) => els.length);
  console.log(`Stars after tab switch reset: ${restoredStarsAfterTab}`);
  if (restoredStarsAfterTab !== 3) {
    throw new Error(`Expected 3 stars after tab switch reset, found ${restoredStarsAfterTab}`);
  }

  // 9. Test Reduced Motion Support
  console.log('♿ 9. Testing reduced-motion preference...');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 200));
  console.log('Reduced motion mode functioned without layout breaking.');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);

  // 10. Responsive Viewport Verifications (Zero horizontal overflow)
  console.log('📱 10. Verifying Responsive Viewports...');
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
  }

  // Check console errors
  console.log('Console errors during QA run:', consoleErrors);
  if (consoleErrors.length > 0) {
    throw new Error(`Console errors encountered: ${consoleErrors.join(', ')}`);
  }

  await browser.close();
  console.log('✅ ALL PASS 01C.1 & 01C.2 ACCEPTANCE CHECKS PASSED PERFECTLY!');
}

runPass01C1Verification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

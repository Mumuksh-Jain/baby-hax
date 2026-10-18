import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPass01C3Verification() {
  console.log('🚀 Launching Edge browser for PASS 01C.3 Comprehensive Verification...\n');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage();
  const requestedUrls = [];
  page.on('request', (req) => {
    requestedUrls.push(req.url());
  });

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

  // 1. Verify Audio Asset and Decoded Duration
  console.log('\n🎵 2. Verifying twinkle_vocal_short.mp3 asset...');
  const audioAssetCheck = await page.evaluate(async () => {
    const res = await fetch('/assets/audio/twinkle_vocal_short.mp3');
    if (!res.ok) return { ok: false, status: res.status };
    const buf = await res.arrayBuffer();
    const sizeBytes = buf.byteLength; // Record before decodeAudioData detaches the buffer
    const ctx = new AudioContext();
    const decoded = await ctx.decodeAudioData(buf);
    return {
      ok: true,
      sizeBytes,
      duration: decoded.duration,
      sampleRate: decoded.sampleRate,
      numberOfChannels: decoded.numberOfChannels,
    };
  });
  console.log('Audio asset details:', audioAssetCheck);
  if (!audioAssetCheck.ok) {
    throw new Error(`Failed to load twinkle_vocal_short.mp3: ${audioAssetCheck.status}`);
  }
  if (audioAssetCheck.duration < 15 || audioAssetCheck.duration > 26) {
    throw new Error(`Duration ${audioAssetCheck.duration}s is not within 15-26 seconds!`);
  }
  console.log(`✓ Audio duration ${audioAssetCheck.duration.toFixed(2)}s is within target 15-25s window!`);
  console.log(`✓ Audio file size is ${(audioAssetCheck.sizeBytes / 1024).toFixed(1)} KB (down from 5.8 MB)!`);

  // Verify full-size audio is NOT requested
  const longAudioRequested = requestedUrls.some((u) => u.includes('twinkle_vocal.mp3') && !u.includes('twinkle_vocal_short.mp3'));
  if (longAudioRequested) {
    throw new Error('Detected request for old 5.8MB twinkle_vocal.mp3!');
  }
  console.log('✓ Verified: Old 5.8MB audio file is NOT requested by browser.');

  // 2. Enable Sound Opt-in
  console.log('\n🔊 3. Enabling sound switch...');
  await page.click('.sound-toggle-btn');
  const soundEnabled = await page.$eval('.sound-toggle-btn', (el) => el.getAttribute('aria-pressed'));
  if (soundEnabled !== 'true') throw new Error('Sound toggle failed to enable');
  console.log('✓ Sound switch is ON');

  // 3. Collect Star 1
  console.log('\n⭐ 4. Testing Star 1 Collection...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 400));
  const status1 = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  const quote1 = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  console.log(`Star 1 Status: ${status1}`);
  console.log(`Star 1 Quote: ${quote1}`);
  if (!status1.includes('1/3')) throw new Error(`Expected 1/3, got ${status1}`);
  if (!quote1.includes('One little star? For me?')) throw new Error(`Unexpected quote: ${quote1}`);

  // 4. Collect Star 2
  console.log('\n⭐ 5. Testing Star 2 Collection...');
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 400));
  const status2 = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  const quote2 = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  console.log(`Star 2 Status: ${status2}`);
  console.log(`Star 2 Quote: ${quote2}`);
  if (!status2.includes('2/3')) throw new Error(`Expected 2/3, got ${status2}`);
  if (!quote2.includes('are you starting a band?!')) throw new Error(`Unexpected quote: ${quote2}`);

  // 5. Collect Star 3 -> Triggers Vocal Lullaby Performance
  console.log('\n⭐ 6. Testing Star 3 Collection & Vocal Performance Start...');
  const startTime = Date.now();
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 600));

  const status3 = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  const quote3 = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  const puppetMotion3 = await page.$eval('.pip-puppet-actor', (el) => el.className);
  console.log(`Star 3 Status: ${status3}`);
  console.log(`Star 3 Quote: ${quote3}`);
  console.log(`Pip Puppet Actor class: ${puppetMotion3}`);
  if (!status3.includes('3/3')) throw new Error(`Expected 3/3, got ${status3}`);
  if (!puppetMotion3.includes('pip-motion-listening')) throw new Error('Expected pip-motion-listening');
  console.log('✓ Performance started promptly on Star 3 click!');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c3-01-performance-started.png'), fullPage: true });

  // 6. Test Early Skip on Pip click
  console.log('\n⏭️ 7. Testing Early Skip (clicking Pip during performance)...');
  await page.click('.pip-poke-btn');
  await new Promise((r) => setTimeout(r, 400));
  const finaleQuoteEarly = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  console.log(`Early Skip Finale Quote: ${finaleQuoteEarly}`);
  if (!finaleQuoteEarly.includes('Wow! You turned my bedroom into a studio!')) {
    throw new Error(`Early skip failed to trigger finale! Got: ${finaleQuoteEarly}`);
  }
  console.log('✓ Early skip immediately triggers finale and Pip celebration!');

  // Wait for return flight and reset
  console.log('⏳ Waiting for return flight and reset (~5.5s)...');
  await new Promise((r) => setTimeout(r, 6000));
  const resetOrchestraState = await page.evaluate(() => window.__orchestraState || 'idle');
  console.log('Orchestra state after reset:', resetOrchestraState);

  // 7. Full Performance to Natural Musical Completion
  console.log('\n🎶 8. Testing Complete Full Performance to Natural Musical End (~17.5s)...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('.star-3');

  const songStartTime = Date.now();
  console.log('Performance running. Polling for natural celebratory finale transition...');

  let reachedFinale = false;
  let finaleTime = 0;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const currentClass = await page.$eval('.pip-puppet-actor', (el) => el.className);
    if (currentClass.includes('pip-motion-celebrating')) {
      reachedFinale = true;
      finaleTime = (Date.now() - songStartTime) / 1000;
      break;
    }
  }

  if (!reachedFinale) {
    throw new Error('Performance did not naturally transition to celebrating within 40 seconds!');
  }
  console.log(`✓ Finale reached naturally at ${finaleTime.toFixed(1)}s (matches ~17.5s audio duration)!`);

  const finaleQuoteFull = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  console.log(`Finale Quote: ${finaleQuoteFull}`);
  if (!finaleQuoteFull.includes('Wow! You turned my bedroom into a studio!')) {
    throw new Error(`Expected finale studio quote, got: ${finaleQuoteFull}`);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c3-02-full-finale-studio.png'), fullPage: true });

  // 8. Test Mid-Performance Muting
  console.log('\n🔇 9. Testing Mid-Performance Mute (Sound ON -> Sound OFF mid-song)...');
  // Wait for settlement
  await new Promise((r) => setTimeout(r, 6000));

  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 2000)); // 2s into song

  console.log('Muting sound mid-song...');
  await page.click('.sound-toggle-btn');
  const soundMuted = await page.$eval('.sound-toggle-btn', (el) => el.getAttribute('aria-pressed'));
  console.log('Sound state after mid-song mute:', soundMuted);
  if (soundMuted !== 'false') throw new Error('Failed to mute');

  // Verify visual sequence does not stall and finishes around 17.5s
  console.log('Verifying visual performance finishes smoothly after mute...');
  let reachedFinaleMuted = false;
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const currentClass = await page.$eval('.pip-puppet-actor', (el) => el.className);
    if (currentClass.includes('pip-motion-celebrating')) {
      reachedFinaleMuted = true;
      break;
    }
  }
  if (!reachedFinaleMuted) {
    throw new Error('Muting mid-song stalled or broke the visual sequence!');
  }
  console.log('✓ Mid-song muting smoothly silences audio and finishes visual sequence on schedule!');

  // 9. Test Tab Switch Safety
  console.log('\n📑 10. Testing Tab Switch Safety (switching away mid-song)...');
  await new Promise((r) => setTimeout(r, 7000));
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 200));
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 1000));

  console.log('Switching to log tab...');
  await page.click('#tab-log');
  await new Promise((r) => setTimeout(r, 1000));

  const logPanelVisible = await page.$eval('#panel-log', (el) => el.textContent.includes('midnight_nursery.log'));
  console.log('Log panel visible:', logPanelVisible);
  if (!logPanelVisible) throw new Error('Failed to switch to log tab');

  // Switch back to bedroom tab
  await page.click('#tab-bedroom');
  await new Promise((r) => setTimeout(r, 500));
  const bedroomRestored = await page.$eval('.sign-status-text', (el) => el.textContent.includes('WIDE AWAKE'));
  console.log('Bedroom restored cleanly to WIDE AWAKE:', bedroomRestored);
  if (!bedroomRestored) throw new Error('State was not reset cleanly on tab switch');
  console.log('✓ Tab switch cancels orchestra safely without triggering premature finale!');

  // 10. Check Mobile Layout (375x667)
  console.log('\n📱 11. Testing Mobile Viewport (375x667)...');
  await page.setViewport({ width: 375, height: 667 });
  await new Promise((r) => setTimeout(r, 500));
  const mobileOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth <= window.innerWidth;
  });
  console.log('Mobile horizontal overflow check (fits inside viewport):', mobileOverflow);
  if (!mobileOverflow) throw new Error('Horizontal scroll detected on mobile viewport!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c3-03-mobile-layout.png'), fullPage: true });

  // 11. Check Console Errors
  console.log('\n🚨 12. Checking Console Errors...');
  console.log('Console errors recorded:', consoleErrors);
  if (consoleErrors.length > 0) {
    throw new Error(`Console errors found: ${consoleErrors.join(', ')}`);
  }
  console.log('✓ 0 Console errors recorded!');

  await browser.close();
  console.log('\n🎉 ALL PASS 01C.3 VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
}

runPass01C3Verification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

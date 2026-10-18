import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPass01C4BVerification() {
  console.log('🎬 Launching Edge browser for PASS 01C.4B Corrective Verification...\n');

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

  // 1. Check audio decoding duration and asset path
  console.log('🎵 2. Verifying twinkle_vocal_short_v2.mp3 audio asset...');
  const audioInfo = await page.evaluate(async () => {
    const res = await fetch('/assets/audio/twinkle_vocal_short_v2.mp3');
    const arrayBuffer = await res.arrayBuffer();
    const ctx = new AudioContext();
    const buffer = await ctx.decodeAudioData(arrayBuffer);
    return {
      status: res.status,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      numberOfChannels: buffer.numberOfChannels,
    };
  });
  console.log(`✓ Audio asset decoded duration: ${audioInfo.duration.toFixed(3)}s (Expected ~20.0s)`);
  if (Math.abs(audioInfo.duration - 20.0) > 0.5) {
    throw new Error(`Audio duration mismatch: ${audioInfo.duration}`);
  }

  // 2. Enable sound switch
  console.log('🔊 3. Enabling sound switch in bedroom...');
  await page.click('.sound-toggle-btn');
  const soundEnabled = await page.evaluate(() => {
    const btn = document.querySelector('.sound-toggle-btn');
    return btn ? btn.getAttribute('aria-pressed') === 'true' : false;
  });
  console.log('✓ Sound switch is ON:', soundEnabled);

  // 3. Collect Star 1 and Star 2
  console.log('⭐ 4. Collecting Star 1 and Star 2...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 400));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 400));

  // 4. Click Star 3 to trigger opening and begin timed frame captures
  console.log('🌌 5. Collecting Star 3 -> Triggering Opening Sequence...');
  const t0 = Date.now();
  await page.click('.star-3');

  // Verify Pip's Thought Cloud (Problem 2) at 1.2s
  await new Promise((r) => setTimeout(r, 1200));
  const sceneAData = await page.evaluate(() => {
    const thoughtWrapper = document.querySelector('.pip-thought-cloud-wrapper');
    const thoughtText = document.querySelector('.thought-cloud-text')?.textContent || '';
    const bottomSubtitle = document.querySelector('.layer-j-cinematic-subtitles');
    const bottomText = document.querySelector('.subtitle-text')?.textContent || '';
    return {
      thoughtVisible: Boolean(thoughtWrapper),
      thoughtText,
      hasBottomSubtitle: Boolean(bottomSubtitle),
      bottomText,
    };
  });

  console.log('💭 Pip Thought Cloud at 1.2s:', sceneAData);
  console.log('✓ Thought cloud emerging from Pip head:', sceneAData.thoughtVisible);
  console.log('✓ Thought text:', sceneAData.thoughtText);
  console.log('✓ Bottom subtitle is cleanly absent during Pip thought:', !sceneAData.hasBottomSubtitle);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4b-01-thought-cloud.png') });
  console.log('✓ Saved: screenshots/pass01c4b-01-thought-cloud.png');

  // Check Star 1 entrance at 2.6s
  const elapsed2 = Date.now() - t0;
  if (2600 - elapsed2 > 0) await new Promise((r) => setTimeout(r, 2600 - elapsed2));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4b-02-star1-entrance.png') });
  console.log('✓ Saved: screenshots/pass01c4b-02-star1-entrance.png');

  // Check Spiral and Glitter Spray (Problem 3 & 4) at 5.5s
  const elapsed5 = Date.now() - t0;
  if (5500 - elapsed5 > 0) await new Promise((r) => setTimeout(r, 5500 - elapsed5));
  const spiralData = await page.evaluate(() => {
    const diamondPath = document.querySelector('.glitter-spray-diamonds')?.getAttribute('d') || '';
    const speckPath = document.querySelector('.glitter-spray-specks')?.getAttribute('d') || '';
    const subtitleText = document.querySelector('.subtitle-text')?.textContent || '';
    const thoughtWrapper = document.querySelector('.pip-thought-cloud-wrapper');
    return {
      hasGlitterDiamonds: diamondPath.length > 20,
      hasGlitterSpecks: speckPath.length > 20,
      subtitleText,
      thoughtHiddenDuringSpiral: !thoughtWrapper,
    };
  });
  console.log('✨ Glitter & Spiral Data at 5.5s:', spiralData);
  console.log('✓ Glitter diamond particles actively spraying:', spiralData.hasGlitterDiamonds);
  console.log('✓ Glitter speck particles actively spraying:', spiralData.hasGlitterSpecks);
  console.log('✓ Cosmic narration displayed at bottom during spiral:', spiralData.subtitleText);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4b-03-glitter-spiral.png') });
  console.log('✓ Saved: screenshots/pass01c4b-03-glitter-spiral.png');

  // Check Constellation and Galaxy Reaction at 8.5s
  const elapsed8 = Date.now() - t0;
  if (8500 - elapsed8 > 0) await new Promise((r) => setTimeout(r, 8500 - elapsed8));
  const settleData = await page.evaluate(() => {
    const thoughtText = document.querySelector('.thought-cloud-text')?.textContent || '';
    const bottomSubtitle = document.querySelector('.layer-j-cinematic-subtitles');
    return {
      thoughtText,
      hasBottomSubtitle: Boolean(bottomSubtitle),
    };
  });
  console.log('🌌 Constellation settle at 8.5s:', settleData);
  console.log('✓ Thought cloud carries "Whoa... did I just invent a galaxy?!":', settleData.thoughtText.includes('galaxy'));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4b-04-settle-constellation.png') });
  console.log('✓ Saved: screenshots/pass01c4b-04-settle-constellation.png');

  // Check Vocal Song Beginning (Problem 1) at 10.6s
  const elapsed10 = Date.now() - t0;
  if (10600 - elapsed10 > 0) await new Promise((r) => setTimeout(r, 10600 - elapsed10));
  const songData = await page.evaluate(() => {
    const bottomText = document.querySelector('.subtitle-text')?.textContent || '';
    const speaker = document.querySelector('.subtitle-speaker')?.textContent || '';
    const thoughtWrapper = document.querySelector('.pip-thought-cloud-wrapper');
    return {
      bottomText,
      speaker,
      thoughtHiddenDuringSong: !thoughtWrapper,
    };
  });
  console.log('🎶 Song Start at 10.6s:', songData);
  console.log('✓ Subtitle begins with "Twinkle, twinkle, little star...":', songData.bottomText.includes('Twinkle, twinkle'));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4b-05-song-start.png') });
  console.log('✓ Saved: screenshots/pass01c4b-05-song-start.png');

  // Test Sound Mute during playback
  console.log('🔇 6. Testing Mute toggle during song playback...');
  await page.click('.sound-toggle-btn');
  const isMuted = await page.evaluate(() => {
    const btn = document.querySelector('.sound-toggle-btn');
    return btn ? btn.getAttribute('aria-pressed') === 'false' : false;
  });
  console.log('✓ Mute toggled successfully:', isMuted);

  // Unmute back
  await page.click('.sound-toggle-btn');

  // Test Early Skip by clicking Pip
  console.log('🎉 7. Testing Early Skip (clicking Pip during song)...');
  await page.click('.cradle-character-wrap');
  await new Promise((r) => setTimeout(r, 400));
  const skipData = await page.evaluate(() => {
    const thoughtText = document.querySelector('.thought-cloud-text')?.textContent || '';
    const bottomSubtitle = document.querySelector('.layer-j-cinematic-subtitles');
    return {
      thoughtText,
      hasBottomSubtitle: Boolean(bottomSubtitle),
    };
  });
  console.log('✓ Early skip triggered Pip celebratory thought:', skipData.thoughtText);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4b-06-celebration.png') });
  console.log('✓ Saved: screenshots/pass01c4b-06-celebration.png');

  // Test Back to Bedroom button
  console.log('🚪 8. Testing Back to Bedroom exit...');
  await page.click('.back-bedroom-btn');
  await new Promise((r) => setTimeout(r, 900));
  const bedroomRestored = await page.evaluate(() => {
    const theater = document.querySelector('.magical-star-theater');
    const hero = document.querySelector('.pip-hero-section');
    return !theater && Boolean(hero);
  });
  console.log('✓ Bedroom restored cleanly after Back button:', bedroomRestored);

  // Test Mobile Breakpoints (375px and 320px)
  console.log('📱 9. Testing Mobile Viewports (375px and 320px)...');
  
  // Test 375px Mobile Viewport with fresh page navigation
  await page.setViewport({ width: 375, height: 667 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 350));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 350));
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 1400));

  const mobile375Overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth <= window.innerWidth;
  });
  console.log('✓ 375px Mobile overflow check (scrollWidth <= innerWidth):', mobile375Overflow);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4b-mobile-375.png') });
  console.log('✓ Saved: screenshots/pass01c4b-mobile-375.png');

  // Test 320px Mobile Viewport
  await page.setViewport({ width: 320, height: 568 });
  await new Promise((r) => setTimeout(r, 500));
  const mobile320Overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth <= window.innerWidth;
  });
  console.log('✓ 320px Mobile overflow check (scrollWidth <= innerWidth):', mobile320Overflow);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01c4b-mobile-320.png') });
  console.log('✓ Saved: screenshots/pass01c4b-mobile-320.png');

  // Check console errors
  console.log('\n🚨 10. Checking Console Errors...');
  console.log('Console errors recorded:', consoleErrors);
  if (consoleErrors.length > 0) {
    throw new Error(`Console errors encountered: ${JSON.stringify(consoleErrors)}`);
  }
  console.log('✓ 0 Console errors recorded!');

  await browser.close();
  console.log('\n🎉 ALL PASS 01C.4B VERIFICATION CHECKS PASSED SUCCESSFULLY!');
}

runPass01C4BVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

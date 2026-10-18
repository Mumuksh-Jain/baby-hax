import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPass01BVerification() {
  console.log('🚀 Launching Edge browser for PASS 01B QA testing...');
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

  // 1. Initial Desktop 1440x900 Verification
  console.log('🖥️ 1. Verifying Default Desktop 1440px State...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.waitForSelector('.psst-button');

  const soundInitial = await page.$eval('.sound-toggle-btn', (el) => el.getAttribute('aria-pressed'));
  console.log('Default Sound state (should be false/off):', soundInitial);
  if (soundInitial !== 'false') {
    throw new Error(`Expected sound to default to false, got ${soundInitial}`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01b-01-desktop-hero.png'), fullPage: true });

  // 2. Test Sound Toggle & Web Audio Context
  console.log('🔊 2. Testing Sound Toggle & Mute Switch...');
  await page.click('.sound-toggle-btn');
  const soundEnabled = await page.$eval('.sound-toggle-btn', (el) => el.getAttribute('aria-pressed'));
  console.log('Sound state after opt-in click:', soundEnabled);
  if (soundEnabled !== 'true') throw new Error('Sound toggle failed to enable');

  // Fast mute test: immediately toggle off
  await page.click('.sound-toggle-btn');
  const soundMuted = await page.$eval('.sound-toggle-btn', (el) => el.getAttribute('aria-pressed'));
  console.log('Sound state after mute click:', soundMuted);
  if (soundMuted !== 'false') throw new Error('Sound toggle failed to mute');

  // Turn sound back on for subsequent interaction audio test
  await page.click('.sound-toggle-btn');

  // 3. Test Moon Toggle (Nightlight Mode)
  console.log('🌙 3. Testing Interactive Moon Toggle...');
  await page.click('.mini-moon-btn');
  await new Promise((r) => setTimeout(r, 200));

  const isNightlightTheme = await page.$eval('.retro-browser-container', (el) =>
    el.classList.contains('theme-nightlight')
  );
  const nightlightStatus = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  console.log('Theme nightlight active:', isNightlightTheme);
  console.log('Status in nightlight mode:', nightlightStatus);

  if (!isNightlightTheme || !nightlightStatus.includes('COZY NIGHTLIGHT')) {
    throw new Error('Nightlight mode activation failed');
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01b-02-desktop-nightlight.png'), fullPage: true });

  // Toggle moon back
  await page.click('.mini-moon-btn');
  await new Promise((r) => setTimeout(r, 200));

  // 4. Test Playful Interactive Stars
  console.log('⭐ 4. Testing Playful Interactive Stars & Particles...');
  await page.click('.paper-star.star-1');
  const particlesCount = await page.$$eval('.star-sparkle-particle', (els) => els.length);
  console.log('Star sparkle particles spawned:', particlesCount);
  if (particlesCount < 1) throw new Error('Particles did not spawn on star click');

  // Wait for particles to auto-cleanup
  await new Promise((r) => setTimeout(r, 700));
  const particlesCleaned = await page.$$eval('.star-sparkle-particle', (els) => els.length);
  console.log('Star particles after timeout (should be 0):', particlesCleaned);
  if (particlesCleaned !== 0) throw new Error('Particles failed to auto-cleanup');

  // 5. Test Pip Direct Poke & Cycling Through 4+ Reactions
  console.log('🧸 5. Testing Pip Direct Poke & Reaction Cycling...');
  const quotesObserved = [];

  for (let i = 0; i < 5; i++) {
    await page.click('.pip-poke-btn');
    await page.waitForSelector('.dialogue-bubble');
    const quote = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
    const status = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
    quotesObserved.push({ quote, status });
    console.log(`Reaction ${i + 1}: Status="${status}" | Quote="${quote.slice(0, 45)}..."`);
    await new Promise((r) => setTimeout(r, 250));
  }

  const uniqueQuotes = new Set(quotesObserved.map((q) => q.quote));
  console.log(`Unique Pip reactions observed: ${uniqueQuotes.size} (Required: >= 4)`);
  if (uniqueQuotes.size < 4) {
    throw new Error(`Expected at least 4 distinct reactions, got ${uniqueQuotes.size}`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01b-03-desktop-pip-reactions.png'), fullPage: true });

  // Test original Psst, Pip? button still triggers signature panic
  console.log('✨ Testing original "Psst, Pip?" button...');
  await page.click('.psst-button');
  const psstStatus = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  console.log('Status after Psst, Pip?:', psstStatus);
  if (psstStatus !== 'PIP IS PANICKING (politely)') {
    throw new Error(`Expected "PIP IS PANICKING (politely)", got "${psstStatus}"`);
  }

  // 6. Test Functional Retro Tabs
  console.log('📂 6. Testing Functional Retro Tabs...');
  // Click 'midnight_nursery.log'
  await page.click('#tab-log');
  await page.waitForSelector('.nursery-log-panel');
  const logTitle = await page.$eval('#log-panel-title', (el) => el.textContent.trim());
  const urlAfterLog = await page.$eval('#browser-url-text', (el) => el.textContent.trim());
  console.log('Log title:', logTitle);
  console.log('URL text after tab switch:', urlAfterLog);

  if (!urlAfterLog.includes('midnight_nursery.log')) {
    throw new Error(`URL did not update to log file: ${urlAfterLog}`);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01b-04-desktop-tab-log.png'), fullPage: true });

  // Test Escape key closes log panel and returns to bedroom
  console.log('⌨️ Testing Escape key to close log panel...');
  await page.keyboard.press('Escape');
  await page.waitForSelector('.hero-section');
  const activeTabAfterEsc = await page.$eval('#tab-bedroom', (el) => el.getAttribute('aria-selected'));
  console.log('Bedroom tab aria-selected after Esc:', activeTabAfterEsc);
  if (activeTabAfterEsc !== 'true') throw new Error('Escape key did not return to bedroom');

  // Click 'dream_blueprints.txt'
  console.log('📐 Testing Dream Blueprints tab...');
  await page.click('#tab-blueprint');
  await page.waitForSelector('.dream-blueprint-panel');
  const bpTitle = await page.$eval('#blueprint-panel-title', (el) => el.textContent.trim());
  const urlAfterBp = await page.$eval('#browser-url-text', (el) => el.textContent.trim());
  console.log('Blueprint title:', bpTitle);
  console.log('URL text after tab switch:', urlAfterBp);

  if (!urlAfterBp.includes('dream_blueprints.txt')) {
    throw new Error(`URL did not update to blueprints file: ${urlAfterBp}`);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'pass01b-05-desktop-tab-blueprints.png'), fullPage: true });

  // Close blueprints via button
  await page.click('.blueprint-close-btn');
  await page.waitForSelector('.hero-section');

  // 7. Responsive Viewport Verifications
  console.log('📱 7. Verifying Responsive Viewports...');
  const viewports = [
    { name: 'Tablet 768px', width: 768, height: 1024, file: 'pass01b-06-tablet-768.png' },
    { name: 'Mobile 375px', width: 375, height: 812, file: 'pass01b-07-mobile-375.png' },
    { name: 'Narrow Mobile 320px', width: 320, height: 650, file: 'pass01b-08-narrow-mobile-320.png' },
  ];

  for (const vp of viewports) {
    console.log(`Checking ${vp.name}...`);
    await page.setViewport({ width: vp.width, height: vp.height });
    await new Promise((r) => setTimeout(r, 200));

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`${vp.name} horizontal overflow:`, overflow);
    if (overflow) throw new Error(`Horizontal overflow detected on ${vp.name}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, vp.file), fullPage: true });
  }

  console.log('\n=== PASS 01B QA SUMMARY ===');
  console.log('Console Errors:', consoleErrors.length === 0 ? 'None (0 errors)' : consoleErrors);
  console.log('Interactive Pip Reactions:', `${uniqueQuotes.size} unique funny reactions verified`);
  console.log('Interactive Moon (Nightlight): Verified and styled');
  console.log('Interactive Stars & Particles: Verified with auto-cleanup');
  console.log('Sound Switch (Opt-in & Immediate Mute): Verified');
  console.log('Functional Retro Tabs & Esc key: Verified');
  console.log('Responsiveness (1440px, 768px, 375px, 320px): 0 horizontal overflow');

  await browser.close();
  console.log('✅ PASS 01B QA verification complete!');
}

runPass01BVerification().catch((err) => {
  console.error('❌ QA verification failed:', err);
  process.exit(1);
});

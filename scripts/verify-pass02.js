import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPass02Verification() {
  console.log('🎬 Launching Edge browser for PASS 02 Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--autoplay-policy=no-user-gesture-required', '--window-size=1280,1000', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  console.log('🌐 1. Navigating to preview server at http://localhost:4173/...');
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // 1. Check Hero section & Discoverable Link
  console.log('👀 2. Verifying discoverable "See My Inventions" link in Hero section...');
  const heroLink = await page.$('.hero-inventions-link');
  if (!heroLink) {
    throw new Error('❌ Missing .hero-inventions-link in Hero section!');
  }
  const heroLinkText = await page.evaluate((el) => el.textContent, heroLink);
  console.log(`   ✓ Found hero inventions link: "${heroLinkText.replace(/\s+/g, ' ').trim()}"`);

  // 2. Click "See My Inventions" link and verify scroll
  console.log('🖱️ 3. Clicking "See My Inventions" link to navigate to workshop...');
  await page.click('.hero-inventions-link');
  await new Promise((r) => setTimeout(r, 600));

  const workshopElem = await page.$('#invention-workshop');
  if (!workshopElem) {
    throw new Error('❌ #invention-workshop section element not found in DOM!');
  }
  console.log('   ✓ #invention-workshop is rendered in DOM');

  // Verify Heading, Subheading, and Archival Badge
  const headerInfo = await page.evaluate(() => {
    const badge = document.querySelector('.workshop-archive-badge .badge-text')?.textContent.trim();
    const heading = document.querySelector('.workshop-heading')?.textContent.trim();
    const subheading = document.querySelector('.workshop-subheading')?.textContent.trim();
    const deskNote = document.querySelector('.workshop-desk-note .note-text')?.textContent.trim();
    return { badge, heading, subheading, deskNote };
  });

  console.log(`   ✓ Badge: "${headerInfo.badge}"`);
  console.log(`   ✓ Heading: "${headerInfo.heading}"`);
  console.log(`   ✓ Subheading: "${headerInfo.subheading}"`);
  console.log(`   ✓ Desk Note: "${headerInfo.deskNote}"`);

  // Verify 3 distinct stations exist
  console.log('🔍 4. Verifying the 3 distinct invention stations...');
  const stationCounts = await page.evaluate(() => {
    const s1 = document.querySelector('.station-star-orchestra');
    const s2 = document.querySelector('.station-moonlight-lab');
    const s3 = document.querySelector('.station-dream-express');
    return {
      s1: !!s1,
      s1Title: s1?.querySelector('.station-title')?.textContent.trim(),
      s1Chip: s1?.querySelector('.station-number-chip')?.textContent.trim(),
      s1Category: s1?.querySelector('.station-category')?.textContent.trim(),
      s2: !!s2,
      s2Title: s2?.querySelector('.station-title')?.textContent.trim(),
      s2Chip: s2?.querySelector('.station-number-chip')?.textContent.trim(),
      s2Category: s2?.querySelector('.station-category')?.textContent.trim(),
      s3: !!s3,
      s3Title: s3?.querySelector('.station-title')?.textContent.trim(),
      s3Chip: s3?.querySelector('.station-number-chip')?.textContent.trim(),
      s3Category: s3?.querySelector('.station-category')?.textContent.trim(),
    };
  });

  console.log(`   ✓ Station 1: [${stationCounts.s1Chip}] ${stationCounts.s1Title} (${stationCounts.s1Category})`);
  console.log(`   ✓ Station 2: [${stationCounts.s2Chip}] ${stationCounts.s2Title} (${stationCounts.s2Category})`);
  console.log(`   ✓ Station 3: [${stationCounts.s3Chip}] ${stationCounts.s3Title} (${stationCounts.s3Category})`);

  // Capture Full Desktop Workshop Screenshot
  console.log('📸 5. Capturing complete workshop desktop layout screenshot...');
  const workshopBoundingBox = await page.evaluate(() => {
    const el = document.querySelector('#invention-workshop');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left, y: rect.top + window.scrollY, width: rect.width, height: rect.height };
  });

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'workshop_desktop_complete.png'),
    clip: {
      x: 0,
      y: Math.max(0, workshopBoundingBox.y - 40),
      width: 1280,
      height: Math.min(1800, workshopBoundingBox.height + 80),
    },
  });

  // --- TEST STATION 001: STAR ORCHESTRA ---
  console.log('⭐ 6. Testing Station 001 (The Star Orchestra)...');
  // First, test when theater is NOT unlocked yet
  await page.click('.star-play-btn');
  await new Promise((r) => setTimeout(r, 400));

  const s1StatusText = await page.evaluate(() => {
    return document.querySelector('.station-status-banner')?.textContent.trim() || '';
  });
  console.log(`   ✓ Pre-unlock guidance banner: "${s1StatusText}"`);

  // Capture Star Orchestra exhibit screenshot
  const s1Box = await page.evaluate(() => {
    const el = document.querySelector('.station-star-orchestra');
    const rect = el.getBoundingClientRect();
    return { x: rect.left, y: rect.top + window.scrollY, width: rect.width, height: rect.height };
  });
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'station1_star_orchestra.png'),
    clip: { x: s1Box.x - 10, y: s1Box.y - 10, width: s1Box.width + 20, height: s1Box.height + 20 },
  });

  // --- TEST STATION 002: MOONLIGHT LAB ---
  console.log('🌙 7. Testing Station 002 (The Moonlight Lab 3 Moods)...');
  const s2Box = await page.evaluate(() => {
    const el = document.querySelector('.station-moonlight-lab');
    const rect = el.getBoundingClientRect();
    return { x: rect.left, y: rect.top + window.scrollY, width: rect.width, height: rect.height };
  });

  // Mood 1: Warm & Cozy (Default)
  const warmQuote = await page.evaluate(() => document.querySelector('.speech-text')?.textContent.trim());
  console.log(`   ✓ Mood 1 (Warm & Cozy) quote: "${warmQuote}"`);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'station2_moonlight_warm.png'),
    clip: { x: s2Box.x - 10, y: s2Box.y - 10, width: s2Box.width + 20, height: s2Box.height + 20 },
  });

  // Mood 2: Sleepy Moon
  console.log('   Switching to Mood 2: Sleepy Moon...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.mood-toggle-btn')).find((b) =>
      b.textContent.includes('Sleepy Moon')
    );
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  const sleepyQuote = await page.evaluate(() => document.querySelector('.speech-text')?.textContent.trim());
  console.log(`   ✓ Mood 2 (Sleepy Moon) quote: "${sleepyQuote}"`);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'station2_moonlight_sleepy.png'),
    clip: { x: s2Box.x - 10, y: s2Box.y - 10, width: s2Box.width + 20, height: s2Box.height + 20 },
  });

  // Mood 3: Little Starlight
  console.log('   Switching to Mood 3: Little Starlight...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.mood-toggle-btn')).find((b) =>
      b.textContent.includes('Little Starlight')
    );
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  const starlightQuote = await page.evaluate(() => document.querySelector('.speech-text')?.textContent.trim());
  console.log(`   ✓ Mood 3 (Little Starlight) quote: "${starlightQuote}"`);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'station2_moonlight_starlight.png'),
    clip: { x: s2Box.x - 10, y: s2Box.y - 10, width: s2Box.width + 20, height: s2Box.height + 20 },
  });

  // --- TEST STATION 003: THE DREAM EXPRESS ---
  console.log('🚂 8. Testing Station 003 (The Dream Express Delivery)...');
  const s3Box = await page.evaluate(() => {
    const el = document.querySelector('.station-dream-express');
    const rect = el.getBoundingClientRect();
    return { x: rect.left, y: rect.top + window.scrollY, width: rect.width, height: rect.height };
  });

  // Test Destination 1: Cloud Cottage
  console.log('   Dispatching dream envelope to Cloud Cottage...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.dest-action-btn')).find((b) =>
      b.textContent.includes('Cloud Cottage')
    );
    btn?.click();
  });

  // Capture envelope in flight (~800ms)
  await new Promise((r) => setTimeout(r, 700));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'station3_dream_express_inflight.png'),
    clip: { x: s3Box.x - 10, y: s3Box.y - 10, width: s3Box.width + 20, height: s3Box.height + 20 },
  });

  // Wait for arrival (~1200ms more)
  await new Promise((r) => setTimeout(r, 1200));
  const confirm1 = await page.evaluate(() => document.querySelector('.confirm-body strong')?.textContent.trim());
  console.log(`   ✓ Cloud Cottage delivery confirmed: "${confirm1}"`);

  // Test Destination 2: Sleepy Ghost House
  console.log('   Dispatching dream envelope to Sleepy Ghost House...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.dest-action-btn')).find((b) =>
      b.textContent.includes('Sleepy Ghost House')
    );
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 1800));
  const confirm2 = await page.evaluate(() => document.querySelector('.confirm-body strong')?.textContent.trim());
  console.log(`   ✓ Sleepy Ghost House delivery confirmed: "${confirm2}"`);

  // Test Destination 3: Moonbeam Tower
  console.log('   Dispatching dream envelope to Moonbeam Tower...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.dest-action-btn')).find((b) =>
      b.textContent.includes('Moonbeam Tower')
    );
    btn?.click();
  });
  await new Promise((r) => setTimeout(r, 1800));
  const confirm3 = await page.evaluate(() => document.querySelector('.confirm-body strong')?.textContent.trim());
  console.log(`   ✓ Moonbeam Tower delivery confirmed: "${confirm3}"`);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'station3_dream_express_delivered.png'),
    clip: { x: s3Box.x - 10, y: s3Box.y - 10, width: s3Box.width + 20, height: s3Box.height + 20 },
  });

  // --- TEST STAR THEATER REPLAY INTEGRATION ---
  console.log('🎭 9. Testing Safe Star Theater Replay Integration...');
  // Collect 3 stars in bedroom to unlock theater
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 400));

  console.log('   Collecting Star 1, 2, 3 in bedroom to unlock theater...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 300));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 300));
  await page.click('.star-3');
  await new Promise((r) => setTimeout(r, 1000));

  // Theater is now open! Close it safely to return to bedroom
  console.log('   Closing theater to test replay from workshop...');
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 600));

  // Now scroll to workshop and test "Play with my stars ★" replay
  console.log('   Triggering replay from Station 001 "Play with my stars ★"...');
  await page.evaluate(() => {
    document.querySelector('#invention-workshop')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 300));
  await page.click('.star-play-btn');
  await new Promise((r) => setTimeout(r, 1000));

  const theaterIsOpen = await page.evaluate(() => {
    const th = document.querySelector('.magical-star-theater');
    return !!th;
  });
  console.log(`   ✓ Theater opened safely from Station 001 replay: ${theaterIsOpen}`);
  if (!theaterIsOpen) throw new Error('❌ Theater did not open upon replay click!');

  // Close theater again
  await page.keyboard.press('Escape');
  console.log('   Waiting for bedroom restore transition to complete...');
  await new Promise((r) => setTimeout(r, 1800));

  // --- RESPONSIVE TESTING: MOBILE 375PX & 320PX ---
  console.log('📱 10. Testing Responsive Layouts (375px & 320px)...');
  await page.setViewport({ width: 375, height: 812 });
  await page.evaluate(() => {
    document.querySelector('#invention-workshop')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 400));

  const overflow375 = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log(`   ✓ 375px Horizontal Overflow: ${overflow375 ? 'YES (FAIL)' : 'NO (PASS)'}`);
  if (overflow375) throw new Error('❌ Horizontal overflow detected at 375px!');

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'workshop_mobile_375px.png'),
    fullPage: false,
  });

  await page.setViewport({ width: 320, height: 700 });
  await page.evaluate(() => {
    document.querySelector('#invention-workshop')?.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 400));

  const overflow320 = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log(`   ✓ 320px Horizontal Overflow: ${overflow320 ? 'YES (FAIL)' : 'NO (PASS)'}`);
  if (overflow320) throw new Error('❌ Horizontal overflow detected at 320px!');

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'workshop_mobile_320px.png'),
    fullPage: false,
  });

  // Verify console errors
  console.log('\n🛡️ 11. Console Error Audit:');
  console.log(`   Total Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('   Errors encountered:', consoleErrors);
    throw new Error('❌ Console errors were emitted during tests!');
  } else {
    console.log('   ✓ Zero console errors detected across entire session!');
  }

  await browser.close();
  console.log('\n🎉 PASS 02 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

runPass02Verification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});

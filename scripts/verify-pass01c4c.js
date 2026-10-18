import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPass01C4CVerification() {
  console.log('🎬 Launching Edge browser for PASS 01C.4C Verification...\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--autoplay-policy=no-user-gesture-required', '--window-size=1280,800', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  console.log('🌐 1. Navigating to preview server at http://localhost:4173/...');
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // 1. Enable Sound Switch
  console.log('🔊 2. Enabling sound switch in bedroom...');
  await page.click('.sound-toggle-btn');
  await new Promise((r) => setTimeout(r, 300));

  // 2. Collect Stars
  console.log('⭐ 3. Collecting Star 1, 2, and 3 to launch Magical Star Theater...');
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 400));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 400));
  await page.click('.star-3');

  const t0 = Date.now();
  await page.waitForSelector('.magical-star-theater', { timeout: 4000 });
  console.log('✓ Magical Star Theater is OPEN');

  // --- PART A VERIFICATION: PIP TAP NEVER SKIPS ---
  // Tap Pip at intro (1.2s into theater)
  await new Promise((r) => setTimeout(r, 1200));
  console.log('👉 4. Tapping Pip during Intro Scene (1.2s)...');
  await page.click('.cradle-character-wrap');

  const introTapCheck = await page.evaluate(() => {
    const cradle = document.querySelector('.pip-storybook-cradle');
    const thought = document.querySelector('.thought-cloud-text')?.textContent || '';
    const achievement = document.querySelector('.retro-popup-backdrop');
    const theater = document.querySelector('.magical-star-theater');
    return {
      hasBounce: cradle && cradle.classList.contains('pip-tap-bounce'),
      thought,
      theaterOpen: !!theater,
      achievementOpen: !!achievement,
    };
  });
  console.log('✓ Intro tap check:', introTapCheck);
  if (!introTapCheck.hasBounce || !introTapCheck.theaterOpen || introTapCheck.achievementOpen || introTapCheck.thought.includes('STUDIO')) {
    throw new Error('FAIL: Pip tap during intro caused premature skip or missed bounce!');
  }

  // --- SCENE 1 (10.0s - 14.5s): "Twinkle, twinkle, little star" ---
  console.log('📖 5. Waiting for Scene 1 (Song begins at 10.0s mark)...');
  await page.waitForFunction(
    () => {
      const sub = document.querySelector('.subtitle-text');
      return sub && sub.textContent.includes('Twinkle, twinkle');
    },
    { timeout: 12000 }
  );

  await new Promise((r) => setTimeout(r, 1500)); // ~11.5s
  console.log('👉 6. Tapping Pip DURING vocal singing at ~11.5s...');
  await page.click('.cradle-character-wrap');

  const singingTapCheck = await page.evaluate(() => {
    const cradle = document.querySelector('.pip-storybook-cradle');
    const thoughtText = document.querySelector('.thought-cloud-text')?.textContent || '';
    const subText = document.querySelector('.subtitle-text')?.textContent || '';
    const achievement = document.querySelector('.retro-popup-backdrop');
    const theater = document.querySelector('.magical-star-theater');
    return {
      hasListeningAnim: cradle && cradle.classList.contains('pip-tap-listening'),
      thoughtText,
      subText,
      theaterOpen: !!theater,
      achievementOpen: !!achievement,
    };
  });
  console.log('✓ Singing tap check:', singingTapCheck);
  if (!singingTapCheck.hasListeningAnim || !singingTapCheck.thoughtText.includes('listening') || !singingTapCheck.theaterOpen || singingTapCheck.achievementOpen) {
    throw new Error('FAIL: Pip tap during vocal singing failed listening reaction or skipped!');
  }

  // Capture Scene 1 screenshot at ~12.5s
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scene1_twinkle_stars.png') });
  console.log('📸 Saved scene1_twinkle_stars.png');

  // --- SCENE 2 (14.5s - 19.0s): "How I wonder what you are" ---
  console.log('🔭 7. Waiting for Scene 2 (Curious Sky, Telescope & Question Mark Constellation)...');
  await page.waitForFunction(
    () => {
      const sub = document.querySelector('.subtitle-text');
      return sub && sub.textContent.includes('How I wonder');
    },
    { timeout: 6000 }
  );
  await new Promise((r) => setTimeout(r, 1200)); // ~16.0s

  const scene2Check = await page.evaluate(() => {
    const questionConst = document.querySelector('.scene-storybook-question-mark.is-visible');
    const telescope = document.querySelector('.scene-storybook-telescope.is-visible');
    const cradle = document.querySelector('.pip-storybook-cradle');
    const sub = document.querySelector('.subtitle-text')?.textContent || '';
    return {
      hasQuestionConstellation: !!questionConst,
      hasTelescope: !!telescope,
      isCuriousLook: cradle && cradle.classList.contains('pip-motion-curious-look'),
      sub,
    };
  });
  console.log('✓ Scene 2 elements check:', scene2Check);
  if (!scene2Check.hasQuestionConstellation || !scene2Check.hasTelescope || !scene2Check.isCuriousLook) {
    throw new Error('FAIL: Scene 2 elements or curious look motion missing!');
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scene2_curious_telescope.png') });
  console.log('📸 Saved scene2_curious_telescope.png');

  // --- SCENE 3 (19.0s - 24.0s): "Up above the world so high" ---
  console.log('🏡 8. Waiting for Scene 3 (Perspective rise & Sleeping Paper Village)...');
  await page.waitForFunction(
    () => {
      const sub = document.querySelector('.subtitle-text');
      return sub && sub.textContent.includes('Up above the world');
    },
    { timeout: 6000 }
  );
  await new Promise((r) => setTimeout(r, 1500)); // ~21.0s

  const scene3Check = await page.evaluate(() => {
    const village = document.querySelector('.scene-storybook-village.is-visible');
    const windows = document.querySelectorAll('.village-window');
    const smoke = document.querySelectorAll('.chimney-smoke-wisp');
    const cradle = document.querySelector('.pip-storybook-cradle');
    const theater = document.querySelector('.magical-star-theater');
    const sub = document.querySelector('.subtitle-text')?.textContent || '';
    return {
      hasVillage: !!village,
      windowCount: windows.length,
      smokeCount: smoke.length,
      isSubsceneC: theater && theater.classList.contains('subscene-C'),
      isLookingDown: cradle && cradle.classList.contains('pip-motion-looking-down'),
      sub,
    };
  });
  console.log('✓ Scene 3 village check:', scene3Check);
  if (!scene3Check.hasVillage || scene3Check.windowCount < 4 || !scene3Check.isSubsceneC || !scene3Check.isLookingDown) {
    throw new Error('FAIL: Scene 3 village, glowing windows, or looking-down motion missing!');
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scene3_sleeping_village.png') });
  console.log('📸 Saved scene3_sleeping_village.png');

  // --- SCENE 4 (24.0s - 30.0s): "Like a diamond in the sky" ---
  console.log('💎 9. Waiting for Scene 4 (Diamond Constellation & Stardust Shower)...');
  await page.waitForFunction(
    () => {
      const sub = document.querySelector('.subtitle-text');
      return sub && sub.textContent.includes('Like a diamond');
    },
    { timeout: 6000 }
  );
  await new Promise((r) => setTimeout(r, 1800)); // ~26.5s

  const scene4Check = await page.evaluate(() => {
    const diamond = document.querySelector('.scene-storybook-diamond.is-visible');
    const perimeter = document.querySelector('.diamond-perimeter-line');
    const apexNode = document.querySelector('.diamond-apex-node');
    const cradle = document.querySelector('.pip-storybook-cradle');
    const glitterDiamonds = document.querySelector('.glitter-spray-diamonds')?.getAttribute('d') || '';
    const theater = document.querySelector('.magical-star-theater');
    const sub = document.querySelector('.subtitle-text')?.textContent || '';
    return {
      hasDiamond: !!diamond,
      hasPerimeter: !!perimeter,
      hasApexNode: !!apexNode,
      isSubsceneD: theater && theater.classList.contains('subscene-D'),
      isDrowsy: cradle && cradle.classList.contains('pip-motion-drowsy'),
      hasGlitterSpraying: glitterDiamonds.length > 0,
      sub,
    };
  });
  console.log('✓ Scene 4 diamond check:', scene4Check);
  if (!scene4Check.hasDiamond || !scene4Check.hasPerimeter || !scene4Check.hasApexNode || !scene4Check.isDrowsy) {
    throw new Error('FAIL: Scene 4 diamond constellation, apex star, or drowsy motion missing!');
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'scene4_diamond_constellation.png') });
  console.log('📸 Saved scene4_diamond_constellation.png');

  // --- GRAND FINALE (30.0s+) ---
  console.log('🎉 10. Waiting for Grand Celebratory Finale after full song completion...');
  await page.waitForFunction(
    () => {
      const thought = document.querySelector('.thought-cloud-text')?.textContent || '';
      return thought.includes('STUDIO');
    },
    { timeout: 8000 }
  );
  console.log('✓ Finale triggered naturally: "WOOHOO! You turned my bedroom into a STUDIO!"');

  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'finale_studio_celebration.png') });
  console.log('📸 Saved finale_studio_celebration.png');

  // --- RETURN TO BEDROOM & RETRO ACHIEVEMENT POPUP ---
  console.log('🏆 11. Waiting for curtain exit and retro achievement popup in bedroom...');
  await page.waitForSelector('.retro-popup-backdrop', { timeout: 10000 });
  console.log('✓ Retro achievement popup unlocked successfully in bedroom!');

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'retro_achievement_unlocked.png') });
  console.log('📸 Saved retro_achievement_unlocked.png');

  // --- MOBILE RESPONSIVENESS CHECKS ---
  console.log('📱 12. Testing mobile responsive viewports (375px & 320px)...');
  await page.setViewport({ width: 375, height: 667 });
  await page.click('.popup-conductor-btn'); // Dismiss popup
  await new Promise((r) => setTimeout(r, 400));

  // Launch theater on mobile
  await page.click('.star-1');
  await new Promise((r) => setTimeout(r, 400));
  await page.click('.star-2');
  await new Promise((r) => setTimeout(r, 400));
  await page.click('.star-3');
  await page.waitForSelector('.magical-star-theater', { timeout: 4000 });

  const mobileCheck = await page.evaluate(() => {
    const theater = document.querySelector('.magical-star-theater');
    const cradle = document.querySelector('.pip-storybook-cradle');
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    return {
      theaterOpen: !!theater,
      cradleWidth: cradle ? cradle.getBoundingClientRect().width : 0,
      hasHorizontalScroll: docWidth > winWidth,
    };
  });
  console.log('Mobile 375px check:', mobileCheck);
  if (mobileCheck.hasHorizontalScroll) {
    throw new Error('FAIL: Horizontal overflow detected on 375px mobile viewport!');
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_375px_theater.png') });
  console.log('📸 Saved mobile_375px_theater.png');

  // Test 320px
  await page.setViewport({ width: 320, height: 568 });
  await new Promise((r) => setTimeout(r, 300));
  const mobile320Check = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    return {
      hasHorizontalScroll: docWidth > winWidth,
    };
  });
  console.log('Mobile 320px check:', mobile320Check);
  if (mobile320Check.hasHorizontalScroll) {
    throw new Error('FAIL: Horizontal overflow detected on 320px mobile viewport!');
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile_320px_theater.png') });
  console.log('📸 Saved mobile_320px_theater.png');

  console.log('\n=== ALL PASS 01C.4C VERIFICATIONS COMPLETED WITH 100% SUCCESS! ===');
  console.log(`Total console errors during run: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.warn('Console errors:', consoleErrors);
  }

  await browser.close();
}

runPass01C4CVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});

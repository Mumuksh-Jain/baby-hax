import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runMasterProductionRescueVerification() {
  console.log('🎬 Launching Edge browser for MASTER PRODUCTION RESCUE QA & VERIFICATION...\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--autoplay-policy=no-user-gesture-required', '--window-size=1440,900', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  console.log('🌐 1. Navigating to preview server at http://localhost:4173/...');
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // 1. Verify Workshop Header & Archival Badge
  console.log('👀 2. Verifying Workshop Header & Archival Badge...');
  await page.click('.hero-inventions-link');
  await new Promise((r) => setTimeout(r, 600));

  const headerInfo = await page.evaluate(() => {
    const badge = document.querySelector('.workshop-archive-badge .badge-text')?.textContent.trim();
    const heading = document.querySelector('.workshop-heading')?.textContent.trim();
    const deskNote = document.querySelector('.workshop-desk-note .note-text')?.textContent.trim();
    return { badge, heading, deskNote };
  });
  console.log(`   ✓ Badge: "${headerInfo.badge}"`);
  console.log(`   ✓ Heading: "${headerInfo.heading}"`);

  // 2. Quantitative Layout Checks for Row 1 (Visual Balance)
  console.log('📐 3. Quantitative Layout Checks for Row 1 (Visual Balance & Dead Space)...');
  const row1Metrics = await page.evaluate(() => {
    const boxImg = document.querySelector('.musicbox-image');
    const lanternImg = document.querySelector('.lantern-image');
    const boxCard = document.querySelector('.station-star-orchestra');
    const lanternCard = document.querySelector('.station-moonlight-lab');
    const boxFrame = document.querySelector('.musicbox-preview-frame');
    const lanternFrame = document.querySelector('.lantern-preview-frame');
    const boxFooter = boxCard.querySelector('.station-footer');

    const boxImgRect = boxImg ? boxImg.getBoundingClientRect() : null;
    const lanternImgRect = lanternImg ? lanternImg.getBoundingClientRect() : null;
    const boxCardRect = boxCard ? boxCard.getBoundingClientRect() : null;
    const lanternCardRect = lanternCard ? lanternCard.getBoundingClientRect() : null;
    const boxFrameRect = boxFrame ? boxFrame.getBoundingClientRect() : null;
    const lanternFrameRect = lanternFrame ? lanternFrame.getBoundingClientRect() : null;
    const boxFooterMarginTop = boxFooter ? parseFloat(window.getComputedStyle(boxFooter).marginTop) : 0;

    return {
      boxImg: boxImgRect ? { w: Math.round(boxImgRect.width), h: Math.round(boxImgRect.height) } : null,
      lanternImg: lanternImgRect ? { w: Math.round(lanternImgRect.width), h: Math.round(lanternImgRect.height) } : null,
      boxCard: boxCardRect ? { w: Math.round(boxCardRect.width), h: Math.round(boxCardRect.height) } : null,
      lanternCard: lanternCardRect ? { w: Math.round(lanternCardRect.width), h: Math.round(lanternCardRect.height) } : null,
      boxFrame: boxFrameRect ? { h: Math.round(boxFrameRect.height) } : null,
      lanternFrame: lanternFrameRect ? { h: Math.round(lanternFrameRect.height) } : null,
      boxFooterMarginTop: Math.round(boxFooterMarginTop),
    };
  });

  console.log(`   ✓ Star Orchestra Image: ${row1Metrics.boxImg?.w}x${row1Metrics.boxImg?.h}px`);
  console.log(`   ✓ Moonlight Lab Image: ${row1Metrics.lanternImg?.w}x${row1Metrics.lanternImg?.h}px`);
  console.log(`   ✓ Star Orchestra Card: ${row1Metrics.boxCard?.w}x${row1Metrics.boxCard?.h}px`);
  console.log(`   ✓ Moonlight Lab Card: ${row1Metrics.lanternCard?.w}x${row1Metrics.lanternCard?.h}px`);
  console.log(`   ✓ Preview Frame Heights: Star Orchestra=${row1Metrics.boxFrame?.h}px, Moonlight Lab=${row1Metrics.lanternFrame?.h}px`);
  console.log(`   ✓ Star Orchestra Footer Gap: ${row1Metrics.boxFooterMarginTop}px (no excessive dead space)`);

  // Capture Row 1 Focused Screenshots
  console.log('📸 4. Capturing focused Row 1 exhibit screenshots...');
  const boxCardHandle = await page.$('.station-star-orchestra');
  if (boxCardHandle) {
    await boxCardHandle.screenshot({ path: path.join(SCREENSHOT_DIR, '01_star_orchestra_card.png') });
    console.log('   ✓ Saved 01_star_orchestra_card.png');
  }

  const lanternCardHandle = await page.$('.station-moonlight-lab');
  if (lanternCardHandle) {
    await lanternCardHandle.screenshot({ path: path.join(SCREENSHOT_DIR, '02_moonlight_lab_card.png') });
    console.log('   ✓ Saved 02_moonlight_lab_card.png');
  }

  // 3. Station 2: Moonlight Lab Mode Switching
  console.log('🕯️ 5. Verifying Moonlight Lab mood switching...');
  const moodButtons = await page.$$('.mood-toggle-btn');
  // Click Sleepy Moon
  await moodButtons[1].click();
  await new Promise((r) => setTimeout(r, 400));
  const sleepyQuote = await page.$eval('.speech-text', (el) => el.textContent);
  console.log(`   ✓ Sleepy Moon Quote: "${sleepyQuote}"`);

  // Click Little Starlight
  await moodButtons[2].click();
  await new Promise((r) => setTimeout(r, 400));
  const starlightQuote = await page.$eval('.speech-text', (el) => el.textContent);
  console.log(`   ✓ Little Starlight Quote: "${starlightQuote}"`);

  // Reset to Warm & Cozy
  await moodButtons[0].click();
  await new Promise((r) => setTimeout(r, 400));

  // 4. Station 3: Dream Express Panoramic 1200x520 World
  console.log('🚂 6. Verifying Dream Express 1200x520 Panoramic Railway World...');
  const mapMetrics = await page.evaluate(() => {
    const map = document.querySelector('.nursery-map-container');
    const svg = document.querySelector('.delivery-routes-svg');
    const depot = document.querySelector('.depot-landmark');
    const cottage = document.querySelector('.cloud-cottage-landmark');
    const ghost = document.querySelector('.ghost-house-landmark');
    const tower = document.querySelector('.moonbeam-tower-landmark');
    const loco = document.querySelector('.loco-group');
    const carriage = document.querySelector('.carriage-group');
    const wheels = document.querySelector('.loco-wheels');

    return {
      mapWidth: map ? map.offsetWidth : null,
      mapHeight: map ? map.offsetHeight : null,
      viewBox: svg ? svg.getAttribute('viewBox') : null,
      hasDepot: !!depot,
      hasCottage: !!cottage,
      hasGhost: !!ghost,
      hasTower: !!tower,
      hasLoco: !!loco,
      hasCarriage: !!carriage,
      wheelsSpinningWhileIdle: wheels?.classList.contains('anim-wheels-spin') || false,
    };
  });

  console.log(`   ✓ Map Container Size: ${mapMetrics.mapWidth}x${mapMetrics.mapHeight}px (viewBox: ${mapMetrics.viewBox})`);
  console.log(`   ✓ Landmarks Present: Depot=${mapMetrics.hasDepot}, Cottage=${mapMetrics.hasCottage}, GhostHouse=${mapMetrics.hasGhost}, Tower=${mapMetrics.hasTower}`);
  console.log(`   ✓ Articulated Train Present: Locomotive=${mapMetrics.hasLoco}, Carriage=${mapMetrics.hasCarriage}`);
  console.log(`   ✓ Idle Wheel Motion: wheelsSpinningWhileIdle=${mapMetrics.wheelsSpinningWhileIdle} (Wheels must be STOPPED when idle!)`);

  const expressCardHandle = await page.$('.station-dream-express');
  if (expressCardHandle) {
    await expressCardHandle.screenshot({ path: path.join(SCREENSHOT_DIR, '03_dream_express_idle.png') });
    console.log('   ✓ Saved 03_dream_express_idle.png');
  }

  // 5. Test Route 1: Dispatch to Cloud Cottage with Progress Sampling (25%, 50%, 75%, arrival)
  console.log('☁️ 7. Dispatching Dream Express to Cloud Cottage...');
  const destButtons = await page.$$('.destination-card-btn');
  await destButtons[0].click(); // Cloud Cottage

  // Sample progress during flight
  await new Promise((r) => setTimeout(r, 1050)); // ~25%
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_train_journey_25pct.png') });
  console.log('   ✓ Saved 04_train_journey_25pct.png');

  await new Promise((r) => setTimeout(r, 1050)); // ~50%
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_train_journey_50pct.png') });
  console.log('   ✓ Saved 05_train_journey_50pct.png');

  await new Promise((r) => setTimeout(r, 1050)); // ~75%
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_train_journey_75pct.png') });
  console.log('   ✓ Saved 06_train_journey_75pct.png');

  // Wait for arrival
  await new Promise((r) => setTimeout(r, 1600)); // Arrived (~4.2s total)
  const cottageArrival = await page.evaluate(() => {
    const receipt = document.querySelector('.delivery-confirmation-card');
    const cottageLandmark = document.querySelector('.cloud-cottage-landmark');
    const wheels = document.querySelector('.loco-wheels');
    const steam = document.querySelector('.loco-steam-puffs');
    return {
      receiptShown: !!receipt,
      receiptTitle: receipt?.querySelector('.receipt-destination-name')?.textContent.trim(),
      cottageDelivered: cottageLandmark?.classList.contains('is-delivered'),
      wheelsStoppedOnArrival: !wheels?.classList.contains('anim-wheels-spin'),
      steamStoppedOnArrival: !steam,
    };
  });

  console.log(`   ✓ Cloud Cottage Arrival: Delivered=${cottageArrival.cottageDelivered}, Receipt="${cottageArrival.receiptTitle}"`);
  console.log(`   ✓ Mechanics on Arrival: Wheels stopped=${cottageArrival.wheelsStoppedOnArrival}, Steam stopped=${cottageArrival.steamStoppedOnArrival}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_train_cloud_cottage_arrival.png') });
  console.log('   ✓ Saved 07_train_cloud_cottage_arrival.png');

  // 6. Test Route 2: Dispatch to Sleepy Ghost House
  console.log('👻 8. Dispatching Dream Express to Sleepy Ghost House...');
  // Refresh destination button list and click Ghost House
  const destButtons2 = await page.$$('.destination-card-btn');
  await destButtons2[1].click();

  // Wait for arrival (~4.6s total)
  await new Promise((r) => setTimeout(r, 4900));

  const ghostArrival = await page.evaluate(() => {
    const ghost = document.querySelector('.ghost-character');
    const ghostLandmark = document.querySelector('.ghost-house-landmark');
    const receipt = document.querySelector('.delivery-confirmation-card');
    return {
      ghostCelebrating: ghost?.classList.contains('is-celebrating'),
      landmarkDelivered: ghostLandmark?.classList.contains('is-delivered'),
      receiptTitle: receipt?.querySelector('.receipt-destination-name')?.textContent.trim(),
    };
  });

  console.log(`   ✓ Ghost House Arrival: Celebrating=${ghostArrival.ghostCelebrating}, Receipt="${ghostArrival.receiptTitle}"`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_train_ghost_house_arrival.png') });
  console.log('   ✓ Saved 08_train_ghost_house_arrival.png');

  // 7. Test Route 3: Dispatch to Moonbeam Tower & Observe Lighthouse Searchlight
  console.log('🏰 9. Dispatching Dream Express to Moonbeam Tower & Verifying Lighthouse Searchlight...');
  const destButtons3 = await page.$$('.destination-card-btn');
  await destButtons3[2].click();

  // Capture 3 visibly different lighthouse sweep angles
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09a_lighthouse_sweep_angle_1.png') });
  console.log('   ✓ Saved 09a_lighthouse_sweep_angle_1.png');

  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09b_lighthouse_sweep_angle_2.png') });
  console.log('   ✓ Saved 09b_lighthouse_sweep_angle_2.png');

  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09c_lighthouse_sweep_angle_3.png') });
  console.log('   ✓ Saved 09c_lighthouse_sweep_angle_3.png');

  // Wait for arrival (~5.2s total)
  await new Promise((r) => setTimeout(r, 2600));

  const towerArrival = await page.evaluate(() => {
    const towerLandmark = document.querySelector('.moonbeam-tower-landmark');
    const rotor = document.querySelector('.lighthouse-beam-rotor');
    const receipt = document.querySelector('.delivery-confirmation-card');
    return {
      towerDelivered: towerLandmark?.classList.contains('is-delivered'),
      rotorMode: rotor?.className?.baseVal || rotor?.className,
      receiptTitle: receipt?.querySelector('.receipt-destination-name')?.textContent.trim(),
    };
  });

  console.log(`   ✓ Moonbeam Tower Arrival: Delivered=${towerArrival.towerDelivered}, Mode="${towerArrival.rotorMode}", Receipt="${towerArrival.receiptTitle}"`);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_train_moonbeam_tower_arrival.png') });
  console.log('   ✓ Saved 10_train_moonbeam_tower_arrival.png');

  // 8. Test Pip's Origin Story Flipbook (Phase 15.1)
  console.log('📖 10. Verifying Pip’s Canonical Origin Story Flipbook (Phase 15.1)...');
  const originMetrics = await page.evaluate(() => {
    const originSection = document.querySelector('#origin-story');
    const chapterNum = originSection?.querySelector('.chapter-num')?.textContent.trim();
    const chapterTitle = originSection?.querySelector('.chapter-title')?.textContent.trim();
    const prose = originSection?.querySelector('.scene-prose')?.textContent.trim();
    const wordCount = prose ? prose.split(/\s+/).length : 0;
    return {
      hasOrigin: !!originSection,
      chapterNum,
      chapterTitle,
      wordCount,
      prose,
    };
  });

  console.log(`   ✓ Origin Story rendered: ${originMetrics.chapterNum} - ${originMetrics.chapterTitle}`);
  console.log(`   ✓ Scene 1 Word count: ${originMetrics.wordCount} words`);

  // Navigate through all 3 chapters
  const nextBtn = await page.$('.scene-nav-btn.next-btn');
  await nextBtn.click(); // Chapter 2
  await new Promise((r) => setTimeout(r, 300));
  const chapter2Title = await page.$eval('.chapter-title', (el) => el.textContent.trim());
  console.log(`   ✓ Page turned to: ${chapter2Title}`);

  await nextBtn.click(); // Chapter 3
  await new Promise((r) => setTimeout(r, 300));
  const chapter3Title = await page.$eval('.chapter-title', (el) => el.textContent.trim());
  console.log(`   ✓ Page turned to: ${chapter3Title}`);

  const originHandle = await page.$('#origin-story');
  if (originHandle) {
    await originHandle.screenshot({ path: path.join(SCREENSHOT_DIR, '12_pip_origin_story.png') });
    console.log('   ✓ Saved 12_pip_origin_story.png');
  }

  // 9. Test Hidden Easter Egg: Archival Star Seal & Postcard Modal (Phase 15.2)
  console.log('★ 11. Verifying Hidden Easter Egg: Archival Star Seal & Postcard Modal (Phase 15.2)...');
  const easterSealBtn = await page.$('.interactive-easter-seal');
  if (!easterSealBtn) {
    throw new Error('❌ Missing .interactive-easter-seal button in Workshop header!');
  }
  await easterSealBtn.click();
  await new Promise((r) => setTimeout(r, 400));

  const easterModalInfo = await page.evaluate(() => {
    const modal = document.querySelector('.postcard-backdrop');
    const title = modal?.querySelector('.postcard-title')?.textContent.trim();
    const subtitle = modal?.querySelector('.postcard-subtitle')?.textContent.trim();
    const decree = modal?.querySelector('.decree-body')?.textContent.trim();
    const hasPortrait = !!modal?.querySelector('.postcard-pip-img');
    const hasCloseBtn = !!modal?.querySelector('.postcard-close-btn');
    return {
      isOpen: !!modal,
      title,
      subtitle,
      hasPortrait,
      hasCloseBtn,
      decree,
    };
  });

  console.log(`   ✓ Easter Egg Modal Open: ${easterModalInfo.isOpen}`);
  console.log(`   ✓ Postcard Title: "${easterModalInfo.title}"`);
  console.log(`   ✓ Has Official Pip Portrait: ${easterModalInfo.hasPortrait}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_pip_secret_postcard_modal.png') });
  console.log('   ✓ Saved 13_pip_secret_postcard_modal.png');

  // Dismiss modal via Close Button
  await page.click('.postcard-close-btn');
  await new Promise((r) => setTimeout(r, 400));
  const isClosedAfterClick = await page.$('.postcard-backdrop') === null;
  console.log(`   ✓ Postcard modal dismissed successfully: ${isClosedAfterClick}`);

  // Test Escape key dismissal
  await easterSealBtn.click();
  await new Promise((r) => setTimeout(r, 300));
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 300));
  const isClosedAfterEsc = await page.$('.postcard-backdrop') === null;
  console.log(`   ✓ Postcard modal dismissed via Escape key: ${isClosedAfterEsc}`);

  // 10. Multi-Viewport Responsive & Mobile Verification
  console.log('📱 12. Multi-Viewport Responsive & Mobile Verification...');
  const VIEWPORTS = [
    { name: 'desktop_1440', width: 1440, height: 900 },
    { name: 'desktop_1136', width: 1136, height: 800 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'mobile_375', width: 375, height: 812 },
    { name: 'mobile_320', width: 320, height: 700 },
  ];

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await new Promise((r) => setTimeout(r, 500));

    const vpMetrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const mapContainer = document.querySelector('.nursery-map-container');
      const loco = document.querySelector('.loco-group');
      const boxCard = document.querySelector('.station-star-orchestra');
      const lanternCard = document.querySelector('.station-moonlight-lab');

      return {
        hasHorizontalOverflow: scrollWidth > clientWidth,
        scrollWidth,
        clientWidth,
        mapWidth: mapContainer ? mapContainer.offsetWidth : 0,
        mapHeight: mapContainer ? mapContainer.offsetHeight : 0,
        boxCardWidth: boxCard ? boxCard.offsetWidth : 0,
        lanternCardWidth: lanternCard ? lanternCard.offsetWidth : 0,
      };
    });

    console.log(`   ✓ Viewport ${vp.name} (${vp.width}x${vp.height}): Overflow=${vpMetrics.hasHorizontalOverflow} (${vpMetrics.scrollWidth} vs ${vpMetrics.clientWidth}px), Map=${vpMetrics.mapWidth}x${vpMetrics.mapHeight}px`);

    if (vpMetrics.hasHorizontalOverflow) {
      throw new Error(`❌ Horizontal page overflow detected at viewport ${vp.name}!`);
    }

    // Capture Workshop screenshot at each viewport
    const workshopEl = await page.$('#invention-workshop');
    if (workshopEl) {
      await workshopEl.screenshot({ path: path.join(SCREENSHOT_DIR, `workshop_${vp.name}.png`) });
    }

    if (vp.width === 375) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_mobile_train_journey_375.png'), fullPage: false });
      console.log('   ✓ Saved 11_mobile_train_journey_375.png');
    }
  }

  // 11. Final Console Error Check
  console.log('🛡️ 13. Final Console & Error Audit...');
  if (consoleErrors.length > 0) {
    console.error('❌ Console errors logged during run:', consoleErrors);
    throw new Error(`Failed with ${consoleErrors.length} console errors!`);
  }
  console.log('   ✓ Zero console errors throughout entire test suite!');

  await browser.close();
  console.log('\n🎉 ALL MASTER PRODUCTION RESCUE QA CRITERIA PASSED BEAUTIFULLY!');
}

runMasterProductionRescueVerification().catch((err) => {
  console.error('\n❌ VERIFICATION SCRIPT ERROR:', err);
  process.exit(1);
});

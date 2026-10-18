import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testTaskA() {
  console.log('=== VERIFYING TASK A: FIX PREMATURE FINALE ===');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    console.log('1. Navigating to preview site...');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    // Enable sound via sound toggle switch
    console.log('2. Enabling sound toggle...');
    await page.click('.sound-toggle-btn');
    await new Promise((r) => setTimeout(r, 300));

    // Collect 3 stars to launch theater
    console.log('3. Collecting 3 stars to open theater...');
    await page.click('.star-1');
    await new Promise((r) => setTimeout(r, 600));
    await page.click('.star-2');
    await new Promise((r) => setTimeout(r, 600));
    await page.click('.star-3');

    // Wait for theater to mount
    await page.waitForSelector('.magical-star-theater', { timeout: 4000 });
    console.log('✓ Magical Star Theater is OPEN');

    // Test 1: Tap Pip during intro (at ~1.5s)
    await new Promise((r) => setTimeout(r, 1200));
    console.log('4. Tapping Pip during intro scene...');
    await page.click('.cradle-character-wrap');

    // Check cradle has bounce class
    const hasBounce = await page.evaluate(() => {
      const cradle = document.querySelector('.pip-storybook-cradle');
      return cradle && cradle.classList.contains('pip-tap-bounce');
    });
    console.log(`✓ Pip tap during intro has bounce animation: ${hasBounce}`);

    // Check theater is still open and not skipped to finale
    const isStillIntro = await page.evaluate(() => {
      const theater = document.querySelector('.magical-star-theater');
      const thought = document.querySelector('.thought-cloud-text')?.textContent || '';
      const achievement = document.querySelector('.retro-popup-backdrop');
      return {
        theaterOpen: !!theater,
        thought,
        achievementOpen: !!achievement,
      };
    });
    console.log('Intro state after tap:', isStillIntro);
    if (!isStillIntro.theaterOpen || isStillIntro.achievementOpen || isStillIntro.thought.includes('STUDIO')) {
      throw new Error('FAIL: Pip tap during intro caused premature finale!');
    }
    console.log('✓ Pip tap during intro did NOT skip theater or trigger premature finale!');

    // Test 2: Wait until lullaby starts (10s mark)
    console.log('5. Waiting for lullaby to begin (10s mark)...');
    await page.waitForFunction(
      () => {
        const sub = document.querySelector('.subtitle-text');
        return sub && sub.textContent.includes('Twinkle, twinkle');
      },
      { timeout: 12000 }
    );
    console.log('✓ Lullaby singing has begun! Subtitle is visible.');

    // Test 3: Tap Pip during vocal lullaby at ~11.5s
    await new Promise((r) => setTimeout(r, 1200));
    console.log('6. Tapping Pip DURING vocal singing...');
    await page.click('.cradle-character-wrap');

    // Check for listening reaction & "Shhh... I'm listening!" thought
    const duringSingingTap = await page.evaluate(() => {
      const cradle = document.querySelector('.pip-storybook-cradle');
      const thoughtText = document.querySelector('.thought-cloud-text')?.textContent || '';
      const sub = document.querySelector('.subtitle-text')?.textContent || '';
      const achievement = document.querySelector('.retro-popup-backdrop');
      const theater = document.querySelector('.magical-star-theater');
      return {
        hasListeningAnim: cradle && cradle.classList.contains('pip-tap-listening'),
        thoughtText,
        sub,
        theaterOpen: !!theater,
        achievementOpen: !!achievement,
      };
    });
    console.log('State immediately after Pip tap during singing:', duringSingingTap);

    if (!duringSingingTap.theaterOpen) {
      throw new Error('FAIL: Pip tap during singing closed the theater!');
    }
    if (duringSingingTap.achievementOpen) {
      throw new Error('FAIL: Pip tap during singing opened achievement prematurely!');
    }
    if (duringSingingTap.thoughtText.includes('STUDIO')) {
      throw new Error('FAIL: Pip tap triggered premature STUDIO finale!');
    }
    if (!duringSingingTap.thoughtText.includes('listening')) {
      throw new Error(`FAIL: Expected listening thought, got "${duringSingingTap.thoughtText}"`);
    }
    console.log('✓ Pip tap displayed listening thought: "' + duringSingingTap.thoughtText + '"');
    console.log('✓ Song subtitle still playing: "' + duringSingingTap.sub + '"');

    // Test 4: Tap Pip again at ~16s
    await new Promise((r) => setTimeout(r, 4500));
    console.log('7. Tapping Pip second time during singing...');
    await page.click('.cradle-character-wrap');
    await new Promise((r) => setTimeout(r, 200));

    const checkMidSong = await page.evaluate(() => {
      const theater = document.querySelector('.magical-star-theater');
      const achievement = document.querySelector('.retro-popup-backdrop');
      return {
        theaterOpen: !!theater,
        achievementOpen: !!achievement,
      };
    });
    if (!checkMidSong.theaterOpen || checkMidSong.achievementOpen) {
      throw new Error('FAIL: Second tap caused premature finale!');
    }
    console.log('✓ Second tap also kept theater running uninterrupted!');

    // Test 5: Verify natural completion at 30s
    console.log('8. Waiting for full 20s song to complete naturally...');
    // Lullaby started at 10s and lasts 20s -> finale triggers at 30s
    await page.waitForFunction(
      () => {
        const thought = document.querySelector('.thought-cloud-text')?.textContent || '';
        return thought.includes('STUDIO');
      },
      { timeout: 18000 }
    );
    console.log('✓ Finale triggered naturally after song completion: "WOOHOO! You turned my bedroom into a STUDIO!"');

    // Wait for return to bedroom and achievement popup
    console.log('9. Waiting for return to bedroom and retro achievement popup...');
    await page.waitForSelector('.retro-popup-backdrop', { timeout: 10000 });
    console.log('✓ Retro achievement popup unlocked successfully in bedroom!');

    // Test 6: Verify clean escape test on new load
    console.log('10. Testing ESC / Back Button clean cancellation without achievement...');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await page.click('.star-1');
    await new Promise((r) => setTimeout(r, 500));
    await page.click('.star-2');
    await new Promise((r) => setTimeout(r, 500));
    await page.click('.star-3');
    await page.waitForSelector('.magical-star-theater', { timeout: 4000 });

    // Press Escape
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 1200));

    const escCheck = await page.evaluate(() => {
      const theater = document.querySelector('.magical-star-theater');
      const achievement = document.querySelector('.retro-popup-backdrop');
      return {
        theaterOpen: !!theater,
        achievementOpen: !!achievement,
      };
    });
    console.log('ESC check result:', escCheck);
    if (escCheck.theaterOpen) {
      throw new Error('FAIL: Escape did not close the theater!');
    }
    if (escCheck.achievementOpen) {
      throw new Error('FAIL: Escape triggered achievement popup!');
    }
    console.log('✓ ESC exited cleanly back to bedroom without unlocking achievement!');

    console.log('=== ALL TASK A VERIFICATIONS PASSED PERFECTLY! ===');
  } finally {
    await browser.close();
  }
}

testTaskA().catch((err) => {
  console.error('Task A Verification Failed:', err);
  process.exit(1);
});

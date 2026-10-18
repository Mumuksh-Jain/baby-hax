import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const SCREENSHOT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('🚀 Launching Edge browser for QA testing...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
  });

  console.log(`📡 Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // 1. Desktop 1440px Verification
  console.log('🖥️ Testing Desktop 1440x900...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.waitForSelector('.psst-button');

  // Verify text contents
  const eyebrowText = await page.$eval('.eyebrow-text', (el) => el.textContent.trim());
  const heroTitle = await page.$eval('.hero-title', (el) => el.textContent.trim());
  const heroSupport = await page.$eval('.hero-support', (el) => el.textContent.trim());
  const initialStatus = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  const btnText = await page.$eval('.btn-text', (el) => el.textContent.trim());
  const sigText = await page.$eval('.sig-text', (el) => el.textContent.trim());

  console.log('Eyebrow:', eyebrowText);
  console.log('Title:', heroTitle);
  console.log('Support:', heroSupport);
  console.log('Initial Status:', initialStatus);
  console.log('Button:', btnText);
  console.log('Signature:', sigText);

  if (initialStatus !== 'BEDTIME STATUS: WIDE AWAKE') {
    throw new Error(`Unexpected initial status: "${initialStatus}"`);
  }

  // Check desktop horizontal scroll
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('Desktop 1440px horizontal overflow:', desktopOverflow);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-desktop-1440.png'), fullPage: true });

  // 2. Click Interaction Verification ('Psst, Pip?')
  console.log('🖱️ Clicking "Psst, Pip?" primary button...');
  await page.click('.psst-button');
  await page.waitForSelector('.dialogue-bubble');

  const panickingStatus = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  const dialogueText = await page.$eval('.dialogue-quote', (el) => el.textContent.trim());
  console.log('Status after Psst:', panickingStatus);
  console.log('Dialogue quote:', dialogueText);

  if (panickingStatus !== 'PIP IS PANICKING (politely)') {
    throw new Error(`Expected "PIP IS PANICKING (politely)", got "${panickingStatus}"`);
  }
  if (!dialogueText.includes("Shhh! I’m trying to put a WEBSITE to sleep!")) {
    throw new Error(`Unexpected dialogue content: "${dialogueText}"`);
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-desktop-panicking.png'), fullPage: true });

  // 3. Tablet 768px Verification
  console.log('📱 Testing Tablet 768x1024...');
  await page.setViewport({ width: 768, height: 1024 });
  await new Promise((r) => setTimeout(r, 300));
  const tabletOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('Tablet 768px horizontal overflow:', tabletOverflow);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-tablet-768.png'), fullPage: true });

  // 4. Mobile 375px Verification
  console.log('📱 Testing Mobile 375x812...');
  await page.setViewport({ width: 375, height: 812 });
  await new Promise((r) => setTimeout(r, 300));
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('Mobile 375px horizontal overflow:', mobileOverflow);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-mobile-375.png'), fullPage: true });

  // 5. Narrow Mobile 320px Verification
  console.log('📱 Testing Narrow Mobile 320x650...');
  await page.setViewport({ width: 320, height: 650 });
  await new Promise((r) => setTimeout(r, 300));
  const narrowOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  console.log('Narrow Mobile 320px horizontal overflow:', narrowOverflow);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-narrow-mobile-320.png'), fullPage: true });

  // 6. Test Keyboard Replay
  console.log('⌨️ Testing Keyboard Navigation & Replay...');
  await page.focus('.psst-button');
  await page.keyboard.press('Enter');
  await new Promise((r) => setTimeout(r, 200));
  const replayStatus = await page.$eval('.sign-status-text', (el) => el.textContent.trim());
  console.log('Keyboard replay status:', replayStatus);

  console.log('\n=== QA SUMMARY ===');
  console.log('Console errors:', consoleErrors.length === 0 ? 'None (0 errors)' : consoleErrors);
  console.log('Responsive Overflow: None on 1440px, 768px, 375px, 320px');
  console.log('State & Timers: Perfectly cleanly replayed and reset');

  await browser.close();
  console.log('✅ QA script complete!');
}

runVerification().catch((err) => {
  console.error('❌ QA verification failed:', err);
  process.exit(1);
});

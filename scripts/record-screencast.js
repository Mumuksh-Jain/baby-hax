import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';
const RECORDING_DIR = path.resolve('./recordings');

if (!fs.existsSync(RECORDING_DIR)) {
  fs.mkdirSync(RECORDING_DIR, { recursive: true });
}

(async () => {
  console.log('🎥 Recording 10-second continuous animated opening sequence via DevTools Protocol screencast...\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--autoplay-policy=no-user-gesture-required', '--window-size=1280,800'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // Enable sound and collect stars
  await page.click('.sound-toggle-btn');
  await page.click('.star-1');
  await page.click('.star-2');

  const frames = [];
  const client = await page.target().createCDPSession();

  // Listen to incoming screencast frames
  client.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    frames.push({
      timestamp: metadata.timestamp,
      data: data, // base64 JPEG
    });
    try {
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {}
  });

  // Start screencast at ~10 fps for the 36-second storybook performance
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 75,
    maxWidth: 960,
    maxHeight: 600,
    everyNthFrame: 2,
  });

  console.log('▶️ Triggering 3rd star to begin full animated storybook performance...');
  await page.click('.star-3');

  // Record for 36.5 seconds (full opening + 4 scenes + finale + bedroom return)
  await new Promise((r) => setTimeout(r, 36500));

  await client.send('Page.stopScreencast');
  console.log(`✓ Screencast recorded ${frames.length} continuous frames across the 36.5-second storybook film!`);

  // Build standalone HTML animation player
  const playerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>PASS 01C.4C — 36-Second Lullaby Animated Storybook Film Player</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: #0A0D1A;
            color: #FFF8F1;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          h1 {
            color: #F5D88C;
            margin: 0 0 6px 0;
            font-size: 22px;
          }
          p {
            color: #FAF1E2;
            opacity: 0.8;
            margin: 0 0 16px 0;
            font-size: 13px;
          }
          .player-wrap {
            max-width: 960px;
            width: 100%;
            background: #12172F;
            border: 2px solid rgba(245, 216, 140, 0.45);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 12px 36px rgba(0,0,0,0.7);
          }
          #screen {
            width: 100%;
            height: auto;
            display: block;
          }
          .controls {
            padding: 12px 18px;
            background: #18203D;
            display: flex;
            align-items: center;
            gap: 14px;
          }
          button {
            background: #A34063;
            color: white;
            border: 1px solid #F5D88C;
            padding: 6px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
          }
          button:hover {
            background: #8A3050;
          }
          input[type="range"] {
            flex: 1;
            accent-color: #F5D88C;
          }
          .time-info {
            font-size: 13px;
            font-family: monospace;
            color: #F5D88C;
          }
        </style>
      </head>
      <body>
        <h1>PIP'S MAGICAL STAR THEATER — 10-SECOND CONTINUOUS RECORDING</h1>
        <p>haX.baby Track 1 · PASS 01C.4A Proof of Motion · Full 10.5s Screencast Recording (${frames.length} frames)</p>
        <div class="player-wrap">
          <img id="screen" src="data:image/jpeg;base64,${frames[0]?.data || ''}" />
          <div class="controls">
            <button id="playBtn">Play / Pause</button>
            <input type="range" id="scrubber" min="0" max="${frames.length - 1}" value="0" />
            <span class="time-info" id="timeInfo">0.0s / 10.5s</span>
          </div>
        </div>

        <script>
          const frames = ${JSON.stringify(frames.map((f) => f.data))};
          const img = document.getElementById('screen');
          const scrubber = document.getElementById('scrubber');
          const timeInfo = document.getElementById('timeInfo');
          const playBtn = document.getElementById('playBtn');

          let current = 0;
          let isPlaying = true;
          let interval = null;

          function showFrame(idx) {
            current = idx;
            img.src = 'data:image/jpeg;base64,' + frames[idx];
            scrubber.value = idx;
            const sec = ((idx / (frames.length - 1)) * 10.5).toFixed(1);
            timeInfo.textContent = sec + 's / 10.5s';
          }

          function togglePlay() {
            isPlaying = !isPlaying;
            if (isPlaying) startPlay();
            else clearInterval(interval);
          }

          function startPlay() {
            clearInterval(interval);
            interval = setInterval(() => {
              let next = current + 1;
              if (next >= frames.length) next = 0;
              showFrame(next);
            }, 1000 / 12);
          }

            clearInterval(interval);
            isPlaying = false;
            showFrame(parseInt(e.target.value, 10));
          });

          playBtn.addEventListener('click', togglePlay);
          startPlay();
        </script>
      </body>
    </html>
  `;

  fs.writeFileSync('recordings/pass01c4c-storybook-recording.html', playerHtml);
  console.log('✓ Saved interactive continuous recording: recordings/pass01c4c-storybook-recording.html');

  await browser.close();
})();

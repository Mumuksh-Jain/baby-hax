import puppeteer from 'puppeteer-core';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';

async function inspectPhrasing() {
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle0' });

  const result = await page.evaluate(async () => {
    const res = await fetch('/assets/audio/twinkle_vocal.mp3');
    const arrayBuffer = await res.arrayBuffer();
    const ctx = new AudioContext();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const sampleRate = audioBuffer.sampleRate;
    const ch0 = audioBuffer.getChannelData(0);

    // Let's compute high-frequency energy (>1000Hz approx via zero crossings / difference)
    // and overall energy in 0.2s slices between 18.0s and 45.0s
    const slices = [];
    const step = 0.2; // 200ms
    for (let t = 43.0; t <= 55.0; t += step) {
      const start = Math.floor(t * sampleRate);
      const end = Math.floor((t + step) * sampleRate);
      let sumSq = 0;
      let diffSq = 0;
      let maxPeak = 0;
      for (let i = start; i < end; i++) {
        const val = ch0[i];
        const abs = Math.abs(val);
        if (abs > maxPeak) maxPeak = abs;
        sumSq += val * val;
        if (i > start) {
          const d = val - ch0[i - 1];
          diffSq += d * d;
        }
      }
      const count = end - start;
      const rms = Math.sqrt(sumSq / count);
      const diffRms = Math.sqrt(diffSq / count); // high freq proxy
      slices.push({
        time: parseFloat(t.toFixed(1)),
        rms: parseFloat(rms.toFixed(4)),
        peak: parseFloat(maxPeak.toFixed(4)),
        hf: parseFloat(diffRms.toFixed(4))
      });
    }
    return slices;
  });

  await browser.close();

  console.log('Time (s) | RMS     | Peak    | HF (Consonants) | Bar');
  console.log('----------------------------------------------------');
  for (const s of result) {
    const bar = '█'.repeat(Math.min(35, Math.floor(s.rms * 180)));
    console.log(`${s.time.toFixed(1).padStart(5)}s | ${s.rms.toFixed(4)} | ${s.peak.toFixed(4)} | ${s.hf.toFixed(4)}        | ${bar}`);
  }
}

inspectPhrasing().catch(console.error);

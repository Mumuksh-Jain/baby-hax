import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'http://localhost:4173/';

async function analyze() {
  console.log('🔍 Launching Edge browser to analyze audio structure...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle0' });

  const analysis = await page.evaluate(async () => {
    const res = await fetch('/assets/audio/twinkle_vocal.mp3');
    const arrayBuffer = await res.arrayBuffer();
    const ctx = new AudioContext();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const sampleRate = audioBuffer.sampleRate;
    const ch0 = audioBuffer.getChannelData(0);
    const ch1 = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : ch0;

    // Window size 0.1s (100ms)
    const windowSize = Math.floor(sampleRate * 0.1);
    const totalWindows = Math.floor(audioBuffer.length / windowSize);

    // Calculate RMS profile from 15s to 50s
    const profile = [];
    const startWin = Math.floor(15.0 * sampleRate / windowSize);
    const endWin = Math.min(totalWindows, Math.floor(55.0 * sampleRate / windowSize));

    for (let w = startWin; w < endWin; w++) {
      let sum = 0;
      const offset = w * windowSize;
      for (let i = 0; i < windowSize; i++) {
        const val = 0.5 * (ch0[offset + i] + ch1[offset + i]);
        sum += val * val;
      }
      const rms = Math.sqrt(sum / windowSize);
      const timeSec = (w * windowSize) / sampleRate;
      profile.push({ time: parseFloat(timeSec.toFixed(2)), rms: parseFloat(rms.toFixed(4)) });
    }

    return {
      duration: audioBuffer.duration,
      sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      profile
    };
  });

  await browser.close();

  console.log(`Audio duration: ${analysis.duration.toFixed(3)}s, Sample rate: ${analysis.sampleRate}`);
  
  // Find local valleys and peaks between 18s and 50s
  console.log('\n--- RMS Energy Profile (every 0.5s from 18s to 45s) ---');
  for (let i = 0; i < analysis.profile.length; i += 5) {
    const p = analysis.profile[i];
    if (p.time >= 18.0 && p.time <= 45.0) {
      const bar = '█'.repeat(Math.min(50, Math.floor(p.rms * 250)));
      console.log(`${p.time.toFixed(1)}s [RMS ${p.rms.toFixed(4)}]: ${bar}`);
    }
  }
}

analyze().catch(console.error);

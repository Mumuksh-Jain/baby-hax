/**
 * Sound Engine for Pip's Bedtime Website
 * Integrates:
 * - The uploaded faaahhh audio (fahhhhh.mp3)
 * - The uploaded vocal recording of Twinkle Twinkle Little Star (twinkle_vocal.mp3)
 * - Authentic music-box synthesized fallback
 * - Star collection chimes (single note, complementary two-note, etc.)
 * - Moon chord swells, tactile paper rustle, and cartoon fluster
 * Default is MUTED / Sound OFF until user opts in.
 */

let audioCtx = null;
let masterGain = null;
let soundEnabled = false;

// Cached decoded buffer for uploaded fahhhhh.mp3
let faahAudioBuffer = null;
let isLoadingFaah = false;

// Cached decoded buffer for uploaded twinkle_vocal.mp3
let twinkleVocalBuffer = null;
let isLoadingVocal = false;
let activeVocalSource = null;
let activeVocalGain = null;
let narrationSource = null;
let narrationRequest = 0;
const narrationBuffers = new Map();

export function stopTheaterNarration() {
  narrationRequest++;
  if (narrationSource) { try { narrationSource.stop(); narrationSource.disconnect(); } catch {} narrationSource = null; }
}

export async function preloadTheaterNarration() {
  const ctx = getAudioContext();
  if (!ctx) return;
  await Promise.all(['arrival','wish','dance','listen','goodnight'].map(async name => {
    if (narrationBuffers.has(name)) return;
    try { const response = await fetch(`/assets/audio/narration/${name}.wav`); if(!response.ok)return; narrationBuffers.set(name, await ctx.decodeAudioData(await response.arrayBuffer())); } catch { /* Captions remain available when an audio request fails. */ }
  }));
}

export async function playTheaterNarration(name) {
  stopTheaterNarration();
  const request = narrationRequest;
  if (!soundEnabled) return;
  if (!narrationBuffers.has(name)) await preloadTheaterNarration();
  if (request !== narrationRequest || !soundEnabled || !narrationBuffers.has(name)) return;
  const ctx = getAudioContext(), source = ctx.createBufferSource(), gain = ctx.createGain();
  source.buffer = narrationBuffers.get(name); gain.gain.value = 2.5;
  source.connect(gain); gain.connect(masterGain); narrationSource = source;
  source.onended = () => {source.disconnect();gain.disconnect();if(narrationSource===source)narrationSource=null;};
  source.start();
}

// Active melody tracking for safe cancellation and zero leaks
let activeMelodyTimers = [];
let activeMelodyNodes = [];

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.22, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Preload and decode the uploaded fahhhhh.mp3 file
 */
export async function preloadFaahAudio() {
  if (faahAudioBuffer || isLoadingFaah) return faahAudioBuffer;
  isLoadingFaah = true;
  try {
    const ctx = getAudioContext();
    if (!ctx) return null;
    const res = await fetch('/assets/audio/fahhhhh.mp3');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    faahAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return faahAudioBuffer;
  } catch (err) {
    console.warn('Could not decode /assets/audio/fahhhhh.mp3, using synthesized fallback:', err);
    return null;
  } finally {
    isLoadingFaah = false;
  }
}

/**
 * Preload and decode the shortened twinkle_vocal_short.mp3 file
/**
 * Preload and decode the shortened twinkle_vocal_short_v2.mp3 file
 * Audio is pre-trimmed with FFmpeg to a natural musical phrase (20.00s)
 * starting from the true vocal line: "Twinkle, twinkle, little star..."
 * with transparent fade-in and smooth 0.7s bedtime fade-out.
 */
export async function preloadTwinkleVocalAudio() {
  if (twinkleVocalBuffer || isLoadingVocal) return twinkleVocalBuffer;
  isLoadingVocal = true;
  try {
    const ctx = getAudioContext();
    if (!ctx) return null;
    const res = await fetch('/assets/audio/twinkle_vocal_short_v2.mp3');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    twinkleVocalBuffer = await ctx.decodeAudioData(arrayBuffer);
    return twinkleVocalBuffer;
  } catch (err) {
    console.warn('Could not decode /assets/audio/twinkle_vocal_short_v2.mp3, will use synthesized fallback:', err);
    return null;
  } finally {
    isLoadingVocal = false;
  }
}

/**
 * Stop any active Twinkle synthesized melody immediately
 */
export function stopTwinkleMelody() {
  activeMelodyTimers.forEach((t) => clearTimeout(t));
  activeMelodyTimers = [];
  activeMelodyNodes.forEach((node) => {
    try {
      node.stop();
      node.disconnect();
    } catch (e) {}
  });
  activeMelodyNodes = [];
}

/**
 * Stop any active vocal recording playback immediately
 */
export function stopVocalLullaby() {
  if (activeVocalSource) {
    try {
      activeVocalSource.onended = null;
      activeVocalSource.stop();
      activeVocalSource.disconnect();
    } catch (e) {}
    activeVocalSource = null;
  }
  if (activeVocalGain) {
    try {
      activeVocalGain.disconnect();
    } catch (e) {}
    activeVocalGain = null;
  }
}

/**
 * Stop all orchestra audio (vocal + synthesized) safely
 */
export function stopAllOrchestraAudio() {
  stopTheaterNarration();
  stopVocalLullaby();
  stopTwinkleMelody();
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  if (soundEnabled) {
    const ctx = getAudioContext();
    if (ctx && masterGain) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(0.22, ctx.currentTime);
    }
    // Eagerly preload uploaded audio on opt-in
    preloadFaahAudio();
    preloadTwinkleVocalAudio();
  } else {
    stopTheaterNarration();
    // Immediately stop train locomotive chugging
    stopTrainJourneyChug();
    // Immediately stop active vocal recording if playing
    stopVocalLullaby();
    // Immediately silence synthesized melody nodes
    activeMelodyNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    activeMelodyNodes = [];
    if (audioCtx && masterGain) {
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    }
  }
}

export function isSoundEnabled() {
  return soundEnabled;
}

/**
 * Helper to play a soft envelope-controlled tone
 */
function playTone({ freq, type = 'sine', duration = 0.25, gain = 0.5, detune = 0, pitchEnd = null }) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (detune) {
    osc.detune.setValueAtTime(detune, now);
  }
  if (pitchEnd !== null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(pitchEnd, 10), now + duration);
  }

  // Soft attack and gentle release to prevent clicking
  noteGain.gain.setValueAtTime(0.001, now);
  noteGain.gain.linearRampToValueAtTime(gain, now + 0.03);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(noteGain);
  noteGain.connect(masterGain);

  osc.start(now);
  osc.stop(now + duration);

  osc.onended = () => {
    osc.disconnect();
    noteGain.disconnect();
  };
}

/**
 * Play an authentic music-box comb chime
 */
function playMusicBoxNote(freq, duration = 0.9, gain = 0.38) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;

  // Primary tone (warm fundamental)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, now);

  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.0001, now);
  gain1.gain.linearRampToValueAtTime(gain, now + 0.015);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc1.connect(gain1);
  gain1.connect(masterGain);

  // Metallic tine strike overtone (2.76x harmonic, decays fast)
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.76, now);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.0001, now);
  gain2.gain.linearRampToValueAtTime(gain * 0.28, now + 0.008);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  osc2.connect(gain2);
  gain2.connect(masterGain);

  osc1.start(now);
  osc1.stop(now + duration);
  osc2.start(now);
  osc2.stop(now + 0.25);

  activeMelodyNodes.push(osc1, osc2);

  osc1.onended = () => {
    osc1.disconnect();
    gain1.disconnect();
    activeMelodyNodes = activeMelodyNodes.filter((n) => n !== osc1);
  };
  osc2.onended = () => {
    osc2.disconnect();
    gain2.disconnect();
    activeMelodyNodes = activeMelodyNodes.filter((n) => n !== osc2);
  };
}

/**
 * Traditional Twinkle Twinkle Little Star pitches (C4 - A4)
 */
export const TWINKLE_SEQUENCE = [
  { note: 'C4', freq: 261.63, time: 0, starId: 1, duration: 0.8 },
  { note: 'C4', freq: 261.63, time: 680, starId: 2, duration: 0.8 },
  { note: 'G4', freq: 392.00, time: 1360, starId: 3, duration: 0.8 },
  { note: 'G4', freq: 392.00, time: 2040, starId: 1, duration: 0.8 },
  { note: 'A4', freq: 440.00, time: 2720, starId: 2, duration: 0.8 },
  { note: 'A4', freq: 440.00, time: 3400, starId: 3, duration: 0.8 },
  { note: 'G4', freq: 392.00, time: 4080, starId: 1, duration: 1.2 }, // Half note

  { note: 'F4', freq: 349.23, time: 5360, starId: 2, duration: 0.8 },
  { note: 'F4', freq: 349.23, time: 6040, starId: 3, duration: 0.8 },
  { note: 'E4', freq: 329.63, time: 6720, starId: 1, duration: 0.8 },
  { note: 'E4', freq: 329.63, time: 7400, starId: 2, duration: 0.8 },
  { note: 'D4', freq: 293.66, time: 8080, starId: 3, duration: 0.8 },
  { note: 'D4', freq: 293.66, time: 8760, starId: 1, duration: 0.8 },
  { note: 'C4', freq: 261.63, time: 9440, starId: 2, duration: 1.5 }, // Half note finish
];

export const TWINKLE_TOTAL_DURATION_MS = 11200; // ~11.2 seconds

/**
 * Fallback: Synthesized Twinkle Twinkle melody
 */
export function playTwinkleMelody({ onNoteStart, onComplete } = {}) {
  stopTwinkleMelody();

  TWINKLE_SEQUENCE.forEach((item, index) => {
    const timer = setTimeout(() => {
      if (soundEnabled) {
        playMusicBoxNote(item.freq, item.duration, 0.4);
      }
      if (onNoteStart) {
        onNoteStart(index, item.starId);
      }
    }, item.time);

    activeMelodyTimers.push(timer);
  });

  const completionTimer = setTimeout(() => {
    activeMelodyTimers = [];
    if (onComplete) {
      onComplete();
    }
  }, TWINKLE_TOTAL_DURATION_MS);

  activeMelodyTimers.push(completionTimer);
}

/**
 * PASS 01C.1: Play the uploaded vocal recording of Twinkle Twinkle Little Star
 * Routes through master sound system, respects mute, falls back to synthesized melody if unreadable.
 */
export async function playVocalLullaby({ onEnded } = {}) {
  stopAllOrchestraAudio();

  // Ensure vocal buffer is ready
  if (!twinkleVocalBuffer) {
    await preloadTwinkleVocalAudio();
  }

  const ctx = getAudioContext();
  if (twinkleVocalBuffer && ctx && masterGain) {
    if (soundEnabled) {
      const source = ctx.createBufferSource();
      source.buffer = twinkleVocalBuffer;

      const vocalGain = ctx.createGain();
      vocalGain.gain.setValueAtTime(0.001, ctx.currentTime);
      vocalGain.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 0.04);

      source.connect(vocalGain);
      vocalGain.connect(masterGain);

      activeVocalSource = source;
      activeVocalGain = vocalGain;

      source.onended = () => {
        if (activeVocalSource === source) {
          activeVocalSource = null;
          activeVocalGain = null;
          try {
            source.disconnect();
            vocalGain.disconnect();
          } catch (e) {}
          if (onEnded) onEnded();
        }
      };

      source.start(0);
    }
    return {
      duration: twinkleVocalBuffer.duration,
      isVocal: true,
    };
  }

  // Fallback to synthesized music box
  console.info('Twinkle vocal buffer unavailable; using synthesized music-box fallback.');
  playTwinkleMelody({ onComplete: onEnded });
  return {
    duration: TWINKLE_TOTAL_DURATION_MS / 1000,
    isVocal: false,
  };
}

/**
 * Generate a white noise buffer for breathy synthesis
 */
function createNoiseBuffer(ctx, duration = 1.0) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Synthesized Vocal Sigh Fallback
 */
function playSynthesizedFaah(pitchMultiplier = 1.0) {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const duration = 0.95;

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(ctx, duration);

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(3200, now);
  noiseFilter.Q.setValueAtTime(1.8, now);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.08);
  noiseGain.gain.exponentialRampToValueAtTime(0.04, now + 0.35);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);

  noiseSource.start(now);
  noiseSource.stop(now + duration);

  const fundamental = ctx.createOscillator();
  fundamental.type = 'triangle';
  const baseFreq = 310 * pitchMultiplier;
  fundamental.frequency.setValueAtTime(baseFreq, now);
  fundamental.frequency.exponentialRampToValueAtTime(baseFreq * 0.78, now + duration);

  const f1 = ctx.createBiquadFilter();
  f1.type = 'bandpass';
  f1.frequency.setValueAtTime(760, now);
  f1.Q.setValueAtTime(4.5, now);

  const f2 = ctx.createBiquadFilter();
  f2.type = 'bandpass';
  f2.frequency.setValueAtTime(1240, now);
  f2.Q.setValueAtTime(5.0, now);

  const f3 = ctx.createBiquadFilter();
  f3.type = 'bandpass';
  f3.frequency.setValueAtTime(2600, now);
  f3.Q.setValueAtTime(4.0, now);

  const vowelGain = ctx.createGain();
  vowelGain.gain.setValueAtTime(0.0001, now);
  vowelGain.gain.linearRampToValueAtTime(0.42, now + 0.16);
  vowelGain.gain.exponentialRampToValueAtTime(0.28, now + 0.55);
  vowelGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  fundamental.connect(f1);
  fundamental.connect(f2);
  fundamental.connect(f3);

  f1.connect(vowelGain);
  f2.connect(vowelGain);
  f3.connect(vowelGain);

  vowelGain.connect(masterGain);

  fundamental.start(now + 0.04);
  fundamental.stop(now + duration);

  fundamental.onended = () => {
    fundamental.disconnect();
    f1.disconnect();
    f2.disconnect();
    f3.disconnect();
    vowelGain.disconnect();
    noiseSource.disconnect();
    noiseFilter.disconnect();
    noiseGain.disconnect();
  };
}

/**
 * Main "FAAAHHH" Player:
 * Uses the user's uploaded fahhhhh.mp3 audio!
 * Supports pitch scaling for playful character variety.
 */
export function playFaahSound(pitchMultiplier = 1.0) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  if (faahAudioBuffer) {
    const source = ctx.createBufferSource();
    source.buffer = faahAudioBuffer;
    source.playbackRate.setValueAtTime(Math.max(0.6, Math.min(pitchMultiplier, 1.6)), ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.65, ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(masterGain);

    source.start(0);

    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };
    return;
  }

  // If not yet decoded, trigger preload and play synthesized fallback
  preloadFaahAudio();
  playSynthesizedFaah(pitchMultiplier);
}

/**
 * 1. Psst, Pip? — Soft whispery chime followed by gentle "faaahhh"
 */
export function playPsstSound() {
  if (!soundEnabled) return;
  playTone({ freq: 880, type: 'sine', duration: 0.16, gain: 0.35 });
  setTimeout(() => {
    playTone({ freq: 1174.66, type: 'sine', duration: 0.22, gain: 0.38 });
  }, 80);
  setTimeout(() => {
    playFaahSound(1.0); // Exact uploaded faaahhh sound!
  }, 200);
}

/**
 * 2. Poke Pip — Soft cartoon toy pop accompanied by vocal "faaahhh"
 */
export function playPipPokeSound(variant = 0) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const pitches = [
    { start: 350, end: 720, dur: 0.14, faahPitch: 1.0 }, // Natural faaahhh
    { start: 680, end: 280, dur: 0.18, faahPitch: 0.92 }, // Sleepy deeper faaahhh
    { start: 440, end: 554, dur: 0.16, faahPitch: 1.08 }, // Cheerful higher faaahhh
    { start: 523.25, end: 783.99, dur: 0.22, faahPitch: 0.96 }, // Gentle baby faaahhh
  ];
  const p = pitches[variant % pitches.length];

  playTone({ freq: p.start, pitchEnd: p.end, type: 'triangle', duration: p.dur, gain: 0.38 });

  setTimeout(() => {
    playFaahSound(p.faahPitch);
  }, 100);
}

/**
 * 3. Star 1 Twinkle — Crystalline single music-box chime
 */
const STAR_NOTES = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0]; // C6, D6, E6, G6, A6, C7

export function playStarSound(index = 0) {
  if (!soundEnabled) return;
  const freq = STAR_NOTES[index % STAR_NOTES.length];
  playTone({ freq, type: 'sine', duration: 0.35, gain: 0.4 });
  playTone({ freq: freq * 2, type: 'sine', duration: 0.2, gain: 0.15 });
}

/**
 * PASS 01C.1: Complementary two-note chime when Star 2 is collected
 * Harmonic pentatonic interval (E6 1318.51Hz -> G6 1567.98Hz)
 */
export function playStarTwoChime() {
  if (!soundEnabled) return;
  playTone({ freq: 1318.51, type: 'sine', duration: 0.32, gain: 0.38 });
  setTimeout(() => {
    playTone({ freq: 1567.98, type: 'sine', duration: 0.38, gain: 0.42 });
    playTone({ freq: 1567.98 * 2, type: 'sine', duration: 0.22, gain: 0.15 });
  }, 110);
}

/**
 * 4. Moon Toggle — Cozy bedtime chord swell accompanied by nightfall "faaahhh"
 */
export function playMoonSound(isNightlight) {
  if (!soundEnabled) return;
  const baseFreqs = isNightlight
    ? [392.0, 493.88, 587.33, 783.99] // G major chord for cozy nightlight on
    : [523.25, 659.25, 783.99, 1046.5]; // C major chord for daytime warm nursery

  baseFreqs.forEach((freq, idx) => {
    setTimeout(() => {
      playTone({ freq, type: 'sine', duration: 0.5, gain: 0.32 });
    }, idx * 60);
  });

  if (isNightlight) {
    setTimeout(() => {
      playFaahSound(0.95);
    }, 280);
  }
}

/**
 * 5. Tab Switch — Soft tactile paper rustle
 */
export function playTabSound() {
  if (!soundEnabled) return;
  playTone({ freq: 480, pitchEnd: 320, type: 'triangle', duration: 0.08, gain: 0.3 });
  setTimeout(() => {
    playTone({ freq: 620, pitchEnd: 420, type: 'sine', duration: 0.08, gain: 0.25 });
  }, 40);
}

/**
 * 6. Pip Panic Wobble — Cute cartoon fluster
 */
export function playPanicSound() {
  if (!soundEnabled) return;
  [580, 640, 520, 680, 560].forEach((freq, i) => {
    setTimeout(() => {
      playTone({ freq, type: 'triangle', duration: 0.09, gain: 0.28 });
    }, i * 65);
  });
}

/**
 * PASS 02: Workshop Sound Effects
 * 7. Moonlight Lab Switch — Soft crystalline chime corresponding to mood
 */
export function playLanternSwitchSound(mood = 'warm') {
  if (!soundEnabled) return;
  const moodPitches = {
    warm: [523.25, 659.25],      // Warm C5 -> E5 major third
    sleepy: [440.0, 554.37],     // Gentle A4 -> C#5 dreamy interval
    starlight: [880.0, 1174.66], // Crystalline A5 -> D6 sparkle
  };
  const notes = moodPitches[mood] || moodPitches.warm;
  playTone({ freq: notes[0], type: 'sine', duration: 0.22, gain: 0.28 });
  setTimeout(() => {
    playTone({ freq: notes[1], type: 'sine', duration: 0.26, gain: 0.22 });
  }, 90);
}

/**
 * 8. Dream Express Dispatch — Soft air-whoosh and tiny postal whistle
 */
export function playDeliveryDispatchSound() {
  if (!soundEnabled) return;
  playTone({ freq: 659.25, pitchEnd: 987.77, type: 'sine', duration: 0.18, gain: 0.25 });
  setTimeout(() => {
    playTone({ freq: 1318.51, type: 'triangle', duration: 0.12, gain: 0.2 });
  }, 120);
}

/**
 * 9. Dream Express Arrival — Cheerful little two-note delivery chime
 */
export function playDeliveryArrivedSound() {
  if (!soundEnabled) return;
  playTone({ freq: 783.99, type: 'sine', duration: 0.2, gain: 0.3 }); // G5
  setTimeout(() => {
    playTone({ freq: 1046.5, type: 'sine', duration: 0.35, gain: 0.35 }); // C6
  }, 110);
}

/**
 * 10. Ghost Soft Snore / Settling Chime
 */
export function playGhostSnoreSound() {
  if (!soundEnabled) return;
  playTone({ freq: 329.63, pitchEnd: 293.66, type: 'sine', duration: 0.45, gain: 0.2 });
  setTimeout(() => {
    playTone({ freq: 440.0, type: 'triangle', duration: 0.3, gain: 0.15 });
  }, 200);
}

/**
 * 11. Stamp Earned Sound — Golden celebratory fanfare
 */
export function playStampEarnedSound() {
  if (!soundEnabled) return;
  const arpeggio = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  arpeggio.forEach((freq, idx) => {
    setTimeout(() => {
      playTone({ freq, type: 'sine', duration: 0.25, gain: 0.26 });
    }, idx * 75);
  });
}

/**
 * 12. Bedtime Tuck Sound — Gentle bedtime chord swell
 */
export function playBedtimeTuckSound() {
  if (!soundEnabled) return;
  [392.0, 493.88, 587.33, 783.99].forEach((freq) => {
    playTone({ freq, type: 'sine', duration: 1.5, gain: 0.16 });
  });
}

/**
 * 13. Dreamspace Star Twinkle Sound
 */
export function playStarTwinkleSound() {
  if (!soundEnabled) return;
  const sparkles = [1046.5, 1318.51, 1567.98];
  const chosen = sparkles[Math.floor(Math.random() * sparkles.length)];
  playTone({ freq: chosen, type: 'sine', duration: 0.15, gain: 0.2 });
}

/**
 * 14. The Living Dream Express — Steam Locomotive Sound Engine
 * Provides authentic rhythmic "chuk chuk chuk chuk" sound effects,
 * acceleration/cruising/deceleration travel loop, and cheerful train whistle.
 */
let trainChugTimer = null;
let trainChugActive = false;
let activeTrainNodes = [];

export function stopTrainJourneyChug() {
  trainChugActive = false;
  if (trainChugTimer) {
    clearTimeout(trainChugTimer);
    trainChugTimer = null;
  }
  activeTrainNodes.forEach((node) => {
    try {
      node.stop?.();
      node.disconnect?.();
    } catch (e) {}
  });
  activeTrainNodes = [];
}

/**
 * Play a single authentic steam locomotive "chuk" puff
 * Combines shaped bandpass white noise for the steam hiss
 * with a low punch triangle wave for mechanical piston weight.
 */
export function playTrainChukSound({ isAccented = false, volume = 0.3 } = {}) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const puffDuration = isAccented ? 0.12 : 0.085;

  // 1. Steam Noise Burst (the "chhhuk" steam exhaust)
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(ctx, puffDuration + 0.02);

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  // Accented stroke has a brighter, slightly higher resonant frequency
  const centerFreq = isAccented ? 1150 : 880;
  noiseFilter.frequency.setValueAtTime(centerFreq, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(centerFreq * 0.65, now + puffDuration);
  noiseFilter.Q.setValueAtTime(isAccented ? 3.2 : 2.6, now);

  const noiseGain = ctx.createGain();
  const targetGain = (isAccented ? 0.36 : 0.23) * (volume / 0.3);
  noiseGain.gain.setValueAtTime(0.0001, now);
  noiseGain.gain.linearRampToValueAtTime(targetGain, now + 0.005);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + puffDuration);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);

  noiseSource.start(now);
  noiseSource.stop(now + puffDuration);

  // 2. Mechanical Piston / Driving Rod Thud
  const thudOsc = ctx.createOscillator();
  thudOsc.type = 'triangle';
  const startPitch = isAccented ? 110 : 90;
  thudOsc.frequency.setValueAtTime(startPitch, now);
  thudOsc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

  const thudGain = ctx.createGain();
  const targetThud = (isAccented ? 0.28 : 0.18) * (volume / 0.3);
  thudGain.gain.setValueAtTime(0.0001, now);
  thudGain.gain.linearRampToValueAtTime(targetThud, now + 0.004);
  thudGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  thudOsc.connect(thudGain);
  thudGain.connect(masterGain);

  thudOsc.start(now);
  thudOsc.stop(now + 0.06);

  // Track nodes for immediate cleanup if user leaves
  const nodes = [noiseSource, noiseFilter, noiseGain, thudOsc, thudGain];
  activeTrainNodes.push(...nodes);
  setTimeout(() => {
    nodes.forEach(node => { try { node.disconnect(); } catch {} });
    activeTrainNodes = activeTrainNodes.filter((n) => !nodes.includes(n));
  }, (puffDuration + 0.05) * 1000);
}

/**
 * Play a charming two-tone storybook train whistle: "Toooot-toot!"
 */
export function playTrainWhistleSound() {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  // Two whistle blasts: long blast then short blast
  const blasts = [
    { start: 0, dur: 0.38 },
    { start: 0.46, dur: 0.26 },
  ];

  blasts.forEach(({ start, dur }) => {
    const t0 = now + start;
    // Harmonic chords for classic steam locomotive whistle (D5 + F#5 + A5 major triad)
    [587.33, 739.99, 880.0].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      osc.frequency.linearRampToValueAtTime(freq * 1.015, t0 + dur * 0.4);
      osc.frequency.linearRampToValueAtTime(freq * 0.99, t0 + dur);

      const gain = ctx.createGain();
      const baseGain = idx === 0 ? 0.20 : 0.14;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(baseGain, t0 + 0.04);
      gain.gain.setValueAtTime(baseGain, t0 + dur - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(t0);
      osc.stop(t0 + dur);

      activeTrainNodes.push(osc, gain);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); activeTrainNodes = activeTrainNodes.filter(node => node !== osc && node !== gain); };
    });
  });
}

/**
 * Start rhythmic locomotive chug loop for the duration of the train travel
 * Accelerates out of depot, cruises at rhythmic chuk-chuk-chuk-chuk, then decelerates to station!
 */
export function startTrainJourneyChug(durationMs = 6000) {
  stopTrainJourneyChug();
  if (!soundEnabled) return;

  trainChugActive = true;
  const startTime = Date.now();
  const accelDuration = Math.min(1400, durationMs * 0.25);
  const decelStart = durationMs - Math.min(1600, durationMs * 0.28);
  let strokeCount = 0;

  const scheduleNextChuk = () => {
    if (!trainChugActive || !soundEnabled) return;

    const elapsed = Date.now() - startTime;
    if (elapsed >= durationMs) {
      stopTrainJourneyChug();
      // Final soft settling steam sigh
      playTone({ freq: 440, type: 'triangle', duration: 0.18, gain: 0.08 });
      return;
    }

    // Determine current speed & rhythm interval
    let currentInterval = 175; // cruise tempo (ms between chuks)
    if (elapsed < accelDuration) {
      // Accelerate from 300ms down to 175ms
      const p = elapsed / accelDuration;
      currentInterval = 300 - p * (300 - 175);
    } else if (elapsed > decelStart) {
      // Decelerate from 175ms up to 340ms
      const p = (elapsed - decelStart) / (durationMs - decelStart);
      currentInterval = 175 + p * (340 - 175);
    }

    // 4-stroke locomotive cycle: beat 0 is accented (CHUK - chuk - chuk - chuk)
    const isAccented = strokeCount % 4 === 0;
    playTrainChukSound({ isAccented, volume: isAccented ? 0.34 : 0.22 });
    strokeCount++;

    trainChugTimer = setTimeout(scheduleNextChuk, currentInterval);
  };

  scheduleNextChuk();
}
